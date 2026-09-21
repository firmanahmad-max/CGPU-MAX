'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { Processor } from '@cgpu-max/types';

import { useCurrency } from '@/lib/currency-context';
import { API_BASE_URL } from '@/lib/env';

import { Mark } from './console/Mark';

interface ProcessorPickerProps {
  label: string;
  type: 'CPU' | 'GPU';
  value: string | null;
  onChange: (slug: string | null, processor: Processor | null) => void;
  excludeSlug?: string | null;
}

export function ProcessorPicker({
  label,
  type,
  value,
  onChange,
  excludeSlug,
}: ProcessorPickerProps) {
  const t = useTranslations('picker');
  const { format } = useCurrency();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Processor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Processor | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing && value) return; // collapsed — no need to query
    const controller = new AbortController();
    const url = new URL(`${API_BASE_URL}/api/v1/processors`);
    url.searchParams.set('type', type);
    url.searchParams.set('limit', '12');
    if (search) url.searchParams.set('search', search);

    setLoading(true);
    fetch(url.toString(), { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const items: Processor[] = data.items ?? [];
        setResults(excludeSlug ? items.filter((p) => p.slug !== excludeSlug) : items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [search, type, excludeSlug, editing, value]);

  // Collapsed summary card once a processor is selected (mirrors the prior
  // version's "Ganti" pattern) — declutters the picker after choosing.
  if (value && selected && selected.slug === value && !editing) {
    return (
      <div className="rounded-card border-hairline bg-panel-2 border p-[15px]">
        <div className="mb-[9px] flex items-center justify-between">
          <span className="label">{label}</span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-lime-bright text-[11px] font-semibold hover:underline"
          >
            {t('change')}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Mark mfr={selected.manufacturer} />
          <span className="font-display text-ink-hi text-[17px] font-bold tracking-tight">
            {selected.modelName}
          </span>
        </div>
        <p className="text-ink-faint mt-[5px] font-mono text-[11.5px]">
          {[
            selected.generation ? `Gen ${selected.generation}` : null,
            selected.tdpWatts ? `${selected.tdpWatts} W` : null,
            selected.msrpUsd ? format(selected.msrpUsd) : null,
          ]
            .filter(Boolean)
            .join(' · ') || selected.slug}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border-hairline bg-panel-2 border p-[15px]">
      <p className="label mb-3">{label}</p>
      <input
        type="search"
        placeholder={t('searchPlaceholder', { type })}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        className="rounded-control border-hairline bg-panel text-ink placeholder:text-ink-faint focus:border-lime/45 w-full border px-3 py-2 text-[13px] focus:outline-none"
      />

      <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
        {loading && <p className="text-ink-faint text-[11px]">{t('loading')}</p>}
        {!loading && results.length === 0 && (
          <p className="text-ink-faint text-[11px]">{t('noMatches')}</p>
        )}
        {results.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setSelected(p);
              setEditing(false);
              setSearch('');
              onChange(p.slug, p);
            }}
            className={
              'flex w-full items-center gap-[9px] rounded-[9px] border px-[10px] py-2 text-left transition ' +
              (value === p.slug
                ? 'border-lime/40 bg-lime/[0.1]'
                : 'border-hairline bg-transparent hover:border-white/[0.22]')
            }
          >
            <Mark mfr={p.manufacturer} />
            <span className="text-ink flex-1 truncate text-[12.5px] font-medium">
              {p.modelName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
