import { logger } from '../logging/logger.js';

import { redis } from './redis.js';

// Cache TTLs from Master Prompt § Scalability › Caching Strategy.
export const CacheTTL = {
  processor: 86_400, // 24h
  benchmark: 604_800, // 7d
  price: 21_600, // 6h
  searchIndex: 604_800, // 7d
  listShort: 300, // 5 min for list queries
} as const;

export type CacheTagSet = readonly string[];

export interface CacheOptions {
  ttlSeconds: number;
  tags?: CacheTagSet;
}

const TAG_INDEX_PREFIX = 'tag:';

// Cache-aside helper. On miss, runs `fn`, stores result, and adds the key to
// each tag's reverse-index set so invalidateTag() can wipe related keys.
export async function getOrSet<T>(
  key: string,
  options: CacheOptions,
  fn: () => Promise<T>,
): Promise<T> {
  if (!redis) return fn(); // Redis disabled — no caching.

  try {
    const cached = await redis.get(key);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    logger.warn({ err, key }, 'Cache read failed — falling through');
  }

  const value = await fn();

  try {
    const payload = JSON.stringify(value);
    const pipeline = redis.multi();
    pipeline.set(key, payload, 'EX', options.ttlSeconds);
    for (const tag of options.tags ?? []) {
      pipeline.sadd(`${TAG_INDEX_PREFIX}${tag}`, key);
      pipeline.expire(`${TAG_INDEX_PREFIX}${tag}`, options.ttlSeconds * 2);
    }
    await pipeline.exec();
  } catch (err) {
    logger.warn({ err, key }, 'Cache write failed');
  }

  return value;
}

export async function invalidateTag(tag: string): Promise<number> {
  if (!redis) return 0;
  const setKey = `${TAG_INDEX_PREFIX}${tag}`;
  try {
    const keys = await redis.smembers(setKey);
    if (keys.length === 0) return 0;
    await redis.del(...keys, setKey);
    return keys.length;
  } catch (err) {
    logger.warn({ err, tag }, 'Cache tag invalidation failed');
    return 0;
  }
}
