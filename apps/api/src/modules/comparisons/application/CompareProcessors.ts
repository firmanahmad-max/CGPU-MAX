import type { PrismaClient } from '@prisma/client';

import type { AuthContext } from '../../../shared/auth/AuthContext.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { EnforceUsageLimit } from '../../subscriptions/application/EnforceUsageLimit.js';
import { ComparisonEngine } from '../domain/ComparisonEngine.js';

import { buildProcessorSnapshot } from './BuildSnapshot.js';

export interface CompareInput {
  aSlug: string;
  bSlug: string;
  persist?: boolean;
  auth?: AuthContext | null;
}

export class CompareProcessors {
  private readonly engine = new ComparisonEngine();
  private readonly usage: EnforceUsageLimit;

  constructor(private readonly prisma: PrismaClient) {
    this.usage = new EnforceUsageLimit(prisma);
  }

  async execute(input: CompareInput) {
    if (input.aSlug === input.bSlug) {
      throw new AppError('SAME_PROCESSOR', 'Cannot compare a processor with itself', 400);
    }

    // Enforce the FREE tier comparisons-per-month limit when authenticated.
    // Anonymous calls bypass the counter (they hit IP-based rate limit instead).
    if (input.auth) {
      await this.usage.incrementAndCheck({
        userId: input.auth.userId,
        tier: input.auth.tier,
        feature: 'comparisons',
      });
    }

    const [a, b] = await Promise.all([
      buildProcessorSnapshot(this.prisma, input.aSlug),
      buildProcessorSnapshot(this.prisma, input.bSlug),
    ]);

    if (a.type !== b.type) {
      throw new AppError(
        'INCOMPATIBLE_TYPES',
        'Both processors must be the same type (CPU vs CPU, GPU vs GPU)',
        400,
      );
    }

    const outcome = this.engine.compare(a, b);
    const payload = {
      a,
      b,
      ...outcome,
      generatedAt: new Date().toISOString(),
    };

    if (!input.persist) {
      return { ...payload, shareSlug: null as string | null };
    }

    const shareSlug = buildShareSlug(a.slug, b.slug);
    await this.prisma.savedComparison.upsert({
      where: { shareSlug },
      create: {
        shareSlug,
        aId: a.id,
        bId: b.id,
        ownerId: input.auth?.userId ?? null,
        payload: payload as object,
      },
      update: {
        payload: payload as object,
        createdAt: new Date(),
      },
    });

    return { ...payload, shareSlug };
  }
}

function buildShareSlug(a: string, b: string): string {
  const [first, second] = [a, b].sort();
  return `${first}-vs-${second}`.slice(0, 200);
}
