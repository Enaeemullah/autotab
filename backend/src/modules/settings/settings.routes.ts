import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { SettingsController } from './settings.controller';

const controller = new SettingsController();

export function settingsRouter() {
  const router = Router();
  router.use(authenticate());

  router.get('/', authorize({ permissions: ['settings:read'] }), (req, res) =>
    controller.list(req, res)
  );
  router.post('/', authorize({ permissions: ['settings:update'] }), (req, res) =>
    controller.upsert(req, res)
  );

  return router;
}
