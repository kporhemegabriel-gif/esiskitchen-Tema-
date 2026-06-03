// ============================================
// Esi's Kitchen (Tema) - Service Worker
// VERSION: v1 — change this when you update the site
// ============================================
var CACHE_NAME = 'esiskitchen-tema-v1';
var URLS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js',
];

// Install: cache key files
self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function(event){
  // Skip non-GET and Firebase requests (always need fresh data)
  if(event.request.method !== 'GET') return;
  if(event.request.url.includes('firebaseio.com') ||
     event.request.url.includes('googleapis.com/identitytoolkit') ||
     event.request.url.includes('sms.arkesel.com')) return;

  event.respondWith(
    fetch(event.request).then(function(response){
      // Cache a copy of good responses
      if(response && response.status === 200){
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, copy);
        });
      }
      return response;
    }).catch(function(){
      // Network failed — serve from cache
      return caches.match(event.request);
    })
  );
});
