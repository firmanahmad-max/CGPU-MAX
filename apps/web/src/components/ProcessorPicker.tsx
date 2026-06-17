'use client';

import { useEffect, useState } from 'react';

import type { Processor } from '@cgpu-max/types';

import { API_BASE_URL } from '@/lib/env';

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
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Processor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Processor | null>(null);

  useEffect(() => {
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
  }, [search, type, excludeSlug]);

  return (
    <div className="card">
      <p className="label mb-3">{label}</p>
      <input
        type="search"
        placeholder={`Search ${type}…`}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        className="w-full rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-accent-blue focus:outline-none"
      />

      <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
        {!loading && results.length === 0 && (
          <p className="text-xs text-slate-500">No matches.</p>
        )}
        {results.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setSelected(p);
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

      {selected && value === selected.slug && (
        <div className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-400">
          Selected: <span className="font-mono text-slate-200">{selected.slug}</span>
        </div>
      )}
    </div>
  );
}
