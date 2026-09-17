// CGPU-MAX service worker — installability + a cached app shell for offline.
// Deliberately conservative: static assets are cache-first; navigations are
// network-first (so data stays fresh) with an offline fallback; the API
// (cross-origin) is never intercepted.
const CACHE = 'cgpu-max-v1';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, '/pwa-icon.svg']))
      .catch(() => {}),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Never handle cross-origin requests (e.g. the API on another host).
  if (url.origin !== self.location.origin) return;

  // Build output and icons: cache-first.
  const isStatic =
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/pwa-icon') ||
    url.pathname === '/icon.svg' ||
    url.pathname === '/manifest.webmanifest';
  if (isStatic) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // Page navigations: network-first, fall back to cache then the offline page.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match(req)) || (await cache.match(OFFLINE_URL)) || Response.error();
        }
      })(),
    );
  }
});
