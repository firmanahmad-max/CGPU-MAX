import { Router } from 'express';

import { requireAuth } from '../../../shared/auth/middleware.js';
import { requireFeature } from '../../../shared/auth/requireFeature.js';
import { NotFoundError } from '../../../shared/errors/AppError.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { GenerateBuildAdvice } from '../application/GenerateBuildAdvice.js';
import { RecomputeBuildInsights } from '../application/RecomputeBuildInsights.js';

import { advisorDemoBypass } from './demoBypass.js';
import { adviceBody, recomputeBody, shareSlugParam } from './validators.js';

const useCase = new GenerateBuildAdvice(prisma);
const recompute = new RecomputeBuildInsights(prisma);

export const aiAdvisorRouter = Router();

// Pro-tier feature: requires auth + the aiAdvisor flag + monthly quota (enforced
// inside the use case).
aiAdvisorRouter.post(
  '/build',
  advisorDemoBypass,
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

// Compare two tiers (Value vs Premium) for the same requirements. Runs two
// generations in parallel; each counts against the AI quota like a build.
aiAdvisorRouter.post(
  '/compare',
  advisorDemoBypass,
  requireAuth,
  requireFeature('aiAdvisor'),
  async (req, res, next) => {
    try {
      const body = adviceBody.parse(req.body);
      const [value, premium] = await Promise.all([
        useCase.execute(req.auth!, { ...body, tier: 'value' }),
        useCase.execute(req.auth!, { ...body, tier: 'premium' }),
      ]);
      res.status(201).json({ value, premium });
    } catch (err) {
      next(err);
    }
  },
);

// Recompute deterministic insights for an edited parts list (interactive swap).
// Pro-gated like the generator, but does not call the AI or consume quota.
aiAdvisorRouter.post(
  '/insights',
  requireAuth,
  requireFeature('aiAdvisor'),
  async (req, res, next) => {
    try {
      const body = recomputeBody.parse(req.body);
      res.json(await recompute.execute(body));
    } catch (err) {
      next(err);
    }
  },
);

// Public, read-only view of a saved build (for sharing). Returns the build
// payload by its share slug with no owner info and no auth.
aiAdvisorRouter.get('/build/:shareSlug/shared', async (req, res, next) => {
  try {
    const { shareSlug } = shareSlugParam.parse(req.params);
    const row = await prisma.savedBuild.findUnique({ where: { shareSlug } });
    if (!row) throw new NotFoundError('Build', shareSlug);
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ ...(row.payload as object), shareSlug, modelUsed: row.modelUsed });
  } catch (err) {
    next(err);
  }
});

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
