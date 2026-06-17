import 'dotenv/config';

import { runPipeline } from '../ingestion/pipeline.js';
import { logger } from '../logging/logger.js';
import { prisma } from '../persistence/prisma.js';

async function main() {
  const result = await runPipeline();
  logger.info({ result }, 'One-shot pipeline complete');
  await prisma.$disconnect();
}

main().catch((err) => {
  logger.fatal({ err }, 'One-shot pipeline failed');
  process.exit(1);
});
