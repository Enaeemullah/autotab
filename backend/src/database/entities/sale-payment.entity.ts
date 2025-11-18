import { Column, Entity, ManyToOne } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { Sale } from './sale.entity';
import { PaymentType } from './payment-type.entity';

@Entity({ name: 'sale_payments' })
export class SalePayment extends TenantScopedEntity {
  @ManyToOne(() => Sale, (sale) => sale.payments, { onDelete: 'CASCADE' })
  sale!: Sale;

  @ManyToOne(() => PaymentType, { nullable: true })
  paymentType!: PaymentType | null;

  @Column({ name: 'payment_type_id', type: 'uuid', nullable: true })
  paymentTypeId!: string | null;

  // Keep method for backward compatibility, but it's now derived from paymentType
  @Column({ name: 'method', type: 'varchar', length: 50, nullable: true })
  method!: string | null;

  @Column({ name: 'amount', type: 'numeric', precision: 15, scale: 4 })
  amount!: string;

  @Column({ name: 'received_at', type: 'timestamptz' })
  receivedAt!: Date;

  @Column({ name: 'reference', type: 'varchar', length: 150, nullable: true })
  reference!: string | null;

  @Column({ name: 'meta', type: 'jsonb', default: () => "'{}'::jsonb" })
  meta!: Record<string, unknown>;
}
