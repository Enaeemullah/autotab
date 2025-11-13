import { QueryRunner } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { SyncLog } from '../../database/entities/sync-log.entity';
import { SyncRequestPayload, SyncResponsePayload, SyncResult } from './sync.types';

const SYNC_TABLES = [
  'products',
  'product_variants',
  'product_batches',
  'categories',
  'suppliers',
  'stock_locations',
  'inventory_movements',
  'sales',
  'sale_items',
  'sale_payments',
  'users',
  'roles',
  'permissions',
  'settings'
] as const;

type SyncTable = (typeof SYNC_TABLES)[number];

export class SyncService {
  async collectChanges(
    tenantId: string,
    since?: string
  ): Promise<SyncResponsePayload> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const sinceTimestamp = since ? new Date(since) : new Date(0);
      const entities = [];

      for (const table of SYNC_TABLES) {
        const rows = await queryRunner.query(
          `
            SELECT *
            FROM ${table}
            WHERE tenant_id = $1
              AND updated_at > $2
          `,
          [tenantId, sinceTimestamp]
        );
        if (rows.length) {
          entities.push({ entity: table, records: rows });
        }
      }

      return {
        timestamp: new Date().toISOString(),
        entities
      };
    } finally {
      await queryRunner.release();
    }
  }

  async applyChanges(
    tenantId: string,
    branchId: string | null,
    payload: SyncRequestPayload
  ): Promise<SyncResult> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let applied = 0;
      let conflicts = 0;

      for (const entityPayload of payload.entities) {
        const table = entityPayload.entity as SyncTable;
        if (!SYNC_TABLES.includes(table)) {
          continue;
        }
        for (const record of entityPayload.records) {
          const result = await this.upsertRecord(queryRunner, table, tenantId, record);
          applied += result.applied;
          conflicts += result.conflict;
        }
      }

      await this.logSync(queryRunner, tenantId, branchId, payload, applied, conflicts);
      await queryRunner.commitTransaction();

      return { applied, conflicts };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async logSync(
    queryRunner: QueryRunner,
    tenantId: string,
    branchId: string | null,
    payload: SyncRequestPayload,
    applied: number,
    conflicts: number
  ) {
    const syncLogRepo = queryRunner.manager.getRepository(SyncLog);
    const log = syncLogRepo.create({
      tenantId,
      branchId,
      entityName: 'sync',
      entityId: tenantId,
      direction: 'push',
      status: conflicts > 0 ? 'conflict' : 'success',
      lastSyncedAt: new Date(),
      payload,
      errorMessage: conflicts > 0 ? `${conflicts} conflicts detected` : null,
      syncState: conflicts > 0 ? 'conflict' : 'synced'
    });
    await syncLogRepo.save(log);
  }

  private async upsertRecord(
    queryRunner: QueryRunner,
    table: SyncTable,
    tenantId: string,
    record: Record<string, any>
  ): Promise<{ applied: number; conflict: number }> {
    const columns = Object.keys(record);
    if (!columns.includes('id')) {
      return { applied: 0, conflict: 0 };
    }
    const placeholders = columns.map((_, index) => `$${index + 1}`);
    const values = columns.map((column) => {
      if (column === 'tenant_id') {
        return tenantId;
      }
      return record[column];
    });

    const updateAssignments = columns
      .filter((column) => column !== 'id')
      .map((column) => `${column} = EXCLUDED.${column}`)
      .join(', ');

    const existing = await queryRunner.query(
      `SELECT updated_at FROM ${table} WHERE id = $1 AND tenant_id = $2`,
      [record.id, tenantId]
    );
    if (existing.length) {
      const existingUpdatedAt = new Date(existing[0].updated_at);
      const incomingUpdatedAt = new Date(record.updated_at);
      if (existingUpdatedAt > incomingUpdatedAt) {
        return { applied: 0, conflict: 1 };
      }
    }

    const sql = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      ON CONFLICT (id)
      DO UPDATE SET ${updateAssignments}
    `;
    await queryRunner.query(sql, values);
    return { applied: 1, conflict: 0 };
  }
}
