import Link from 'next/link';

import type { Processor } from '@cgpu-max/types';

import { Pill } from './Pill';

interface ProcessorCardProps {
  processor: Processor;
}

const manufacturerVariant = (m: Processor['manufacturer']) =>
  m === 'INTEL' ? 'intel' : m === 'AMD' ? 'amd' : 'nvidia';

export function ProcessorCard({ processor }: ProcessorCardProps) {
  return (
    <Link
      href={`/processors/${processor.slug}`}
      className="card group block transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="mb-3 flex items-center justify-between">
        <Pill variant={manufacturerVariant(processor.manufacturer)}>
          {processor.manufacturer}
        </Pill>
        <Pill>{processor.type}</Pill>
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{processor.modelName}</h3>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="label">Gen</dt>
          <dd className="font-mono text-slate-200">{processor.generation ?? '—'}</dd>
        </div>
        <div>
          <dt className="label">TDP</dt>
          <dd className="font-mono text-slate-200">
            {processor.tdpWatts ? `${processor.tdpWatts} W` : '—'}
          </dd>
        </div>
        <div>
          <dt className="label">MSRP</dt>
          <dd className="font-mono text-slate-200">
            {processor.msrpUsd ? `$${processor.msrpUsd}` : '—'}
          </dd>
        </div>
        <div>
          <dt className="label">Slug</dt>
          <dd className="truncate font-mono text-xs text-slate-400">{processor.slug}</dd>
        </div>
      </dl>
    </Link>
  );
}
