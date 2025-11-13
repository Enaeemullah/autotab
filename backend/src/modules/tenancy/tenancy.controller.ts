import { Request, Response } from 'express';
import { TenancyService } from './tenancy.service';

const service = new TenancyService();

export class TenancyController {
  async register(req: Request, res: Response) {
    const result = await service.register(req.body);
    return res.status(201).json(result);
  }

  async branches(req: Request, res: Response) {
    if (!req.tenantId) {
      return res.status(400).json({ message: 'Tenant context missing' });
    }
    const result = await service.listBranches(req.tenantId);
    return res.json(result);
  }
}
