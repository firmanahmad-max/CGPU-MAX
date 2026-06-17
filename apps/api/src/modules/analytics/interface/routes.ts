import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../../../shared/persistence/prisma.js';
import { GetTrending } from '../application/GetTrending.js';

const trending = new GetTrending(prisma);
const limitQuery = z.object({ limit: z.coerce.number().int().min(1).max(50).default(10) });

export const analyticsRouter = Router();

// Public, cached aggregates — safe to expose and CDN-friendly.
analyticsRouter.get('/trending', async (req, res, next) => {
  try {
    const { limit } = limitQuery.parse(req.query);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(await trending.processors(limit));
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/popular-comparisons', async (req, res, next) => {
  try {
    const { limit } = limitQuery.parse(req.query);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(await trending.comparisons(limit));
  } catch (err) {
    next(err);
  }
});
