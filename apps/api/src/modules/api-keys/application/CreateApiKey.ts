import type { PrismaClient } from '@prisma/client';

import type { AuthContext } from '../../../shared/auth/AuthContext.js';
import { generateApiKey } from '../domain/keygen.js';

export interface CreateApiKeyInput {
  name: string;
  expiresInDays?: number;
}

export class CreateApiKey {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(auth: AuthContext, input: CreateApiKeyInput) {
    const { plaintext, hashedKey, keyPrefix } = generateApiKey();
    const expiresAt =
      input.expiresInDays && input.expiresInDays > 0
        ? new Date(Date.now() + input.expiresInDays * 86_400_000)
        : null;

    const row = await this.prisma.apiKey.create({
      data: {
        ownerId: auth.userId,
        name: input.name,
        keyPrefix,
        hashedKey,
        expiresAt,
      },
    });

    // `plaintext` is returned ONCE here and never stored or logged.
    return {
      id: row.id,
      name: row.name,
      keyPrefix: row.keyPrefix,
      scopes: row.scopes,
      expiresAt: row.expiresAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      key: plaintext,
    };
  }
}
