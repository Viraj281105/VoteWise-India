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

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }
  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
