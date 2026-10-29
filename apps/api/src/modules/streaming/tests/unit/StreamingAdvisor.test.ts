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

  // Regression: 120 fps used to get the same bitrate as 60 fps.
  it('recommends more bitrate for 120 fps than for 60 fps', () => {
    const base = {
      gpuManufacturer: 'NVIDIA' as const,
      platform: 'youtube' as const,
      resolution: '1080p' as const,
      uploadMbps: 1000,
    };
    const at60 = planStream({ ...base, fps: 60 });
    const at120 = planStream({ ...base, fps: 120 });
    expect(at120.recommendedBitrateKbps).toBeGreaterThan(at60.recommendedBitrateKbps);
  });

  it('lets the GPU model change the quality verdict and unlock AV1 savings', () => {
    const tight = {
      platform: 'youtube' as const,
      resolution: '1080p' as const,
      fps: 60,
      uploadMbps: 7, // caps bitrate below ideal
    };
    const modern = planStream({
      ...tight,
      gpuManufacturer: 'NVIDIA',
      gpuModelName: 'GeForce RTX 4070',
    });
    const old = planStream({
      ...tight,
      gpuManufacturer: 'NVIDIA',
      gpuModelName: 'GeForce GTX 1060',
    });
    expect(modern.encoder.av1).toBe(true);
    expect(modern.av1SuggestedKbps).toBeLessThan(modern.recommendedBitrateKbps);
    expect(old.encoder.quality).toBe('basic');
    expect(old.av1SuggestedKbps).toBeNull();
    const rank = { limited: 0, good: 1, great: 2 } as const;
    expect(rank[modern.qualityVerdict]).toBeGreaterThan(rank[old.qualityVerdict]);
  });

  it('flags whether the CPU can run software x264', () => {
    const base = {
      gpuManufacturer: 'NVIDIA' as const,
      platform: 'twitch' as const,
      resolution: '1080p' as const,
      fps: 60,
      uploadMbps: 20,
    };
    expect(planStream(base).x264Capable).toBeNull();
    expect(planStream({ ...base, cpuCores: 8, cpuThreads: 16 }).x264Capable).toBe(true);
    expect(planStream({ ...base, cpuCores: 4, cpuThreads: 4 }).x264Capable).toBe(false);
  });
});
