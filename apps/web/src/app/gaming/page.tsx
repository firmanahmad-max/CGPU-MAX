'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { SignedIn, SignedOut } from '@/lib/auth';
import { useState } from 'react';

import { Pill } from '@/components/Pill';
import { ProcessorPicker } from '@/components/ProcessorPicker';
import { cn } from '@/lib/cn';
import { useAuthedFetch } from '@/lib/useAuthedFetch';

type Resolution = '1080p' | '1440p' | '4K';
type Profile = 'esports' | 'aaa' | 'vr' | 'simulation';

interface GamingResult {
  presets: { preset: string; avgFps: number; onePercentLowFps: number }[];
  recommendedPreset: string;
  upscaling: { recommended: boolean; tech: string; noteKey: string };
  tipKeys: string[];
  cpuLimited: boolean;
  gpuPower: number;
  cpuPower: number | null;
}

const RESOLUTIONS: Resolution[] = ['1080p', '1440p', '4K'];
const PROFILES: { v: Profile; labelKey: string }[] = [
  { v: 'esports', labelKey: 'profileEsports' },
  { v: 'aaa', labelKey: 'profileAaa' },
  { v: 'vr', labelKey: 'profileVr' },
  { v: 'simulation', labelKey: 'profileSimulation' },
];

export default function GamingPage() {
  const t = useTranslations('gaming');
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
      if (res.status === 402) throw new Error(t('errProFeature'));
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
      <main className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <p className="label">{t('pro')}</p>
            <Pill variant="nvidia">{t('pill')}</Pill>
          </div>
          <h1 className="font-display text-ink-hi text-4xl font-semibold tracking-tight">
            {t('title')}
          </h1>
        </header>

        <SignedOut>
          <div className="card text-ink-muted text-center text-sm">
            <Link href="/sign-in?redirect_url=/gaming" className="text-lime-bright hover:underline">
              {t('signIn')}
            </Link>{' '}
            {t('signInSuffix')}
          </div>
        </SignedOut>

        <SignedIn>
          <div className="grid gap-6 sm:grid-cols-2">
            <ProcessorPicker label={t('gpu')} type="GPU" value={gpuSlug} onChange={setGpuSlug} />
            <ProcessorPicker
              label={t('cpuOptional')}
              type="CPU"
              value={cpuSlug}
              onChange={setCpuSlug}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-6">
            <div>
              <p className="label mb-2">{t('resolution')}</p>
              <div className="flex gap-2">
                {RESOLUTIONS.map((r) => (
                  <Toggle key={r} active={resolution === r} onClick={() => setResolution(r)}>
                    {r}
                  </Toggle>
                ))}
              </div>
            </div>
            <div>
              <p className="label mb-2">{t('profile')}</p>
              <div className="flex gap-2">
                {PROFILES.map((p) => (
                  <Toggle key={p.v} active={profile === p.v} onClick={() => setProfile(p.v)}>
                    {t(p.labelKey)}
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
              className="rounded-control bg-lime text-lime-ink px-6 py-2 text-sm font-semibold transition hover:brightness-110 disabled:opacity-40"
            >
              {loading ? t('predicting') : t('predict')}
            </button>
            {error && <p className="text-cred text-sm">{error}</p>}
          </div>

          {result && (
            <section className="mt-10 space-y-6">
              <div className="grid gap-4 sm:grid-cols-4">
                {result.presets.map((p) => (
                  <div
                    key={p.preset}
                    className={cn(
                      'card text-center',
                      p.preset === result.recommendedPreset && 'border-lime/40 bg-lime/[0.05]',
                    )}
                  >
                    <p className="label capitalize">{p.preset}</p>
                    <p className="metric mt-2">{p.avgFps}</p>
                    <p className="text-ink-faint text-xs">
                      {t('fpsLow', { fps: p.onePercentLowFps })}
                    </p>
                  </div>
                ))}
              </div>

              <div className="card">
                <p className="label mb-1">{t('recommended')}</p>
                <p className="text-ink text-sm">
                  <span className="font-semibold capitalize">{result.recommendedPreset}</span>{' '}
                  {t('presetSuffix')}{' '}
                  {t(`upscalingNote.${result.upscaling.noteKey}`, {
                    tech: result.upscaling.tech,
                    resolution,
                  })}
                </p>
              </div>

              <div className="card">
                <p className="label mb-3">{t('settingsTips')}</p>
                <ul className="text-ink-mid space-y-2 text-sm">
                  {result.tipKeys.map((k, i) => (
                    <li key={i}>• {t(`tip.${k}`)}</li>
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
        'rounded-pill tracking-label border px-3 py-1 text-xs font-medium uppercase transition ' +
        (active
          ? 'border-lime/45 bg-lime/[0.14] text-lime-bright'
          : 'border-hairline bg-panel text-ink-faint hover:text-ink')
      }
    >
      {children}
    </button>
  );
}
