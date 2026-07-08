import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { SignedIn, SignedOut, UserButton } from '@/lib/auth';

import { LocaleSwitcher } from './LocaleSwitcher';

export function NavBar() {
  const t = useTranslations('nav');

  return (
    <header className="bg-surface-dark/80 border-b border-white/5 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-white">
          CGPU-MAX
        </Link>
        <div className="flex items-center gap-6 text-sm text-slate-300">
          <Link href="/processors">{t('processors')}</Link>
          <Link href="/rankings">{t('rankings')}</Link>
          <Link href="/compare">{t('compare')}</Link>
          <Link href="/bottleneck">{t('bottleneck')}</Link>
          <Link href="/advisor">{t('advisor')}</Link>
          <Link href="/gaming">{t('gaming')}</Link>
          <Link href="/streaming">{t('streaming')}</Link>
          <Link href="/pricing">{t('pricing')}</Link>
          <SignedIn>
            <Link href="/account">{t('account')}</Link>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className="tracking-label rounded-sm border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase transition hover:border-white/30"
            >
              {t('signIn')}
            </Link>
          </SignedOut>
          <LocaleSwitcher />
        </div>
      </nav>
    </header>
  );
}
