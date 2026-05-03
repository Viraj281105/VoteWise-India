const CACHE_NAME = 'votewise-v1';
const STATIC_ASSETS = [
  '/',
  '/styles/main.css',
  '/styles/components.css',
  '/styles/accessibility.css',
  '/js/app.js',
  '/js/timeline.js',
  '/js/quiz.js',
  '/js/chatbot.js',
  '/js/translate.js',
  '/js/tts.js',
  '/js/history.js',
  '/js/deepdive.js',
  '/js/map.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 🚫 DO NOT INTERCEPT THESE (CRITICAL FIX)
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/data') ||
    url.pathname.endsWith('.json') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/favicon.ico'
  ) {
    return;
  }

  // Cache-first strategy for UI assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
