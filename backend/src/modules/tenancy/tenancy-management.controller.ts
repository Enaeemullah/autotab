import { Request, Response } from 'express';
import { TenancyManagementService } from './tenancy-management.service';
import {
  createTenantSchema,
  updateTenantSchema,
  createTenantAdminSchema
} from './tenancy-management.schemas';

const service = new TenancyManagementService();

export class TenancyManagementController {
  async list(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 25);
    const search = req.query.search?.toString();
    const result = await service.listTenants({ page, limit }, search);
    return res.json(result);
  }

  async get(req: Request, res: Response) {
    const result = await service.getTenant(req.params.id);
    return res.json(result);
  }

  async getDetails(req: Request, res: Response) {
    const result = await service.getTenantDetails(req.params.id);
    return res.json(result);
  }

  async create(req: Request, res: Response) {
    const parsed = createTenantSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.issues });
    }
    const result = await service.createTenant(parsed.data);
    return res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const parsed = updateTenantSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.issues });
    }
    const result = await service.updateTenant(req.params.id, parsed.data);
    return res.status(200).json(result);
  }

  async remove(req: Request, res: Response) {
    const result = await service.deleteTenant(req.params.id);
    return res.status(200).json(result);
  }

  async createAdmin(req: Request, res: Response) {
    const parsed = createTenantAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.issues });
    }
    const result = await service.createTenantAdmin(req.params.tenantId, parsed.data);
    return res.status(201).json(result);
  }

  async getFeatures(_req: Request, res: Response) {
    const result = await service.getAvailableFeatures();
    return res.json(result);
  }
}

