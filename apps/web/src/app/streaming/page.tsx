'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { SignedIn, SignedOut } from '@/lib/auth';
import { useState } from 'react';

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
      <main className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <p className="label">{t('pro')}</p>
            <Pill variant="amd">{t('pill')}</Pill>
          </div>
          <h1 className="font-display text-ink-hi text-4xl font-semibold tracking-tight">
            {t('title')}
          </h1>
        </header>

        <SignedOut>
          <div className="card text-ink-muted text-center text-sm">
            <Link
              href="/sign-in?redirect_url=/streaming"
              className="text-lime-bright hover:underline"
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
                <span className="text-ink-hi font-mono text-sm">{uploadMbps} Mbps</span>
              </div>
              <input
                type="range"
                min={2}
                max={200}
                step={1}
                value={uploadMbps}
                onChange={(e) => setUpload(Number(e.currentTarget.value))}
                className="accent-lime w-full"
              />
            </div>

            <button
              type="button"
              onClick={run}
              disabled={loading}
              className="rounded-control bg-lime text-lime-ink px-6 py-2 text-sm font-semibold transition hover:brightness-110 disabled:opacity-40"
            >
              {loading ? t('calculating') : t('build')}
            </button>
            {error && <p className="text-cred text-sm">{error}</p>}
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
                <p className="text-ink-mid text-sm">{result.encoder.reason}</p>
                <p className="text-ink-faint mt-2 text-xs">
                  {t('keyframe', {
                    sec: result.keyframeIntervalSec,
                    kbps: result.maxPlatformBitrateKbps,
                  })}
                </p>
              </div>
              {result.warnings.length > 0 && (
                <div className="card border-camber/30 bg-camber/5">
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
          ? 'border-lime/45 bg-lime/[0.14] text-lime-bright'
          : 'border-hairline bg-panel text-ink-faint hover:text-ink')
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
      <p className={small ? 'text-ink-hi mt-2 text-lg font-semibold' : 'metric mt-2'}>{value}</p>
    </div>
  );
}
