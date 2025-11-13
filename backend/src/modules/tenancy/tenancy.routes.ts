import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { TenancyController } from './tenancy.controller';

const controller = new TenancyController();

export function tenancyRouter() {
  const router = Router();

  router.post('/register', (req, res) => controller.register(req, res));

  router.get('/branches', authenticate(), authorize({ permissions: ['settings:read'] }), (req, res) =>
    controller.branches(req, res)
  );

  return router;
}
