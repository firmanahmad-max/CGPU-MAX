import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Price } from '@/components/console/Price';
import { getComponents, type ComponentKind, type ComponentRow } from '@/lib/api';

export const dynamic = 'force-dynamic';

const TYPES: ComponentKind[] = ['MOTHERBOARD', 'RAM', 'SSD', 'PSU', 'CASING', 'COOLER', 'MONITOR'];
const TYPE_LABEL: Record<ComponentKind, string> = {
  MOTHERBOARD: 'motherboard',
  RAM: 'ram',
  SSD: 'ssd',
  PSU: 'psu',
  CASING: 'casing',
  COOLER: 'cooler',
  MONITOR: 'monitor',
};

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

const fmtCap = (gb: number) => (gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`);

export default async function ComponentsPage({ searchParams }: PageProps) {
  const type: ComponentKind = TYPES.includes(searchParams.type as ComponentKind)
    ? (searchParams.type as ComponentKind)
    : 'MOTHERBOARD';
  const t = await getTranslations('components');

  const FILTER_KEYS = [
    'brand',
    'socket',
    'chipset',
    'formFactor',
    'memoryType',
    'capacityGb',
    'interface',
    'wattage',
    'efficiency',
    'resolution',
    'sizeInch',
    'refreshHz',
  ] as const;

  const data = await getComponents({
    type,
    ...Object.fromEntries(FILTER_KEYS.map((k) => [k, searchParams[k]])),
    limit: 200,
  }).catch(() => null);

  const withParam = (key: string, value: string) => {
    const p = new URLSearchParams();
    p.set('type', type);
    for (const k of FILTER_KEYS) if (searchParams[k] && k !== key) p.set(k, searchParams[k]!);
    if (searchParams[key] !== value) p.set(key, value);
    return `/components?${p.toString()}`;
  };
  const on = (key: string, value: string) => searchParams[key] === value;

  const f = data?.facets;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="label">{t('database')}</p>
        <h1 className="font-display text-ink-hi mt-1 text-[26px] font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-ink-faint mt-1 text-[13px]">{t('subtitle')}</p>
      </header>

      {/* Type toggle */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TYPES.map((k) => (
          <Link
            key={k}
            href={`/components?type=${k}`}
            className={
              'rounded-pill tracking-label border px-4 py-[6px] text-[11px] font-semibold uppercase transition ' +
              (type === k
                ? 'border-lime/45 bg-lime/[0.14] text-lime-bright'
                : 'border-hairline bg-panel text-ink-faint hover:text-ink')
            }
          >
            {t(TYPE_LABEL[k])}
          </Link>
        ))}
      </div>

      {/* Facets */}
      {f && (
        <div className="mb-5 space-y-3">
          <FacetRow label={t('brand')}>
            {f.brands.map((x) => (
              <Chip key={x.name} href={withParam('brand', x.name)} on={on('brand', x.name)}>
                {x.name} <span className="text-ink-faint">{x.count}</span>
              </Chip>
            ))}
          </FacetRow>

          {type === 'MOTHERBOARD' && (
            <>
              <NamedFacet label={t('socket')} items={f.sockets} k="socket" wp={withParam} on={on} />
              <NamedFacet
                label={t('chipset')}
                items={f.chipsets}
                k="chipset"
                wp={withParam}
                on={on}
              />
              <NamedFacet
                label={t('formFactor')}
                items={f.formFactors}
                k="formFactor"
                wp={withParam}
                on={on}
              />
            </>
          )}
          {type === 'RAM' && (
            <>
              <NamedFacet
                label={t('memory')}
                items={f.memoryTypes}
                k="memoryType"
                wp={withParam}
                on={on}
              />
              <FacetRow label={t('capacity')}>
                {f.capacities.map((x) => (
                  <Chip
                    key={x.gb}
                    href={withParam('capacityGb', String(x.gb))}
                    on={on('capacityGb', String(x.gb))}
                  >
                    {fmtCap(x.gb)} <span className="text-ink-faint">{x.count}</span>
                  </Chip>
                ))}
              </FacetRow>
            </>
          )}
          {type === 'SSD' && (
            <>
              <NamedFacet
                label={t('interface')}
                items={f.interfaces}
                k="interface"
                wp={withParam}
                on={on}
              />
              <FacetRow label={t('capacity')}>
                {f.capacities.map((x) => (
                  <Chip
                    key={x.gb}
                    href={withParam('capacityGb', String(x.gb))}
                    on={on('capacityGb', String(x.gb))}
                  >
                    {fmtCap(x.gb)} <span className="text-ink-faint">{x.count}</span>
                  </Chip>
                ))}
              </FacetRow>
            </>
          )}
          {type === 'PSU' && (
            <>
              <FacetRow label={t('wattage')}>
                {f.wattages.map((x) => (
                  <Chip
                    key={x.w}
                    href={withParam('wattage', String(x.w))}
                    on={on('wattage', String(x.w))}
                  >
                    {x.w}W <span className="text-ink-faint">{x.count}</span>
                  </Chip>
                ))}
              </FacetRow>
              <NamedFacet
                label={t('efficiency')}
                items={f.efficiencies}
                k="efficiency"
                wp={withParam}
                on={on}
              />
            </>
          )}
          {type === 'CASING' && (
            <NamedFacet
              label={t('formFactor')}
              items={f.formFactors}
              k="formFactor"
              wp={withParam}
              on={on}
            />
          )}
          {type === 'COOLER' && (
            <NamedFacet
              label={t('coolerType')}
              items={f.formFactors}
              k="formFactor"
              wp={withParam}
              on={on}
            />
          )}
          {type === 'MONITOR' && (
            <>
              <NamedFacet
                label={t('resolution')}
                items={f.resolutions}
                k="resolution"
                wp={withParam}
                on={on}
              />
              <FacetRow label={t('size')}>
                {f.sizes.map((x) => (
                  <Chip
                    key={x.inch}
                    href={withParam('sizeInch', String(x.inch))}
                    on={on('sizeInch', String(x.inch))}
                  >
                    {x.inch}&quot; <span className="text-ink-faint">{x.count}</span>
                  </Chip>
                ))}
              </FacetRow>
              <FacetRow label={t('refresh')}>
                {f.refreshRates.map((x) => (
                  <Chip
                    key={x.hz}
                    href={withParam('refreshHz', String(x.hz))}
                    on={on('refreshHz', String(x.hz))}
                  >
                    {x.hz}Hz <span className="text-ink-faint">{x.count}</span>
                  </Chip>
                ))}
              </FacetRow>
            </>
          )}
        </div>
      )}

      {!data || data.items.length === 0 ? (
        <div className="panel text-ink-muted text-center text-[13px]">{t('empty')}</div>
      ) : (
        <>
          <p className="label mb-3">{t('match', { count: data.total })}</p>
          <div className="panel overflow-x-auto !p-0">
            <table className="w-full min-w-[560px] text-[12.5px]">
              <thead className="bg-panel-2 tracking-label text-ink-muted text-left text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-3">{t('part')}</th>
                  {colHeads(type, t).map((h) => (
                    <th key={h} className="px-4 py-3">
                      {h}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">{t('price')}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.slug} className="border-hairline border-t">
                    <td className="px-4 py-3">
                      <span className="text-ink-faint tracking-label mr-2 text-[9px] font-bold uppercase">
                        {r.brand}
                      </span>
                      <span className="text-ink-hi font-medium">{r.modelName}</span>
                    </td>
                    {colCells(type, r).map((c, i) => (
                      <td key={i} className="text-ink-mid px-4 py-3 font-mono text-[11.5px]">
                        {c}
                      </td>
                    ))}
                    <td className="text-ink-hi px-4 py-3 text-right font-mono">
                      <Price usd={r.msrpUsd} idr={r.priceIdr} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

function colHeads(type: ComponentKind, t: (k: string) => string): string[] {
  switch (type) {
    case 'MOTHERBOARD':
      return [t('socket'), t('chipset'), t('formFactor'), t('memory')];
    case 'RAM':
      return [t('memory'), t('capacity'), t('speed'), t('cas')];
    case 'SSD':
      return [t('capacity'), t('interface'), t('formFactor')];
    case 'PSU':
      return [t('wattage'), t('efficiency'), t('modular')];
    case 'CASING':
      return [t('formFactor')];
    case 'COOLER':
      return [t('coolerType')];
    case 'MONITOR':
      return [t('size'), t('resolution'), t('refresh'), t('panel')];
  }
}

function colCells(type: ComponentKind, r: ComponentRow): (string | number)[] {
  const cap = r.capacityGb
    ? r.capacityGb >= 1024
      ? `${r.capacityGb / 1024} TB`
      : `${r.capacityGb} GB`
    : '—';
  switch (type) {
    case 'MOTHERBOARD':
      return [r.socket ?? '—', r.chipset ?? '—', r.formFactor ?? '—', r.memoryType ?? '—'];
    case 'RAM':
      return [
        r.memoryType ?? '—',
        `${cap}${r.moduleCount ? ` (${r.moduleCount}×)` : ''}`,
        r.speedMhz ?? '—',
        r.casLatency ? `CL${r.casLatency}` : '—',
      ];
    case 'SSD':
      return [cap, r.interface ?? '—', r.formFactor ?? '—'];
    case 'PSU':
      return [r.wattage ? `${r.wattage}W` : '—', r.efficiency ?? '—', r.modular ?? '—'];
    case 'CASING':
      return [r.formFactor ?? '—'];
    case 'COOLER':
      return [r.formFactor ?? '—'];
    case 'MONITOR':
      return [
        r.sizeInch ? `${r.sizeInch}"` : '—',
        r.resolution ?? '—',
        r.refreshHz ? `${r.refreshHz}Hz` : '—',
        r.panel ?? '—',
      ];
  }
}

function NamedFacet({
  label,
  items,
  k,
  wp,
  on,
}: {
  label: string;
  items: { name: string; count: number }[];
  k: string;
  wp: (key: string, value: string) => string;
  on: (key: string, value: string) => boolean;
}) {
  return (
    <FacetRow label={label}>
      {items.map((x) => (
        <Chip key={x.name} href={wp(k, x.name)} on={on(k, x.name)}>
          {x.name} <span className="text-ink-faint">{x.count}</span>
        </Chip>
      ))}
    </FacetRow>
  );
}

function FacetRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="label w-[64px] flex-shrink-0">{label}</span>
      <div className="flex flex-wrap gap-[6px]">{children}</div>
    </div>
  );
}

function Chip({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        'rounded-pill border px-[10px] py-[3px] font-mono text-[11px] transition ' +
        (on
          ? 'border-lime/45 bg-lime/[0.14] text-lime-bright'
          : 'border-hairline bg-panel text-ink-muted hover:text-ink')
      }
    >
      {children}
    </Link>
  );
}
