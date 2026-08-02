// ═══════════════════════════════════════════
// Service Worker — 保质期管家
// Cache-first for static assets, network-first for navigations
// ═══════════════════════════════════════════

const CACHE_NAME = 'food-expiry-v2';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Install: pre-cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches, claim clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML (fresh content), cache-first for assets
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-http/https and chrome-extension requests
  if (!url.protocol.startsWith('http')) return;

  if (event.request.mode === 'navigate') {
    // Network-first for page navigations
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('./')))
    );
  } else {
    // Cache-first for static assets (JS, CSS, icons, manifest)
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request))
    );
  }
});
