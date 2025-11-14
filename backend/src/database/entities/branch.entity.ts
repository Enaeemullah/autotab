import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { StockLocation } from './stock-location.entity';

@Entity({ name: 'branches' })
export class Branch extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  code!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  @Column({ name: 'timezone', type: 'varchar', length: 100, default: 'UTC' })
  timezone!: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => Tenant, (tenant) => tenant.branches)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @OneToMany(() => User, (user) => user.branch)
  users!: User[];

  @OneToMany(() => StockLocation, (location) => location.branch)
  stockLocations!: StockLocation[];
}
