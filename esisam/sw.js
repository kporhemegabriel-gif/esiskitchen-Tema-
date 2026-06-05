// ============================================
// Esi's Kitchen (Tema) (Tema) - Service Worker
// VERSION: v2 - Added Push Notifications
// ============================================
var CACHE_NAME = 'esiskitchen-tema-v2';
var URLS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  if(event.request.url.includes('firebaseio.com') ||
     event.request.url.includes('fcm.googleapis.com') ||
     event.request.url.includes('sms.arkesel.com')) return;
  event.respondWith(
    fetch(event.request).then(function(response){
      if(response && response.status === 200){
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
      }
      return response;
    }).catch(function(){ return caches.match(event.request); })
  );
});

// Handle push notifications
self.addEventListener('push', function(event){
  var data = event.data ? event.data.json() : {};
  var title = data.notification ? data.notification.title : "Esi's Kitchen (Tema)";
  var body = data.notification ? data.notification.body : "You have a new notification";
  var icon = data.notification ? data.notification.icon : './logo.png';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      badge: './logo.png',
      vibrate: [200, 100, 200],
      data: { url: data.data ? data.data.url : './' }
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || './')
  );
});
