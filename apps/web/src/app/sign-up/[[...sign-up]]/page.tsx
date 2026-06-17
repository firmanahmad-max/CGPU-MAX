import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

const AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      {AUTH_ENABLED ? (
        <SignUp signInUrl="/sign-in" />
      ) : (
        <div className="card max-w-md text-center">
          <p className="label mb-2">Auth not configured</p>
          <p className="text-sm text-slate-400">
            Sign-up is disabled in this environment. Set a Clerk publishable key to enable accounts,
            or{' '}
            <Link href="/processors" className="text-accent-blue hover:underline">
              keep browsing
            </Link>
            .
          </p>
        </div>
      )}
    </main>
  );
}
