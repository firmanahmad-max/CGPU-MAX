import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import { AppAuthProvider } from '@/lib/auth';

import './globals.css';

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

  return (
    <html lang={locale} className="dark">
      <body className="bg-surface-dark min-h-screen font-sans text-slate-100 antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppAuthProvider>{children}</AppAuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
