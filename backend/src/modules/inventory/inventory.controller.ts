import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';

const service = new InventoryService();

function ensureTenant(req: Request) {
  if (!req.tenantId) {
    throw Object.assign(new Error('Tenant context missing'), { status: 400 });
  }
  return req.tenantId;
}

export class InventoryController {
  async listProducts(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 25);
    const search = req.query.search?.toString();
    const result = await service.listProducts(tenantId, { page, limit }, search);
    return res.json(result);
  }

  async createProduct(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.createProduct(tenantId, req.branchId ?? null, req.body);
    return res.status(201).json(result);
  }

  async updateProduct(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.updateProduct(tenantId, req.params.id, req.body);
    return res.json(result);
  }

  async deleteProduct(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.removeProduct(tenantId, req.params.id);
    return res.json(result);
  }

  async listCategories(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.listCategories(tenantId);
    return res.json(result);
  }

  async createCategory(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.createCategory(tenantId, req.branchId ?? null, req.body);
    return res.status(201).json(result);
  }

  async listSuppliers(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.listSuppliers(tenantId);
    return res.json(result);
  }

  async createSupplier(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.createSupplier(tenantId, req.branchId ?? null, req.body);
    return res.status(201).json(result);
  }

  async listStockLocations(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.listStockLocations(tenantId, req.branchId ?? null);
    return res.json(result);
  }

  async createStockLocation(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.createStockLocation(tenantId, req.branchId ?? null, req.body);
    return res.status(201).json(result);
  }

  async bulkImport(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const rows = Array.isArray(req.body) ? (req.body as Array<Record<string, string | number>>) : [];
    const result = await service.bulkImportProducts(tenantId, req.branchId ?? null, rows);
    return res.status(201).json(result);
  }

  async exportProducts(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const csv = await service.exportProducts(tenantId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    return res.send(csv);
  }
}
