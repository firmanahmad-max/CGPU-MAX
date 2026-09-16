'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { Mark } from '@/components/console/Mark';
import { Price } from '@/components/console/Price';
import { PriceSparkline } from '@/components/console/PriceSparkline';
import type { CatalogResponse, CatalogSort } from '@/lib/api';

const TYPES = ['ALL', 'CPU', 'GPU'] as const;
const MANUFACTURERS = ['ALL', 'INTEL', 'AMD', 'NVIDIA'] as const;
const BRACKETS = [
  { key: 'all', label: 'All' },
  { key: 'budget', label: '<$300' },
  { key: 'mid', label: '$300–700' },
  { key: 'high', label: '>$700' },
] as const;

type SortCol = { key: CatalogSort; labelKey: string };
const COLUMNS: SortCol[] = [
  { key: 'index', labelKey: 'colIndex' },
  { key: 'vram', labelKey: 'colVram' },
  { key: 'tdp', labelKey: 'colTdp' },
  { key: 'price', labelKey: 'colPrice' },
  { key: 'perScore', labelKey: 'colPerScore' },
];

export function CatalogView({ data }: { data: CatalogResponse | null }) {
  const t = useTranslations('processors');
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>([]);

  const cur = {
    type: params.get('type') ?? 'ALL',
    manufacturer: params.get('manufacturer') ?? 'ALL',
    bracket: params.get('bracket') ?? 'all',
    vram: (params.get('vram') ?? '').split(',').filter(Boolean),
    architecture: params.get('architecture') ?? '',
    search: params.get('search') ?? '',
    sort: (params.get('sort') as CatalogSort) ?? 'index',
    dir: params.get('dir') ?? 'desc',
  };

  const push = (next: Partial<typeof cur>) => {
    const m = { ...cur, ...next };
    const url = new URLSearchParams();
    if (m.type !== 'ALL') url.set('type', m.type);
    if (m.manufacturer !== 'ALL') url.set('manufacturer', m.manufacturer);
    if (m.bracket !== 'all') url.set('bracket', m.bracket);
    if (m.vram.length) url.set('vram', m.vram.join(','));
    if (m.architecture) url.set('architecture', m.architecture);
    if (m.search) url.set('search', m.search);
    if (m.sort !== 'index') url.set('sort', m.sort);
    if (m.dir !== 'desc') url.set('dir', m.dir);
    const qs = url.toString();
    startTransition(() => router.push(qs ? `/processors?${qs}` : '/processors'));
  };

  const onSort = (key: CatalogSort) =>
    push(
      cur.sort === key ? { dir: cur.dir === 'desc' ? 'asc' : 'desc' } : { sort: key, dir: 'desc' },
    );

  const toggleVram = (gb: string) =>
    push({ vram: cur.vram.includes(gb) ? cur.vram.filter((v) => v !== gb) : [...cur.vram, gb] });

  const toggleSelect = (slug: string) =>
    setSelected((s) =>
      s.includes(slug) ? s.filter((x) => x !== slug) : s.length < 2 ? [...s, slug] : [s[1]!, slug],
    );

  const facets = data?.facets;
  const arrow = (key: CatalogSort) => (cur.sort === key ? (cur.dir === 'desc' ? ' ↓' : ' ↑') : '');

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[232px_1fr]">
      {/* Filter sidebar */}
      <aside className="rounded-panel border-hairline bg-panel-2 flex flex-col gap-5 border p-[18px]">
        <Facet label={t('filterType')}>
          {TYPES.map((ty) => (
            <Chip
              key={ty}
              on={cur.type === ty}
              onClick={() => push({ type: ty, vram: [], architecture: '' })}
            >
              {ty}
            </Chip>
          ))}
        </Facet>
        <Facet label={t('filterManufacturer')}>
          {MANUFACTURERS.map((mfr) => (
            <Chip
              key={mfr}
              on={cur.manufacturer === mfr}
              onClick={() => push({ manufacturer: mfr })}
            >
              {mfr}
            </Chip>
          ))}
        </Facet>
        <Facet label={t('filterPrice')}>
          {BRACKETS.map((b) => (
            <Chip key={b.key} on={cur.bracket === b.key} onClick={() => push({ bracket: b.key })}>
              {b.label}
            </Chip>
          ))}
        </Facet>
        {facets && facets.vram.length > 0 && (
          <Facet label={t('filterVram')}>
            {/* Collapse everything ≥24 GB into one "24 GB+" bucket. */}
            {[
              ...facets.vram.filter((v) => v.gb < 24),
              ...(facets.vram.some((v) => v.gb >= 24) ? [{ gb: 24, count: 0 }] : []),
            ].map((v) => (
              <Chip
                key={v.gb}
                on={cur.vram.includes(String(v.gb))}
                onClick={() => toggleVram(String(v.gb))}
              >
                {v.gb >= 24 ? t('vramBucketPlus') : t('vramBucket', { gb: v.gb })}
              </Chip>
            ))}
          </Facet>
        )}
        {facets && facets.architectures.length > 0 && (
          <div>
            <p className="label mb-2">{t('filterArchitecture')}</p>
            <div className="flex flex-col gap-[7px]">
              {facets.architectures.map((a) => {
                const on = cur.architecture === a.name;
                return (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() => push({ architecture: on ? '' : a.name })}
                    className={
                      'flex items-center justify-between text-[12.5px] transition ' +
                      (on ? 'text-lime-bright' : 'text-ink-mid hover:text-ink')
                    }
                  >
                    <span>{a.name}</span>
                    <span className="text-ink-faint font-mono text-[11px]">{a.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <p className="text-ink-faint mt-auto text-[11px] leading-relaxed">{t('urlNote')}</p>
      </aside>

      {/* Table */}
      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between">
          <input
            type="search"
            defaultValue={cur.search}
            placeholder={t('searchPlaceholder')}
            onChange={(e) => push({ search: e.currentTarget.value })}
            className="rounded-control border-hairline bg-panel text-ink placeholder:text-ink-faint focus:border-lime/45 w-full max-w-xs border px-3 py-2 text-[13px] focus:outline-none"
          />
          <span className="text-ink-faint ml-3 whitespace-nowrap font-mono text-[11px]">
            {isPending
              ? t('updating')
              : t('matchInfo', { shown: data?.items.length ?? 0, total: data?.total ?? 0 })}
          </span>
        </div>

        <div className="rounded-panel border-hairline bg-panel overflow-hidden border">
          <table className="w-full text-[12.5px]">
            <thead className="bg-panel-2 tracking-label text-ink-muted text-left text-[10px] uppercase">
              <tr>
                <th className="px-4 py-[10px]">{t('colPart')}</th>
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    onClick={() => onSort(c.key)}
                    className={
                      'cursor-pointer whitespace-nowrap px-3 py-[10px] text-right ' +
                      (cur.sort === c.key ? 'text-ink-hi' : 'text-ink-muted')
                    }
                  >
                    {t(c.labelKey)}
                    {arrow(c.key)}
                  </th>
                ))}
                <th className="px-4 py-[10px] text-right">{t('col90d')}</th>
              </tr>
            </thead>
            <tbody>
              {(!data || data.items.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-ink-muted px-4 py-8 text-center text-[13px]">
                    {t('noResults')}
                  </td>
                </tr>
              )}
              {data?.items.map((r) => {
                const on = selected.includes(r.slug);
                return (
                  <tr
                    key={r.slug}
                    onClick={() => toggleSelect(r.slug)}
                    className={
                      'border-hairline cursor-pointer border-t transition ' +
                      (on ? 'bg-lime/[0.06]' : 'hover:bg-white/[0.03]')
                    }
                  >
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-[9px]">
                        <Mark mfr={r.manufacturer} />
                        <Link
                          href={`/processors/${r.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-ink-hi hover:text-lime-bright font-semibold"
                        >
                          {r.modelName}
                        </Link>
                        {r.vramType && (
                          <span className="text-ink-faint font-mono text-[10px]">{r.vramType}</span>
                        )}
                      </span>
                    </td>
                    <td className="text-ink-hi px-3 py-3 text-right font-mono">
                      {Math.round(r.performance)}
                    </td>
                    <td className="text-ink-mid px-3 py-3 text-right font-mono">
                      {r.vramGb ? `${r.vramGb} GB` : '—'}
                    </td>
                    <td className="text-ink-mid px-3 py-3 text-right font-mono">
                      {r.tdpWatts ? `${r.tdpWatts} W` : '—'}
                    </td>
                    <td className="text-ink-mid px-3 py-3 text-right font-mono">
                      <Price usd={r.msrpUsd} />
                    </td>
                    <td className="text-ink-mid px-3 py-3 text-right font-mono">
                      {r.costPerScore !== null ? <Price usd={r.costPerScore} small /> : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-block w-[70px] align-middle">
                        <PriceSparkline points={r.priceSeries} width={70} height={18} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Compare bar */}
          {selected.length > 0 && (
            <div className="border-hairline bg-panel-2 flex items-center gap-3 border-t px-4 py-3">
              <span className="text-ink-mid text-[12.5px]">
                {t('selected', { n: selected.length })}
              </span>
              <span className="text-ink-faint truncate font-mono text-[11px]">
                {selected.join(' · ')}
              </span>
              <span className="ml-auto flex items-center gap-2">
                {selected.length === 2 ? (
                  <Link
                    href={`/compare?type=${data?.items.find((i) => i.slug === selected[0])?.type ?? 'CPU'}&a=${selected[0]}&b=${selected[1]}`}
                    className="rounded-control bg-lime text-lime-ink px-[13px] py-[7px] text-[12.5px] font-semibold transition hover:brightness-110"
                  >
                    {t('duel')}
                  </Link>
                ) : (
                  <span className="rounded-control bg-lime/40 text-lime-ink/60 px-[13px] py-[7px] text-[12.5px] font-semibold">
                    {t('duel')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="rounded-control border-hairline text-ink-mid border px-[13px] py-[7px] text-[12.5px] font-semibold hover:bg-white/5"
                >
                  {t('clear')}
                </button>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Facet({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label mb-2">{label}</p>
      <div className="flex flex-wrap gap-[6px]">{children}</div>
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-control border px-[10px] py-1 text-[11.5px] font-semibold transition ' +
        (on
          ? 'border-lime/45 bg-lime/[0.14] text-lime-bright'
          : 'border-hairline bg-panel text-ink-faint hover:text-ink')
      }
    >
      {children}
    </button>
  );
}
