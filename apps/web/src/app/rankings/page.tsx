import Link from 'next/link';

import { NavBar } from '@/components/NavBar';
import { Pill } from '@/components/Pill';
import { RankingsFilters } from '@/components/RankingsFilters';
import { getRankings, type RankedProcessor } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { type?: string; manufacturer?: string; sort?: string; bracket?: string };
}

const manufacturerVariant = (m: string) =>
  m === 'INTEL' ? 'intel' : m === 'AMD' ? 'amd' : 'nvidia';

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
  const range = BRACKET_RANGE[searchParams.bracket ?? 'all'] ?? {};

  const data = await getRankings({ type, manufacturer, sort, limit: 100, ...range });
  const best = data?.items[0]?.performance ?? 100;

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-8 flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white">
              Peringkat Performa
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Best {type}s ranked by performance index{sort === 'value' ? ' value' : ''}.
            </p>
          </div>
        </header>

        <RankingsFilters />

        {!data || data.items.length === 0 ? (
          <div className="card text-center text-sm text-slate-400">
            No ranked {type}s match these filters.
          </div>
        ) : (
          <>
            <p className="label mb-4">
              {type} · {sort === 'value' ? 'best value' : 'top performance'} · {data.total} results
            </p>
            <ul className="space-y-3">
              {data.items.map((p) => (
                <RankRow key={p.slug} p={p} best={best} />
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}

function RankRow({ p, best }: { p: RankedProcessor; best: number }) {
  const barPct = Math.max(3, Math.min(100, (p.performance / best) * 100));
  const isGold = p.rank === 1;
  const costPerScore = p.msrpUsd && p.performance > 0 ? p.msrpUsd / p.performance : null;

  return (
    <li>
      <Link
        href={`/processors/${p.slug}`}
        className="card flex items-center gap-4 transition hover:border-white/25 hover:bg-white/[0.04]"
      >
        <Medal rank={p.rank} />

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Pill variant={manufacturerVariant(p.manufacturer)}>{p.manufacturer}</Pill>
            <span className="truncate font-semibold text-white">{p.modelName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className={
                  'h-full rounded-full ' + (isGold ? 'bg-state-warning' : 'bg-accent-blue')
                }
                style={{ width: `${barPct}%` }}
              />
            </div>
            <span className="w-8 text-right font-mono text-sm font-semibold text-white">
              {Math.round(p.performance)}
            </span>
          </div>
        </div>

        <div className="w-24 text-right">
          <p className="font-mono text-sm text-white">
            {p.msrpUsd ? `$${p.msrpUsd.toLocaleString()}` : '—'}
          </p>
          <p className="text-xs text-slate-500">
            {costPerScore !== null ? `$${costPerScore.toFixed(2)}/score` : '—'}
          </p>
        </div>
        <span className="text-slate-600">›</span>
      </Link>
    </li>
  );
}

function Medal({ rank }: { rank: number }) {
  const style =
    rank === 1
      ? 'bg-state-warning/20 text-state-warning border-state-warning/40'
      : rank === 2
        ? 'border-slate-300/40 bg-slate-300/15 text-slate-200'
        : rank === 3
          ? 'border-accent-coral/40 bg-accent-coral/15 text-orange-300'
          : 'border-white/10 bg-white/5 text-slate-400';
  return (
    <span
      className={
        'rounded-card flex h-10 w-10 flex-shrink-0 items-center justify-center border font-mono text-sm font-semibold ' +
        style
      }
    >
      {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
    </span>
  );
}
