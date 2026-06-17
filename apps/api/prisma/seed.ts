import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Phase 1 seed: minimal sanity-check rows. Phase 2 will replace with real data
  // collection pipeline (cgpu-max-data-collector.js).
  const intelI9 = await prisma.processor.upsert({
    where: { slug: 'intel-core-i9-14900k' },
    update: {},
    create: {
      type: 'CPU',
      manufacturer: 'INTEL',
      modelName: 'Core i9-14900K',
      slug: 'intel-core-i9-14900k',
      codeName: 'Raptor Lake Refresh',
      generation: 14,
      architecture: 'Raptor Lake',
      processNm: 10,
      tdpWatts: 125,
      msrpUsd: 589.0,
      cpuSpecs: {
        create: {
          cores: 24,
          threads: 32,
          baseClockGhz: 3.2,
          boostClockGhz: 6.0,
          l3CacheMb: 36,
          socket: 'LGA1700',
          integratedGraphics: 'Intel UHD 770',
        },
      },
    },
  });

  const rtx4090 = await prisma.processor.upsert({
    where: { slug: 'nvidia-rtx-4090' },
    update: {},
    create: {
      type: 'GPU',
      manufacturer: 'NVIDIA',
      modelName: 'GeForce RTX 4090',
      slug: 'nvidia-rtx-4090',
      codeName: 'AD102',
      generation: 40,
      architecture: 'Ada Lovelace',
      processNm: 4,
      tdpWatts: 450,
      msrpUsd: 1599.0,
      gpuSpecs: {
        create: {
          shaderUnits: 16384,
          vramGb: 24,
          vramType: 'GDDR6X',
          memoryBusBits: 384,
          memoryBandwidthGbps: 1008,
          baseClockMhz: 2235,
          boostClockMhz: 2520,
          rayTracingCores: 128,
          tensorCores: 512,
        },
      },
    },
  });

  console.info('Seeded:', { intelI9: intelI9.slug, rtx4090: rtx4090.slug });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
