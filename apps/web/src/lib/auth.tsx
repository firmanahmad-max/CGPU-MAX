'use client';

import {
  ClerkProvider,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  UserButton as ClerkUserButton,
  useAuth as clerkUseAuth,
  useUser as clerkUseUser,
} from '@clerk/nextjs';
import { useCallback, type ReactNode } from 'react';

// Auth is optional. When NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is unset (e.g. local
// "just run it" mode), the app boots without Clerk: core features work
// anonymously, and auth-only surfaces degrade gracefully. With the key present,
// full Clerk auth is active. This shim is the single seam for that toggle.
export const AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const clerkAppearance = {
  variables: {
    colorPrimary: '#185FA5',
    colorBackground: '#0A0E1A',
    colorText: '#F1F5F9',
    colorInputBackground: 'rgba(255,255,255,0.04)',
    borderRadius: '8px',
  },
};

export function AppAuthProvider({ children }: { children: ReactNode }) {
  if (!AUTH_ENABLED) return <>{children}</>;
  return <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>;
}

// Renders children only when a user is signed in. Anonymous mode → never.
export function SignedIn({ children }: { children: ReactNode }) {
  if (!AUTH_ENABLED) return null;
  return <ClerkSignedIn>{children}</ClerkSignedIn>;
}

// Renders children when signed out. Anonymous mode → always (treated as guest).
export function SignedOut({ children }: { children: ReactNode }) {
  if (!AUTH_ENABLED) return <>{children}</>;
  return <ClerkSignedOut>{children}</ClerkSignedOut>;
}

export function UserButton() {
  if (!AUTH_ENABLED) return null;
  return <ClerkUserButton afterSignOutUrl="/" />;
}

// AUTH_ENABLED is a build-time constant, so the branch a component takes never
// changes between renders — hook order stays stable despite the early return.
/* eslint-disable react-hooks/rules-of-hooks */
export function useAuthToken(): () => Promise<string | null> {
  if (!AUTH_ENABLED) return useCallback(async () => null, []);
  const { getToken } = clerkUseAuth();
  return useCallback(() => getToken(), [getToken]);
}

export interface CurrentUser {
  isSignedIn: boolean;
  firstName: string | null;
  username: string | null;
  email: string | null;
}

export function useCurrentUser(): CurrentUser {
  if (!AUTH_ENABLED) {
    return { isSignedIn: false, firstName: null, username: null, email: null };
  }
  const { isSignedIn, user } = clerkUseUser();
  return {
    isSignedIn: Boolean(isSignedIn),
    firstName: user?.firstName ?? null,
    username: user?.username ?? null,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
  };
}
/* eslint-enable react-hooks/rules-of-hooks */
