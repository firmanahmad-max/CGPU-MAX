import type { Processor } from './processor.js';

export type ComparisonWinner = 'a' | 'b' | 'tied';

export interface MetricComparison<T = number> {
  a: T;
  b: T;
  winner: ComparisonWinner;
  unit?: string;
  higherIsBetter: boolean;
}

export interface ComparisonResult {
  id: string;
  a: Processor;
  b: Processor;
  metrics: Record<string, MetricComparison>;
  overallWinner: ComparisonWinner;
  pricePerformanceWinner: ComparisonWinner;
  createdAt: string;
  shareSlug: string;
}
