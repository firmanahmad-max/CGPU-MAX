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

interface StreamWarning {
  key: string;
  [param: string]: string | number;
}
interface StreamingResult {
  encoder: { encoder: string; hardware: boolean; reasonKey: string; x264Preset?: string };
  recommendedBitrateKbps: number;
  maxPlatformBitrateKbps: number;
  uploadHeadroomMbps: number;
  keyframeIntervalSec: number;
  qualityVerdict: 'great' | 'good' | 'limited';
  uploadUsagePct: number;
  dataPerHourGb: number;
  outputResolution: string;
  impactsGameFps: boolean;
  warnings: StreamWarning[];
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
          <p className="text-ink-muted mt-3 max-w-2xl text-sm leading-relaxed">{t('whatIsThis')}</p>
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
            <Row label={t('gpuBrand')} help={t('gpuBrandHelp')}>
              {(['NVIDIA', 'AMD', 'INTEL'] as Mfr[]).map((m) => (
                <Toggle key={m} active={gpuManufacturer === m} onClick={() => setMfr(m)}>
                  {m}
                </Toggle>
              ))}
            </Row>
            <Row label={t('platform')} help={t('platformHelp')}>
              {(['twitch', 'youtube', 'kick'] as Platform[]).map((p) => (
                <Toggle key={p} active={platform === p} onClick={() => setPlatform(p)}>
                  {p}
                </Toggle>
              ))}
            </Row>
            <Row label={t('resolution')} help={t('resolutionHelp')}>
              {(['720p', '1080p', '1440p', '4K'] as Res[]).map((r) => (
                <Toggle key={r} active={resolution === r} onClick={() => setResolution(r)}>
                  {r}
                </Toggle>
              ))}
            </Row>
            <Row label={t('fps')} help={t('fpsHelp')}>
              {[30, 60, 120].map((f) => (
                <Toggle key={f} active={fps === f} onClick={() => setFps(f)}>
                  {f}
                </Toggle>
              ))}
            </Row>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="label">{t('uploadSpeed')}</p>
                <span className="text-ink-hi font-mono text-sm">{uploadMbps} Mbps</span>
              </div>
              <p className="text-ink-faint mb-2 text-[11px]">{t('uploadHelp')}</p>
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
            <StreamingResultView
              result={result}
              resolution={resolution}
              fps={fps}
              upload={uploadMbps}
            />
          )}
        </SignedIn>
      </main>
    </>
  );
}

function StreamingResultView({
  result,
  resolution,
  fps,
  upload,
}: {
  result: StreamingResult;
  resolution: string;
  fps: number;
  upload: number;
}) {
  const t = useTranslations('streaming');

  const qualityCls =
    result.qualityVerdict === 'great'
      ? 'border-lime/50 bg-lime/15 text-lime-bright'
      : result.qualityVerdict === 'good'
        ? 'border-cblue/50 bg-cblue/15 text-cblue-bright'
        : 'border-camber/50 bg-camber/15 text-camber-bright';

  const usagePct = result.uploadUsagePct;
  const usageTone = usagePct <= 70 ? 'bg-lime' : usagePct <= 85 ? 'bg-camber' : 'bg-cred';
  const downscaled = result.outputResolution !== resolution;

  const settings: { label: string; value: string }[] = [
    { label: t('obsEncoder'), value: result.encoder.encoder },
    { label: t('obsRateControl'), value: t('obsRateControlValue') },
    { label: t('obsBitrate'), value: `${result.recommendedBitrateKbps} kbps` },
    { label: t('obsOutputRes'), value: result.outputResolution },
    { label: t('obsFps'), value: String(fps) },
    { label: t('obsKeyframe'), value: `${result.keyframeIntervalSec}s` },
    ...(result.encoder.x264Preset
      ? [{ label: t('obsPreset'), value: result.encoder.x264Preset }]
      : []),
  ];

  return (
    <section className="mt-8 space-y-5">
      {/* The payoff: exact OBS settings */}
      <div className="card">
        <p className="label mb-3">{t('obsTitle')}</p>
        <div className="border-hairline divide-hairline grid divide-y overflow-hidden rounded-lg border">
          {settings.map((s) => (
            <div key={s.label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-ink-mid text-[13px]">{s.label}</span>
              <span className="text-ink-hi font-mono text-[13px] font-medium">{s.value}</span>
            </div>
          ))}
        </div>
        {downscaled && (
          <p className="text-camber-bright mt-3 text-[12px]">
            {t('downscaleNote', { input: resolution, res: result.outputResolution })}
          </p>
        )}
      </div>

      {/* Quality + internet usage */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <div className="mb-2 flex items-center gap-2">
            <p className="label">{t('qualityTitle')}</p>
            <Pill className={qualityCls}>{t(`quality_${result.qualityVerdict}`)}</Pill>
          </div>
          <p className="text-ink-muted text-sm">{t(`quality_${result.qualityVerdict}_desc`)}</p>
        </div>

        <div className="card">
          <p className="label mb-2">{t('usageTitle')}</p>
          <div className="bg-panel-2 mb-2 h-2.5 w-full overflow-hidden rounded-full">
            <div
              className={`${usageTone} h-full rounded-full`}
              style={{ width: `${Math.max(4, Math.min(100, usagePct))}%` }}
            />
          </div>
          <p className="text-ink-mid text-[12.5px]">
            {t('usageLine', { pct: usagePct, mbps: upload })}
          </p>
          <p className="text-ink-faint mt-1 font-mono text-[12px]">
            {t('dataPerHour', { gb: result.dataPerHourGb })}
          </p>
        </div>
      </div>

      {/* How it's encoded (plain language) */}
      <div className="card">
        <p className="label mb-1">{t('encoderTitle')}</p>
        <p className="text-ink-mid text-sm">{t(`encoderReason.${result.encoder.reasonKey}`)}</p>
        <p
          className={
            'mt-2 text-[12.5px] ' +
            (result.impactsGameFps ? 'text-camber-bright' : 'text-lime-bright')
          }
        >
          {result.impactsGameFps ? t('impactsFpsNote') : t('noImpactFpsNote')}
        </p>
      </div>

      {result.warnings.length > 0 && (
        <div className="card border-camber/30 bg-camber/5">
          <p className="label text-camber-bright mb-2">{t('warnings')}</p>
          <ul className="text-camber-bright/90 space-y-1 text-sm">
            {result.warnings.map((w, i) => (
              <li key={i}>• {t(`warning.${w.key}`, w)}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Row({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="label mb-1">{label}</p>
      {help && <p className="text-ink-faint mb-2 text-[11px]">{help}</p>}
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
