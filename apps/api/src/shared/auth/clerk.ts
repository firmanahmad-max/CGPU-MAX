import { createClerkClient, verifyToken } from '@clerk/backend';

import { env } from '../config/env.js';

let _client: ReturnType<typeof createClerkClient> | null = null;

export function clerk() {
  if (!env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY not set — auth is required for this operation');
  }
  if (!_client) {
    _client = createClerkClient({
      secretKey: env.CLERK_SECRET_KEY,
      publishableKey: env.CLERK_PUBLISHABLE_KEY,
    });
  }
  return _client;
}

export async function verifyClerkJwt(token: string) {
  if (!env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY not configured');
  }
  return verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
}
