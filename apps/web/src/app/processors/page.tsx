import { getTranslations } from 'next-intl/server';

import { CatalogView } from '@/components/CatalogView';
import { getCatalog, type CatalogSort } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    type?: string;
    manufacturer?: string;
    bracket?: string;
    vram?: string;
    architecture?: string;
    search?: string;
    sort?: string;
    dir?: string;
  };
}

const BRACKET_RANGE: Record<string, { minPrice?: number; maxPrice?: number }> = {
  budget: { maxPrice: 299 },
  mid: { minPrice: 300, maxPrice: 700 },
  high: { minPrice: 701 },
};

const SORTS: CatalogSort[] = ['index', 'price', 'perScore', 'tdp', 'vram'];

export default async function ProcessorsPage({ searchParams }: PageProps) {
  const type =
    searchParams.type === 'CPU' || searchParams.type === 'GPU' ? searchParams.type : undefined;
  const manufacturer =
    searchParams.manufacturer === 'INTEL' ||
    searchParams.manufacturer === 'AMD' ||
    searchParams.manufacturer === 'NVIDIA'
      ? searchParams.manufacturer
      : undefined;
  const range = BRACKET_RANGE[searchParams.bracket ?? 'all'] ?? {};
  const vram = (searchParams.vram ?? '')
    .split(',')
    .filter(Boolean)
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
  const sort = SORTS.includes(searchParams.sort as CatalogSort)
    ? (searchParams.sort as CatalogSort)
    : 'index';
  const dir = searchParams.dir === 'asc' ? 'asc' : 'desc';

  const [t, data] = await Promise.all([
    getTranslations('processors'),
    getCatalog({
      type,
      manufacturer,
      search: searchParams.search?.trim() || undefined,
      architecture: searchParams.architecture || undefined,
      vram: vram.length ? vram : undefined,
      sort,
      dir,
      limit: 200,
      ...range,
    }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6">
        <p className="label">{t('label')}</p>
        <h1 className="font-display text-ink-hi mt-2 text-[26px] font-bold tracking-tight">
          {t('title')}
        </h1>
      </header>

      <CatalogView data={data} />
    </main>
  );
}
