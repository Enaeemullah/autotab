import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { InventoryController } from './inventory.controller';

const controller = new InventoryController();

export function inventoryRouter() {
  const router = Router();
  router.use(authenticate());

  router.get('/products', authorize({ permissions: ['products:read'] }), (req, res) =>
    controller.listProducts(req, res)
  );
  router.post('/products', authorize({ permissions: ['products:create'] }), (req, res) =>
    controller.createProduct(req, res)
  );
  router.put('/products/:id', authorize({ permissions: ['products:update'] }), (req, res) =>
    controller.updateProduct(req, res)
  );
  router.delete('/products/:id', authorize({ permissions: ['products:delete'] }), (req, res) =>
    controller.deleteProduct(req, res)
  );
  router.post('/products/import', authorize({ permissions: ['products:create'] }), (req, res) =>
    controller.bulkImport(req, res)
  );
  router.get('/products/export', authorize({ permissions: ['products:read'] }), (req, res) =>
    controller.exportProducts(req, res)
  );

  router.get('/categories', authorize({ permissions: ['products:read'] }), (req, res) =>
    controller.listCategories(req, res)
  );
  router.post('/categories', authorize({ permissions: ['products:create'] }), (req, res) =>
    controller.createCategory(req, res)
  );

  router.get('/suppliers', authorize({ permissions: ['suppliers:read'] }), (req, res) =>
    controller.listSuppliers(req, res)
  );
  router.post('/suppliers', authorize({ permissions: ['suppliers:create'] }), (req, res) =>
    controller.createSupplier(req, res)
  );

  router.get('/stock-locations', authorize({ permissions: ['inventory:read'] }), (req, res) =>
    controller.listStockLocations(req, res)
  );
  router.post('/stock-locations', authorize({ permissions: ['inventory:create'] }), (req, res) =>
    controller.createStockLocation(req, res)
  );

  return router;
}
