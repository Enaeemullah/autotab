import { Request, Response } from 'express';
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
}
