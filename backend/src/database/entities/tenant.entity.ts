import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';

@Entity({ name: 'tenants' })
export class Tenant extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 150, nullable: true })
  contactEmail!: string | null;

  @Column({ name: 'contact_phone', type: 'varchar', length: 50, nullable: true })
  contactPhone!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'config', type: 'jsonb', default: () => "'{}'::jsonb" })
  config!: Record<string, unknown>;

  @OneToMany(() => Branch, (branch) => branch.tenant)
  branches!: Branch[];
}
