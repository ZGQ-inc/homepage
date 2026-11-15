const CACHE_NAME = 'zgq-homepage-cache-v1';
const OFFLINE_URL = './offline.html';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './favicon.ico',
  './logo.png',
  './logo-monochrome.png',
  './assets/images/icons/icon-192.png',
  './assets/images/icons/icon-192-maskable.png',
  './assets/images/icons/icon-512.png',
  './assets/images/icons/icon-512-maskable.png',
  './assets/css/98.css',
  './assets/css/desktop-theme.css',
  './assets/css/ms_sans_serif.woff2',
  './assets/css/ms_sans_serif_bold.woff2',
  './assets/js/desktop-os.js',
  './assets/js/win98-boot-screen.js',
  './assets/js/win98-dialog.js',
  './assets/js/win98-scrollbar.js',
  './assets/js/radio-engine.js',
  './assets/js/visualizer-app.js',
  './assets/js/neon-sunset.js',
  './assets/audio/The%20Microsoft%20Sound.wav',
  './assets/audio/DING.WAV',
  './assets/audio/CHORD.WAV',
  './assets/audio/RECYCLE.WAV'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Pre-caching asset skipped: ${url}`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass API calls, stream proxy, Cloudflare Turnstile, and live radio streams
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/stream') ||
    url.hostname.includes('challenges.cloudflare.com') ||
    url.hostname.includes('nrwmusic.stream')
  ) {
    return;
  }

  // Navigation requests (HTML documents)
  if (
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const respClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Static assets: Cache First, Network Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (event.request.url.startsWith(self.location.origin) || networkResponse.type === 'cors')
          ) {
            const respClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        });
    })
  );
});
