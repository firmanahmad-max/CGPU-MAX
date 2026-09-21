import { planStream, recommendEncoder } from '../../domain/StreamingAdvisor.js';

describe('StreamingAdvisor', () => {
  it('selects NVENC for Nvidia, QuickSync for Intel, AMF for AMD, x264 otherwise', () => {
    expect(recommendEncoder('NVIDIA').encoder).toBe('NVENC');
    expect(recommendEncoder('INTEL').encoder).toBe('QuickSync');
    expect(recommendEncoder('AMD').encoder).toBe('AMF');
    expect(recommendEncoder(null).encoder).toBe('x264');
  });

  it('caps bitrate to the platform max', () => {
    const r = planStream({
      gpuManufacturer: 'NVIDIA',
      platform: 'twitch',
      resolution: '1440p',
      fps: 60,
      uploadMbps: 1000,
    });
    expect(r.recommendedBitrateKbps).toBeLessThanOrEqual(r.maxPlatformBitrateKbps);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it('caps bitrate to ~80% of a low upload', () => {
    const r = planStream({
      gpuManufacturer: 'NVIDIA',
      platform: 'youtube',
      resolution: '1080p',
      fps: 60,
      uploadMbps: 5,
    });
    expect(r.recommendedBitrateKbps).toBeLessThanOrEqual(4000);
  });

  it('warns about 4K on Twitch', () => {
    const r = planStream({
      gpuManufacturer: 'NVIDIA',
      platform: 'twitch',
      resolution: '4K',
      fps: 60,
      uploadMbps: 1000,
    });
    expect(r.warnings.some((w) => w.key === 'twitch4k')).toBe(true);
  });
});
