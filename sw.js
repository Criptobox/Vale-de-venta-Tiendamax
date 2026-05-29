// Vale del Gestor — Tienda Max · Service Worker
const CACHE = 'vale-max-v9';
const ASSETS = [
  '/Vale-de-venta-Tiendamax/',
  '/Vale-de-venta-Tiendamax/index.html',
  '/Vale-de-venta-Tiendamax/pedido.html',
  '/Vale-de-venta-Tiendamax/manifest.json',
  '/Vale-de-venta-Tiendamax/icon-192.png',
  '/Vale-de-venta-Tiendamax/icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Network-first para HTML (siempre la versión más fresca si hay red),
  // cache-first para el resto (íconos, manifest).
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request).then(r => r || caches.match('/Vale-de-venta-Tiendamax/index.html')))
    );
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
