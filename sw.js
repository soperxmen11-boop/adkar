// Simple cache-first service worker for offline support
const CACHE = 'adhkari-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './data/adhkar.json',
  './data/quran.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      }).catch(() => {
        // Offline fallback for navigations
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});


/* Runtime caching for audio (cdn.islamic.network) */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method === 'GET' && url.hostname.includes('islamic.network')) {
    event.respondWith(
      caches.open('adhkari-v1').then(async cache => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const resp = await fetch(event.request, {mode:'cors'});
          cache.put(event.request, resp.clone());
          return resp;
        } catch(e){ return new Response('', {status:504}); }
      })
    );
  }
});
