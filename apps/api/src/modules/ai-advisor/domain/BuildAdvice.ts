// Shape of a build recommendation. This is both the domain type and the
// structured-output schema we constrain Claude to (see schema.ts).

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
  // Slug into our DB when the advisor picked a known part; null if it
  // suggested something outside the catalog.
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
  // A matched display, recommended only when the user opted into a monitor.
  // Null when the user asked for a PC build only.
  monitor: ComponentPick | null;
  estimatedTotalUsd: number;
  withinBudget: boolean;
  expectedPerformance: string;
  recommendedPsuWatts: number;
  upgradePathNote: string;
  warnings: string[];
}
