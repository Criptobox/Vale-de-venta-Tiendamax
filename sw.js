const CACHE = 'tiendamax-v4';
const ARCHIVOS = [
  '/Vale-de-venta-Tiendamax/',
  '/Vale-de-venta-Tiendamax/index.html',
  '/Vale-de-venta-Tiendamax/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  // No cachear requests externos (raw.githubusercontent, tasas.eltoque, etc.)
  if (!e.request.url.startsWith(self.location.origin)) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Para archivos locales: network-first (siempre la versión más nueva)
  e.respondWith(
    fetch(e.request)
      .then(function(res) {
        // Guardar en cache la versión nueva
        if (res.ok) {
          var clone = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return res;
      })
      .catch(function() {
        // Si no hay red, usar cache
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match('/Vale-de-venta-Tiendamax/');
        });
      })
  );
});
