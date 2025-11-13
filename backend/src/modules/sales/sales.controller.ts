import { Request, Response } from 'express';
import { SalesService } from './sales.service';

const service = new SalesService();

function ensureTenant(req: Request) {
  if (!req.tenantId) {
    throw Object.assign(new Error('Tenant context missing'), { status: 400 });
  }
  return req.tenantId;
}

export class SalesController {
  async list(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 25);
    const result = await service.list(tenantId, req.branchId ?? null, { page, limit });
    return res.json(result);
  }

  async create(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.create(tenantId, req.branchId ?? null, req.userId, req.body);
    return res.status(201).json(result);
  }

  async getOne(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.getById(tenantId, req.params.id);
    return res.json(result);
  }
}
