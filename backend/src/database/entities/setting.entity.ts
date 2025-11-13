import { Column, Entity } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';

@Entity({ name: 'settings' })
export class Setting extends TenantScopedEntity {
  @Column({ name: 'key', type: 'varchar', length: 150 })
  key!: string;

  @Column({ name: 'value', type: 'jsonb' })
  value!: unknown;
}
