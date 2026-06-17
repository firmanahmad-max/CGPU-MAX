'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { NavBar } from '@/components/NavBar';
import { Pill } from '@/components/Pill';
import { useAuthedFetch } from '@/lib/useAuthedFetch';

interface SubscriptionResponse {
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  limits: {
    comparisonsPerMonth: number;
    aiRecommendationsPerMonth: number;
    apiRequestsPer15min: number;
    features: Record<string, boolean>;
  };
  subscription: {
    status: string;
    interval: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  usage: Record<string, number>;
  period: string;
}

export default function AccountPage() {
  const { user } = useUser();
  const authedFetch = useAuthedFetch();
  const [data, setData] = useState<SubscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authedFetch('/api/v1/subscriptions/me');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as SubscriptionResponse;
        if (!cancelled) setData(body);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authedFetch]);

  const onPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await authedFetch('/api/v1/billing/portal', { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-10">
          <p className="label">Account</p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-white">
            {user?.firstName ?? user?.username ?? 'Your'} dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">{user?.primaryEmailAddress?.emailAddress}</p>
        </header>

        {error && (
          <div className="card border-state-danger/40 bg-state-danger/10 text-state-danger mb-6 text-sm">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <section className="card">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="label">Current plan</p>
                  <p className="font-display mt-2 text-3xl font-semibold text-white">{data.tier}</p>
                </div>
                <Pill variant={data.tier === 'PRO' ? 'intel' : 'default'}>
                  {data.subscription?.status ?? 'No active subscription'}
                </Pill>
              </div>
              {data.subscription && (
                <p className="text-sm text-slate-400">
                  Renews {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()} ·
                  billed {data.subscription.interval.toLowerCase()}
                  {data.subscription.cancelAtPeriodEnd && ' · cancels at period end'}
                </p>
              )}
              <div className="mt-6 flex gap-3">
                {data.subscription ? (
                  <button
                    type="button"
                    onClick={onPortal}
                    disabled={portalLoading}
                    className="rounded-sm border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                  >
                    {portalLoading ? 'Opening…' : 'Manage billing'}
                  </button>
                ) : (
                  <a
                    href="/pricing"
                    className="border-accent-blue bg-accent-blue/20 hover:bg-accent-blue/30 rounded-sm border px-4 py-2 text-sm font-semibold text-white transition"
                  >
                    Upgrade to Pro
                  </a>
                )}
              </div>
            </section>

            <section className="card">
              <p className="label mb-4">Usage · {data.period}</p>
              <dl className="grid gap-4 sm:grid-cols-2">
                <UsageRow
                  label="Comparisons"
                  used={data.usage.comparisons ?? 0}
                  limit={data.limits.comparisonsPerMonth}
                />
                <UsageRow
                  label="AI recommendations"
                  used={data.usage.aiRecommendations ?? 0}
                  limit={data.limits.aiRecommendationsPerMonth}
                />
              </dl>
            </section>

            {data.limits.features.apiAccess && (
              <section className="card flex items-center justify-between">
                <div>
                  <p className="label">Developer</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Manage API keys for the public REST API.
                  </p>
                </div>
                <a
                  href="/account/api-keys"
                  className="rounded-sm border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  API keys →
                </a>
              </section>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit < 0;
  const pct = unlimited ? 0 : Math.min(100, (used / Math.max(limit, 1)) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="label">{label}</p>
        <p className="font-mono text-xs text-slate-300">
          {used} / {unlimited ? '∞' : limit}
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="bg-accent-blue h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
