self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open('ua-v1').then(c=>c.addAll([
    './',
    './index.html',
    './manifest.json'
  ])));
});
self.addEventListener('activate', (e)=>{ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if (url.origin === location.origin){
    e.respondWith(caches.match(e.request).then(res=>res||fetch(e.request).then(r=>{ const copy=r.clone(); caches.open('ua-v1').then(c=>c.put(e.request, copy)); return r; }).catch(()=>caches.match('./index.html'))));
  }
});
