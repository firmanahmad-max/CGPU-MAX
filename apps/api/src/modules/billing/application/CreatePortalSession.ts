import type { PrismaClient } from '@prisma/client';

import { env } from '../../../shared/config/env.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { stripe } from '../domain/StripeClient.js';

export class CreatePortalSession {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(userId: string): Promise<{ url: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) {
      throw new AppError(
        'NO_STRIPE_CUSTOMER',
        'No Stripe customer for this user — checkout first',
        400,
      );
    }
    const session = await stripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.APP_URL}/account`,
    });
    return { url: session.url };
  }
}
