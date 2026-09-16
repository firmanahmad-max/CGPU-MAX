import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Instrument_Sans, JetBrains_Mono, Syne } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import { ConsoleShell } from '@/components/console/ConsoleShell';
import { AppAuthProvider } from '@/lib/auth';
import { CURRENCY_COOKIE, DEFAULT_CURRENCY, isCurrency } from '@/lib/currency';
import { CurrencyProvider } from '@/lib/currency-context';

import './globals.css';

// Console type system: Syne (display), Instrument Sans (UI), JetBrains Mono (numbers).
const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CGPU-MAX — Hardware Intelligence Platform',
    template: '%s · CGPU-MAX',
  },
  description:
    'Professional CPU & GPU comparison, bottleneck analysis, and AI-driven build recommendations.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  const rawCurrency = cookies().get(CURRENCY_COOKIE)?.value;
  const currency = isCurrency(rawCurrency) ? rawCurrency : DEFAULT_CURRENCY;

  return (
    <html
      lang={locale}
      className={`dark ${syne.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-ground text-ink min-h-screen font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CurrencyProvider initial={currency}>
            <AppAuthProvider>
              <ConsoleShell>{children}</ConsoleShell>
            </AppAuthProvider>
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
