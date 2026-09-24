export type BuildPurpose = 'gaming' | 'streaming' | 'workstation' | 'budget' | 'content_creation';
export type Resolution = '1080p' | '1440p' | '4K';

export type PickCategory =
  | 'cpu'
  | 'gpu'
  | 'motherboard'
  | 'ram'
  | 'ssd'
  | 'psu'
  | 'case'
  | 'cooler'
  | 'monitor';

export interface ComponentPick {
  category: PickCategory;
  modelName: string;
  slug: string | null;
  approxPriceUsd: number;
  rationale: string;
}

export interface FpsEstimate {
  profile: string;
  label: string;
  min: number;
  max: number;
}

export interface PerformanceInsight {
  targetResolution: string;
  cpuPower: number;
  gpuPower: number;
  bottleneckPercentage: number;
  limitingComponent: 'cpu' | 'gpu' | 'balanced';
  severity: 'optimal' | 'minor' | 'moderate' | 'significant' | 'severe';
  fps: FpsEstimate[];
  note: string | null;
  algorithmVersion: string;
}

export interface BuildInsights {
  performance: PerformanceInsight | null;
}

export interface BuildAdvice {
  summary: string;
  cpu: ComponentPick;
  gpu: ComponentPick;
  motherboard: ComponentPick;
  ram: ComponentPick;
  ssd: ComponentPick;
  psu: ComponentPick;
  case: ComponentPick;
  cooler: ComponentPick;
  monitor: ComponentPick | null;
  estimatedTotalUsd: number;
  withinBudget: boolean;
  expectedPerformance: string;
  recommendedPsuWatts: number;
  upgradePathNote: string;
  warnings: string[];
  insights?: BuildInsights;
  shareSlug: string;
  modelUsed: string;
}
