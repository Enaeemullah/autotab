import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { Category } from './category.entity';
import { Supplier } from './supplier.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductBatch } from './product-batch.entity';
import { InventoryMovement } from './inventory-movement.entity';
import { SaleItem } from './sale-item.entity';

@Entity({ name: 'products' })
export class Product extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  sku!: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  barcode!: string | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'cost_price', type: 'numeric', precision: 15, scale: 4, default: 0 })
  costPrice!: string;

  @Column({ name: 'sale_price', type: 'numeric', precision: 15, scale: 4, default: 0 })
  salePrice!: string;

  @Column({ name: 'tax_rate', type: 'numeric', precision: 8, scale: 4, default: 0 })
  taxRate!: string;

  @Column({ name: 'current_stock', type: 'numeric', precision: 15, scale: 4, default: 0 })
  currentStock!: string;

  @Column({ name: 'reorder_point', type: 'numeric', precision: 15, scale: 4, default: 0 })
  reorderPoint!: string;

  @Column({ name: 'is_variant_parent', type: 'boolean', default: false })
  isVariantParent!: boolean;

  @Column({ name: 'is_batch_tracked', type: 'boolean', default: false })
  isBatchTracked!: boolean;

  @Column({ name: 'expiry_tracking', type: 'boolean', default: false })
  expiryTracking!: boolean;

  @Column({ name: 'unit', type: 'varchar', length: 50, default: 'unit' })
  unit!: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl!: string | null;

  @ManyToOne(() => Category, (category) => category.products, { nullable: true })
  category!: Category | null;

  @ManyToOne(() => Supplier, (supplier) => supplier.products, { nullable: true })
  supplier!: Supplier | null;

  @OneToMany(() => ProductVariant, (variant) => variant.parent)
  variants!: ProductVariant[];

  @OneToMany(() => ProductBatch, (batch) => batch.product)
  batches!: ProductBatch[];

  @OneToMany(() => InventoryMovement, (movement) => movement.product)
  inventoryMovements!: InventoryMovement[];

  @OneToMany(() => SaleItem, (item) => item.product)
  saleItems!: SaleItem[];
}
