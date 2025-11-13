import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';

export interface AuthTokenPayload {
  sub: string;
  tenantId: string;
  branchId?: string | null;
  roles: string[];
  permissions: string[];
}

export function authenticate() {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
      req.userId = payload.sub;
      req.tenantId = payload.tenantId;
      req.branchId = payload.branchId ?? null;
      res.locals.user = payload;
      next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

export function authorize(allowed: { roles?: string[]; permissions?: string[] } = {}) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const payload = res.locals.user as AuthTokenPayload | undefined;
    if (!payload) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (allowed.roles?.length) {
      const hasRole = allowed.roles.some((role) => payload.roles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    if (allowed.permissions?.length) {
      const hasPermission = allowed.permissions.some((permission) =>
        payload.permissions.includes(permission)
      );
      if (!hasPermission) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    next();
  };
}
