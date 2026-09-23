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
  shareSlug: string;
  modelUsed: string;
}
