'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Pill } from '@/components/Pill';
import { useAuthedFetch } from '@/lib/useAuthedFetch';

interface Theme {
  brandName: string;
  logoUrl: string | null;
  primaryColorHex: string;
  secondaryColorHex: string;
}
interface Org {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  theme: Theme;
  role?: string;
}

export default function OrganizationPage() {
  const t = useTranslations('organization');
  const authedFetch = useAuthedFetch();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [active, setActive] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [gated, setGated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [form, setForm] = useState({
    brandName: '',
    logoUrl: '',
    primaryColorHex: '',
    secondaryColorHex: '',
    customDomain: '',
  });
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch('/api/v1/orgs/me');
      if (res.status === 402) {
        setGated(true);
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { organizations: Org[] };
      setOrgs(data.organizations);
      const first = data.organizations[0] ?? null;
      setActive(first);
      if (first) fillForm(first);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fillForm = (o: Org) =>
    setForm({
      brandName: o.theme.brandName,
      logoUrl: o.theme.logoUrl ?? '',
      primaryColorHex: o.theme.primaryColorHex,
      secondaryColorHex: o.theme.secondaryColorHex,
      customDomain: o.customDomain ?? '',
    });

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async () => {
    if (!newName.trim()) return;
    setError(null);
    try {
      const res = await authedFetch('/api/v1/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      setNewName('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const save = async () => {
    if (!active) return;
    setError(null);
    setSaved(false);
    try {
      const res = await authedFetch(`/api/v1/orgs/${active.id}/branding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: form.brandName || undefined,
          logoUrl: form.logoUrl || null,
          primaryColorHex: form.primaryColorHex || undefined,
          secondaryColorHex: form.secondaryColorHex || undefined,
          customDomain: form.customDomain || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaved(true);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="label">{t('label')}</p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-white">
              {t('title')}
            </h1>
          </div>
          <Link href="/account" className="text-sm text-slate-400 hover:text-white">
            ← {t('backAccount')}
          </Link>
        </div>

        {gated ? (
          <div className="card text-center text-sm text-slate-400">
            {t('gatedBody')}{' '}
            <a href="mailto:sales@cgpu-max.app" className="text-accent-blue hover:underline">
              {t('contactSales')}
            </a>
            .
          </div>
        ) : (
          <>
            {error && (
              <div className="card border-state-danger/40 bg-state-danger/10 text-state-danger mb-6 text-sm">
                {error}
              </div>
            )}

            {!loading && orgs.length === 0 && (
              <div className="card mb-6">
                <p className="label mb-3">{t('createTitle')}</p>
                <div className="flex gap-3">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.currentTarget.value)}
                    placeholder={t('namePlaceholder')}
                    className="focus:border-accent-blue flex-1 rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={create}
                    className="border-accent-blue bg-accent-blue/20 hover:bg-accent-blue/30 rounded-sm border px-5 py-2 text-sm font-semibold text-white"
                  >
                    {t('create')}
                  </button>
                </div>
              </div>
            )}

            {active && (
              <div className="card space-y-4">
                <div className="flex items-center justify-between">
                  <p className="label">{t('branding', { name: active.name })}</p>
                  {active.role && <Pill>{active.role}</Pill>}
                </div>

                <Field
                  label={t('brandName')}
                  value={form.brandName}
                  onChange={(v) => setForm({ ...form, brandName: v })}
                />
                <Field
                  label={t('logoUrl')}
                  value={form.logoUrl}
                  onChange={(v) => setForm({ ...form, logoUrl: v })}
                  placeholder="https://…"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label={t('primaryColor')}
                    value={form.primaryColorHex}
                    onChange={(v) => setForm({ ...form, primaryColorHex: v })}
                    placeholder="#042C53"
                  />
                  <Field
                    label={t('secondaryColor')}
                    value={form.secondaryColorHex}
                    onChange={(v) => setForm({ ...form, secondaryColorHex: v })}
                    placeholder="#185FA5"
                  />
                </div>
                <Field
                  label={t('customDomain')}
                  value={form.customDomain}
                  onChange={(v) => setForm({ ...form, customDomain: v })}
                  placeholder="shop.example.com"
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={save}
                    className="border-accent-blue bg-accent-blue/20 hover:bg-accent-blue/30 rounded-sm border px-5 py-2 text-sm font-semibold text-white"
                  >
                    {t('save')}
                  </button>
                  {saved && <span className="text-state-success text-sm">{t('savedMark')}</span>}
                  <span className="ml-auto flex gap-2">
                    <span
                      className="h-6 w-6 rounded-sm border border-white/20"
                      style={{ background: form.primaryColorHex || '#042C53' }}
                    />
                    <span
                      className="h-6 w-6 rounded-sm border border-white/20"
                      style={{ background: form.secondaryColorHex || '#185FA5' }}
                    />
                  </span>
                </div>
                {active.customDomain && (
                  <p className="text-xs text-slate-500">
                    {t('resolveTheme')}{' '}
                    <code className="font-mono">
                      GET /api/v1/branding/by-domain/{active.customDomain}
                    </code>
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="label mb-1">{label}</p>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.currentTarget.value)}
        className="focus:border-accent-blue w-full rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
      />
    </div>
  );
}
