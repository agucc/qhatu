// Guarda el mercado para jugar sin conexión. Sube VERSION al publicar cambios.
const VERSION = 'qhatu-7';
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
  'shared/fuentes/chango-latin-400-normal.woff2',
  'shared/fuentes/chango-latin-ext-400-normal.woff2',
  'shared/fuentes/figtree-latin-400-normal.woff2',
  'shared/fuentes/figtree-latin-600-normal.woff2',
  'shared/fuentes/figtree-latin-800-normal.woff2',
  'shared/fuentes/figtree-latin-ext-400-normal.woff2',
  'shared/fuentes/figtree-latin-ext-600-normal.woff2',
  'shared/fuentes/figtree-latin-ext-800-normal.woff2',
  'refresquera/',
  'refresquera/index.html',
  'refresquera/refresquera.css',
  'refresquera/juego.js',
  'refresquera/logica.js',
  'refresquera/pedidos.js',
  'refresquera/sabores.js',
  'refresquera/botella.js',
  'refresquera/iconos.js',
  'refresquera/bebidas.js',
  'shared/paises.js',
  'saltenera/comidas.js',
  'saltenera/comida-portal.js',
  'refresquera/recetario.js',
  'shared/nativo.js',
  'shared/compartir.js',
  'shared/transferir.js',
  'shared/plataforma.js',
  'shared/compilacion.js',
  'shared/puesto.css',
  'frutera/index.html',
  'frutera/frutera.css',
  'frutera/juego.js',
  'frutera/fisica.js',
  'frutera/frutas.js',
  'aguayo/index.html',
  'aguayo/aguayo.css',
  'aguayo/juego.js',
  'aguayo/logica.js',
  'saltenera/index.html',
  'saltenera/saltenera.css',
  'saltenera/juego.js',
  'saltenera/logica.js',
  'tienda/index.html',
  'tienda/tienda.css',
  'tienda/tienda.js',
  'shared/progreso.js',
  'shared/decoracion.js',
  'shared/compras.js',
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
        if (r.ok && mismoSitio) {
          const copia = r.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copia));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
