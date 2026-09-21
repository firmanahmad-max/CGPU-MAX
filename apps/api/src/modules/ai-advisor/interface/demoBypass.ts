import type { RequestHandler } from 'express';

import { env } from '../../../shared/config/env.js';
import { logger } from '../../../shared/logging/logger.js';
import { prisma } from '../../../shared/persistence/prisma.js';

const DEMO_CLERK_ID = 'demo-advisor';
const DEMO_EMAIL = 'demo@cgpu-max.local';

// Optional bypass for the advisor: a request carrying `X-Advisor-Secret` equal to
// ADVISOR_DEMO_SECRET is treated as a fixed PRO demo user, so it clears
// requireAuth + requireFeature('aiAdvisor') without Clerk. Disabled unless the
// secret is set. A shared secret keeps it non-public; use real Clerk auth for
// production. Falls through (leaving req.auth as-is) when it doesn't apply, so
// requireAuth still 401s normal anonymous callers.
export const advisorDemoBypass: RequestHandler = async (req, _res, next) => {
  const secret = env.ADVISOR_DEMO_SECRET;
  if (!secret) return next();

  const provided = req.header('x-advisor-secret');
  if (!provided || provided !== secret) return next();

  try {
    const user = await prisma.user.upsert({
      where: { clerkUserId: DEMO_CLERK_ID },
      create: { clerkUserId: DEMO_CLERK_ID, email: DEMO_EMAIL, tier: 'PRO' },
      update: { tier: 'PRO' },
    });
    req.auth = {
      userId: user.id,
      clerkUserId: DEMO_CLERK_ID,
      email: user.email,
      tier: user.tier,
      role: user.role,
    };
    return next();
  } catch (err) {
    logger.error({ err }, 'advisor demo bypass failed');
    return next();
  }
};
