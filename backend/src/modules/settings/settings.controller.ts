import { Request, Response } from 'express';
import { SettingsService } from './settings.service';

const service = new SettingsService();

function ensureTenant(req: Request) {
  if (!req.tenantId) {
    throw Object.assign(new Error('Tenant context missing'), { status: 400 });
  }
  return req.tenantId;
}

export class SettingsController {
  async list(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.list(tenantId, req.branchId ?? null);
    return res.json(result);
  }

  async upsert(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.upsert(tenantId, req.branchId ?? null, req.body);
    return res.status(201).json(result);
  }
}
