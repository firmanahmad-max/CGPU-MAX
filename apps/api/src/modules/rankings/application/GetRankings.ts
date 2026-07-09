import type { Manufacturer, PrismaClient, ProcessorType } from '@prisma/client';

import { CacheTTL, getOrSet } from '../../../shared/cache/cache.js';
import { categoryScore, valueScore, type RankingCategory } from '../domain/scoring.js';

export type RankingSort = 'performance' | 'value';

export interface RankingsInput {
  type: ProcessorType;
  manufacturer?: Manufacturer;
  sort: RankingSort;
  category: RankingCategory;
  minPrice?: number;
  maxPrice?: number;
  limit: number;
  offset: number;
}

export interface RankedProcessor {
  rank: number;
  slug: string;
  modelName: string;
  manufacturer: string;
  type: string;
  msrpUsd: number | null;
  performance: number;
  value: number | null;
}

export class GetRankings {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: RankingsInput) {
    const key = `rankings:${input.type}:${input.manufacturer ?? '*'}:${input.sort}:${input.category}:${input.minPrice ?? 0}:${input.maxPrice ?? 0}:${input.limit}:${input.offset}`;
    return getOrSet(
      key,
      { ttlSeconds: CacheTTL.listShort, tags: ['processors:list'] },
      async () => {
        const rows = await this.prisma.processor.findMany({
          where: {
            deletedAt: null,
            type: input.type,
            ...(input.manufacturer ? { manufacturer: input.manufacturer } : {}),
          },
          include: { benchmarks: true, cpuSpecs: true, gpuSpecs: true },
        });

        const scored = rows
          .map((r) => {
            const benchmarks: Record<string, number> = {};
            for (const b of r.benchmarks) {
              const n = Number(b.score);
              if (Number.isFinite(n)) benchmarks[b.benchmarkType] = n;
            }
            const performance = categoryScore(
              {
                type: r.type,
                benchmarks,
                cores: r.cpuSpecs?.cores,
                boostClockGhz: r.cpuSpecs?.boostClockGhz ? Number(r.cpuSpecs.boostClockGhz) : null,
                shaderUnits: r.gpuSpecs?.shaderUnits,
                boostClockMhz: r.gpuSpecs?.boostClockMhz ?? null,
              },
              input.category,
            );
            if (performance === null) return null;
            const msrpUsd = r.msrpUsd ? Number(r.msrpUsd) : null;
            return {
              slug: r.slug,
              modelName: r.modelName,
              manufacturer: String(r.manufacturer),
              type: String(r.type),
              msrpUsd,
              performance,
              value: valueScore(performance, msrpUsd),
            };
          })
          .filter((x): x is Omit<RankedProcessor, 'rank'> => x !== null)
          // Price-bracket filter. Parts with no MSRP can't be bracketed, so a
          // price filter excludes them.
          .filter((x) => {
            if (input.minPrice === undefined && input.maxPrice === undefined) return true;
            if (x.msrpUsd === null) return false;
            if (input.minPrice !== undefined && x.msrpUsd < input.minPrice) return false;
            if (input.maxPrice !== undefined && x.msrpUsd > input.maxPrice) return false;
            return true;
          });

        scored.sort((a, b) =>
          input.sort === 'value' ? (b.value ?? 0) - (a.value ?? 0) : b.performance - a.performance,
        );

        const total = scored.length;
        const items: RankedProcessor[] = scored
          .slice(input.offset, input.offset + input.limit)
          .map((x, i) => ({ rank: input.offset + i + 1, ...x }));

        return {
          items,
          total,
          limit: input.limit,
          offset: input.offset,
          sort: input.sort,
          category: input.category,
        };
      },
    );
  }
}
