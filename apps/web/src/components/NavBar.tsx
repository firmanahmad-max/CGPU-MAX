import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export function NavBar() {
  return (
    <header className="border-b border-white/5 bg-surface-dark/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-white">
          CGPU-MAX
        </Link>
        <div className="flex items-center gap-6 text-sm text-slate-300">
          <Link href="/processors">Processors</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/bottleneck">Bottleneck</Link>
          <Link href="/advisor">Advisor</Link>
          <Link href="/gaming">Gaming</Link>
          <Link href="/streaming">Streaming</Link>
          <Link href="/pricing">Pricing</Link>
          <SignedIn>
            <Link href="/account">Account</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-sm border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-label transition hover:border-white/30"
            >
              Sign in
            </Link>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}
