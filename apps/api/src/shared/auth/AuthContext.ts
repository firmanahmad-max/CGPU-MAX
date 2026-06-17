import type { SubscriptionTier } from '@cgpu-max/types';

// Attached to every Express request by `withUser` middleware.
// `null` = anonymous (treated as FREE for limit purposes but cannot persist data).
export interface AuthContext {
  userId: string;
  clerkUserId: string;
  email: string;
  tier: SubscriptionTier;
  role: 'USER' | 'ADMIN';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth: AuthContext | null;
    }
  }
}
