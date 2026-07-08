'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';

import { LOCALES, LOCALE_COOKIE, type Locale } from '@/i18n/config';

const LABELS: Record<Locale, string> = { en: 'EN', id: 'ID' };

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    // One year, whole site — the request config reads this cookie.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <div
      className={
        'rounded-pill flex overflow-hidden border border-white/10 text-xs ' +
        (isPending ? 'opacity-60' : '')
      }
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={
            'px-2.5 py-1 font-medium transition ' +
            (locale === l ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-400 hover:text-white')
          }
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
