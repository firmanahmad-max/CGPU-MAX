'use client';

import { useCallback } from 'react';

import { API_BASE_URL } from './env';
import { useAuthToken } from './auth';

// Attaches the Clerk JWT when auth is enabled; in anonymous mode the token is
// null and the request goes through unauthenticated (auth-only endpoints 401).
export function useAuthedFetch() {
  const getToken = useAuthToken();
  return useCallback(
    async (path: string, init: RequestInit = {}) => {
      const token = await getToken();
      const headers = new Headers(init.headers);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
    },
    [getToken],
  );
}
