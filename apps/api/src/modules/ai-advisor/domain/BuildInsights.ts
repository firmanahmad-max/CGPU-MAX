// Deterministic, server-computed insights that enrich an AI build recommendation.
// The model picks parts; THIS code derives the trustworthy numbers from the
// grounded catalog specs (reusing the bottleneck engine), so the insight panel
// never depends on the model's arithmetic.

import type { GameProfile, LimitingComponent, Resolution } from '@cgpu-max/types';

import type { BottleneckOutcome } from '../../bottleneck/domain/BottleneckAlgorithm.js';

import type { PickCategory } from './BuildAdvice.js';

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

// One deterministic compatibility verdict. `a`/`b` carry the compared values so
// the UI can localize a sentence around them (e.g. "AM4 = AM4").
export interface CompatibilityCheck {
  code: 'socket' | 'memory' | 'formFactor' | 'psu' | 'cooler';
  status: 'ok' | 'warn' | 'unknown';
  a: string | null;
  b: string | null;
}

export interface PowerInsight {
  estimatedDrawW: number;
  recommendedPsuW: number;
  chosenPsuW: number | null;
  headroomPct: number | null;
}

export interface BudgetLine {
  category: PickCategory;
  priceUsd: number;
  pct: number;
}
export interface BudgetInsight {
  totalUsd: number;
  lines: BudgetLine[];
}

export interface EconomicsInsight {
  loadDrawW: number;
  hoursPerDay: number;
  kwhPerMonth: number;
  electricityIdrPerMonth: number;
  // Value: build price divided by AAA FPS at the target resolution.
  costPerFrameUsd: number | null;
}

export interface FutureProofingFactor {
  code: 'platform' | 'psu' | 'memory' | 'storage';
  rating: 'good' | 'ok' | 'weak';
  a: string | null;
}
export interface FutureProofingInsight {
  score: number; // 0–100
  factors: FutureProofingFactor[];
}

export interface FutureProofingInput {
  cpuSocket: string | null;
  ramMemory: string | null;
  ramCapacityGb: number | null;
  ssdCapacityGb: number | null;
  psuHeadroomPct: number | null;
}

export interface BuildInsights {
  performance: PerformanceInsight | null;
  compatibility: CompatibilityCheck[];
  power: PowerInsight | null;
  budget: BudgetInsight | null;
  economics: EconomicsInsight | null;
  futureProofing: FutureProofingInsight | null;
}

// Current, long-lived platforms still receiving new CPUs score highest; recent
// but dead-end sockets are middling; older/EOL sockets score low.
const CURRENT_SOCKETS = /am5|lga1851/i;
const MATURE_SOCKETS = /lga1700/i;

// Deterministic 0–100 future-proofing score from platform longevity, PSU
// headroom, memory, and storage. Each factor also carries its own rating.
export function computeFutureProofing(input: FutureProofingInput): FutureProofingInsight {
  const factors: FutureProofingFactor[] = [];
  let score = 0;

  // Platform / socket longevity (max 30).
  const socket = input.cpuSocket;
  let platformRating: FutureProofingFactor['rating'];
  if (socket && CURRENT_SOCKETS.test(socket)) {
    score += 30;
    platformRating = 'good';
  } else if (socket && MATURE_SOCKETS.test(socket)) {
    score += 20;
    platformRating = 'ok';
  } else {
    score += socket ? 10 : 0;
    platformRating = 'weak';
  }
  factors.push({ code: 'platform', rating: platformRating, a: socket });

  // Memory: type + capacity (max 25).
  const isDdr5 = input.ramMemory ? /ddr5/i.test(input.ramMemory) : false;
  const cap = input.ramCapacityGb ?? 0;
  score += isDdr5 ? 15 : input.ramMemory ? 7 : 0;
  score += cap >= 32 ? 10 : cap >= 16 ? 6 : cap > 0 ? 3 : 0;
  const memoryRating: FutureProofingFactor['rating'] =
    isDdr5 && cap >= 32 ? 'good' : isDdr5 || cap >= 32 ? 'ok' : 'weak';
  factors.push({
    code: 'memory',
    rating: memoryRating,
    a: input.ramMemory ? `${input.ramMemory}${cap ? ` ${cap}GB` : ''}` : null,
  });

  // PSU headroom for future upgrades (max 25).
  const hr = input.psuHeadroomPct;
  score += hr === null ? 0 : hr >= 40 ? 25 : hr >= 20 ? 16 : hr >= 0 ? 8 : 0;
  const psuRating: FutureProofingFactor['rating'] =
    hr === null ? 'weak' : hr >= 40 ? 'good' : hr >= 20 ? 'ok' : 'weak';
  factors.push({ code: 'psu', rating: psuRating, a: hr === null ? null : `+${hr}%` });

  // Storage capacity (max 20).
  const ssd = input.ssdCapacityGb ?? 0;
  score += ssd >= 2048 ? 20 : ssd >= 1024 ? 14 : ssd >= 512 ? 8 : ssd > 0 ? 4 : 0;
  const storageRating: FutureProofingFactor['rating'] =
    ssd >= 2048 ? 'good' : ssd >= 1024 ? 'ok' : 'weak';
  factors.push({
    code: 'storage',
    rating: storageRating,
    a: ssd ? (ssd >= 1024 ? `${ssd / 1024}TB` : `${ssd}GB`) : null,
  });

  return { score: Math.max(0, Math.min(100, Math.round(score))), factors };
}

