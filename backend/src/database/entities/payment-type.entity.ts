import { Column, Entity, OneToMany } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { SalePayment } from './sale-payment.entity';

@Entity({ name: 'payment_types' })
export class PaymentType extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  code!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'icon', type: 'varchar', length: 50, nullable: true })
  icon!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'requires_reference', type: 'boolean', default: false })
  requiresReference!: boolean;

  @Column({ name: 'mark_transaction_as_paid', type: 'boolean', default: true })
  markTransactionAsPaid!: boolean;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  @OneToMany(() => SalePayment, (payment) => payment.paymentType)
  payments!: SalePayment[];
}

