import type { PrismaClient } from '@prisma/client';

import { NotFoundError } from '../../../shared/errors/AppError.js';
import type { ProcessorSnapshot } from '../domain/ComparisonEngine.js';

// Build a frozen ProcessorSnapshot from the persisted data — one place where
// raw rows turn into the shape the domain engines expect.
export async function buildProcessorSnapshot(
  prisma: PrismaClient,
  slug: string,
): Promise<ProcessorSnapshot> {
  const row = await prisma.processor.findUnique({
    where: { slug },
    include: { cpuSpecs: true, gpuSpecs: true, benchmarks: true },
  });
  if (!row || row.deletedAt) {
    throw new NotFoundError('Processor', slug);
  }

  // Aggregate benchmark scores by type (latest score wins).
  const benchmarks: Record<string, number> = {};
  for (const b of row.benchmarks) {
    const score = Number(b.score);
    if (!Number.isFinite(score)) continue;
    benchmarks[b.benchmarkType] = score;
  }

  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    manufacturer: row.manufacturer,
    modelName: row.modelName,
    tdpWatts: row.tdpWatts,
    msrpUsd: row.msrpUsd ? Number(row.msrpUsd) : null,
    generation: row.generation,
    cpu: row.cpuSpecs
      ? {
          cores: row.cpuSpecs.cores,
          threads: row.cpuSpecs.threads,
          baseClockGhz: Number(row.cpuSpecs.baseClockGhz),
          boostClockGhz: row.cpuSpecs.boostClockGhz ? Number(row.cpuSpecs.boostClockGhz) : null,
          l3CacheMb: row.cpuSpecs.l3CacheMb,
        }
      : undefined,
    gpu: row.gpuSpecs
      ? {
          shaderUnits: row.gpuSpecs.shaderUnits,
          vramGb: row.gpuSpecs.vramGb,
          memoryBandwidthGbps: row.gpuSpecs.memoryBandwidthGbps
            ? Number(row.gpuSpecs.memoryBandwidthGbps)
            : null,
          baseClockMhz: row.gpuSpecs.baseClockMhz,
          boostClockMhz: row.gpuSpecs.boostClockMhz,
        }
      : undefined,
    benchmarks,
  };
}
