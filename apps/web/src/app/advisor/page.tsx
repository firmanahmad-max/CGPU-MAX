'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { SignedIn, SignedOut } from '@/lib/auth';
import { useState } from 'react';

import { BuildAdviceResult } from '@/components/BuildAdviceResult';
import type { BuildAdvice, BuildPurpose, Resolution } from '@/lib/advisorTypes';
import { useCurrency } from '@/lib/currency-context';
import { useAuthedFetch } from '@/lib/useAuthedFetch';

const PURPOSES: { value: BuildPurpose; labelKey: string }[] = [
  { value: 'gaming', labelKey: 'purposeGaming' },
  { value: 'streaming', labelKey: 'purposeStreaming' },
  { value: 'content_creation', labelKey: 'purposeContentCreation' },
  { value: 'workstation', labelKey: 'purposeWorkstation' },
  { value: 'budget', labelKey: 'purposeBudget' },
];
const RESOLUTIONS: Resolution[] = ['1080p', '1440p', '4K'];

export default function AdvisorPage() {
  const t = useTranslations('advisor');
  const locale = useLocale();
  const { format } = useCurrency();
  const authedFetch = useAuthedFetch();
  const [budget, setBudget] = useState(1500);
  const [purpose, setPurpose] = useState<BuildPurpose>('gaming');
  const [resolution, setResolution] = useState<Resolution>('1440p');
  const [includeMonitor, setIncludeMonitor] = useState(false);
  const [preferences, setPreferences] = useState('');
  const [advice, setAdvice] = useState<BuildAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    setAdvice(null);
    try {
      const res = await authedFetch('/api/v1/advisor/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budgetUsd: budget,
          purpose,
          resolution,
          preferences,
          language: locale,
          includeMonitor,
        }),
      });
      if (res.status === 402) {
        throw new Error(t('errProFeature'));
      }
      if (res.status === 429) {
        throw new Error(t('errLimit'));
      }
      if (!res.ok) throw new Error(await res.text());
      setAdvice((await res.json()) as BuildAdvice);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <p className="label">{t('pro')}</p>
            <span className="pill border-cblue/40 bg-cblue/10 text-cblue-bright">
              {t('aiPowered')}
            </span>
          </div>
          <h1 className="font-display text-ink-hi text-4xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-ink-muted mt-2 max-w-2xl text-sm">{t('subtitle')}</p>
        </header>

        <SignedOut>
          <div className="card text-center">
            <p className="label mb-2">{t('signInRequired')}</p>
            <p className="text-ink-muted text-sm">
              {t('proFeature')}{' '}
              <Link
                href="/sign-in?redirect_url=/advisor"
                className="text-lime-bright hover:underline"
              >
                {t('signIn')}
              </Link>{' '}
              {t('or')}{' '}
              <Link href="/pricing" className="text-lime-bright hover:underline">
                {t('viewPricing')}
              </Link>
              .
            </p>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="card space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="label">{t('budget')}</p>
                <span className="text-ink-hi font-mono text-lg">{format(budget)}</span>
              </div>
              <input
                type="range"
                min={300}
                max={6000}
                step={50}
                value={budget}
                onChange={(e) => setBudget(Number(e.currentTarget.value))}
                className="accent-lime w-full"
              />
            </div>

            <div>
              <p className="label mb-2">{t('purpose')}</p>
              <div className="flex flex-wrap gap-2">
                {PURPOSES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPurpose(p.value)}
                    className={
                      'rounded-pill tracking-label border px-3 py-1 text-xs font-medium uppercase transition ' +
                      (purpose === p.value
                        ? 'border-lime/45 bg-lime/[0.14] text-lime-bright'
                        : 'border-hairline bg-panel text-ink-faint hover:text-ink')
                    }
                  >
                    {t(p.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="label mb-2">{t('targetResolution')}</p>
              <div className="flex gap-2">
                {RESOLUTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setResolution(r)}
                    className={
                      'rounded-pill tracking-label border px-4 py-1 text-xs font-medium uppercase transition ' +
                      (resolution === r
                        ? 'border-lime/45 bg-lime/[0.14] text-lime-bright'
                        : 'border-hairline bg-panel text-ink-faint hover:text-ink')
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="label mb-2">{t('scope')}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIncludeMonitor(false)}
                  className={
                    'rounded-pill tracking-label border px-4 py-1 text-xs font-medium uppercase transition ' +
                    (!includeMonitor
                      ? 'border-lime/45 bg-lime/[0.14] text-lime-bright'
                      : 'border-hairline bg-panel text-ink-faint hover:text-ink')
                  }
                >
                  {t('scopePcOnly')}
                </button>
                <button
                  type="button"
                  onClick={() => setIncludeMonitor(true)}
                  className={
                    'rounded-pill tracking-label border px-4 py-1 text-xs font-medium uppercase transition ' +
                    (includeMonitor
                      ? 'border-lime/45 bg-lime/[0.14] text-lime-bright'
                      : 'border-hairline bg-panel text-ink-faint hover:text-ink')
                  }
                >
                  {t('scopePcMonitor')}
                </button>
              </div>
            </div>

            <div>
              <p className="label mb-2">{t('preferences')}</p>
              <input
                type="text"
                value={preferences}
                maxLength={500}
                placeholder={t('preferencesPlaceholder')}
                onChange={(e) => setPreferences(e.currentTarget.value)}
                className="focus:border-lime/45 rounded-control border-hairline bg-panel text-ink-hi placeholder:text-ink-faint w-full border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={onGenerate}
              disabled={loading}
              className="rounded-control bg-lime text-lime-ink px-6 py-2 text-sm font-semibold transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? t('generating') : t('generate')}
            </button>
            {error && <p className="text-cred text-sm">{error}</p>}
          </div>

          {advice && <BuildAdviceResult advice={advice} />}
        </SignedIn>
      </main>
    </>
  );
}
