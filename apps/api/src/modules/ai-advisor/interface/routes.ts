import { Router } from 'express';

import { requireAuth } from '../../../shared/auth/middleware.js';
import { requireFeature } from '../../../shared/auth/requireFeature.js';
import { NotFoundError } from '../../../shared/errors/AppError.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { GenerateBuildAdvice } from '../application/GenerateBuildAdvice.js';

import { adviceBody, shareSlugParam } from './validators.js';

const useCase = new GenerateBuildAdvice(prisma);

export const aiAdvisorRouter = Router();

// Pro-tier feature: requires auth + the aiAdvisor flag + monthly quota (enforced
// inside the use case).
aiAdvisorRouter.post(
  '/build',
  requireAuth,
  requireFeature('aiAdvisor'),
  async (req, res, next) => {
    try {
      const body = adviceBody.parse(req.body);
      const result = await useCase.execute(req.auth!, body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

// Owner-scoped retrieval of a saved build.
aiAdvisorRouter.get('/build/:shareSlug', requireAuth, async (req, res, next) => {
  try {
    const { shareSlug } = shareSlugParam.parse(req.params);
    const row = await prisma.savedBuild.findUnique({ where: { shareSlug } });
    if (!row || row.ownerId !== req.auth!.userId) {
      throw new NotFoundError('Build', shareSlug);
    }
    res.json({ ...(row.payload as object), shareSlug, modelUsed: row.modelUsed });
  } catch (err) {
    next(err);
  }
});
