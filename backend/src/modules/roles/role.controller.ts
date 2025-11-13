import { Request, Response } from 'express';
import { RoleService } from './role.service';
import { createRoleSchema, updateRoleSchema } from './role.schemas';

const service = new RoleService();

function ensureTenant(req: Request) {
  if (!req.tenantId) {
    throw Object.assign(new Error('Tenant context missing'), { status: 400 });
  }
  return req.tenantId;
}

export class RoleController {
  async list(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 25);
    const search = req.query.search?.toString();
    const result = await service.list(tenantId, { page, limit }, search);
    return res.json(result);
  }

  async permissions(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.listPermissions(tenantId);
    return res.json(result);
  }

  async create(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const parsed = createRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.issues });
    }
    const result = await service.create(tenantId, parsed.data);
    return res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.issues });
    }
    const result = await service.update(tenantId, req.params.id, parsed.data);
    return res.status(200).json(result);
  }

  async remove(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.remove(tenantId, req.params.id);
    return res.status(200).json(result);
  }
}
