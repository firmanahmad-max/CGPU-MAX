import type { RequestHandler } from 'express';

import { getLimits, type TierLimits } from '../../modules/subscriptions/domain/TierPolicy.js';
import { AppError } from '../errors/AppError.js';

type FeatureFlag = keyof TierLimits['features'];

// Gates a route behind a tier feature flag. Requires req.auth (use after
// requireAuth). 402 with an upgrade hint when the tier lacks the feature.
export function requireFeature(feature: FeatureFlag): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      return next(new AppError('UNAUTHENTICATED', 'Authentication required', 401));
    }
    const limits = getLimits(req.auth.tier);
    if (!limits.features[feature]) {
      return next(
        new AppError('FEATURE_NOT_IN_TIER', `"${feature}" requires an upgraded plan`, 402, {
          details: { feature, tier: req.auth.tier, upgradeTo: 'PRO' },
        }),
      );
    }
    return next();
  };
}
