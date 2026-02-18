const CACHE_NAME = 'meus-links-v3';
const BASE_PATH = '/paineladm/';

const STATIC_ASSETS = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'admin.html',
  BASE_PATH + 'css/style.css',
  BASE_PATH + 'js/app.js',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'icons/icon-72x72.png',
  BASE_PATH + 'icons/icon-96x96.png',
  BASE_PATH + 'icons/icon-128x128.png',
  BASE_PATH + 'icons/icon-144x144.png',
  BASE_PATH + 'icons/icon-152x152.png',
  BASE_PATH + 'icons/icon-192x192.png',
  BASE_PATH + 'icons/icon-384x384.png',
  BASE_PATH + 'icons/icon-512x512.png'
];

// Instalação
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => console.log('Erro no cache:', err))
  );
  self.skipWaiting();
});

// Ativação
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - Estratégia Cache First
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET
  if (event.request.method !== 'GET') return;
  
  // Ignora requisições de outros domínios
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch(() => {
            // Fallback para offline
            if (event.request.mode === 'navigate') {
              return caches.match(BASE_PATH + 'index.html');
            }
          });
      })
  );
});
