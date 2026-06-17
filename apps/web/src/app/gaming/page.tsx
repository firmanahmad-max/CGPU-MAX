'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';

import { NavBar } from '@/components/NavBar';
import { Pill } from '@/components/Pill';
import { ProcessorPicker } from '@/components/ProcessorPicker';
import { cn } from '@/lib/cn';
import { useAuthedFetch } from '@/lib/useAuthedFetch';

type Resolution = '1080p' | '1440p' | '4K';
type Profile = 'esports' | 'aaa' | 'vr' | 'simulation';

interface GamingResult {
  presets: { preset: string; avgFps: number; onePercentLowFps: number }[];
  recommendedPreset: string;
  upscaling: { recommended: boolean; tech: string; note: string };
  settingsTips: string[];
  cpuLimited: boolean;
  gpuPower: number;
  cpuPower: number | null;
}

const RESOLUTIONS: Resolution[] = ['1080p', '1440p', '4K'];
const PROFILES: { v: Profile; l: string }[] = [
  { v: 'esports', l: 'Esports' },
  { v: 'aaa', l: 'AAA' },
  { v: 'vr', l: 'VR' },
  { v: 'simulation', l: 'Simulation' },
];

export default function GamingPage() {
  const authedFetch = useAuthedFetch();
  const [gpuSlug, setGpuSlug] = useState<string | null>(null);
  const [cpuSlug, setCpuSlug] = useState<string | null>(null);
  const [resolution, setResolution] = useState<Resolution>('1440p');
  const [profile, setProfile] = useState<Profile>('aaa');
  const [result, setResult] = useState<GamingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!gpuSlug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch('/api/v1/gaming/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gpuSlug, cpuSlug: cpuSlug ?? undefined, resolution, profile }),
      });
      if (res.status === 402) throw new Error('Gaming optimizer is a Pro feature — upgrade on Pricing.');
      if (!res.ok) throw new Error(await res.text());
      setResult((await res.json()) as GamingResult);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <p className="label">Pro</p>
            <Pill variant="nvidia">FPS predictor</Pill>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white">
            Gaming Optimizer
          </h1>
        </header>

        <SignedOut>
          <div className="card text-center text-sm text-slate-400">
            <Link href="/sign-in?redirect_url=/gaming" className="text-accent-blue hover:underline">
              Sign in
            </Link>{' '}
            with a Pro plan to use the optimizer.
          </div>
        </SignedOut>

        <SignedIn>
          <div className="grid gap-6 sm:grid-cols-2">
            <ProcessorPicker label="GPU" type="GPU" value={gpuSlug} onChange={setGpuSlug} />
            <ProcessorPicker label="CPU (optional)" type="CPU" value={cpuSlug} onChange={setCpuSlug} />
          </div>

          <div className="mt-6 flex flex-wrap gap-6">
            <div>
              <p className="label mb-2">Resolution</p>
              <div className="flex gap-2">
                {RESOLUTIONS.map((r) => (
                  <Toggle key={r} active={resolution === r} onClick={() => setResolution(r)}>
                    {r}
                  </Toggle>
                ))}
              </div>
            </div>
            <div>
              <p className="label mb-2">Profile</p>
              <div className="flex gap-2">
                {PROFILES.map((p) => (
                  <Toggle key={p.v} active={profile === p.v} onClick={() => setProfile(p.v)}>
                    {p.l}
                  </Toggle>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={run}
              disabled={!gpuSlug || loading}
              className="rounded-sm border border-accent-purple bg-accent-purple/20 px-6 py-2 text-sm font-semibold text-white transition hover:bg-accent-purple/30 disabled:opacity-40"
            >
              {loading ? 'Predicting…' : 'Predict FPS'}
            </button>
            {error && <p className="text-sm text-state-danger">{error}</p>}
          </div>

          {result && (
            <section className="mt-10 space-y-6">
              <div className="grid gap-4 sm:grid-cols-4">
                {result.presets.map((p) => (
                  <div
                    key={p.preset}
                    className={cn(
                      'card text-center',
                      p.preset === result.recommendedPreset &&
                        'border-state-success/40 bg-state-success/5',
                    )}
                  >
                    <p className="label capitalize">{p.preset}</p>
                    <p className="metric mt-2">{p.avgFps}</p>
                    <p className="text-xs text-slate-500">{p.onePercentLowFps} fps 1% low</p>
                  </div>
                ))}
              </div>

              <div className="card">
                <p className="label mb-1">Recommended</p>
                <p className="text-sm text-slate-200">
                  <span className="font-semibold capitalize">{result.recommendedPreset}</span> preset.{' '}
                  {result.upscaling.note}
                </p>
              </div>

              <div className="card">
                <p className="label mb-3">Settings tips</p>
                <ul className="space-y-2 text-sm text-slate-300">
                  {result.settingsTips.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </SignedIn>
      </main>
    </>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-pill border px-3 py-1 text-xs font-medium uppercase tracking-label transition ' +
        (active
          ? 'border-white/40 bg-white/15 text-white'
          : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200')
      }
    >
      {children}
    </button>
  );
}
