'use client';

import { useCurrency } from '@/lib/currency-context';

// Reactive price — follows the top-bar $/Rp toggle live. `small` uses the
// two-decimal format for $/point style figures.
export function Price({
  usd,
  small = false,
  className,
  fallback = '—',
}: {
  usd: number | null | undefined;
  small?: boolean;
  className?: string;
  fallback?: string;
}) {
  const { format, formatSmall } = useCurrency();
  if (usd === null || usd === undefined) return <span className={className}>{fallback}</span>;
  return <span className={className}>{small ? formatSmall(usd) : format(usd)}</span>;
}
