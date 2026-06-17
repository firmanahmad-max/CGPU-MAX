import { Router } from 'express';

import { prisma } from '../../../shared/persistence/prisma.js';
import { analyticsStore } from '../../analytics/infrastructure/AnalyticsStore.js';
import { GetProcessorBySlug } from '../application/GetProcessorBySlug.js';
import { ListProcessors } from '../application/ListProcessors.js';
import { PrismaProcessorRepository } from '../infrastructure/PrismaProcessorRepository.js';

import { listProcessorsQuery, slugParam } from './validators.js';

const repo = new PrismaProcessorRepository(prisma);
const listUseCase = new ListProcessors(repo);
const getUseCase = new GetProcessorBySlug(repo);

export const processorsRouter = Router();

processorsRouter.get('/', async (req, res, next) => {
  try {
    const filter = listProcessorsQuery.parse(req.query);
    const result = await listUseCase.execute(filter);
    // Spec: GET /api/processors edge-cacheable for ~6h.
    res.set('Cache-Control', 'public, max-age=21600');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

processorsRouter.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = slugParam.parse(req.params);
    const result = await getUseCase.execute(slug);
    analyticsStore.recordProcessorView(slug);
    res.set('Cache-Control', 'public, max-age=21600');
    res.json(result);
  } catch (err) {
    next(err);
  }
});
