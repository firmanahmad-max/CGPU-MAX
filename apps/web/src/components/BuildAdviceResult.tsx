import Link from 'next/link';

import type { BuildAdvice, ComponentPick } from '@/lib/advisorTypes';

import { Pill } from './Pill';

export function BuildAdviceResult({ advice }: { advice: BuildAdvice }) {
  return (
    <section className="mt-10 space-y-6">
      <div className="card">
        <div className="mb-3 flex items-center gap-3">
          <Pill variant="intel">AI Build</Pill>
          {advice.withinBudget ? (
            <Pill className="border-state-success/50 bg-state-success/15 text-state-success">
              Within budget
            </Pill>
          ) : (
            <Pill className="border-state-warning/50 bg-state-warning/15 text-amber-300">
              Over budget
            </Pill>
          )}
          <span className="text-xs text-slate-500">{advice.modelUsed}</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-200">{advice.summary}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PickCard pick={advice.cpu} />
        <PickCard pick={advice.gpu} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Estimated total" value={`$${advice.estimatedTotalUsd.toLocaleString()}`} />
        <Stat label="Recommended PSU" value={`${advice.recommendedPsuWatts} W`} />
        <Stat label="Performance" value={advice.expectedPerformance} small />
      </div>

      <div className="card">
        <p className="label mb-2">Upgrade path</p>
        <p className="text-sm text-slate-300">{advice.upgradePathNote}</p>
      </div>

      {advice.warnings.length > 0 && (
        <div className="card border-state-warning/30 bg-state-warning/5">
          <p className="label mb-2 text-amber-300">Warnings</p>
          <ul className="space-y-1 text-sm text-amber-200/90">
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
  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <p className="label">{pick.category.toUpperCase()}</p>
        <span className="font-mono text-sm text-slate-300">
          ~${pick.approxPriceUsd.toLocaleString()}
        </span>
      </div>
      {pick.slug ? (
        <Link
          href={`/processors/${pick.slug}`}
          className="font-display text-lg font-semibold text-white hover:text-accent-blue"
        >
          {pick.modelName}
        </Link>
      ) : (
        <p className="font-display text-lg font-semibold text-white">{pick.modelName}</p>
      )}
      <p className="mt-2 text-sm text-slate-400">{pick.rationale}</p>
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="card">
      <p className="label">{label}</p>
      <p className={small ? 'mt-2 text-sm text-slate-200' : 'metric mt-2'}>{value}</p>
    </div>
  );
}
