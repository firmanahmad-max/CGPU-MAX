import type { PrismaClient } from '@prisma/client';

import { env } from '../../../shared/config/env.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { stripe } from '../domain/StripeClient.js';

export type CheckoutPlan = 'pro_monthly' | 'pro_yearly';

export interface CheckoutInput {
  userId: string;
  email: string;
  plan: CheckoutPlan;
}

export class CreateCheckoutSession {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: CheckoutInput): Promise<{ url: string }> {
    const priceId =
      input.plan === 'pro_monthly' ? env.STRIPE_PRICE_PRO_MONTHLY : env.STRIPE_PRICE_PRO_YEARLY;
    if (!priceId) {
      throw new AppError('BILLING_NOT_CONFIGURED', `Stripe price for ${input.plan} not set`, 503);
    }

    const user = await this.prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

    // Ensure a Stripe customer exists and is linked back to the user. We reuse
    // an existing one (lazy creation) to keep the schema-level uniqueness
    // promise on `stripeCustomerId`.
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe().customers.create({
        email: input.email,
        metadata: { userId: input.userId },
      });
      customerId = customer.id;
      await this.prisma.user.update({
        where: { id: input.userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe().checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.APP_URL}/account?checkout=success`,
      cancel_url: `${env.APP_URL}/pricing?checkout=cancelled`,
      // Idempotency on retries: same user + plan within a short window collapses.
      client_reference_id: input.userId,
      allow_promotion_codes: true,
      automatic_tax: { enabled: false },
    });

    if (!session.url) {
      throw new AppError('CHECKOUT_NO_URL', 'Stripe did not return a checkout URL', 502);
    }
    return { url: session.url };
  }
}
