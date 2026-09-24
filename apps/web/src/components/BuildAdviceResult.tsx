'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Price } from '@/components/console/Price';
import { getCatalog, getComponents, type ComponentKind } from '@/lib/api';
import type {
  BudgetInsight,
  BuildAdvice,
  BuildInsights,
  CompatibilityCheck,
  ComponentPick,
  EconomicsInsight,
  PerformanceInsight,
  PowerInsight,
} from '@/lib/advisorTypes';
import { formatIdrValue } from '@/lib/currency';
import { useCurrency } from '@/lib/currency-context';
import { useAuthedFetch } from '@/lib/useAuthedFetch';

import { Pill } from './Pill';

interface Alternative {
  slug: string;
  label: string;
  priceUsd: number;
  priceIdr: number | null;
}

const COMPONENT_TYPE: Record<string, ComponentKind> = {
  motherboard: 'MOTHERBOARD',
  ram: 'RAM',
  ssd: 'SSD',
  psu: 'PSU',
  case: 'CASING',
  cooler: 'COOLER',
  monitor: 'MONITOR',
};

async function loadAlternatives(category: string): Promise<Alternative[]> {
  try {
    if (category === 'cpu' || category === 'gpu') {
      const r = await getCatalog({
        type: category === 'cpu' ? 'CPU' : 'GPU',
        sort: 'price',
        dir: 'asc',
        limit: 60,
      });
      return (r?.items ?? [])
        .filter((x) => x.msrpUsd)
        .map((x) => ({
          slug: x.slug,
          label: x.modelName,
          priceUsd: x.msrpUsd ?? 0,
          priceIdr: x.priceIdr,
        }));
    }
    const type = COMPONENT_TYPE[category];
    if (!type) return [];
    const r = await getComponents({ type, limit: 80 });
    return r.items.map((x) => ({
      slug: x.slug,
      label: `${x.brand} ${x.modelName}`,
      priceUsd: x.msrpUsd ?? 0,
      priceIdr: x.priceIdr,
    }));
  } catch {
    return [];
  }
}

