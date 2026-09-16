import { useTranslations } from 'next-intl';

import type { BottleneckPayload } from '@/lib/api';

import { BottleneckGauge, severityColor, type Severity } from './BottleneckGauge';

interface BottleneckResultProps {
  result: BottleneckPayload;
}

const PROFILES = ['esports', 'aaa', 'vr', 'creative'] as const;
const RESOLUTIONS = ['1080p', '1440p', '4K'] as const;

export function BottleneckResult({ result }: BottleneckResultProps) {
  const t = useTranslations('bottleneck');
  const headline =
    result.scenarios.find((s) => s.resolution === '1440p' && s.profile === 'aaa') ??
    result.scenarios[0];

  if (!headline) return null;

  return (
    <section className="mt-8 space-y-4">
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* Gauge + metric grid */}
        <div className="panel flex flex-col items-center bg-gradient-to-b from-[#15181C] to-[#101216]">
          <BottleneckGauge
            percentage={headline.bottleneckPercentage}
            severity={headline.severity}
            label={`${headline.resolution} · ${headline.profile}`}
          />
          <div className="mt-4 grid w-full grid-cols-2 gap-[10px]">
            <MetricCell label={t('limiting')} value={headline.limitingComponent.toUpperCase()} />
            <MetricCell
              label={t('thermalEstimate')}
              value={result.thermalEstimateC ? `${result.thermalEstimateC} °C` : '—'}
            />
            <MetricCell
              label={t('powerDraw')}
              value={result.totalPowerDrawW ? `${result.totalPowerDrawW} W` : '—'}
            />
            <MetricCell
              label={t('recommendedPsu')}
              value={result.recommendedPsuW ? `${result.recommendedPsuW} W` : '—'}
            />
          </div>
        </div>

        {/* Power index bars */}
        <div className="panel flex flex-col justify-center">
          <p className="label mb-4">{t('powerIndex')}</p>
          <PowerBar label={`CPU · ${result.cpu.modelName}`} value={result.cpuPower} color="cblue" />
          <div className="mt-4">
            <PowerBar
              label={`GPU · ${result.gpu.modelName}`}
              value={result.gpuPower}
              color="lime"
            />
          </div>
        </div>
      </div>

      {/* 12-scenario matrix */}
      <div className="panel">
        <p className="label mb-3">{t('matrix')}</p>
        <div className="grid grid-cols-[70px_repeat(4,1fr)] gap-[6px]">
          <span />
          {PROFILES.map((p) => (
            <span
              key={p}
              className="text-ink-muted text-center text-[10px] font-semibold uppercase tracking-[0.1em]"
            >
              {p}
            </span>
          ))}
          {RESOLUTIONS.map((res) => (
            <MatrixRow key={res} res={res} scenarios={result.scenarios} headline={headline} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="panel">
          <p className="label mb-3">{t('recommendations')}</p>
          <ul className="text-ink-mid flex flex-col gap-2 text-[13px]">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-lime-bright mt-[1px] flex-shrink-0">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-ink-faint flex flex-wrap items-center gap-3 text-[11px]">
        <span className="pill">{t('algorithm', { version: result.algorithmVersion })}</span>
        {result.shareSlug && (
          <span className="font-mono">
            {t('share')}: <span className="text-ink-mid">{result.shareSlug}</span>
          </span>
        )}
      </div>
    </section>
  );
}

function MatrixRow({
  res,
  scenarios,
  headline,
}: {
  res: string;
  scenarios: BottleneckPayload['scenarios'];
  headline: BottleneckPayload['scenarios'][number];
}) {
  return (
    <>
      <span className="text-ink-faint flex items-center font-mono text-[12px] font-semibold">
        {res}
      </span>
      {PROFILES.map((profile) => {
        const s = scenarios.find((x) => x.resolution === res && x.profile === profile);
        if (!s)
          return (
            <span
              key={profile}
              className="border-hairline bg-panel-2 text-ink-faint rounded-[9px] border px-[6px] py-[10px] text-center"
            >
              —
            </span>
          );
        const color = severityColor(s.severity as Severity);
        const on = s.resolution === headline.resolution && s.profile === headline.profile;
        return (
          <span
            key={profile}
            className="rounded-[9px] border px-[6px] py-[10px] text-center"
            style={{
              borderColor: on ? color : 'rgba(255,255,255,.07)',
              background: on ? 'rgba(255,255,255,.06)' : '#0E1013',
            }}
          >
            <span className="block font-mono text-[15px] font-bold" style={{ color }}>
              {s.bottleneckPercentage.toFixed(1)}
            </span>
            <span className="text-ink-muted mt-[2px] block text-[9.5px] font-semibold uppercase tracking-[0.1em]">
              {s.limitingComponent}
            </span>
          </span>
        );
      })}
    </>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-hairline bg-panel-2 rounded-[10px] border p-[11px]">
      <p className="label">{label}</p>
      <p className="text-ink-hi mt-[5px] font-mono text-[14px] font-semibold">{value}</p>
    </div>
  );
}

function PowerBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'cblue' | 'lime';
}) {
  const pct = Math.max(3, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13px]">
        <span className="text-ink-mid truncate">{label}</span>
        <span className="text-ink-hi ml-2 font-mono font-semibold">{Math.round(value)}/100</span>
      </div>
      <div className="rounded-pill h-2 overflow-hidden bg-white/5">
        <div
          className={'rounded-pill h-full ' + (color === 'lime' ? 'bg-lime' : 'bg-cblue')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
