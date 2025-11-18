import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { ReportService } from './report.service';

const service = new ReportService();

function ensureTenant(req: Request) {
  if (!req.tenantId) {
    throw Object.assign(new Error('Tenant context missing'), { status: 400 });
  }
  return req.tenantId;
}

export class ReportController {
  async dashboard(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.dashboard(tenantId, req.branchId ?? null);
    return res.json(result);
  }

  async sales(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const period =
      (req.query.period as 'daily' | 'weekly' | 'monthly' | undefined) ?? 'daily';
    const result = await service.salesSummary(tenantId, req.branchId ?? null, period);
    return res.json(result);
  }

  async inventory(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.inventoryValuation(tenantId);
    return res.json(result);
  }

  async tax(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.taxSummary(tenantId, req.branchId ?? null);
    return res.json(result);
  }

  async userPerformance(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const result = await service.userPerformance(tenantId, req.branchId ?? null);
    return res.json(result);
  }

  async monthlySales(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const year = Number(req.query.year ?? new Date().getFullYear());
    const result = await service.monthlySales(tenantId, req.branchId ?? null, year);
    return res.json(result);
  }

  async topProducts(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const startDate = req.query.startDate?.toString() || dayjs().startOf('day').toISOString();
    const endDate = req.query.endDate?.toString() || dayjs().endOf('day').toISOString();
    const limit = Number(req.query.limit ?? 5);
    const result = await service.topProducts(tenantId, req.branchId ?? null, startDate, endDate, limit);
    return res.json(result);
  }

  async hourlySales(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const startDate = req.query.startDate?.toString() || dayjs().startOf('day').toISOString();
    const endDate = req.query.endDate?.toString() || dayjs().endOf('day').toISOString();
    const result = await service.hourlySales(tenantId, req.branchId ?? null, startDate, endDate);
    return res.json(result);
  }

  async topCustomers(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const startDate = req.query.startDate?.toString() || dayjs().startOf('day').toISOString();
    const endDate = req.query.endDate?.toString() || dayjs().endOf('day').toISOString();
    const limit = Number(req.query.limit ?? 5);
    const result = await service.topCustomers(tenantId, req.branchId ?? null, startDate, endDate, limit);
    return res.json(result);
  }

  async topProductGroups(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const startDate = req.query.startDate?.toString() || dayjs().startOf('day').toISOString();
    const endDate = req.query.endDate?.toString() || dayjs().endOf('day').toISOString();
    const limit = Number(req.query.limit ?? 5);
    const result = await service.topProductGroups(tenantId, req.branchId ?? null, startDate, endDate, limit);
    return res.json(result);
  }

  async periodicSales(req: Request, res: Response) {
    const tenantId = ensureTenant(req);
    const startDate = req.query.startDate?.toString() || dayjs().startOf('day').toISOString();
    const endDate = req.query.endDate?.toString() || dayjs().endOf('day').toISOString();
    const result = await service.periodicSales(tenantId, req.branchId ?? null, startDate, endDate);
    return res.json(result);
  }
}
