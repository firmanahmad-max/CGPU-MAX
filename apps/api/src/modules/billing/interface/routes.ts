import express, { Router } from 'express';
import type Stripe from 'stripe';

import { requireAuth } from '../../../shared/auth/middleware.js';
import { env } from '../../../shared/config/env.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { logger } from '../../../shared/logging/logger.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { CreateCheckoutSession } from '../application/CreateCheckoutSession.js';
import { CreatePortalSession } from '../application/CreatePortalSession.js';
import { HandleStripeWebhook } from '../application/HandleStripeWebhook.js';
import { stripe } from '../domain/StripeClient.js';

import { checkoutBody } from './validators.js';

const checkout = new CreateCheckoutSession(prisma);
const portal = new CreatePortalSession(prisma);
const webhook = new HandleStripeWebhook(prisma);

export const billingRouter = Router();

billingRouter.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    const body = checkoutBody.parse(req.body);
    const result = await checkout.execute({
      userId: req.auth!.userId,
      email: req.auth!.email,
      plan: body.plan,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

billingRouter.post('/portal', requireAuth, async (req, res, next) => {
  try {
    const result = await portal.execute(req.auth!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Webhook router is mounted SEPARATELY in server.ts (before express.json) so
// we can read the raw body for signature verification.
export const billingWebhookRouter = Router();

billingWebhookRouter.post(
  '/',
  express.raw({ type: 'application/json', limit: '1mb' }),
  async (req, res, next) => {
    try {
      const sig = req.headers['stripe-signature'];
      if (typeof sig !== 'string') {
        throw new AppError('MISSING_SIGNATURE', 'Stripe signature header missing', 400);
      }
      if (!env.STRIPE_WEBHOOK_SECRET) {
        throw new AppError(
          'WEBHOOK_NOT_CONFIGURED',
          'STRIPE_WEBHOOK_SECRET not set',
          503,
        );
      }

      let event: Stripe.Event;
      try {
        event = stripe().webhooks.constructEvent(
          req.body as Buffer,
          sig,
          env.STRIPE_WEBHOOK_SECRET,
        );
      } catch (err) {
        logger.warn({ err }, 'Stripe webhook signature verification failed');
        throw new AppError('INVALID_SIGNATURE', 'Invalid Stripe signature', 400);
      }

      const outcome = await webhook.execute(event);
      res.json({ received: true, ...outcome });
    } catch (err) {
      next(err);
    }
  },
);
