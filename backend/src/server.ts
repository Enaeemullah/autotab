import { createApp } from './app';
import { env } from './config/environment';
import { initDataSource } from './database/data-source';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    await initDataSource();
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
