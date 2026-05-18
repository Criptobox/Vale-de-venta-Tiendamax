const CACHE = 'tiendamax-v3';
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
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // No cachear requests externos (raw.githubusercontent, tasas.eltoque, etc.)
  if (!e.request.url.startsWith(self.location.origin)) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('/Vale-de-venta-Tiendamax/')))
  );
});
