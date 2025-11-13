import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserController } from './user.controller';

const controller = new UserController();

export function userRouter() {
  const router = Router();
  router.use(authenticate());

  router.get('/', authorize({ permissions: ['users:read'] }), (req, res) =>
    controller.list(req, res)
  );
  router.post('/', authorize({ permissions: ['users:create'] }), (req, res) =>
    controller.create(req, res)
  );
  router.put('/:id', authorize({ permissions: ['users:update'] }), (req, res) =>
    controller.update(req, res)
  );
  router.delete('/:id', authorize({ permissions: ['users:delete'] }), (req, res) =>
    controller.remove(req, res)
  );

  return router;
}
