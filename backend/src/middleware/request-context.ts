import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      tenantId?: string;
      branchId?: string | null;
      userId?: string;
    }
  }
}

export function requestContext() {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.requestId = req.headers['x-request-id']?.toString() ?? uuid();
    req.tenantId = req.headers['x-tenant-id']?.toString();
    req.branchId = req.headers['x-branch-id']?.toString() ?? null;
    next();
  };
}
