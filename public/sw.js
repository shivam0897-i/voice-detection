// VoiceGuard Service Worker - Resilient Offline Support
const CACHE_NAME = 'voiceguard-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json',
];

function isApiRequest(url) {
  return url.includes('/api/') || url.includes('/v1/') || url.includes('huggingface.co');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    )),
  );
  self.clients.claim();
});

// Network-first for navigations and static assets to avoid stale JS after deploy.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  if (isApiRequest(request.url)) {
    return;
  }

  event.respondWith((async () => {
    try {
      const networkResponse = await fetch(request);

      if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
      }

      return networkResponse;
    } catch {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      if (request.mode === 'navigate') {
        return caches.match('/index.html');
      }

      return new Response('Offline', {
        status: 503,
        statusText: 'Offline',
      });
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
