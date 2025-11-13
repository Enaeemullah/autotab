import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
    tenantId?: string;
    branchId?: string | null;
    userId?: string;
  }
}
