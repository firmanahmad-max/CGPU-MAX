import type { PrismaClient } from '@prisma/client';

import { logger } from '../../../shared/logging/logger.js';
import { BottleneckAlgorithm } from '../../bottleneck/domain/BottleneckAlgorithm.js';
import { buildProcessorSnapshot } from '../../comparisons/application/BuildSnapshot.js';
import type { PickCategory, Resolution } from '../domain/BuildAdvice.js';
import {
  computeBudget,
  computeCompatibility,
  computeEconomics,
  toPerformanceInsight,
  type BuildInsights,
} from '../domain/BuildInsights.js';

// A resolved pick with its price already known (grounded from the catalog).
export interface ResolvedPick {
  category: PickCategory;
  slug: string | null;
  priceUsd: number;
}

const bottleneck = new BottleneckAlgorithm();

// Single source of truth for the deterministic insight panel. Given the chosen
// parts (grounded slugs + prices) and a target resolution, it derives budget,
// compatibility, PSU headroom, FPS/bottleneck and economics — all from real
// catalog specs, never the model. Reused by the AI generator and the
// interactive "swap a part" recompute endpoint.
export async function computeBuildInsights(
  prisma: PrismaClient,
  picks: ResolvedPick[],
  resolution: Resolution,
): Promise<{ totalUsd: number; insights: BuildInsights }> {
  const bySlot = new Map<PickCategory, ResolvedPick>();
  for (const p of picks) if (!bySlot.has(p.category)) bySlot.set(p.category, p);
  const slot = (c: PickCategory) => bySlot.get(c) ?? null;

  const budget = computeBudget(picks.map((p) => ({ category: p.category, priceUsd: p.priceUsd })));

  const [performance, compat] = await Promise.all([
    computePerformance(prisma, slot('cpu')?.slug ?? null, slot('gpu')?.slug ?? null, resolution),
    computeCompatibilitySlots(prisma, bySlot),
  ]);

  const aaaMaxFps = performance?.fps.find((f) => f.profile === 'aaa')?.max ?? 0;
  const economics = compat.power
    ? computeEconomics(budget.totalUsd, compat.power.estimatedDrawW, aaaMaxFps)
    : null;

  return {
    totalUsd: budget.totalUsd,
    insights: {
      performance,
      compatibility: compat.checks,
      power: compat.power,
      budget,
      economics,
    },
  };
}

async function computePerformance(
  prisma: PrismaClient,
  cpuSlug: string | null,
  gpuSlug: string | null,
  resolution: Resolution,
) {
  if (!cpuSlug || !gpuSlug) return null;
  try {
    const [cpu, gpu] = await Promise.all([
      buildProcessorSnapshot(prisma, cpuSlug),
      buildProcessorSnapshot(prisma, gpuSlug),
    ]);
    if (cpu.type !== 'CPU' || gpu.type !== 'GPU') return null;
    return toPerformanceInsight(bottleneck.evaluate(cpu, gpu), resolution);
  } catch (err) {
    logger.warn({ err, cpuSlug, gpuSlug }, 'Build performance insight skipped');
    return null;
  }
}

async function computeCompatibilitySlots(
  prisma: PrismaClient,
  bySlot: Map<PickCategory, ResolvedPick>,
) {
  const componentSlugs = (['motherboard', 'ram', 'psu', 'case', 'cooler'] as PickCategory[])
    .map((c) => bySlot.get(c)?.slug)
    .filter((s): s is string => Boolean(s));
  const procSlugs = (['cpu', 'gpu'] as PickCategory[])
    .map((c) => bySlot.get(c)?.slug)
    .filter((s): s is string => Boolean(s));

  const [comps, procs] = await Promise.all([
    componentSlugs.length
      ? prisma.component.findMany({
          where: { slug: { in: componentSlugs } },
          select: {
            slug: true,
            socket: true,
            memoryType: true,
            formFactor: true,
            wattage: true,
          },
        })
      : Promise.resolve([]),
    procSlugs.length
      ? prisma.processor.findMany({
          where: { slug: { in: procSlugs } },
          select: {
            slug: true,
            type: true,
            tdpWatts: true,
            cpuSpecs: { select: { socket: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const compBySlug = new Map(comps.map((c) => [c.slug, c]));
  const get = (c: PickCategory) => {
    const s = bySlot.get(c)?.slug;
    return s ? (compBySlug.get(s) ?? null) : null;
  };
  const mobo = get('motherboard');
  const ram = get('ram');
  const psu = get('psu');
  const pcCase = get('case');
  const cooler = get('cooler');
  const cpuRow = procs.find((p) => p.type === 'CPU');
  const gpuRow = procs.find((p) => p.type === 'GPU');

  return computeCompatibility({
    cpuSocket: cpuRow?.cpuSpecs?.socket ?? null,
    cpuTdp: cpuRow?.tdpWatts ?? null,
    gpuTdp: gpuRow?.tdpWatts ?? null,
    moboSocket: mobo?.socket ?? null,
    moboMemory: mobo?.memoryType ?? null,
    moboForm: mobo?.formFactor ?? null,
    ramMemory: ram?.memoryType ?? null,
    caseForm: pcCase?.formFactor ?? null,
    psuWatts: psu?.wattage ?? null,
    coolerType: cooler?.formFactor ?? null,
  });
}
