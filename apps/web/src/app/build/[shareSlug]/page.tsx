import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { BuildAdviceResult } from '@/components/BuildAdviceResult';
import { isFullBuild } from '@/lib/advisorTypes';
import { getSharedBuild } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { shareSlug: string };
}

export default async function SharedBuildPage({ params }: PageProps) {
  const t = await getTranslations('advisor');
  const data = await getSharedBuild(params.shareSlug);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="label">{t('sharedTitle')}</p>
          <Link
            href="/advisor"
            className="rounded-pill border-lime/45 bg-lime/[0.14] text-lime-bright border px-3 py-1 text-xs font-semibold transition hover:brightness-110"
          >
            {t('buildYourOwn')}
          </Link>
        </div>
        <h1 className="font-display text-ink-hi text-3xl font-semibold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-ink-muted mt-2 text-sm">{t('sharedSubtitle')}</p>
      </header>

      {isFullBuild(data) ? (
        <BuildAdviceResult advice={data} readOnly />
      ) : (
        <div className="card text-ink-muted text-center text-sm">
          {/* Found but in the pre-full-build shape → explain instead of crashing. */}
          {data ? t('sharedLegacy') : t('sharedNotFound')}
        </div>
      )}
    </main>
  );
}
