'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

const TYPES = ['ALL', 'CPU', 'GPU'] as const;
const MANUFACTURERS = ['ALL', 'INTEL', 'AMD', 'NVIDIA'] as const;

export function ProcessorFilters() {
  const t = useTranslations('processors');
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

  const chip = (active: boolean) =>
    'rounded-control border px-3 py-1 text-[12px] font-semibold transition ' +
    (active
      ? 'border-lime/45 bg-lime/[0.14] text-lime-bright'
      : 'border-hairline bg-panel text-ink-faint hover:text-ink');

  return (
    <div className="panel mb-6 space-y-4">
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="label mb-2">{t('filterType')}</p>
          <div className="flex gap-2">
            {TYPES.map((ty) => (
              <button
                key={ty}
                type="button"
                onClick={() => push({ type: ty })}
                className={chip(current.type === ty)}
              >
                {ty}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label mb-2">{t('filterManufacturer')}</p>
          <div className="flex gap-2">
            {MANUFACTURERS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => push({ manufacturer: m })}
                className={chip(current.manufacturer === m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="label mb-2">{t('filterSearch')}</p>
        <input
          type="search"
          defaultValue={current.search}
          placeholder={t('searchPlaceholder')}
          onChange={(e) => push({ search: e.currentTarget.value })}
          className="rounded-control border-hairline bg-panel text-ink placeholder:text-ink-faint focus:border-lime/45 w-full max-w-md border px-3 py-2 text-[13px] focus:outline-none"
        />
        {isPending && <p className="text-ink-faint mt-1 text-[11px]">{t('updating')}</p>}
      </div>
    </div>
  );
}
