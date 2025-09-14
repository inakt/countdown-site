const CACHE_NAME = 'countdown-site-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './favicon.png',
  './events.json'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.map(key=>key!==CACHE_NAME && caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  e.respondWith((async()=>{
    const isStatic = e.request.url.endsWith('index.html') || e.request.url.endsWith('events.json') || e.request.url.endsWith('styles.css');
    if(isStatic){
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
    }else{
      return fetch(e.request);
    }
  })());
});
