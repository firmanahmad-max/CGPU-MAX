import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  // Set REDIS_ENABLED=false to run without Redis (local/dev): caching, the
  // tier rate limiter, and analytics counters degrade to no-ops.
  REDIS_ENABLED: z
    .string()
    .default('true')
    .transform((v) => v !== 'false'),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:3001'),

  // Auth (Clerk) — optional in dev; required at runtime by middleware.
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),

  // Billing (Stripe) — optional in dev; required when billing routes are hit.
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PRO_YEARLY: z.string().optional(),

  // AI (Anthropic Claude) — used when no OpenAI-compatible provider is set.
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-opus-4-8'),

  // AI (OpenAI-compatible gateway, e.g. Sumopod) — takes precedence over
  // Anthropic when AI_BASE_URL + AI_API_KEY are both set. AI_MODEL defaults to
  // the Sumopod model. The advisor is disabled unless one provider is configured.
  AI_BASE_URL: z.string().url().optional(),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('gpt-5.6-luna'),

  // Optional secret-guarded demo access to the AI advisor without Clerk. When
  // set, a request whose `X-Advisor-Secret` header matches is treated as a fixed
  // PRO demo user. A shared secret — not a substitute for real auth in the open.
  ADVISOR_DEMO_SECRET: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Environment validation failed');
}

export const env = parsed.data;
export type Env = typeof env;
