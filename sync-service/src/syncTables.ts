export const SYNC_TABLES = [
  'products',
  'product_variants',
  'product_batches',
  'categories',
  'suppliers',
  'stock_locations',
  'inventory_movements',
  'sales',
  'sale_items',
  'sale_payments',
  'users',
  'roles',
  'permissions',
  'settings'
] as const;

export type SyncTable = (typeof SYNC_TABLES)[number];
