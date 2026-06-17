'use client';

import { SignedIn } from '@clerk/nextjs';
import { useState } from 'react';

import { useAuthedFetch } from '@/lib/useAuthedFetch';

export function CreateAlertButton({ slug, suggested }: { slug: string; suggested: number | null }) {
  const authedFetch = useAuthedFetch();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(suggested ? String(suggested) : '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    const value = Number(target);
    if (!value || value <= 0) return;
    setStatus('saving');
    setMessage(null);
    try {
      const res = await authedFetch('/api/v1/pricing/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, targetPriceUsd: value, direction: 'BELOW' }),
      });
      if (res.status === 402) throw new Error('Price alerts are a Pro feature.');
      if (res.status === 429) throw new Error('Alert limit reached for your plan.');
      if (!res.ok) throw new Error(await res.text());
      setStatus('done');
      setMessage(`Alert set: notify when ≤ $${value}`);
    } catch (err) {
      setStatus('error');
      setMessage((err as Error).message);
    }
  };

  return (
    <SignedIn>
      <div className="card">
        <p className="label mb-2">Price alert</p>
        {status === 'done' ? (
          <p className="text-state-success text-sm">{message}</p>
        ) : open ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Notify me when ≤ $</span>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.currentTarget.value)}
              className="focus:border-accent-blue w-28 rounded-sm border border-white/10 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={submit}
              disabled={status === 'saving'}
              className="border-accent-blue bg-accent-blue/20 hover:bg-accent-blue/30 rounded-sm border px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
            >
              {status === 'saving' ? 'Saving…' : 'Set alert'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-sm border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-white hover:bg-white/20"
          >
            Track price
          </button>
        )}
        {status === 'error' && message && (
          <p className="text-state-danger mt-2 text-xs">{message}</p>
        )}
      </div>
    </SignedIn>
  );
}
