// Deterministic streaming configuration advisor: encoder selection and
// bitrate/bandwidth recommendation per platform, resolution, and fps.

import type { Manufacturer } from '@cgpu-max/types';

export type Platform = 'twitch' | 'youtube' | 'kick';
export type StreamResolution = '720p' | '1080p' | '1440p' | '4K';

export type EncoderReason = 'nvenc' | 'amf' | 'quicksync' | 'x264';
export type EncoderQuality = 'excellent' | 'good' | 'basic';

// i18n descriptors — the web layer localizes them (see streaming.warning.*).
export type StreamWarning =
  | { key: 'uploadLimit'; upload: number; recommended: number }
  | {
      key: 'platformCap';
      platform: string;
      platformMax: number;
      resolution: string;
      fps: number;
      ideal: number;
    }
  | { key: 'twitch4k' };

export interface EncoderChoice {
  encoder: 'NVENC' | 'QuickSync' | 'AMF' | 'x264';
  hardware: boolean;
  reasonKey: EncoderReason;
  x264Preset?: string;
  // Model-derived detail (null when only a vendor brand was given).
  generation: string | null; // e.g. "Ada (RTX 40)"
  quality: EncoderQuality;
  av1: boolean; // GPU has a hardware AV1 encoder
}

export type QualityVerdict = 'great' | 'good' | 'limited';

export interface StreamingResult {
  encoder: EncoderChoice;
  recommendedBitrateKbps: number;
  maxPlatformBitrateKbps: number;
  uploadHeadroomMbps: number;
  keyframeIntervalSec: number;
  // Beginner-friendly, deterministic extras.
  qualityVerdict: QualityVerdict;
  uploadUsagePct: number; // share of the user's upload the stream consumes
  dataPerHourGb: number; // relatable data volume
  outputResolution: StreamResolution; // resolution to actually stream at (may downscale)
  impactsGameFps: boolean; // true for CPU (x264) encoding
  av1SuggestedKbps: number | null; // lower bitrate for equal quality when AV1-capable
  // Selected parts + whether the CPU is strong enough for software x264.
  gpu: { modelName: string } | null;
  cpu: { modelName: string } | null;
  x264Capable: boolean | null;
  warnings: StreamWarning[];
}

// Platform max ingest bitrate (kbps). Twitch's higher tier is non-partner-soft.
const PLATFORM_MAX_KBPS: Record<Platform, number> = {
  twitch: 8000,
  youtube: 51000,
  kick: 12000,
};

// Baseline recommended bitrate (kbps) at 60fps by resolution.
const BASE_BITRATE_60: Record<StreamResolution, number> = {
  '720p': 4500,
  '1080p': 6500,
  '1440p': 13000,
  '4K': 35000,
};

const RES_ORDER: StreamResolution[] = ['720p', '1080p', '1440p', '4K'];

// Vendor-only fallback (no model given). Detail fields stay generic.
export function recommendEncoder(gpuManufacturer: Manufacturer | null): EncoderChoice {
  switch (gpuManufacturer) {
    case 'NVIDIA':
      return {
        encoder: 'NVENC',
        hardware: true,
        reasonKey: 'nvenc',
        generation: null,
        quality: 'good',
        av1: false,
      };
    case 'AMD':
      return {
        encoder: 'AMF',
        hardware: true,
        reasonKey: 'amf',
        generation: null,
        quality: 'good',
        av1: false,
      };
    case 'INTEL':
      return {
        encoder: 'QuickSync',
        hardware: true,
        reasonKey: 'quicksync',
        generation: null,
        quality: 'good',
        av1: false,
      };
    default:
      return {
        encoder: 'x264',
        hardware: false,
        reasonKey: 'x264',
        x264Preset: 'veryfast',
        generation: null,
        quality: 'basic',
        av1: false,
      };
  }
}

// Model-aware detection: encoder generation, relative quality, and AV1 support
// inferred from the GPU family in the model name.
export function recommendEncoderForModel(
  manufacturer: Manufacturer | null,
  modelName: string,
): EncoderChoice {
  const n = modelName.toUpperCase();
  const pick = (
    generation: string,
    quality: EncoderQuality,
    av1: boolean,
  ): Pick<EncoderChoice, 'generation' | 'quality' | 'av1'> => ({ generation, quality, av1 });

  if (manufacturer === 'NVIDIA') {
    const d = /RTX\s?50/.test(n)
      ? pick('Blackwell (RTX 50)', 'excellent', true)
      : /RTX\s?40/.test(n)
        ? pick('Ada (RTX 40)', 'excellent', true)
        : /RTX\s?30/.test(n)
          ? pick('Ampere (RTX 30)', 'good', false)
          : /RTX\s?20/.test(n)
            ? pick('Turing (RTX 20)', 'good', false)
            : /GTX\s?16/.test(n)
              ? pick('Turing (GTX 16)', 'good', false)
              : /GTX\s?10/.test(n)
                ? pick('Pascal (GTX 10)', 'basic', false)
                : pick('NVENC', 'good', false);
    return { encoder: 'NVENC', hardware: true, reasonKey: 'nvenc', ...d };
  }
  if (manufacturer === 'AMD') {
    const d = /RX\s?9\d{3}/.test(n)
      ? pick('RDNA 4 (RX 9000)', 'excellent', true)
      : /RX\s?7\d{3}/.test(n)
        ? pick('RDNA 3 (RX 7000)', 'excellent', true)
        : /RX\s?6\d{3}/.test(n)
          ? pick('RDNA 2 (RX 6000)', 'good', false)
          : /RX\s?5\d{3}/.test(n)
            ? pick('RDNA (RX 5000)', 'basic', false)
            : pick('AMF', 'good', false);
    return { encoder: 'AMF', hardware: true, reasonKey: 'amf', ...d };
  }
  if (manufacturer === 'INTEL') {
    const d = /ARC|\bB\d{3}\b|\bA\d{3}\b/.test(n)
      ? pick('Arc', 'excellent', true)
      : pick('Quick Sync', 'good', false);
    return { encoder: 'QuickSync', hardware: true, reasonKey: 'quicksync', ...d };
  }
  return recommendEncoder(null);
}

