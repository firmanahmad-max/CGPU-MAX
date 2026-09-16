import { PrismaClient, type Manufacturer } from '@prisma/client';

const prisma = new PrismaClient();

// Compact, data-driven seed so a fresh local install has something to browse,
// compare, rank, and analyze without running the scraper. Idempotent on slug.
// Benchmark values are approximate public figures (Geekbench 6, PassMark,
// Cinebench R23, Blender Open Data) — good enough for realistic rankings.

interface CpuSeed {
  slug: string;
  manufacturer: Manufacturer;
  modelName: string;
  generation: number;
  architecture: string;
  processNm: number;
  tdpWatts: number;
  msrpUsd: number;
  releaseDate: string;
  cores: number;
  threads: number;
  baseClockGhz: number;
  boostClockGhz: number;
  l3CacheMb: number;
  socket: string;
  gb6Single: number;
  gb6Multi: number;
  passmark: number;
  cb23Multi: number;
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
  releaseDate: string;
  shaderUnits: number;
  vramGb: number;
  vramType: string;
  memoryBusBits: number;
  memoryBandwidthGbps: number;
  baseClockMhz: number;
  boostClockMhz: number;
  g3dMark: number;
  blenderGpu: number;
}

/* eslint-disable max-len */
// prettier-ignore
const CPUS: CpuSeed[] = [
  { slug: 'intel-core-i9-14900k', manufacturer: 'INTEL', modelName: 'Core i9-14900K', generation: 14, architecture: 'Raptor Lake Refresh', processNm: 10, tdpWatts: 125, msrpUsd: 589, releaseDate: '2023-10-17', cores: 24, threads: 32, baseClockGhz: 3.2, boostClockGhz: 6.0, l3CacheMb: 36, socket: 'LGA1700', gb6Single: 3120, gb6Multi: 20800, passmark: 59500, cb23Multi: 41000 },
  { slug: 'intel-core-i7-14700k', manufacturer: 'INTEL', modelName: 'Core i7-14700K', generation: 14, architecture: 'Raptor Lake Refresh', processNm: 10, tdpWatts: 125, msrpUsd: 409, releaseDate: '2023-10-17', cores: 20, threads: 28, baseClockGhz: 3.4, boostClockGhz: 5.6, l3CacheMb: 33, socket: 'LGA1700', gb6Single: 2980, gb6Multi: 19200, passmark: 53000, cb23Multi: 36000 },
  { slug: 'intel-core-i5-14600k', manufacturer: 'INTEL', modelName: 'Core i5-14600K', generation: 14, architecture: 'Raptor Lake Refresh', processNm: 10, tdpWatts: 125, msrpUsd: 319, releaseDate: '2023-10-17', cores: 14, threads: 20, baseClockGhz: 3.5, boostClockGhz: 5.3, l3CacheMb: 24, socket: 'LGA1700', gb6Single: 2870, gb6Multi: 14900, passmark: 39000, cb23Multi: 24500 },
  { slug: 'intel-core-ultra-9-285k', manufacturer: 'INTEL', modelName: 'Core Ultra 9 285K', generation: 15, architecture: 'Arrow Lake', processNm: 3, tdpWatts: 125, msrpUsd: 589, releaseDate: '2024-10-24', cores: 24, threads: 24, baseClockGhz: 3.7, boostClockGhz: 5.7, l3CacheMb: 36, socket: 'LGA1851', gb6Single: 3350, gb6Multi: 22500, passmark: 66500, cb23Multi: 42000 },
  { slug: 'intel-core-ultra-7-265k', manufacturer: 'INTEL', modelName: 'Core Ultra 7 265K', generation: 15, architecture: 'Arrow Lake', processNm: 3, tdpWatts: 125, msrpUsd: 394, releaseDate: '2024-10-24', cores: 20, threads: 20, baseClockGhz: 3.9, boostClockGhz: 5.5, l3CacheMb: 30, socket: 'LGA1851', gb6Single: 3200, gb6Multi: 20500, passmark: 60000, cb23Multi: 37000 },
  { slug: 'intel-core-i9-13900k', manufacturer: 'INTEL', modelName: 'Core i9-13900K', generation: 13, architecture: 'Raptor Lake', processNm: 10, tdpWatts: 125, msrpUsd: 549, releaseDate: '2022-10-20', cores: 24, threads: 32, baseClockGhz: 3.0, boostClockGhz: 5.8, l3CacheMb: 36, socket: 'LGA1700', gb6Single: 2950, gb6Multi: 19800, passmark: 54000, cb23Multi: 40000 },
  { slug: 'intel-core-i5-13400f', manufacturer: 'INTEL', modelName: 'Core i5-13400F', generation: 13, architecture: 'Raptor Lake', processNm: 10, tdpWatts: 65, msrpUsd: 199, releaseDate: '2023-01-03', cores: 10, threads: 16, baseClockGhz: 2.5, boostClockGhz: 4.6, l3CacheMb: 20, socket: 'LGA1700', gb6Single: 2350, gb6Multi: 12200, passmark: 25500, cb23Multi: 15300 },
  { slug: 'intel-core-i5-12400f', manufacturer: 'INTEL', modelName: 'Core i5-12400F', generation: 12, architecture: 'Alder Lake', processNm: 10, tdpWatts: 65, msrpUsd: 149, releaseDate: '2022-01-04', cores: 6, threads: 12, baseClockGhz: 2.5, boostClockGhz: 4.4, l3CacheMb: 18, socket: 'LGA1700', gb6Single: 2200, gb6Multi: 10100, passmark: 19500, cb23Multi: 12500 },
  { slug: 'intel-core-i3-14100f', manufacturer: 'INTEL', modelName: 'Core i3-14100F', generation: 14, architecture: 'Raptor Lake Refresh', processNm: 10, tdpWatts: 58, msrpUsd: 109, releaseDate: '2024-01-08', cores: 4, threads: 8, baseClockGhz: 3.5, boostClockGhz: 4.7, l3CacheMb: 12, socket: 'LGA1700', gb6Single: 2400, gb6Multi: 8600, passmark: 15200, cb23Multi: 9500 },
  { slug: 'amd-ryzen-9-9950x', manufacturer: 'AMD', modelName: 'Ryzen 9 9950X', generation: 9, architecture: 'Zen 5', processNm: 4, tdpWatts: 170, msrpUsd: 649, releaseDate: '2024-08-15', cores: 16, threads: 32, baseClockGhz: 4.3, boostClockGhz: 5.7, l3CacheMb: 64, socket: 'AM5', gb6Single: 3300, gb6Multi: 22900, passmark: 65000, cb23Multi: 44500 },
  { slug: 'amd-ryzen-9-9900x', manufacturer: 'AMD', modelName: 'Ryzen 9 9900X', generation: 9, architecture: 'Zen 5', processNm: 4, tdpWatts: 120, msrpUsd: 499, releaseDate: '2024-08-08', cores: 12, threads: 24, baseClockGhz: 4.4, boostClockGhz: 5.6, l3CacheMb: 64, socket: 'AM5', gb6Single: 3260, gb6Multi: 19500, passmark: 54500, cb23Multi: 33000 },
  { slug: 'amd-ryzen-7-9800x3d', manufacturer: 'AMD', modelName: 'Ryzen 7 9800X3D', generation: 9, architecture: 'Zen 5', processNm: 4, tdpWatts: 120, msrpUsd: 479, releaseDate: '2024-11-07', cores: 8, threads: 16, baseClockGhz: 4.7, boostClockGhz: 5.2, l3CacheMb: 96, socket: 'AM5', gb6Single: 3180, gb6Multi: 15400, passmark: 41000, cb23Multi: 23500 },
  { slug: 'amd-ryzen-7-9700x', manufacturer: 'AMD', modelName: 'Ryzen 7 9700X', generation: 9, architecture: 'Zen 5', processNm: 4, tdpWatts: 65, msrpUsd: 359, releaseDate: '2024-08-08', cores: 8, threads: 16, baseClockGhz: 3.8, boostClockGhz: 5.5, l3CacheMb: 32, socket: 'AM5', gb6Single: 3230, gb6Multi: 16000, passmark: 38500, cb23Multi: 23500 },
  { slug: 'amd-ryzen-9-7950x', manufacturer: 'AMD', modelName: 'Ryzen 9 7950X', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 170, msrpUsd: 549, releaseDate: '2022-09-27', cores: 16, threads: 32, baseClockGhz: 4.5, boostClockGhz: 5.7, l3CacheMb: 64, socket: 'AM5', gb6Single: 2900, gb6Multi: 19700, passmark: 63000, cb23Multi: 38500 },
  { slug: 'amd-ryzen-7-7800x3d', manufacturer: 'AMD', modelName: 'Ryzen 7 7800X3D', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 120, msrpUsd: 449, releaseDate: '2023-04-06', cores: 8, threads: 16, baseClockGhz: 4.2, boostClockGhz: 5.0, l3CacheMb: 96, socket: 'AM5', gb6Single: 2750, gb6Multi: 14300, passmark: 34500, cb23Multi: 18200 },
  { slug: 'amd-ryzen-5-9600x', manufacturer: 'AMD', modelName: 'Ryzen 5 9600X', generation: 9, architecture: 'Zen 5', processNm: 4, tdpWatts: 65, msrpUsd: 279, releaseDate: '2024-08-08', cores: 6, threads: 12, baseClockGhz: 3.9, boostClockGhz: 5.4, l3CacheMb: 32, socket: 'AM5', gb6Single: 3050, gb6Multi: 12100, passmark: 31000, cb23Multi: 17500 },
  { slug: 'amd-ryzen-5-7600', manufacturer: 'AMD', modelName: 'Ryzen 5 7600', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 65, msrpUsd: 229, releaseDate: '2023-01-10', cores: 6, threads: 12, baseClockGhz: 3.8, boostClockGhz: 5.1, l3CacheMb: 32, socket: 'AM5', gb6Single: 2650, gb6Multi: 12000, passmark: 27000, cb23Multi: 14500 },
  { slug: 'amd-ryzen-5-5600x', manufacturer: 'AMD', modelName: 'Ryzen 5 5600X', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 65, msrpUsd: 159, releaseDate: '2020-11-05', cores: 6, threads: 12, baseClockGhz: 3.7, boostClockGhz: 4.6, l3CacheMb: 32, socket: 'AM4', gb6Single: 2150, gb6Multi: 9800, passmark: 22000, cb23Multi: 11500 },
];

