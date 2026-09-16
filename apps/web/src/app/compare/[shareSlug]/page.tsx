import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CompareResult } from '@/components/CompareResult';
import { ReportExportButtons } from '@/components/ReportExportButtons';
import { getComparisonByShareSlug } from '@/lib/api';

interface PageProps {
  params: { shareSlug: string };
}

export const dynamic = 'force-dynamic';

export default async function SharedComparisonPage({ params }: PageProps) {
  const result = await getComparisonByShareSlug(params.shareSlug);
  if (!result) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="label">Shared comparison</p>
          <h1 className="font-display text-ink-hi mt-2 text-3xl font-semibold tracking-tight">
            {result.a.modelName} <span className="text-ink-faint">vs</span> {result.b.modelName}
          </h1>
        </div>
        <Link href="/compare" className="text-ink-muted hover:text-ink-hi text-sm">
          New comparison →
        </Link>
      </div>
      <div className="mt-6">
        <ReportExportButtons kind="comparison" shareSlug={params.shareSlug} />
      </div>
      <CompareResult result={result} />
    </main>
  );
}
