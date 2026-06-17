import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';

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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#185FA5',
          colorBackground: '#0A0E1A',
          colorText: '#F1F5F9',
          colorInputBackground: 'rgba(255,255,255,0.04)',
          borderRadius: '8px',
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="min-h-screen bg-surface-dark font-sans text-slate-100 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
