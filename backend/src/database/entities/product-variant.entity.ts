import { Column, Entity, ManyToOne } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { Product } from './product.entity';

@Entity({ name: 'product_variants' })
export class ProductVariant extends TenantScopedEntity {
  @ManyToOne(() => Product, (product) => product.variants)
  parent!: Product;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ name: 'sku', type: 'varchar', length: 100, unique: true })
  sku!: string;

  @Column({ name: 'barcode', type: 'varchar', length: 100, nullable: true, unique: true })
  barcode!: string | null;

  @Column({ name: 'attributes', type: 'jsonb', default: () => "'{}'::jsonb" })
  attributes!: Record<string, unknown>;

  @Column({ name: 'cost_price', type: 'numeric', precision: 15, scale: 4, default: 0 })
  costPrice!: string;

  @Column({ name: 'sale_price', type: 'numeric', precision: 15, scale: 4, default: 0 })
  salePrice!: string;

  @Column({ name: 'current_stock', type: 'numeric', precision: 15, scale: 4, default: 0 })
  currentStock!: string;
}
