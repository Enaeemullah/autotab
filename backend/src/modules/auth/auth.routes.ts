import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth';

const controller = new AuthController();

export function authRouter() {
  const router = Router();

  router.post('/login', (req, res) => controller.login(req, res));
  router.post('/refresh', (req, res) => controller.refresh(req, res));
  router.get('/profile', authenticate(), (req, res) => controller.profile(req, res));

  return router;
}
