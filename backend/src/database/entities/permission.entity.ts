import { Column, Entity, ManyToMany } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { Role } from './role.entity';

@Entity({ name: 'permissions' })
export class Permission extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 150 })
  action!: string;

  @Column({ type: 'varchar', length: 150 })
  resource!: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];
}
