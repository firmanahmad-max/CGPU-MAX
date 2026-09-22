// Pure comparison logic. No framework, no DB. Takes two processor snapshots
// (specs + benchmark aggregates) and produces a metric-by-metric verdict plus
// overall and price/performance winners.

import type { ComparisonWinner, Manufacturer, ProcessorType } from '@cgpu-max/types';

export interface ProcessorSnapshot {
  id: string;
  slug: string;
  type: ProcessorType;
  manufacturer: Manufacturer;
  modelName: string;
  tdpWatts: number | null;
  msrpUsd: number | null;
  priceIdr: number | null;
  generation: number | null;

  cpu?: {
    cores: number;
    threads: number;
    baseClockGhz: number;
    boostClockGhz: number | null;
    l3CacheMb: number | null;
  };
  gpu?: {
    shaderUnits: number;
    vramGb: number;
    memoryBandwidthGbps: number | null;
    baseClockMhz: number;
    boostClockMhz: number | null;
  };

  // Aggregated benchmark scores keyed by benchmarkType.
  benchmarks: Record<string, number>;
}

export interface MetricDef {
  key: string;
  label: string;
  unit?: string;
  higherIsBetter: boolean;
  // Extract the metric value from a snapshot; returns null when not applicable.
  extract: (p: ProcessorSnapshot) => number | null;
}

export interface MetricComparison {
  key: string;
  label: string;
  unit?: string;
  higherIsBetter: boolean;
  a: number | null;
  b: number | null;
  winner: ComparisonWinner;
  deltaPercent: number | null;
}

export interface ComparisonOutcome {
  metrics: MetricComparison[];
  overallWinner: ComparisonWinner;
  pricePerformanceWinner: ComparisonWinner;
  performanceScore: { a: number; b: number };
  pricePerformanceScore: { a: number | null; b: number | null };
  algorithmVersion: string;
}

const ALGORITHM_VERSION = '2026.06.0';

const CPU_METRICS: MetricDef[] = [
  {
    key: 'cores',
    label: 'Cores',
    higherIsBetter: true,
    extract: (p) => p.cpu?.cores ?? null,
  },
  {
    key: 'threads',
    label: 'Threads',
    higherIsBetter: true,
    extract: (p) => p.cpu?.threads ?? null,
  },
  {
    key: 'baseClockGhz',
    label: 'Base clock',
    unit: 'GHz',
    higherIsBetter: true,
    extract: (p) => p.cpu?.baseClockGhz ?? null,
  },
  {
    key: 'boostClockGhz',
    label: 'Boost clock',
    unit: 'GHz',
    higherIsBetter: true,
    extract: (p) => p.cpu?.boostClockGhz ?? null,
  },
  {
    key: 'l3CacheMb',
    label: 'L3 cache',
    unit: 'MB',
    higherIsBetter: true,
    extract: (p) => p.cpu?.l3CacheMb ?? null,
  },
  {
    key: 'gb6_single',
    label: 'Geekbench 6 single-core',
    higherIsBetter: true,
    extract: (p) => p.benchmarks['geekbench6_single_core'] ?? null,
  },
  {
    key: 'gb6_multi',
    label: 'Geekbench 6 multi-core',
    higherIsBetter: true,
    extract: (p) => p.benchmarks['geekbench6_multi_core'] ?? null,
  },
  {
    key: 'passmark_cpu',
    label: 'PassMark CPU mark',
    higherIsBetter: true,
    extract: (p) => p.benchmarks['passmark_cpu_mark'] ?? null,
  },
  {
    key: 'tdp',
    label: 'TDP',
    unit: 'W',
    higherIsBetter: false,
    extract: (p) => p.tdpWatts,
  },
];

const GPU_METRICS: MetricDef[] = [
  {
    key: 'shaders',
    label: 'Shader units',
    higherIsBetter: true,
    extract: (p) => p.gpu?.shaderUnits ?? null,
  },
  {
    key: 'vram',
    label: 'VRAM',
    unit: 'GB',
    higherIsBetter: true,
    extract: (p) => p.gpu?.vramGb ?? null,
  },
  {
    key: 'memBandwidth',
    label: 'Memory bandwidth',
    unit: 'GB/s',
    higherIsBetter: true,
    extract: (p) => p.gpu?.memoryBandwidthGbps ?? null,
  },
  {
    key: 'boostClockMhz',
    label: 'Boost clock',
    unit: 'MHz',
    higherIsBetter: true,
    extract: (p) => p.gpu?.boostClockMhz ?? null,
  },
  {
    key: 'passmark_g3d',
    label: 'PassMark G3D mark',
    higherIsBetter: true,
    extract: (p) => p.benchmarks['passmark_g3d_mark'] ?? null,
  },
  {
    key: 'tdp',
    label: 'TDP',
    unit: 'W',
    higherIsBetter: false,
    extract: (p) => p.tdpWatts,
  },
];

