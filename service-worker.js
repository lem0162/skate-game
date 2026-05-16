// SKATE service worker
// Caches the app shell so it loads offline and qualifies as an installable PWA.

const CACHE_NAME = 'skate-v1';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

// On install — pre-cache the app shell, then activate immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// On activate — clean up old caches, take control of open pages
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// On fetch — cache-first for same-origin, network-first for fonts (so updates land)
self.addEventListener('fetch', event => {
  const req = event.request;
  // Only handle GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Google Fonts: network-first, fall back to cache if offline
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return resp;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // App shell: cache-first
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      // Cache any new same-origin GETs for offline use
      if (url.origin === self.location.origin) {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
      }
      return resp;
    })).catch(() => caches.match('./index.html'))
  );
});
