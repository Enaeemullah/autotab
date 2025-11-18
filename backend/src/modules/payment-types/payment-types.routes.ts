import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { PaymentTypesController } from './payment-types.controller';

const controller = new PaymentTypesController();

export function paymentTypesRouter() {
  const router = Router();
  router.use(authenticate());

  router.get(
    '/',
    authorize({ permissions: ['settings:read'] }),
    (req, res) => controller.list(req, res)
  );
  router.get(
    '/active',
    authorize({ permissions: ['sales:create'] }),
    (req, res) => controller.getActive(req, res)
  );
  router.get(
    '/:id',
    authorize({ permissions: ['settings:read'] }),
    (req, res) => controller.get(req, res)
  );
  router.post(
    '/',
    authorize({ permissions: ['settings:write'] }),
    (req, res) => controller.create(req, res)
  );
  router.put(
    '/:id',
    authorize({ permissions: ['settings:write'] }),
    (req, res) => controller.update(req, res)
  );
  router.delete(
    '/:id',
    authorize({ permissions: ['settings:write'] }),
    (req, res) => controller.remove(req, res)
  );

  return router;
}

