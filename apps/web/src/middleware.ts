import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Auth is optional (see src/lib/auth.tsx). When the Clerk publishable key is
// unset, skip Clerk entirely so the app runs without any third-party secrets.
const AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const isProtectedRoute = createRouteMatcher(['/account(.*)']);

const enabledMiddleware = clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export default AUTH_ENABLED ? enabledMiddleware : () => NextResponse.next();

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
};
