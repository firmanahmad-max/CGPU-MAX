// Deterministic gaming performance estimator. Given a GPU (and optionally a
// CPU), predict FPS per quality preset at a resolution + game profile, and
// recommend upscaling + settings. Transparent weights, no AI. Reuses the same
// power-scoring philosophy as the bottleneck algorithm.

import type { ProcessorSnapshot } from '../../comparisons/domain/ComparisonEngine.js';

export const GAMING_ALGORITHM_VERSION = '2026.06.0';

export type Resolution = '1080p' | '1440p' | '4K';
export type GameProfile = 'esports' | 'aaa' | 'vr' | 'simulation';
export type Preset = 'low' | 'medium' | 'high' | 'ultra';
export type UpscalingNote = 'enableUpscaling' | 'nativeComfortable';
export type TipKey = 'esportsShadows' | 'fourKTextures' | 'cpuLimited' | 'capFps';

export interface PresetFps {
  preset: Preset;
  avgFps: number;
  onePercentLowFps: number;
  meetsTarget: boolean;
}

export interface GamingResult {
  gpuPower: number;
  cpuPower: number | null;
  resolution: Resolution;
  profile: GameProfile;
  presets: PresetFps[];
  recommendedPreset: Preset;
  targetFps: number;
  smoothness: 'smooth' | 'ok' | 'stutter';
  upscaling: {
    recommended: boolean;
    tech: 'DLSS' | 'FSR' | 'XeSS' | 'none';
    noteKey: UpscalingNote;
  };
  // Estimated avg FPS at the recommended preset with upscaling enabled.
  upscaledFps: number | null;
  // GPU memory adequacy for this resolution/profile.
  vram: { gb: number | null; recommendedGb: number; adequate: boolean };
  // Monitor refresh rate the recommended preset comfortably drives.
  refreshTarget: number;
  // Avg FPS (recommended preset) at each resolution — shows how it scales.
  resolutionScaling: { resolution: Resolution; avgFps: number }[];
  tipKeys: TipKey[];
  cpuLimited: boolean;
  algorithmVersion: string;
}

const PRESETS: Preset[] = ['low', 'medium', 'high', 'ultra'];

// FPS for a reference 100-power GPU at "high" preset, by resolution × profile.
const REFERENCE_HIGH_FPS: Record<Resolution, Record<GameProfile, number>> = {
  '1080p': { esports: 360, aaa: 150, vr: 120, simulation: 110 },
  '1440p': { esports: 260, aaa: 110, vr: 100, simulation: 85 },
  '4K': { esports: 150, aaa: 65, vr: 80, simulation: 50 },
};

// Multiplier vs the "high" baseline.
const PRESET_MULTIPLIER: Record<Preset, number> = {
  low: 1.6,
  medium: 1.25,
  high: 1.0,
  ultra: 0.78,
};

// Common monitor refresh tiers a build can be paired with.
const REFRESH_TIERS = [60, 75, 100, 120, 144, 165, 180, 240, 360];

// Recommended GPU VRAM (GB) for a resolution; VR/simulation add headroom.
const VRAM_BY_RESOLUTION: Record<Resolution, number> = { '1080p': 6, '1440p': 8, '4K': 12 };

// Upscaling FPS uplift factor — larger at higher resolutions where it helps most.
const UPSCALE_UPLIFT: Record<Resolution, number> = { '1080p': 1.35, '1440p': 1.5, '4K': 1.7 };

const ALL_RESOLUTIONS: Resolution[] = ['1080p', '1440p', '4K'];

export class GamingOptimizer {
  evaluate(
    gpu: ProcessorSnapshot,
    resolution: Resolution,
    profile: GameProfile,
    cpu?: ProcessorSnapshot,
  ): GamingResult {
    if (gpu.type !== 'GPU') throw new Error('A GPU is required');
    if (cpu && cpu.type !== 'CPU') throw new Error('Second processor must be a CPU');

    const gpuPower = this.scoreGpu(gpu);
    const cpuPower = cpu ? this.scoreCpu(cpu) : null;
    const target = this.targetFor(profile);

    const cpuCeiling = this.cpuCeiling(resolution, profile, cpuPower);
    const cpuLimited =
      cpuPower !== null &&
      PRESETS.some(
        (preset) =>
          REFERENCE_HIGH_FPS[resolution][profile] * (gpuPower / 100) * PRESET_MULTIPLIER[preset] >
          cpuCeiling + 1,
      );

    const presets: PresetFps[] = PRESETS.map((preset) => {
      const avg = this.avgFps(resolution, profile, preset, gpuPower, cpuCeiling);
      // Frame-time consistency dips when the CPU is the limiter.
      const lowRatio = cpuLimited ? 0.62 : 0.72;
      return {
        preset,
        avgFps: avg,
        onePercentLowFps: Math.round(avg * lowRatio),
        meetsTarget: avg >= target,
      };
    });

    const recommendedPreset = this.pickPreset(presets, target);
    const recAvg = presets.find((p) => p.preset === recommendedPreset)?.avgFps ?? 0;
    const upscaling = this.upscaling(gpu, resolution, presets);

    return {
      gpuPower,
      cpuPower,
      resolution,
      profile,
      presets,
      recommendedPreset,
      targetFps: target,
      smoothness: this.smoothness(recAvg, target, cpuLimited),
      upscaling,
      upscaledFps: upscaling.recommended ? Math.round(recAvg * UPSCALE_UPLIFT[resolution]) : null,
      vram: this.vram(gpu, resolution, profile),
      refreshTarget: this.refreshTarget(recAvg),
      resolutionScaling: ALL_RESOLUTIONS.map((r) => ({
        resolution: r,
        avgFps: this.avgFps(
          r,
          profile,
          recommendedPreset,
          gpuPower,
          this.cpuCeiling(r, profile, cpuPower),
        ),
      })),
      tipKeys: this.tips(resolution, profile, cpuLimited),
      cpuLimited,
      algorithmVersion: GAMING_ALGORITHM_VERSION,
    };
  }

