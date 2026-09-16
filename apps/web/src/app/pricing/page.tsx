'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { SignedIn, SignedOut, useCurrentUser } from '@/lib/auth';
import { useState } from 'react';

import { Pill } from '@/components/Pill';
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
    accent: 'border-white/10',
    featureKeys: ['free1', 'free2', 'free3', 'free4'],
    plan: null as Plan | null,
  },
  {
    nameKey: 'proName',
    price: '$9.99',
    cadenceKey: 'proCadence',
    ctaKey: 'proCta',
    accent: 'border-accent-blue/60 bg-accent-blue/5',
    highlight: true,
    featureKeys: ['pro1', 'pro2', 'pro3', 'pro4', 'pro5', 'pro6'],
    plan: 'pro_monthly' as Plan,
  },
  {
    nameKey: 'annualName',
    price: '$99',
    cadenceKey: 'annualCadence',
    ctaKey: 'annualCta',
    accent: 'border-accent-purple/60 bg-accent-purple/5',
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
    <>
      <main className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-12 text-center">
          <p className="label">{t('label')}</p>
          <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight text-white">
            {t('title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">{t('subtitle')}</p>
        </header>

        {error && (
          <div className="card border-state-danger/40 bg-state-danger/10 text-state-danger mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.nameKey}
              className={cn(
                'card flex flex-col',
                tier.accent,
                tier.highlight && 'ring-accent-blue/30 ring-1',
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="label">{t(tier.nameKey)}</p>
                {tier.highlight && <Pill variant="intel">{t('mostPopular')}</Pill>}
              </div>
              <p className="font-display text-4xl font-semibold tracking-tight text-white">
                {tier.price}
              </p>
              <p className="tracking-label mt-1 text-xs uppercase text-slate-500">
                {t(tier.cadenceKey)}
              </p>
              <ul className="my-6 space-y-2 text-sm text-slate-300">
                {tier.featureKeys.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="bg-accent-blue mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                    <span>{t(f)}</span>
                  </li>
                ))}
              </ul>
              {tier.plan ? (
                <button
                  type="button"
                  onClick={() => onCheckout(tier.plan!)}
                  disabled={loading !== null}
                  className="mt-auto rounded-sm border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                >
                  {loading === tier.plan ? t('redirecting') : t(tier.ctaKey)}
                </button>
              ) : (
                <Link
                  href="/processors"
                  className="mt-auto rounded-sm border border-white/15 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {t(tier.ctaKey)}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          {t('enterpriseQuestion')}{' '}
          <a href="mailto:sales@cgpu-max.app" className="text-accent-blue hover:underline">
            {t('contactUs')}
          </a>
          .
        </p>

        <SignedOut>
          <p className="mt-4 text-center text-xs text-slate-500">{t('signInNote')}</p>
        </SignedOut>
        <SignedIn>
          <p className="mt-4 text-center text-xs text-slate-500">
            {t('managePrefix')}{' '}
            <Link href="/account" className="text-accent-blue hover:underline">
              {t('manageLink')}
            </Link>
            .
          </p>
        </SignedIn>
      </main>
    </>
  );
}
