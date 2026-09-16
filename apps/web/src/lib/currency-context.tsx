'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  formatPrice,
  formatPriceAxis,
  formatPriceSmall,
  type Currency,
} from './currency';

interface CurrencyValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (usd: number) => string;
  formatSmall: (usd: number) => string;
  formatAxis: (usd: number) => string;
}

const CurrencyContext = createContext<CurrencyValue | null>(null);

// Seeded from the server-read cookie; toggling updates state instantly (all
// consumers re-render) and persists the choice in a cookie for next load.
export function CurrencyProvider({
  initial,
  children,
}: {
  initial: Currency;
  children: React.ReactNode;
}) {
  const [currency, setCurrencyState] = useState<Currency>(initial);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      document.cookie = `${CURRENCY_COOKIE}=${c}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // Non-fatal — the in-memory state still updates for this session.
    }
  }, []);

  const value = useMemo<CurrencyValue>(
    () => ({
      currency,
      setCurrency,
      format: (usd) => formatPrice(usd, currency),
      formatSmall: (usd) => formatPriceSmall(usd, currency),
      formatAxis: (usd) => formatPriceAxis(usd, currency),
    }),
    [currency, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Safe fallback so a stray consumer never crashes.
    return {
      currency: DEFAULT_CURRENCY,
      setCurrency: () => {},
      format: (usd) => formatPrice(usd, DEFAULT_CURRENCY),
      formatSmall: (usd) => formatPriceSmall(usd, DEFAULT_CURRENCY),
      formatAxis: (usd) => formatPriceAxis(usd, DEFAULT_CURRENCY),
    };
  }
  return ctx;
}
