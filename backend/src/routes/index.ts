import { Express, Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { userRouter } from '../modules/users/user.routes';
import { roleRouter } from '../modules/roles/role.routes';
import { inventoryRouter } from '../modules/inventory/inventory.routes';
import { salesRouter } from '../modules/sales/sales.routes';
import { reportRouter } from '../modules/reports/report.routes';
import { syncRouter } from '../modules/sync/sync.routes';
import { settingsRouter } from '../modules/settings/settings.routes';
import { tenancyRouter } from '../modules/tenancy/tenancy.routes';

export function registerRoutes(app: Express) {
  const router = Router();

  router.use('/auth', authRouter());
  router.use('/users', userRouter());
  router.use('/roles', roleRouter());
  router.use('/inventory', inventoryRouter());
  router.use('/sales', salesRouter());
  router.use('/reports', reportRouter());
  router.use('/sync', syncRouter());
  router.use('/settings', settingsRouter());
  router.use('/tenancy', tenancyRouter());

  router.get('/health', (_req, res) =>
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  );

  app.use('/api', router);
}
