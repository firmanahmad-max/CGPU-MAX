import { Router } from 'express';

import { redis } from '../cache/redis.js';
import { prisma } from '../persistence/prisma.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const checks: Record<string, { status: 'up' | 'down'; latencyMs?: number; error?: string }> = {};
  let allUp = true;

  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'up', latencyMs: Date.now() - dbStart };
  } catch (err) {
    allUp = false;
    checks.database = { status: 'down', error: (err as Error).message };
  }

  const redisStart = Date.now();
  try {
    await redis.ping();
    checks.redis = { status: 'up', latencyMs: Date.now() - redisStart };
  } catch (err) {
    allUp = false;
    checks.redis = { status: 'down', error: (err as Error).message };
  }

  res.status(allUp ? 200 : 503).json({
    status: allUp ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  });
});
