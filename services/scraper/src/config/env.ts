import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  SCRAPER_USER_AGENT: z.string().default('CGPU-MAX/0.1 (+https://cgpu-max.app)'),
  SCRAPER_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  SCRAPER_DELAY_MS: z.coerce.number().int().nonnegative().default(1_000),
  SCRAPER_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),

  // Schedule: every 6 hours per Master Prompt Phase 2 spec.
  SCRAPER_CRON: z.string().default('0 */6 * * *'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid scraper environment:', parsed.error.flatten().fieldErrors);
  throw new Error('Environment validation failed');
}

export const env = parsed.data;
export type Env = typeof env;
