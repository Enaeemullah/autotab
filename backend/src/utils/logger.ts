import winston from 'winston';
import { env } from '../config/environment';

const { combine, timestamp, printf, colorize, json } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, ...metadata }) => {
  const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
  return `${ts} [${level}] ${message} ${meta}`.trim();
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format:
    env.NODE_ENV === 'development'
      ? combine(colorize(), timestamp(), logFormat)
      : combine(timestamp(), json()),
  transports: [new winston.transports.Console()]
});
