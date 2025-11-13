import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TenantScopedEntity } from './tenant-scoped.entity';
import { User } from './user.entity';
import { SaleItem } from './sale-item.entity';
import { SalePayment } from './sale-payment.entity';
import { Branch } from './branch.entity';

export type SaleStatus = 'draft' | 'completed' | 'voided' | 'refunded';

@Entity({ name: 'sales' })
export class Sale extends TenantScopedEntity {
  @Column({ name: 'sequence_number', type: 'bigint' })
  sequenceNumber!: number;

  @Column({ name: 'invoice_number', type: 'varchar', length: 50, unique: true })
  invoiceNumber!: string;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'completed' })
  status!: SaleStatus;

  @Column({ name: 'sale_date', type: 'timestamptz' })
  saleDate!: Date;

  @ManyToOne(() => Branch, { nullable: false })
  branch!: Branch;

  @ManyToOne(() => User, { nullable: true })
  cashier!: User | null;

  @Column({ name: 'customer_name', type: 'varchar', length: 150, nullable: true })
  customerName!: string | null;

  @Column({ name: 'customer_phone', type: 'varchar', length: 100, nullable: true })
  customerPhone!: string | null;

  @Column({ name: 'subtotal', type: 'numeric', precision: 15, scale: 4, default: 0 })
  subtotal!: string;

  @Column({ name: 'tax_total', type: 'numeric', precision: 15, scale: 4, default: 0 })
  taxTotal!: string;

  @Column({ name: 'discount_total', type: 'numeric', precision: 15, scale: 4, default: 0 })
  discountTotal!: string;

  @Column({ name: 'grand_total', type: 'numeric', precision: 15, scale: 4, default: 0 })
  grandTotal!: string;

  @Column({ name: 'paid_total', type: 'numeric', precision: 15, scale: 4, default: 0 })
  paidTotal!: string;

  @Column({ name: 'balance', type: 'numeric', precision: 15, scale: 4, default: 0 })
  balance!: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items!: SaleItem[];

  @OneToMany(() => SalePayment, (payment) => payment.sale, { cascade: true })
  payments!: SalePayment[];
}
