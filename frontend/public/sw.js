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

// 3. Fetch Event: Network-first approach with cache fallback for UI only
// (DO NOT cache API calls, which need real-time data)
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests for assets, not API calls or POSTs
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Skip API calls (don't serve cached HTML for an API error)
  if (url.pathname.startsWith('/auth') || url.pathname.startsWith('/user') || url.pathname.startsWith('/qr')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // If it's a navigation request (HTML), return index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        // Otherwise return whatever asset we have
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
