import { getLimits, isUnlimited, TIER_LIMITS } from '../../domain/TierPolicy.js';

describe('TierPolicy', () => {
  it('FREE caps comparisons at 5 per month', () => {
    expect(getLimits('FREE').comparisonsPerMonth).toBe(5);
  });

  it('PRO unlocks all premium features', () => {
    const pro = getLimits('PRO');
    expect(pro.features.aiAdvisor).toBe(true);
    expect(pro.features.priceTracking).toBe(true);
    expect(isUnlimited(pro.comparisonsPerMonth)).toBe(true);
  });

  it('ENTERPRISE adds API + white-label over PRO', () => {
    expect(TIER_LIMITS.ENTERPRISE.features.apiAccess).toBe(true);
    expect(TIER_LIMITS.ENTERPRISE.features.whiteLabel).toBe(true);
  });
});
