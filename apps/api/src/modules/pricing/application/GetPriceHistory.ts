import type { PrismaClient } from '@prisma/client';

import { CacheTTL, getOrSet } from '../../../shared/cache/cache.js';
import { NotFoundError } from '../../../shared/errors/AppError.js';

export class GetPriceHistory {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(slug: string, days = 365) {
    return getOrSet(
      `pricing:history:${slug}:${days}`,
      { ttlSeconds: CacheTTL.price, tags: [`processor:${slug}`] },
      async () => {
        const processor = await this.prisma.processor.findUnique({
          where: { slug },
          select: { id: true },
        });
        if (!processor) throw new NotFoundError('Processor', slug);

        const since = new Date(Date.now() - days * 86_400_000);
        const rows = await this.prisma.priceHistory.findMany({
          where: { processorId: processor.id, recordedAt: { gte: since } },
          orderBy: { recordedAt: 'asc' },
          select: { retailer: true, priceUsd: true, inStock: true, recordedAt: true },
        });

        return {
          slug,
          points: rows.map((r) => ({
            retailer: r.retailer,
            priceUsd: Number(r.priceUsd),
            inStock: r.inStock,
            recordedAt: r.recordedAt.toISOString(),
          })),
        };
      },
    );
  }
}
