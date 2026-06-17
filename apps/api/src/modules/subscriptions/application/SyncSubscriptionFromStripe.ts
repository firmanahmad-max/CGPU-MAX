import type { BillingInterval, PrismaClient, SubscriptionStatus } from '@prisma/client';
import type Stripe from 'stripe';

import { logger } from '../../../shared/logging/logger.js';

// Maps Stripe subscription status → our enum, and writes the row plus the
// derived `User.tier`. Idempotent — safe to call from any webhook.
export class SyncSubscriptionFromStripe {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(sub: Stripe.Subscription, opts: { tierFromPriceId: (priceId: string) => 'PRO' | 'ENTERPRISE' | null }) {
    const customerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });
    if (!user) {
      logger.warn({ customerId, subId: sub.id }, 'Subscription webhook for unknown user');
      return;
    }

    const item = sub.items.data[0];
    if (!item) {
      logger.warn({ subId: sub.id }, 'Subscription has no items');
      return;
    }
    const priceId = item.price.id;
    const tier = opts.tierFromPriceId(priceId);
    if (!tier) {
      logger.warn({ priceId }, 'Unknown Stripe price id — leaving tier unchanged');
      return;
    }

    const interval: BillingInterval = item.price.recurring?.interval === 'year' ? 'YEAR' : 'MONTH';
    const status = mapStatus(sub.status);

    await this.prisma.$transaction([
      this.prisma.subscription.upsert({
        where: { stripeSubscriptionId: sub.id },
        create: {
          userId: user.id,
          tier,
          status,
          interval,
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
        },
        update: {
          tier,
          status,
          interval,
          stripePriceId: priceId,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
        },
      }),
      // User.tier reflects the highest active subscription. Simple rule for MVP:
      // if status is ACTIVE/TRIALING, set tier; otherwise drop to FREE.
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          tier:
            status === 'ACTIVE' || status === 'TRIALING' || status === 'PAST_DUE'
              ? tier
              : 'FREE',
        },
      }),
    ]);
  }
}

function mapStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
  switch (s) {
    case 'trialing':
      return 'TRIALING';
    case 'active':
      return 'ACTIVE';
    case 'past_due':
      return 'PAST_DUE';
    case 'canceled':
      return 'CANCELED';
    case 'incomplete':
      return 'INCOMPLETE';
    case 'incomplete_expired':
      return 'INCOMPLETE_EXPIRED';
    case 'unpaid':
      return 'UNPAID';
    case 'paused':
      return 'PAUSED';
    default:
      return 'CANCELED';
  }
}
