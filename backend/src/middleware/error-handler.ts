import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

export function errorHandler() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (err: ApiError, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status ?? 500;

    if (status >= 500) {
      logger.error('Unexpected error', {
        error: err.message,
        stack: err.stack,
        status,
        requestId: req.requestId
      });
    }

    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: err.issues
      });
    }

    return res.status(status).json({
      message: err.message ?? 'Internal server error',
      details: err.details
    });
  };
}
