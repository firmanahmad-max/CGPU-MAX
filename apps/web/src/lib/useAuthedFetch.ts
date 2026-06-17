'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

import { API_BASE_URL } from './env';

export function useAuthedFetch() {
  const { getToken } = useAuth();
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
