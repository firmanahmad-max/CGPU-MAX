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

// Reference points (~Core i9-14900K / RTX 4090) so 100 ≈ current flagship.
const CPU_PASSMARK_REF = 60000;
const CPU_GB_MULTI_REF = 21000;
const GPU_G3D_REF = 38800;

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

// Performance per $1000 — higher is better value.
export function valueScore(performance: number | null, msrpUsd: number | null): number | null {
  if (performance === null || !msrpUsd || msrpUsd <= 0) return null;
  return round1((performance / msrpUsd) * 1000);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