export function planStream(params: {
  gpuManufacturer: Manufacturer | null;
  gpuModelName?: string | null;
  cpuModelName?: string | null;
  cpuCores?: number | null;
  cpuThreads?: number | null;
  platform: Platform;
  resolution: StreamResolution;
  fps: number;
  uploadMbps: number;
}): StreamingResult {
  const encoder = params.gpuModelName
    ? recommendEncoderForModel(params.gpuManufacturer, params.gpuModelName)
    : recommendEncoder(params.gpuManufacturer);
  const platformMax = PLATFORM_MAX_KBPS[params.platform];

  const fpsFactor = params.fps >= 60 ? 1 : 0.7;
  const ideal = Math.round(BASE_BITRATE_60[params.resolution] * fpsFactor);

  // Don't exceed the platform cap or ~80% of the user's measured upload.
  const uploadCapKbps = Math.round(params.uploadMbps * 1000 * 0.8);
  const recommended = Math.min(ideal, platformMax, uploadCapKbps);

  const warnings: StreamWarning[] = [];
  if (recommended < ideal) {
    if (uploadCapKbps < ideal && uploadCapKbps <= platformMax) {
      warnings.push({ key: 'uploadLimit', upload: params.uploadMbps, recommended });
    }
    if (platformMax < ideal) {
      warnings.push({
        key: 'platformCap',
        platform: params.platform,
        platformMax,
        resolution: params.resolution,
        fps: params.fps,
        ideal,
      });
    }
  }
  if (params.resolution === '4K' && params.platform === 'twitch') {
    warnings.push({ key: 'twitch4k' });
  }

  // Quality vs the ideal bitrate for the desired resolution — nudged by the
  // encoder's real quality (a modern GPU squeezes more image out of the same
  // bitrate; an old one, less). This is where the GPU model changes the verdict.
  const ratio = ideal > 0 ? recommended / ideal : 1;
  const qualityFactor =
    encoder.quality === 'excellent' ? 1.1 : encoder.quality === 'basic' ? 0.85 : 1;
  const effRatio = ratio * qualityFactor;
  const qualityVerdict: QualityVerdict =
    effRatio >= 0.95 ? 'great' : effRatio >= 0.75 ? 'good' : 'limited';

  // AV1 is ~30% more efficient than H.264, so an AV1-capable GPU can hit the
  // same quality at a lower bitrate — a concrete payoff of the model.
  const av1SuggestedKbps = encoder.av1 ? Math.round(recommended / 1.3 / 50) * 50 : null;

  // Highest resolution (no higher than the desired one) the recommended bitrate
  // can actually sustain — tells a beginner to stream at a lower res when capped.
  const inputIdx = RES_ORDER.indexOf(params.resolution);
  let outputResolution: StreamResolution = '720p';
  for (let i = 0; i <= inputIdx; i++) {
    const r = RES_ORDER[i]!;
    if (BASE_BITRATE_60[r] * fpsFactor <= recommended * 1.15) outputResolution = r;
  }

  return {
    encoder,
    recommendedBitrateKbps: recommended,
    maxPlatformBitrateKbps: platformMax,
    uploadHeadroomMbps: Math.round((params.uploadMbps - recommended / 1000) * 10) / 10,
    keyframeIntervalSec: 2,
    qualityVerdict,
    uploadUsagePct:
      params.uploadMbps > 0
        ? Math.min(100, Math.round((recommended / 1000 / params.uploadMbps) * 100))
        : 100,
    dataPerHourGb: Math.round(((recommended * 3600) / 8 / 1_000_000) * 10) / 10,
    outputResolution,
    impactsGameFps: !encoder.hardware,
    av1SuggestedKbps,
    gpu: params.gpuModelName ? { modelName: params.gpuModelName } : null,
    cpu: params.cpuModelName ? { modelName: params.cpuModelName } : null,
    // Strong enough to also run software x264 (higher quality) with headroom.
    x264Capable:
      params.cpuCores == null && params.cpuThreads == null
        ? null
        : (params.cpuCores ?? 0) >= 8 && (params.cpuThreads ?? 0) >= 12,
    warnings,
  };
}
