import { AppDataSource } from '../../database/data-source';
import { PaymentType } from '../../database/entities/payment-type.entity';
import { buildPaginated, toPagination, PaginationOptions } from '../common/pagination';
import { CreatePaymentTypeInput, UpdatePaymentTypeInput } from './payment-types.schemas';

export class PaymentTypesService {
  private paymentTypeRepository = AppDataSource.getRepository(PaymentType);

  async list(tenantId: string, options: PaginationOptions = {}, search?: string) {
    const pagination = toPagination(options);
    const query = this.paymentTypeRepository
      .createQueryBuilder('paymentType')
      .where('paymentType.tenantId = :tenantId', { tenantId })
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .orderBy('paymentType.sortOrder', 'ASC')
      .addOrderBy('paymentType.name', 'ASC');

    if (search) {
      query.andWhere('(paymentType.name ILIKE :search OR paymentType.code ILIKE :search)', {
        search: `%${search}%`
      });
    }

    const [data, total] = await query.getManyAndCount();
    return buildPaginated(data, total, pagination);
  }

  async getById(tenantId: string, id: string) {
    const paymentType = await this.paymentTypeRepository.findOne({
      where: { id, tenantId }
    });
    if (!paymentType) {
      throw Object.assign(new Error('Payment type not found'), { status: 404 });
    }
    return paymentType;
  }

  async create(tenantId: string, branchId: string | null, payload: CreatePaymentTypeInput) {
    // Check if code already exists for this tenant
    const existing = await this.paymentTypeRepository.findOne({
      where: { code: payload.code, tenantId }
    });
    if (existing) {
      throw Object.assign(new Error('Payment type code already exists'), { status: 400 });
    }

    const paymentType = this.paymentTypeRepository.create({
      tenantId,
      branchId,
      name: payload.name,
      code: payload.code,
      description: payload.description ?? null,
      icon: payload.icon ?? null,
      isActive: payload.isActive ?? true,
      requiresReference: payload.requiresReference ?? false,
      markTransactionAsPaid: payload.markTransactionAsPaid ?? true,
      sortOrder: payload.sortOrder ?? 0,
      syncState: 'pending'
    });

    return this.paymentTypeRepository.save(paymentType);
  }

  async update(tenantId: string, id: string, payload: UpdatePaymentTypeInput) {
    const paymentType = await this.paymentTypeRepository.findOne({
      where: { id, tenantId }
    });
    if (!paymentType) {
      throw Object.assign(new Error('Payment type not found'), { status: 404 });
    }

    if (payload.code && payload.code !== paymentType.code) {
      const existing = await this.paymentTypeRepository.findOne({
        where: { code: payload.code, tenantId }
      });
      if (existing) {
        throw Object.assign(new Error('Payment type code already exists'), { status: 400 });
      }
      paymentType.code = payload.code;
    }

    if (payload.name) paymentType.name = payload.name;
    if (payload.description !== undefined) paymentType.description = payload.description ?? null;
    if (payload.icon !== undefined) paymentType.icon = payload.icon ?? null;
    if (payload.isActive !== undefined) paymentType.isActive = payload.isActive;
    if (payload.requiresReference !== undefined) paymentType.requiresReference = payload.requiresReference;
    if (payload.markTransactionAsPaid !== undefined) paymentType.markTransactionAsPaid = payload.markTransactionAsPaid;
    if (payload.sortOrder !== undefined) paymentType.sortOrder = payload.sortOrder;

    return this.paymentTypeRepository.save(paymentType);
  }

  async delete(tenantId: string, id: string) {
    const paymentType = await this.paymentTypeRepository.findOne({
      where: { id, tenantId }
    });
    if (!paymentType) {
      throw Object.assign(new Error('Payment type not found'), { status: 404 });
    }
    await this.paymentTypeRepository.remove(paymentType);
    return { id };
  }

  async getActive(tenantId: string) {
    return this.paymentTypeRepository.find({
      where: { tenantId, isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' }
    });
  }
}

