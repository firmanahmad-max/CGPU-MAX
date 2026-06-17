'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

const TYPES = ['ALL', 'CPU', 'GPU'] as const;
const MANUFACTURERS = ['ALL', 'INTEL', 'AMD', 'NVIDIA'] as const;

export function ProcessorFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = {
    type: params.get('type') ?? 'ALL',
    manufacturer: params.get('manufacturer') ?? 'ALL',
    search: params.get('search') ?? '',
  };

  const push = (next: Partial<typeof current>) => {
    const merged = { ...current, ...next };
    const url = new URLSearchParams();
    if (merged.type !== 'ALL') url.set('type', merged.type);
    if (merged.manufacturer !== 'ALL') url.set('manufacturer', merged.manufacturer);
    if (merged.search) url.set('search', merged.search);
    const qs = url.toString();
    startTransition(() => {
      router.push(qs ? `/processors?${qs}` : '/processors');
    });
  };

  return (
    <div className="card mb-8 space-y-4">
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="label mb-2">Type</p>
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => push({ type: t })}
                className={
                  'rounded-pill tracking-label border px-3 py-1 text-xs font-medium uppercase transition ' +
                  (current.type === t
                    ? 'border-white/40 bg-white/15 text-white'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200')
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label mb-2">Manufacturer</p>
          <div className="flex gap-2">
            {MANUFACTURERS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => push({ manufacturer: m })}
                className={
                  'rounded-pill tracking-label border px-3 py-1 text-xs font-medium uppercase transition ' +
                  (current.manufacturer === m
                    ? 'border-white/40 bg-white/15 text-white'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200')
                }
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="label mb-2">Search</p>
        <input
          type="search"
          defaultValue={current.search}
          placeholder="Model name…"
          onChange={(e) => push({ search: e.currentTarget.value })}
          className="focus:border-accent-blue w-full max-w-md rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
        {isPending && <p className="mt-1 text-xs text-slate-500">Updating…</p>}
      </div>
    </div>
  );
}
