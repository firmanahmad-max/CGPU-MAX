import { useTranslations } from 'next-intl';

import type { ComparisonPayload } from '@/lib/api';
import { cn } from '@/lib/cn';

import { Mark } from './console/Mark';
import { Price } from './console/Price';

interface CompareResultProps {
  result: ComparisonPayload;
}

export function CompareResult({ result }: CompareResultProps) {
  const t = useTranslations('compare');
  const scoreA = result.performanceScore.a;
  const scoreB = result.performanceScore.b;

  // Headline gap from the composite performance score (more intuitive than
  // "wins in more categories").
  const fasterSide = scoreA === scoreB ? null : scoreA > scoreB ? 'a' : 'b';
  const hi = Math.max(scoreA, scoreB);
  const lo = Math.min(scoreA, scoreB);
  const fasterPct = lo > 0 ? Math.round((hi / lo - 1) * 100) : 0;
  const even = fasterSide === null || fasterPct < 3;

  const valueWinner = result.pricePerformanceWinner;
  const nameFor = (s: 'a' | 'b') => (s === 'a' ? result.a.modelName : result.b.modelName);
  const fasterName = fasterSide ? nameFor(fasterSide) : '';
  const valueName = valueWinner === 'a' || valueWinner === 'b' ? nameFor(valueWinner) : null;

  let headline: string;
  let detail: string | null = null;
  if (even) {
    headline = t('blEven');
    if (valueName) detail = t('blEvenValue', { valueName });
  } else {
    headline = t('blFaster', { name: fasterName, pct: fasterPct });
    detail =
      valueWinner === fasterSide
        ? t('blAlsoValue')
        : valueWinner === 'tied'
          ? t('blValueEven')
          : valueName
            ? t('blTradeoff', { valueName })
            : null;
  }

  return (
    <section className="mt-8 space-y-4">
      <header className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <Side
          processor={result.a}
          score={scoreA}
          winner={result.overallWinner === 'a'}
          side="A"
          fasterPct={fasterSide === 'a' && !even ? fasterPct : null}
        />
        <div className="font-display text-ink-faint text-3xl font-bold">VS</div>
        <Side
          processor={result.b}
          score={scoreB}
          winner={result.overallWinner === 'b'}
          side="B"
          fasterPct={fasterSide === 'b' && !even ? fasterPct : null}
        />
      </header>

      {/* Plain-language bottom line. */}
      <div className="panel border-lime/30 bg-lime/[0.05]">
        <div className="mb-2 flex items-center justify-between">
          <p className="label">{t('bottomLine')}</p>
          <span className="text-ink-faint font-mono text-[11px]">
            {t('algorithm', { version: result.algorithmVersion })}
          </span>
        </div>
        <p className="text-ink-hi text-[15px] font-semibold leading-snug">{headline}</p>
        {detail && <p className="text-ink-mid mt-1 text-[13px] leading-relaxed">{detail}</p>}
      </div>

      <div className="panel overflow-hidden !p-0">
        <table className="w-full text-[12.5px]">
          <thead className="bg-panel-2 tracking-label text-ink-muted text-left text-[10px] uppercase">
            <tr>
              <th className="px-4 py-3">{t('metric')}</th>
              <th className="px-4 py-3 text-right">{result.a.modelName}</th>
              <th className="px-4 py-3 text-right">{result.b.modelName}</th>
              <th className="px-4 py-3 text-right">Δ</th>
            </tr>
          </thead>
          <tbody>
            {result.metrics.map((m) => (
              <tr key={m.key} className="border-hairline border-t">
                <td className="text-ink-mid px-4 py-3">{m.label}</td>
                <td
                  className={cn(
                    'px-4 py-3 text-right font-mono',
                    m.winner === 'a' ? 'text-lime-bright' : 'text-ink',
                  )}
                >
                  {formatVal(m.a, m.unit)}
                  {m.winner === 'a' && <span className="ml-1.5">✓</span>}
                </td>
                <td
                  className={cn(
                    'px-4 py-3 text-right font-mono',
                    m.winner === 'b' ? 'text-lime-bright' : 'text-ink',
                  )}
                >
                  {formatVal(m.b, m.unit)}
                  {m.winner === 'b' && <span className="ml-1.5">✓</span>}
                </td>
                <td className="text-ink-faint px-4 py-3 text-right font-mono text-[11px]">
                  {m.deltaPercent === null ? '—' : `${m.deltaPercent.toFixed(1)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Price-to-performance — cost per point from real MSRP + performance. */}
      <div>
        <p className="label mb-3">{t('priceToPerformance')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ValueCard
            processor={result.a}
            score={result.performanceScore.a}
            bestValue={result.pricePerformanceWinner === 'a'}
          />
          <ValueCard
            processor={result.b}
            score={result.performanceScore.b}
            bestValue={result.pricePerformanceWinner === 'b'}
          />
        </div>
        {result.shareSlug && (
          <p className="text-ink-faint mt-3 font-mono text-[11px]">
            {t('share')}: <span className="text-ink-mid">{result.shareSlug}</span>
          </p>
        )}
      </div>
    </section>
  );
}

function ValueCard({
  processor,
  score,
  bestValue,
}: {
  processor: ComparisonPayload['a'];
  score: number;
  bestValue: boolean;
}) {
  const t = useTranslations('compare');
  const costPerScore = processor.msrpUsd && score > 0 ? processor.msrpUsd / score : null;
  return (
    <div className={cn('panel', bestValue && 'border-lime/40 bg-lime/[0.05]')}>
      <p className="text-ink-muted text-[13px]">{processor.modelName}</p>
      <Price usd={processor.msrpUsd} idr={processor.priceIdr} className="metric mt-2 block" />
      <p className="text-ink-faint mt-1 text-[11px]">
        {costPerScore !== null
          ? t('perScore', { value: costPerScore.toFixed(2) })
          : t('noPriceData')}
      </p>
      {bestValue && (
        <p className="text-lime-bright mt-2 text-[13px] font-medium">✓ {t('betterValue')}</p>
      )}
    </div>
  );
}

function Side({
  processor,
  score,
  winner,
  side,
  fasterPct,
}: {
  processor: ComparisonPayload['a'];
  score: number;
  winner: boolean;
  side: 'A' | 'B';
  fasterPct: number | null;
}) {
  const t = useTranslations('compare');
  return (
    <div className={cn('panel', winner && 'border-lime/40 bg-lime/[0.05]')}>
      <div className="mb-2 flex items-center justify-between">
        <p className="label">{side === 'A' ? t('sideA') : t('sideB')}</p>
        {winner && (
          <span className="rounded-pill border-lime/50 bg-lime/[0.15] tracking-label text-lime-bright border px-2 py-[2px] text-[10px] font-semibold uppercase">
            {t('winner')}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Mark mfr={processor.manufacturer} />
        <p className="font-display text-ink-hi text-[19px] font-bold tracking-tight">
          {processor.modelName}
        </p>
      </div>
      <p className="text-ink-faint mt-1 text-[11px]">{processor.type}</p>
      <div className="mt-4 flex items-end gap-2">
        <p className="metric">{score.toFixed(1)}</p>
        {fasterPct !== null && (
          <span className="rounded-pill border-lime/45 bg-lime/[0.14] text-lime-bright mb-[3px] border px-2 py-[1px] text-[10px] font-semibold">
            {t('fasterBadge', { pct: fasterPct })}
          </span>
        )}
      </div>
      <p className="label mt-1">{t('performanceIndex')}</p>
    </div>
  );
}

function formatVal(v: number | null, unit?: string): string {
  if (v === null || v === undefined) return '—';
  const fmt = Number.isInteger(v) ? v.toString() : v.toFixed(2);
  return unit ? `${fmt} ${unit}` : fmt;
}
