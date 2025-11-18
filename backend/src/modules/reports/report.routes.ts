import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { ReportController } from './report.controller';

const controller = new ReportController();

export function reportRouter() {
  const router = Router();
  router.use(authenticate());

  router.get('/dashboard', authorize({ permissions: ['reports:read'] }), (req, res) =>
    controller.dashboard(req, res)
  );
  router.get('/sales', authorize({ permissions: ['reports:read'] }), (req, res) =>
    controller.sales(req, res)
  );
  router.get('/inventory', authorize({ permissions: ['reports:read'] }), (req, res) =>
    controller.inventory(req, res)
  );
  router.get('/tax', authorize({ permissions: ['reports:read'] }), (req, res) =>
    controller.tax(req, res)
  );
  router.get('/user-performance', authorize({ permissions: ['reports:read'] }), (req, res) =>
    controller.userPerformance(req, res)
  );
  router.get('/monthly-sales', authorize({ permissions: ['reports:read'] }), (req, res) =>
    controller.monthlySales(req, res)
  );
  router.get('/top-products', authorize({ permissions: ['reports:read'] }), (req, res) =>
    controller.topProducts(req, res)
  );
  router.get('/hourly-sales', authorize({ permissions: ['reports:read'] }), (req, res) =>
    controller.hourlySales(req, res)
  );
  router.get('/top-customers', authorize({ permissions: ['reports:read'] }), (req, res) =>
    controller.topCustomers(req, res)
  );
  router.get('/top-product-groups', authorize({ permissions: ['reports:read'] }), (req, res) =>
    controller.topProductGroups(req, res)
  );
  router.get('/periodic-sales', authorize({ permissions: ['reports:read'] }), (req, res) =>
    controller.periodicSales(req, res)
  );

  return router;
}
