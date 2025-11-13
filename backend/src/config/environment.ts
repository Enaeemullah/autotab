import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  APP_NAME: z.string().default('autotab-backend'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DATABASE: z.string(),
  CENTRAL_API_BASE_URL: z.string().url().default('https://central.autotab/api'),
  SYNC_POLL_INTERVAL_MS: z.coerce.number().default(15_000),
  AUDIT_LOG_RETENTION_DAYS: z.coerce.number().default(90),
  STORAGE_PATH: z.string().default('./storage')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.errors.map((err) => `[${err.path.join('.')}] ${err.message}`).join('\n');
  throw new Error(`Environment validation failed:\n${message}`);
}

export const env = parsed.data;

export type Environment = typeof env;
