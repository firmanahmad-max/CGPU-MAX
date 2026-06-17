import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import RedisStore, { type RedisReply } from 'rate-limit-redis';

import { getLimits } from '../../modules/subscriptions/domain/TierPolicy.js';
import { redis } from '../cache/redis.js';

// Per-tier rate limit. Key = userId for authenticated requests, IP otherwise.
// Stored in Redis so it works across horizontally-scaled API instances.
export function tieredRateLimiter(): RateLimitRequestHandler {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      // ioredis `call` requires (command, ...args); assert the non-empty tuple
      // and cast the unknown reply to the store's expected RedisReply.
      sendCommand: (...args: string[]): Promise<RedisReply> =>
        redis.call(...(args as [string, ...string[]])) as Promise<RedisReply>,
      prefix: 'rl:tier:',
    }),
    keyGenerator: (req) => req.auth?.userId ?? req.ip ?? 'anon',
    max: (req) => {
      const tier = req.auth?.tier ?? 'FREE';
      return getLimits(tier).apiRequestsPer15min;
    },
    message: {
      error: {
        code: 'RATE_LIMITED',
        message:
          'Too many requests for your current tier. Upgrade or wait for the window to reset.',
      },
    },
  });
}
