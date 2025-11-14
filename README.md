# autotab

Autotab is an offline-first point of sale (POS) and inventory management system inspired by Aronium. Every branch runs a full local stack (PostgreSQL + Node.js API + React PWA + sync worker) and seamlessly synchronises with the central cloud when online again.

## Code Structure

| Path | Purpose | Highlights |
| --- | --- | --- |
| `backend/` | Node.js + Express API and PostgreSQL schema | TypeORM entities under `src/database/entities`, feature modules under `src/modules`, global middleware in `src/middleware`, and migration utilities in `src/database/migrations`. |
| `frontend/` | React + TypeScript PWA built with Vite | State managed via Redux Toolkit in `src/store`, API layer in `src/api`, reusable UI components in `src/components`, and route-level pages in `src/pages`. |
| `sync-service/` | Background worker for offline/online reconciliation | Polls local Postgres, pushes changes to the central API, and logs progress via `src/logger.ts`. |
| `docs/` | Reference documentation | `setup.md` (detailed environment steps), `architecture.md`, and `api.md`. |

Each directory is independently runnable but designed to work together: the backend exposes REST + sync endpoints, the frontend consumes them, and the sync worker keeps branch data aligned with the central cloud.

Key features:

- Barcode/keyword product search, tax discounts, multi-payment POS workflow
- Inventory with variants, batches, suppliers, low-stock alerts, import/export
- Multi-tenant RBAC with JWT authentication and per-tenant isolation
- Reports for sales trends, inventory valuation, tax, and user performance
- Offline-first sync with conflict resolution and background queueing

## Run the Full Stack Locally

1. **Install prerequisites**
   - Node.js ≥ 18, npm ≥ 9
   - PostgreSQL ≥ 14 (local install or Docker)
   - Optional: Docker Desktop for running Postgres quickly

2. **Start PostgreSQL**
   - Create a database (e.g., `autotab_local`) and user with full privileges, or run:
     ```bash
     docker run --name autotab-postgres -e POSTGRES_PASSWORD=autotab -e POSTGRES_DB=autotab_local -p 5432:5432 -d postgres:15
     ```

3. **Backend API (`backend/`)**
   ```bash
   cd backend
   cp .env.example .env       # set POSTGRES_* and JWT secrets
   npm install
   npm run migration:run
   npm run dev                # serves http://localhost:4000
   ```

4. **Frontend PWA (`frontend/`)**
   ```bash
   cd frontend
   npm install
   npm run dev                # serves http://localhost:5173 and proxies API calls to 4000
   ```

5. **Sync Worker (`sync-service/`)**
   ```bash
   cd sync-service
   cp .env.example .env       # set LOCAL_DATABASE_URL, CENTRAL_API_BASE_URL, API_TOKEN
   npm install
   npm run dev
   ```

Run each service in its own terminal. Once all three are up:

- Visit `http://localhost:5173` and register a tenant (the backend listens at `http://localhost:4000`).
- Confirm the sync worker logs successful polling cycles against your API.

For deeper deployment, environment, and troubleshooting guidance, see `docs/setup.md`. Architectural overview: `docs/architecture.md`. API reference: `docs/api.md`.