export function BuildAdviceResult({
  advice,
  resolution,
  budgetUsd,
}: {
  advice: BuildAdvice;
  resolution?: '1080p' | '1440p' | '4K';
  budgetUsd?: number;
}) {
  const t = useTranslations('advisor');
  const { format } = useCurrency();
  const authedFetch = useAuthedFetch();
  const [current, setCurrent] = useState<BuildAdvice>(advice);
  const [busy, setBusy] = useState(false);

  // Reset when a fresh recommendation arrives.
  useEffect(() => setCurrent(advice), [advice]);

  const res = resolution ?? current.insights?.performance?.targetResolution ?? '1440p';

  const onSwap = async (category: string, alt: Alternative) => {
    const key = category as keyof BuildAdvice;
    const prev = current[key] as ComponentPick;
    const updated: ComponentPick = {
      ...prev,
      slug: alt.slug,
      modelName: alt.label,
      approxPriceUsd: alt.priceUsd,
    };
    const next = { ...current, [key]: updated } as BuildAdvice;
    setCurrent(next);
    setBusy(true);
    try {
      const picks = [
        next.cpu,
        next.gpu,
        next.motherboard,
        next.ram,
        next.ssd,
        next.psu,
        next.case,
        next.cooler,
        ...(next.monitor ? [next.monitor] : []),
      ]
        .filter((p) => p.slug)
        .map((p) => ({ category: p.category, slug: p.slug }));
      const r = await authedFetch('/api/v1/advisor/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picks, resolution: res }),
      });
      if (r.ok) {
        const data = (await r.json()) as { estimatedTotalUsd: number; insights: BuildInsights };
        setCurrent((c) => ({
          ...c,
          insights: data.insights,
          estimatedTotalUsd: data.estimatedTotalUsd,
          withinBudget: budgetUsd ? data.estimatedTotalUsd <= budgetUsd : c.withinBudget,
        }));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-10 space-y-6">
      <div className="card">
        <div className="mb-3 flex items-center gap-3">
          <Pill variant="intel">{t('aiBuild')}</Pill>
          {current.withinBudget ? (
            <Pill className="border-lime/50 bg-lime/15 text-lime-bright">{t('withinBudget')}</Pill>
          ) : (
            <Pill className="border-camber/50 bg-camber/15 text-camber-bright">
              {t('overBudget')}
            </Pill>
          )}
          <span className="text-ink-faint text-xs">{t('poweredBy')}</span>
        </div>
        <p className="text-ink text-sm leading-relaxed">{current.summary}</p>
        <p className="text-ink-faint mt-2 text-[11px]">{t('swapHint')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PickCard pick={current.cpu} onSwap={onSwap} busy={busy} />
        <PickCard pick={current.gpu} onSwap={onSwap} busy={busy} />
        <PickCard pick={current.motherboard} onSwap={onSwap} busy={busy} />
        <PickCard pick={current.ram} onSwap={onSwap} busy={busy} />
        <PickCard pick={current.ssd} onSwap={onSwap} busy={busy} />
        <PickCard pick={current.psu} onSwap={onSwap} busy={busy} />
        <PickCard pick={current.case} onSwap={onSwap} busy={busy} />
        <PickCard pick={current.cooler} onSwap={onSwap} busy={busy} />
      </div>

      {current.monitor && (
        <div>
          <p className="label mb-2">{t('matchedMonitor')}</p>
          <PickCard pick={current.monitor} onSwap={onSwap} busy={busy} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={t('estimatedTotal')} value={format(current.estimatedTotalUsd)} />
        <Stat label={t('recommendedPsu')} value={`${current.recommendedPsuWatts} W`} />
        <Stat label={t('performance')} value={current.expectedPerformance} small />
      </div>

      {current.insights?.compatibility && current.insights.compatibility.length > 0 && (
        <CompatibilityPanel
          checks={current.insights.compatibility}
          power={current.insights.power ?? null}
        />
      )}

      {current.insights?.performance && <PerformancePanel p={current.insights.performance} />}

      {current.insights?.budget && current.insights.budget.lines.length > 0 && (
        <BudgetPanel
          budget={current.insights.budget}
          economics={current.insights.economics ?? null}
        />
      )}

      <div className="card">
        <p className="label mb-2">{t('upgradePath')}</p>
        <p className="text-ink-mid text-sm">{current.upgradePathNote}</p>
      </div>

      {current.warnings.length > 0 && (
        <div className="card border-camber/30 bg-camber/5">
          <p className="label text-camber-bright mb-2">{t('warnings')}</p>
          <ul className="text-camber-bright/90 space-y-1 text-sm">
            {current.warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function PickCard({
  pick,
  onSwap,
  busy,
}: {
  pick: ComponentPick;
  onSwap?: (category: string, alt: Alternative) => void;
  busy?: boolean;
}) {
  const t = useTranslations('advisor');
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);
  const [alts, setAlts] = useState<Alternative[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && alts === null) {
      setLoading(true);
      setAlts(await loadAlternatives(pick.category));
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <p className="label">{pick.category.toUpperCase()}</p>
        <div className="flex items-center gap-2">
          <span className="text-ink-mid font-mono text-sm">~{format(pick.approxPriceUsd)}</span>
          {onSwap && (
            <button
              type="button"
              onClick={toggle}
              disabled={busy}
              className="rounded-pill border-hairline text-ink-faint hover:text-ink border px-2 py-[2px] text-[10px] uppercase transition disabled:opacity-40"
            >
              {open ? t('close') : t('swap')}
            </button>
          )}
        </div>
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

      {open && (
        <div className="border-hairline mt-3 border-t pt-3">
          {loading ? (
            <p className="text-ink-faint text-xs">{t('loadingAlts')}</p>
          ) : alts && alts.length > 0 ? (
            <ul className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {alts.map((a) => (
                <li key={a.slug}>
                  <button
                    type="button"
                    disabled={busy || a.slug === pick.slug}
                    onClick={() => {
                      onSwap?.(pick.category, a);
                      setOpen(false);
                    }}
                    className={
                      'hover:bg-panel-2 flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[12px] transition disabled:opacity-40 ' +
                      (a.slug === pick.slug ? 'text-lime-bright' : 'text-ink-mid')
                    }
                  >
                    <span className="flex-1 truncate">{a.label}</span>
                    <span className="text-ink-faint flex-shrink-0 font-mono text-[11px]">
                      <Price usd={a.priceUsd} idr={a.priceIdr} small />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-faint text-xs">{t('noAlts')}</p>
          )}
        </div>
      )}
    </div>
  );
}

const CAT_TONE: Record<string, string> = {
  cpu: 'bg-cblue',
  gpu: 'bg-lime',
  motherboard: 'bg-camber',
  ram: 'bg-cblue/70',
  ssd: 'bg-lime/70',
  psu: 'bg-camber/70',
  case: 'bg-ink-faint',
  cooler: 'bg-cblue/50',
  monitor: 'bg-lime/50',
};

function BudgetPanel({
  budget,
  economics,
}: {
  budget: BudgetInsight;
  economics: EconomicsInsight | null;
}) {
  const t = useTranslations('advisor');
  const { format } = useCurrency();
  const lines = [...budget.lines].sort((a, b) => b.priceUsd - a.priceUsd);

  return (
    <div className="card">
      <p className="label mb-3">{t('budgetBreakdown')}</p>

      {/* Stacked allocation bar */}
      <div className="bg-panel-2 mb-4 flex h-3 w-full overflow-hidden rounded-full">
        {lines.map((l) => (
          <div
            key={l.category}
            className={`${CAT_TONE[l.category] ?? 'bg-ink-faint'} h-full`}
            style={{ width: `${l.pct}%` }}
            title={`${l.category} ${l.pct}%`}
          />
        ))}
      </div>

      <ul className="space-y-1.5">
        {lines.map((l) => (
          <li key={l.category} className="flex items-center gap-3 text-[12.5px]">
            <span
              className={`${CAT_TONE[l.category] ?? 'bg-ink-faint'} h-2.5 w-2.5 flex-shrink-0 rounded-sm`}
            />
            <span className="text-ink-mid w-24 flex-shrink-0 capitalize">{l.category}</span>
            <span className="text-ink-faint w-10 flex-shrink-0 font-mono text-[11px]">
              {l.pct}%
            </span>
            <span className="text-ink-hi ml-auto font-mono">{format(l.priceUsd)}</span>
          </li>
        ))}
      </ul>

      {economics && (
        <div className="border-hairline mt-4 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-3">
          {economics.costPerFrameUsd !== null && (
            <MiniStat label={t('costPerFrame')} value={`${format(economics.costPerFrameUsd)}`} />
          )}
          <MiniStat
            label={t('electricity')}
            value={`${formatIdrValue(economics.electricityIdrPerMonth)}/${t('perMonthShort')}`}
          />
          <MiniStat
            label={t('powerDraw')}
            value={`~${economics.loadDrawW}W`}
            hint={t('hoursAssumption', { h: economics.hoursPerDay })}
          />
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="text-ink-hi mt-1 font-mono text-sm">{value}</p>
      {hint && <p className="text-ink-faint mt-0.5 text-[10px]">{hint}</p>}
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
