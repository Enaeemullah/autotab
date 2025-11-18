import { Request, Response } from 'express';
import { PaymentTypesService } from './payment-types.service';
import { createPaymentTypeSchema, updatePaymentTypeSchema } from './payment-types.schemas';

const service = new PaymentTypesService();

function ensureTenant(req: Request) {
  if (!req.tenantId) {
    throw Object.assign(new Error('Tenant context missing'), { status: 400 });
  }
  return req.tenantId;
}

export class PaymentTypesController {
  async list(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 25);
    const search = req.query.search?.toString();
    const result = await service.list(tenantId, { page, limit }, search);
    return res.json(result);
  }

  async get(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.getById(tenantId, req.params.id);
    return res.json(result);
  }

  async create(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const parsed = createPaymentTypeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.issues });
    }
    const result = await service.create(tenantId, req.branchId ?? null, parsed.data);
    return res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const parsed = updatePaymentTypeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.issues });
    }
    const result = await service.update(tenantId, req.params.id, parsed.data);
    return res.status(200).json(result);
  }

  async remove(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.delete(tenantId, req.params.id);
    return res.status(200).json(result);
  }

  async getActive(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.getActive(tenantId);
    return res.json(result);
  }
}

