'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { SignedIn } from '@/lib/auth';
import { useCurrency } from '@/lib/currency-context';
import { useAuthedFetch } from '@/lib/useAuthedFetch';

export function CreateAlertButton({ slug, suggested }: { slug: string; suggested: number | null }) {
  const t = useTranslations('alerts');
  const { format } = useCurrency();
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
      if (res.status === 402) throw new Error(t('errPro'));
      if (res.status === 429) throw new Error(t('errLimit'));
      if (!res.ok) throw new Error(await res.text());
      setStatus('done');
      setMessage(t('done', { price: format(value) }));
    } catch (err) {
      setStatus('error');
      setMessage((err as Error).message);
    }
  };

  return (
    <SignedIn>
      <div className="card">
        <p className="label mb-2">{t('title')}</p>
        {status === 'done' ? (
          <p className="text-lime-bright text-sm">{message}</p>
        ) : open ? (
          <div className="flex items-center gap-2">
            <span className="text-ink-muted text-sm">{t('notifyWhen')} $</span>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.currentTarget.value)}
              className="focus:border-lime/45 rounded-control border-hairline bg-panel text-ink-hi w-28 border px-2 py-1 text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={submit}
              disabled={status === 'saving'}
              className="rounded-control bg-lime text-lime-ink px-3 py-1 text-xs font-semibold hover:brightness-110 disabled:opacity-40"
            >
              {status === 'saving' ? t('saving') : t('set')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-control border-hairline bg-panel-3 text-ink-hi border px-3 py-1 text-sm font-semibold hover:bg-white/20"
          >
            {t('track')}
          </button>
        )}
        {status === 'error' && message && <p className="text-cred mt-2 text-xs">{message}</p>}
      </div>
    </SignedIn>
  );
}
