const CACHE_NAME = "countdown-cache-v1";
const URLS = ["index.html","manifest.json","sw.js","data.json"];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(URLS)));
});

self.addEventListener("fetch", e=>{
  e.respondWith(caches.match(e.request).then(r=>r || fetch(e.request)));
});

