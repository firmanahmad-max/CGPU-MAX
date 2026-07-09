'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { SignedIn, SignedOut } from '@/lib/auth';
import { useState } from 'react';

import { NavBar } from '@/components/NavBar';
import { Pill } from '@/components/Pill';
import { useAuthedFetch } from '@/lib/useAuthedFetch';

type Platform = 'twitch' | 'youtube' | 'kick';
type Res = '720p' | '1080p' | '1440p' | '4K';
type Mfr = 'NVIDIA' | 'AMD' | 'INTEL';

interface StreamingResult {
  encoder: { encoder: string; hardware: boolean; reason: string };
  recommendedBitrateKbps: number;
  maxPlatformBitrateKbps: number;
  uploadHeadroomMbps: number;
  keyframeIntervalSec: number;
  warnings: string[];
}

export default function StreamingPage() {
  const t = useTranslations('streaming');
  const authedFetch = useAuthedFetch();
  const [gpuManufacturer, setMfr] = useState<Mfr>('NVIDIA');
  const [platform, setPlatform] = useState<Platform>('twitch');
  const [resolution, setResolution] = useState<Res>('1080p');
  const [fps, setFps] = useState(60);
  const [uploadMbps, setUpload] = useState(20);
  const [result, setResult] = useState<StreamingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch('/api/v1/streaming/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gpuManufacturer, platform, resolution, fps, uploadMbps }),
      });
      if (res.status === 402) throw new Error(t('errProFeature'));
      if (!res.ok) throw new Error(await res.text());
      setResult((await res.json()) as StreamingResult);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <p className="label">{t('pro')}</p>
            <Pill variant="amd">{t('pill')}</Pill>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white">
            {t('title')}
          </h1>
        </header>

        <SignedOut>
          <div className="card text-center text-sm text-slate-400">
            <Link
              href="/sign-in?redirect_url=/streaming"
              className="text-accent-blue hover:underline"
            >
              {t('signIn')}
            </Link>{' '}
            {t('signInSuffix')}
          </div>
        </SignedOut>

        <SignedIn>
          <div className="card space-y-5">
            <Row label={t('gpuBrand')}>
              {(['NVIDIA', 'AMD', 'INTEL'] as Mfr[]).map((m) => (
                <Toggle key={m} active={gpuManufacturer === m} onClick={() => setMfr(m)}>
                  {m}
                </Toggle>
              ))}
            </Row>
            <Row label={t('platform')}>
              {(['twitch', 'youtube', 'kick'] as Platform[]).map((p) => (
                <Toggle key={p} active={platform === p} onClick={() => setPlatform(p)}>
                  {p}
                </Toggle>
              ))}
            </Row>
            <Row label={t('resolution')}>
              {(['720p', '1080p', '1440p', '4K'] as Res[]).map((r) => (
                <Toggle key={r} active={resolution === r} onClick={() => setResolution(r)}>
                  {r}
                </Toggle>
              ))}
            </Row>
            <Row label={t('fps')}>
              {[30, 60, 120].map((f) => (
                <Toggle key={f} active={fps === f} onClick={() => setFps(f)}>
                  {f}
                </Toggle>
              ))}
            </Row>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="label">{t('uploadSpeed')}</p>
                <span className="font-mono text-sm text-white">{uploadMbps} Mbps</span>
              </div>
              <input
                type="range"
                min={2}
                max={200}
                step={1}
                value={uploadMbps}
                onChange={(e) => setUpload(Number(e.currentTarget.value))}
                className="accent-accent-blue w-full"
              />
            </div>

            <button
              type="button"
              onClick={run}
              disabled={loading}
              className="border-accent-coral bg-accent-coral/20 hover:bg-accent-coral/30 rounded-sm border px-6 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
            >
              {loading ? t('calculating') : t('build')}
            </button>
            {error && <p className="text-state-danger text-sm">{error}</p>}
          </div>

          {result && (
            <section className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label={t('encoder')} value={result.encoder.encoder} small />
                <Stat label={t('bitrate')} value={`${result.recommendedBitrateKbps} kbps`} />
                <Stat label={t('headroom')} value={`${result.uploadHeadroomMbps} Mbps`} small />
              </div>
              <div className="card">
                <p className="label mb-1">{t('rationale')}</p>
                <p className="text-sm text-slate-300">{result.encoder.reason}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {t('keyframe', {
                    sec: result.keyframeIntervalSec,
                    kbps: result.maxPlatformBitrateKbps,
                  })}
                </p>
              </div>
              {result.warnings.length > 0 && (
                <div className="card border-state-warning/30 bg-state-warning/5">
                  <p className="label mb-2 text-amber-300">{t('warnings')}</p>
                  <ul className="space-y-1 text-sm text-amber-200/90">
                    {result.warnings.map((w, i) => (
                      <li key={i}>• {w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </SignedIn>
      </main>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
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
          ? 'border-white/40 bg-white/15 text-white'
          : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200')
      }
    >
      {children}
    </button>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="card">
      <p className="label">{label}</p>
      <p className={small ? 'mt-2 text-lg font-semibold text-white' : 'metric mt-2'}>{value}</p>
    </div>
  );
}
