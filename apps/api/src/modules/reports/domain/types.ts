// The subset of the persisted comparison/bottleneck JSON payloads that the
// report renderers consume. These mirror what CompareProcessors and
// CalculateBottleneck store.

export interface ComparisonReportData {
  a: { modelName: string; manufacturer: string; type: string };
  b: { modelName: string; manufacturer: string; type: string };
  metrics: {
    label: string;
    unit?: string;
    a: number | null;
    b: number | null;
    winner: 'a' | 'b' | 'tied';
    deltaPercent: number | null;
  }[];
  overallWinner: 'a' | 'b' | 'tied';
  pricePerformanceWinner: 'a' | 'b' | 'tied';
  performanceScore: { a: number; b: number };
  algorithmVersion: string;
  generatedAt: string;
}

export interface BottleneckReportData {
  cpu: { modelName: string };
  gpu: { modelName: string };
  cpuPower: number;
  gpuPower: number;
  scenarios: {
    resolution: string;
    profile: string;
    bottleneckPercentage: number;
    limitingComponent: string;
    severity: string;
    expectedFpsRange: { min: number; max: number } | null;
  }[];
  thermalEstimateC: number | null;
  totalPowerDrawW: number | null;
  recommendedPsuW: number | null;
  recommendations: string[];
  algorithmVersion: string;
  generatedAt: string;
}

export type ReportFormat = 'pdf' | 'xlsx';

export const CONTENT_TYPE: Record<ReportFormat, string> = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
