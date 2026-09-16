import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

const AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      {AUTH_ENABLED ? (
        <SignIn signUpUrl="/sign-up" />
      ) : (
        <div className="card max-w-md text-center">
          <p className="label mb-2">Auth not configured</p>
          <p className="text-ink-muted text-sm">
            Sign-in is disabled in this environment. Set a Clerk publishable key to enable accounts,
            or{' '}
            <Link href="/processors" className="text-lime-bright hover:underline">
              keep browsing
            </Link>
            .
          </p>
        </div>
      )}
    </main>
  );
}
