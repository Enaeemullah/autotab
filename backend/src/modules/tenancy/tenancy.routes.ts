import { Router } from 'express';
import { authenticate, authorize, requireSuperAdmin } from '../../middleware/auth';
import { TenancyController } from './tenancy.controller';
import { TenancyManagementController } from './tenancy-management.controller';

const controller = new TenancyController();
const managementController = new TenancyManagementController();

export function tenancyRouter() {
  const router = Router();

  // Public registration endpoint
  router.post('/register', (req, res) => controller.register(req, res));

  // Tenant branches (requires tenant context)
  router.get('/branches', authenticate(), authorize({ permissions: ['settings:read'] }), (req, res) =>
    controller.branches(req, res)
  );

  // Superadmin tenant management endpoints
  router.get(
    '/management/tenants',
    authenticate(),
    requireSuperAdmin(),
    (req, res) => managementController.list(req, res)
  );
  router.get(
    '/management/tenants/:id',
    authenticate(),
    requireSuperAdmin(),
    (req, res) => managementController.get(req, res)
  );
  router.get(
    '/management/tenants/:id/details',
    authenticate(),
    requireSuperAdmin(),
    (req, res) => managementController.getDetails(req, res)
  );
  router.post(
    '/management/tenants',
    authenticate(),
    requireSuperAdmin(),
    (req, res) => managementController.create(req, res)
  );
  router.put(
    '/management/tenants/:id',
    authenticate(),
    requireSuperAdmin(),
    (req, res) => managementController.update(req, res)
  );
  router.delete(
    '/management/tenants/:id',
    authenticate(),
    requireSuperAdmin(),
    (req, res) => managementController.remove(req, res)
  );
  router.post(
    '/management/tenants/:tenantId/admins',
    authenticate(),
    requireSuperAdmin(),
    (req, res) => managementController.createAdmin(req, res)
  );
  router.get(
    '/management/features',
    authenticate(),
    requireSuperAdmin(),
    (req, res) => managementController.getFeatures(req, res)
  );

  return router;
}
