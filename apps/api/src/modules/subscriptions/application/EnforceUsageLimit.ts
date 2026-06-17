import type { SubscriptionTier } from '@cgpu-max/types';
import type { PrismaClient } from '@prisma/client';

import { AppError } from '../../../shared/errors/AppError.js';
import { getLimits, isUnlimited } from '../domain/TierPolicy.js';
import { currentPeriodKey } from '../domain/UsagePeriod.js';

export interface UsageInput {
  userId: string;
  tier: SubscriptionTier;
  feature: 'comparisons' | 'aiRecommendations';
}

export class EnforceUsageLimit {
  constructor(private readonly prisma: PrismaClient) {}

  async incrementAndCheck(input: UsageInput): Promise<{ current: number; limit: number }> {
    const limits = getLimits(input.tier);
    const limit =
      input.feature === 'comparisons'
        ? limits.comparisonsPerMonth
        : limits.aiRecommendationsPerMonth;

    const period = currentPeriodKey();

    if (isUnlimited(limit)) {
      // Still record usage for analytics, but don't gate.
      const row = await this.bump(input, period);
      return { current: row.count, limit };
    }

    const row = await this.bump(input, period);
    if (row.count > limit) {
      throw new AppError(
        'USAGE_LIMIT_EXCEEDED',
        `Monthly limit reached for ${input.feature} on tier ${input.tier} (${limit}).`,
        429,
        { details: { feature: input.feature, limit, current: row.count, tier: input.tier } },
      );
    }
    return { current: row.count, limit };
  }

  private bump(input: UsageInput, period: string) {
    return this.prisma.usageCounter.upsert({
      where: {
        userId_feature_period: {
          userId: input.userId,
          feature: input.feature,
          period,
        },
      },
      create: { userId: input.userId, feature: input.feature, period, count: 1 },
      update: { count: { increment: 1 } },
    });
  }
}
