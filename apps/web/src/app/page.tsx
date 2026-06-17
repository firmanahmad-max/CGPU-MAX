import Link from 'next/link';

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

export default async function HomePage() {
  const [cpuCount, gpuCount, top] = await Promise.all([
    countOf('CPU'),
    countOf('GPU'),
    getRankings({ sort: 'performance', limit: 6 }),
  ]);
  const total = cpuCount !== null && gpuCount !== null ? cpuCount + gpuCount : null;

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <section className="mb-12">
          <p className="label mb-4">Hardware Intelligence Platform</p>
          <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Compare CPUs &amp; GPUs.
            <br />
            <span className="text-accent-blue">Know your bottleneck.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400">
            The most complete CPU &amp; GPU spec database — compare performance, calculate
            bottlenecks, and find the best hardware for your needs.
          </p>

          {/* Quick search — progressive, works without JS (navigates to /processors). */}
          <form action="/processors" method="get" className="mt-8 max-w-xl">
            <div className="rounded-card focus-within:border-accent-blue flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-slate-500">🔍</span>
              <input
                type="search"
                name="search"
                placeholder="Search by processor name, architecture, or brand…"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </form>
        </section>

        {/* Real stat counters */}
        <section className="mb-12 grid gap-4 sm:grid-cols-3">
          <StatCard icon="🧠" label="Total CPU" value={cpuCount} />
          <StatCard icon="🎮" label="Total GPU" value={gpuCount} />
          <StatCard icon="📊" label="Total Processors" value={total} />
        </section>

        {/* Feature navigation cards */}
        <section className="mb-14 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            href="/compare"
            icon="🔄"
            title="Compare"
            desc="Side-by-side comparison of two processors with detailed analysis."
          />
          <FeatureCard
            href="/bottleneck"
            icon="⚙️"
            title="Bottleneck Calculator"
            desc="CPU + GPU pairing analysis across resolutions and game profiles."
          />
          <FeatureCard
            href="/rankings"
            icon="🏆"
            title="Rankings"
            desc="Top CPUs & GPUs ranked by performance and value."
          />
        </section>

        {/* Top performers — real data from the rankings API */}
        {top && top.items.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-white">Top performers</h2>
              <Link href="/rankings" className="text-accent-blue text-sm hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {top.items.map((p) => (
                <ProcessorCard key={p.slug} p={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
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
