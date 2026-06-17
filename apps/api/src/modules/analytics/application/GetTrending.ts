import type { PrismaClient } from '@prisma/client';

import { getOrSet } from '../../../shared/cache/cache.js';
import { analyticsStore } from '../infrastructure/AnalyticsStore.js';

export interface TrendingProcessor {
  slug: string;
  modelName: string;
  manufacturer: string;
  type: string;
  views: number;
}

export class GetTrending {
  constructor(private readonly prisma: PrismaClient) {}

  async processors(limit: number): Promise<{ items: TrendingProcessor[] }> {
    return getOrSet(`analytics:trending:processors:${limit}`, { ttlSeconds: 300 }, async () => {
      const ranked = await analyticsStore.topProcessors(limit);
      if (ranked.length === 0) return { items: [] };

      // Hydrate names from the DB, preserving the ranking order.
      const rows = await this.prisma.processor.findMany({
        where: { slug: { in: ranked.map((r) => r.member) }, deletedAt: null },
        select: { slug: true, modelName: true, manufacturer: true, type: true },
      });
      const bySlug = new Map(rows.map((r) => [r.slug, r]));

      const items = ranked
        .map((r) => {
          const row = bySlug.get(r.member);
          if (!row) return null;
          return {
            slug: row.slug,
            modelName: row.modelName,
            manufacturer: String(row.manufacturer),
            type: String(row.type),
            views: r.score,
          };
        })
        .filter((x): x is TrendingProcessor => x !== null);

      return { items };
    });
  }

  async comparisons(limit: number) {
    return getOrSet(`analytics:popular:comparisons:${limit}`, { ttlSeconds: 300 }, async () => {
      const ranked = await analyticsStore.topComparisons(limit);
      return { items: ranked.map((r) => ({ shareSlug: r.member, count: r.score })) };
    });
  }
}
