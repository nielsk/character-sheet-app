(()=>{var n="2.3.0";var i={cacheName:n,staticCacheItems:["/index.html","/index.js","/styles.css","/"]};self.addEventListener("install",e=>{function t(){return caches.open(i.cacheName).then(r=>r.addAll(i.staticCacheItems))}e.waitUntil(t(e).then(()=>self.skipWaiting()))});self.addEventListener("activate",function(e){let t=[i.cacheName];e.waitUntil(caches.keys().then(function(r){return Promise.all(r.map(function(s){if(t.indexOf(s)===-1)return caches.delete(s)}))}).then(()=>self.clients.claim()))});self.addEventListener("fetch",e=>{if(e.request.method==="POST"){fetch(e.request);return}e.respondWith(caches.match(e.request).then(function(t){return t||fetch(e.request).then(function(r){return caches.open(i.cacheName).then(function(s){return s.put(e.request,r.clone()),r})})}).catch(function(t){console.log("Service worker fetch failed.")}))});})();
//# sourceMappingURL=service_worker.js.map