// Group the picks' prices into a budget-allocation breakdown (% of total).
export function computeBudget(
  picks: { category: PickCategory; priceUsd: number }[],
): BudgetInsight {
  const total = picks.reduce((s, p) => s + (Number.isFinite(p.priceUsd) ? p.priceUsd : 0), 0);
  const lines: BudgetLine[] = picks.map((p) => ({
    category: p.category,
    priceUsd: Math.round(p.priceUsd),
    pct: total > 0 ? Math.round((p.priceUsd / total) * 100) : 0,
  }));
  return { totalUsd: Math.round(total), lines };
}

// Indonesian electricity tariff (~PLN R1/R2, Rp/kWh) and a realistic daily load
// window; both surfaced so the UI can show the assumption.
const TARIFF_IDR_PER_KWH = 1700;
const LOAD_HOURS_PER_DAY = 6;
const LOAD_FACTOR = 0.7; // average draw is well below peak TDP

export function computeEconomics(
  totalUsd: number,
  drawW: number,
  aaaMaxFps: number,
): EconomicsInsight {
  const kwhPerMonth =
    Math.round(((drawW * LOAD_FACTOR) / 1000) * LOAD_HOURS_PER_DAY * 30 * 10) / 10;
  return {
    loadDrawW: drawW,
    hoursPerDay: LOAD_HOURS_PER_DAY,
    kwhPerMonth,
    electricityIdrPerMonth: Math.round(kwhPerMonth * TARIFF_IDR_PER_KWH),
    costPerFrameUsd: aaaMaxFps > 0 ? Math.round((totalUsd / aaaMaxFps) * 100) / 100 : null,
  };
}

export interface CompatibilityInput {
  cpuSocket: string | null;
  cpuTdp: number | null;
  gpuTdp: number | null;
  moboSocket: string | null;
  moboMemory: string | null;
  moboForm: string | null;
  ramMemory: string | null;
  caseForm: string | null;
  psuWatts: number | null;
  coolerType: string | null;
}

// How much a case can physically hold, and how big a board is. Higher = larger.
function caseCapacityRank(form: string | null): number | null {
  if (!form) return null;
  if (/full tower|e-atx/i.test(form)) return 4;
  if (/mid tower|^atx$/i.test(form)) return 3;
  if (/micro|matx|m-atx/i.test(form)) return 2;
  if (/mini|itx/i.test(form)) return 1;
  return null;
}
function boardRank(form: string | null): number | null {
  if (!form) return null;
  if (/e-atx/i.test(form)) return 4;
  if (/micro|matx|m-atx/i.test(form)) return 2;
  if (/mini|itx/i.test(form)) return 1;
  if (/atx/i.test(form)) return 3;
  return null;
}

// Rough non-CPU/GPU system overhead (board, RAM, drives, fans) in watts.
const REST_OF_SYSTEM_W = 150;

export function computeCompatibility(input: CompatibilityInput): {
  checks: CompatibilityCheck[];
  power: PowerInsight | null;
} {
  const checks: CompatibilityCheck[] = [];

  // Socket: CPU vs motherboard.
  checks.push({
    code: 'socket',
    a: input.cpuSocket,
    b: input.moboSocket,
    status:
      input.cpuSocket && input.moboSocket
        ? input.cpuSocket === input.moboSocket
          ? 'ok'
          : 'warn'
        : 'unknown',
  });

  // Memory: RAM type vs motherboard support.
  checks.push({
    code: 'memory',
    a: input.ramMemory,
    b: input.moboMemory,
    status:
      input.ramMemory && input.moboMemory
        ? input.ramMemory === input.moboMemory
          ? 'ok'
          : 'warn'
        : 'unknown',
  });

  // Form factor: does the case fit the board?
  const cap = caseCapacityRank(input.caseForm);
  const brd = boardRank(input.moboForm);
  checks.push({
    code: 'formFactor',
    a: input.caseForm,
    b: input.moboForm,
    status: cap !== null && brd !== null ? (cap >= brd ? 'ok' : 'warn') : 'unknown',
  });

  // PSU headroom vs estimated draw.
  let power: PowerInsight | null = null;
  if (input.cpuTdp !== null && input.gpuTdp !== null) {
    const estimatedDrawW = input.cpuTdp + input.gpuTdp + REST_OF_SYSTEM_W;
    const recommendedPsuW = Math.ceil((estimatedDrawW * 1.3) / 50) * 50;
    const chosenPsuW = input.psuWatts ?? null;
    const headroomPct =
      chosenPsuW !== null
        ? Math.round(((chosenPsuW - estimatedDrawW) / estimatedDrawW) * 100)
        : null;
    power = { estimatedDrawW, recommendedPsuW, chosenPsuW, headroomPct };
    checks.push({
      code: 'psu',
      a: chosenPsuW !== null ? `${chosenPsuW}W` : null,
      b: `${recommendedPsuW}W`,
      status: chosenPsuW === null ? 'unknown' : chosenPsuW >= recommendedPsuW ? 'ok' : 'warn',
    });
  } else {
    checks.push({
      code: 'psu',
      a: input.psuWatts ? `${input.psuWatts}W` : null,
      b: null,
      status: 'unknown',
    });
  }

  // Cooler adequacy: a plain air cooler on a high-TDP CPU gets a soft warning.
  const highTdp = (input.cpuTdp ?? 0) >= 125;
  const isAir = input.coolerType ? /air/i.test(input.coolerType) : false;
  checks.push({
    code: 'cooler',
    a: input.coolerType,
    b: input.cpuTdp !== null ? `${input.cpuTdp}W` : null,
    status:
      !input.coolerType || input.cpuTdp === null ? 'unknown' : highTdp && isAir ? 'warn' : 'ok',
  });

  return { checks, power };
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
