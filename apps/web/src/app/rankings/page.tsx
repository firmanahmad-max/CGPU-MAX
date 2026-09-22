import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Mark } from '@/components/console/Mark';
import { Price } from '@/components/console/Price';
import { RankingsFilters } from '@/components/RankingsFilters';
import { getRankings, type RankedProcessor, type RankingCategory } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    type?: string;
    manufacturer?: string;
    sort?: string;
    category?: string;
    bracket?: string;
  };
}

const CATEGORIES: RankingCategory[] = ['overall', 'gaming', 'productivity', 'workstation'];

// Price brackets → min/max, mirroring the prior version's pills.
const BRACKET_RANGE: Record<string, { minPrice?: number; maxPrice?: number }> = {
  budget: { maxPrice: 299 },
  mid: { minPrice: 300, maxPrice: 700 },
  high: { minPrice: 701 },
};

export default async function RankingsPage({ searchParams }: PageProps) {
  const type = searchParams.type === 'GPU' ? 'GPU' : 'CPU';
  const manufacturer =
    searchParams.manufacturer === 'INTEL' ||
    searchParams.manufacturer === 'AMD' ||
    searchParams.manufacturer === 'NVIDIA'
      ? searchParams.manufacturer
      : undefined;
  const sort = searchParams.sort === 'value' ? 'value' : 'performance';
  const category = CATEGORIES.includes(searchParams.category as RankingCategory)
    ? (searchParams.category as RankingCategory)
    : 'overall';
  const range = BRACKET_RANGE[searchParams.bracket ?? 'all'] ?? {};

  const [t, data] = await Promise.all([
    getTranslations('rankings'),
    getRankings({ type, manufacturer, sort, category, limit: 100, ...range }),
  ]);
  const best = data?.items[0]?.performance ?? 100;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-6">
        <h1 className="font-display text-ink-hi text-[26px] font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-ink-faint mt-1 text-[13px]">{t('subtitle', { type, sort })}</p>
      </header>

      <RankingsFilters />

      {!data || data.items.length === 0 ? (
        <div className="panel text-ink-muted text-center text-[13px]">{t('empty', { type })}</div>
      ) : (
        <>
          <p className="label mb-4">{t('summary', { type, sort, total: data.total })}</p>
          <div className="panel !p-[10px]">
            <ul className="flex flex-col">
              {data.items.map((p) => (
                <RankRow key={p.slug} p={p} best={best} t={t} />
              ))}
            </ul>
          </div>
        </>
      )}
    </main>
  );
}

function RankRow({
  p,
  best,
  t,
}: {
  p: RankedProcessor;
  best: number;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const barPct = Math.max(3, Math.min(100, (p.performance / best) * 100));
  const top = p.rank === 1;
  const costPerScore = p.msrpUsd && p.performance > 0 ? p.msrpUsd / p.performance : null;

  return (
    <li>
      <Link
        href={`/processors/${p.slug}`}
        className={
          'grid grid-cols-[30px_1fr_auto] items-center gap-3 rounded-[10px] px-[10px] py-3 transition hover:bg-white/[0.04] ' +
          (top ? 'bg-white/[0.04]' : '')
        }
      >
        <span
          className={
            'font-mono text-[13px] font-bold ' + (top ? 'text-lime-bright' : 'text-ink-muted')
          }
        >
          {String(p.rank).padStart(2, '0')}
        </span>

        <div className="min-w-0">
          <div className="mb-[6px] flex items-center gap-2">
            <Mark mfr={p.manufacturer} />
            <span className="text-ink-hi truncate text-[13px] font-semibold">{p.modelName}</span>
            <Price
              usd={p.msrpUsd}
              idr={p.priceIdr}
              className="text-ink-muted font-mono text-[10.5px] font-medium"
            />
          </div>
          <div className="rounded-pill h-[6px] overflow-hidden bg-white/[0.06]">
            <div
              className={'rounded-pill h-full ' + (top ? 'bg-lime' : 'bg-white/[0.28]')}
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>

        <div className="pl-2 text-right">
          <p className="text-ink-hi font-mono text-[14px] font-bold">{Math.round(p.performance)}</p>
          {costPerScore !== null && (
            <p className="text-ink-faint font-mono text-[10.5px]">
              {t('perScore', { value: costPerScore.toFixed(2) })}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
