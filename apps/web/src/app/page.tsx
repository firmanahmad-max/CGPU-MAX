import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import type { Processor } from '@cgpu-max/types';

import { NavBar } from '@/components/NavBar';
import { Pill } from '@/components/Pill';
import { getRankings, listProcessors, type RankedProcessor } from '@/lib/api';

export const dynamic = 'force-dynamic';

const manufacturerVariant = (m: string) =>
  m === 'INTEL' ? 'intel' : m === 'AMD' ? 'amd' : 'nvidia';

// Resilient count — let the home page render even if the API is unreachable.
async function countOf(type?: 'CPU' | 'GPU'): Promise<number | null> {
  try {
    const res = await listProcessors({ type, limit: 1 });
    return res.total;
  } catch {
    return null;
  }
}

// Newest releases (the API lists by releaseDate desc) — resilient like countOf.
async function latest(limit: number): Promise<Processor[]> {
  try {
    const res = await listProcessors({ limit });
    return res.items;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [t, locale, cpuCount, gpuCount, top, newest] = await Promise.all([
    getTranslations('home'),
    getLocale(),
    countOf('CPU'),
    countOf('GPU'),
    getRankings({ sort: 'performance', limit: 6 }),
    latest(6),
  ]);
  const total = cpuCount !== null && gpuCount !== null ? cpuCount + gpuCount : null;

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <section className="mb-12">
          <p className="label mb-4">{t('tagline')}</p>
          <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            {t('titleLine1')}
            <br />
            <span className="text-accent-blue">{t('titleLine2')}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400">{t('subtitle')}</p>

          {/* Quick search — progressive, works without JS (navigates to /processors). */}
          <form action="/processors" method="get" className="mt-8 max-w-xl">
            <div className="rounded-card focus-within:border-accent-blue flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-slate-500">🔍</span>
              <input
                type="search"
                name="search"
                placeholder={t('searchPlaceholder')}
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </form>
        </section>

        {/* Real stat counters */}
        <section className="mb-12 grid gap-4 sm:grid-cols-3">
          <StatCard icon="🧠" label={t('totalCpu')} value={cpuCount} />
          <StatCard icon="🎮" label={t('totalGpu')} value={gpuCount} />
          <StatCard icon="📊" label={t('totalProcessors')} value={total} />
        </section>

        {/* Feature navigation cards */}
        <section className="mb-14 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            href="/compare"
            icon="🔄"
            title={t('featureCompareTitle')}
            desc={t('featureCompareDesc')}
          />
          <FeatureCard
            href="/bottleneck"
            icon="⚙️"
            title={t('featureBottleneckTitle')}
            desc={t('featureBottleneckDesc')}
          />
          <FeatureCard
            href="/rankings"
            icon="🏆"
            title={t('featureRankingsTitle')}
            desc={t('featureRankingsDesc')}
          />
        </section>

        {/* Top performers — real data from the rankings API */}
        {top && top.items.length > 0 && (
          <section className="mb-14">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-white">
                {t('topPerformers')}
              </h2>
              <Link href="/rankings" className="text-accent-blue text-sm hover:underline">
                {t('viewAll')} →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {top.items.map((p) => (
                <ProcessorCard key={p.slug} p={p} />
              ))}
            </div>
          </section>
        )}

        {/* Latest releases — API lists by releaseDate desc (prior version's "Terbaru") */}
        {newest.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-white">{t('latest')}</h2>
              <Link href="/processors" className="text-accent-blue text-sm hover:underline">
                {t('viewAll')} →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {newest.map((p) => (
                <LatestCard key={p.slug} p={p} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function LatestCard({ p, locale }: { p: Processor; locale: string }) {
  const released = p.releaseDate
    ? new Date(p.releaseDate).toLocaleDateString(locale, { year: 'numeric', month: 'short' })
    : null;
  return (
    <Link
      href={`/processors/${p.slug}`}
      className="card flex flex-col transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="mb-3 flex items-center gap-2">
        <Pill variant={manufacturerVariant(p.manufacturer)}>{p.manufacturer}</Pill>
        <Pill>{p.type}</Pill>
      </div>
      <p className="font-semibold text-white">{p.modelName}</p>
      <p className="mt-1 text-xs text-slate-500">
        {[p.architecture, released].filter(Boolean).join(' · ')}
      </p>
      <p className="mt-4 font-mono text-sm text-white">
        {p.msrpUsd ? `$${p.msrpUsd.toLocaleString()}` : '—'}
      </p>
    </Link>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number | null }) {
  return (
    <div className="card flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="label">{label}</p>
        <p className="metric mt-1">{value !== null ? value.toLocaleString() : '—'}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="card group flex items-start gap-3 transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <span className="text-xl">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center justify-between font-semibold text-white">
          {title}
          <span className="text-slate-600 transition group-hover:text-slate-300">→</span>
        </p>
        <p className="mt-1 text-sm text-slate-400">{desc}</p>
      </div>
    </Link>
  );
}

function ProcessorCard({ p }: { p: RankedProcessor }) {
  return (
    <Link
      href={`/processors/${p.slug}`}
      className="card flex flex-col transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="mb-3 flex items-center gap-2">
        <Pill variant={manufacturerVariant(p.manufacturer)}>{p.manufacturer}</Pill>
        <Pill>{p.type}</Pill>
      </div>
      <p className="font-semibold text-white">{p.modelName}</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="label">MSRP</p>
          <p className="mt-1 font-mono text-sm text-white">
            {p.msrpUsd ? `$${p.msrpUsd.toLocaleString()}` : '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="label">Score</p>
          <p className="text-accent-blue mt-1 font-mono text-sm font-semibold">
            {Math.round(p.performance)}
          </p>
        </div>
      </div>
    </Link>
  );
}
