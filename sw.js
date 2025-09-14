const CACHE_NAME = 'countdown-site-offline-v1';
const urlsToCache = [
  './',               // index.html をキャッシュ → オフライン時に日付も残る
  './styles.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // ネットワーク優先
  event.respondWith(
    fetch(event.request, { cache:'no-store', credentials:'omit' })
      .catch(() => caches.match(event.request))
  );
});
