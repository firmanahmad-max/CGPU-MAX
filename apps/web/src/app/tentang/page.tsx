import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { AboutAvatar } from '@/components/AboutAvatar';

export const metadata: Metadata = { title: 'About — CGPU-MAX' };

// Keep in sync with apps/web/package.json (not imported to avoid resolveJsonModule).
const APP_VERSION = '0.1.0';

// Fixed Arta Ecosystem registry (this app excluded). Cards link out in a new tab.
const OTHER_APPS = [
  {
    name: 'ArtaLib',
    tagline: 'Smart Personal Library',
    url: 'https://artalib.firmanahmad.id',
    emoji: '📚',
  },
  {
    name: 'GoodDay',
    tagline: 'Islamic Self Affirmation',
    url: 'https://goodday.firmanahmad.id',
    emoji: '☀️',
  },
  {
    name: 'HariBaik',
    tagline: 'Islamic AI Companion',
    url: 'https://haribaik.firmanahmad.id',
    emoji: '🌤️',
  },
  {
    name: 'Arta Assistant',
    tagline: 'Indonesian Smart AI Assistant',
    url: 'https://artaingat.firmanahmad.id',
    emoji: '🤖',
  },
  {
    name: 'ArtaFin',
    tagline: 'AI-Powered Personal Finance',
    url: 'https://artafin.firmanahmad.id',
    emoji: '💰',
  },
  {
    name: 'ArtaPOS',
    tagline: 'Manajemen Toko Komputer',
    url: 'https://artapos.firmanahmad.id',
    emoji: '🖥️',
  },
  {
    name: 'ArtaAuto',
    tagline: 'Smart Used Car Showroom Management',
    url: 'https://artaauto.firmanahmad.id',
    emoji: '🚗',
  },
] as const;

// Feature marks mirror the icon rail; accent tints add a little life.
const FEATURES = [
  { key: 'processors', abbr: 'KT', accent: 'text-lime' },
  { key: 'rankings', abbr: 'RK', accent: 'text-cblue' },
  { key: 'compare', abbr: 'VS', accent: 'text-camber' },
  { key: 'bottleneck', abbr: 'BN', accent: 'text-cred' },
  { key: 'advisor', abbr: 'AI', accent: 'text-lime' },
  { key: 'gaming', abbr: 'GM', accent: 'text-cblue' },
  { key: 'streaming', abbr: 'ST', accent: 'text-camber' },
  { key: 'pricing', abbr: '$', accent: 'text-lime' },
  { key: 'platform', abbr: '★', accent: 'text-cred' },
] as const;

const SOCIALS = [
  { label: 'firmanahmad.id', href: 'https://firmanahmad.id', icon: GlobeIcon },
  { label: '@boysnocry', href: 'https://x.com/boysnocry', icon: XIcon },
  { label: '@boysnocry', href: 'https://instagram.com/boysnocry', icon: InstagramIcon },
] as const;

export default async function AboutPage() {
  const t = await getTranslations('about');
  const disclaimer = t.raw('disclaimer') as string[];
  const year = new Date().getFullYear();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* Hero */}
      <section className="panel">
        <span className="pill">{t('eyebrow')}</span>
        <div className="mt-4 flex items-center gap-3">
          <span className="bg-lime font-display text-lime-ink flex h-[46px] w-[46px] items-center justify-center rounded-[13px] text-[22px] font-extrabold">
            C
          </span>
          <div>
            <h1 className="font-display text-ink-hi text-[26px] font-bold leading-none tracking-tight">
              CGPU-MAX
            </h1>
            <p className="text-ink-muted mt-[6px] text-[12.5px]">{t('tagline')}</p>
          </div>
          <span className="rounded-pill border-hairline bg-panel-2 text-ink-faint ml-auto self-start border px-[10px] py-[4px] font-mono text-[10.5px]">
            {t('versionLabel')} {APP_VERSION}
          </span>
        </div>
        <p className="text-ink-mid mt-4 text-[13.5px] leading-relaxed">{t('intro')}</p>
      </section>

      {/* Features */}
      <section className="mt-8">
        <p className="label mb-3">{t('featuresTitle')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.key} className="panel flex items-start gap-3">
              <span
                className={
                  'bg-panel-2 border-hairline flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] border font-mono text-[11px] font-bold ' +
                  f.accent
                }
              >
                {f.abbr}
              </span>
              <div className="min-w-0">
                <p className="text-ink-hi text-[13px] font-semibold">{t(`feat.${f.key}.title`)}</p>
                <p className="text-ink-faint mt-1 text-[12px] leading-relaxed">
                  {t(`feat.${f.key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Developer */}
      <section className="mt-8">
        <p className="label mb-3">{t('developerTitle')}</p>
        <div className="panel">
          <div className="flex items-center gap-4">
            <AboutAvatar />
            <div className="min-w-0">
              <p className="font-display text-ink-hi text-[17px] font-bold tracking-tight">
                Firman Ahmad
              </p>
              <p className="text-ink-faint mt-[3px] text-[12px]">{t('developerRole')}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label + s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-pill border-hairline bg-panel-2 text-ink-mid hover:text-ink inline-flex items-center gap-[7px] border px-[11px] py-[6px] text-[12px] transition hover:border-white/20"
              >
                <s.icon />
                {s.label}
              </a>
            ))}
          </div>

          <p className="text-ink-faint mt-4 text-[11.5px]">
            {t('poweredBy')}{' '}
            <a
              href="https://maxcomputer.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-mid hover:text-ink underline underline-offset-2"
            >
              Max Computer
            </a>{' '}
            · maxcomputer.id &amp; Arta Ecosystem
          </p>
        </div>
      </section>

      {/* Other apps */}
      <section className="mt-8">
        <p className="label mb-1">{t('otherAppsTitle')}</p>
        <p className="text-ink-faint mb-3 text-[12px]">{t('otherAppsNote')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {OTHER_APPS.map((app) => (
            <a
              key={app.url}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="panel hover:border-lime/40 group flex items-center gap-3 transition"
            >
              <span className="bg-panel-2 border-hairline flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] border text-[18px]">
                {app.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-ink-hi group-hover:text-lime-bright text-[13px] font-semibold transition">
                  {app.name}
                </p>
                <p className="text-ink-faint truncate text-[11.5px]">{app.tagline}</p>
                <p className="text-ink-muted mt-[2px] truncate font-mono text-[10.5px]">
                  {app.url.replace('https://', '')}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mt-8">
        <p className="label mb-3">{t('disclaimerTitle')}</p>
        <ul className="panel space-y-2">
          {disclaimer.map((line, i) => (
            <li key={i} className="text-ink-faint flex gap-2 text-[12px] leading-relaxed">
              <span className="text-ink-muted select-none">—</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-hairline text-ink-faint mt-8 border-t pt-5 text-center text-[11.5px]">
        © {year} {t('footer')}
      </footer>
    </main>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25h6.826l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
