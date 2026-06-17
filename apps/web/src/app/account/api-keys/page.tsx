'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { NavBar } from '@/components/NavBar';
import { Pill } from '@/components/Pill';
import { useAuthedFetch } from '@/lib/useAuthedFetch';

interface ApiKeyMeta {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface CreatedKey extends ApiKeyMeta {
  key: string;
}

export default function ApiKeysPage() {
  const authedFetch = useAuthedFetch();
  const [keys, setKeys] = useState<ApiKeyMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<CreatedKey | null>(null);
  const [gated, setGated] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch('/api/v1/api-keys');
      if (res.status === 402) {
        setGated(true);
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { keys: ApiKeyMeta[] };
      setKeys(data.keys);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await authedFetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = (await res.json()) as CreatedKey;
      setRevealed(created);
      setNewName('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    setError(null);
    try {
      const res = await authedFetch(`/api/v1/api-keys/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="label">Enterprise</p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-white">
              API Keys
            </h1>
          </div>
          <Link href="/account" className="text-sm text-slate-400 hover:text-white">
            ← Account
          </Link>
        </div>

        {gated ? (
          <div className="card text-center">
            <p className="label mb-2">Enterprise feature</p>
            <p className="text-sm text-slate-400">
              The public REST API and API keys are available on the Enterprise plan.{' '}
              <a href="mailto:sales@cgpu-max.app" className="text-accent-blue hover:underline">
                Contact sales
              </a>
              .
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="card border-state-danger/40 bg-state-danger/10 text-state-danger mb-6 text-sm">
                {error}
              </div>
            )}

            {revealed && (
              <div className="card border-state-success/40 bg-state-success/5 mb-6">
                <p className="label text-state-success mb-2">New key — copy it now</p>
                <p className="mb-3 text-xs text-slate-400">
                  This is the only time the full key is shown. Store it securely.
                </p>
                <code className="block break-all rounded-sm bg-black/40 px-3 py-2 font-mono text-sm text-white">
                  {revealed.key}
                </code>
                <button
                  type="button"
                  onClick={() => setRevealed(null)}
                  className="mt-3 text-xs text-slate-400 hover:text-white"
                >
                  I&apos;ve saved it — dismiss
                </button>
              </div>
            )}

            <div className="card mb-6">
              <p className="label mb-3">Create a key</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newName}
                  maxLength={80}
                  placeholder="Key name (e.g. production-server)"
                  onChange={(e) => setNewName(e.currentTarget.value)}
                  className="focus:border-accent-blue flex-1 rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={create}
                  disabled={creating || !newName.trim()}
                  className="border-accent-blue bg-accent-blue/20 hover:bg-accent-blue/30 rounded-sm border px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </div>

            <div className="card">
              <p className="label mb-4">Active keys</p>
              {loading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : keys.length === 0 ? (
                <p className="text-sm text-slate-500">No keys yet.</p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {keys.map((k) => (
                    <li key={k.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-white">{k.name}</p>
                        <p className="font-mono text-xs text-slate-500">
                          {k.keyPrefix}…
                          <span className="ml-2">
                            {k.lastUsedAt
                              ? `last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                              : 'never used'}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {k.scopes.map((s) => (
                          <Pill key={s}>{s}</Pill>
                        ))}
                        <button
                          type="button"
                          onClick={() => revoke(k.id)}
                          className="text-state-danger text-xs hover:underline"
                        >
                          Revoke
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="mt-6 text-xs text-slate-500">
              API docs: <code className="font-mono">GET /api/public/v1/openapi.json</code>.
              Authenticate with <code className="font-mono">Authorization: Bearer &lt;key&gt;</code>
              .
            </p>
          </>
        )}
      </main>
    </>
  );
}
