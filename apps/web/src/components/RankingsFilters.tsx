'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

const TYPES = ['CPU', 'GPU'] as const;
const MANUFACTURERS = ['ALL', 'INTEL', 'AMD', 'NVIDIA'] as const;
const SORTS = [
  { value: 'performance', label: 'Performance' },
  { value: 'value', label: 'Best value' },
] as const;
// Price brackets mirror the prior version's pills.
const BRACKETS = [
  { key: 'all', label: 'All prices' },
  { key: 'budget', label: 'Budget (<$300)' },
  { key: 'mid', label: 'Mid ($300–700)' },
  { key: 'high', label: 'High-end (>$700)' },
] as const;

export function RankingsFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = {
    type: params.get('type') ?? 'CPU',
    manufacturer: params.get('manufacturer') ?? 'ALL',
    sort: params.get('sort') ?? 'performance',
    bracket: params.get('bracket') ?? 'all',
  };

  const push = (next: Partial<typeof current>) => {
    const merged = { ...current, ...next };
    const url = new URLSearchParams();
    url.set('type', merged.type);
    if (merged.manufacturer !== 'ALL') url.set('manufacturer', merged.manufacturer);
    if (merged.sort !== 'performance') url.set('sort', merged.sort);
    if (merged.bracket !== 'all') url.set('bracket', merged.bracket);
    startTransition(() => router.push(`/rankings?${url.toString()}`));
  };

  return (
    <div className="card mb-8 flex flex-wrap gap-6">
      <Group label="Type">
        {TYPES.map((t) => (
          <Toggle key={t} active={current.type === t} onClick={() => push({ type: t })}>
            {t}
          </Toggle>
        ))}
      </Group>
      <Group label="Manufacturer">
        {MANUFACTURERS.map((m) => (
          <Toggle
            key={m}
            active={current.manufacturer === m}
            onClick={() => push({ manufacturer: m })}
          >
            {m}
          </Toggle>
        ))}
      </Group>
      <Group label="Sort by">
        {SORTS.map((s) => (
          <Toggle
            key={s.value}
            active={current.sort === s.value}
            onClick={() => push({ sort: s.value })}
          >
            {s.label}
          </Toggle>
        ))}
      </Group>
      <Group label="Price">
        {BRACKETS.map((b) => (
          <Toggle
            key={b.key}
            active={current.bracket === b.key}
            onClick={() => push({ bracket: b.key })}
          >
            {b.label}
          </Toggle>
        ))}
      </Group>
      {isPending && <span className="self-end text-xs text-slate-500">Updating…</span>}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label mb-2">{label}</p>
      <div className="flex gap-2">{children}</div>
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
        'tracking-label rounded-pill border px-3 py-1 text-xs font-medium uppercase transition ' +
        (active
          ? 'border-white/40 bg-white/15 text-white'
          : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200')
      }
    >
      {children}
    </button>
  );
}
