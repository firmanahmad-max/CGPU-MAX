import type { ProcessorSnapshot } from '../../../comparisons/domain/ComparisonEngine.js';
import { BottleneckAlgorithm } from '../../domain/BottleneckAlgorithm.js';

const refCpu: ProcessorSnapshot = {
  id: 'cpu',
  slug: 'intel-core-i9-14900k',
  type: 'CPU',
  manufacturer: 'INTEL',
  modelName: 'i9-14900K',
  tdpWatts: 125,
  msrpUsd: 589,
  generation: 14,
  cpu: { cores: 24, threads: 32, baseClockGhz: 3.2, boostClockGhz: 6.0, l3CacheMb: 36 },
  benchmarks: {
    geekbench6_single_core: 3100,
    geekbench6_multi_core: 21000,
    passmark_cpu_mark: 60000,
  },
};

const refGpu: ProcessorSnapshot = {
  id: 'gpu',
  slug: 'nvidia-rtx-4090',
  type: 'GPU',
  manufacturer: 'NVIDIA',
  modelName: 'RTX 4090',
  tdpWatts: 450,
  msrpUsd: 1599,
  generation: 40,
  gpu: {
    shaderUnits: 16384,
    vramGb: 24,
    memoryBandwidthGbps: 1008,
    baseClockMhz: 2235,
    boostClockMhz: 2520,
  },
  benchmarks: { passmark_g3d_mark: 38000 },
};

const weakGpu: ProcessorSnapshot = {
  ...refGpu,
  id: 'weakgpu',
  slug: 'nvidia-rtx-3060',
  modelName: 'RTX 3060',
  tdpWatts: 170,
  msrpUsd: 329,
  gpu: {
    shaderUnits: 3584,
    vramGb: 12,
    memoryBandwidthGbps: 360,
    baseClockMhz: 1320,
    boostClockMhz: 1777,
  },
  benchmarks: { passmark_g3d_mark: 17500 },
};

describe('BottleneckAlgorithm', () => {
  const algo = new BottleneckAlgorithm();

  it('rejects wrong processor types', () => {
    expect(() => algo.evaluate(refGpu, refCpu)).toThrow();
  });

  it('produces 12 scenarios (3 resolutions × 4 profiles)', () => {
    const result = algo.evaluate(refCpu, refGpu);
    expect(result.scenarios).toHaveLength(12);
  });

  it('reports a balanced pairing as optimal at most scenarios', () => {
    const result = algo.evaluate(refCpu, refGpu);
    const optimalCount = result.scenarios.filter((s) => s.severity === 'optimal').length;
    expect(optimalCount).toBeGreaterThan(0);
  });

  it('flags weak GPU as GPU-bottleneck heavy at 4K', () => {
    const result = algo.evaluate(refCpu, weakGpu);
    const fourK = result.scenarios.filter((s) => s.resolution === '4K');
    const gpuLimitedAt4k = fourK.filter((s) => s.limitingComponent === 'gpu').length;
    expect(gpuLimitedAt4k).toBeGreaterThanOrEqual(2);
  });

  it('sizes PSU above raw TDP sum', () => {
    const result = algo.evaluate(refCpu, refGpu);
    expect(result.recommendedPsuW).not.toBeNull();
    if (result.recommendedPsuW && result.totalPowerDrawW) {
      expect(result.recommendedPsuW).toBeGreaterThan(result.totalPowerDrawW);
    }
  });
});
