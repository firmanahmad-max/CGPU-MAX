// Source-agnostic shape produced by each adapter. The ingestion step
// merges multiple NormalizedProcessor rows and upserts into Prisma.

import type { Manufacturer, ProcessorType } from '@cgpu-max/types';

export type DataSource = 'geekbench' | 'techpowerup' | 'passmark';

export interface NormalizedBenchmark {
  benchmarkType: string;
  score: number;
  recordedAt: Date;
}

export interface NormalizedProcessor {
  source: DataSource;
  sourceId: string;
  type: ProcessorType;
  manufacturer: Manufacturer;
  modelName: string;
  slug: string;

  // Optional spec fields — adapters fill what they have.
  generation?: number | null;
  architecture?: string | null;
  processNm?: number | null;
  tdpWatts?: number | null;
  msrpUsd?: number | null;
  releaseDate?: Date | null;

  cpu?: {
    cores: number;
    threads: number;
    baseClockGhz: number;
    boostClockGhz?: number | null;
    l3CacheMb?: number | null;
    socket?: string | null;
  };

  gpu?: {
    shaderUnits: number;
    vramGb: number;
    vramType?: string | null;
    memoryBandwidthGbps?: number | null;
    baseClockMhz: number;
    boostClockMhz?: number | null;
  };

  benchmarks?: NormalizedBenchmark[];
  priceUsd?: number | null;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[®™]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function detectCpuManufacturer(name: string): Manufacturer | null {
  const n = name.toLowerCase();
  if (n.includes('intel') || n.includes('core i') || n.includes('xeon')) return 'INTEL';
  if (n.includes('amd') || n.includes('ryzen') || n.includes('threadripper') || n.includes('epyc'))
    return 'AMD';
  return null;
}

export function detectGpuManufacturer(name: string): Manufacturer | null {
  const n = name.toLowerCase();
  if (n.includes('nvidia') || n.includes('geforce') || n.includes('rtx') || n.includes('gtx'))
    return 'NVIDIA';
  if (n.includes('amd') || n.includes('radeon')) return 'AMD';
  if (n.includes('intel') || n.includes('arc ')) return 'INTEL';
  return null;
}
