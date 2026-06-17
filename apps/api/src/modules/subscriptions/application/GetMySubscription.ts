import type { PrismaClient } from '@prisma/client';

import { getLimits } from '../domain/TierPolicy.js';
import { currentPeriodKey } from '../domain/UsagePeriod.js';

import type { AuthContext } from '../../../shared/auth/AuthContext.js';

export class GetMySubscription {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(auth: AuthContext) {
    const [active, usageRows] = await Promise.all([
      this.prisma.subscription.findFirst({
        where: {
          userId: auth.userId,
          status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.usageCounter.findMany({
        where: { userId: auth.userId, period: currentPeriodKey() },
      }),
    ]);

    return {
      tier: auth.tier,
      limits: getLimits(auth.tier),
      subscription: active
        ? {
            status: active.status,
            interval: active.interval,
            currentPeriodEnd: active.currentPeriodEnd.toISOString(),
            cancelAtPeriodEnd: active.cancelAtPeriodEnd,
          }
        : null,
      usage: usageRows.reduce<Record<string, number>>((acc, row) => {
        acc[row.feature] = row.count;
        return acc;
      }, {}),
      period: currentPeriodKey(),
    };
  }
}
