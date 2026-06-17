import { env } from '../config/env.js';

// Pass plain connection options to BullMQ rather than a pre-built ioredis
// instance. BullMQ constructs and manages its own connection from these — this
// avoids cross-version ioredis type clashes (BullMQ bundles its own copy) and
// is the BullMQ-recommended pattern for workers that need blocking commands.
function parseRedisUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 6379,
    username: u.username || undefined,
    password: u.password || undefined,
    db: u.pathname.length > 1 ? Number(u.pathname.slice(1)) || 0 : 0,
    // Required by BullMQ for blocking operations.
    maxRetriesPerRequest: null,
  };
}

export const connectionOptions = parseRedisUrl(env.REDIS_URL);

export const QUEUE_NAME = 'cgpu-max:scraper';
export const JOB_RUN_PIPELINE = 'run-pipeline';
