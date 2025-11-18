import { createApp } from './app';
import { env } from './config/environment';
import { initDataSource } from './database/data-source';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    logger.info('Connecting to database...', {
      host: env.POSTGRES_HOST,
      port: env.POSTGRES_PORT,
      database: env.POSTGRES_DATABASE,
      user: env.POSTGRES_USER
    });
    
    await initDataSource();
    logger.info('✅ Database connected successfully. All data will be stored in the configured database.');
    
    const app = createApp();

    app.listen(env.PORT, () => {
      logger.info(
        `${env.APP_NAME} running at http://localhost:${env.PORT} (${env.NODE_ENV} mode)`
      );
    });
  } catch (error) {
    logger.error('Failed to bootstrap application', { error });
    process.exit(1);
  }
}

void bootstrap();
