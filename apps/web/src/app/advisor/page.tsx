'use client';

import Link from 'next/link';

import { SignedIn, SignedOut } from '@/lib/auth';
import { useState } from 'react';

import { BuildAdviceResult } from '@/components/BuildAdviceResult';
import { NavBar } from '@/components/NavBar';
import type { BuildAdvice, BuildPurpose, Resolution } from '@/lib/advisorTypes';
import { useAuthedFetch } from '@/lib/useAuthedFetch';

const PURPOSES: { value: BuildPurpose; label: string }[] = [
  { value: 'gaming', label: 'Gaming' },
  { value: 'streaming', label: 'Streaming' },
  { value: 'content_creation', label: 'Content creation' },
  { value: 'workstation', label: 'Workstation' },
  { value: 'budget', label: 'Budget all-rounder' },
];
const RESOLUTIONS: Resolution[] = ['1080p', '1440p', '4K'];

export default function AdvisorPage() {
  const authedFetch = useAuthedFetch();
  const [budget, setBudget] = useState(1500);
  const [purpose, setPurpose] = useState<BuildPurpose>('gaming');
  const [resolution, setResolution] = useState<Resolution>('1440p');
  const [preferences, setPreferences] = useState('');
  const [advice, setAdvice] = useState<BuildAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    setAdvice(null);
    try {
      const res = await authedFetch('/api/v1/advisor/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetUsd: budget, purpose, resolution, preferences }),
      });
      if (res.status === 402) {
        throw new Error('The AI Build Advisor is a Pro feature. Upgrade on the Pricing page.');
      }
      if (res.status === 429) {
        throw new Error('Monthly AI recommendation limit reached for your plan.');
      }
      if (!res.ok) throw new Error(await res.text());
      setAdvice((await res.json()) as BuildAdvice);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <p className="label">Pro</p>
            <span className="pill border-accent-purple/40 bg-accent-purple/10 text-purple-300">
              AI-powered
            </span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white">
            Build Advisor
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Tell us your budget and goals. Our advisor recommends a balanced CPU + GPU pairing from
            the live catalog, with rationale, PSU sizing, and an upgrade path.
          </p>
        </header>

        <SignedOut>
          <div className="card text-center">
            <p className="label mb-2">Sign in required</p>
            <p className="text-sm text-slate-400">
              The Build Advisor is a Pro feature.{' '}
              <Link
                href="/sign-in?redirect_url=/advisor"
                className="text-accent-blue hover:underline"
              >
                Sign in
              </Link>{' '}
              or{' '}
              <Link href="/pricing" className="text-accent-blue hover:underline">
                view pricing
              </Link>
              .
            </p>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="card space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="label">Budget (CPU + GPU)</p>
                <span className="font-mono text-lg text-white">${budget.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={300}
                max={6000}
                step={50}
                value={budget}
                onChange={(e) => setBudget(Number(e.currentTarget.value))}
                className="accent-accent-blue w-full"
              />
            </div>

            <div>
              <p className="label mb-2">Purpose</p>
              <div className="flex flex-wrap gap-2">
                {PURPOSES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPurpose(p.value)}
                    className={
                      'rounded-pill tracking-label border px-3 py-1 text-xs font-medium uppercase transition ' +
                      (purpose === p.value
                        ? 'border-white/40 bg-white/15 text-white'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200')
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="label mb-2">Target resolution</p>
              <div className="flex gap-2">
                {RESOLUTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setResolution(r)}
                    className={
                      'rounded-pill tracking-label border px-4 py-1 text-xs font-medium uppercase transition ' +
                      (resolution === r
                        ? 'border-white/40 bg-white/15 text-white'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200')
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="label mb-2">Preferences (optional)</p>
              <input
                type="text"
                value={preferences}
                maxLength={500}
                placeholder="e.g. prefer AMD, quiet build, room for future GPU upgrade"
                onChange={(e) => setPreferences(e.currentTarget.value)}
                className="focus:border-accent-blue w-full rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={onGenerate}
              disabled={loading}
              className="border-accent-purple bg-accent-purple/20 hover:bg-accent-purple/30 rounded-sm border px-6 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {loading ? 'Consulting advisor…' : 'Generate recommendation'}
            </button>
            {error && <p className="text-state-danger text-sm">{error}</p>}
          </div>

          {advice && <BuildAdviceResult advice={advice} />}
        </SignedIn>
      </main>
    </>
  );
}
