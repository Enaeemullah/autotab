## Autotab Setup Guide

This document covers local development, branch deployment, and central production deployment.

---

### 1. Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- pnpm / npm / yarn (scripts assume `npm`)
- Docker (optional but recommended for isolated Postgres)

---

### 2. Local Development

#### Backend API

```bash
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run dev
```

The API listens on `http://localhost:4000`. Health check at `/api/health`.

#### Frontend PWA

```bash
cd frontend
npm install
npm run dev
```

Default Vite dev server: `http://localhost:5173`. API calls are proxied to port 4000.

#### Sync Service

```bash
cd sync-service
cp .env.example .env
# configure LOCAL_DATABASE_URL and CENTRAL_API_BASE_URL
npm install
npm run dev
```

This worker polls every `SYNC_INTERVAL_MS` milliseconds. Logs print to stdout via Winston.

---

### 3. PostgreSQL Migrations

TypeORM migrations live in `backend/src/database/migrations`. Common commands:

```bash
npm run migration:run      # applies migrations
npm run migration:generate -- Name # helper that prints template
```

For new migrations create a file under `migrations/` manually (recommended for predictable SQL).

---

### 4. Environment Configuration

| Variable | Description |
| --- | --- |
| `PORT` | API port |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | 32+ character secrets |
| `POSTGRES_HOST/PORT/USER/PASSWORD/DATABASE` | Local Postgres connection |
| `CENTRAL_API_BASE_URL` | Used by branch node when syncing to cloud |
| `SYNC_POLL_INTERVAL_MS` | Default: 15 seconds |

Sync service additionally needs:

| Variable | Description |
| --- | --- |
| `LOCAL_DATABASE_URL` | Postgres URL for branch node |
| `CENTRAL_API_BASE_URL` | Cloud API (e.g. `https://api.autotab.app/api`) |
| `API_TOKEN` | PAT configured in central API for sync |

---

### 5. Branch Deployment (Offline Node)

1. Provision hardware (Windows/Linux/macOS workstation or mini server).
2. Install Docker and run the provided `docker-compose.branch.yml` (see below) or install Postgres + Node manually.
3. Run backend API + sync service as system services (PM2 / systemd / NSSM).
4. Serve the PWA using nginx or host Vite build output via Express static server.

**Sample docker-compose (branch)**

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15
    restart: unless-stopped
    environment:
      POSTGRES_USER: autotab
      POSTGRES_PASSWORD: autotab
      POSTGRES_DB: autotab_local
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: ../backend
    environment:
      - NODE_ENV=production
      - POSTGRES_HOST=postgres
      - POSTGRES_USER=autotab
      - POSTGRES_PASSWORD=autotab
      - POSTGRES_DATABASE=autotab_local
    depends_on:
      - postgres
    ports:
      - "4000:4000"

  sync:
    build: ../sync-service
    environment:
      - LOCAL_DATABASE_URL=postgresql://autotab:autotab@postgres:5432/autotab_local
      - CENTRAL_API_BASE_URL=https://central.autotab/api
      - API_TOKEN=REPLACE_ME
    depends_on:
      - postgres
      - api

volumes:
  pgdata:
```

---

### 6. Central Deployment

1. Deploy the backend (`backend/`) to your cloud environment (container orchestrator or VMs).
2. Use managed Postgres (e.g. AWS RDS) with backups & monitoring.
3. Point `CENTRAL_API_BASE_URL` for branch nodes to the public URL.
4. Issue sync PATs per branch and store them within branch `.env`.
5. Configure HTTPS (ALB, Nginx, Traefik, etc.) and WAF as needed.

Consider horizontal scaling by running multiple API replicas behind a load balancer — stateless thanks to JWTs and stateless sync endpoints.

---

### 7. PWA Packaging

To bundle the PWA as a desktop app:

```bash
npm run build
```

This emits static files under `frontend/dist`. You can host them via nginx or wrap using Electron (load from `dist/index.html`, enable service worker).

---

### 8. Testing

- **Backend**: `npm test` runs Jest (placeholder spec included).
- **Frontend**: Add Vitest / Cypress (not included yet).
- **Manual**: 
  - Run API locally, create tenant via `/api/tenancy/register`.
  - Login via PWA, create products, perform sales.
  - Disconnect network and continue transactions.
  - Reconnect and ensure sync logs show `success`.

---

### 9. Troubleshooting

- **Migrations fail**: ensure Postgres user owns the database. Drop and recreate on first-time setup.
- **Sync worker errors**: check connectivity to central API. Ensure PAT is valid; server must trust TLS certificate.
- **CORS issues**: update backend `cors` config if deploying separate domains.
- **JWT invalid**: regenerate secrets and update `.env`.

---

### 10. Next Steps

- Integrate receipt printers (Electron build) and barcode scanners (via WebUSB or keyboard wedge).
- Add automated end-to-end tests with Playwright.
- Wire audit log exports to SIEM.
- Harden sync by adding per-table version vectors if eventual conflict resolution needs improvement.