// Benchmark scores are the performance signal. Raw spec counts (cores, shaders)
// are deliberately excluded — they're already reflected in the benchmark
// results, so counting them again would double-weight them and skew the index.
// When no benchmarks are present, computePerformanceScore falls back to a
// per-metric winner count that still factors specs.
const PERFORMANCE_KEYS = new Set(['gb6_single', 'gb6_multi', 'passmark_cpu', 'passmark_g3d']);

export class ComparisonEngine {
  static readonly version = ALGORITHM_VERSION;

  compare(a: ProcessorSnapshot, b: ProcessorSnapshot): ComparisonOutcome {
    if (a.type !== b.type) {
      throw new Error('Cannot compare a CPU with a GPU');
    }

    const defs = a.type === 'CPU' ? CPU_METRICS : GPU_METRICS;
    const metrics = defs.map((def) => this.compareMetric(def, a, b));

    const performanceScore = this.computePerformanceScore(metrics);
    const overallWinner = this.pickWinner(performanceScore.a, performanceScore.b, true);

    const pricePerformanceScore = {
      a: a.msrpUsd && performanceScore.a > 0 ? performanceScore.a / a.msrpUsd : null,
      b: b.msrpUsd && performanceScore.b > 0 ? performanceScore.b / b.msrpUsd : null,
    };
    const pricePerformanceWinner =
      pricePerformanceScore.a !== null && pricePerformanceScore.b !== null
        ? this.pickWinner(pricePerformanceScore.a, pricePerformanceScore.b, true)
        : 'tied';

    return {
      metrics,
      overallWinner,
      pricePerformanceWinner,
      performanceScore,
      pricePerformanceScore,
      algorithmVersion: ALGORITHM_VERSION,
    };
  }

  private compareMetric(
    def: MetricDef,
    a: ProcessorSnapshot,
    b: ProcessorSnapshot,
  ): MetricComparison {
    const av = def.extract(a);
    const bv = def.extract(b);
    let winner: ComparisonWinner = 'tied';
    let deltaPercent: number | null = null;

    if (av !== null && bv !== null) {
      winner = this.pickWinner(av, bv, def.higherIsBetter);
      const base = Math.max(Math.abs(av), Math.abs(bv));
      deltaPercent = base === 0 ? 0 : ((av - bv) / base) * 100;
    } else if (av !== null) {
      winner = 'a';
    } else if (bv !== null) {
      winner = 'b';
    }

    return {
      key: def.key,
      label: def.label,
      unit: def.unit,
      higherIsBetter: def.higherIsBetter,
      a: av,
      b: bv,
      winner,
      deltaPercent,
    };
  }

  private pickWinner(a: number, b: number, higherIsBetter: boolean): ComparisonWinner {
    if (a === b) return 'tied';
    if (higherIsBetter) return a > b ? 'a' : 'b';
    return a < b ? 'a' : 'b';
  }

  private computePerformanceScore(metrics: MetricComparison[]): { a: number; b: number } {
    const perfMetrics = metrics.filter(
      (m) => PERFORMANCE_KEYS.has(m.key) && m.a !== null && m.b !== null,
    );

    if (perfMetrics.length === 0) {
      // Fallback: 1 point per metric where each side has a non-null value.
      const a = metrics.filter((m) => m.winner === 'a').length;
      const b = metrics.filter((m) => m.winner === 'b').length;
      return { a, b };
    }

    let sumA = 0;
    let sumB = 0;
    for (const m of perfMetrics) {
      const a = m.a as number;
      const b = m.b as number;
      const max = Math.max(a, b);
      if (max === 0) continue;
      // Normalize each metric to [0, 100] then accumulate.
      sumA += (a / max) * 100;
      sumB += (b / max) * 100;
    }
    return {
      a: +(sumA / perfMetrics.length).toFixed(2),
      b: +(sumB / perfMetrics.length).toFixed(2),
    };
  }
}
