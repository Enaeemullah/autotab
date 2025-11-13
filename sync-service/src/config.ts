import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable ${key}`);
  }
  return value;
}

export const config = {
  localDatabaseUrl: requireEnv('LOCAL_DATABASE_URL'),
  centralApiBaseUrl: requireEnv('CENTRAL_API_BASE_URL'),
  syncIntervalMs: Number(process.env.SYNC_INTERVAL_MS ?? 15000),
  apiToken: process.env.API_TOKEN ?? ''
};
