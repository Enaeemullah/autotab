import { Column, Entity, ManyToOne } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductBatch } from './product-batch.entity';
import { StockLocation } from './stock-location.entity';
import { User } from './user.entity';

export type InventoryMovementType =
  | 'adjustment_increase'
  | 'adjustment_decrease'
  | 'sale'
  | 'purchase'
  | 'transfer'
  | 'return_in'
  | 'return_out';

@Entity({ name: 'inventory_movements' })
export class InventoryMovement extends TenantScopedEntity {
  @ManyToOne(() => Product, (product) => product.inventoryMovements)
  product!: Product;

  @ManyToOne(() => ProductVariant, { nullable: true })
  variant!: ProductVariant | null;

  @ManyToOne(() => ProductBatch, { nullable: true })
  batch!: ProductBatch | null;

  @ManyToOne(() => StockLocation, (location) => location.outgoingMovements, { nullable: true })
  sourceLocation!: StockLocation | null;

  @ManyToOne(() => StockLocation, (location) => location.incomingMovements, { nullable: true })
  targetLocation!: StockLocation | null;

  @Column({ name: 'movement_type', type: 'varchar', length: 50 })
  movementType!: InventoryMovementType;

  @Column({ name: 'quantity', type: 'numeric', precision: 15, scale: 4 })
  quantity!: string;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 15, scale: 4, default: 0 })
  unitCost!: string;

  @Column({ name: 'reference', type: 'varchar', length: 150, nullable: true })
  reference!: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  @ManyToOne(() => User, { nullable: true })
  performedBy!: User | null;
}
