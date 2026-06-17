import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import RedisStore, { type RedisReply } from 'rate-limit-redis';

import { getLimits } from '../../modules/subscriptions/domain/TierPolicy.js';
import { redis } from '../cache/redis.js';

// Per-tier rate limit. Key = userId for authenticated requests, IP otherwise.
// Backed by Redis (shared across instances) when available; otherwise falls
// back to express-rate-limit's in-memory store (per-instance — fine for dev).
export function tieredRateLimiter(): RateLimitRequestHandler {
  // Capture into a local const so the non-null narrowing holds inside the closure.
  const client = redis;
  const store = client
    ? new RedisStore({
        // ioredis `call` requires (command, ...args); assert the non-empty
        // tuple and cast the unknown reply to the store's expected RedisReply.
        sendCommand: (...args: string[]): Promise<RedisReply> =>
          client.call(...(args as [string, ...string[]])) as Promise<RedisReply>,
        prefix: 'rl:tier:',
      })
    : undefined;

  return rateLimit({
    windowMs: 15 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    ...(store ? { store } : {}),
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
