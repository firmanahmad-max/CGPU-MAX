// Pure alert-crossing logic. Shared shape between the API (validation) and the
// scraper (evaluation). No DB, no framework.

export type AlertDirection = 'BELOW' | 'ABOVE';

export function isAlertTriggered(
  direction: AlertDirection,
  targetPriceUsd: number,
  latestPriceUsd: number,
): boolean {
  return direction === 'BELOW'
    ? latestPriceUsd <= targetPriceUsd
    : latestPriceUsd >= targetPriceUsd;
}
