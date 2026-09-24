import type { PrismaClient } from '@prisma/client';

import type { PickCategory, Resolution } from '../domain/BuildAdvice.js';

import { computeBuildInsights, type ResolvedPick } from './BuildInsightsService.js';

export interface RecomputeInput {
  picks: { category: PickCategory; slug: string }[];
  resolution: Resolution;
}

const PROCESSOR_CATEGORIES = new Set<PickCategory>(['cpu', 'gpu']);

// Recompute the deterministic insight panel for a user-edited parts list (the
// interactive "swap a part" flow). No AI call, so no quota is consumed — prices
// come straight from the catalog we control.
export class RecomputeBuildInsights {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: RecomputeInput) {
    const procSlugs = input.picks
      .filter((p) => PROCESSOR_CATEGORIES.has(p.category))
      .map((p) => p.slug);
    const compSlugs = input.picks
      .filter((p) => !PROCESSOR_CATEGORIES.has(p.category))
      .map((p) => p.slug);

    const [procs, comps] = await Promise.all([
      procSlugs.length
        ? this.prisma.processor.findMany({
            where: { slug: { in: procSlugs }, deletedAt: null },
            select: { slug: true, msrpUsd: true },
          })
        : Promise.resolve([]),
      compSlugs.length
        ? this.prisma.component.findMany({
            where: { slug: { in: compSlugs }, deletedAt: null },
            select: { slug: true, msrpUsd: true },
          })
        : Promise.resolve([]),
    ]);

    const priceBySlug = new Map<string, number>();
    for (const p of procs) if (p.msrpUsd) priceBySlug.set(p.slug, Number(p.msrpUsd));
    for (const c of comps) if (c.msrpUsd) priceBySlug.set(c.slug, Number(c.msrpUsd));

    const resolved: ResolvedPick[] = input.picks.map((p) => ({
      category: p.category,
      slug: p.slug,
      priceUsd: priceBySlug.get(p.slug) ?? 0,
    }));

    const { totalUsd, insights } = await computeBuildInsights(
      this.prisma,
      resolved,
      input.resolution,
    );
    return { estimatedTotalUsd: totalUsd, insights };
  }
}
