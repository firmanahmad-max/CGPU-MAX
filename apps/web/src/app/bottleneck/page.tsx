'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { BottleneckResult } from '@/components/BottleneckResult';
import { ProcessorPicker } from '@/components/ProcessorPicker';
import { calculateBottleneck, type BottleneckPayload } from '@/lib/api';

export default function BottleneckPage() {
  const t = useTranslations('bottleneck');
  const [cpuSlug, setCpuSlug] = useState<string | null>(null);
  const [gpuSlug, setGpuSlug] = useState<string | null>(null);
  const [result, setResult] = useState<BottleneckPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCalculate = cpuSlug && gpuSlug;

  const onCalculate = async () => {
    if (!cpuSlug || !gpuSlug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await calculateBottleneck(cpuSlug, gpuSlug, true);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="label">{t('label')}</p>
        <h1 className="font-display text-ink-hi mt-2 text-[26px] font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-ink-faint mt-2 max-w-2xl text-[13px] leading-relaxed">
          {t('subtitle')}
          <code className="text-ink-mid ml-1 font-mono text-[11px]">
            apps/api/src/modules/bottleneck/domain/BottleneckAlgorithm.ts
          </code>
          .
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <ProcessorPicker label="CPU" type="CPU" value={cpuSlug} onChange={setCpuSlug} />
        <ProcessorPicker label="GPU" type="GPU" value={gpuSlug} onChange={setGpuSlug} />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={onCalculate}
          disabled={!canCalculate || loading}
          className="rounded-control bg-lime text-lime-ink px-6 py-[10px] text-[13px] font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? t('buttonLoading') : t('button')}
        </button>
        {error && <p className="text-cred text-[13px]">{error}</p>}
      </div>

      {result && <BottleneckResult result={result} />}
    </main>
  );
}
