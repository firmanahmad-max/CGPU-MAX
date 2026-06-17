export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  tier: SubscriptionTier;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    correlationId: string;
    details?: unknown;
  };
}
