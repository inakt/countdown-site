const CACHE_NAME = 'countdown-site-v2';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './index.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// インストール
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // 新しい SW を即アクティブ化
});

// アクティブ化
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    ))
  );
  self.clients.claim(); // 全クライアントに新しい SW を即適用
});

// fetch イベント（ネットワーク優先、オフラインはキャッシュ）
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // events.json はキャッシュせず常に最新取得
  if(url.pathname.endsWith('events.json')) {
    event.respondWith(
      fetch(event.request, { cache:'no-store', credentials:'omit' })
      .catch(() => new Response(JSON.stringify({kouritsu:'-',shiritsu:'-',kyoutsuu:'-'}), {
        headers:{'Content-Type':'application/json'}
      }))
    );
    return;
  }

  // その他静的リソースはネットワーク優先
  event.respondWith(
    fetch(event.request, { cache:'no-store', credentials:'omit' })
      .then(res => {
        // 正常レスポンスをキャッシュ
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request)) // オフライン時はキャッシュ利用
  );
});
