import 'dotenv/config';

import { createServer } from './server.js';
import { env } from './shared/config/env.js';
import { logger } from './shared/logging/logger.js';

async function bootstrap() {
  const app = createServer();
  // Honor the PaaS-injected PORT (Render/Railway/Fly/Heroku…) when present;
  // fall back to API_PORT for local/dev.
  const port = Number(process.env.PORT) || env.API_PORT;
  const server = app.listen(port, () => {
    logger.info({ port, env: env.NODE_ENV }, 'CGPU-MAX API listening');
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
