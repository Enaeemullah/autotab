import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { SyncController } from './sync.controller';

const controller = new SyncController();

export function syncRouter() {
  const router = Router();
  router.use(authenticate());

  router.get('/pull', authorize({ permissions: ['sync:read'] }), (req, res) =>
    controller.pull(req, res)
  );
  router.post('/push', authorize({ permissions: ['sync:write'] }), (req, res) =>
    controller.push(req, res)
  );

  return router;
}
