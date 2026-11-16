const V='al-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 const r=e.request; if(r.method!=='GET')return; const u=new URL(r.url);
 const ok=u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.host); if(!ok)return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(ca=>ca.put(r,c));return x}).catch(()=>caches.match(r).then(h=>h||caches.match('index.html'))));return}
 e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(x=>{if(x&&x.status===200){const c=x.clone();caches.open(V).then(ca=>ca.put(r,c))}return x}).catch(()=>hit);return hit||net}));
});
