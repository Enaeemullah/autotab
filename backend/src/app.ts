import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import 'express-async-errors';
import { env } from './config/environment';
import { registerRoutes } from './routes';
import { errorHandler } from './middleware/error-handler';
import { requestContext } from './middleware/request-context';

export function createApp() {
  const app = express();

  app.set('trust proxy', true);
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

  app.use(requestContext());
  registerRoutes(app);
  app.use(errorHandler());

  return app;
}
