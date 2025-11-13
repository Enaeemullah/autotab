import { Tenant } from './tenant.entity';
import { Branch } from './branch.entity';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { Category } from './category.entity';
import { Supplier } from './supplier.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductBatch } from './product-batch.entity';
import { StockLocation } from './stock-location.entity';
import { InventoryMovement } from './inventory-movement.entity';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { SalePayment } from './sale-payment.entity';
import { Setting } from './setting.entity';
import { AuditLog } from './audit-log.entity';
import { SyncLog } from './sync-log.entity';

export const entityList = [
  Tenant,
  Branch,
  User,
  Role,
  Permission,
  Category,
  Supplier,
  Product,
  ProductVariant,
  ProductBatch,
  StockLocation,
  InventoryMovement,
  Sale,
  SaleItem,
  SalePayment,
  Setting,
  AuditLog,
  SyncLog
];

export {
  Tenant,
  Branch,
  User,
  Role,
  Permission,
  Category,
  Supplier,
  Product,
  ProductVariant,
  ProductBatch,
  StockLocation,
  InventoryMovement,
  Sale,
  SaleItem,
  SalePayment,
  Setting,
  AuditLog,
  SyncLog
};
