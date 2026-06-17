import { performanceScore, valueScore } from '../../domain/scoring.js';

describe('rankings scoring', () => {
  it('scores a CPU from passmark relative to the reference', () => {
    expect(performanceScore({ type: 'CPU', benchmarks: { passmark_cpu_mark: 60000 } })).toBe(100);
    expect(performanceScore({ type: 'CPU', benchmarks: { passmark_cpu_mark: 30000 } })).toBe(50);
  });

  it('falls back to geekbench multi, then to specs', () => {
    expect(performanceScore({ type: 'CPU', benchmarks: { geekbench6_multi_core: 21000 } })).toBe(
      100,
    );
    expect(performanceScore({ type: 'CPU', benchmarks: {}, cores: 24, boostClockGhz: 6.0 })).toBe(
      100,
    );
    expect(performanceScore({ type: 'CPU', benchmarks: {} })).toBeNull();
  });

  it('scores a GPU from G3D mark', () => {
    expect(performanceScore({ type: 'GPU', benchmarks: { passmark_g3d_mark: 38800 } })).toBe(100);
  });

  it('computes value as performance per $1000', () => {
    expect(valueScore(100, 1000)).toBe(100);
    expect(valueScore(50, 250)).toBe(200);
    expect(valueScore(100, null)).toBeNull();
    expect(valueScore(null, 500)).toBeNull();
  });
});
