import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that require an authenticated user. Everything else stays public so
// anonymous visitors can still browse processors, compare, and analyze
// bottlenecks (with the API enforcing tier limits per-IP).
const isProtectedRoute = createRouteMatcher(['/account(.*)']);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
};
