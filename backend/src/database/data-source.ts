import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../config/environment';
import { entityList } from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DATABASE,
  schema: undefined,
  logging: env.NODE_ENV === 'development',
  synchronize: false,
  entities: entityList,
  migrations: ['src/database/migrations/*.ts']
});

export async function initDataSource(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  return AppDataSource.initialize();
}
