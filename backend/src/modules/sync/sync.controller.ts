import { Request, Response } from 'express';
import { SyncService } from './sync.service';

const service = new SyncService();

function ensureTenant(req: Request) {
  if (!req.tenantId) {
    throw Object.assign(new Error('Tenant context missing'), { status: 400 });
  }
  return req.tenantId;
}

export class SyncController {
  async pull(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const since = req.query.since?.toString();
    const result = await service.collectChanges(tenantId, since);
    return res.json(result);
  }

  async push(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.applyChanges(tenantId, req.branchId ?? null, req.body);
    return res.status(202).json(result);
  }
}
