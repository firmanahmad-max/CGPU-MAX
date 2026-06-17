import { NavBar } from '@/components/NavBar';

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <section className="mb-20">
          <p className="label mb-4">Hardware Intelligence Platform</p>
          <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Compare CPUs &amp; GPUs.
            <br />
            <span className="text-accent-blue">Know your bottleneck.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400">
            A professional comparison engine for PC builders, gamers, and system integrators —
            backed by multi-source benchmarks and a transparent bottleneck algorithm.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          <div className="card">
            <p className="label">Database</p>
            <p className="metric mt-2">5,000+</p>
            <p className="mt-2 text-sm text-slate-400">
              Intel, AMD, Nvidia processors across every generation.
            </p>
          </div>
          <div className="card">
            <p className="label">Comparison</p>
            <p className="metric mt-2">Multi-metric</p>
            <p className="mt-2 text-sm text-slate-400">
              Specs, benchmarks, price-performance, and feature deltas side-by-side.
            </p>
          </div>
          <div className="card">
            <p className="label">Bottleneck</p>
            <p className="metric mt-2">1080p · 1440p · 4K</p>
            <p className="mt-2 text-sm text-slate-400">
              Resolution and game-profile aware analysis with thermal &amp; power estimates.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
