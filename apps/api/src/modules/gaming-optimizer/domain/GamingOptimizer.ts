// Deterministic gaming performance estimator. Given a GPU (and optionally a
// CPU), predict FPS per quality preset at a resolution + game profile, and
// recommend upscaling + settings. Transparent weights, no AI. Reuses the same
// power-scoring philosophy as the bottleneck algorithm.

import type { ProcessorSnapshot } from '../../comparisons/domain/ComparisonEngine.js';

export const GAMING_ALGORITHM_VERSION = '2026.06.0';

export type Resolution = '1080p' | '1440p' | '4K';
export type GameProfile = 'esports' | 'aaa' | 'vr' | 'simulation';
export type Preset = 'low' | 'medium' | 'high' | 'ultra';

export interface PresetFps {
  preset: Preset;
  avgFps: number;
  onePercentLowFps: number;
}

export interface GamingResult {
  gpuPower: number;
  cpuPower: number | null;
  resolution: Resolution;
  profile: GameProfile;
  presets: PresetFps[];
  recommendedPreset: Preset;
  upscaling: { recommended: boolean; tech: 'DLSS' | 'FSR' | 'XeSS' | 'none'; note: string };
  settingsTips: string[];
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
    const baseHigh = REFERENCE_HIGH_FPS[resolution][profile];

    // CPU sets a frame ceiling that matters most at low resolution / esports.
    const cpuCeiling =
      cpuPower !== null
        ? baseHigh *
          (cpuPower / 100) *
          (resolution === '1080p' ? 1.5 : resolution === '1440p' ? 2.0 : 3.0)
        : Infinity;

    const presets: PresetFps[] = PRESETS.map((preset) => {
      const raw = baseHigh * (gpuPower / 100) * PRESET_MULTIPLIER[preset];
      const avg = Math.max(5, Math.round(Math.min(raw, cpuCeiling)));
      return { preset, avgFps: avg, onePercentLowFps: Math.round(avg * 0.7) };
    });

    const cpuLimited =
      cpuPower !== null &&
      presets.some(
        (p) => baseHigh * (gpuPower / 100) * PRESET_MULTIPLIER[p.preset] > cpuCeiling + 1,
      );

    return {
      gpuPower,
      cpuPower,
      resolution,
      profile,
      presets,
      recommendedPreset: this.pickPreset(presets, profile),
      upscaling: this.upscaling(gpu, resolution, presets),
      settingsTips: this.tips(resolution, profile, cpuLimited),
      cpuLimited,
      algorithmVersion: GAMING_ALGORITHM_VERSION,
    };
  }

  // Highest preset that still clears the profile's target FPS.
  private pickPreset(presets: PresetFps[], profile: GameProfile): Preset {
    const target = profile === 'esports' ? 144 : profile === 'vr' ? 90 : 60;
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
      return {
        recommended: true,
        tech,
        note: `Enable ${tech} (Quality mode) to lift frame rates at ${resolution} with minimal visual loss.`,
      };
    }
    return { recommended: false, tech: 'none', note: 'Native resolution is comfortable here.' };
  }

  private tips(resolution: Resolution, profile: GameProfile, cpuLimited: boolean): string[] {
    const tips: string[] = [];
    if (profile === 'esports') {
      tips.push('Lower shadows and reflections to maximise frame rate and reduce input latency.');
    }
    if (resolution === '4K') {
      tips.push('Texture quality is nearly free at 4K with enough VRAM — keep it high.');
    }
    if (cpuLimited) {
      tips.push('You are CPU-limited: raising resolution or settings will not lower FPS much.');
    }
    tips.push('Cap FPS slightly below your monitor refresh rate for smoother frametimes.');
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
