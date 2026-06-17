import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BottleneckResult } from '@/components/BottleneckResult';
import { ReportExportButtons } from '@/components/ReportExportButtons';
import { getBottleneckByShareSlug } from '@/lib/api';

interface PageProps {
  params: { shareSlug: string };
}

export const dynamic = 'force-dynamic';

export default async function SharedBottleneckPage({ params }: PageProps) {
  const result = await getBottleneckByShareSlug(params.shareSlug);
  if (!result) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="label">Shared bottleneck</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
            {result.cpu.modelName} <span className="text-slate-500">+</span> {result.gpu.modelName}
          </h1>
        </div>
        <Link href="/bottleneck" className="text-sm text-slate-400 hover:text-white">
          New analysis →
        </Link>
      </div>
      <div className="mt-6">
        <ReportExportButtons kind="bottleneck" shareSlug={params.shareSlug} />
      </div>
      <BottleneckResult result={result} />
    </main>
  );
}
