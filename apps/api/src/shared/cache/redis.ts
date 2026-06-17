import { Redis } from 'ioredis';

import { env } from '../config/env.js';
import { logger } from '../logging/logger.js';

// Redis is optional. When REDIS_ENABLED=false the client is not created and
// `redis` is null; all consumers guard on it and degrade to no-ops.
export const REDIS_ENABLED = env.REDIS_ENABLED;

export const redis: Redis | null = REDIS_ENABLED
  ? new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: false,
    })
  : null;

if (redis) {
  redis.on('error', (err) => logger.warn({ err }, 'Redis error'));
  redis.on('connect', () => logger.info('Redis connected'));
} else {
  logger.warn(
    'Redis disabled (REDIS_ENABLED=false) — caching, rate limiting, and analytics counters are no-ops',
  );
}
