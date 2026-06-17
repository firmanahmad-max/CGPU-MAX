import { auth } from '@clerk/nextjs/server';

import { API_BASE_URL } from './env';

const AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Server-side helper to call the API with a Clerk JWT attached. Use this from
// Server Components and Server Actions. In anonymous mode (no Clerk key) it
// sends the request without a token.
export async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (AUTH_ENABLED) {
    const { getToken } = auth();
    const token = await getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}
