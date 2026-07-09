'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

const TYPES = ['CPU', 'GPU'] as const;
const MANUFACTURERS = ['ALL', 'INTEL', 'AMD', 'NVIDIA'] as const;
// Use-case tabs — weights live in apps/api rankings domain scoring.
const CATEGORIES = [
  { key: 'overall', labelKey: 'catOverall' },
  { key: 'gaming', labelKey: 'catGaming' },
  { key: 'productivity', labelKey: 'catProductivity' },
  { key: 'workstation', labelKey: 'catWorkstation' },
] as const;
const SORTS = [
  { value: 'performance', labelKey: 'sortPerformance' },
  { value: 'value', labelKey: 'sortValue' },
] as const;
// Price brackets mirror the prior version's pills.
const BRACKETS = [
  { key: 'all', labelKey: 'priceAll' },
  { key: 'budget', labelKey: 'priceBudget' },
  { key: 'mid', labelKey: 'priceMid' },
  { key: 'high', labelKey: 'priceHigh' },
] as const;

export function RankingsFilters() {
  const t = useTranslations('rankings');
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = {
    type: params.get('type') ?? 'CPU',
    manufacturer: params.get('manufacturer') ?? 'ALL',
    sort: params.get('sort') ?? 'performance',
    category: params.get('category') ?? 'overall',
    bracket: params.get('bracket') ?? 'all',
  };

  const push = (next: Partial<typeof current>) => {
    const merged = { ...current, ...next };
    const url = new URLSearchParams();
    url.set('type', merged.type);
    if (merged.manufacturer !== 'ALL') url.set('manufacturer', merged.manufacturer);
    if (merged.sort !== 'performance') url.set('sort', merged.sort);
    if (merged.category !== 'overall') url.set('category', merged.category);
    if (merged.bracket !== 'all') url.set('bracket', merged.bracket);
    startTransition(() => router.push(`/rankings?${url.toString()}`));
  };

  return (
    <div className="card mb-8 flex flex-wrap gap-6">
      <Group label={t('filterType')}>
        {TYPES.map((ty) => (
          <Toggle key={ty} active={current.type === ty} onClick={() => push({ type: ty })}>
            {ty}
          </Toggle>
        ))}
      </Group>
      <Group label={t('filterCategory')}>
        {CATEGORIES.map((c) => (
          <Toggle
            key={c.key}
            active={current.category === c.key}
            onClick={() => push({ category: c.key })}
          >
            {t(c.labelKey)}
          </Toggle>
        ))}
      </Group>
      <Group label={t('filterManufacturer')}>
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
      <Group label={t('filterSort')}>
        {SORTS.map((s) => (
          <Toggle
            key={s.value}
            active={current.sort === s.value}
            onClick={() => push({ sort: s.value })}
          >
            {t(s.labelKey)}
          </Toggle>
        ))}
      </Group>
      <Group label={t('filterPrice')}>
        {BRACKETS.map((b) => (
          <Toggle
            key={b.key}
            active={current.bracket === b.key}
            onClick={() => push({ bracket: b.key })}
          >
            {t(b.labelKey)}
          </Toggle>
        ))}
      </Group>
      {isPending && <span className="self-end text-xs text-slate-500">{t('updating')}</span>}
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
