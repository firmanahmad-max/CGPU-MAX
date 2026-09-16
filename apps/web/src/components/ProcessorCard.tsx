import Link from 'next/link';

import type { Processor } from '@cgpu-max/types';

import { Mark } from './console/Mark';
import { Price } from './console/Price';

interface ProcessorCardProps {
  processor: Processor;
}

export function ProcessorCard({ processor }: ProcessorCardProps) {
  return (
    <Link
      href={`/processors/${processor.slug}`}
      className="panel group block transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="mb-3 flex items-center justify-between">
        <Mark mfr={processor.manufacturer} />
        <span className="tracking-label text-ink-faint text-[10px] font-semibold uppercase">
          {processor.type}
        </span>
      </div>
      <h3 className="font-display text-ink-hi text-[17px] font-bold tracking-tight">
        {processor.modelName}
      </h3>
      {processor.architecture && (
        <p className="text-ink-faint mt-[3px] text-[11.5px]">{processor.architecture}</p>
      )}
      <dl className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <dt className="label">Gen</dt>
          <dd className="text-ink-mid mt-1 font-mono text-[12.5px]">
            {processor.generation ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="label">TDP</dt>
          <dd className="text-ink-mid mt-1 font-mono text-[12.5px]">
            {processor.tdpWatts ? `${processor.tdpWatts} W` : '—'}
          </dd>
        </div>
        <div>
          <dt className="label">MSRP</dt>
          <Price
            usd={processor.msrpUsd}
            className="text-ink-hi mt-1 block font-mono text-[12.5px]"
          />
        </div>
      </dl>
    </Link>
  );
}
