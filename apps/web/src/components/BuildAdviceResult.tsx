'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import type {
  BuildAdvice,
  CompatibilityCheck,
  ComponentPick,
  PerformanceInsight,
  PowerInsight,
} from '@/lib/advisorTypes';
import { useCurrency } from '@/lib/currency-context';

import { Pill } from './Pill';

export function BuildAdviceResult({ advice }: { advice: BuildAdvice }) {
  const t = useTranslations('advisor');
  const { format } = useCurrency();
  return (
    <section className="mt-10 space-y-6">
      <div className="card">
        <div className="mb-3 flex items-center gap-3">
          <Pill variant="intel">{t('aiBuild')}</Pill>
          {advice.withinBudget ? (
            <Pill className="border-lime/50 bg-lime/15 text-lime-bright">{t('withinBudget')}</Pill>
          ) : (
            <Pill className="border-camber/50 bg-camber/15 text-camber-bright">
              {t('overBudget')}
            </Pill>
          )}
          <span className="text-ink-faint text-xs">{t('poweredBy')}</span>
        </div>
        <p className="text-ink text-sm leading-relaxed">{advice.summary}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PickCard pick={advice.cpu} />
        <PickCard pick={advice.gpu} />
        <PickCard pick={advice.motherboard} />
        <PickCard pick={advice.ram} />
        <PickCard pick={advice.ssd} />
        <PickCard pick={advice.psu} />
        <PickCard pick={advice.case} />
        <PickCard pick={advice.cooler} />
      </div>

      {advice.monitor && (
        <div>
          <p className="label mb-2">{t('matchedMonitor')}</p>
          <PickCard pick={advice.monitor} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={t('estimatedTotal')} value={format(advice.estimatedTotalUsd)} />
        <Stat label={t('recommendedPsu')} value={`${advice.recommendedPsuWatts} W`} />
        <Stat label={t('performance')} value={advice.expectedPerformance} small />
      </div>

      {advice.insights?.compatibility && advice.insights.compatibility.length > 0 && (
        <CompatibilityPanel
          checks={advice.insights.compatibility}
          power={advice.insights.power ?? null}
        />
      )}

      {advice.insights?.performance && <PerformancePanel p={advice.insights.performance} />}

      <div className="card">
        <p className="label mb-2">{t('upgradePath')}</p>
        <p className="text-ink-mid text-sm">{advice.upgradePathNote}</p>
      </div>

      {advice.warnings.length > 0 && (
        <div className="card border-camber/30 bg-camber/5">
          <p className="label text-camber-bright mb-2">{t('warnings')}</p>
          <ul className="text-camber-bright/90 space-y-1 text-sm">
            {advice.warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function PickCard({ pick }: { pick: ComponentPick }) {
  const { format } = useCurrency();
  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <p className="label">{pick.category.toUpperCase()}</p>
        <span className="text-ink-mid font-mono text-sm">~{format(pick.approxPriceUsd)}</span>
      </div>
      {pick.slug && (pick.category === 'cpu' || pick.category === 'gpu') ? (
        <Link
          href={`/processors/${pick.slug}`}
          className="font-display hover:text-lime-bright text-ink-hi text-lg font-semibold"
        >
          {pick.modelName}
        </Link>
      ) : (
        <p className="font-display text-ink-hi text-lg font-semibold">{pick.modelName}</p>
      )}
      <p className="text-ink-muted mt-2 text-sm">{pick.rationale}</p>
    </div>
  );
}

function CompatibilityPanel({
  checks,
  power,
}: {
  checks: CompatibilityCheck[];
  power: PowerInsight | null;
}) {
  const t = useTranslations('advisor');

  const line = (c: CompatibilityCheck): string => {
    const a = c.a ?? '—';
    const b = c.b ?? '—';
    switch (c.code) {
      case 'socket':
        return c.status === 'unknown'
          ? t('compatSocketUnknown')
          : t('compatSocket', { cpu: a, mobo: b });
      case 'memory':
        return c.status === 'unknown'
          ? t('compatMemoryUnknown')
          : t('compatMemory', { ram: a, mobo: b });
      case 'formFactor':
        return c.status === 'unknown'
          ? t('compatFormUnknown')
          : t('compatForm', { case: a, mobo: b });
      case 'psu':
        return c.status === 'unknown'
          ? t('compatPsuUnknown')
          : t('compatPsu', { chosen: a, needed: b });
      case 'cooler':
        return c.status === 'unknown'
          ? t('compatCoolerUnknown')
          : c.status === 'warn'
            ? t('compatCoolerWarn', { cooler: a, tdp: b })
            : t('compatCoolerOk', { cooler: a, tdp: b });
    }
  };

  const icon = (s: CompatibilityCheck['status']) => (s === 'ok' ? '✓' : s === 'warn' ? '!' : '·');
  const tone = (s: CompatibilityCheck['status']) =>
    s === 'ok' ? 'text-lime-bright' : s === 'warn' ? 'text-camber-bright' : 'text-ink-faint';

  const headroom = power?.headroomPct ?? null;
  const headroomTone =
    headroom === null
      ? 'bg-ink-faint'
      : headroom >= 30
        ? 'bg-lime'
        : headroom >= 10
          ? 'bg-camber'
          : 'bg-cred';

  return (
    <div className="card">
      <p className="label mb-3">{t('compatibility')}</p>
      <ul className="space-y-2">
        {checks.map((c) => (
          <li key={c.code} className="flex items-start gap-2 text-[13px]">
            <span className={`mt-[1px] font-mono font-bold ${tone(c.status)}`}>
              {icon(c.status)}
            </span>
            <span className="text-ink-mid">{line(c)}</span>
          </li>
        ))}
      </ul>

      {power && (
        <div className="border-hairline mt-4 border-t pt-4">
          <div className="mb-1 flex items-center justify-between text-[12px]">
            <span className="label">{t('psuHeadroom')}</span>
            <span className="text-ink-mid font-mono">
              {power.chosenPsuW ? `${power.chosenPsuW}W` : '—'} /{' '}
              <span className="text-ink-faint">
                {t('draw')} ~{power.estimatedDrawW}W
              </span>
              {headroom !== null && <span className="text-ink-hi"> · +{headroom}%</span>}
            </span>
          </div>
          <div className="bg-panel-2 h-2.5 w-full overflow-hidden rounded-full">
            <div
              className={`${headroomTone} h-full rounded-full`}
              style={{
                width: `${Math.max(
                  4,
                  Math.min(100, headroom === null ? 0 : Math.min(100, 50 + headroom)),
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PerformancePanel({ p }: { p: PerformanceInsight }) {
  const t = useTranslations('advisor');
  const maxPower = Math.max(p.cpuPower, p.gpuPower, 100);

  const balance =
    p.limitingComponent === 'balanced'
      ? { text: t('balanced'), cls: 'border-lime/50 bg-lime/15 text-lime-bright' }
      : p.limitingComponent === 'cpu'
        ? {
            text: t('cpuLimited', { pct: p.bottleneckPercentage }),
            cls: 'border-camber/50 bg-camber/15 text-camber-bright',
          }
        : {
            text: t('gpuLimited', { pct: p.bottleneckPercentage }),
            cls: 'border-cblue/50 bg-cblue/15 text-cblue-bright',
          };

  return (
    <div className="card">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <p className="label">{t('estimatedFps')}</p>
        <span className="pill border-hairline text-ink-faint">{p.targetResolution}</span>
        <Pill className={balance.cls}>{balance.text}</Pill>
        <span className="text-ink-faint ml-auto text-[11px]">{t('algoNote')}</span>
      </div>

      {/* FPS table */}
      <div className="border-hairline overflow-hidden rounded-lg border">
        <table className="w-full text-[12.5px]">
          <thead className="bg-panel-2 tracking-label text-ink-muted text-left text-[10px] uppercase">
            <tr>
              <th className="px-3 py-2">{t('workload')}</th>
              <th className="px-3 py-2 text-right">{t('fpsRange')}</th>
              <th className="w-1/2 px-3 py-2">{t('estimatedFps')}</th>
            </tr>
          </thead>
          <tbody>
            {p.fps.map((f) => {
              const w = Math.min(100, (f.max / 360) * 100);
              return (
                <tr key={f.profile} className="border-hairline border-t">
                  <td className="text-ink-hi px-3 py-2 font-medium">{f.label}</td>
                  <td className="text-ink-hi px-3 py-2 text-right font-mono">
                    {f.min}–{f.max}
                  </td>
                  <td className="px-3 py-2">
                    <div className="bg-panel-2 h-2 w-full overflow-hidden rounded-full">
                      <div className="bg-lime h-full rounded-full" style={{ width: `${w}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CPU vs GPU power balance */}
      <div className="mt-4 space-y-2">
        <PowerBar label={t('cpuPower')} value={p.cpuPower} max={maxPower} tone="cblue" />
        <PowerBar label={t('gpuPower')} value={p.gpuPower} max={maxPower} tone="lime" />
      </div>

      {p.note && <p className="text-ink-muted mt-3 text-[12.5px]">{p.note}</p>}
    </div>
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
  const bar = tone === 'cblue' ? 'bg-cblue' : 'bg-lime';
  return (
    <div className="flex items-center gap-3">
      <span className="label w-[72px] flex-shrink-0">{label}</span>
      <div className="bg-panel-2 h-2.5 flex-1 overflow-hidden rounded-full">
        <div className={`${bar} h-full rounded-full`} style={{ width: `${w}%` }} />
      </div>
      <span className="text-ink-mid w-9 flex-shrink-0 text-right font-mono text-[11px]">
        {value}
      </span>
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="card">
      <p className="label">{label}</p>
      <p className={small ? 'text-ink mt-2 text-sm' : 'metric mt-2'}>{value}</p>
    </div>
  );
}
