import type { PrismaClient } from '@prisma/client';

import type { AuthContext } from '../../../shared/auth/AuthContext.js';
import { NotFoundError } from '../../../shared/errors/AppError.js';

export class RevokeApiKey {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(auth: AuthContext, keyId: string) {
    // Scope the update to the owner so one user can't revoke another's key.
    const result = await this.prisma.apiKey.updateMany({
      where: { id: keyId, ownerId: auth.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count === 0) {
      throw new NotFoundError('API key', keyId);
    }
    return { revoked: true };
  }
}
