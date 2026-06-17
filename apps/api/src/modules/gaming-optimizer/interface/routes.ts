import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../../../shared/auth/middleware.js';
import { requireFeature } from '../../../shared/auth/requireFeature.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { OptimizeGame } from '../application/OptimizeGame.js';

const slug = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9-]+$/);

const body = z.object({
  gpuSlug: slug,
  cpuSlug: slug.optional(),
  resolution: z.enum(['1080p', '1440p', '4K']),
  profile: z.enum(['esports', 'aaa', 'vr', 'simulation']),
});

const useCase = new OptimizeGame(prisma);

export const gamingRouter = Router();

gamingRouter.post(
  '/optimize',
  requireAuth,
  requireFeature('gamingOptimizer'),
  async (req, res, next) => {
    try {
      const input = body.parse(req.body);
      res.json(await useCase.execute(input));
    } catch (err) {
      next(err);
    }
  },
);
