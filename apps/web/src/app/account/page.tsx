'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useCurrentUser } from '@/lib/auth';

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
  const t = useTranslations('account');
  const user = useCurrentUser();
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
      <main className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-10">
          <p className="label">{t('label')}</p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-white">
            {(() => {
              const name = user?.firstName ?? user?.username;
              return name ? t('dashboardTitle', { name }) : t('dashboardFallback');
            })()}
          </h1>
          <p className="mt-2 text-sm text-slate-400">{user.email}</p>
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
                  <p className="label">{t('currentPlan')}</p>
                  <p className="font-display mt-2 text-3xl font-semibold text-white">{data.tier}</p>
                </div>
                <Pill variant={data.tier === 'PRO' ? 'intel' : 'default'}>
                  {data.subscription?.status ?? t('noSubscription')}
                </Pill>
              </div>
              {data.subscription && (
                <p className="text-sm text-slate-400">
                  {t('renews', {
                    date: new Date(data.subscription.currentPeriodEnd).toLocaleDateString(),
                    interval: data.subscription.interval.toLowerCase(),
                  })}
                  {data.subscription.cancelAtPeriodEnd && t('cancelsSuffix')}
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
                    {portalLoading ? t('opening') : t('manageBilling')}
                  </button>
                ) : (
                  <a
                    href="/pricing"
                    className="border-accent-blue bg-accent-blue/20 hover:bg-accent-blue/30 rounded-sm border px-4 py-2 text-sm font-semibold text-white transition"
                  >
                    {t('upgrade')}
                  </a>
                )}
              </div>
            </section>

            <section className="card">
              <p className="label mb-4">{t('usagePeriod', { period: data.period })}</p>
              <dl className="grid gap-4 sm:grid-cols-2">
                <UsageRow
                  label={t('comparisons')}
                  used={data.usage.comparisons ?? 0}
                  limit={data.limits.comparisonsPerMonth}
                />
                <UsageRow
                  label={t('aiRecommendations')}
                  used={data.usage.aiRecommendations ?? 0}
                  limit={data.limits.aiRecommendationsPerMonth}
                />
              </dl>
            </section>

            {data.limits.features.apiAccess && (
              <section className="card flex items-center justify-between">
                <div>
                  <p className="label">{t('developer')}</p>
                  <p className="mt-1 text-sm text-slate-300">{t('developerDesc')}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href="/account/api-keys"
                    className="rounded-sm border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    {t('apiKeysLink')} →
                  </a>
                  {data.limits.features.whiteLabel && (
                    <a
                      href="/account/organization"
                      className="rounded-sm border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      {t('organizationLink')} →
                    </a>
                  )}
                </div>
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
