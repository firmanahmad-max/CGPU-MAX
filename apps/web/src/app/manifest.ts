import type { MetadataRoute } from 'next';

// PWA manifest (served at /manifest.webmanifest, auto-linked by Next).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CGPU-MAX — Hardware Intelligence',
    short_name: 'CGPU-MAX',
    description:
      'Compare CPUs & GPUs, calculate bottlenecks, and find the best hardware for your build.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#0B0C0F',
    theme_color: '#0B0C0F',
    categories: ['utilities', 'productivity'],
    lang: 'en',
    icons: [
      { src: '/pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/pwa-icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
