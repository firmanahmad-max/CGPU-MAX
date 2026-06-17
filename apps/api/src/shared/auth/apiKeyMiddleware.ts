import type { RequestHandler } from 'express';

import { hashApiKey, looksLikeApiKey } from '../../modules/api-keys/domain/keygen.js';
import { AppError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';
import { prisma } from '../persistence/prisma.js';

import type { AuthContext } from './AuthContext.js';

// Resolves an API key from `Authorization: Bearer cgpu_live_...` or `x-api-key`
// into req.auth, mirroring how withUser populates it for Clerk JWTs. Use on the
// public API namespace. Always 401s on a missing/invalid/expired/revoked key —
// programmatic clients have no anonymous mode.
export const apiKeyAuth: RequestHandler = async (req, _res, next) => {
  const raw = extractKey(req.headers.authorization, req.headers['x-api-key']);
  if (!raw) {
    return next(new AppError('MISSING_API_KEY', 'API key required', 401));
  }
  if (!looksLikeApiKey(raw)) {
    return next(new AppError('INVALID_API_KEY', 'Malformed API key', 401));
  }

  try {
    const record = await prisma.apiKey.findUnique({
      where: { hashedKey: hashApiKey(raw) },
      include: { owner: true },
    });

    if (!record || record.revokedAt) {
      return next(new AppError('INVALID_API_KEY', 'Invalid or revoked API key', 401));
    }
    if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
      return next(new AppError('EXPIRED_API_KEY', 'API key has expired', 401));
    }

    // Best-effort last-used stamp; never block the request on it.
    prisma.apiKey
      .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
      .catch((err: unknown) => logger.debug({ err }, 'Failed to update API key lastUsedAt'));

    const auth: AuthContext = {
      userId: record.owner.id,
      clerkUserId: record.owner.clerkUserId ?? '',
      email: record.owner.email,
      tier: record.owner.tier,
      role: record.owner.role,
    };
    req.auth = auth;
    return next();
  } catch (err) {
    return next(err);
  }
};

function extractKey(authHeader?: string, apiKeyHeader?: string | string[]): string | null {
  if (typeof apiKeyHeader === 'string' && apiKeyHeader.trim()) {
    return apiKeyHeader.trim();
  }
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    return token || null;
  }
  return null;
}
