'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { SignedIn, SignedOut } from '@/lib/auth';

interface RailItem {
  href: string;
  abbr: string;
  key: string;
}

// Icon rail — 2-letter marks, tooltip carries the localized name.
const ITEMS: RailItem[] = [
  { href: '/processors', abbr: 'KT', key: 'processors' },
  { href: '/rankings', abbr: 'RK', key: 'rankings' },
  { href: '/compare', abbr: 'VS', key: 'compare' },
  { href: '/bottleneck', abbr: 'BN', key: 'bottleneck' },
  { href: '/advisor', abbr: 'AI', key: 'advisor' },
  { href: '/gaming', abbr: 'GM', key: 'gaming' },
  { href: '/streaming', abbr: 'ST', key: 'streaming' },
  { href: '/pricing', abbr: '$', key: 'pricing' },
];

export function Rail() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <div className="border-hairline bg-panel-2 flex flex-col items-center gap-[22px] border-r py-[18px]">
      <Link
        href="/"
        title="CGPU-MAX"
        className="bg-lime font-display text-lime-ink flex h-[30px] w-[30px] items-center justify-center rounded-[9px] text-[13px] font-extrabold"
      >
        C
      </Link>

      <nav className="flex flex-col items-center gap-1">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              title={t(item.key)}
              className={
                'flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border font-mono text-[10px] font-semibold tracking-[0.04em] transition ' +
                (active
                  ? 'border-lime/40 bg-lime/[0.16] text-lime-bright'
                  : 'text-ink-muted hover:text-ink border-transparent hover:bg-white/5')
              }
            >
              {item.abbr}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-2">
        <Link
          href="/tentang"
          title={t('about')}
          className={
            'flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border font-mono text-[12px] font-semibold transition ' +
            (pathname.startsWith('/tentang')
              ? 'border-lime/40 bg-lime/[0.16] text-lime-bright'
              : 'text-ink-faint hover:text-ink border-white/10 hover:bg-white/5')
          }
        >
          i
        </Link>
        <SignedIn>
          <Link
            href="/account"
            title={t('account')}
            className={
              'rounded-pill bg-panel-3 text-ink-faint hover:text-ink flex h-[30px] w-[30px] items-center justify-center border border-white/10 font-mono text-[11px] font-semibold transition ' +
              (pathname.startsWith('/account') ? 'ring-lime/40 ring-1' : '')
            }
          >
            FA
          </Link>
        </SignedIn>
        <SignedOut>
          <Link
            href="/sign-in"
            title={t('signIn')}
            className="rounded-pill bg-panel-3 text-ink-faint hover:text-ink flex h-[30px] w-[30px] items-center justify-center border border-white/10 font-mono text-[11px] font-semibold transition"
          >
            in
          </Link>
        </SignedOut>
      </div>
    </div>
  );
}
