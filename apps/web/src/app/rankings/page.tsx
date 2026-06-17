import Link from 'next/link';

import { NavBar } from '@/components/NavBar';
import { Pill } from '@/components/Pill';
import { RankingsFilters } from '@/components/RankingsFilters';
import { getRankings } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { type?: string; manufacturer?: string; sort?: string };
}

const manufacturerVariant = (m: string) =>
  m === 'INTEL' ? 'intel' : m === 'AMD' ? 'amd' : 'nvidia';

export default async function RankingsPage({ searchParams }: PageProps) {
  const type = searchParams.type === 'GPU' ? 'GPU' : 'CPU';
  const manufacturer =
    searchParams.manufacturer === 'INTEL' ||
    searchParams.manufacturer === 'AMD' ||
    searchParams.manufacturer === 'NVIDIA'
      ? searchParams.manufacturer
      : undefined;
  const sort = searchParams.sort === 'value' ? 'value' : 'performance';

  const data = await getRankings({ type, manufacturer, sort, limit: 100 });
  const best = data?.items[0]?.performance ?? 100;

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-8">
          <p className="label">Peringkat</p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-white">
            CPU &amp; GPU Rankings
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Ranked by a benchmark-derived performance index, or by value (performance per $1000).
          </p>
        </header>

        <RankingsFilters />

        {!data || data.items.length === 0 ? (
          <div className="card text-center text-sm text-slate-400">
            No ranked {type}s yet. Seed data or run the scraper.
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="tracking-label bg-white/[0.03] text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="w-12 px-4 py-3">#</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Performance</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.slug} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-slate-500">{p.rank}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/processors/${p.slug}`}
                        className="hover:text-accent-blue font-medium text-white"
                      >
                        {p.modelName}
                      </Link>
                      <Pill variant={manufacturerVariant(p.manufacturer)} className="ml-2">
                        {p.manufacturer}
                      </Pill>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="bg-accent-blue h-full rounded-full"
                            style={{ width: `${Math.min(100, (p.performance / best) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-slate-300">
                          {p.performance.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-200">
                      {p.msrpUsd ? `$${p.msrpUsd.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">
                      {p.value !== null ? p.value.toFixed(1) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && (
          <p className="mt-3 text-xs text-slate-500">
            {data.total} ranked {type}s · sorted by {sort === 'value' ? 'value' : 'performance'}
          </p>
        )}
      </main>
    </>
  );
}
