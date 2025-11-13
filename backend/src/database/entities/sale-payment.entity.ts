import { Column, Entity, ManyToOne } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { Sale } from './sale.entity';

export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'bank_transfer' | 'split';

@Entity({ name: 'sale_payments' })
export class SalePayment extends TenantScopedEntity {
  @ManyToOne(() => Sale, (sale) => sale.payments, { onDelete: 'CASCADE' })
  sale!: Sale;

  @Column({ name: 'method', type: 'varchar', length: 50 })
  method!: PaymentMethod;

  @Column({ name: 'amount', type: 'numeric', precision: 15, scale: 4 })
  amount!: string;

  @Column({ name: 'received_at', type: 'timestamptz' })
  receivedAt!: Date;

  @Column({ name: 'reference', type: 'varchar', length: 150, nullable: true })
  reference!: string | null;

  @Column({ name: 'meta', type: 'jsonb', default: () => "'{}'::jsonb" })
  meta!: Record<string, unknown>;
}
