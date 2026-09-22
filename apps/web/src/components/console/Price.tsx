'use client';

import { useCurrency } from '@/lib/currency-context';
import { formatIdrValue } from '@/lib/currency';

// Reactive price — follows the top-bar $/Rp toggle live. `small` uses the
// two-decimal format for $/point style figures. When `idr` (a real Indonesian
// street price in Rp) is given, it's shown verbatim in Rp mode instead of
// converting from USD; USD mode always shows the `usd` value.
export function Price({
  usd,
  idr,
  small = false,
  className,
  fallback = '—',
}: {
  usd: number | null | undefined;
  idr?: number | null;
  small?: boolean;
  className?: string;
  fallback?: string;
}) {
  const { currency, format, formatSmall } = useCurrency();

  if (currency === 'IDR' && typeof idr === 'number' && idr > 0) {
    return <span className={className}>{formatIdrValue(idr)}</span>;
  }
  if (usd === null || usd === undefined) return <span className={className}>{fallback}</span>;
  return <span className={className}>{small ? formatSmall(usd) : format(usd)}</span>;
}
