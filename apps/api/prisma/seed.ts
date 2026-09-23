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
  { slug: 'intel-core-i9-14900ks', manufacturer: 'INTEL', modelName: 'Core i9-14900KS', generation: 14, architecture: 'Raptor Lake Refresh', processNm: 10, tdpWatts: 150, msrpUsd: 689, releaseDate: '2024-03-14', cores: 24, threads: 32, baseClockGhz: 3.2, boostClockGhz: 6.2, l3CacheMb: 36, socket: 'LGA1700', gb6Single: 3200, gb6Multi: 21200, passmark: 61500, cb23Multi: 42000 },
  { slug: 'intel-core-i7-13700k', manufacturer: 'INTEL', modelName: 'Core i7-13700K', generation: 13, architecture: 'Raptor Lake', processNm: 10, tdpWatts: 125, msrpUsd: 409, releaseDate: '2022-10-20', cores: 16, threads: 24, baseClockGhz: 3.4, boostClockGhz: 5.4, l3CacheMb: 30, socket: 'LGA1700', gb6Single: 2900, gb6Multi: 18500, passmark: 50000, cb23Multi: 30500 },
  { slug: 'intel-core-i5-13600k', manufacturer: 'INTEL', modelName: 'Core i5-13600K', generation: 13, architecture: 'Raptor Lake', processNm: 10, tdpWatts: 125, msrpUsd: 319, releaseDate: '2022-10-20', cores: 14, threads: 20, baseClockGhz: 3.5, boostClockGhz: 5.1, l3CacheMb: 24, socket: 'LGA1700', gb6Single: 2820, gb6Multi: 14200, passmark: 38000, cb23Multi: 24000 },
  { slug: 'intel-core-i9-12900k', manufacturer: 'INTEL', modelName: 'Core i9-12900K', generation: 12, architecture: 'Alder Lake', processNm: 10, tdpWatts: 125, msrpUsd: 589, releaseDate: '2021-11-04', cores: 16, threads: 24, baseClockGhz: 3.2, boostClockGhz: 5.2, l3CacheMb: 30, socket: 'LGA1700', gb6Single: 2700, gb6Multi: 16500, passmark: 41000, cb23Multi: 27000 },
  { slug: 'intel-core-i7-12700k', manufacturer: 'INTEL', modelName: 'Core i7-12700K', generation: 12, architecture: 'Alder Lake', processNm: 10, tdpWatts: 125, msrpUsd: 409, releaseDate: '2021-11-04', cores: 12, threads: 20, baseClockGhz: 3.6, boostClockGhz: 5.0, l3CacheMb: 25, socket: 'LGA1700', gb6Single: 2650, gb6Multi: 14000, passmark: 34500, cb23Multi: 22500 },
  { slug: 'intel-core-i5-14400f', manufacturer: 'INTEL', modelName: 'Core i5-14400F', generation: 14, architecture: 'Raptor Lake Refresh', processNm: 10, tdpWatts: 65, msrpUsd: 221, releaseDate: '2024-01-08', cores: 10, threads: 16, baseClockGhz: 2.5, boostClockGhz: 4.7, l3CacheMb: 20, socket: 'LGA1700', gb6Single: 2450, gb6Multi: 12800, passmark: 27000, cb23Multi: 16500 },
  { slug: 'intel-core-i3-12100f', manufacturer: 'INTEL', modelName: 'Core i3-12100F', generation: 12, architecture: 'Alder Lake', processNm: 10, tdpWatts: 58, msrpUsd: 97, releaseDate: '2022-01-04', cores: 4, threads: 8, baseClockGhz: 3.3, boostClockGhz: 4.3, l3CacheMb: 12, socket: 'LGA1700', gb6Single: 2100, gb6Multi: 6900, passmark: 13000, cb23Multi: 8000 },
  { slug: 'intel-core-ultra-5-245k', manufacturer: 'INTEL', modelName: 'Core Ultra 5 245K', generation: 15, architecture: 'Arrow Lake', processNm: 3, tdpWatts: 125, msrpUsd: 309, releaseDate: '2024-10-24', cores: 14, threads: 14, baseClockGhz: 4.2, boostClockGhz: 5.2, l3CacheMb: 24, socket: 'LGA1851', gb6Single: 3050, gb6Multi: 16800, passmark: 44000, cb23Multi: 26000 },
  { slug: 'amd-ryzen-9-9950x3d', manufacturer: 'AMD', modelName: 'Ryzen 9 9950X3D', generation: 9, architecture: 'Zen 5', processNm: 4, tdpWatts: 170, msrpUsd: 699, releaseDate: '2025-03-12', cores: 16, threads: 32, baseClockGhz: 4.3, boostClockGhz: 5.7, l3CacheMb: 128, socket: 'AM5', gb6Single: 3290, gb6Multi: 22600, passmark: 64500, cb23Multi: 43500 },
  { slug: 'amd-ryzen-9-9900x3d', manufacturer: 'AMD', modelName: 'Ryzen 9 9900X3D', generation: 9, architecture: 'Zen 5', processNm: 4, tdpWatts: 120, msrpUsd: 599, releaseDate: '2025-03-12', cores: 12, threads: 24, baseClockGhz: 4.4, boostClockGhz: 5.5, l3CacheMb: 128, socket: 'AM5', gb6Single: 3250, gb6Multi: 19100, passmark: 53500, cb23Multi: 32500 },
  { slug: 'amd-ryzen-9-7950x3d', manufacturer: 'AMD', modelName: 'Ryzen 9 7950X3D', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 120, msrpUsd: 699, releaseDate: '2023-02-28', cores: 16, threads: 32, baseClockGhz: 4.2, boostClockGhz: 5.7, l3CacheMb: 128, socket: 'AM5', gb6Single: 2880, gb6Multi: 19200, passmark: 62000, cb23Multi: 37500 },
  { slug: 'amd-ryzen-9-7900x', manufacturer: 'AMD', modelName: 'Ryzen 9 7900X', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 170, msrpUsd: 549, releaseDate: '2022-09-27', cores: 12, threads: 24, baseClockGhz: 4.7, boostClockGhz: 5.6, l3CacheMb: 64, socket: 'AM5', gb6Single: 2850, gb6Multi: 17800, passmark: 52500, cb23Multi: 29000 },
  { slug: 'amd-ryzen-7-7700x', manufacturer: 'AMD', modelName: 'Ryzen 7 7700X', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 105, msrpUsd: 399, releaseDate: '2022-09-27', cores: 8, threads: 16, baseClockGhz: 4.5, boostClockGhz: 5.4, l3CacheMb: 32, socket: 'AM5', gb6Single: 2780, gb6Multi: 14500, passmark: 36000, cb23Multi: 19800 },
  { slug: 'amd-ryzen-5-7600x', manufacturer: 'AMD', modelName: 'Ryzen 5 7600X', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 105, msrpUsd: 299, releaseDate: '2022-09-27', cores: 6, threads: 12, baseClockGhz: 4.7, boostClockGhz: 5.3, l3CacheMb: 32, socket: 'AM5', gb6Single: 2720, gb6Multi: 12600, passmark: 28500, cb23Multi: 15200 },
  { slug: 'amd-ryzen-7-5800x3d', manufacturer: 'AMD', modelName: 'Ryzen 7 5800X3D', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 105, msrpUsd: 449, releaseDate: '2022-04-20', cores: 8, threads: 16, baseClockGhz: 3.4, boostClockGhz: 4.5, l3CacheMb: 96, socket: 'AM4', gb6Single: 2050, gb6Multi: 10200, passmark: 28500, cb23Multi: 14200 },
  { slug: 'amd-ryzen-9-5900x', manufacturer: 'AMD', modelName: 'Ryzen 9 5900X', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 105, msrpUsd: 549, releaseDate: '2020-11-05', cores: 12, threads: 24, baseClockGhz: 3.7, boostClockGhz: 4.8, l3CacheMb: 64, socket: 'AM4', gb6Single: 2200, gb6Multi: 13500, passmark: 39000, cb23Multi: 21500 },
  { slug: 'amd-ryzen-5-5600', manufacturer: 'AMD', modelName: 'Ryzen 5 5600', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 65, msrpUsd: 199, releaseDate: '2022-04-04', cores: 6, threads: 12, baseClockGhz: 3.5, boostClockGhz: 4.4, l3CacheMb: 32, socket: 'AM4', gb6Single: 2100, gb6Multi: 9400, passmark: 21000, cb23Multi: 11000 },
  { slug: 'intel-core-i9-11900k', manufacturer: 'INTEL', modelName: 'Core i9-11900K', generation: 11, architecture: 'Rocket Lake', processNm: 14, tdpWatts: 125, msrpUsd: 539, releaseDate: '2021-03-30', cores: 8, threads: 16, baseClockGhz: 3.5, boostClockGhz: 5.3, l3CacheMb: 16, socket: 'LGA1200', gb6Single: 2400, gb6Multi: 10500, passmark: 24000, cb23Multi: 16000 },
  { slug: 'intel-core-i5-11400f', manufacturer: 'INTEL', modelName: 'Core i5-11400F', generation: 11, architecture: 'Rocket Lake', processNm: 14, tdpWatts: 65, msrpUsd: 157, releaseDate: '2021-03-30', cores: 6, threads: 12, baseClockGhz: 2.6, boostClockGhz: 4.4, l3CacheMb: 12, socket: 'LGA1200', gb6Single: 1950, gb6Multi: 8200, passmark: 17500, cb23Multi: 11000 },
  { slug: 'amd-ryzen-7-8700g', manufacturer: 'AMD', modelName: 'Ryzen 7 8700G', generation: 8, architecture: 'Zen 4', processNm: 4, tdpWatts: 65, msrpUsd: 329, releaseDate: '2024-01-31', cores: 8, threads: 16, baseClockGhz: 4.2, boostClockGhz: 5.1, l3CacheMb: 16, socket: 'AM5', gb6Single: 2600, gb6Multi: 12500, passmark: 28000, cb23Multi: 17500 },
  { slug: 'amd-ryzen-5-8600g', manufacturer: 'AMD', modelName: 'Ryzen 5 8600G', generation: 8, architecture: 'Zen 4', processNm: 4, tdpWatts: 65, msrpUsd: 229, releaseDate: '2024-01-31', cores: 6, threads: 12, baseClockGhz: 4.3, boostClockGhz: 5.0, l3CacheMb: 16, socket: 'AM5', gb6Single: 2500, gb6Multi: 9800, passmark: 22000, cb23Multi: 13500 },
  { slug: 'amd-ryzen-threadripper-7980x', manufacturer: 'AMD', modelName: 'Ryzen Threadripper 7980X', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 350, msrpUsd: 4999, releaseDate: '2023-11-21', cores: 64, threads: 128, baseClockGhz: 3.2, boostClockGhz: 5.1, l3CacheMb: 256, socket: 'sTR5', gb6Single: 2750, gb6Multi: 28000, passmark: 125000, cb23Multi: 125000 },
  { slug: 'amd-ryzen-threadripper-7970x', manufacturer: 'AMD', modelName: 'Ryzen Threadripper 7970X', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 350, msrpUsd: 2499, releaseDate: '2023-11-21', cores: 32, threads: 64, baseClockGhz: 4.0, boostClockGhz: 5.3, l3CacheMb: 128, socket: 'sTR5', gb6Single: 2820, gb6Multi: 26000, passmark: 95000, cb23Multi: 72000 },
  { slug: 'amd-ryzen-threadripper-7960x', manufacturer: 'AMD', modelName: 'Ryzen Threadripper 7960X', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 350, msrpUsd: 1499, releaseDate: '2023-11-21', cores: 24, threads: 48, baseClockGhz: 4.2, boostClockGhz: 5.3, l3CacheMb: 128, socket: 'sTR5', gb6Single: 2850, gb6Multi: 24000, passmark: 78000, cb23Multi: 55000 },
  { slug: 'amd-ryzen-9-5950x', manufacturer: 'AMD', modelName: 'Ryzen 9 5950X', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 105, msrpUsd: 799, releaseDate: '2020-11-05', cores: 16, threads: 32, baseClockGhz: 3.4, boostClockGhz: 4.9, l3CacheMb: 64, socket: 'AM4', gb6Single: 2250, gb6Multi: 15800, passmark: 46000, cb23Multi: 28500 },
  { slug: 'amd-ryzen-7-5800x', manufacturer: 'AMD', modelName: 'Ryzen 7 5800X', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 105, msrpUsd: 449, releaseDate: '2020-11-05', cores: 8, threads: 16, baseClockGhz: 3.8, boostClockGhz: 4.7, l3CacheMb: 32, socket: 'AM4', gb6Single: 2200, gb6Multi: 10800, passmark: 28000, cb23Multi: 15000 },
  { slug: 'amd-ryzen-7-5700x', manufacturer: 'AMD', modelName: 'Ryzen 7 5700X', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 65, msrpUsd: 299, releaseDate: '2022-04-04', cores: 8, threads: 16, baseClockGhz: 3.4, boostClockGhz: 4.6, l3CacheMb: 32, socket: 'AM4', gb6Single: 2120, gb6Multi: 10400, passmark: 26500, cb23Multi: 14000 },
  { slug: 'amd-ryzen-7-5700x3d', manufacturer: 'AMD', modelName: 'Ryzen 7 5700X3D', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 105, msrpUsd: 249, releaseDate: '2024-01-31', cores: 8, threads: 16, baseClockGhz: 3.0, boostClockGhz: 4.1, l3CacheMb: 96, socket: 'AM4', gb6Single: 1980, gb6Multi: 9900, passmark: 27500, cb23Multi: 13600 },
  { slug: 'amd-ryzen-7-5700g', manufacturer: 'AMD', modelName: 'Ryzen 7 5700G', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 65, msrpUsd: 359, releaseDate: '2021-08-05', cores: 8, threads: 16, baseClockGhz: 3.8, boostClockGhz: 4.6, l3CacheMb: 16, socket: 'AM4', gb6Single: 2100, gb6Multi: 10000, passmark: 24500, cb23Multi: 14000 },
  { slug: 'amd-ryzen-5-5600g', manufacturer: 'AMD', modelName: 'Ryzen 5 5600G', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 65, msrpUsd: 259, releaseDate: '2021-08-05', cores: 6, threads: 12, baseClockGhz: 3.9, boostClockGhz: 4.4, l3CacheMb: 16, socket: 'AM4', gb6Single: 2050, gb6Multi: 8600, passmark: 19800, cb23Multi: 10800 },
  { slug: 'amd-ryzen-5-5600gt', manufacturer: 'AMD', modelName: 'Ryzen 5 5600GT', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 65, msrpUsd: 140, releaseDate: '2024-01-31', cores: 6, threads: 12, baseClockGhz: 3.6, boostClockGhz: 4.6, l3CacheMb: 16, socket: 'AM4', gb6Single: 2020, gb6Multi: 8500, passmark: 19500, cb23Multi: 10600 },
  { slug: 'amd-ryzen-5-5500gt', manufacturer: 'AMD', modelName: 'Ryzen 5 5500GT', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 65, msrpUsd: 125, releaseDate: '2024-01-31', cores: 6, threads: 12, baseClockGhz: 3.6, boostClockGhz: 4.4, l3CacheMb: 16, socket: 'AM4', gb6Single: 1980, gb6Multi: 8300, passmark: 18800, cb23Multi: 10200 },
  { slug: 'amd-ryzen-5-5500', manufacturer: 'AMD', modelName: 'Ryzen 5 5500', generation: 5, architecture: 'Zen 3', processNm: 7, tdpWatts: 65, msrpUsd: 159, releaseDate: '2022-04-04', cores: 6, threads: 12, baseClockGhz: 3.6, boostClockGhz: 4.2, l3CacheMb: 16, socket: 'AM4', gb6Single: 2000, gb6Multi: 8900, passmark: 19500, cb23Multi: 10200 },
  { slug: 'amd-ryzen-9-3900x', manufacturer: 'AMD', modelName: 'Ryzen 9 3900X', generation: 3, architecture: 'Zen 2', processNm: 7, tdpWatts: 105, msrpUsd: 499, releaseDate: '2019-07-07', cores: 12, threads: 24, baseClockGhz: 3.8, boostClockGhz: 4.6, l3CacheMb: 64, socket: 'AM4', gb6Single: 1850, gb6Multi: 11800, passmark: 32500, cb23Multi: 18000 },
  { slug: 'amd-ryzen-7-3700x', manufacturer: 'AMD', modelName: 'Ryzen 7 3700X', generation: 3, architecture: 'Zen 2', processNm: 7, tdpWatts: 65, msrpUsd: 329, releaseDate: '2019-07-07', cores: 8, threads: 16, baseClockGhz: 3.6, boostClockGhz: 4.4, l3CacheMb: 32, socket: 'AM4', gb6Single: 1800, gb6Multi: 8600, passmark: 22500, cb23Multi: 12000 },
  { slug: 'amd-ryzen-5-3600', manufacturer: 'AMD', modelName: 'Ryzen 5 3600', generation: 3, architecture: 'Zen 2', processNm: 7, tdpWatts: 65, msrpUsd: 199, releaseDate: '2019-07-07', cores: 6, threads: 12, baseClockGhz: 3.6, boostClockGhz: 4.2, l3CacheMb: 32, socket: 'AM4', gb6Single: 1750, gb6Multi: 7200, passmark: 17800, cb23Multi: 9000 },
  { slug: 'amd-ryzen-5-4500', manufacturer: 'AMD', modelName: 'Ryzen 5 4500', generation: 4, architecture: 'Zen 2', processNm: 7, tdpWatts: 65, msrpUsd: 79, releaseDate: '2022-04-04', cores: 6, threads: 12, baseClockGhz: 3.6, boostClockGhz: 4.1, l3CacheMb: 8, socket: 'AM4', gb6Single: 1650, gb6Multi: 6800, passmark: 15500, cb23Multi: 8200 },
  { slug: 'intel-core-i9-10900k', manufacturer: 'INTEL', modelName: 'Core i9-10900K', generation: 10, architecture: 'Comet Lake', processNm: 14, tdpWatts: 125, msrpUsd: 488, releaseDate: '2020-05-20', cores: 10, threads: 20, baseClockGhz: 3.7, boostClockGhz: 5.3, l3CacheMb: 20, socket: 'LGA1200', gb6Single: 1950, gb6Multi: 11200, passmark: 24000, cb23Multi: 15500 },
  { slug: 'intel-core-i7-10700k', manufacturer: 'INTEL', modelName: 'Core i7-10700K', generation: 10, architecture: 'Comet Lake', processNm: 14, tdpWatts: 125, msrpUsd: 374, releaseDate: '2020-05-20', cores: 8, threads: 16, baseClockGhz: 3.8, boostClockGhz: 5.1, l3CacheMb: 16, socket: 'LGA1200', gb6Single: 1900, gb6Multi: 9200, passmark: 19500, cb23Multi: 13000 },
  { slug: 'intel-core-i5-10400f', manufacturer: 'INTEL', modelName: 'Core i5-10400F', generation: 10, architecture: 'Comet Lake', processNm: 14, tdpWatts: 65, msrpUsd: 155, releaseDate: '2020-05-20', cores: 6, threads: 12, baseClockGhz: 2.9, boostClockGhz: 4.3, l3CacheMb: 12, socket: 'LGA1200', gb6Single: 1650, gb6Multi: 6900, passmark: 13000, cb23Multi: 8500 },
  { slug: 'intel-core-i3-10100f', manufacturer: 'INTEL', modelName: 'Core i3-10100F', generation: 10, architecture: 'Comet Lake', processNm: 14, tdpWatts: 65, msrpUsd: 79, releaseDate: '2020-05-20', cores: 4, threads: 8, baseClockGhz: 3.6, boostClockGhz: 4.3, l3CacheMb: 6, socket: 'LGA1200', gb6Single: 1550, gb6Multi: 4600, passmark: 9000, cb23Multi: 5200 },
  { slug: 'intel-core-i5-12600k', manufacturer: 'INTEL', modelName: 'Core i5-12600K', generation: 12, architecture: 'Alder Lake', processNm: 10, tdpWatts: 125, msrpUsd: 289, releaseDate: '2021-11-04', cores: 10, threads: 16, baseClockGhz: 3.7, boostClockGhz: 4.9, l3CacheMb: 20, socket: 'LGA1700', gb6Single: 2600, gb6Multi: 12500, passmark: 28000, cb23Multi: 17000 },
  { slug: 'amd-ryzen-7-7700', manufacturer: 'AMD', modelName: 'Ryzen 7 7700', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 65, msrpUsd: 329, releaseDate: '2023-01-10', cores: 8, threads: 16, baseClockGhz: 3.8, boostClockGhz: 5.3, l3CacheMb: 32, socket: 'AM5', gb6Single: 2720, gb6Multi: 14200, passmark: 35000, cb23Multi: 19000 },
  { slug: 'amd-ryzen-5-7500f', manufacturer: 'AMD', modelName: 'Ryzen 5 7500F', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 65, msrpUsd: 179, releaseDate: '2023-08-01', cores: 6, threads: 12, baseClockGhz: 3.7, boostClockGhz: 5.0, l3CacheMb: 32, socket: 'AM5', gb6Single: 2600, gb6Multi: 12000, passmark: 27000, cb23Multi: 14500 },
  { slug: 'amd-ryzen-5-8500g', manufacturer: 'AMD', modelName: 'Ryzen 5 8500G', generation: 8, architecture: 'Zen 4', processNm: 4, tdpWatts: 65, msrpUsd: 179, releaseDate: '2024-01-31', cores: 6, threads: 12, baseClockGhz: 3.5, boostClockGhz: 5.0, l3CacheMb: 16, socket: 'AM5', gb6Single: 2350, gb6Multi: 9200, passmark: 19500, cb23Multi: 11500 },
  { slug: 'amd-ryzen-threadripper-pro-7995wx', manufacturer: 'AMD', modelName: 'Ryzen Threadripper PRO 7995WX', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 350, msrpUsd: 9999, releaseDate: '2023-10-19', cores: 96, threads: 192, baseClockGhz: 2.5, boostClockGhz: 5.1, l3CacheMb: 384, socket: 'sWRX8', gb6Single: 2700, gb6Multi: 30000, passmark: 160000, cb23Multi: 175000 },
  { slug: 'amd-ryzen-threadripper-pro-7975wx', manufacturer: 'AMD', modelName: 'Ryzen Threadripper PRO 7975WX', generation: 7, architecture: 'Zen 4', processNm: 5, tdpWatts: 350, msrpUsd: 3299, releaseDate: '2023-10-19', cores: 32, threads: 64, baseClockGhz: 4.0, boostClockGhz: 5.3, l3CacheMb: 128, socket: 'sWRX8', gb6Single: 2820, gb6Multi: 26000, passmark: 98000, cb23Multi: 75000 },
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
  { slug: 'nvidia-geforce-rtx-4080', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 4080', generation: 40, architecture: 'Ada Lovelace', processNm: 4, tdpWatts: 320, msrpUsd: 1199, releaseDate: '2022-11-16', shaderUnits: 9728, vramGb: 16, vramType: 'GDDR6X', memoryBusBits: 256, memoryBandwidthGbps: 717, baseClockMhz: 2205, boostClockMhz: 2505, g3dMark: 33500, blenderGpu: 9800 },
  { slug: 'nvidia-geforce-rtx-4070-ti-super', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 4070 Ti SUPER', generation: 40, architecture: 'Ada Lovelace', processNm: 4, tdpWatts: 285, msrpUsd: 799, releaseDate: '2024-01-24', shaderUnits: 8448, vramGb: 16, vramType: 'GDDR6X', memoryBusBits: 256, memoryBandwidthGbps: 672, baseClockMhz: 2340, boostClockMhz: 2610, g3dMark: 31000, blenderGpu: 8600 },
  { slug: 'nvidia-geforce-rtx-4070-super', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 4070 SUPER', generation: 40, architecture: 'Ada Lovelace', processNm: 4, tdpWatts: 220, msrpUsd: 599, releaseDate: '2024-01-17', shaderUnits: 7168, vramGb: 12, vramType: 'GDDR6X', memoryBusBits: 192, memoryBandwidthGbps: 504, baseClockMhz: 1980, boostClockMhz: 2475, g3dMark: 29000, blenderGpu: 7700 },
  { slug: 'nvidia-geforce-rtx-4060-ti', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 4060 Ti', generation: 40, architecture: 'Ada Lovelace', processNm: 4, tdpWatts: 160, msrpUsd: 399, releaseDate: '2023-05-24', shaderUnits: 4352, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbps: 288, baseClockMhz: 2310, boostClockMhz: 2535, g3dMark: 21500, blenderGpu: 5700 },
  { slug: 'nvidia-geforce-rtx-3090', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 3090', generation: 30, architecture: 'Ampere', processNm: 8, tdpWatts: 350, msrpUsd: 1499, releaseDate: '2020-09-24', shaderUnits: 10496, vramGb: 24, vramType: 'GDDR6X', memoryBusBits: 384, memoryBandwidthGbps: 936, baseClockMhz: 1395, boostClockMhz: 1695, g3dMark: 26500, blenderGpu: 7200 },
  { slug: 'nvidia-geforce-rtx-3070', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 3070', generation: 30, architecture: 'Ampere', processNm: 8, tdpWatts: 220, msrpUsd: 499, releaseDate: '2020-10-29', shaderUnits: 5888, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 448, baseClockMhz: 1500, boostClockMhz: 1725, g3dMark: 22000, blenderGpu: 4900 },
  { slug: 'nvidia-geforce-rtx-3060-ti', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 3060 Ti', generation: 30, architecture: 'Ampere', processNm: 8, tdpWatts: 200, msrpUsd: 399, releaseDate: '2020-12-02', shaderUnits: 4864, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 448, baseClockMhz: 1410, boostClockMhz: 1665, g3dMark: 20000, blenderGpu: 4300 },
  { slug: 'nvidia-geforce-rtx-3050', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 3050', generation: 30, architecture: 'Ampere', processNm: 8, tdpWatts: 130, msrpUsd: 249, releaseDate: '2022-01-27', shaderUnits: 2560, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbps: 224, baseClockMhz: 1552, boostClockMhz: 1777, g3dMark: 12500, blenderGpu: 2100 },
  { slug: 'amd-radeon-rx-7900-xt', manufacturer: 'AMD', modelName: 'Radeon RX 7900 XT', generation: 7, architecture: 'RDNA 3', processNm: 5, tdpWatts: 315, msrpUsd: 899, releaseDate: '2022-12-13', shaderUnits: 5376, vramGb: 20, vramType: 'GDDR6', memoryBusBits: 320, memoryBandwidthGbps: 800, baseClockMhz: 1500, boostClockMhz: 2400, g3dMark: 28500, blenderGpu: 4200 },
  { slug: 'amd-radeon-rx-7900-gre', manufacturer: 'AMD', modelName: 'Radeon RX 7900 GRE', generation: 7, architecture: 'RDNA 3', processNm: 5, tdpWatts: 260, msrpUsd: 549, releaseDate: '2024-02-27', shaderUnits: 5120, vramGb: 16, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 576, baseClockMhz: 1270, boostClockMhz: 2245, g3dMark: 24500, blenderGpu: 3800 },
  { slug: 'amd-radeon-rx-7700-xt', manufacturer: 'AMD', modelName: 'Radeon RX 7700 XT', generation: 7, architecture: 'RDNA 3', processNm: 5, tdpWatts: 245, msrpUsd: 449, releaseDate: '2023-09-06', shaderUnits: 3456, vramGb: 12, vramType: 'GDDR6', memoryBusBits: 192, memoryBandwidthGbps: 432, baseClockMhz: 1700, boostClockMhz: 2544, g3dMark: 20500, blenderGpu: 3100 },
  { slug: 'amd-radeon-rx-7600-xt', manufacturer: 'AMD', modelName: 'Radeon RX 7600 XT', generation: 7, architecture: 'RDNA 3', processNm: 6, tdpWatts: 190, msrpUsd: 329, releaseDate: '2024-01-24', shaderUnits: 2048, vramGb: 16, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbps: 288, baseClockMhz: 1720, boostClockMhz: 2755, g3dMark: 17200, blenderGpu: 2700 },
  { slug: 'amd-radeon-rx-6950-xt', manufacturer: 'AMD', modelName: 'Radeon RX 6950 XT', generation: 6, architecture: 'RDNA 2', processNm: 7, tdpWatts: 335, msrpUsd: 1099, releaseDate: '2022-05-10', shaderUnits: 5120, vramGb: 16, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 576, baseClockMhz: 1925, boostClockMhz: 2310, g3dMark: 24000, blenderGpu: 3400 },
  { slug: 'amd-radeon-rx-6800-xt', manufacturer: 'AMD', modelName: 'Radeon RX 6800 XT', generation: 6, architecture: 'RDNA 2', processNm: 7, tdpWatts: 300, msrpUsd: 649, releaseDate: '2020-11-18', shaderUnits: 4608, vramGb: 16, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 512, baseClockMhz: 1825, boostClockMhz: 2250, g3dMark: 21500, blenderGpu: 3000 },
  { slug: 'amd-radeon-rx-6600', manufacturer: 'AMD', modelName: 'Radeon RX 6600', generation: 6, architecture: 'RDNA 2', processNm: 7, tdpWatts: 132, msrpUsd: 329, releaseDate: '2021-10-13', shaderUnits: 1792, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbps: 224, baseClockMhz: 1626, boostClockMhz: 2491, g3dMark: 13800, blenderGpu: 1700 },
  { slug: 'intel-arc-a770', manufacturer: 'INTEL', modelName: 'Arc A770', generation: 1, architecture: 'Alchemist', processNm: 6, tdpWatts: 225, msrpUsd: 329, releaseDate: '2022-10-12', shaderUnits: 4096, vramGb: 16, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 560, baseClockMhz: 2100, boostClockMhz: 2400, g3dMark: 14500, blenderGpu: 2700 },
  { slug: 'intel-arc-b570', manufacturer: 'INTEL', modelName: 'Arc B570', generation: 2, architecture: 'Battlemage', processNm: 5, tdpWatts: 150, msrpUsd: 219, releaseDate: '2025-01-16', shaderUnits: 2304, vramGb: 10, vramType: 'GDDR6', memoryBusBits: 160, memoryBandwidthGbps: 380, baseClockMhz: 2500, boostClockMhz: 2600, g3dMark: 17000, blenderGpu: 2500 },
  { slug: 'nvidia-geforce-rtx-2080-ti', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 2080 Ti', generation: 20, architecture: 'Turing', processNm: 12, tdpWatts: 250, msrpUsd: 999, releaseDate: '2018-09-27', shaderUnits: 4352, vramGb: 11, vramType: 'GDDR6', memoryBusBits: 352, memoryBandwidthGbps: 616, baseClockMhz: 1350, boostClockMhz: 1545, g3dMark: 21500, blenderGpu: 3800 },
  { slug: 'nvidia-geforce-rtx-2070-super', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 2070 SUPER', generation: 20, architecture: 'Turing', processNm: 12, tdpWatts: 215, msrpUsd: 499, releaseDate: '2019-07-09', shaderUnits: 2560, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 448, baseClockMhz: 1605, boostClockMhz: 1770, g3dMark: 17500, blenderGpu: 2900 },
  { slug: 'nvidia-geforce-rtx-2060', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 2060', generation: 20, architecture: 'Turing', processNm: 12, tdpWatts: 160, msrpUsd: 349, releaseDate: '2019-01-15', shaderUnits: 1920, vramGb: 6, vramType: 'GDDR6', memoryBusBits: 192, memoryBandwidthGbps: 336, baseClockMhz: 1365, boostClockMhz: 1680, g3dMark: 14000, blenderGpu: 2200 },
  { slug: 'nvidia-geforce-gtx-1660-super', manufacturer: 'NVIDIA', modelName: 'GeForce GTX 1660 SUPER', generation: 16, architecture: 'Turing', processNm: 12, tdpWatts: 125, msrpUsd: 229, releaseDate: '2019-10-29', shaderUnits: 1408, vramGb: 6, vramType: 'GDDR6', memoryBusBits: 192, memoryBandwidthGbps: 336, baseClockMhz: 1530, boostClockMhz: 1785, g3dMark: 11500, blenderGpu: 1400 },
  { slug: 'nvidia-geforce-gtx-1650', manufacturer: 'NVIDIA', modelName: 'GeForce GTX 1650', generation: 16, architecture: 'Turing', processNm: 12, tdpWatts: 75, msrpUsd: 149, releaseDate: '2019-04-23', shaderUnits: 896, vramGb: 4, vramType: 'GDDR5', memoryBusBits: 128, memoryBandwidthGbps: 128, baseClockMhz: 1485, boostClockMhz: 1665, g3dMark: 7800, blenderGpu: 800 },
  { slug: 'amd-radeon-rx-5700-xt', manufacturer: 'AMD', modelName: 'Radeon RX 5700 XT', generation: 5, architecture: 'RDNA', processNm: 7, tdpWatts: 225, msrpUsd: 399, releaseDate: '2019-07-07', shaderUnits: 2560, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 448, baseClockMhz: 1605, boostClockMhz: 1905, g3dMark: 17800, blenderGpu: 2200 },
  { slug: 'amd-radeon-rx-6650-xt', manufacturer: 'AMD', modelName: 'Radeon RX 6650 XT', generation: 6, architecture: 'RDNA 2', processNm: 7, tdpWatts: 180, msrpUsd: 399, releaseDate: '2022-05-10', shaderUnits: 2048, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbps: 280, baseClockMhz: 2055, boostClockMhz: 2635, g3dMark: 15500, blenderGpu: 2000 },
  { slug: 'amd-radeon-rx-6500-xt', manufacturer: 'AMD', modelName: 'Radeon RX 6500 XT', generation: 6, architecture: 'RDNA 2', processNm: 6, tdpWatts: 107, msrpUsd: 199, releaseDate: '2022-01-19', shaderUnits: 1024, vramGb: 4, vramType: 'GDDR6', memoryBusBits: 64, memoryBandwidthGbps: 144, baseClockMhz: 2310, boostClockMhz: 2815, g3dMark: 9000, blenderGpu: 1100 },
  { slug: 'nvidia-geforce-gtx-1080-ti', manufacturer: 'NVIDIA', modelName: 'GeForce GTX 1080 Ti', generation: 10, architecture: 'Pascal', processNm: 16, tdpWatts: 250, msrpUsd: 699, releaseDate: '2017-03-10', shaderUnits: 3584, vramGb: 11, vramType: 'GDDR5X', memoryBusBits: 352, memoryBandwidthGbps: 484, baseClockMhz: 1480, boostClockMhz: 1582, g3dMark: 15000, blenderGpu: 1600 },
  { slug: 'nvidia-geforce-gtx-1070', manufacturer: 'NVIDIA', modelName: 'GeForce GTX 1070', generation: 10, architecture: 'Pascal', processNm: 16, tdpWatts: 150, msrpUsd: 379, releaseDate: '2016-06-10', shaderUnits: 1920, vramGb: 8, vramType: 'GDDR5', memoryBusBits: 256, memoryBandwidthGbps: 256, baseClockMhz: 1506, boostClockMhz: 1683, g3dMark: 9800, blenderGpu: 950 },
  { slug: 'amd-radeon-rx-580', manufacturer: 'AMD', modelName: 'Radeon RX 580', generation: 5, architecture: 'Polaris', processNm: 14, tdpWatts: 185, msrpUsd: 229, releaseDate: '2017-04-18', shaderUnits: 2304, vramGb: 8, vramType: 'GDDR5', memoryBusBits: 256, memoryBandwidthGbps: 256, baseClockMhz: 1257, boostClockMhz: 1340, g3dMark: 8800, blenderGpu: 700 },
  { slug: 'amd-radeon-rx-9070-gre', manufacturer: 'AMD', modelName: 'Radeon RX 9070 GRE', generation: 9, architecture: 'RDNA 4', processNm: 4, tdpWatts: 220, msrpUsd: 549, releaseDate: '2025-05-19', shaderUnits: 3072, vramGb: 12, vramType: 'GDDR6', memoryBusBits: 192, memoryBandwidthGbps: 528, baseClockMhz: 2000, boostClockMhz: 2790, g3dMark: 24000, blenderGpu: 3800 },
  { slug: 'amd-radeon-rx-9060-xt-16gb', manufacturer: 'AMD', modelName: 'Radeon RX 9060 XT 16GB', generation: 9, architecture: 'RDNA 4', processNm: 4, tdpWatts: 160, msrpUsd: 349, releaseDate: '2025-06-05', shaderUnits: 2048, vramGb: 16, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbps: 320, baseClockMhz: 2530, boostClockMhz: 3130, g3dMark: 19000, blenderGpu: 3000 },
  { slug: 'amd-radeon-rx-9060-xt-8gb', manufacturer: 'AMD', modelName: 'Radeon RX 9060 XT 8GB', generation: 9, architecture: 'RDNA 4', processNm: 4, tdpWatts: 150, msrpUsd: 299, releaseDate: '2025-06-05', shaderUnits: 2048, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 128, memoryBandwidthGbps: 320, baseClockMhz: 2530, boostClockMhz: 3130, g3dMark: 18500, blenderGpu: 3000 },
  { slug: 'nvidia-geforce-rtx-3090-ti', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 3090 Ti', generation: 30, architecture: 'Ampere', processNm: 8, tdpWatts: 450, msrpUsd: 1999, releaseDate: '2022-03-29', shaderUnits: 10752, vramGb: 24, vramType: 'GDDR6X', memoryBusBits: 384, memoryBandwidthGbps: 1008, baseClockMhz: 1560, boostClockMhz: 1860, g3dMark: 28000, blenderGpu: 7800 },
  { slug: 'nvidia-geforce-rtx-3080-ti', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 3080 Ti', generation: 30, architecture: 'Ampere', processNm: 8, tdpWatts: 350, msrpUsd: 1199, releaseDate: '2021-06-03', shaderUnits: 10240, vramGb: 12, vramType: 'GDDR6X', memoryBusBits: 384, memoryBandwidthGbps: 912, baseClockMhz: 1365, boostClockMhz: 1665, g3dMark: 26000, blenderGpu: 7000 },
  { slug: 'nvidia-geforce-rtx-3070-ti', manufacturer: 'NVIDIA', modelName: 'GeForce RTX 3070 Ti', generation: 30, architecture: 'Ampere', processNm: 8, tdpWatts: 290, msrpUsd: 599, releaseDate: '2021-06-10', shaderUnits: 6144, vramGb: 8, vramType: 'GDDR6X', memoryBusBits: 256, memoryBandwidthGbps: 608, baseClockMhz: 1575, boostClockMhz: 1770, g3dMark: 23000, blenderGpu: 5100 },
  { slug: 'nvidia-titan-rtx', manufacturer: 'NVIDIA', modelName: 'Titan RTX', generation: 20, architecture: 'Turing', processNm: 12, tdpWatts: 280, msrpUsd: 2499, releaseDate: '2018-12-18', shaderUnits: 4608, vramGb: 24, vramType: 'GDDR6', memoryBusBits: 384, memoryBandwidthGbps: 672, baseClockMhz: 1350, boostClockMhz: 1770, g3dMark: 23000, blenderGpu: 4400 },
  { slug: 'nvidia-rtx-6000-ada', manufacturer: 'NVIDIA', modelName: 'RTX 6000 Ada Generation', generation: 40, architecture: 'Ada Lovelace', processNm: 4, tdpWatts: 300, msrpUsd: 6800, releaseDate: '2022-12-03', shaderUnits: 18176, vramGb: 48, vramType: 'GDDR6', memoryBusBits: 384, memoryBandwidthGbps: 960, baseClockMhz: 915, boostClockMhz: 2505, g3dMark: 38000, blenderGpu: 12500 },
  { slug: 'nvidia-rtx-a6000', manufacturer: 'NVIDIA', modelName: 'RTX A6000', generation: 30, architecture: 'Ampere', processNm: 8, tdpWatts: 300, msrpUsd: 4650, releaseDate: '2020-10-05', shaderUnits: 10752, vramGb: 48, vramType: 'GDDR6', memoryBusBits: 384, memoryBandwidthGbps: 768, baseClockMhz: 1410, boostClockMhz: 1800, g3dMark: 27000, blenderGpu: 7000 },
  { slug: 'amd-radeon-pro-w7900', manufacturer: 'AMD', modelName: 'Radeon Pro W7900', generation: 7, architecture: 'RDNA 3', processNm: 5, tdpWatts: 295, msrpUsd: 3999, releaseDate: '2023-04-01', shaderUnits: 6144, vramGb: 48, vramType: 'GDDR6', memoryBusBits: 384, memoryBandwidthGbps: 864, baseClockMhz: 1500, boostClockMhz: 2500, g3dMark: 31000, blenderGpu: 4800 },
  { slug: 'intel-arc-a580', manufacturer: 'INTEL', modelName: 'Arc A580', generation: 1, architecture: 'Alchemist', processNm: 6, tdpWatts: 175, msrpUsd: 179, releaseDate: '2023-10-10', shaderUnits: 3072, vramGb: 8, vramType: 'GDDR6', memoryBusBits: 256, memoryBandwidthGbps: 512, baseClockMhz: 1700, boostClockMhz: 2000, g3dMark: 12500, blenderGpu: 2200 },
  { slug: 'intel-arc-a380', manufacturer: 'INTEL', modelName: 'Arc A380', generation: 1, architecture: 'Alchemist', processNm: 6, tdpWatts: 75, msrpUsd: 139, releaseDate: '2022-06-15', shaderUnits: 1024, vramGb: 6, vramType: 'GDDR6', memoryBusBits: 96, memoryBandwidthGbps: 186, baseClockMhz: 2000, boostClockMhz: 2450, g3dMark: 5500, blenderGpu: 1100 },
];
/* eslint-enable max-len */

// Real Indonesian street prices (Rp), keyed by slug — snapshot from a local
// retailer (enterkomputer). Shown directly in Rp mode; parts not listed here
// fall back to USD × reference rate. Extend per category over time.
const PRICE_IDR: Record<string, number> = {
  // Intel CPUs
  'intel-core-ultra-9-285k': 12040000,
  'intel-core-ultra-7-265k': 5800000,
  'intel-core-ultra-5-245k': 3899000,
  'intel-core-i9-14900k': 8815000,
  'intel-core-i7-14700k': 6770000,
  'intel-core-i5-14600k': 4570000,
  'intel-core-i5-14400f': 3150000,
  'intel-core-i3-14100f': 1785000,
  'intel-core-i9-12900k': 7445000,
  'intel-core-i7-12700k': 5249000,
  'intel-core-i5-12600k': 3995000,
  'intel-core-i5-12400f': 2585000,
  'intel-core-i3-12100f': 1569000,
  'intel-core-i5-13400f': 3150000,
  'intel-core-i5-11400f': 1795000,
  'intel-core-i5-10400f': 2229000,
  // AMD CPUs
  'amd-ryzen-9-9950x3d': 13135000,
  'amd-ryzen-9-9950x': 11250000,
  'amd-ryzen-9-9900x3d': 11450000,
  'amd-ryzen-9-9900x': 7990000,
  'amd-ryzen-7-9800x3d': 8659000,
  'amd-ryzen-7-9700x': 5975000,
  'amd-ryzen-5-9600x': 4160000,
  'amd-ryzen-9-7900x': 7450000,
  'amd-ryzen-7-7800x3d': 7545000,
  'amd-ryzen-7-7700x': 5850000,
  'amd-ryzen-7-7700': 5235000,
  'amd-ryzen-5-7600x': 3809000,
  'amd-ryzen-5-7600': 2595000,
  'amd-ryzen-5-7500f': 2339000,
  'amd-ryzen-7-8700g': 5050000,
  'amd-ryzen-5-8600g': 3325000,
  'amd-ryzen-5-8500g': 2699000,
  'amd-ryzen-9-5900x': 5529000,
  'amd-ryzen-7-5800x3d': 7095000,
  'amd-ryzen-7-5700x': 3649000,
  'amd-ryzen-7-5700g': 3890000,
  'amd-ryzen-5-5600gt': 2670000,
  'amd-ryzen-5-5600g': 2575000,
  'amd-ryzen-5-5600': 2320000,
  'amd-ryzen-5-5500gt': 2369000,
  'amd-ryzen-5-5500': 1625000,
  'amd-ryzen-threadripper-7960x': 26100000,
  'amd-ryzen-threadripper-7970x': 46215000,
  'amd-ryzen-threadripper-7980x': 93015000,
  // GPUs (cheapest in-stock AIB variant across brands @ enterkomputer)
  'nvidia-geforce-rtx-5090': 63000000,
  'nvidia-geforce-rtx-5080': 29500000,
  'nvidia-geforce-rtx-5070-ti': 22820000,
  'nvidia-geforce-rtx-5070': 16100000,
  'nvidia-geforce-rtx-5060-ti': 9850000,
  'nvidia-geforce-rtx-5060': 8550000,
  'nvidia-geforce-rtx-4070-super': 11200000,
  'nvidia-geforce-rtx-4070': 9900000,
  'nvidia-geforce-rtx-4060-ti': 6850000,
  'nvidia-geforce-rtx-4060': 5080000,
  'nvidia-geforce-rtx-3060': 4670000,
  'nvidia-geforce-rtx-3050': 4750000,
  'nvidia-geforce-gtx-1650': 2050000,
  'amd-radeon-rx-9070-xt': 15190000,
  'amd-radeon-rx-9070-gre': 10900000,
  'amd-radeon-rx-9070': 12450000,
  'amd-radeon-rx-9060-xt-16gb': 9640000,
  'amd-radeon-rx-9060-xt-8gb': 5780000,
  'amd-radeon-rx-7900-xtx': 18155000,
  'amd-radeon-rx-7800-xt': 8500000,
  'amd-radeon-rx-7600': 6290000,
  'amd-radeon-rx-6600': 3350000,
  'amd-radeon-rx-6500-xt': 2165000,
  'amd-radeon-rx-580': 2850000,
  'intel-arc-b580': 4950000,
  'intel-arc-b570': 3950000,
  'intel-arc-a380': 2889000,
};

const now = new Date();

async function seedCpu(c: CpuSeed) {
  const releaseDate = new Date(c.releaseDate);
  const proc = await prisma.processor.upsert({
    where: { slug: c.slug },
    update: {
      msrpUsd: c.msrpUsd,
      tdpWatts: c.tdpWatts,
      releaseDate,
      priceIdr: PRICE_IDR[c.slug] ?? null,
    },
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
      priceIdr: PRICE_IDR[c.slug] ?? null,
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
    update: {
      msrpUsd: g.msrpUsd,
      tdpWatts: g.tdpWatts,
      releaseDate,
      priceIdr: PRICE_IDR[g.slug] ?? null,
    },
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
      priceIdr: PRICE_IDR[g.slug] ?? null,
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
