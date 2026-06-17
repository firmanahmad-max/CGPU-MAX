import type { IncomingMessage } from 'node:http';

import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import { pinoHttp, type Options } from 'pino-http';

import { aiAdvisorRouter } from './modules/ai-advisor/interface/routes.js';
import { apiKeysRouter } from './modules/api-keys/interface/routes.js';
import { billingRouter, billingWebhookRouter } from './modules/billing/interface/routes.js';
import { bottleneckRouter } from './modules/bottleneck/interface/routes.js';
import { comparisonsRouter } from './modules/comparisons/interface/routes.js';
import { gamingRouter } from './modules/gaming-optimizer/interface/routes.js';
import { pricingRouter } from './modules/pricing/interface/routes.js';
import { processorsRouter } from './modules/processors/interface/routes.js';
import { publicApiRouter } from './modules/public-api/interface/router.js';
import { reportsRouter } from './modules/reports/interface/routes.js';
import { streamingRouter } from './modules/streaming/interface/routes.js';
import { subscriptionsRouter } from './modules/subscriptions/interface/routes.js';
import { withUser } from './shared/auth/middleware.js';
import { env } from './shared/config/env.js';
import { healthRouter } from './shared/health/router.js';
import { logger } from './shared/logging/logger.js';
import { correlationId } from './shared/middleware/correlationId.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { tieredRateLimiter } from './shared/middleware/tieredRateLimit.js';

export function createServer(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(correlationId);
  // pino-http bundles its own pino types, which differ from our pino@9 copy by
  // a phantom type-param; the double-cast reconciles them (runtime unaffected).
  app.use(
    pinoHttp({
      logger,
      customProps: (req: IncomingMessage) => ({ correlationId: req.id }),
    } as unknown as Options),
  );
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(compression());

  // Stripe webhooks need the raw body for signature verification — mount
  // BEFORE express.json() so the raw payload is preserved.
  app.use('/api/v1/billing/webhook', billingWebhookRouter);

  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false }));

  // Brute-force protection — keep the slowDown even with the tiered limiter
  // since it targets a different signal (request density per IP).
  app.use(
    slowDown({
      windowMs: 15 * 60 * 1000,
      delayAfter: 50,
      delayMs: () => 500,
    }),
  );

  // Public Enterprise API: self-contained auth (API key) + per-key rate limit.
  // Mounted before the Clerk-oriented withUser/tieredRateLimiter so it isn't
  // double-limited or treated as anonymous.
  app.use('/api/public/v1', publicApiRouter);

  app.use(withUser);
  app.use(tieredRateLimiter());

  app.use('/health', healthRouter);
  app.use('/api/v1/processors', processorsRouter);
  app.use('/api/v1/comparisons', comparisonsRouter);
  app.use('/api/v1/bottleneck', bottleneckRouter);
  app.use('/api/v1/subscriptions', subscriptionsRouter);
  app.use('/api/v1/billing', billingRouter);
  app.use('/api/v1/advisor', aiAdvisorRouter);
  app.use('/api/v1/api-keys', apiKeysRouter);
  app.use('/api/v1/pricing', pricingRouter);
  app.use('/api/v1/gaming', gamingRouter);
  app.use('/api/v1/streaming', streamingRouter);
  app.use('/api/v1/reports', reportsRouter);

  app.use(errorHandler);
  return app;
}
