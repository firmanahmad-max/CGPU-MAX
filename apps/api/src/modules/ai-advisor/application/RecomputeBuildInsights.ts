import type { PrismaClient } from '@prisma/client';

import type { PickCategory, Resolution } from '../domain/BuildAdvice.js';

import { computeBuildInsights, type ResolvedPick } from './BuildInsightsService.js';

export interface RecomputeInput {
  // slug is null for an out-of-catalog part; priceUsd is its fallback price.
  picks: { category: PickCategory; slug: string | null; priceUsd?: number }[];
  resolution: Resolution;
}

const PROCESSOR_CATEGORIES = new Set<PickCategory>(['cpu', 'gpu']);

// Recompute the deterministic insight panel for a user-edited parts list (the
// interactive "swap a part" flow). No AI call, so no quota is consumed — prices
// come from the catalog we control, falling back to the client-supplied price
// for parts we can't price (so the total never silently drops them).
export class RecomputeBuildInsights {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: RecomputeInput) {
    const slugsFor = (proc: boolean) =>
      input.picks
        .filter((p) => p.slug && PROCESSOR_CATEGORIES.has(p.category) === proc)
        .map((p) => p.slug as string);
    const procSlugs = slugsFor(true);
    const compSlugs = slugsFor(false);

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
      priceUsd: (p.slug ? priceBySlug.get(p.slug) : undefined) ?? p.priceUsd ?? 0,
    }));

    const { totalUsd, insights } = await computeBuildInsights(
      this.prisma,
      resolved,
      input.resolution,
    );
    return { estimatedTotalUsd: totalUsd, insights };
  }
}
