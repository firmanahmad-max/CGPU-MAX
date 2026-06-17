import 'dotenv/config';

import { createServer } from './server.js';
import { env } from './shared/config/env.js';
import { logger } from './shared/logging/logger.js';

async function bootstrap() {
  const app = createServer();
  const server = app.listen(env.API_PORT, () => {
    logger.info({ port: env.API_PORT, env: env.NODE_ENV }, 'CGPU-MAX API listening');
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Shutting down');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Failed to bootstrap API');
  process.exit(1);
});
