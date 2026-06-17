import type { PrismaClient } from '@prisma/client';

import { NotFoundError } from '../../../shared/errors/AppError.js';

export class GetComparisonBySlug {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(shareSlug: string) {
    const row = await this.prisma.savedComparison.findUnique({ where: { shareSlug } });
    if (!row) throw new NotFoundError('Comparison', shareSlug);
    return row.payload;
  }
}
