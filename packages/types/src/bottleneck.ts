export type Resolution = '1080p' | '1440p' | '4K';
export type GameProfile = 'esports' | 'aaa' | 'vr' | 'creative';
export type BottleneckSeverity = 'optimal' | 'minor' | 'moderate' | 'significant' | 'severe';
export type LimitingComponent = 'cpu' | 'gpu' | 'balanced';

export interface BottleneckScenario {
  resolution: Resolution;
  profile: GameProfile;
  bottleneckPercentage: number;
  limitingComponent: LimitingComponent;
  severity: BottleneckSeverity;
  expectedFpsRange: { min: number; max: number } | null;
}

export interface BottleneckResult {
  id: string;
  cpuId: string;
  gpuId: string;
  scenarios: BottleneckScenario[];
  thermalEstimateC: number | null;
  totalPowerDrawW: number | null;
  recommendedPsuW: number | null;
  recommendations: string[];
  algorithmVersion: string;
  computedAt: string;
}
