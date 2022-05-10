const staticCacheStorage = 'patronus-static-assets-v1';

const assetsInfo = [
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap',
];

// Listen to service worker install event
self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches
      .open(staticCacheStorage)
      .then(async (cache) => {
        try {
          await cache.addAll(assetsInfo);
        } catch (e) {
          console.error('cache add failed', e);
        }
      })
      .catch((err) => {
        console.error(err, 'cache open failed');
      }),
  );
});

// Listen to fetch
self.addEventListener('fetch', (ev) => {
  if (
    ev?.request?.url.includes('/api') ||
    ev?.request?.url.includes('/_next')
  ) {
    return;
  }

  ev.respondWith(
    caches.match(ev?.request).then((cacheResponse) => {
      return cacheResponse || fetch(ev.request);
    }),
  );
});
