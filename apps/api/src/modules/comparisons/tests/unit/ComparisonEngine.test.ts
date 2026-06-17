import { ComparisonEngine, type ProcessorSnapshot } from '../../domain/ComparisonEngine.js';

const cpuA: ProcessorSnapshot = {
  id: 'a',
  slug: 'intel-core-i9-14900k',
  type: 'CPU',
  manufacturer: 'INTEL',
  modelName: 'Core i9-14900K',
  tdpWatts: 125,
  msrpUsd: 589,
  generation: 14,
  cpu: { cores: 24, threads: 32, baseClockGhz: 3.2, boostClockGhz: 6.0, l3CacheMb: 36 },
  benchmarks: {
    geekbench6_single_core: 3100,
    geekbench6_multi_core: 21000,
    passmark_cpu_mark: 59500,
  },
};

const cpuB: ProcessorSnapshot = {
  id: 'b',
  slug: 'amd-ryzen-9-9950x',
  type: 'CPU',
  manufacturer: 'AMD',
  modelName: 'Ryzen 9 9950X',
  tdpWatts: 170,
  msrpUsd: 649,
  generation: 9,
  cpu: { cores: 16, threads: 32, baseClockGhz: 4.3, boostClockGhz: 5.7, l3CacheMb: 64 },
  benchmarks: {
    geekbench6_single_core: 3300,
    geekbench6_multi_core: 23000,
    passmark_cpu_mark: 65000,
  },
};

describe('ComparisonEngine', () => {
  const engine = new ComparisonEngine();

  it('refuses to compare different processor types', () => {
    const gpuFake: ProcessorSnapshot = { ...cpuB, type: 'GPU', cpu: undefined };
    expect(() => engine.compare(cpuA, gpuFake)).toThrow(/CPU with a GPU/);
  });

  it('produces metric-level winners with delta percentages', () => {
    const outcome = engine.compare(cpuA, cpuB);
    const cores = outcome.metrics.find((m) => m.key === 'cores');
    expect(cores).toBeDefined();
    expect(cores?.winner).toBe('a');
    expect(cores?.deltaPercent).toBeCloseTo(33.33, 1);
  });

  it('picks AMD as overall winner here (higher benchmarks)', () => {
    const outcome = engine.compare(cpuA, cpuB);
    expect(outcome.overallWinner).toBe('b');
    expect(outcome.performanceScore.b).toBeGreaterThan(outcome.performanceScore.a);
  });

  it('computes price-performance with msrp', () => {
    const outcome = engine.compare(cpuA, cpuB);
    expect(outcome.pricePerformanceScore.a).not.toBeNull();
    expect(outcome.pricePerformanceScore.b).not.toBeNull();
    expect(['a', 'b', 'tied']).toContain(outcome.pricePerformanceWinner);
  });

  it('returns tied when values equal', () => {
    const same = { ...cpuA };
    const outcome = engine.compare(cpuA, same);
    expect(outcome.overallWinner).toBe('tied');
  });
});
