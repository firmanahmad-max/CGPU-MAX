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
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
            {result.a.modelName} <span className="text-slate-500">vs</span> {result.b.modelName}
          </h1>
        </div>
        <Link href="/compare" className="text-sm text-slate-400 hover:text-white">
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
