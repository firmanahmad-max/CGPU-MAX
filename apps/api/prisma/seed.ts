import { PrismaClient, type Manufacturer } from '@prisma/client';

const prisma = new PrismaClient();

// Compact, data-driven seed so a fresh local install has something to browse,
// compare, and analyze without running the scraper. Idempotent on slug.

interface CpuSeed {
  slug: string;
  manufacturer: Manufacturer;
  modelName: string;
  generation: number;
  architecture: string;
  processNm: number;
  tdpWatts: number;
  msrpUsd: number;
  cores: number;
  threads: number;
  baseClockGhz: number;
  boostClockGhz: number;
  l3CacheMb: number;
  socket: string;
  gb6Single: number;
  gb6Multi: number;
  passmark: number;
}

interface GpuSeed {
  slug: string;
  manufacturer: Manufacturer;
  modelName: string;
  generation: number;
  architecture: string;
  processNm: number;
  tdpWatts: number;
  msrpUsd: number;
  shaderUnits: number;
  vramGb: number;
  vramType: string;
  memoryBusBits: number;
  memoryBandwidthGbps: number;
  baseClockMhz: number;
  boostClockMhz: number;
  g3dMark: number;
}

const CPUS: CpuSeed[] = [
  {
    slug: 'intel-core-i9-14900k',
    manufacturer: 'INTEL',
    modelName: 'Core i9-14900K',
    generation: 14,
    architecture: 'Raptor Lake Refresh',
    processNm: 10,
    tdpWatts: 125,
    msrpUsd: 589,
    cores: 24,
    threads: 32,
    baseClockGhz: 3.2,
    boostClockGhz: 6.0,
    l3CacheMb: 36,
    socket: 'LGA1700',
    gb6Single: 3120,
    gb6Multi: 20800,
    passmark: 59500,
  },
  {
    slug: 'intel-core-i7-14700k',
    manufacturer: 'INTEL',
    modelName: 'Core i7-14700K',
    generation: 14,
    architecture: 'Raptor Lake Refresh',
    processNm: 10,
    tdpWatts: 125,
    msrpUsd: 409,
    cores: 20,
    threads: 28,
    baseClockGhz: 3.4,
    boostClockGhz: 5.6,
    l3CacheMb: 33,
    socket: 'LGA1700',
    gb6Single: 2980,
    gb6Multi: 19200,
    passmark: 53000,
  },
  {
    slug: 'intel-core-i5-14600k',
    manufacturer: 'INTEL',
    modelName: 'Core i5-14600K',
    generation: 14,
    architecture: 'Raptor Lake Refresh',
    processNm: 10,
    tdpWatts: 125,
    msrpUsd: 319,
    cores: 14,
    threads: 20,
    baseClockGhz: 3.5,
    boostClockGhz: 5.3,
    l3CacheMb: 24,
    socket: 'LGA1700',
    gb6Single: 2870,
    gb6Multi: 14900,
    passmark: 39000,
  },
  {
    slug: 'amd-ryzen-9-9950x',
    manufacturer: 'AMD',
    modelName: 'Ryzen 9 9950X',
    generation: 9,
    architecture: 'Zen 5',
    processNm: 4,
    tdpWatts: 170,
    msrpUsd: 649,
    cores: 16,
    threads: 32,
    baseClockGhz: 4.3,
    boostClockGhz: 5.7,
    l3CacheMb: 64,
    socket: 'AM5',
    gb6Single: 3300,
    gb6Multi: 22900,
    passmark: 65000,
  },
  {
    slug: 'amd-ryzen-7-9800x3d',
    manufacturer: 'AMD',
    modelName: 'Ryzen 7 9800X3D',
    generation: 9,
    architecture: 'Zen 5',
    processNm: 4,
    tdpWatts: 120,
    msrpUsd: 479,
    cores: 8,
    threads: 16,
    baseClockGhz: 4.7,
    boostClockGhz: 5.2,
    l3CacheMb: 96,
    socket: 'AM5',
    gb6Single: 3180,
    gb6Multi: 15400,
    passmark: 41000,
  },
  {
    slug: 'amd-ryzen-5-9600x',
    manufacturer: 'AMD',
    modelName: 'Ryzen 5 9600X',
    generation: 9,
    architecture: 'Zen 5',
    processNm: 4,
    tdpWatts: 65,
    msrpUsd: 279,
    cores: 6,
    threads: 12,
    baseClockGhz: 3.9,
    boostClockGhz: 5.4,
    l3CacheMb: 32,
    socket: 'AM5',
    gb6Single: 3050,
    gb6Multi: 12100,
    passmark: 31000,
  },
];

