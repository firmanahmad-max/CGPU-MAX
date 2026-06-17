import { Router } from 'express';

import { requireAuth } from '../../../shared/auth/middleware.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { GetMySubscription } from '../application/GetMySubscription.js';
import { TIER_LIMITS } from '../domain/TierPolicy.js';

const getMine = new GetMySubscription(prisma);

export const subscriptionsRouter = Router();

subscriptionsRouter.get('/tiers', (_req, res) => {
  res.json({ tiers: TIER_LIMITS });
});

subscriptionsRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await getMine.execute(req.auth!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
