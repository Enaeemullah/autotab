import { Column, Entity, ManyToOne } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { Sale } from './sale.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductBatch } from './product-batch.entity';

@Entity({ name: 'sale_items' })
export class SaleItem extends TenantScopedEntity {
  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
  sale!: Sale;

  @ManyToOne(() => Product, (product) => product.saleItems)
  product!: Product;

  @ManyToOne(() => ProductVariant, { nullable: true })
  variant!: ProductVariant | null;

  @ManyToOne(() => ProductBatch, { nullable: true })
  batch!: ProductBatch | null;

  @Column({ name: 'quantity', type: 'numeric', precision: 15, scale: 4 })
  quantity!: string;

  @Column({ name: 'unit_price', type: 'numeric', precision: 15, scale: 4 })
  unitPrice!: string;

  @Column({ name: 'discount_rate', type: 'numeric', precision: 8, scale: 4, default: 0 })
  discountRate!: string;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 15, scale: 4, default: 0 })
  discountAmount!: string;

  @Column({ name: 'tax_rate', type: 'numeric', precision: 8, scale: 4, default: 0 })
  taxRate!: string;

  @Column({ name: 'tax_amount', type: 'numeric', precision: 15, scale: 4, default: 0 })
  taxAmount!: string;

  @Column({ name: 'line_total', type: 'numeric', precision: 15, scale: 4 })
  lineTotal!: string;
}
