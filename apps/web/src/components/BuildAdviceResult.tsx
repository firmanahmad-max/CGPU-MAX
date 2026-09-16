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
            <Pill className="border-lime/50 bg-lime/15 text-lime-bright">Within budget</Pill>
          ) : (
            <Pill className="border-camber/50 bg-camber/15 text-camber-bright">Over budget</Pill>
          )}
          <span className="text-ink-faint text-xs">{advice.modelUsed}</span>
        </div>
        <p className="text-ink text-sm leading-relaxed">{advice.summary}</p>
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
        <p className="text-ink-mid text-sm">{advice.upgradePathNote}</p>
      </div>

      {advice.warnings.length > 0 && (
        <div className="card border-camber/30 bg-camber/5">
          <p className="label text-camber-bright mb-2">Warnings</p>
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
  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <p className="label">{pick.category.toUpperCase()}</p>
        <span className="text-ink-mid font-mono text-sm">
          ~${pick.approxPriceUsd.toLocaleString()}
        </span>
      </div>
      {pick.slug ? (
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

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="card">
      <p className="label">{label}</p>
      <p className={small ? 'text-ink mt-2 text-sm' : 'metric mt-2'}>{value}</p>
    </div>
  );
}
