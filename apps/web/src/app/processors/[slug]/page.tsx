import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CreateAlertButton } from '@/components/CreateAlertButton';
import { Pill } from '@/components/Pill';
import { getPriceHistory, getProcessor } from '@/lib/api';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export default async function ProcessorDetailPage({ params }: PageProps) {
  const [processor, history] = await Promise.all([
    getProcessor(params.slug),
    getPriceHistory(params.slug),
  ]);
  if (!processor) notFound();

  const prices = history?.points.map((p) => p.priceUsd) ?? [];
  const lowest = prices.length ? Math.min(...prices) : null;
  const latest = prices.length ? prices[prices.length - 1] : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/processors" className="text-ink-muted hover:text-ink-hi text-sm">
        ← All processors
      </Link>

      <header className="mb-10 mt-6">
        <div className="mb-4 flex gap-2">
          <Pill
            variant={
              processor.manufacturer === 'INTEL'
                ? 'intel'
                : processor.manufacturer === 'AMD'
                  ? 'amd'
                  : 'nvidia'
            }
          >
            {processor.manufacturer}
          </Pill>
          <Pill>{processor.type}</Pill>
          {processor.generation && <Pill>Gen {processor.generation}</Pill>}
        </div>
        <h1 className="font-display text-ink-hi text-5xl font-semibold tracking-tight">
          {processor.modelName}
        </h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="TDP" value={processor.tdpWatts ? `${processor.tdpWatts} W` : '—'} />
        <Metric label="Architecture" value={processor.architecture ?? '—'} />
        <Metric label="Process" value={processor.processNm ? `${processor.processNm} nm` : '—'} />
        <Metric label="MSRP" value={processor.msrpUsd ? `$${processor.msrpUsd}` : '—'} />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label="Latest price" value={latest !== null ? `$${latest}` : '—'} />
        <Metric label="Lowest tracked" value={lowest !== null ? `$${lowest}` : '—'} />
        <CreateAlertButton slug={processor.slug} suggested={lowest} />
      </section>
      {history && history.points.length > 0 && (
        <p className="text-ink-faint mt-3 text-xs">
          {history.points.length} price points tracked over the last year.
        </p>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="label">{label}</p>
      <p className="metric mt-2">{value}</p>
    </div>
  );
}
