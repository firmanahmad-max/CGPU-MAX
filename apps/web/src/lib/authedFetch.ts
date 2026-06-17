import { auth } from '@clerk/nextjs/server';

import { API_BASE_URL } from './env';

// Server-side helper to call the API with a Clerk JWT attached. Use this from
// Server Components and Server Actions. For client components, prefer the
// useApi() hook (uses `getToken()` from Clerk on the client).
export async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { getToken } = auth();
  const token = await getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}
