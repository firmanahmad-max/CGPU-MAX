'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { CompareResult } from '@/components/CompareResult';
import { ProcessorPicker } from '@/components/ProcessorPicker';
import { compareProcessors, type ComparisonPayload } from '@/lib/api';

type Type = 'CPU' | 'GPU';

export default function ComparePage() {
  const t = useTranslations('compare');
  const [type, setType] = useState<Type>('CPU');
  const [aSlug, setASlug] = useState<string | null>(null);
  const [bSlug, setBSlug] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCompare = aSlug && bSlug && aSlug !== bSlug;

  const onCompare = async () => {
    if (!aSlug || !bSlug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await compareProcessors(aSlug, bSlug, true);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6">
        <p className="label">{t('label')}</p>
        <h1 className="font-display text-ink-hi mt-2 text-[26px] font-bold tracking-tight">
          {t('title')}
        </h1>
      </header>

      <div className="mb-6 flex gap-2">
        {(['CPU', 'GPU'] as Type[]).map((ty) => (
          <button
            key={ty}
            type="button"
            onClick={() => {
              setType(ty);
              setASlug(null);
              setBSlug(null);
              setResult(null);
            }}
            className={
              'rounded-control border px-4 py-1 text-[12px] font-semibold transition ' +
              (type === ty
                ? 'border-lime/45 bg-lime/[0.14] text-lime-bright'
                : 'border-hairline bg-panel text-ink-faint hover:text-ink')
            }
          >
            {ty} vs {ty}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ProcessorPicker
          label={t('sideA')}
          type={type}
          value={aSlug}
          onChange={setASlug}
          excludeSlug={bSlug}
        />
        <ProcessorPicker
          label={t('sideB')}
          type={type}
          value={bSlug}
          onChange={setBSlug}
          excludeSlug={aSlug}
        />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={onCompare}
          disabled={!canCompare || loading}
          className="rounded-control bg-lime text-lime-ink px-6 py-[10px] text-[13px] font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? t('buttonLoading') : t('button')}
        </button>
        {error && <p className="text-cred text-[13px]">{error}</p>}
      </div>

      {result && <CompareResult result={result} />}
    </main>
  );
}
