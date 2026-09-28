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
  presets: { preset: string; avgFps: number; onePercentLowFps: number; meetsTarget: boolean }[];
  recommendedPreset: string;
  targetFps: number;
  smoothness: 'smooth' | 'ok' | 'stutter';
  upscaling: { recommended: boolean; tech: string; noteKey: string };
  upscaledFps: number | null;
  vram: { gb: number | null; recommendedGb: number; adequate: boolean };
  refreshTarget: number;
  resolutionScaling: { resolution: string; avgFps: number }[];
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

          {result && <GamingResultView result={result} resolution={resolution} />}
        </SignedIn>
      </main>
    </>
  );
}

function GamingResultView({ result, resolution }: { result: GamingResult; resolution: string }) {
  const t = useTranslations('gaming');
  const maxFps = Math.max(...result.presets.map((p) => p.avgFps), 1);
  const smoothCls =
    result.smoothness === 'smooth'
      ? 'border-lime/50 bg-lime/15 text-lime-bright'
      : result.smoothness === 'ok'
        ? 'border-camber/50 bg-camber/15 text-camber-bright'
        : 'border-cred/50 bg-cred/15 text-cred';
  const maxScale = Math.max(...result.resolutionScaling.map((r) => r.avgFps), 1);
  const maxPower = Math.max(result.gpuPower, result.cpuPower ?? 0, 100);

  return (
    <section className="mt-10 space-y-6">
      {/* Headline */}
      <div className="card flex flex-wrap items-center gap-3">
        <p className="label">{t('recommendedHead')}</p>
        <span className="font-display text-ink-hi text-xl font-semibold capitalize">
          {result.recommendedPreset}
        </span>
        <span className="text-ink-faint text-xs">{t('targets', { fps: result.targetFps })}</span>
        <Pill className={smoothCls}>{t(`smooth_${result.smoothness}`)}</Pill>
        <span className="text-ink-faint ml-auto font-mono text-xs">◻ {result.refreshTarget}Hz</span>
      </div>

      {/* FPS by preset with bars + target marker */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <p className="label">{t('fpsByPreset')}</p>
          <span className="text-ink-faint text-[11px]">
            {t('target')}: {result.targetFps} FPS
          </span>
        </div>
        <div className="space-y-2.5">
          {result.presets.map((p) => {
            const w = Math.max(3, (p.avgFps / maxFps) * 100);
            const bar = p.meetsTarget
              ? 'bg-lime'
              : p.avgFps >= result.targetFps * 0.7
                ? 'bg-camber'
                : 'bg-cred';
            const rec = p.preset === result.recommendedPreset;
            return (
              <div key={p.preset} className="flex items-center gap-3">
                <span
                  className={cn(
                    'w-16 text-xs capitalize',
                    rec ? 'text-lime-bright font-semibold' : 'text-ink-mid',
                  )}
                >
                  {p.preset}
                </span>
                <div className="bg-panel-2 relative h-4 flex-1 overflow-hidden rounded">
                  <div className={cn(bar, 'h-full rounded')} style={{ width: `${w}%` }} />
                  <div
                    className="bg-ink-hi/50 absolute inset-y-0 w-px"
                    style={{ left: `${Math.min(100, (result.targetFps / maxFps) * 100)}%` }}
                  />
                </div>
                <span className="text-ink-hi w-9 text-right font-mono text-[13px]">{p.avgFps}</span>
                <span className="text-ink-faint w-20 text-right font-mono text-[10px]">
                  {t('fpsLow', { fps: p.onePercentLowFps })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight trio */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="label mb-2">{t('vramTitle')}</p>
          {result.vram.gb === null ? (
            <p className="text-ink-muted text-sm">{t('vramUnknown')}</p>
          ) : (
            <>
              <p className={cn('metric', !result.vram.adequate && 'text-camber-bright')}>
                {result.vram.gb} GB
              </p>
              <p className="text-ink-faint mt-1 text-[11px]">
                {result.vram.adequate
                  ? t('vramOk', { gb: result.vram.gb, res: resolution })
                  : t('vramTight', {
                      gb: result.vram.gb,
                      need: result.vram.recommendedGb,
                      res: resolution,
                    })}
              </p>
            </>
          )}
        </div>

        <div className="card">
          <p className="label mb-2">{t('monitorTitle')}</p>
          <p className="metric">{result.refreshTarget} Hz</p>
          <p className="text-ink-faint mt-1 text-[11px]">{t('monitorNote')}</p>
        </div>

        <div className="card">
          <p className="label mb-2">{t('upscalingTitle')}</p>
          {result.upscaling.recommended && result.upscaledFps ? (
            <>
              <p className="metric text-lime-bright">
                {t('upscalingUplift', {
                  tech: result.upscaling.tech,
                  fps: result.upscaledFps,
                })}
              </p>
              <p className="text-ink-faint mt-1 text-[11px]">
                {t(`upscalingNote.${result.upscaling.noteKey}`, {
                  tech: result.upscaling.tech,
                  resolution,
                })}
              </p>
            </>
          ) : (
            <p className="text-ink-muted text-sm">{t('nativeComfy')}</p>
          )}
        </div>
      </div>

      {/* Resolution scaling */}
      <div className="card">
        <p className="label mb-3">{t('scalingTitle')}</p>
        <div className="space-y-2">
          {result.resolutionScaling.map((r) => {
            const cur = r.resolution === resolution;
            const w = Math.max(3, (r.avgFps / maxScale) * 100);
            return (
              <div key={r.resolution} className="flex items-center gap-3">
                <span
                  className={cn(
                    'w-14 font-mono text-xs',
                    cur ? 'text-lime-bright font-semibold' : 'text-ink-mid',
                  )}
                >
                  {r.resolution}
                </span>
                <div className="bg-panel-2 h-2.5 flex-1 overflow-hidden rounded-full">
                  <div
                    className={cn('h-full rounded-full', cur ? 'bg-lime' : 'bg-cblue/70')}
                    style={{ width: `${w}%` }}
                  />
                </div>
                <span className="text-ink-hi w-9 text-right font-mono text-[12px]">{r.avgFps}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CPU vs GPU balance */}
      {result.cpuPower !== null && (
        <div className="card">
          <p className="label mb-3">{t('balanceTitle')}</p>
          <div className="space-y-2">
            <PowerBar label={t('gpuPower')} value={result.gpuPower} max={maxPower} tone="lime" />
            <PowerBar label={t('cpuPower')} value={result.cpuPower} max={maxPower} tone="cblue" />
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card">
        <p className="label mb-3">{t('settingsTips')}</p>
        <ul className="text-ink-mid space-y-2 text-sm">
          {result.tipKeys.map((k, i) => (
            <li key={i}>• {t(`tip.${k}`)}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PowerBar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: 'cblue' | 'lime';
}) {
  const w = Math.max(3, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="label w-[72px] flex-shrink-0">{label}</span>
      <div className="bg-panel-2 h-2.5 flex-1 overflow-hidden rounded-full">
        <div
          className={cn('h-full rounded-full', tone === 'lime' ? 'bg-lime' : 'bg-cblue')}
          style={{ width: `${w}%` }}
        />
      </div>
      <span className="text-ink-mid w-9 flex-shrink-0 text-right font-mono text-[11px]">
        {value}
      </span>
    </div>
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
