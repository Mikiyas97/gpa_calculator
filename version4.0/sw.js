const CACHE_NAME = 'gpa-calc-v4-premium';

const ASSETS = [
  '/',
  '/index.html',
  '/data.html',
  '/transcript.html',
  '/css/style.css',
  '/assets/icon.svg',
  '/manifest.json',
  
  // Modules
  '/js/home.js',
  '/js/data-view.js',
  '/js/modules/auth.js',
  '/js/modules/calculator.js',
  '/js/modules/charts.js',
  '/js/modules/chatbot.js',
  '/js/modules/firebase.js',
  '/js/modules/profile.js',
  '/js/modules/storage.js',
  '/js/modules/ui.js',

  // Libraries
  '/js/lib/chart.min.js',
  '/js/lib/jspdf.min.js',
  '/js/lib/html2canvas.js'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => {
        console.error("Cache addAll failed:", err);
      });
    })
  );
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      )
    )
  );
});

// Fetch (Network First, Falling Back to Cache for offline support)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests (they shouldn't be cached for offline unless specifically handled)
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
