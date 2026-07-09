import { categoryScore, performanceScore, valueScore } from '../../domain/scoring.js';

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

  describe('categoryScore', () => {
    const refCpu = {
      type: 'CPU' as const,
      benchmarks: {
        geekbench6_single_core: 3300,
        geekbench6_multi_core: 21000,
        passmark_cpu_mark: 60000,
        cinebench_r23_multi: 44000,
      },
    };

    it('equals performanceScore for the overall category', () => {
      expect(categoryScore(refCpu, 'overall')).toBe(performanceScore(refCpu));
    });

    it('scores reference-level CPU at 100 in every category', () => {
      expect(categoryScore(refCpu, 'gaming')).toBe(100);
      expect(categoryScore(refCpu, 'productivity')).toBe(100);
      expect(categoryScore(refCpu, 'workstation')).toBe(100);
    });

    it('ranks a single-core specialist above a multicore box in gaming, and inversely in workstation', () => {
      // X3D-style: strong single, modest multi, no cinebench edge.
      const gamer = {
        type: 'CPU' as const,
        benchmarks: {
          geekbench6_single_core: 3200,
          geekbench6_multi_core: 15000,
          cinebench_r23_multi: 23000,
        },
      };
      // Threadripper-style: modest single, huge multi.
      const workhorse = {
        type: 'CPU' as const,
        benchmarks: {
          geekbench6_single_core: 2700,
          geekbench6_multi_core: 22000,
          cinebench_r23_multi: 42000,
        },
      };
      expect(categoryScore(gamer, 'gaming')!).toBeGreaterThan(
        categoryScore(workhorse, 'gaming')! - 5,
      );
      expect(categoryScore(workhorse, 'workstation')!).toBeGreaterThan(
        categoryScore(gamer, 'workstation')!,
      );
    });

    it('uses Blender for GPU workstation and G3D for GPU gaming', () => {
      const gpu = {
        type: 'GPU' as const,
        benchmarks: { passmark_g3d_mark: 19400, blender_gpu: 6500 },
      };
      expect(categoryScore(gpu, 'gaming')).toBe(50);
      expect(categoryScore(gpu, 'workstation')).toBe(50);
      expect(categoryScore(gpu, 'productivity')).toBe(50);
    });

    it('falls back to performanceScore when category benchmarks are missing', () => {
      const g3dOnly = { type: 'GPU' as const, benchmarks: { passmark_g3d_mark: 38800 } };
      expect(categoryScore(g3dOnly, 'workstation')).toBe(100); // falls back
      const bare = { type: 'CPU' as const, benchmarks: {} };
      expect(categoryScore(bare, 'gaming')).toBeNull();
    });
  });
});
