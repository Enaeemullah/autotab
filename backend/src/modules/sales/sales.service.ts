import { DataSource } from 'typeorm';
import dayjs from 'dayjs';
import { AppDataSource } from '../../database/data-source';
import { Sale } from '../../database/entities/sale.entity';
import { SaleItem } from '../../database/entities/sale-item.entity';
import { SalePayment } from '../../database/entities/sale-payment.entity';
import { Product } from '../../database/entities/product.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';
import { InventoryMovement } from '../../database/entities/inventory-movement.entity';
import { buildPaginated, toPagination, PaginationOptions } from '../common/pagination';
import { saleSchema } from './sale.schemas';

export class SalesService {
  private saleRepository = AppDataSource.getRepository(Sale);
  private productRepository = AppDataSource.getRepository(Product);
  private variantRepository = AppDataSource.getRepository(ProductVariant);

  private async withTransaction<T>(run: (ds: DataSource) => Promise<T>): Promise<T> {
    return AppDataSource.transaction(run);
  }

  async list(tenantId: string, branchId: string | null, options: PaginationOptions = {}) {
    const pagination = toPagination(options);
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .where('sale.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('sale.payments', 'payments')
      .orderBy('sale.saleDate', 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit);

    if (branchId) {
      query.andWhere('sale.branchId = :branchId', { branchId });
    }

    const [data, total] = await query.getManyAndCount();
    return buildPaginated(data, total, pagination);
  }

  async getById(tenantId: string, id: string) {
    const sale = await this.saleRepository.findOne({
      where: { id, tenantId },
      relations: ['items', 'items.product', 'payments']
    });
    if (!sale) {
      throw Object.assign(new Error('Sale not found'), { status: 404 });
    }
    return sale;
  }

  async create(tenantId: string, branchId: string | null, cashierId: string | undefined, payload: unknown) {
    if (!branchId) {
      throw Object.assign(new Error('Branch context required for sales'), { status: 400 });
    }
    const parsed = saleSchema.parse(payload);

    return this.withTransaction(async (manager) => {
      const saleRepo = manager.getRepository(Sale);
      const saleItemRepo = manager.getRepository(SaleItem);
      const salePaymentRepo = manager.getRepository(SalePayment);
      const productRepo = manager.getRepository(Product);
      const variantRepo = manager.getRepository(ProductVariant);
      const movementRepo = manager.getRepository(InventoryMovement);

      const { sequenceNumber, invoiceNumber } = await this.nextSaleSequence(manager, tenantId, branchId);

      const subtotal = parsed.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const discountTotal =
        parsed.discountTotal ||
        parsed.items.reduce((sum, item) => sum + (item.discountRate / 100) * item.quantity * item.unitPrice, 0);
      const taxTotal =
        parsed.taxTotal ||
        parsed.items.reduce((sum, item) => sum + (item.taxRate / 100) * item.quantity * item.unitPrice, 0);
      const grandTotal = subtotal - discountTotal + taxTotal;
      const paidTotal = parsed.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const balance = grandTotal - paidTotal;

      const sale = saleRepo.create({
        tenantId,
        branchId,
        sequenceNumber,
        invoiceNumber,
        status: 'completed',
        saleDate: new Date(),
        cashier: cashierId ? { id: cashierId } as any : null,
        customerName: parsed.customerName ?? null,
        customerPhone: parsed.customerPhone ?? null,
        subtotal: subtotal.toFixed(4),
        discountTotal: discountTotal.toFixed(4),
        taxTotal: taxTotal.toFixed(4),
        grandTotal: grandTotal.toFixed(4),
        paidTotal: paidTotal.toFixed(4),
        balance: balance.toFixed(4),
        notes: parsed.notes ?? null,
        syncState: 'pending'
      });

      const savedSale = await saleRepo.save(sale);

      for (const item of parsed.items) {
        const product = await productRepo.findOne({
          where: { id: item.productId, tenantId }
        });
        if (!product) {
          throw Object.assign(new Error('Product not found'), { status: 404 });
        }

        const variant = item.variantId
          ? await variantRepo.findOne({ where: { id: item.variantId, tenantId } })
          : null;

        const quantity = item.quantity;
        const unitPrice = item.unitPrice;
        const discountAmount = (item.discountRate / 100) * quantity * unitPrice;
        const taxAmount = (item.taxRate / 100) * (quantity * unitPrice - discountAmount);
        const lineTotal = quantity * unitPrice - discountAmount + taxAmount;

        const saleItem = saleItemRepo.create({
          tenantId,
          branchId,
          sale: savedSale,
          product,
          variant,
          quantity: quantity.toFixed(4),
          unitPrice: unitPrice.toFixed(4),
          discountRate: item.discountRate.toFixed(4),
          discountAmount: discountAmount.toFixed(4),
          taxRate: item.taxRate.toFixed(4),
          taxAmount: taxAmount.toFixed(4),
          lineTotal: lineTotal.toFixed(4),
          syncState: 'pending'
        });
        await saleItemRepo.save(saleItem);

        const newStock = Number(product.currentStock) - quantity;
        product.currentStock = newStock.toFixed(4);
        product.syncState = 'pending';
        await productRepo.save(product);

        const movement = movementRepo.create({
          tenantId,
          branchId,
          product,
          variant,
          movementType: 'sale',
          quantity: quantity.toFixed(4),
          unitCost: product.costPrice,
          reference: savedSale.invoiceNumber,
          performedBy: cashierId ? ({ id: cashierId } as any) : null,
          syncState: 'pending'
        });
        await movementRepo.save(movement);
      }

      for (const payment of parsed.payments) {
        const salePayment = salePaymentRepo.create({
          tenantId,
          branchId,
          sale: savedSale,
          method: payment.method,
          amount: payment.amount.toFixed(4),
          receivedAt: new Date(),
          reference: payment.reference ?? null,
          meta: payment.meta ?? {},
          syncState: 'pending'
        });
        await salePaymentRepo.save(salePayment);
      }

      return this.getById(tenantId, savedSale.id);
    });
  }

  private async nextSaleSequence(manager: DataSource, tenantId: string, branchId: string) {
    const saleRepo = manager.getRepository(Sale);
    const lastSale = await saleRepo
      .createQueryBuilder('sale')
      .select('MAX(sale.sequenceNumber)', 'max')
      .where('sale.tenantId = :tenantId', { tenantId })
      .andWhere('sale.branchId = :branchId', { branchId })
      .getRawOne<{ max: string | null }>();

    const sequenceNumber = (Number(lastSale?.max ?? 0) + 1) || 1;
    const datePart = dayjs().format('YYYYMMDD');
    const invoiceNumber = `INV-${branchId.slice(0, 4).toUpperCase()}-${datePart}-${sequenceNumber
      .toString()
      .padStart(6, '0')}`;

    return { sequenceNumber, invoiceNumber };
  }
}
