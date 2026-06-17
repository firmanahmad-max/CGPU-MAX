import type { PrismaClient } from '@prisma/client';
import type Stripe from 'stripe';

import { logger } from '../../../shared/logging/logger.js';
import { SyncSubscriptionFromStripe } from '../../subscriptions/application/SyncSubscriptionFromStripe.js';
import { stripe, tierFromPriceId } from '../domain/StripeClient.js';

// Webhook dispatcher. The pattern:
//   1. Verify signature (done by router before this code runs).
//   2. Persist event id → guarantees idempotency on Stripe retries.
//   3. Dispatch to a handler per event type.
//   4. Never throw 5xx for handled events; Stripe will retry which can cause
//      duplicate work even with idempotency (extra DB writes, log noise).
export class HandleStripeWebhook {
  private readonly sync: SyncSubscriptionFromStripe;

  constructor(private readonly prisma: PrismaClient) {
    this.sync = new SyncSubscriptionFromStripe(prisma);
  }

  async execute(event: Stripe.Event): Promise<{ handled: boolean; idempotent: boolean }> {
    const seen = await this.prisma.stripeWebhookEvent
      .create({
        data: {
          id: event.id,
          type: event.type,
          payload: event as unknown as object,
        },
      })
      .catch((err: unknown) => {
        // Unique violation → we've seen this event before. That's success.
        if (isUniqueViolation(err)) return null;
        throw err;
      });

    if (seen === null) {
      logger.info({ eventId: event.id, type: event.type }, 'Stripe event already processed');
      return { handled: true, idempotent: true };
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe().subscriptions.retrieve(subId);
          await this.sync.execute(sub, { tierFromPriceId });
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.sync.execute(sub, { tierFromPriceId });
        break;
      }
      case 'invoice.payment_failed': {
        logger.warn({ eventId: event.id }, 'Stripe payment failed — Stripe will retry');
        break;
      }
      default:
        logger.debug({ type: event.type }, 'Unhandled Stripe event type');
        return { handled: false, idempotent: false };
    }
    return { handled: true, idempotent: false };
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 'P2002'
  );
}
