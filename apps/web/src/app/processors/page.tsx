import { getTranslations } from 'next-intl/server';

import { ProcessorCard } from '@/components/ProcessorCard';
import { ProcessorFilters } from '@/components/ProcessorFilters';
import { listProcessors, type ListProcessorsQuery } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    type?: string;
    manufacturer?: string;
    search?: string;
    page?: string;
  };
}

const PAGE_SIZE = 24;

function parseQuery(searchParams: PageProps['searchParams']): ListProcessorsQuery & {
  page: number;
} {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);
  return {
    type:
      searchParams.type === 'CPU' || searchParams.type === 'GPU' ? searchParams.type : undefined,
    manufacturer:
      searchParams.manufacturer === 'INTEL' ||
      searchParams.manufacturer === 'AMD' ||
      searchParams.manufacturer === 'NVIDIA'
        ? searchParams.manufacturer
        : undefined,
    search: searchParams.search?.trim() || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    page,
  };
}

export default async function ProcessorsPage({ searchParams }: PageProps) {
  const t = await getTranslations('processors');
  const query = parseQuery(searchParams);
  let result;
  let error: string | null = null;
  try {
    result = await listProcessors({
      type: query.type,
      manufacturer: query.manufacturer,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    });
  } catch (err) {
    error = (err as Error).message;
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6">
        <p className="label">{t('label')}</p>
        <h1 className="font-display text-ink-hi mt-2 text-[26px] font-bold tracking-tight">
          {t('title')}
        </h1>
      </header>

      <ProcessorFilters />

      {error && (
        <div className="panel border-cred/40 bg-cred/10 text-cred">
          <p className="label mb-1">{t('apiError')}</p>
          <p className="text-[13px]">{error}</p>
          <p className="text-ink-faint mt-2 text-[11px]">
            {t('apiErrorHint')} <code className="font-mono">pnpm --filter @cgpu-max/api dev</code>
          </p>
        </div>
      )}

      {result && result.items.length === 0 && (
        <div className="panel text-center">
          <p className="label mb-2">{t('noResults')}</p>
          <p className="text-ink-muted text-[13px]">
            {t('noResultsHintPrefix')} <code className="font-mono">pnpm db:seed</code>{' '}
            {t('noResultsHintSuffix')}
          </p>
        </div>
      )}

      {result && result.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((p) => (
              <ProcessorCard key={p.id} processor={p} />
            ))}
          </div>

          <div className="text-ink-faint mt-8 flex items-center justify-between text-[13px]">
            <span>
              {t('pageInfo', {
                total: result.total.toLocaleString(),
                page: query.page,
                totalPages,
              })}
            </span>
          </div>
        </>
      )}
    </main>
  );
}
