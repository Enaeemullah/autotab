import { Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class TenantScopedEntity extends BaseEntity {
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId!: string | null;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId!: string | null;

  @Column({ name: 'sync_version', type: 'bigint', default: 0 })
  syncVersion!: number;

  @Column({ name: 'sync_state', type: 'varchar', length: 32, default: 'pending' })
  syncState!: 'pending' | 'synced' | 'conflict';

  @Column({ name: 'origin', type: 'varchar', length: 32, default: 'local' })
  origin!: 'local' | 'central';
}
