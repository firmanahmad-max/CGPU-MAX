import type { PrismaClient } from '@prisma/client';

import { logger } from '../logging/logger.js';

import type { MergedProcessor } from './merge.js';

export interface UpsertStats {
  processors: { created: number; updated: number };
  benchmarks: number;
  prices: number;
  skipped: number;
}

export async function upsertProcessors(
  prisma: PrismaClient,
  rows: MergedProcessor[],
): Promise<UpsertStats> {
  const stats: UpsertStats = {
    processors: { created: 0, updated: 0 },
    benchmarks: 0,
    prices: 0,
    skipped: 0,
  };

  for (const row of rows) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const existing = await tx.processor.findUnique({ where: { slug: row.slug } });
        const isCreate = !existing;

        const processor = await tx.processor.upsert({
          where: { slug: row.slug },
          create: {
            type: row.type,
            manufacturer: row.manufacturer,
            modelName: row.modelName,
            slug: row.slug,
            generation: row.generation ?? null,
            architecture: row.architecture ?? null,
            processNm: row.processNm ?? null,
            tdpWatts: row.tdpWatts ?? null,
            msrpUsd: row.msrpUsd ?? null,
            releaseDate: row.releaseDate ?? null,
          },
          update: {
            // Only fill nulls; never clobber curated values.
            generation: existing?.generation ?? row.generation ?? null,
            architecture: existing?.architecture ?? row.architecture ?? null,
            processNm: existing?.processNm ?? row.processNm ?? null,
            tdpWatts: existing?.tdpWatts ?? row.tdpWatts ?? null,
            msrpUsd: existing?.msrpUsd ?? row.msrpUsd ?? null,
            releaseDate: existing?.releaseDate ?? row.releaseDate ?? null,
          },
        });

        if (row.cpu && row.type === 'CPU') {
          await tx.cpuSpecs.upsert({
            where: { processorId: processor.id },
            create: { processorId: processor.id, ...row.cpu },
            update: { ...row.cpu },
          });
        }

        if (row.gpu && row.type === 'GPU') {
          await tx.gpuSpecs.upsert({
            where: { processorId: processor.id },
            create: { processorId: processor.id, ...row.gpu },
            update: { ...row.gpu },
          });
        }

        if (row.benchmarks?.length) {
          await tx.benchmarkScore.createMany({
            data: row.benchmarks.map((b) => ({
              processorId: processor.id,
              benchmarkType: b.benchmarkType,
              score: b.score,
              source: row.sources[0] ?? 'unknown',
              recordedAt: b.recordedAt,
            })),
          });
          stats.benchmarks += row.benchmarks.length;
        }

        if (row.priceUsd && row.priceUsd > 0) {
          await tx.priceHistory.create({
            data: {
              processorId: processor.id,
              retailer: row.sources[0] ?? 'unknown',
              priceUsd: row.priceUsd,
              recordedAt: new Date(),
            },
          });
          stats.prices += 1;
        }

        return { isCreate };
      });

      if (result.isCreate) stats.processors.created += 1;
      else stats.processors.updated += 1;
    } catch (err) {
      stats.skipped += 1;
      logger.warn({ err, slug: row.slug }, 'Failed to upsert processor');
    }
  }

  return stats;
}
