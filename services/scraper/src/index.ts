import 'dotenv/config';

import { logger } from './logging/logger.js';
import { prisma } from './persistence/prisma.js';
import { scheduleRecurring } from './queue/scheduler.js';
import { startWorker } from './queue/worker.js';

async function bootstrap() {
  logger.info('Starting CGPU-MAX scraper service');
  await scheduleRecurring();
  const worker = startWorker();

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down scraper');
    await worker.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Failed to start scraper');
  process.exit(1);
});
