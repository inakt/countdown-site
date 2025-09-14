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

// --- フェッチ時処理（ネットワーク優先 + オフライン対応） ---
self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      try {
        // ネットワーク優先、Cookieは送信しない
        const networkResponse = await fetch(event.request, { cache: "no-store", credentials: "omit" });
        // 成功したらキャッシュを更新
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch (err) {
        // ネットワーク失敗時はキャッシュから返す
        const cachedResponse = await caches.match(event.request);
        if(cachedResponse) return cachedResponse;
        // キャッシュもなければエラー
        return new Response('オフライン中です', { status: 503, statusText: 'Service Unavailable' });
      }
    })()
  );
});
