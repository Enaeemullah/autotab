import { Column, Entity } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';

@Entity({ name: 'sync_logs' })
export class SyncLog extends TenantScopedEntity {
  @Column({ name: 'entity_name', type: 'varchar', length: 150 })
  entityName!: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column({ name: 'direction', type: 'varchar', length: 20 })
  direction!: 'push' | 'pull';

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status!: 'pending' | 'success' | 'failed' | 'conflict';

  @Column({ name: 'last_synced_at', type: 'timestamptz', nullable: true })
  lastSyncedAt!: Date | null;

  @Column({ name: 'payload', type: 'jsonb', default: () => "'{}'::jsonb" })
  payload!: unknown;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;
}
