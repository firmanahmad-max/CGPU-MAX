import { redis } from '../../../shared/cache/redis.js';
import { logger } from '../../../shared/logging/logger.js';
import { parseWithScores, type RankedEntry } from '../domain/ranking.js';

const VIEWS_KEY = 'analytics:views:processors';
const COMPARISONS_KEY = 'analytics:comparisons:pairs';

// Lightweight, performant analytics on Redis sorted sets — no per-event DB
// writes. Counters are incremented fire-and-forget on the hot path; reads use
// ZREVRANGE. This matches the spec's read-heavy, Redis-first scalability model.
export class AnalyticsStore {
  recordProcessorView(slug: string): void {
    redis
      .zincrby(VIEWS_KEY, 1, slug)
      .catch((err: unknown) => logger.debug({ err, slug }, 'Failed to record view'));
  }

  recordComparison(pairKey: string): void {
    redis
      .zincrby(COMPARISONS_KEY, 1, pairKey)
      .catch((err: unknown) => logger.debug({ err, pairKey }, 'Failed to record comparison'));
  }

  async topProcessors(limit: number): Promise<RankedEntry[]> {
    const flat = await redis.zrevrange(VIEWS_KEY, 0, limit - 1, 'WITHSCORES');
    return parseWithScores(flat);
  }

  async topComparisons(limit: number): Promise<RankedEntry[]> {
    const flat = await redis.zrevrange(COMPARISONS_KEY, 0, limit - 1, 'WITHSCORES');
    return parseWithScores(flat);
  }
}

// Singleton — recording side-effects are invoked from route handlers.
export const analyticsStore = new AnalyticsStore();
