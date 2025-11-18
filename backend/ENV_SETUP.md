# Environment Configuration Guide

All data in the Autotab application is stored in the PostgreSQL database specified in your `.env` file.

## Required Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Node Environment
NODE_ENV=development

# Server Configuration
PORT=4000
APP_NAME=autotab-backend

# JWT Configuration
# Generate secure random strings (at least 32 characters)
# You can use: openssl rand -base64 32
JWT_SECRET=your-jwt-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-minimum-32-characters-long
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# PostgreSQL Database Configuration
# ⚠️ IMPORTANT: All data will be stored in the database specified here
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_postgres_username
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_database_name

# Central API Configuration (for sync service)
CENTRAL_API_BASE_URL=https://central.autotab/api

# Sync Service Configuration
SYNC_POLL_INTERVAL_MS=15000

# Audit Log Configuration
AUDIT_LOG_RETENTION_DAYS=90

# Storage Path
STORAGE_PATH=./storage
```

## Database Configuration

**All data operations use the database specified in your `.env` file:**

- ✅ User data (users, roles, permissions)
- ✅ Tenant and branch data
- ✅ Product and inventory data
- ✅ Sales and transaction data
- ✅ Settings and configuration
- ✅ Audit logs

### Verification

When you run seeders or migrations, you'll see output showing which database is being used:

```
📊 Database Configuration:
   Host: localhost
   Port: 5432
   Database: your_database_name
   User: your_postgres_username
   All data will be stored in the database specified above.
```

The server startup also logs the database connection details to confirm which database is being used.

## Setup Steps

1. **Create your PostgreSQL database:**
   ```sql
   CREATE DATABASE your_database_name;
   CREATE USER your_postgres_username WITH PASSWORD 'your_postgres_password';
   GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_postgres_username;
   ```

2. **Create `.env` file:**
   ```bash
   cd backend
   cp .env.example .env  # If .env.example exists
   # Or create .env manually with the variables above
   ```

3. **Update `.env` with your database credentials**

4. **Run migrations:**
   ```bash
   npm run migration:run
   ```
   This will create all tables in your specified database.

5. **Seed initial data (optional):**
   ```bash
   npm run seed:admin
   ```
   This will create admin user and initial data in your specified database.

## Important Notes

- ⚠️ **Never commit your `.env` file to version control**
- ✅ All database operations automatically use the database from `.env`
- ✅ Seeders, migrations, and the application all use the same database configuration
- ✅ No hardcoded database connections exist in the codebase

## Troubleshooting

If you see connection errors:

1. Verify PostgreSQL is running
2. Check that the database exists
3. Verify credentials in `.env` are correct
4. Ensure the user has proper permissions
5. Check firewall/network settings if using remote database

