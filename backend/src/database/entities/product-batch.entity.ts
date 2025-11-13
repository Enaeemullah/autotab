import { Column, Entity, ManyToOne } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { Product } from './product.entity';

@Entity({ name: 'product_batches' })
export class ProductBatch extends TenantScopedEntity {
  @ManyToOne(() => Product, (product) => product.batches)
  product!: Product;

  @Column({ name: 'batch_code', type: 'varchar', length: 100 })
  batchCode!: string;

  @Column({ name: 'manufactured_at', type: 'date', nullable: true })
  manufacturedAt!: Date | null;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'quantity', type: 'numeric', precision: 15, scale: 4, default: 0 })
  quantity!: string;

  @Column({ name: 'remaining_quantity', type: 'numeric', precision: 15, scale: 4, default: 0 })
  remainingQuantity!: string;
}
