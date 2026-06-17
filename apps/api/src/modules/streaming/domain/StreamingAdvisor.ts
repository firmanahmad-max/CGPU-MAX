// Deterministic streaming configuration advisor: encoder selection and
// bitrate/bandwidth recommendation per platform, resolution, and fps.

import type { Manufacturer } from '@cgpu-max/types';

export type Platform = 'twitch' | 'youtube' | 'kick';
export type StreamResolution = '720p' | '1080p' | '1440p' | '4K';

export interface EncoderChoice {
  encoder: 'NVENC' | 'QuickSync' | 'AMF' | 'x264';
  hardware: boolean;
  reason: string;
  x264Preset?: string;
}

export interface StreamingResult {
  encoder: EncoderChoice;
  recommendedBitrateKbps: number;
  maxPlatformBitrateKbps: number;
  uploadHeadroomMbps: number;
  keyframeIntervalSec: number;
  warnings: string[];
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

export function recommendEncoder(gpuManufacturer: Manufacturer | null): EncoderChoice {
  switch (gpuManufacturer) {
    case 'NVIDIA':
      return {
        encoder: 'NVENC',
        hardware: true,
        reason: 'NVENC (Turing+) offloads encoding from the CPU with near-x264-medium quality.',
      };
    case 'AMD':
      return {
        encoder: 'AMF',
        hardware: true,
        reason:
          'AMD AMF/VCE hardware encoding frees the CPU; use the latest drivers for best quality.',
      };
    case 'INTEL':
      return {
        encoder: 'QuickSync',
        hardware: true,
        reason:
          'Intel Quick Sync provides efficient hardware encoding, ideal for single-PC setups.',
      };
    default:
      return {
        encoder: 'x264',
        hardware: false,
        reason: 'No hardware encoder detected — x264 (CPU) encoding. Needs spare CPU headroom.',
        x264Preset: 'veryfast',
      };
  }
}

export function planStream(params: {
  gpuManufacturer: Manufacturer | null;
  platform: Platform;
  resolution: StreamResolution;
  fps: number;
  uploadMbps: number;
}): StreamingResult {
  const encoder = recommendEncoder(params.gpuManufacturer);
  const platformMax = PLATFORM_MAX_KBPS[params.platform];

  const fpsFactor = params.fps >= 60 ? 1 : 0.7;
  const ideal = Math.round(BASE_BITRATE_60[params.resolution] * fpsFactor);

  // Don't exceed the platform cap or ~80% of the user's measured upload.
  const uploadCapKbps = Math.round(params.uploadMbps * 1000 * 0.8);
  const recommended = Math.min(ideal, platformMax, uploadCapKbps);

  const warnings: string[] = [];
  if (recommended < ideal) {
    if (uploadCapKbps < ideal && uploadCapKbps <= platformMax) {
      warnings.push(
        `Your upload (${params.uploadMbps} Mbps) limits quality — recommended bitrate capped at ${recommended} kbps.`,
      );
    }
    if (platformMax < ideal) {
      warnings.push(
        `${params.platform} caps ingest at ${platformMax} kbps; ${params.resolution}@${params.fps} would ideally use ${ideal} kbps.`,
      );
    }
  }
  if (params.resolution === '4K' && params.platform === 'twitch') {
    warnings.push('Twitch does not officially support 4K ingest — consider 1080p/1440p.');
  }

  return {
    encoder,
    recommendedBitrateKbps: recommended,
    maxPlatformBitrateKbps: platformMax,
    uploadHeadroomMbps: Math.round((params.uploadMbps - recommended / 1000) * 10) / 10,
    keyframeIntervalSec: 2,
    warnings,
  };
}
