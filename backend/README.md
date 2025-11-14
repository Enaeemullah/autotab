# Autotab Backend

Autotab is an offline-first Point of Sale (POS) and inventory management platform. This service exposes RESTful APIs backed by PostgreSQL and powers both local (offline) and central (cloud) deployments.

## Features

- Multi-tenant architecture with branch-level isolation
- Role-based access control with granular permissions
- POS workflows: barcode search, discounts, tax, multi-payment support
- Inventory management: variants, batches, suppliers, stock locations
- Reporting: sales trends, inventory valuation, tax summaries, user performance
- Background synchronization endpoints for offline-first operation
- Audit logging and settings management

## Tech Stack

- Node.js + Express
- TypeScript
- TypeORM
- PostgreSQL
- Zod for validation
- Winston for logging

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
cp .env.example .env
npm install
npm run migration:run
npm run dev
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server with auto-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled server from `dist` |
| `npm run lint` | Lint the source using ESLint |
| `npm test` | Execute Jest tests |
| `npm run migration:run` | Apply database migrations to the database defined in `.env` |
| `npm run migration:generate -- <name>` | Scaffold a timestamped migration template under `src/database/migrations` |

### Environment Variables

See `.env.example` for available configuration keys.

## Project Structure

```
src/
  config/         # Environment configuration
  database/       # Entities, data source and migrations
  modules/        # Feature modules
    auth/
    inventory/
    sales/
    reports/
    sync/
    tenancy/
  middleware/     # Express middleware
  utils/          # Shared utilities (logger, etc.)
  routes/         # Route registration
tests/            # Jest test suites
```

## Database Migrations

1. **Configure access** – ensure PostgreSQL is running and `.env` contains valid `POSTGRES_*` credentials for the database you want to migrate.
2. **Generate a template** – run `npm run migration:generate -- add-reporting-indexes` to create a new timestamped file under `src/database/migrations`. Fill in the `up`/`down` methods with the SQL statements you need.
3. **Apply migrations** – execute `npm run migration:run` to apply every pending migration to the configured database.
4. **Verify** – inspect the console output for `Migrations executed successfully`. Errors usually indicate missing env vars or that PostgreSQL is not reachable.

## Synchronization Workflow

The sync module exposes two endpoints:

- `POST /api/sync/push` — local nodes push newly created or updated rows. Conflicts are resolved with a *last-update-wins* strategy using the `updated_at` column.
- `GET /api/sync/pull?since=ISO_DATE` — clients request incremental changes since their last successful sync.

Each table involved in synchronization maintains `sync_state`, `sync_version`, and `origin` metadata columns to support reconciliation and auditing. The complementary background worker (see `sync-service`) polls the local database and hits these endpoints when connectivity is restored.

## Multi-Tenancy

Every record is scoped by `tenant_id` and optionally `branch_id`. The tenancy module provides a `POST /api/tenancy/register` endpoint that:

1. Creates a tenant with default configuration.
2. Adds the primary branch.
3. Seeds default permissions and roles (Admin, Manager, Cashier).
4. Creates the first administrator user.

## Further Reading

- `docs/architecture.md` — end-to-end system architecture.
- `docs/api.md` — REST API contract and example requests.
- `docs/setup.md` — deployment guidance for both offline and central nodes.
