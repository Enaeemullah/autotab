import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { Category } from './category.entity';
import { Product } from './product.entity';

@Entity({ name: 'categories' })
export class Category extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  slug!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  parent!: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
