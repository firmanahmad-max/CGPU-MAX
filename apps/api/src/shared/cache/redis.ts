import { Redis } from 'ioredis';

import { env } from '../config/env.js';
import { logger } from '../logging/logger.js';

export const redis: Redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on('error', (err) => logger.warn({ err }, 'Redis error'));
redis.on('connect', () => logger.info('Redis connected'));
