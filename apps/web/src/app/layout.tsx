import type { Metadata } from 'next';

import { AppAuthProvider } from '@/lib/auth';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'CGPU-MAX — Hardware Intelligence Platform',
    template: '%s · CGPU-MAX',
  },
  description:
    'Professional CPU & GPU comparison, bottleneck analysis, and AI-driven build recommendations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface-dark min-h-screen font-sans text-slate-100 antialiased">
        <AppAuthProvider>{children}</AppAuthProvider>
      </body>
    </html>
  );
}
