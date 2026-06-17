import type { RequestHandler } from 'express';

import { AppError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';
import { prisma } from '../persistence/prisma.js';

import type { AuthContext } from './AuthContext.js';
import { verifyClerkJwt } from './clerk.js';

const BEARER_PREFIX = 'Bearer ';

// Resolves the Authorization header into req.auth. Always succeeds — anonymous
// callers get req.auth = null. Endpoints needing auth use `requireAuth`.
export const withUser: RequestHandler = async (req, _res, next) => {
  req.auth = null;

  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) {
    return next();
  }
  const token = header.slice(BEARER_PREFIX.length).trim();
  if (!token) return next();

  try {
    const claims = await verifyClerkJwt(token);
    const clerkUserId = claims.sub;
    if (!clerkUserId) return next();

    const email =
      (typeof claims.email === 'string' && claims.email) ||
      (typeof claims.primary_email === 'string' && claims.primary_email) ||
      `${clerkUserId}@clerk.local`;

    const user = await prisma.user.upsert({
      where: { clerkUserId },
      create: { clerkUserId, email },
      update: { email },
    });

    const auth: AuthContext = {
      userId: user.id,
      clerkUserId,
      email: user.email,
      tier: user.tier,
      role: user.role,
    };
    req.auth = auth;
    return next();
  } catch (err) {
    // Invalid token: keep anonymous; don't 401 here. Routes that need auth
    // will use `requireAuth` which 401s on absence of req.auth.
    logger.debug({ err }, 'Clerk JWT verification failed');
    return next();
  }
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.auth) {
    return next(new AppError('UNAUTHENTICATED', 'Authentication required', 401));
  }
  return next();
};

export const requireRole =
  (role: 'ADMIN'): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth) {
      return next(new AppError('UNAUTHENTICATED', 'Authentication required', 401));
    }
    if (req.auth.role !== role) {
      return next(new AppError('FORBIDDEN', 'Insufficient permissions', 403));
    }
    return next();
  };
