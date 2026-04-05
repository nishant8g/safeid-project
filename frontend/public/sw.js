/* 
 * SafeID Service Worker
 * Focus: Offline medical data access & 100% stability.
 */

const CACHE_NAME = 'safeid-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/safeid-logo-192.png',
  '/safeid-logo-512.png',
  '/favicon.ico'
];

// 1. Install Event: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Service Worker: Caching critical assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

// 3. Fetch Event: Network-first approach with cache fallback
// (Better for medical apps to ensure they see LATEST data if online)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // If network fails (Offline), check cache
        return caches.match(event.request);
      })
  );
});

// 4. Background Sync (Reserved for future GPS updates)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-alerts') {
    console.log('📡 Background Syncing Emergency Alerts...');
  }
});
