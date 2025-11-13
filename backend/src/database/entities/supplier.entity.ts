import { Column, Entity, OneToMany } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { Product } from './product.entity';

@Entity({ name: 'suppliers' })
export class Supplier extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  contactName!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  @Column({ name: 'tax_number', type: 'varchar', length: 100, nullable: true })
  taxNumber!: string | null;

  @OneToMany(() => Product, (product) => product.supplier)
  products!: Product[];
}
