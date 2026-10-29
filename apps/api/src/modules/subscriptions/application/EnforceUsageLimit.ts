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

  private limitFor(input: UsageInput): number {
    const limits = getLimits(input.tier);
    return input.feature === 'comparisons'
      ? limits.comparisonsPerMonth
      : limits.aiRecommendationsPerMonth;
  }

  // Fail fast when a multi-unit operation (e.g. a two-build tier comparison)
  // would not fit in what's left this period — before any unit is spent.
  async assertRemaining(input: UsageInput, needed: number): Promise<void> {
    const limit = this.limitFor(input);
    if (isUnlimited(limit)) return;
    const row = await this.prisma.usageCounter.findUnique({
      where: {
        userId_feature_period: {
          userId: input.userId,
          feature: input.feature,
          period: currentPeriodKey(),
        },
      },
      select: { count: true },
    });
    const current = row?.count ?? 0;
    if (current + needed > limit) {
      throw new AppError(
        'USAGE_LIMIT_EXCEEDED',
        `Monthly limit reached for ${input.feature} on tier ${input.tier} (${limit}).`,
        429,
        { details: { feature: input.feature, limit, current, needed, tier: input.tier } },
      );
    }
  }

  // Give a unit back when the work it paid for failed (e.g. the AI provider
  // errored), so users aren't charged for nothing. Never goes below zero.
  async refund(input: UsageInput): Promise<void> {
    await this.prisma.usageCounter.updateMany({
      where: {
        userId: input.userId,
        feature: input.feature,
        period: currentPeriodKey(),
        count: { gt: 0 },
      },
      data: { count: { decrement: 1 } },
    });
  }

  async incrementAndCheck(input: UsageInput): Promise<{ current: number; limit: number }> {
    const limit = this.limitFor(input);
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