  private targetFor(profile: GameProfile): number {
    return profile === 'esports' ? 144 : profile === 'vr' ? 90 : 60;
  }

  // CPU frame ceiling — tighter at low resolution / esports where CPU matters most.
  private cpuCeiling(
    resolution: Resolution,
    profile: GameProfile,
    cpuPower: number | null,
  ): number {
    if (cpuPower === null) return Infinity;
    const base = REFERENCE_HIGH_FPS[resolution][profile];
    return (
      base * (cpuPower / 100) * (resolution === '1080p' ? 1.5 : resolution === '1440p' ? 2.0 : 3.0)
    );
  }

  private avgFps(
    resolution: Resolution,
    profile: GameProfile,
    preset: Preset,
    gpuPower: number,
    cpuCeiling: number,
  ): number {
    const raw =
      REFERENCE_HIGH_FPS[resolution][profile] * (gpuPower / 100) * PRESET_MULTIPLIER[preset];
    return Math.max(5, Math.round(Math.min(raw, cpuCeiling)));
  }

  private smoothness(
    recAvg: number,
    target: number,
    cpuLimited: boolean,
  ): GamingResult['smoothness'] {
    if (cpuLimited && recAvg < target) return 'stutter';
    if (recAvg >= target * 1.25) return 'smooth';
    if (recAvg >= target) return 'ok';
    return 'stutter';
  }

  private vram(
    gpu: ProcessorSnapshot,
    resolution: Resolution,
    profile: GameProfile,
  ): GamingResult['vram'] {
    const recommendedGb =
      VRAM_BY_RESOLUTION[resolution] + (profile === 'vr' || profile === 'simulation' ? 2 : 0);
    const gb = gpu.gpu?.vramGb ?? null;
    return { gb, recommendedGb, adequate: gb === null ? true : gb >= recommendedGb };
  }

  private refreshTarget(recAvg: number): number {
    let tier = 60;
    for (const r of REFRESH_TIERS) if (recAvg >= r) tier = r;
    return tier;
  }

  // Highest preset that still clears the profile's target FPS.
  private pickPreset(presets: PresetFps[], target: number): Preset {
    const ordered: Preset[] = ['ultra', 'high', 'medium', 'low'];
    for (const preset of ordered) {
      const p = presets.find((x) => x.preset === preset);
      if (p && p.avgFps >= target) return preset;
    }
    return 'low';
  }

  private upscaling(
    gpu: ProcessorSnapshot,
    resolution: Resolution,
    presets: PresetFps[],
  ): GamingResult['upscaling'] {
    const ultra = presets.find((p) => p.preset === 'ultra');
    const struggling = !ultra || ultra.avgFps < 60;
    const tech: 'DLSS' | 'FSR' | 'XeSS' =
      gpu.manufacturer === 'NVIDIA' ? 'DLSS' : gpu.manufacturer === 'INTEL' ? 'XeSS' : 'FSR';
    if (resolution === '4K' || struggling) {
      return { recommended: true, tech, noteKey: 'enableUpscaling' };
    }
    return { recommended: false, tech: 'none', noteKey: 'nativeComfortable' };
  }

  // Returns i18n keys; the web layer localizes them (see gaming.tip.* messages).
  private tips(resolution: Resolution, profile: GameProfile, cpuLimited: boolean): TipKey[] {
    const tips: TipKey[] = [];
    if (profile === 'esports') tips.push('esportsShadows');
    if (resolution === '4K') tips.push('fourKTextures');
    if (cpuLimited) tips.push('cpuLimited');
    tips.push('capFps');
    return tips;
  }

  private scoreCpu(cpu: ProcessorSnapshot): number {
    const s = cpu.benchmarks['geekbench6_single_core'];
    const m = cpu.benchmarks['geekbench6_multi_core'];
    const pm = cpu.benchmarks['passmark_cpu_mark'];
    const parts: number[] = [];
    if (s) parts.push((s / 3100) * 100);
    if (m) parts.push((m / 21000) * 100);
    if (pm) parts.push((pm / 60000) * 100);
    if (parts.length) return round1(parts.reduce((a, b) => a + b, 0) / parts.length);
    const cores = cpu.cpu?.cores ?? 0;
    const boost = cpu.cpu?.boostClockGhz ?? cpu.cpu?.baseClockGhz ?? 0;
    return cores && boost ? round1(((cores * boost) / (24 * 6.0)) * 100) : 50;
  }

  private scoreGpu(gpu: ProcessorSnapshot): number {
    const g3d = gpu.benchmarks['passmark_g3d_mark'];
    if (g3d) return round1((g3d / 38000) * 100);
    const shaders = gpu.gpu?.shaderUnits ?? 0;
    const boost = gpu.gpu?.boostClockMhz ?? 0;
    const bw = gpu.gpu?.memoryBandwidthGbps ?? 0;
    if (shaders && boost) {
      return round1((shaders / 16384) * 60 + (bw ? (bw / 1008) * 25 : 15) + (boost / 2520) * 15);
    }
    return 50;
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
