import Stripe from 'stripe';

import { env } from '../../../shared/config/env.js';

let _stripe: Stripe | null = null;

export function stripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
      typescript: true,
      appInfo: { name: 'cgpu-max', version: '0.1.0' },
    });
  }
  return _stripe;
}

// Centralised price-id → tier mapping. Configured via env so prices can rotate
// without code changes. Returns null for unknown ids.
export function tierFromPriceId(priceId: string): 'PRO' | 'ENTERPRISE' | null {
  if (priceId === env.STRIPE_PRICE_PRO_MONTHLY || priceId === env.STRIPE_PRICE_PRO_YEARLY) {
    return 'PRO';
  }
  return null;
}
