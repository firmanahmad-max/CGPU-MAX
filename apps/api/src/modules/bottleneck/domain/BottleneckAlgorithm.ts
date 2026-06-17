// Bottleneck algorithm v2026.06.0 — transparent, deterministic, no AI fallback.
// Inputs: CPU + GPU snapshots with TDP, specs, and a benchmark map.
// Output: per-resolution × per-profile bottleneck percentage, severity, and
// FPS range estimate. Also reports thermal load + recommended PSU size.
//
// Methodology in plain words:
// 1. Compute a normalized "raw power" score for CPU and GPU from benchmark
//    aggregates with spec-based fallbacks (so it still works when data is
//    sparse — early DB, new SKU, etc.).
// 2. For each (resolution, profile) combo, we apply weights to translate raw
//    power into "effective load demanded from each component". Higher
//    resolutions weight the GPU more; esports/competitive workloads weight
//    the CPU more.
// 3. The bottleneck percentage is the relative gap between effective demand
//    on the limiting side vs the other side: |demandLimit - demandOther| /
//    demandLimit. Anything <=5% is "optimal".
// 4. Severity buckets are bucketed per spec § Bottleneck Calculator.
//
// All weights live in this file so the calculation is auditable.

import type { GameProfile, LimitingComponent, Resolution } from '@cgpu-max/types';

import type { ProcessorSnapshot } from '../../comparisons/domain/ComparisonEngine.js';

export const BOTTLENECK_ALGORITHM_VERSION = '2026.06.0';

export interface BottleneckScenario {
  resolution: Resolution;
  profile: GameProfile;
  bottleneckPercentage: number;
  limitingComponent: LimitingComponent;
  severity: 'optimal' | 'minor' | 'moderate' | 'significant' | 'severe';
  expectedFpsRange: { min: number; max: number } | null;
}

export interface BottleneckOutcome {
  cpuPower: number;
  gpuPower: number;
  scenarios: BottleneckScenario[];
  thermalEstimateC: number | null;
  totalPowerDrawW: number | null;
  recommendedPsuW: number | null;
  recommendations: string[];
  algorithmVersion: string;
}

const RESOLUTIONS: Resolution[] = ['1080p', '1440p', '4K'];
const PROFILES: GameProfile[] = ['esports', 'aaa', 'vr', 'creative'];

// Weights are (cpuWeight, gpuWeight). The pair sums to ~1.0 conceptually but
// scaling is what matters — only ratios are used.
const SCENARIO_WEIGHTS: Record<Resolution, Record<GameProfile, { cpu: number; gpu: number }>> = {
  '1080p': {
    esports: { cpu: 0.7, gpu: 0.3 },
    aaa: { cpu: 0.5, gpu: 0.5 },
    vr: { cpu: 0.45, gpu: 0.55 },
    creative: { cpu: 0.6, gpu: 0.4 },
  },
  '1440p': {
    esports: { cpu: 0.55, gpu: 0.45 },
    aaa: { cpu: 0.35, gpu: 0.65 },
    vr: { cpu: 0.3, gpu: 0.7 },
    creative: { cpu: 0.45, gpu: 0.55 },
  },
  '4K': {
    esports: { cpu: 0.35, gpu: 0.65 },
    aaa: { cpu: 0.2, gpu: 0.8 },
    vr: { cpu: 0.18, gpu: 0.82 },
    creative: { cpu: 0.3, gpu: 0.7 },
  },
};

// Approximate FPS ranges at "balanced reference" (a hypothetical 100/100 build).
// Real FPS is scaled by the limiting component's power.
const REFERENCE_FPS: Record<Resolution, Record<GameProfile, { min: number; max: number }>> = {
  '1080p': {
    esports: { min: 240, max: 360 },
    aaa: { min: 120, max: 180 },
    vr: { min: 90, max: 144 },
    creative: { min: 60, max: 120 },
  },
  '1440p': {
    esports: { min: 165, max: 240 },
    aaa: { min: 80, max: 120 },
    vr: { min: 72, max: 120 },
    creative: { min: 40, max: 80 },
  },
  '4K': {
    esports: { min: 100, max: 144 },
    aaa: { min: 50, max: 80 },
    vr: { min: 60, max: 90 },
    creative: { min: 24, max: 60 },
  },
};

