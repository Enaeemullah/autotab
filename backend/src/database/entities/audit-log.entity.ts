import { Column, Entity, ManyToOne } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { User } from './user.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog extends TenantScopedEntity {
  @ManyToOne(() => User, { nullable: true })
  actor!: User | null;

  @Column({ name: 'action', type: 'varchar', length: 150 })
  action!: string;

  @Column({ name: 'resource', type: 'varchar', length: 150 })
  resource!: string;

  @Column({ name: 'resource_id', type: 'uuid', nullable: true })
  resourceId!: string | null;

  @Column({ name: 'metadata', type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;
}
