import type { PrismaClient } from '@prisma/client';

import type { AuthContext } from '../../../shared/auth/AuthContext.js';

export class ListApiKeys {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(auth: AuthContext) {
    const rows = await this.prisma.apiKey.findMany({
      where: { ownerId: auth.userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    // Never return hashedKey — only safe metadata.
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      keyPrefix: r.keyPrefix,
      scopes: r.scopes,
      lastUsedAt: r.lastUsedAt?.toISOString() ?? null,
      expiresAt: r.expiresAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