const GPUS: GpuSeed[] = [
  {
    slug: 'nvidia-geforce-rtx-4090',
    manufacturer: 'NVIDIA',
    modelName: 'GeForce RTX 4090',
    generation: 40,
    architecture: 'Ada Lovelace',
    processNm: 4,
    tdpWatts: 450,
    msrpUsd: 1599,
    shaderUnits: 16384,
    vramGb: 24,
    vramType: 'GDDR6X',
    memoryBusBits: 384,
    memoryBandwidthGbps: 1008,
    baseClockMhz: 2235,
    boostClockMhz: 2520,
    g3dMark: 38800,
  },
  {
    slug: 'nvidia-geforce-rtx-4080-super',
    manufacturer: 'NVIDIA',
    modelName: 'GeForce RTX 4080 SUPER',
    generation: 40,
    architecture: 'Ada Lovelace',
    processNm: 4,
    tdpWatts: 320,
    msrpUsd: 999,
    shaderUnits: 10240,
    vramGb: 16,
    vramType: 'GDDR6X',
    memoryBusBits: 256,
    memoryBandwidthGbps: 736,
    baseClockMhz: 2295,
    boostClockMhz: 2550,
    g3dMark: 34200,
  },
  {
    slug: 'nvidia-geforce-rtx-4070',
    manufacturer: 'NVIDIA',
    modelName: 'GeForce RTX 4070',
    generation: 40,
    architecture: 'Ada Lovelace',
    processNm: 4,
    tdpWatts: 200,
    msrpUsd: 549,
    shaderUnits: 5888,
    vramGb: 12,
    vramType: 'GDDR6X',
    memoryBusBits: 192,
    memoryBandwidthGbps: 504,
    baseClockMhz: 1920,
    boostClockMhz: 2475,
    g3dMark: 26800,
  },
  {
    slug: 'nvidia-geforce-rtx-3060',
    manufacturer: 'NVIDIA',
    modelName: 'GeForce RTX 3060',
    generation: 30,
    architecture: 'Ampere',
    processNm: 8,
    tdpWatts: 170,
    msrpUsd: 329,
    shaderUnits: 3584,
    vramGb: 12,
    vramType: 'GDDR6',
    memoryBusBits: 192,
    memoryBandwidthGbps: 360,
    baseClockMhz: 1320,
    boostClockMhz: 1777,
    g3dMark: 17000,
  },
  {
    slug: 'amd-radeon-rx-7900-xtx',
    manufacturer: 'AMD',
    modelName: 'Radeon RX 7900 XTX',
    generation: 7,
    architecture: 'RDNA 3',
    processNm: 5,
    tdpWatts: 355,
    msrpUsd: 999,
    shaderUnits: 6144,
    vramGb: 24,
    vramType: 'GDDR6',
    memoryBusBits: 384,
    memoryBandwidthGbps: 960,
    baseClockMhz: 1900,
    boostClockMhz: 2500,
    g3dMark: 31200,
  },
  {
    slug: 'amd-radeon-rx-7800-xt',
    manufacturer: 'AMD',
    modelName: 'Radeon RX 7800 XT',
    generation: 7,
    architecture: 'RDNA 3',
    processNm: 5,
    tdpWatts: 263,
    msrpUsd: 499,
    shaderUnits: 3840,
    vramGb: 16,
    vramType: 'GDDR6',
    memoryBusBits: 256,
    memoryBandwidthGbps: 624,
    baseClockMhz: 1800,
    boostClockMhz: 2430,
    g3dMark: 22600,
  },
  {
    slug: 'intel-arc-b580',
    manufacturer: 'INTEL',
    modelName: 'Arc B580',
    generation: 2,
    architecture: 'Battlemage',
    processNm: 5,
    tdpWatts: 190,
    msrpUsd: 249,
    shaderUnits: 2560,
    vramGb: 12,
    vramType: 'GDDR6',
    memoryBusBits: 192,
    memoryBandwidthGbps: 456,
    baseClockMhz: 2670,
    boostClockMhz: 2740,
    g3dMark: 19500,
  },
];

