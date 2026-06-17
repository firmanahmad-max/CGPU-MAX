import { Router } from 'express';

import { requireAuth } from '../../../shared/auth/middleware.js';
import { requireFeature } from '../../../shared/auth/requireFeature.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { GetPriceHistory } from '../application/GetPriceHistory.js';
import { ManagePriceAlerts } from '../application/ManagePriceAlerts.js';

import {
  alertIdParam,
  createAlertBody,
  historyQuery,
  slugParam,
} from './validators.js';

const history = new GetPriceHistory(prisma);
const alerts = new ManagePriceAlerts(prisma);

export const pricingRouter = Router();

// Price history is public (read-only, cached).
pricingRouter.get('/history/:slug', async (req, res, next) => {
  try {
    const { slug } = slugParam.parse(req.params);
    const { days } = historyQuery.parse(req.query);
    res.json(await history.execute(slug, days));
  } catch (err) {
    next(err);
  }
});

// Alerts are a Pro feature.
pricingRouter.get('/alerts', requireAuth, requireFeature('priceTracking'), async (req, res, next) => {
  try {
    res.json({ alerts: await alerts.list(req.auth!) });
  } catch (err) {
    next(err);
  }
});

pricingRouter.post(
  '/alerts',
  requireAuth,
  requireFeature('priceTracking'),
  async (req, res, next) => {
    try {
      const body = createAlertBody.parse(req.body);
      res.status(201).json(await alerts.create(req.auth!, body));
    } catch (err) {
      next(err);
    }
  },
);

pricingRouter.delete(
  '/alerts/:id',
  requireAuth,
  requireFeature('priceTracking'),
  async (req, res, next) => {
    try {
      const { id } = alertIdParam.parse(req.params);
      res.json(await alerts.delete(req.auth!, id));
    } catch (err) {
      next(err);
    }
  },
);
