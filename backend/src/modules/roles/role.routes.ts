import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { RoleController } from './role.controller';

const controller = new RoleController();

export function roleRouter() {
  const router = Router();
  router.use(authenticate());

  router.get('/', authorize({ permissions: ['roles:read'] }), (req, res) =>
    controller.list(req, res)
  );
  router.get('/permissions', authorize({ permissions: ['roles:read'] }), (req, res) =>
    controller.permissions(req, res)
  );
  router.post('/', authorize({ permissions: ['roles:create'] }), (req, res) =>
    controller.create(req, res)
  );
  router.put('/:id', authorize({ permissions: ['roles:update'] }), (req, res) =>
    controller.update(req, res)
  );
  router.delete('/:id', authorize({ permissions: ['roles:delete'] }), (req, res) =>
    controller.remove(req, res)
  );

  return router;
}