const now = new Date();

async function seedCpu(c: CpuSeed) {
  const proc = await prisma.processor.upsert({
    where: { slug: c.slug },
    update: { msrpUsd: c.msrpUsd, tdpWatts: c.tdpWatts },
    create: {
      type: 'CPU',
      manufacturer: c.manufacturer,
      modelName: c.modelName,
      slug: c.slug,
      generation: c.generation,
      architecture: c.architecture,
      processNm: c.processNm,
      tdpWatts: c.tdpWatts,
      msrpUsd: c.msrpUsd,
      cpuSpecs: {
        create: {
          cores: c.cores,
          threads: c.threads,
          baseClockGhz: c.baseClockGhz,
          boostClockGhz: c.boostClockGhz,
          l3CacheMb: c.l3CacheMb,
          socket: c.socket,
        },
      },
    },
  });
  await refreshSignals(proc.id, c.msrpUsd, [
    { benchmarkType: 'geekbench6_single_core', score: c.gb6Single },
    { benchmarkType: 'geekbench6_multi_core', score: c.gb6Multi },
    { benchmarkType: 'passmark_cpu_mark', score: c.passmark },
  ]);
}

async function seedGpu(g: GpuSeed) {
  const proc = await prisma.processor.upsert({
    where: { slug: g.slug },
    update: { msrpUsd: g.msrpUsd, tdpWatts: g.tdpWatts },
    create: {
      type: 'GPU',
      manufacturer: g.manufacturer,
      modelName: g.modelName,
      slug: g.slug,
      generation: g.generation,
      architecture: g.architecture,
      processNm: g.processNm,
      tdpWatts: g.tdpWatts,
      msrpUsd: g.msrpUsd,
      gpuSpecs: {
        create: {
          shaderUnits: g.shaderUnits,
          vramGb: g.vramGb,
          vramType: g.vramType,
          memoryBusBits: g.memoryBusBits,
          memoryBandwidthGbps: g.memoryBandwidthGbps,
          baseClockMhz: g.baseClockMhz,
          boostClockMhz: g.boostClockMhz,
        },
      },
    },
  });
  await refreshSignals(proc.id, g.msrpUsd, [
    { benchmarkType: 'passmark_g3d_mark', score: g.g3dMark },
  ]);
}

// Idempotent: clear and re-create this processor's benchmarks + a couple of
// price points so re-seeding doesn't accumulate duplicates.
async function refreshSignals(
  processorId: string,
  msrpUsd: number,
  benchmarks: { benchmarkType: string; score: number }[],
) {
  await prisma.benchmarkScore.deleteMany({ where: { processorId } });
  await prisma.priceHistory.deleteMany({ where: { processorId } });

  await prisma.benchmarkScore.createMany({
    data: benchmarks.map((b) => ({
      processorId,
      benchmarkType: b.benchmarkType,
      score: b.score,
      source: 'seed',
      recordedAt: now,
    })),
  });

  // Two price points: list price last month, a small drop today.
  await prisma.priceHistory.createMany({
    data: [
      {
        processorId,
        retailer: 'seed-retailer',
        priceUsd: msrpUsd,
        recordedAt: new Date(now.getTime() - 30 * 86_400_000),
      },
      {
        processorId,
        retailer: 'seed-retailer',
        priceUsd: Math.round(msrpUsd * 0.95),
        recordedAt: now,
      },
    ],
  });
}

async function main() {
  for (const c of CPUS) await seedCpu(c);
  for (const g of GPUS) await seedGpu(g);
  console.info(
    `Seeded ${CPUS.length} CPUs and ${GPUS.length} GPUs with benchmarks + price history.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
