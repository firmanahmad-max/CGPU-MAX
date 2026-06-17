'use client';

import { SignedIn } from '@clerk/nextjs';
import { useState } from 'react';

import { useAuthedFetch } from '@/lib/useAuthedFetch';

interface ReportExportButtonsProps {
  kind: 'comparison' | 'bottleneck';
  shareSlug: string;
}

// Reports are Pro-gated and require the Clerk JWT, so a plain <a download> can't
// carry auth. We fetch the file as a blob with the token attached, then trigger
// a client-side download.
export function ReportExportButtons({ kind, shareSlug }: ReportExportButtonsProps) {
  const authedFetch = useAuthedFetch();
  const [busy, setBusy] = useState<'pdf' | 'xlsx' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = async (format: 'pdf' | 'xlsx') => {
    setBusy(format);
    setError(null);
    try {
      const res = await authedFetch(`/api/v1/reports/${kind}/${shareSlug}?format=${format}`);
      if (res.status === 402) throw new Error('Reports are a Pro feature — upgrade on Pricing.');
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${kind}-${shareSlug}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <SignedIn>
      <div className="card flex flex-wrap items-center gap-3">
        <span className="label">Export</span>
        <button
          type="button"
          onClick={() => download('pdf')}
          disabled={busy !== null}
          className="rounded-sm border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-40"
        >
          {busy === 'pdf' ? 'Generating…' : 'PDF'}
        </button>
        <button
          type="button"
          onClick={() => download('xlsx')}
          disabled={busy !== null}
          className="rounded-sm border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-40"
        >
          {busy === 'xlsx' ? 'Generating…' : 'Excel'}
        </button>
        {error && <span className="text-xs text-state-danger">{error}</span>}
      </div>
    </SignedIn>
  );
}
