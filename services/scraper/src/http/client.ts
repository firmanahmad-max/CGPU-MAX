import axios, { type AxiosInstance } from 'axios';

import { env } from '../config/env.js';

export function createHttpClient(): AxiosInstance {
  return axios.create({
    timeout: env.SCRAPER_REQUEST_TIMEOUT_MS,
    headers: {
      'User-Agent': env.SCRAPER_USER_AGENT,
      Accept: 'application/json, text/html;q=0.9',
    },
    validateStatus: (s) => s >= 200 && s < 500,
  });
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number } = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? env.SCRAPER_MAX_RETRIES;
  const baseDelay = options.baseDelayMs ?? 1_000;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt > maxRetries) break;
      const jitter = Math.random() * 250;
      await sleep(Math.pow(2, attempt - 1) * baseDelay + jitter);
    }
  }
  throw lastErr;
}
