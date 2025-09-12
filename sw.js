self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // data.json は常にネットワーク優先
  if(event.request.url.endsWith('data.json')){
    event.respondWith(fetch(event.request));
  } else {
    // それ以外はキャッシュ優先
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
