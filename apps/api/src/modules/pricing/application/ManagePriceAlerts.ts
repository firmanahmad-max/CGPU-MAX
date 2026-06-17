import type { AlertDirection, PrismaClient } from '@prisma/client';

import type { AuthContext } from '../../../shared/auth/AuthContext.js';
import { AppError, NotFoundError } from '../../../shared/errors/AppError.js';
import { getLimits, isUnlimited } from '../../subscriptions/domain/TierPolicy.js';

export interface CreateAlertInput {
  slug: string;
  targetPriceUsd: number;
  direction: AlertDirection;
}

export class ManagePriceAlerts {
  constructor(private readonly prisma: PrismaClient) {}

  async create(auth: AuthContext, input: CreateAlertInput) {
    const limit = getLimits(auth.tier).priceAlertsMax;
    if (limit === 0) {
      throw new AppError('FEATURE_NOT_IN_TIER', 'Price alerts require an upgraded plan', 402, {
        details: { feature: 'priceTracking', tier: auth.tier },
      });
    }
    if (!isUnlimited(limit)) {
      const active = await this.prisma.priceAlert.count({
        where: { ownerId: auth.userId, active: true },
      });
      if (active >= limit) {
        throw new AppError(
          'ALERT_LIMIT_REACHED',
          `Active price-alert limit reached for tier ${auth.tier} (${limit})`,
          429,
          { details: { limit, active, tier: auth.tier } },
        );
      }
    }

    const processor = await this.prisma.processor.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (!processor) throw new NotFoundError('Processor', input.slug);

    const row = await this.prisma.priceAlert.create({
      data: {
        ownerId: auth.userId,
        processorId: processor.id,
        targetPriceUsd: input.targetPriceUsd,
        direction: input.direction,
      },
    });
    return this.toDto(row);
  }

  async list(auth: AuthContext) {
    const rows = await this.prisma.priceAlert.findMany({
      where: { ownerId: auth.userId },
      orderBy: { createdAt: 'desc' },
      include: { processor: { select: { slug: true, modelName: true } } },
    });
    return rows.map((r) => ({
      ...this.toDto(r),
      processorSlug: r.processor.slug,
      processorName: r.processor.modelName,
    }));
  }

  async delete(auth: AuthContext, id: string) {
    const result = await this.prisma.priceAlert.deleteMany({
      where: { id, ownerId: auth.userId },
    });
    if (result.count === 0) throw new NotFoundError('Price alert', id);
    return { deleted: true };
  }

  private toDto(r: {
    id: string;
    targetPriceUsd: unknown;
    direction: AlertDirection;
    active: boolean;
    triggeredAt: Date | null;
    triggeredPriceUsd: unknown;
    createdAt: Date;
  }) {
    return {
      id: r.id,
      targetPriceUsd: Number(r.targetPriceUsd),
      direction: r.direction,
      active: r.active,
      triggeredAt: r.triggeredAt?.toISOString() ?? null,
      triggeredPriceUsd: r.triggeredPriceUsd ? Number(r.triggeredPriceUsd) : null,
      createdAt: r.createdAt.toISOString(),
    };
  }
}
