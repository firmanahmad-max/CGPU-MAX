import type { ProcessorSnapshot } from '../../../comparisons/domain/ComparisonEngine.js';
import { GamingOptimizer } from '../../domain/GamingOptimizer.js';

const rtx4090: ProcessorSnapshot = {
  id: 'g',
  slug: 'nvidia-rtx-4090',
  type: 'GPU',
  manufacturer: 'NVIDIA',
  modelName: 'RTX 4090',
  tdpWatts: 450,
  msrpUsd: 1599,
  generation: 40,
  gpu: { shaderUnits: 16384, vramGb: 24, memoryBandwidthGbps: 1008, baseClockMhz: 2235, boostClockMhz: 2520 },
  benchmarks: { passmark_g3d_mark: 38000 },
};

const rtx3060: ProcessorSnapshot = {
  ...rtx4090,
  id: 'w',
  slug: 'nvidia-rtx-3060',
  modelName: 'RTX 3060',
  benchmarks: { passmark_g3d_mark: 17500 },
};

describe('GamingOptimizer', () => {
  const opt = new GamingOptimizer();

  it('requires a GPU', () => {
    const fakeCpu = { ...rtx4090, type: 'CPU' as const, gpu: undefined };
    expect(() => opt.evaluate(fakeCpu, '1080p', 'aaa')).toThrow();
  });

  it('produces 4 presets with descending FPS from low→ultra', () => {
    const r = opt.evaluate(rtx4090, '1440p', 'aaa');
    expect(r.presets).toHaveLength(4);
    const low = r.presets.find((p) => p.preset === 'low')!.avgFps;
    const ultra = r.presets.find((p) => p.preset === 'ultra')!.avgFps;
    expect(low).toBeGreaterThan(ultra);
  });

  it('recommends upscaling at 4K', () => {
    const r = opt.evaluate(rtx4090, '4K', 'aaa');
    expect(r.upscaling.recommended).toBe(true);
    expect(r.upscaling.tech).toBe('DLSS');
  });

  it('a weaker GPU yields lower FPS than a flagship', () => {
    const strong = opt.evaluate(rtx4090, '1440p', 'aaa').presets.find((p) => p.preset === 'high')!;
    const weak = opt.evaluate(rtx3060, '1440p', 'aaa').presets.find((p) => p.preset === 'high')!;
    expect(strong.avgFps).toBeGreaterThan(weak.avgFps);
  });
});
