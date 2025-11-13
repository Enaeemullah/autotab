## Autotab REST API

Base path: `/api`

All endpoints require:
- `Authorization: Bearer <access_token>`
- `x-tenant-id: <tenant_uuid>`
- `x-branch-id: <branch_uuid | empty>` (optional for tenant-wide calls)

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/login` | Authenticate user and obtain access/refresh tokens |
| `POST` | `/auth/refresh` | Exchange refresh token for new access token |
| `GET` | `/auth/profile` | Return current user payload |

**Login Request**
```json
{
  "tenantCode": "demo",
  "email": "cashier@autotab.io",
  "password": "secret",
  "branchId": "optional-branch-uuid"
}
```

### User & Role Management

| Method | Endpoint | Permission |
| --- | --- | --- |
| `GET` | `/users` | `users:read` |
| `POST` | `/users` | `users:create` |
| `PUT` | `/users/:id` | `users:update` |
| `DELETE` | `/users/:id` | `users:delete` |
| `GET` | `/roles` | `roles:read` |
| `POST` | `/roles` | `roles:create` |
| `PUT` | `/roles/:id` | `roles:update` |
| `DELETE` | `/roles/:id` | `roles:delete` |
| `GET` | `/roles/permissions` | `roles:read` |

### Inventory

| Method | Endpoint | Description | Permission |
| --- | --- | --- | --- |
| `GET` | `/inventory/products` | Paginated product list (`page`, `limit`, `search`) | `products:read` |
| `POST` | `/inventory/products` | Create product (with optional variants/batches) | `products:create` |
| `PUT` | `/inventory/products/:id` | Update product | `products:update` |
| `DELETE` | `/inventory/products/:id` | Delete product | `products:delete` |
| `POST` | `/inventory/products/import` | Bulk import via CSV payload | `products:create` |
| `GET` | `/inventory/products/export` | Export products as CSV | `products:read` |
| `GET` | `/inventory/categories` | List categories | `products:read` |
| `POST` | `/inventory/categories` | Create category | `products:create` |
| `GET` | `/inventory/suppliers` | List suppliers | `suppliers:read` |
| `POST` | `/inventory/suppliers` | Create supplier | `suppliers:create` |
| `GET` | `/inventory/stock-locations` | List stock locations (branch-scoped) | `inventory:read` |
| `POST` | `/inventory/stock-locations` | Create stock location | `inventory:create` |

Product payload snippet:
```json
{
  "sku": "SKU-001",
  "barcode": "1234567890",
  "name": "Cold Brew Bottle",
  "costPrice": 2.10,
  "salePrice": 3.99,
  "taxRate": 5,
  "reorderPoint": 10,
  "categoryId": "uuid",
  "supplierId": "uuid",
  "variants": [
    { "name": "Vanilla", "sku": "SKU-001-VAN", "salePrice": 4.49, "costPrice": 2.30 }
  ],
  "batches": [
    { "batchCode": "B-202502", "expiresAt": "2025-02-28", "quantity": 100 }
  ]
}
```

### POS / Sales

| Method | Endpoint | Description | Permission |
| --- | --- | --- | --- |
| `GET` | `/sales` | Paginated sales (`page`, `limit`) | `sales:read` |
| `GET` | `/sales/:id` | Retrieve sale with items & payments | `sales:read` |
| `POST` | `/sales` | Create completed sale; automatically reduces inventory | `sales:create` |

Sale payload snippet:
```json
{
  "customerName": "John Doe",
  "items": [
    { "productId": "uuid", "quantity": 2, "unitPrice": 3.99, "taxRate": 5 }
  ],
  "payments": [
    { "method": "cash", "amount": 7.98 }
  ],
  "notes": "No straws"
}
```

### Reports

| Method | Endpoint | Description | Permission |
| --- | --- | --- | --- |
| `GET` | `/reports/dashboard` | Aggregate metrics (sales summary, inventory value, stock alerts) | `reports:read` |
| `GET` | `/reports/sales?period=daily` | Sales trend grouped by day/week/month | `reports:read` |
| `GET` | `/reports/inventory` | Inventory valuation by category | `reports:read` |
| `GET` | `/reports/user-performance` | Sales totals by user | `reports:read` |
| `GET` | `/reports/tax` | Tax + discount summary | `reports:read` |

### Settings & Tenancy

| Method | Endpoint | Permission |
| --- | --- | --- |
| `POST` | `/tenancy/register` | Public endpoint to bootstrap a new tenant |
| `GET` | `/tenancy/branches` | `settings:read` |
| `GET` | `/settings` | `settings:read` |
| `POST` | `/settings` | `settings:update` |

Setting payload:
```json
{
  "key": "business.name",
  "value": "Autotab Coffee"
}
```

### Sync Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/sync/push` | Accept local changes from branch node |
| `GET` | `/sync/pull?since=<ISO>` | Return central changes since timestamp |

Sync payload shape:
```json
{
  "timestamp": "2025-11-13T10:00:00.000Z",
  "entities": [
    {
      "entity": "products",
      "records": [{ "...": "..." }]
    }
  ]
}
```

Central API authenticates sync requests with a PAT in `Authorization` header.

### Health

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Basic readiness probe |
