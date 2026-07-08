import { useTranslations } from 'next-intl';

import type { ComparisonPayload } from '@/lib/api';
import { cn } from '@/lib/cn';

import { Pill } from './Pill';

interface CompareResultProps {
  result: ComparisonPayload;
}

export function CompareResult({ result }: CompareResultProps) {
  const t = useTranslations('compare');
  const aWins = result.metrics.filter((m) => m.winner === 'a').length;
  const bWins = result.metrics.filter((m) => m.winner === 'b').length;
  const winnerName =
    result.overallWinner === 'a'
      ? result.a.modelName
      : result.overallWinner === 'b'
        ? result.b.modelName
        : null;
  const winnerCats = result.overallWinner === 'a' ? aWins : bWins;

  return (
    <section className="mt-10 space-y-8">
      <header className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <Side
          processor={result.a}
          score={result.performanceScore.a}
          winner={result.overallWinner === 'a'}
          side="A"
        />
        <div className="font-display text-3xl font-semibold text-slate-500">VS</div>
        <Side
          processor={result.b}
          score={result.performanceScore.b}
          winner={result.overallWinner === 'b'}
          side="B"
        />
      </header>

      {/* Prominent overall-winner banner (adopted from the prior version's
          "menang dalam lebih banyak kategori" callout). */}
      <div className="card border-state-success/30 bg-state-success/5 flex items-center gap-3">
        <span className="text-2xl">🏆</span>
        <p className="text-sm text-slate-200">
          {winnerName ? (
            <>
              <span className="font-semibold text-white">{winnerName}</span> {t('winnerSuffix')}
              <span className="text-slate-400">
                {' '}
                {t('winnerCount', { won: winnerCats, total: result.metrics.length })}
              </span>
            </>
          ) : (
            <>{t('evenlyMatched')}</>
          )}
        </p>
        <span className="ml-auto text-xs text-slate-500">
          {t('algorithm', { version: result.algorithmVersion })}
        </span>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="tracking-label bg-white/[0.03] text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">{t('metric')}</th>
              <th className="px-4 py-3 text-right">{result.a.modelName}</th>
              <th className="px-4 py-3 text-right">{result.b.modelName}</th>
              <th className="px-4 py-3 text-right">Δ</th>
            </tr>
          </thead>
          <tbody>
            {result.metrics.map((m) => (
              <tr key={m.key} className="border-t border-white/5">
                <td className="px-4 py-3 text-slate-300">{m.label}</td>
                <td
                  className={cn(
                    'px-4 py-3 text-right font-mono',
                    m.winner === 'a' ? 'text-state-success' : 'text-slate-200',
                  )}
                >
                  {formatVal(m.a, m.unit)}
                  {m.winner === 'a' && <span className="ml-1.5">✓</span>}
                </td>
                <td
                  className={cn(
                    'px-4 py-3 text-right font-mono',
                    m.winner === 'b' ? 'text-state-success' : 'text-slate-200',
                  )}
                >
                  {formatVal(m.b, m.unit)}
                  {m.winner === 'b' && <span className="ml-1.5">✓</span>}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-slate-400">
                  {m.deltaPercent === null ? '—' : `${m.deltaPercent.toFixed(1)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Price-to-performance (adopted from the prior version): cost per
          performance point, computed from real MSRP + performance index. */}
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
          <p className="mt-3 font-mono text-xs text-slate-500">
            {t('share')}: <span className="text-slate-300">{result.shareSlug}</span>
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
    <div className={cn('card', bestValue && 'border-state-success/40 bg-state-success/5')}>
      <p className="text-sm text-slate-400">{processor.modelName}</p>
      <p className="metric mt-2">
        {processor.msrpUsd ? `$${processor.msrpUsd.toLocaleString()}` : '—'}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {costPerScore !== null
          ? t('perScore', { value: costPerScore.toFixed(2) })
          : t('noPriceData')}
      </p>
      {bestValue && (
        <p className="text-state-success mt-2 text-sm font-medium">✓ {t('betterValue')}</p>
      )}
    </div>
  );
}

function Side({
  processor,
  score,
  winner,
  side,
}: {
  processor: ComparisonPayload['a'];
  score: number;
  winner: boolean;
  side: 'A' | 'B';
}) {
  const t = useTranslations('compare');
  return (
    <div className={cn('card', winner && 'border-state-success/40 bg-state-success/5')}>
      <div className="mb-2 flex items-center justify-between">
        <p className="label">{side === 'A' ? t('sideA') : t('sideB')}</p>
        {winner && (
          <Pill className="border-state-success/50 bg-state-success/15 text-state-success">
            {t('winner')}
          </Pill>
        )}
      </div>
      <p className="font-display text-xl font-semibold text-white">{processor.modelName}</p>
      <p className="mt-1 text-xs text-slate-500">
        {processor.manufacturer} · {processor.type}
      </p>
      <p className="metric mt-4">{score.toFixed(1)}</p>
      <p className="label mt-1">{t('performanceIndex')}</p>
    </div>
  );
}

function formatVal(v: number | null, unit?: string): string {
  if (v === null || v === undefined) return '—';
  const fmt = Number.isInteger(v) ? v.toString() : v.toFixed(2);
  return unit ? `${fmt} ${unit}` : fmt;
}