// prettier-ignore
const GPUS: GpuSeed[] = [
  { slug: 'nvidia-geforce-rtx-5090', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 5090', generation: 50, architecture: 'Blackwell', processNm: 4, tdpWatts: 575, msrpUsd: 1999, releaseDate: '2025-01-30', shaderUnits: 21760, vramGb: 32, vramType: 'GDDR7', memoryBusBits: 512, memoryBandwidthGbps: 1792, baseClockMhz: 2017, boostClockMhz: 2407, g3dMark: 41000, blenderGpu: 15800 },
  { slug: 'nvidia-geforce-rtx-5080', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 5080', generation: 50, architecture: 'Blackwell', processNm: 4, tdpWatts: 360, msrpUsd: 999, releaseDate: '2025-01-30', shaderUnits: 10752, vramGb: 16, vramType: 'GDDR7', memoryBusBits: 256, memoryBandwidthGbps: 960, baseClockMhz: 2295, boostClockMhz: 2617, g3dMark: 36500, blenderGpu: 11800 },
  { slug: 'nvidia-geforce-rtx-5070-ti', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 5070 Ti', generation: 50, architecture: 'Blackwell', processNm: 4, tdpWatts: 300, msrpUsd: 749, releaseDate: '2025-02-20', shaderUnits: 8960, vramGb: 16, vramType: 'GDDR7', memoryBusBits: 256, memoryBandwidthGbps: 896, baseClockMhz: 2300, boostClockMhz: 2452, g3dMark: 33000, blenderGpu: 10200 },
  { slug: 'nvidia-geforce-rtx-5070', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 5070', generation: 50, architecture: 'Blackwell', processNm: 4, tdpWatts: 250, msrpUsd: 549, releaseDate: '2025-03-05', shaderUnits: 6144, vramGb: 12, vramType: 'GDDR7', memoryBusBits: 192, memoryBandwidthGbps: 672, baseClockMhz: 2325, boostClockMhz: 2512, g3dMark: 28500, blenderGpu: 8300 },
  { slug: 'nvidia-geforce-rtx-5060-ti', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 5060 Ti', generation: 50, architecture: 'Blackwell', processNm: 4, tdpWatts: 180, msrpUsd: 429, releaseDate: '2025-04-16', shaderUnits: 4608, vramGb: 16, vramType: 'GDDR7', memoryBusBits: 128, memoryBandwidthGbps: 448, baseClockMhz: 2407, boostClockMhz: 2572, g3dMark: 23500, blenderGpu: 6600 },
  { slug: 'nvidia-geforce-rtx-5060', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 5060', generation: 50, architecture: 'Blackwell', processNm: 4, tdpWatts: 145, msrpUsd: 299, releaseDate: '2025-05-19', shaderUnits: 3840, vramGb: 8, vramType: 'GDDR7', memoryBusBits: 128, memoryBandwidthGbps: 448, baseClockMhz: 2280, boostClockMhz: 2497, g3dMark: 20500, blenderGpu: 5800 },
  { slug: 'nvidia-geforce-rtx-4090', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 4090', generation: 40, architecture: 'Ada Lovelace', processNm: 4, tdpWatts: 450, msrpUsd: 1599, releaseDate: '2022-10-12', shaderUnits: 16384, vramGb: 24, vramType: 'GDDR6X', memoryBusBits: 384, memoryBandwidthGbps: 1008, baseClockMhz: 2235, boostClockMhz: 2520, g3dMark: 38800, blenderGpu: 13000 },
  { slug: 'nvidia-geforce-rtx-4080-super', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 4080 SUPER', generation: 40, architecture: 'Ada Lovelace', processNm: 4, tdpWatts: 320, msrpUsd: 999, releaseDate: '2024-01-31', shaderUnits: 10240, vramGb: 16, vramType: 'GDDR6X', memoryBusBits: 256, memoryBandwidthGbps: 736, baseClockMhz: 2295, boostClockMhz: 2550, g3dMark: 34200, blenderGpu: 10200 },
  { slug: 'nvidia-geforce-rtx-4070', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 4070', generation: 40, architecture: 'Ada Lovelace', processNm: 4, tdpWatts: 200, msrpUsd: 549, releaseDate: '2023-04-13', shaderUnits: 5888, vramGb: 12, vramType: 'GDDR6X', memoryBusBits: 192, memoryBandwidthGbps: 504, baseClockMhz: 1920, boostClockMhz: 2475, g3dMark: 26800, blenderGpu: 6900 },
  { slug: 'nvidia-geforce-rtx-4060', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 4060', generation: 40, architecture: 'Ada Lovelace', processNm: 4, tdpWatts: 115, msrpUsd: 299, releaseDate: '2023-06-29', shaderUnits: 3072, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbps: 272, baseClockMhz: 1830, boostClockMhz: 2460, g3dMark: 19600, blenderGpu: 5000 },
  { slug: 'nvidia-geforce-rtx-3080', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 3080', generation: 30, architecture: 'Ampere', processNm: 8, tdpWatts: 320, msrpUsd: 699, releaseDate: '2020-09-17', shaderUnits: 8704, vramGb: 10, vramType: 'GDDR6X', memoryBusBits: 320, memoryBandwidthGbps: 760, baseClockMhz: 1440, boostClockMhz: 1710, g3dMark: 25000, blenderGpu: 6500 },
  { slug: 'nvidia-geforce-rtx-3060', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 3060', generation: 30, architecture: 'Ampere', processNm: 8, tdpWatts: 170, msrpUsd: 329, releaseDate: '2021-02-25', shaderUnits: 3584, vramGb: 12, vramType: 'GDDR6', memoryBusBits: 192, memoryBandwidthGbps: 360, baseClockMhz: 1320, boostClockMhz: 1777, g3dMark: 17000, blenderGpu: 3700 },
  { slug: 'amd-radeon-rx-9070-xt', manufacturer: 'AMD', modelName: 'Radeon RX 9070 XT', generation: 9, architecture: 'RDNA 4', processNm: 4, tdpWatts: 304, msrpUsd: 599, releaseDate: '2025-03-06', shaderUnits: 4096, vramGb: 16, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 640, baseClockMhz: 2400, boostClockMhz: 2970, g3dMark: 30500, blenderGpu: 4900 },
  { slug: 'amd-radeon-rx-9070', manufacturer: 'AMD', modelName: 'Radeon RX 9070', generation: 9, architecture: 'RDNA 4', processNm: 4, tdpWatts: 220, msrpUsd: 549, releaseDate: '2025-03-06', shaderUnits: 3584, vramGb: 16, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 640, baseClockMhz: 2070, boostClockMhz: 2520, g3dMark: 26500, blenderGpu: 4300 },
  { slug: 'amd-radeon-rx-7900-xtx', manufacturer: 'AMD', modelName: 'Radeon RX 7900 XTX', generation: 7, architecture: 'RDNA 3', processNm: 5, tdpWatts: 355, msrpUsd: 999, releaseDate: '2022-12-13', shaderUnits: 6144, vramGb: 24, vramType: 'GDDR6', memoryBusBits: 384, memoryBandwidthGbps: 960, baseClockMhz: 1900, boostClockMhz: 2500, g3dMark: 31200, blenderGpu: 4700 },
  { slug: 'amd-radeon-rx-7800-xt', manufacturer: 'AMD', modelName: 'Radeon RX 7800 XT', generation: 7, architecture: 'RDNA 3', processNm: 5, tdpWatts: 263, msrpUsd: 499, releaseDate: '2023-09-06', shaderUnits: 3840, vramGb: 16, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 624, baseClockMhz: 1800, boostClockMhz: 2430, g3dMark: 22600, blenderGpu: 3500 },
  { slug: 'amd-radeon-rx-7600', manufacturer: 'AMD', modelName: 'Radeon RX 7600', generation: 7, architecture: 'RDNA 3', processNm: 6, tdpWatts: 165, msrpUsd: 269, releaseDate: '2023-05-25', shaderUnits: 2048, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbps: 288, baseClockMhz: 1720, boostClockMhz: 2655, g3dMark: 16800, blenderGpu: 2600 },
  { slug: 'amd-radeon-rx-6700-xt', manufacturer: 'AMD', modelName: 'Radeon RX 6700 XT', generation: 6, architecture: 'RDNA 2', processNm: 7, tdpWatts: 230, msrpUsd: 329, releaseDate: '2021-03-18', shaderUnits: 2560, vramGb: 12, vramType: 'GDDR6', memoryBusBits: 192, memoryBandwidthGbps: 384, baseClockMhz: 2321, boostClockMhz: 2581, g3dMark: 16700, blenderGpu: 2200 },
  { slug: 'intel-arc-b580', manufacturer: 'INTEL', modelName: 'Arc B580', generation: 2, architecture: 'Battlemage', processNm: 5, tdpWatts: 190, msrpUsd: 249, releaseDate: '2024-12-13', shaderUnits: 2560, vramGb: 12, vramType: 'GDDR6', memoryBusBits: 192, memoryBandwidthGbps: 456, baseClockMhz: 2670, boostClockMhz: 2740, g3dMark: 19500, blenderGpu: 2900 },
  { slug: 'intel-arc-a750', manufacturer: 'INTEL', modelName: 'Arc A750', generation: 1, architecture: 'Alchemist', processNm: 6, tdpWatts: 225, msrpUsd: 199, releaseDate: '2022-10-12', shaderUnits: 3584, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 512, baseClockMhz: 2050, boostClockMhz: 2400, g3dMark: 13500, blenderGpu: 2400 },
];
/* eslint-enable max-len */

const now = new Date();

async function seedCpu(c: CpuSeed) {
  const releaseDate = new Date(c.releaseDate);
  const proc = await prisma.processor.upsert({
    where: { slug: c.slug },
    update: { msrpUsd: c.msrpUsd, tdpWatts: c.tdpWatts, releaseDate },
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
      releaseDate,
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
    { benchmarkType: 'cinebench_r23_multi', score: c.cb23Multi },
  ]);
}

async function seedGpu(g: GpuSeed) {
  const releaseDate = new Date(g.releaseDate);
  const proc = await prisma.processor.upsert({
    where: { slug: g.slug },
    update: { msrpUsd: g.msrpUsd, tdpWatts: g.tdpWatts, releaseDate },
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
      releaseDate,
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
    { benchmarkType: 'blender_gpu', score: g.blenderGpu },
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

  // A dense 90-day daily price series so the sparkline reads as a smooth
  // curve. Deterministic from processorId: a gentle downward drift off MSRP,
  // followed by a mean-reverting random walk so consecutive days stay close
  // (dense but not jagged).
  let seed = 0;
  for (let i = 0; i < processorId.length; i++)
    seed = (seed * 31 + processorId.charCodeAt(i)) % 9973;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const DAYS = 90;
  const drift = 0.06 + rand() * 0.06; // total decline 6–12% over the window
  let factor = 1;
  const priceHistory = Array.from({ length: DAYS }, (_, i) => {
    const t = i / (DAYS - 1);
    const target = 1 - drift * t; // smooth downward trend line
    factor += (target - factor) * 0.25 + (rand() - 0.5) * 0.006; // ease toward it + gentle texture
    return {
      processorId,
      retailer: 'seed-retailer',
      priceUsd: Math.max(1, Math.round(msrpUsd * factor)),
      recordedAt: new Date(now.getTime() - (DAYS - 1 - i) * 86_400_000),
    };
  });
  await prisma.priceHistory.createMany({ data: priceHistory });
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
