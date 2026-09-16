'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { useCurrency } from '@/lib/currency-context';

// Route → nav translation key, for the section title.
const SECTION: Record<string, string> = {
  '/processors': 'processors',
  '/rankings': 'rankings',
  '/compare': 'compare',
  '/bottleneck': 'bottleneck',
  '/advisor': 'advisor',
  '/gaming': 'gaming',
  '/streaming': 'streaming',
  '/pricing': 'pricing',
  '/account': 'account',
};

function sectionKey(pathname: string): string | null {
  if (pathname === '/') return null;
  const hit = Object.keys(SECTION).find((p) => pathname === p || pathname.startsWith(p + '/'));
  return hit ? (SECTION[hit] ?? null) : null;
}

export function TopBar() {
  const t = useTranslations('nav');
  const tc = useTranslations('console');
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();

  const key = sectionKey(pathname);
  const title = key ? t(key) : 'CGPU-MAX';

  const curBtn = (active: boolean) =>
    'cursor-pointer rounded-pill px-[11px] py-[3px] font-mono text-[11px] font-semibold transition ' +
    (active ? 'bg-lime text-lime-ink' : 'text-ink-faint hover:text-ink');

  return (
    <div className="border-hairline flex items-center gap-4 border-b px-[22px] py-[14px]">
      <Link href="/" className="font-display text-ink-hi text-[15px] font-bold tracking-tight">
        {title}
      </Link>

      <Link
        href="/processors"
        className="border-hairline bg-panel text-ink-muted ml-[14px] hidden max-w-[420px] flex-1 items-center gap-2 rounded-[9px] border px-[11px] py-[7px] transition hover:border-white/20 sm:flex"
      >
        <span className="font-mono text-[11px]">⌘K</span>
        <span className="truncate text-[12.5px]">{tc('searchHint')}</span>
      </Link>

      <div className="ml-auto flex items-center gap-[10px]">
        <span className="rounded-pill border-hairline bg-panel text-ink-faint hidden items-center gap-[6px] border px-[10px] py-[5px] font-mono text-[11px] md:inline-flex">
          <span className="rounded-pill bg-lime h-[6px] w-[6px]" />
          {tc('dataFresh')}
        </span>

        <span className="rounded-pill border-hairline bg-panel inline-flex items-center gap-[2px] border p-[3px]">
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            title="Tampilkan harga dalam dolar AS"
            className={curBtn(currency === 'USD')}
          >
            $
          </button>
          <button
            type="button"
            onClick={() => setCurrency('IDR')}
            title="Kurs acuan Rp16.300 per USD"
            className={curBtn(currency === 'IDR')}
          >
            Rp
          </button>
        </span>

        <LocaleSwitcher />

        <button
          type="button"
          className="rounded-control bg-lime text-lime-ink px-[13px] py-[6px] text-[12.5px] font-semibold transition hover:brightness-110"
        >
          {tc('share')}
        </button>
      </div>
    </div>
  );
}
