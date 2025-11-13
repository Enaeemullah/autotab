# autotab

Autotab is an offline-first point of sale (POS) and inventory management system inspired by Aronium. Every branch runs a full local stack (PostgreSQL + Node.js API + React PWA + sync worker) and seamlessly synchronises with the central cloud when online again.

## Repository Layout

| Directory | Description |
| --- | --- |
| `backend/` | Node.js + Express API, PostgreSQL schema, sync endpoints |
| `frontend/` | React + TypeScript PWA with Tailwind CSS & React Query |
| `sync-service/` | Background worker that bridges local and central databases |
| `docs/` | Architecture diagrams, API reference, and setup instructions |

Key features:

- Barcode/keyword product search, tax discounts, multi-payment POS workflow
- Inventory with variants, batches, suppliers, low-stock alerts, import/export
- Multi-tenant RBAC with JWT authentication and per-tenant isolation
- Reports for sales trends, inventory valuation, tax, and user performance
- Offline-first sync with conflict resolution and background queueing

## Quick Start

1. **Backend**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run migration:run
   npm run dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Sync Worker**
   ```bash
   cd sync-service
   cp .env.example .env
   npm install
   npm run dev
   ```

More detailed instructions: `docs/setup.md`. Architectural overview: `docs/architecture.md`. API reference: `docs/api.md`.
