// Deterministic streaming configuration advisor: encoder selection and
// bitrate/bandwidth recommendation per platform, resolution, and fps.

import type { Manufacturer } from '@cgpu-max/types';

export type Platform = 'twitch' | 'youtube' | 'kick';
export type StreamResolution = '720p' | '1080p' | '1440p' | '4K';

export type EncoderReason = 'nvenc' | 'amf' | 'quicksync' | 'x264';

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
}

export interface StreamingResult {
  encoder: EncoderChoice;
  recommendedBitrateKbps: number;
  maxPlatformBitrateKbps: number;
  uploadHeadroomMbps: number;
  keyframeIntervalSec: number;
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

export function recommendEncoder(gpuManufacturer: Manufacturer | null): EncoderChoice {
  switch (gpuManufacturer) {
    case 'NVIDIA':
      return { encoder: 'NVENC', hardware: true, reasonKey: 'nvenc' };
    case 'AMD':
      return { encoder: 'AMF', hardware: true, reasonKey: 'amf' };
    case 'INTEL':
      return { encoder: 'QuickSync', hardware: true, reasonKey: 'quicksync' };
    default:
      return { encoder: 'x264', hardware: false, reasonKey: 'x264', x264Preset: 'veryfast' };
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

  return {
    encoder,
    recommendedBitrateKbps: recommended,
    maxPlatformBitrateKbps: platformMax,
    uploadHeadroomMbps: Math.round((params.uploadMbps - recommended / 1000) * 10) / 10,
    keyframeIntervalSec: 2,
    warnings,
  };
}
