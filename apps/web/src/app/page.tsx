import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import type { Processor } from '@cgpu-max/types';

import { Mark } from '@/components/console/Mark';
import { Price } from '@/components/console/Price';
import { getRankings, listProcessors, type RankedProcessor } from '@/lib/api';

export const dynamic = 'force-dynamic';

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
    <main className="mx-auto max-w-6xl px-6 py-14">
      {/* Hero */}
      <section className="mb-12">
        <p className="label mb-4">{t('tagline')}</p>
        <h1 className="font-display text-ink-hi text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          {t('titleLine1')}
          <br />
          <span className="text-cblue">{t('titleLine2')}</span>
        </h1>
        <p className="text-ink-muted mt-6 max-w-2xl text-[15px] leading-relaxed">{t('subtitle')}</p>

        {/* Quick search — progressive, works without JS (navigates to /processors). */}
        <form action="/processors" method="get" className="mt-8 max-w-xl">
          <div className="border-hairline bg-panel focus-within:border-lime/45 flex items-center gap-2 rounded-[9px] border px-4 py-3">
            <span className="text-ink-faint font-mono text-[11px]">⌘K</span>
            <input
              type="search"
              name="search"
              placeholder={t('searchPlaceholder')}
              className="text-ink placeholder:text-ink-faint w-full bg-transparent text-[13px] focus:outline-none"
            />
          </div>
        </form>
      </section>

      {/* Real stat counters */}
      <section className="mb-12 grid gap-4 sm:grid-cols-3">
        <StatCard label={t('totalCpu')} value={cpuCount} />
        <StatCard label={t('totalGpu')} value={gpuCount} />
        <StatCard label={t('totalProcessors')} value={total} accent />
      </section>

      {/* Feature navigation cards */}
      <section className="mb-14 grid gap-4 sm:grid-cols-3">
        <FeatureCard
          href="/compare"
          abbr="VS"
          title={t('featureCompareTitle')}
          desc={t('featureCompareDesc')}
        />
        <FeatureCard
          href="/bottleneck"
          abbr="BN"
          title={t('featureBottleneckTitle')}
          desc={t('featureBottleneckDesc')}
        />
        <FeatureCard
          href="/rankings"
          abbr="RK"
          title={t('featureRankingsTitle')}
          desc={t('featureRankingsDesc')}
        />
      </section>

      {/* Top performers — real data from the rankings API */}
      {top && top.items.length > 0 && (
        <section className="mb-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-ink-hi text-[22px] font-bold">{t('topPerformers')}</h2>
            <Link href="/rankings" className="text-lime-bright text-[13px] hover:underline">
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
            <h2 className="font-display text-ink-hi text-[22px] font-bold">{t('latest')}</h2>
            <Link href="/processors" className="text-lime-bright text-[13px] hover:underline">
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
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | null;
  accent?: boolean;
}) {
  return (
    <div className="panel">
      <p className="label">{label}</p>
      <p className={'metric mt-1 ' + (accent ? '!text-lime-bright' : '')}>
        {value !== null ? value.toLocaleString() : '—'}
      </p>
    </div>
  );
}

function FeatureCard({
  href,
  abbr,
  title,
  desc,
}: {
  href: string;
  abbr: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="panel group flex items-start gap-3 transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <span className="border-hairline bg-panel-2 text-ink-muted flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] border font-mono text-[11px] font-semibold">
        {abbr}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-ink-hi flex items-center justify-between text-[14px] font-semibold">
          {title}
          <span className="text-ink-faint group-hover:text-ink transition">→</span>
        </p>
        <p className="text-ink-muted mt-1 text-[12.5px]">{desc}</p>
      </div>
    </Link>
  );
}

function ProcessorCard({ p }: { p: RankedProcessor }) {
  return (
    <Link
      href={`/processors/${p.slug}`}
      className="panel flex flex-col transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="mb-3 flex items-center gap-2">
        <Mark mfr={p.manufacturer} />
        <span className="tracking-label text-ink-faint text-[10px] font-semibold uppercase">
          {p.type}
        </span>
      </div>
      <p className="text-ink-hi text-[14px] font-semibold">{p.modelName}</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="label">MSRP</p>
          <Price
            usd={p.msrpUsd}
            idr={p.priceIdr}
            className="text-ink-hi mt-1 block font-mono text-[13px]"
          />
        </div>
        <div className="text-right">
          <p className="label">Score</p>
          <p className="text-lime-bright mt-1 font-mono text-[13px] font-bold">
            {Math.round(p.performance)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function LatestCard({ p, locale }: { p: Processor; locale: string }) {
  const released = p.releaseDate
    ? new Date(p.releaseDate).toLocaleDateString(locale, { year: 'numeric', month: 'short' })
    : null;
  return (
    <Link
      href={`/processors/${p.slug}`}
      className="panel flex flex-col transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="mb-3 flex items-center gap-2">
        <Mark mfr={p.manufacturer} />
        <span className="tracking-label text-ink-faint text-[10px] font-semibold uppercase">
          {p.type}
        </span>
      </div>
      <p className="text-ink-hi text-[14px] font-semibold">{p.modelName}</p>
      <p className="text-ink-faint mt-1 text-[11.5px]">
        {[p.architecture, released].filter(Boolean).join(' · ')}
      </p>
      <Price
        usd={p.msrpUsd}
        idr={p.priceIdr}
        className="text-ink-hi mt-4 block font-mono text-[13px]"
      />
    </Link>
  );
}
