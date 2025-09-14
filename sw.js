const CACHE_NAME = 'countdown-site-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// --- インストール時に基本ファイルをキャッシュ ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// --- 古いキャッシュ削除 ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    ))
  );
  self.clients.claim();
});

// --- フェッチ時処理（ネットワーク優先 + オフライン対応 + 404回避） ---
self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const requestURL = new URL(event.request.url);

    // 静的ファイルはキャッシュ優先
    if (urlsToCache.includes(requestURL.pathname)) {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      try {
        const networkResponse = await fetch(event.request, { cache: 'no-store', credentials: 'omit' });
        const cache = await caches.open(CACHE_NAM_
