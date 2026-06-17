import { Queue } from 'bullmq';

import { env } from '../config/env.js';
import { logger } from '../logging/logger.js';

import { connectionOptions, JOB_RUN_PIPELINE, QUEUE_NAME } from './connection.js';

export const queue = new Queue(QUEUE_NAME, { connection: connectionOptions });

export async function scheduleRecurring() {
  await queue.add(
    JOB_RUN_PIPELINE,
    {},
    {
      repeat: { pattern: env.SCRAPER_CRON },
      jobId: 'recurring-pipeline',
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 100 },
    },
  );
  logger.info({ cron: env.SCRAPER_CRON }, 'Scheduled recurring scraper pipeline');
}
