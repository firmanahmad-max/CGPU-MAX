import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Price } from '@/components/console/Price';
import { getComponents, type ComponentKind, type ComponentRow } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    type?: string;
    brand?: string;
    socket?: string;
    chipset?: string;
    formFactor?: string;
    memoryType?: string;
    capacityGb?: string;
  };
}

export default async function ComponentsPage({ searchParams }: PageProps) {
  const type: ComponentKind = searchParams.type === 'RAM' ? 'RAM' : 'MOTHERBOARD';
  const t = await getTranslations('components');

  const data = await getComponents({
    type,
    brand: searchParams.brand,
    socket: searchParams.socket,
    chipset: searchParams.chipset,
    formFactor: searchParams.formFactor,
    memoryType: searchParams.memoryType,
    capacityGb: searchParams.capacityGb,
    limit: 200,
  }).catch(() => null);

  // Build a URL that keeps `type` but toggles one facet (click again to clear).
  const withParam = (key: string, value: string | undefined) => {
    const p = new URLSearchParams();
    p.set('type', type);
    const cur: Record<string, string | undefined> = {
      brand: searchParams.brand,
      socket: searchParams.socket,
      chipset: searchParams.chipset,
      formFactor: searchParams.formFactor,
      memoryType: searchParams.memoryType,
      capacityGb: searchParams.capacityGb,
    };
    for (const [k, v] of Object.entries(cur)) if (v && k !== key) p.set(k, v);
    if (value !== undefined && cur[key] !== value) p.set(key, value);
    return `/components?${p.toString()}`;
  };

  const active = (key: keyof typeof searchParams, value: string) => searchParams[key] === value;

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
      <div className="mb-5 flex gap-2">
        {(['MOTHERBOARD', 'RAM'] as ComponentKind[]).map((k) => (
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
            {k === 'MOTHERBOARD' ? t('motherboard') : t('ram')}
          </Link>
        ))}
      </div>

      {/* Facet filters */}
      {data && (
        <div className="mb-5 space-y-3">
          <FacetRow label={t('brand')}>
            {data.facets.brands.map((f) => (
              <Chip key={f.name} href={withParam('brand', f.name)} on={active('brand', f.name)}>
                {f.name} <span className="text-ink-faint">{f.count}</span>
              </Chip>
            ))}
          </FacetRow>

          {type === 'MOTHERBOARD' ? (
            <>
              <FacetRow label={t('socket')}>
                {data.facets.sockets.map((f) => (
                  <Chip
                    key={f.name}
                    href={withParam('socket', f.name)}
                    on={active('socket', f.name)}
                  >
                    {f.name} <span className="text-ink-faint">{f.count}</span>
                  </Chip>
                ))}
              </FacetRow>
              <FacetRow label={t('chipset')}>
                {data.facets.chipsets.map((f) => (
                  <Chip
                    key={f.name}
                    href={withParam('chipset', f.name)}
                    on={active('chipset', f.name)}
                  >
                    {f.name} <span className="text-ink-faint">{f.count}</span>
                  </Chip>
                ))}
              </FacetRow>
              <FacetRow label={t('formFactor')}>
                {data.facets.formFactors.map((f) => (
                  <Chip
                    key={f.name}
                    href={withParam('formFactor', f.name)}
                    on={active('formFactor', f.name)}
                  >
                    {f.name} <span className="text-ink-faint">{f.count}</span>
                  </Chip>
                ))}
              </FacetRow>
            </>
          ) : (
            <>
              <FacetRow label={t('memory')}>
                {data.facets.memoryTypes.map((f) => (
                  <Chip
                    key={f.name}
                    href={withParam('memoryType', f.name)}
                    on={active('memoryType', f.name)}
                  >
                    {f.name} <span className="text-ink-faint">{f.count}</span>
                  </Chip>
                ))}
              </FacetRow>
              <FacetRow label={t('capacity')}>
                {data.facets.capacities.map((f) => (
                  <Chip
                    key={f.gb}
                    href={withParam('capacityGb', String(f.gb))}
                    on={active('capacityGb', String(f.gb))}
                  >
                    {f.gb} GB <span className="text-ink-faint">{f.count}</span>
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
            <table className="w-full min-w-[640px] text-[12.5px]">
              <thead className="bg-panel-2 tracking-label text-ink-muted text-left text-[10px] uppercase">
                {type === 'MOTHERBOARD' ? (
                  <tr>
                    <th className="px-4 py-3">{t('part')}</th>
                    <th className="px-4 py-3">{t('socket')}</th>
                    <th className="px-4 py-3">{t('chipset')}</th>
                    <th className="px-4 py-3">{t('formFactor')}</th>
                    <th className="px-4 py-3">{t('memory')}</th>
                    <th className="px-4 py-3 text-right">{t('price')}</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-3">{t('part')}</th>
                    <th className="px-4 py-3">{t('memory')}</th>
                    <th className="px-4 py-3">{t('capacity')}</th>
                    <th className="px-4 py-3">{t('speed')}</th>
                    <th className="px-4 py-3">{t('cas')}</th>
                    <th className="px-4 py-3 text-right">{t('price')}</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <Row key={r.slug} r={r} type={type} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

function Row({ r, type }: { r: ComponentRow; type: ComponentKind }) {
  return (
    <tr className="border-hairline border-t">
      <td className="px-4 py-3">
        <span className="text-ink-faint tracking-label mr-2 text-[9px] font-bold uppercase">
          {r.brand}
        </span>
        <span className="text-ink-hi font-medium">{r.modelName}</span>
      </td>
      {type === 'MOTHERBOARD' ? (
        <>
          <td className="text-ink-mid px-4 py-3 font-mono text-[11.5px]">{r.socket ?? '—'}</td>
          <td className="text-ink-mid px-4 py-3 font-mono text-[11.5px]">{r.chipset ?? '—'}</td>
          <td className="text-ink-faint px-4 py-3 text-[11.5px]">{r.formFactor ?? '—'}</td>
          <td className="text-ink-faint px-4 py-3 font-mono text-[11.5px]">
            {r.memoryType ?? '—'}
          </td>
        </>
      ) : (
        <>
          <td className="text-ink-mid px-4 py-3 font-mono text-[11.5px]">{r.memoryType ?? '—'}</td>
          <td className="text-ink-mid px-4 py-3 font-mono text-[11.5px]">
            {r.capacityGb ? `${r.capacityGb} GB` : '—'}
            {r.moduleCount ? <span className="text-ink-faint"> ({r.moduleCount}×)</span> : null}
          </td>
          <td className="text-ink-mid px-4 py-3 font-mono text-[11.5px]">
            {r.speedMhz ? `${r.speedMhz}` : '—'}
          </td>
          <td className="text-ink-faint px-4 py-3 font-mono text-[11.5px]">
            {r.casLatency ? `CL${r.casLatency}` : '—'}
          </td>
        </>
      )}
      <td className="text-ink-hi px-4 py-3 text-right font-mono">
        <Price usd={r.msrpUsd} idr={r.priceIdr} />
      </td>
    </tr>
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
