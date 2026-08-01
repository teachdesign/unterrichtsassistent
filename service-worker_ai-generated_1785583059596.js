const CACHE_NAME = 'ua-cache-v1';
const OFFLINE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './service-worker.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkRes => {
        const resClone = networkRes.clone();
        caches.open(CACHE_NAME).then(cache => {
          // Nur gleiche-Origin cachen
          try { if (new URL(req.url).origin === location.origin) cache.put(req, resClone); } catch(e) {}
        });
        return networkRes;
      }).catch(() => cached || caches.match('./index.html'));
      return cached || fetchPromise;
    })
  );
});
