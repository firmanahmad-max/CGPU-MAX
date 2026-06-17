import type { ComparisonPayload } from '@/lib/api';
import { cn } from '@/lib/cn';

import { Pill } from './Pill';

interface CompareResultProps {
  result: ComparisonPayload;
}

const winnerBadge = (w: 'a' | 'b' | 'tied') =>
  w === 'tied' ? 'TIED' : w === 'a' ? 'A WINS' : 'B WINS';

export function CompareResult({ result }: CompareResultProps) {
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

      <div className="card flex flex-wrap items-center gap-4 text-sm">
        <Pill>Overall · {winnerBadge(result.overallWinner)}</Pill>
        <Pill>Price/Perf · {winnerBadge(result.pricePerformanceWinner)}</Pill>
        <span className="text-xs text-slate-500">algorithm {result.algorithmVersion}</span>
        {result.shareSlug && (
          <span className="font-mono text-xs text-slate-500">
            share: <span className="text-slate-300">{result.shareSlug}</span>
          </span>
        )}
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="tracking-label bg-white/[0.03] text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Metric</th>
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
                </td>
                <td
                  className={cn(
                    'px-4 py-3 text-right font-mono',
                    m.winner === 'b' ? 'text-state-success' : 'text-slate-200',
                  )}
                >
                  {formatVal(m.b, m.unit)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-slate-400">
                  {m.deltaPercent === null ? '—' : `${m.deltaPercent.toFixed(1)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
  return (
    <div className={cn('card', winner && 'border-state-success/40 bg-state-success/5')}>
      <div className="mb-2 flex items-center justify-between">
        <p className="label">Side {side}</p>
        {winner && (
          <Pill className="border-state-success/50 bg-state-success/15 text-state-success">
            Winner
          </Pill>
        )}
      </div>
      <p className="font-display text-xl font-semibold text-white">{processor.modelName}</p>
      <p className="mt-1 text-xs text-slate-500">
        {processor.manufacturer} · {processor.type}
      </p>
      <p className="metric mt-4">{score.toFixed(1)}</p>
      <p className="label mt-1">Performance index</p>
    </div>
  );
}

function formatVal(v: number | null, unit?: string): string {
  if (v === null || v === undefined) return '—';
  const fmt = Number.isInteger(v) ? v.toString() : v.toFixed(2);
  return unit ? `${fmt} ${unit}` : fmt;
}
