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
          <h1 className="font-display text-ink-hi mt-2 text-3xl font-semibold tracking-tight">
            {result.cpu.modelName} <span className="text-ink-faint">+</span> {result.gpu.modelName}
          </h1>
        </div>
        <Link href="/bottleneck" className="text-ink-muted hover:text-ink-hi text-sm">
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
