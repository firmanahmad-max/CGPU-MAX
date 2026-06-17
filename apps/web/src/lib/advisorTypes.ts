export type BuildPurpose =
  | 'gaming'
  | 'streaming'
  | 'workstation'
  | 'budget'
  | 'content_creation';
export type Resolution = '1080p' | '1440p' | '4K';

export interface ComponentPick {
  category: 'cpu' | 'gpu';
  modelName: string;
  slug: string | null;
  approxPriceUsd: number;
  rationale: string;
}

export interface BuildAdvice {
  summary: string;
  cpu: ComponentPick;
  gpu: ComponentPick;
  estimatedTotalUsd: number;
  withinBudget: boolean;
  expectedPerformance: string;
  recommendedPsuWatts: number;
  upgradePathNote: string;
  warnings: string[];
  shareSlug: string;
  modelUsed: string;
}
