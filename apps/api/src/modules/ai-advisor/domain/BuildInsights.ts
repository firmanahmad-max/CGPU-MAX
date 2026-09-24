// Deterministic, server-computed insights that enrich an AI build recommendation.
// The model picks parts; THIS code derives the trustworthy numbers from the
// grounded catalog specs (reusing the bottleneck engine), so the insight panel
// never depends on the model's arithmetic.

import type { GameProfile, LimitingComponent, Resolution } from '@cgpu-max/types';

import type { BottleneckOutcome } from '../../bottleneck/domain/BottleneckAlgorithm.js';

export interface FpsEstimate {
  profile: GameProfile;
  label: string;
  min: number;
  max: number;
}

export interface PerformanceInsight {
  targetResolution: Resolution;
  cpuPower: number;
  gpuPower: number;
  bottleneckPercentage: number;
  limitingComponent: LimitingComponent;
  severity: 'optimal' | 'minor' | 'moderate' | 'significant' | 'severe';
  fps: FpsEstimate[];
  note: string | null;
  algorithmVersion: string;
}

export interface BuildInsights {
  performance: PerformanceInsight | null;
}

// Gaming-relevant profiles shown in the FPS table (skip VR to stay focused).
const FPS_PROFILES: { profile: GameProfile; label: string }[] = [
  { profile: 'esports', label: 'Esports' },
  { profile: 'aaa', label: 'AAA' },
  { profile: 'creative', label: 'Creative' },
];

// Collapse a full bottleneck outcome down to the single target resolution the
// user asked about, plus a compact FPS table.
export function toPerformanceInsight(
  outcome: BottleneckOutcome,
  resolution: Resolution,
): PerformanceInsight {
  const atRes = outcome.scenarios.filter((s) => s.resolution === resolution);
  // Headline uses the AAA profile (the everyday gaming case) at this resolution.
  const headline = atRes.find((s) => s.profile === 'aaa') ?? atRes[0];

  const fps: FpsEstimate[] = FPS_PROFILES.map(({ profile, label }) => {
    const s = atRes.find((x) => x.profile === profile);
    return {
      profile,
      label,
      min: s?.expectedFpsRange?.min ?? 0,
      max: s?.expectedFpsRange?.max ?? 0,
    };
  });

  return {
    targetResolution: resolution,
    cpuPower: outcome.cpuPower,
    gpuPower: outcome.gpuPower,
    bottleneckPercentage: headline?.bottleneckPercentage ?? 0,
    limitingComponent: headline?.limitingComponent ?? 'balanced',
    severity: headline?.severity ?? 'optimal',
    fps,
    note: outcome.recommendations[0] ?? null,
    algorithmVersion: outcome.algorithmVersion,
  };
}
