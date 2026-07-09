// Pure ranking scores. Performance is a benchmark-derived 0..~100+ index
// normalized to a reference flagship; value is performance per $1000 MSRP.
// No DB, no framework.

export interface ScoreInput {
  type: 'CPU' | 'GPU';
  benchmarks: Record<string, number>;
  cores?: number | null;
  boostClockGhz?: number | null;
  shaderUnits?: number | null;
  boostClockMhz?: number | null;
}

export type RankingCategory = 'overall' | 'gaming' | 'productivity' | 'workstation';

// Reference points (~Core i9-14900K / RTX 4090) so 100 ≈ current flagship.
const CPU_PASSMARK_REF = 60000;
const CPU_GB_MULTI_REF = 21000;
const CPU_GB_SINGLE_REF = 3300;
const CPU_CB23_MULTI_REF = 44000;
const GPU_G3D_REF = 38800;
const GPU_BLENDER_REF = 13000;

export function performanceScore(input: ScoreInput): number | null {
  if (input.type === 'CPU') {
    const pm = input.benchmarks['passmark_cpu_mark'];
    if (pm) return round1((pm / CPU_PASSMARK_REF) * 100);
    const gb = input.benchmarks['geekbench6_multi_core'];
    if (gb) return round1((gb / CPU_GB_MULTI_REF) * 100);
    if (input.cores && input.boostClockGhz) {
      return round1(((input.cores * input.boostClockGhz) / (24 * 6.0)) * 100);
    }
    return null;
  }

  const g3d = input.benchmarks['passmark_g3d_mark'];
  if (g3d) return round1((g3d / GPU_G3D_REF) * 100);
  if (input.shaderUnits && input.boostClockMhz) {
    return round1((input.shaderUnits / 16384) * 70 + (input.boostClockMhz / 2520) * 30);
  }
  return null;
}

// Use-case score: a weighted blend of real benchmark axes. Weights are the
// whole algorithm — keep them visible here, not in config.
//   CPU gaming        → single-core dominant (70/30 single/multi)
//   CPU productivity  → multi-core dominant  (35/65 single/multi)
//   CPU workstation   → sustained all-core   (Cinebench R23, else 20/80)
//   GPU gaming        → raster (G3D Mark)
//   GPU productivity  → 50/50 raster + compute
//   GPU workstation   → compute (Blender), else raster
// Falls back to performanceScore when the needed benchmarks are missing so a
// category never silently drops a processor that has an overall score.
export function categoryScore(input: ScoreInput, category: RankingCategory): number | null {
  if (category === 'overall') return performanceScore(input);

  const b = input.benchmarks;
  if (input.type === 'CPU') {
    const single = b['geekbench6_single_core'];
    const multi = b['geekbench6_multi_core'];
    if (category === 'gaming' && single && multi) {
      return round1(((single / CPU_GB_SINGLE_REF) * 0.7 + (multi / CPU_GB_MULTI_REF) * 0.3) * 100);
    }
    if (category === 'productivity' && single && multi) {
      return round1(
        ((single / CPU_GB_SINGLE_REF) * 0.35 + (multi / CPU_GB_MULTI_REF) * 0.65) * 100,
      );
    }
    if (category === 'workstation') {
      const cb23 = b['cinebench_r23_multi'];
      if (cb23) return round1((cb23 / CPU_CB23_MULTI_REF) * 100);
      if (single && multi) {
        return round1(
          ((single / CPU_GB_SINGLE_REF) * 0.2 + (multi / CPU_GB_MULTI_REF) * 0.8) * 100,
        );
      }
    }
    return performanceScore(input);
  }

  const g3d = b['passmark_g3d_mark'];
  const blender = b['blender_gpu'];
  if (category === 'gaming' && g3d) return round1((g3d / GPU_G3D_REF) * 100);
  if (category === 'productivity' && g3d && blender) {
    return round1(((g3d / GPU_G3D_REF) * 0.5 + (blender / GPU_BLENDER_REF) * 0.5) * 100);
  }
  if (category === 'workstation' && blender) return round1((blender / GPU_BLENDER_REF) * 100);
  return performanceScore(input);
}

// Performance per $1000 — higher is better value.
export function valueScore(performance: number | null, msrpUsd: number | null): number | null {
  if (performance === null || !msrpUsd || msrpUsd <= 0) return null;
  return round1((performance / msrpUsd) * 1000);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
