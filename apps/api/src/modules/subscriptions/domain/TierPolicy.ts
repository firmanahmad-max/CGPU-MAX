// Per-tier feature limits. Single source of truth — used by both API enforcement
// and the public pricing page. Mirrors Master Prompt § Business Logic › Pricing Tiers.

import type { SubscriptionTier } from '@cgpu-max/types';

export interface TierLimits {
  comparisonsPerMonth: number; // -1 = unlimited
  savedBuildsMax: number; // -1 = unlimited
  priceAlertsMax: number;
  aiRecommendationsPerMonth: number;
  apiRequestsPer15min: number;
  multiCompareMax: number; // how many processors side-by-side
  retentionDays: { savedComparisons: number; savedBottlenecks: number };
  features: {
    ads: boolean;
    aiAdvisor: boolean;
    priceTracking: boolean;
    gamingOptimizer: boolean;
    streamingSuite: boolean;
    customReports: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
  };
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  FREE: {
    comparisonsPerMonth: 5,
    savedBuildsMax: 3,
    priceAlertsMax: 0,
    aiRecommendationsPerMonth: 0,
    apiRequestsPer15min: 100,
    multiCompareMax: 2,
    retentionDays: { savedComparisons: 7, savedBottlenecks: 7 },
    features: {
      ads: true,
      aiAdvisor: false,
      priceTracking: false,
      gamingOptimizer: false,
      streamingSuite: false,
      customReports: false,
      apiAccess: false,
      whiteLabel: false,
    },
  },
  PRO: {
    comparisonsPerMonth: -1,
    savedBuildsMax: -1,
    priceAlertsMax: 50,
    aiRecommendationsPerMonth: 100,
    apiRequestsPer15min: 1000,
    multiCompareMax: 10,
    retentionDays: { savedComparisons: 365, savedBottlenecks: 365 },
    features: {
      ads: false,
      aiAdvisor: true,
      priceTracking: true,
      gamingOptimizer: true,
      streamingSuite: true,
      customReports: true,
      apiAccess: false,
      whiteLabel: false,
    },
  },
  ENTERPRISE: {
    comparisonsPerMonth: -1,
    savedBuildsMax: -1,
    priceAlertsMax: -1,
    aiRecommendationsPerMonth: -1,
    apiRequestsPer15min: 10_000,
    multiCompareMax: -1,
    retentionDays: { savedComparisons: -1, savedBottlenecks: -1 },
    features: {
      ads: false,
      aiAdvisor: true,
      priceTracking: true,
      gamingOptimizer: true,
      streamingSuite: true,
      customReports: true,
      apiAccess: true,
      whiteLabel: true,
    },
  },
};

export function getLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

export function isUnlimited(value: number): boolean {
  return value < 0;
}
