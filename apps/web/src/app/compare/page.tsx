'use client';

import Link from 'next/link';
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
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="label">{t('label')}</p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-white">
            {t('title')}
          </h1>
        </div>
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          ← {t('back')}
        </Link>
      </div>

      <div className="mb-6 flex gap-2">
        {(['CPU', 'GPU'] as Type[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              setASlug(null);
              setBSlug(null);
              setResult(null);
            }}
            className={
              'rounded-pill tracking-label border px-4 py-1 text-xs font-medium uppercase transition ' +
              (type === t
                ? 'border-white/40 bg-white/15 text-white'
                : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200')
            }
          >
            {t} vs {t}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
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
          className="border-accent-blue bg-accent-blue/20 hover:bg-accent-blue/30 rounded-sm border px-6 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? t('buttonLoading') : t('button')}
        </button>
        {error && <p className="text-state-danger text-sm">{error}</p>}
      </div>

      {result && <CompareResult result={result} />}
    </main>
  );
}
