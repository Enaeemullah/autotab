import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { SalesController } from './sales.controller';

const controller = new SalesController();

export function salesRouter() {
  const router = Router();
  router.use(authenticate());

  router.get('/', authorize({ permissions: ['sales:read'] }), (req, res) =>
    controller.list(req, res)
  );
  router.post('/', authorize({ permissions: ['sales:create'] }), (req, res) =>
    controller.create(req, res)
  );
  router.get('/:id', authorize({ permissions: ['sales:read'] }), (req, res) =>
    controller.getOne(req, res)
  );

  return router;
}
