// Guarda el mercado para jugar sin conexión. Sube VERSION al publicar cambios.
const VERSION = 'qhatu-1';
const ARCHIVOS = [
  './',
  'index.html',
  'portal.css',
  'portal.js',
  'icono.svg',
  'manifest.webmanifest',
  'shared/qhatu.css',
  'shared/almacen.js',
  'shared/anuncios.js',
  'shared/config.js',
  'shared/i18n.js',
  'shared/marca.js',
  'shared/sonido.js',
  'shared/ui.js',
  'refresquera/',
  'refresquera/index.html',
  'refresquera/refresquera.css',
  'refresquera/juego.js',
  'refresquera/logica.js',
  'refresquera/pedidos.js',
  'refresquera/sabores.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero la red; si no hay conexión, lo guardado.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const mismoSitio = new URL(e.request.url).origin === location.origin;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok && (mismoSitio || e.request.url.includes('fonts.g'))) {
          const copia = r.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copia));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
