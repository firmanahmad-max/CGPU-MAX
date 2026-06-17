'use client';

import { useEffect, useState } from 'react';

import type { Processor } from '@cgpu-max/types';

import { API_BASE_URL } from '@/lib/env';

import { Pill } from './Pill';

interface ProcessorPickerProps {
  label: string;
  type: 'CPU' | 'GPU';
  value: string | null;
  onChange: (slug: string | null, processor: Processor | null) => void;
  excludeSlug?: string | null;
}

const manufacturerVariant = (m: string) =>
  m === 'INTEL' ? 'intel' : m === 'AMD' ? 'amd' : 'nvidia';

export function ProcessorPicker({
  label,
  type,
  value,
  onChange,
  excludeSlug,
}: ProcessorPickerProps) {
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
      <div className="card">
        <div className="mb-2 flex items-center justify-between">
          <p className="label">{label}</p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-accent-blue text-xs font-medium hover:underline"
          >
            Change
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Pill variant={manufacturerVariant(selected.manufacturer)}>{selected.manufacturer}</Pill>
          <span className="font-semibold text-white">{selected.modelName}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {[
            selected.generation ? `Gen ${selected.generation}` : null,
            selected.tdpWatts ? `${selected.tdpWatts} W` : null,
            selected.msrpUsd ? `$${selected.msrpUsd}` : null,
          ]
            .filter(Boolean)
            .join(' · ') || selected.slug}
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="label mb-3">{label}</p>
      <input
        type="search"
        placeholder={`Search ${type}…`}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        className="focus:border-accent-blue w-full rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
      />

      <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
        {!loading && results.length === 0 && <p className="text-xs text-slate-500">No matches.</p>}
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
              'block w-full rounded-sm border px-3 py-2 text-left text-sm transition ' +
              (value === p.slug
                ? 'border-accent-blue/60 bg-accent-blue/10 text-white'
                : 'border-white/5 bg-transparent text-slate-300 hover:border-white/15 hover:bg-white/5')
            }
          >
            <span className="font-medium">{p.modelName}</span>
            <span className="ml-2 text-xs text-slate-500">{p.manufacturer}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