export class BottleneckAlgorithm {
  evaluate(cpu: ProcessorSnapshot, gpu: ProcessorSnapshot): BottleneckOutcome {
    if (cpu.type !== 'CPU') {
      throw new Error('First argument must be a CPU');
    }
    if (gpu.type !== 'GPU') {
      throw new Error('Second argument must be a GPU');
    }

    const cpuPower = this.scoreCpu(cpu);
    const gpuPower = this.scoreGpu(gpu);

    const scenarios: BottleneckScenario[] = [];
    for (const resolution of RESOLUTIONS) {
      for (const profile of PROFILES) {
        scenarios.push(this.evaluateScenario(resolution, profile, cpuPower, gpuPower));
      }
    }

    const totalPower = (cpu.tdpWatts ?? 0) + (gpu.tdpWatts ?? 0);
    const totalPowerDrawW = totalPower > 0 ? totalPower : null;
    const recommendedPsuW =
      totalPowerDrawW !== null ? Math.ceil(((totalPowerDrawW + 150) * 1.3) / 50) * 50 : null;
    const thermalEstimateC =
      totalPowerDrawW !== null ? Math.min(95, 40 + Math.round(totalPowerDrawW / 12)) : null;

    return {
      cpuPower,
      gpuPower,
      scenarios,
      totalPowerDrawW,
      recommendedPsuW,
      thermalEstimateC,
      recommendations: this.buildRecommendations(cpuPower, gpuPower, scenarios),
      algorithmVersion: BOTTLENECK_ALGORITHM_VERSION,
    };
  }

  private evaluateScenario(
    resolution: Resolution,
    profile: GameProfile,
    cpuPower: number,
    gpuPower: number,
  ): BottleneckScenario {
    const weights = SCENARIO_WEIGHTS[resolution][profile];
    const cpuDemand = cpuPower / weights.cpu;
    const gpuDemand = gpuPower / weights.gpu;

    let limitingComponent: LimitingComponent;
    let bottleneckPercentage: number;

    if (cpuDemand >= gpuDemand) {
      // GPU is the bottleneck (cpu can supply more than gpu can deliver here).
      limitingComponent = gpuPower / cpuPower < 0.95 ? 'gpu' : 'balanced';
      const gap = cpuDemand - gpuDemand;
      bottleneckPercentage = round1((gap / cpuDemand) * 100);
    } else {
      limitingComponent = cpuPower / gpuPower < 0.95 ? 'cpu' : 'balanced';
      const gap = gpuDemand - cpuDemand;
      bottleneckPercentage = round1((gap / gpuDemand) * 100);
    }

    const severity = this.bucketSeverity(bottleneckPercentage);
    if (severity === 'optimal') {
      limitingComponent = 'balanced';
    }

    return {
      resolution,
      profile,
      bottleneckPercentage,
      limitingComponent,
      severity,
      expectedFpsRange: this.estimateFps(resolution, profile, cpuPower, gpuPower),
    };
  }

  private bucketSeverity(pct: number): BottleneckScenario['severity'] {
    if (pct <= 5) return 'optimal';
    if (pct <= 12) return 'minor';
    if (pct <= 22) return 'moderate';
    if (pct <= 35) return 'significant';
    return 'severe';
  }

  private estimateFps(
    resolution: Resolution,
    profile: GameProfile,
    cpuPower: number,
    gpuPower: number,
  ): { min: number; max: number } | null {
    const ref = REFERENCE_FPS[resolution][profile];
    // Scale by limiting (min) component, capped at 1.6x to avoid runaway claims.
    const limit = Math.min(cpuPower, gpuPower) / 100;
    const scale = Math.max(0.25, Math.min(1.6, limit));
    return { min: Math.round(ref.min * scale), max: Math.round(ref.max * scale) };
  }

