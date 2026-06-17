import { Worker } from 'bullmq';

import { runPipeline } from '../ingestion/pipeline.js';
import { logger } from '../logging/logger.js';

import { connectionOptions, QUEUE_NAME } from './connection.js';

export function startWorker(): Worker {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      logger.info({ jobId: job.id, name: job.name }, 'Pipeline job started');
      const result = await runPipeline();
      return result;
    },
    {
      connection: connectionOptions,
      concurrency: 1,
      lockDuration: 30 * 60 * 1000,
    },
  );

  worker.on('completed', (job) => logger.info({ jobId: job.id }, 'Pipeline job completed'));
  worker.on('failed', (job, err) =>
    logger.error({ jobId: job?.id, err }, 'Pipeline job failed'),
  );

  return worker;
}
