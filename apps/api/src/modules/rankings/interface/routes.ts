import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../../../shared/persistence/prisma.js';
import { GetRankings } from '../application/GetRankings.js';

const useCase = new GetRankings(prisma);

const query = z.object({
  type: z.enum(['CPU', 'GPU']).default('CPU'),
  manufacturer: z.enum(['INTEL', 'AMD', 'NVIDIA']).optional(),
  sort: z.enum(['performance', 'value']).default('performance'),
  category: z.enum(['overall', 'gaming', 'productivity', 'workstation']).default('overall'),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const rankingsRouter = Router();

// Public, cached leaderboard of CPUs/GPUs by performance or price-performance.
rankingsRouter.get('/', async (req, res, next) => {
  try {
    const input = query.parse(req.query);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(await useCase.execute(input));
  } catch (err) {
    next(err);
  }
});