  private scoreCpu(cpu: ProcessorSnapshot): number {
    // Prefer real benchmarks. Normalize against a reference (i9-14900K-ish):
    // Geekbench 6 single ~3100, multi ~21000, PassMark CPU ~60000.
    const gbSingle = cpu.benchmarks['geekbench6_single_core'];
    const gbMulti = cpu.benchmarks['geekbench6_multi_core'];
    const pmCpu = cpu.benchmarks['passmark_cpu_mark'];

    const components: number[] = [];
    if (gbSingle) components.push((gbSingle / 3100) * 100);
    if (gbMulti) components.push((gbMulti / 21000) * 100);
    if (pmCpu) components.push((pmCpu / 60000) * 100);

    if (components.length > 0) {
      return round1(components.reduce((a, b) => a + b, 0) / components.length);
    }

    // Spec-based fallback: (cores * boostClock) / reference.
    const cores = cpu.cpu?.cores ?? 0;
    const boost = cpu.cpu?.boostClockGhz ?? cpu.cpu?.baseClockGhz ?? 0;
    if (cores > 0 && boost > 0) {
      return round1(((cores * boost) / (24 * 6.0)) * 100);
    }
    return 50;
  }

  private scoreGpu(gpu: ProcessorSnapshot): number {
    const pmG3d = gpu.benchmarks['passmark_g3d_mark'];
    const compute = gpu.benchmarks['geekbench_opencl'] ?? gpu.benchmarks['geekbench_vulkan'];

    const components: number[] = [];
    // Reference: RTX 4090 ~38000 G3D, ~290k compute.
    if (pmG3d) components.push((pmG3d / 38000) * 100);
    if (compute) components.push((compute / 290000) * 100);

    if (components.length > 0) {
      return round1(components.reduce((a, b) => a + b, 0) / components.length);
    }

    // Spec-based fallback: weighted shader units + VRAM bandwidth.
    const shaders = gpu.gpu?.shaderUnits ?? 0;
    const bandwidth = gpu.gpu?.memoryBandwidthGbps ?? 0;
    const boost = gpu.gpu?.boostClockMhz ?? 0;
    if (shaders > 0 && boost > 0) {
      const shaderScore = (shaders / 16384) * 60;
      const bwScore = bandwidth ? (bandwidth / 1008) * 25 : 15;
      const clockScore = (boost / 2520) * 15;
      return round1(shaderScore + bwScore + clockScore);
    }
    return 50;
  }

  private buildRecommendations(
    cpuPower: number,
    gpuPower: number,
    scenarios: BottleneckScenario[],
  ): string[] {
    const out: string[] = [];

    const cpuLimited = scenarios.filter((s) => s.limitingComponent === 'cpu').length;
    const gpuLimited = scenarios.filter((s) => s.limitingComponent === 'gpu').length;
    const worst = [...scenarios].sort((a, b) => b.bottleneckPercentage - a.bottleneckPercentage)[0];
    if (!worst) return out;

    if (worst.severity === 'optimal') {
      out.push('This pairing is well balanced across resolutions and game profiles.');
    } else if (cpuLimited > gpuLimited) {
      out.push(
        `CPU bottlenecks in ${cpuLimited}/${scenarios.length} scenarios — consider a higher single-thread CPU or play at higher resolutions (where the GPU does more work).`,
      );
    } else if (gpuLimited > cpuLimited) {
      out.push(
        `GPU bottlenecks in ${gpuLimited}/${scenarios.length} scenarios — consider a stronger GPU or lower the resolution / quality preset.`,
      );
    }

    if (Math.abs(cpuPower - gpuPower) > 40) {
      out.push(
        `Power mismatch is large (CPU ${cpuPower} vs GPU ${gpuPower}). Closer-matched components yield more consistent frametimes.`,
      );
    }

    if (worst.severity === 'severe' || worst.severity === 'significant') {
      out.push(
        `Worst case: ${worst.resolution} ${worst.profile} is ${worst.bottleneckPercentage}% ${worst.limitingComponent}-limited.`,
      );
    }

    return out;
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
