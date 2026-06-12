const CACHE_NAME = 'agrivision-v1';
const STATIC_ASSETS = ['/', '/index.html', '/logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Always fetch API calls from network
  if (request.url.includes('/api/')) {
    event.respondWith(fetch(request));
    return;
  }
  // For navigation requests, serve index.html (React Router)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }
  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
