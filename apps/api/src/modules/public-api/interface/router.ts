import { Router } from 'express';

import { apiKeyAuth } from '../../../shared/auth/apiKeyMiddleware.js';
import { requireFeature } from '../../../shared/auth/requireFeature.js';
import { tieredRateLimiter } from '../../../shared/middleware/tieredRateLimit.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { analyticsStore } from '../../analytics/infrastructure/AnalyticsStore.js';
import { CalculateBottleneck } from '../../bottleneck/application/CalculateBottleneck.js';
import { calculateBody } from '../../bottleneck/interface/validators.js';
import { CompareProcessors } from '../../comparisons/application/CompareProcessors.js';
import { compareBody } from '../../comparisons/interface/validators.js';
import { GetProcessorBySlug } from '../../processors/application/GetProcessorBySlug.js';
import { ListProcessors } from '../../processors/application/ListProcessors.js';
import { PrismaProcessorRepository } from '../../processors/infrastructure/PrismaProcessorRepository.js';
import { listProcessorsQuery, slugParam } from '../../processors/interface/validators.js';
import { buildOpenApiSpec } from '../openapi.js';

const repo = new PrismaProcessorRepository(prisma);
const listProcessors = new ListProcessors(repo);
const getProcessor = new GetProcessorBySlug(repo);
const compare = new CompareProcessors(prisma);
const bottleneck = new CalculateBottleneck(prisma);

export const publicApiRouter = Router();

// OpenAPI document is public so developers can read the docs without a key.
publicApiRouter.get('/openapi.json', (_req, res) => {
  res.json(buildOpenApiSpec());
});

// Everything else: API-key auth → Enterprise feature gate → per-tier rate limit.
publicApiRouter.use(apiKeyAuth, requireFeature('apiAccess'), tieredRateLimiter());

publicApiRouter.get('/processors', async (req, res, next) => {
  try {
    res.json(await listProcessors.execute(listProcessorsQuery.parse(req.query)));
  } catch (err) {
    next(err);
  }
});

publicApiRouter.get('/processors/:slug', async (req, res, next) => {
  try {
    const { slug } = slugParam.parse(req.params);
    const result = await getProcessor.execute(slug);
    analyticsStore.recordProcessorView(slug);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

publicApiRouter.post('/comparisons', async (req, res, next) => {
  try {
    const body = compareBody.parse(req.body);
    const result = await compare.execute({ ...body, auth: req.auth });
    if (result.shareSlug) analyticsStore.recordComparison(result.shareSlug);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

publicApiRouter.post('/bottleneck/calculate', async (req, res, next) => {
  try {
    const body = calculateBody.parse(req.body);
    res.json(await bottleneck.execute(body));
  } catch (err) {
    next(err);
  }
});
