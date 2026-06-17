'use client';

import Link from 'next/link';

import { SignedIn, SignedOut, useCurrentUser } from '@/lib/auth';
import { useState } from 'react';

import { NavBar } from '@/components/NavBar';
import { Pill } from '@/components/Pill';
import { useAuthedFetch } from '@/lib/useAuthedFetch';
import { cn } from '@/lib/cn';

type Plan = 'pro_monthly' | 'pro_yearly';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    cta: 'Start free',
    accent: 'border-white/10',
    features: [
      '5 comparisons / month',
      'Basic bottleneck analysis',
      'Public processor database',
      'Display ads',
    ],
    plan: null as Plan | null,
  },
  {
    name: 'Pro',
    price: '$9.99',
    cadence: 'per month',
    cta: 'Upgrade to Pro',
    accent: 'border-accent-blue/60 bg-accent-blue/5',
    highlight: true,
    features: [
      'Unlimited comparisons',
      'AI build advisor (100 / mo)',
      'Price tracking & alerts',
      'Gaming optimizer',
      'PDF / Excel reports',
      'No ads',
    ],
    plan: 'pro_monthly' as Plan,
  },
  {
    name: 'Pro · Annual',
    price: '$99',
    cadence: 'per year · 20% off',
    cta: 'Save 20%',
    accent: 'border-accent-purple/60 bg-accent-purple/5',
    features: ['Everything in Pro', 'Save 20% vs monthly', 'Priority email support'],
    plan: 'pro_yearly' as Plan,
  },
];

export default function PricingPage() {
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
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-12 text-center">
          <p className="label">Pricing</p>
          <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight text-white">
            Built for builders who need more than guesswork.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Free is generous. Pro unlocks unlimited analysis and the AI advisor. Enterprise gives
            you the REST API and white-label.
          </p>
        </header>

        {error && (
          <div className="card border-state-danger/40 bg-state-danger/10 text-state-danger mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'card flex flex-col',
                tier.accent,
                tier.highlight && 'ring-accent-blue/30 ring-1',
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="label">{tier.name}</p>
                {tier.highlight && <Pill variant="intel">Most popular</Pill>}
              </div>
              <p className="font-display text-4xl font-semibold tracking-tight text-white">
                {tier.price}
              </p>
              <p className="tracking-label mt-1 text-xs uppercase text-slate-500">{tier.cadence}</p>
              <ul className="my-6 space-y-2 text-sm text-slate-300">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="bg-accent-blue mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                    <span>{f}</span>
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
                  {loading === tier.plan ? 'Redirecting…' : tier.cta}
                </button>
              ) : (
                <Link
                  href="/processors"
                  className="mt-auto rounded-sm border border-white/15 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          Need higher API limits, white-label, or data licensing?{' '}
          <a href="mailto:sales@cgpu-max.app" className="text-accent-blue hover:underline">
            Contact us about Enterprise
          </a>
          .
        </p>

        <SignedOut>
          <p className="mt-4 text-center text-xs text-slate-500">
            Sign-in required to start a Pro subscription.
          </p>
        </SignedOut>
        <SignedIn>
          <p className="mt-4 text-center text-xs text-slate-500">
            Already on Pro? Manage your subscription from{' '}
            <Link href="/account" className="text-accent-blue hover:underline">
              your account
            </Link>
            .
          </p>
        </SignedIn>
      </main>
    </>
  );
}
