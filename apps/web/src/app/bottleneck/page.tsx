'use client';

import Link from 'next/link';
import { useState } from 'react';

import { BottleneckResult } from '@/components/BottleneckResult';
import { ProcessorPicker } from '@/components/ProcessorPicker';
import { calculateBottleneck, type BottleneckPayload } from '@/lib/api';

export default function BottleneckPage() {
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
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="label">Calculator</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white">
            Bottleneck Analysis
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Pair a CPU with a GPU to see balance across resolutions and game profiles.
            Algorithm is deterministic and the weights are auditable in
            <code className="ml-1 font-mono text-xs text-slate-300">
              apps/api/src/modules/bottleneck/domain/BottleneckAlgorithm.ts
            </code>.
          </p>
        </div>
        <Link href="/" className="text-sm text-slate-400 hover:text-white">← Back</Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <ProcessorPicker label="CPU" type="CPU" value={cpuSlug} onChange={setCpuSlug} />
        <ProcessorPicker label="GPU" type="GPU" value={gpuSlug} onChange={setGpuSlug} />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={onCalculate}
          disabled={!canCalculate || loading}
          className="rounded-sm border border-accent-purple bg-accent-purple/20 px-6 py-2 text-sm font-semibold text-white transition hover:bg-accent-purple/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Analyzing…' : 'Analyze bottleneck'}
        </button>
        {error && <p className="text-sm text-state-danger">{error}</p>}
      </div>

      {result && <BottleneckResult result={result} />}
    </main>
  );
}
