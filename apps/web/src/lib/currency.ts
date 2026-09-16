// Currency formatting for the Console top-bar $/Rp toggle.
// Reference rate shown in the toggle tooltip: Rp16.300 per USD.
export const CURRENCY_COOKIE = 'CGPU_CURRENCY';
export const IDR_RATE = 16300;
export type Currency = 'USD' | 'IDR';
export const DEFAULT_CURRENCY: Currency = 'USD';

export function isCurrency(value: string | undefined): value is Currency {
  return value === 'USD' || value === 'IDR';
}

// Whole-price format ($999 / Rp16,3 jt).
export function formatPrice(usd: number, currency: Currency): string {
  if (currency === 'USD') return '$' + Math.round(usd).toLocaleString('en-US');
  const rp = usd * IDR_RATE;
  return rp >= 1e6
    ? 'Rp' + (rp / 1e6).toFixed(1).replace('.', ',') + ' jt'
    : 'Rp' + Math.round(rp / 1000) + ' rb';
}

// Fine-grained format for $/point style figures ($11.22 / Rp183 rb).
export function formatPriceSmall(usd: number, currency: Currency): string {
  if (currency === 'USD') return '$' + usd.toFixed(2);
  const rp = usd * IDR_RATE;
  return rp >= 1e6
    ? 'Rp' + (rp / 1e6).toFixed(1).replace('.', ',') + ' jt'
    : 'Rp' + Math.round(rp / 1000) + ' rb';
}

// Compact axis format ($1.5k / Rp24 jt).
export function formatPriceAxis(usd: number, currency: Currency): string {
  if (!usd) return currency === 'USD' ? '$0' : 'Rp0';
  if (currency === 'USD') {
    return usd >= 1000 ? '$' + (usd / 1000).toFixed(usd % 1000 === 0 ? 0 : 1) + 'k' : '$' + usd;
  }
  const jt = (usd * IDR_RATE) / 1e6;
  return 'Rp' + (jt >= 10 ? Math.round(jt).toString() : jt.toFixed(1).replace('.', ',')) + ' jt';
}
