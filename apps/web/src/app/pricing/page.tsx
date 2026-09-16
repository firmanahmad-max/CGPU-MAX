'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { SignedIn, SignedOut, useCurrentUser } from '@/lib/auth';
import { useState } from 'react';

import { useAuthedFetch } from '@/lib/useAuthedFetch';
import { cn } from '@/lib/cn';

type Plan = 'pro_monthly' | 'pro_yearly';

// Copy lives in messages/{locale}.json under "pricing" — these are the keys.
const TIERS = [
  {
    nameKey: 'freeName',
    price: '$0',
    cadenceKey: 'freeCadence',
    ctaKey: 'freeCta',
    accent: 'border-hairline',
    featureKeys: ['free1', 'free2', 'free3', 'free4'],
    plan: null as Plan | null,
  },
  {
    nameKey: 'proName',
    price: '$9.99',
    cadenceKey: 'proCadence',
    ctaKey: 'proCta',
    accent: 'border-lime/45 bg-gradient-to-b from-lime/[0.09] to-panel',
    highlight: true,
    featureKeys: ['pro1', 'pro2', 'pro3', 'pro4', 'pro5', 'pro6'],
    plan: 'pro_monthly' as Plan,
  },
  {
    nameKey: 'annualName',
    price: '$99',
    cadenceKey: 'annualCadence',
    ctaKey: 'annualCta',
    accent: 'border-hairline',
    featureKeys: ['annual1', 'annual2', 'annual3'],
    plan: 'pro_yearly' as Plan,
  },
];

export default function PricingPage() {
  const t = useTranslations('pricing');
  const authedFetch = useAuthedFetch();
  const { isSignedIn } = useCurrentUser();
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCheckout = async (plan: Plan) => {
    if (!isSignedIn) {
      window.location.href = '/sign-in?redirect_url=/pricing';
      return;
    }
    setLoading(plan);
    setError(null);
    try {
      const res = await authedFetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { url: string };
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <header className="mb-8 max-w-2xl">
        <p className="label">{t('label')}</p>
        <h1 className="font-display text-ink-hi mt-3 text-[32px] font-bold leading-[1.15] tracking-tight">
          {t('title')}
        </h1>
        <p className="text-ink-faint mt-3 text-[13px] leading-relaxed">{t('subtitle')}</p>
      </header>

      {error && (
        <div className="panel border-cred/40 bg-cred/10 text-cred mb-6 text-sm">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((tier) => (
          <div key={tier.nameKey} className={cn('panel flex flex-col', tier.accent)}>
            <div className="flex items-center justify-between">
              <p className={cn('label', tier.highlight && 'text-lime-bright')}>{t(tier.nameKey)}</p>
              {tier.highlight && (
                <span className="rounded-pill bg-lime tracking-label text-lime-ink px-[9px] py-[3px] text-[9.5px] font-semibold uppercase">
                  {t('mostPopular')}
                </span>
              )}
            </div>
            <p className="text-ink-hi mt-[10px] font-mono text-[30px] font-bold tracking-tight">
              {tier.price}
            </p>
            <p className="tracking-label text-ink-faint mt-1 text-[11px] uppercase">
              {t(tier.cadenceKey)}
            </p>
            <ul className="text-ink-mid my-[18px] flex flex-col gap-2 text-[12.5px]">
              {tier.featureKeys.map((f) => (
                <li key={f} className="flex gap-2">
                  <span
                    className={cn(
                      'rounded-pill mt-[6px] inline-block h-[5px] w-[5px] flex-shrink-0',
                      tier.highlight ? 'bg-lime' : 'bg-ink-faint',
                    )}
                  />
                  <span>{t(f)}</span>
                </li>
              ))}
            </ul>
            {tier.plan ? (
              <button
                type="button"
                onClick={() => onCheckout(tier.plan!)}
                disabled={loading !== null}
                className={cn(
                  'rounded-control mt-auto px-4 py-[9px] text-center text-[12.5px] font-semibold transition disabled:opacity-50',
                  tier.highlight
                    ? 'bg-lime text-lime-ink hover:brightness-110'
                    : 'border-hairline text-ink-mid border hover:bg-white/5',
                )}
              >
                {loading === tier.plan ? t('redirecting') : t(tier.ctaKey)}
              </button>
            ) : (
              <Link
                href="/processors"
                className="rounded-control border-hairline text-ink-mid mt-auto border px-4 py-[9px] text-center text-[12.5px] font-semibold transition hover:bg-white/5"
              >
                {t(tier.ctaKey)}
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="text-ink-faint mt-8 text-center text-[11px]">
        {t('enterpriseQuestion')}{' '}
        <a href="mailto:sales@cgpu-max.app" className="text-lime-bright hover:underline">
          {t('contactUs')}
        </a>
        .
      </p>

      <SignedOut>
        <p className="text-ink-faint mt-3 text-center text-[11px]">{t('signInNote')}</p>
      </SignedOut>
      <SignedIn>
        <p className="text-ink-faint mt-3 text-center text-[11px]">
          {t('managePrefix')}{' '}
          <Link href="/account" className="text-lime-bright hover:underline">
            {t('manageLink')}
          </Link>
          .
        </p>
      </SignedIn>
    </main>
  );
}
