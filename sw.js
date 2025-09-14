const CACHE_NAME = 'countdown-site-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// インストール
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urlsToCache)));
  self.skipWaiting();
});

// アクティベート
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.map(k=>k!==CACHE_NAME?caches.delete(k):null)
    ))
  );
  self.clients.claim();
});

// フェッチ
self.addEventListener('fetch', e=>{
  e.respondWith((async ()=>{
    const reqURL = new URL(e.request.url);
    const isStatic = urlsToCache.includes(reqURL.pathname.split('/').pop()) || reqURL.pathname.endsWith('/');

    if(isStatic){
      const cached = await caches.match(e.request);
      if(cached) return cached;
      try{
        const net = await fetch(e.request,{cache:'no-store',credentials:'omit'});
        const c = await caches.open(CACHE_NAME);
        c.put(e.request, net.clone());
        return net;
      }catch{
        return new Response('オフライン中です',{status:503,statusText:'Service Unavailable'});
      }
    }

    // 動的リクエストはネットワーク優先
    try{
      const net = await fetch(e.request,{cache:'no-store',credentials:'omit'});
      const c = await caches.open(CACHE_NAME);
      c.put(e.request, net.clone());
      return net;
    }catch{
      const cached = await caches.match(e.request);
      if(cached) return cached;
      return new Response('オフライン中です',{status:503,statusText:'Service Unavailable'});
    }
  })());
});
