import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { Branch } from './branch.entity';
import { InventoryMovement } from './inventory-movement.entity';

@Entity({ name: 'stock_locations' })
export class StockLocation extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  @ManyToOne(() => Branch, (branch) => branch.stockLocations)
  branch!: Branch;

  @OneToMany(() => InventoryMovement, (movement) => movement.sourceLocation)
  outgoingMovements!: InventoryMovement[];

  @OneToMany(() => InventoryMovement, (movement) => movement.targetLocation)
  incomingMovements!: InventoryMovement[];
}
