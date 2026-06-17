import { Router } from 'express';

import { registry } from './metrics.js';

export const metricsRouter = Router();

// Prometheus scrape endpoint. Kept unauthenticated and outside the tier rate
// limiter so a scraper can poll it; restrict at the network layer in prod.
metricsRouter.get('/', async (_req, res, next) => {
  try {
    res.set('Content-Type', registry.contentType);
    res.end(await registry.metrics());
  } catch (err) {
    next(err);
  }
});
