import type { PrismaClient } from '@prisma/client';

import { logger } from '../logging/logger.js';

// After an ingestion run, check active, not-yet-triggered price alerts against
// the most recent recorded price for each processor and mark crossings.
// Notification dispatch (email/SMS/push) is deferred to the Phase 7 notifier
// service; here we only record the trigger so the API can surface it.
export interface AlertEvalStats {
  checked: number;
  triggered: number;
}

export async function evaluatePriceAlerts(prisma: PrismaClient): Promise<AlertEvalStats> {
  const alerts = await prisma.priceAlert.findMany({
    where: { active: true, triggeredAt: null },
  });

  let triggered = 0;
  const now = new Date();

  for (const alert of alerts) {
    const latest = await prisma.priceHistory.findFirst({
      where: { processorId: alert.processorId },
      orderBy: { recordedAt: 'desc' },
      select: { priceUsd: true },
    });

    const stamp = { lastCheckedAt: now };
    if (!latest) {
      await prisma.priceAlert.update({ where: { id: alert.id }, data: stamp });
      continue;
    }

    const price = Number(latest.priceUsd);
    const target = Number(alert.targetPriceUsd);
    const crossed = alert.direction === 'BELOW' ? price <= target : price >= target;

    if (crossed) {
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: { ...stamp, triggeredAt: now, triggeredPriceUsd: price, active: false },
      });
      triggered += 1;
    } else {
      await prisma.priceAlert.update({ where: { id: alert.id }, data: stamp });
    }
  }

  const stats: AlertEvalStats = { checked: alerts.length, triggered };
  logger.info(stats, 'Price alert evaluation complete');
  return stats;
}
