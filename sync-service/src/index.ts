import { Pool, PoolClient } from 'pg';
import axios from 'axios';
import { config } from './config';
import { logger } from './logger';
import { SYNC_TABLES, SyncTable } from './syncTables';

interface SyncPayload {
  entity: string;
  records: Record<string, unknown>[];
}

const pool = new Pool({
  connectionString: config.localDatabaseUrl
});

const api = axios.create({
  baseURL: config.centralApiBaseUrl,
  headers: config.apiToken ? { Authorization: `Bearer ${config.apiToken}` } : undefined
});

type Queryable = Pool | PoolClient;

async function getPendingChanges(client: Queryable, limit = 200): Promise<SyncPayload[]> {
  const payloads: SyncPayload[] = [];
  for (const table of SYNC_TABLES) {
    const { rows } = await client.query(
      `
        SELECT *
        FROM ${table}
        WHERE sync_state = 'pending' OR origin = 'local'
        ORDER BY updated_at ASC
        LIMIT $1
      `,
      [limit]
    );
    if (rows.length) {
      payloads.push({ entity: table, records: rows });
    }
  }
  return payloads;
}

async function markSynced(client: Queryable, table: SyncTable, ids: string[]) {
  if (!ids.length) return;
  await client.query(
    `UPDATE ${table} SET sync_state = 'synced', origin = 'local', sync_version = sync_version + 1 WHERE id = ANY($1::uuid[])`,
    [ids]
  );
}

async function pushChanges() {
  const client = await pool.connect();
  try {
    const payloads = await getPendingChanges(pool);
    if (!payloads.length) {
      logger.debug('No local changes to push.');
      return;
    }
    const response = await api.post('/sync/push', {
      timestamp: new Date().toISOString(),
      entities: payloads
    });
    logger.info('Pushed changes to central', { applied: response.data.applied, conflicts: response.data.conflicts });
    for (const payload of payloads) {
      const ids = payload.records.map((record) => record.id as string);
      await markSynced(client, payload.entity as SyncTable, ids);
    }
  } catch (error) {
    logger.error('Failed to push changes', { error });
  } finally {
    client.release();
  }
}

let tenantCache: string | null = null;

async function getTenantId(client: Queryable) {
  if (tenantCache) return tenantCache;
  const { rows } = await client.query(`SELECT id FROM tenants LIMIT 1`);
  if (!rows[0]?.id) {
    throw new Error('No tenant found in local database');
  }
  tenantCache = rows[0].id;
  return tenantCache;
}

async function getLastPullTimestamp(client: Queryable) {
  const tenantId = await getTenantId(client);
  const { rows } = await client.query(
    `SELECT MAX(last_synced_at) as last FROM sync_logs WHERE tenant_id = $1 AND direction = 'pull'`,
    [tenantId]
  );
  return rows[0]?.last as string | undefined;
}

async function setLastPullTimestamp(client: Queryable, timestamp: string) {
  const tenantId = await getTenantId(client);
  await client.query(
    `
      INSERT INTO sync_logs (tenant_id, branch_id, entity_name, entity_id, direction, status, last_synced_at, payload, sync_state)
      VALUES ($1, NULL, 'sync_metadata', $1, 'pull', 'success', $2, '{}'::jsonb, 'synced')
    `,
    [tenantId, timestamp]
  );
}

async function upsertRecords(client: Queryable, table: SyncTable, records: Record<string, unknown>[]) {
  for (const record of records) {
    const columns = Object.keys(record);
    const placeholders = columns.map((_, idx) => `$${idx + 1}`);
    const values = columns.map((column) => (column === 'updated_at' || column === 'created_at') && record[column]
      ? new Date(record[column] as string)
      : record[column]);

    const updateAssignments = columns
      .filter((column) => column !== 'id')
      .map((column) => `${column} = EXCLUDED.${column}`)
      .join(', ');

    await client.query(
      `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT (id)
        DO UPDATE SET ${updateAssignments}
      `,
      values
    );
  }
}

async function pullChanges() {
  const client = await pool.connect();
  try {
    const since = await getLastPullTimestamp(client);
    const { data } = await api.get('/sync/pull', {
      params: { since }
    });
    const timestamp = data.timestamp ?? new Date().toISOString();
    for (const entity of data.entities as SyncPayload[]) {
      if (!SYNC_TABLES.includes(entity.entity as SyncTable)) {
        continue;
      }
      await upsertRecords(client, entity.entity as SyncTable, entity.records);
    }
    await setLastPullTimestamp(client, timestamp);
    logger.info('Pulled changes from central', {
      entities: data.entities?.length ?? 0
    });
  } catch (error) {
    logger.error('Failed to pull changes', { error });
  } finally {
    client.release();
  }
}

async function syncLoop() {
  logger.info('Starting synchronization loop');
  await pushChanges();
  await pullChanges();
  setTimeout(syncLoop, config.syncIntervalMs);
}

syncLoop().catch((error) => {
  logger.error('Fatal error in sync loop', { error });
  process.exit(1);
});
