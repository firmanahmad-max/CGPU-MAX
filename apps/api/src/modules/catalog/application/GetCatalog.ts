import type { Manufacturer, PrismaClient, ProcessorType } from '@prisma/client';

import { CacheTTL, getOrSet } from '../../../shared/cache/cache.js';
import { performanceScore } from '../../rankings/domain/scoring.js';

export type CatalogSort = 'index' | 'price' | 'perScore' | 'tdp' | 'vram';

export interface CatalogInput {
  type?: ProcessorType;
  manufacturer?: Manufacturer;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  vram?: number[]; // GB buckets; 24 matches >= 24
  architecture?: string;
  sort: CatalogSort;
  dir: 'asc' | 'desc';
  limit: number;
}

export interface CatalogRow {
  slug: string;
  modelName: string;
  manufacturer: string;
  type: string;
  architecture: string | null;
  tdpWatts: number | null;
  msrpUsd: number | null;
  priceIdr: number | null;
  performance: number;
  vramGb: number | null;
  vramType: string | null;
  costPerScore: number | null;
  priceSeries: number[];
}

export interface CatalogFacets {
  architectures: { name: string; count: number }[];
  vram: { gb: number; count: number }[];
  priceMin: number | null;
  priceMax: number | null;
}

function vramMatches(gb: number, buckets: number[]): boolean {
  return buckets.some((b) => (b >= 24 ? gb >= 24 : gb === b));
}

export class GetCatalog {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: CatalogInput) {
    const key = [
      'catalog',
      input.type ?? '*',
      input.manufacturer ?? '*',
      input.search ?? '',
      input.minPrice ?? 0,
      input.maxPrice ?? 0,
      (input.vram ?? []).join('.') || '*',
      input.architecture ?? '*',
      input.sort,
      input.dir,
      input.limit,
    ].join(':');

    return getOrSet(
      key,
      { ttlSeconds: CacheTTL.listShort, tags: ['processors:list'] },
      async () => {
        // Base set: type + manufacturer + search. Facets are counted here so
        // their totals stay stable as price/vram/architecture facets change.
        const rows = await this.prisma.processor.findMany({
          where: {
            deletedAt: null,
            ...(input.type ? { type: input.type } : {}),
            ...(input.manufacturer ? { manufacturer: input.manufacturer } : {}),
            ...(input.search
              ? { modelName: { contains: input.search, mode: 'insensitive' as const } }
              : {}),
          },
          include: {
            benchmarks: true,
            cpuSpecs: true,
            gpuSpecs: true,
            priceHistory: { orderBy: { recordedAt: 'asc' } },
          },
        });

        const base = rows
          .map((r) => {
            const benchmarks: Record<string, number> = {};
            for (const b of r.benchmarks) {
              const n = Number(b.score);
              if (Number.isFinite(n)) benchmarks[b.benchmarkType] = n;
            }
            const performance = performanceScore({
              type: r.type,
              benchmarks,
              cores: r.cpuSpecs?.cores,
              boostClockGhz: r.cpuSpecs?.boostClockGhz ? Number(r.cpuSpecs.boostClockGhz) : null,
              shaderUnits: r.gpuSpecs?.shaderUnits,
              boostClockMhz: r.gpuSpecs?.boostClockMhz ?? null,
            });
            if (performance === null) return null;
            const msrpUsd = r.msrpUsd ? Number(r.msrpUsd) : null;
            const row: CatalogRow = {
              slug: r.slug,
              modelName: r.modelName,
              manufacturer: String(r.manufacturer),
              type: String(r.type),
              architecture: r.architecture,
              tdpWatts: r.tdpWatts,
              msrpUsd,
              priceIdr: r.priceIdr ?? null,
              performance,
              vramGb: r.gpuSpecs?.vramGb ?? null,
              vramType: r.gpuSpecs?.vramType ?? null,
              costPerScore: msrpUsd && performance > 0 ? msrpUsd / performance : null,
              priceSeries: r.priceHistory.map((p) => Number(p.priceUsd)).filter(Number.isFinite),
            };
            return row;
          })
          .filter((x): x is CatalogRow => x !== null);

        // Facets over the base set.
        const archCounts = new Map<string, number>();
        const vramCounts = new Map<number, number>();
        let priceMin: number | null = null;
        let priceMax: number | null = null;
        for (const r of base) {
          if (r.architecture)
            archCounts.set(r.architecture, (archCounts.get(r.architecture) ?? 0) + 1);
          if (r.vramGb !== null) vramCounts.set(r.vramGb, (vramCounts.get(r.vramGb) ?? 0) + 1);
          if (r.msrpUsd !== null) {
            priceMin = priceMin === null ? r.msrpUsd : Math.min(priceMin, r.msrpUsd);
            priceMax = priceMax === null ? r.msrpUsd : Math.max(priceMax, r.msrpUsd);
          }
        }
        const facets: CatalogFacets = {
          architectures: [...archCounts.entries()]
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
          vram: [...vramCounts.entries()]
            .map(([gb, count]) => ({ gb, count }))
            .sort((a, b) => a.gb - b.gb),
          priceMin,
          priceMax,
        };

        // Apply the remaining facet filters.
        const filtered = base.filter((r) => {
          if (input.minPrice !== undefined && (r.msrpUsd === null || r.msrpUsd < input.minPrice))
            return false;
          if (input.maxPrice !== undefined && (r.msrpUsd === null || r.msrpUsd > input.maxPrice))
            return false;
          if (input.vram && input.vram.length > 0) {
            if (r.vramGb === null || !vramMatches(r.vramGb, input.vram)) return false;
          }
          if (input.architecture && r.architecture !== input.architecture) return false;
          return true;
        });

        const val = (r: CatalogRow): number => {
          switch (input.sort) {
            case 'price':
              return r.msrpUsd ?? Infinity;
            case 'perScore':
              return r.costPerScore ?? Infinity;
            case 'tdp':
              return r.tdpWatts ?? 0;
            case 'vram':
              return r.vramGb ?? 0;
            default:
              return r.performance;
          }
        };
        const mul = input.dir === 'asc' ? 1 : -1;
        filtered.sort((a, b) => (val(a) - val(b)) * mul);

        const total = filtered.length;
        const items = filtered.slice(0, input.limit);
        return { items, total, facets, sort: input.sort, dir: input.dir };
      },
    );
  }
}
