const CACHE_NAME = 'gpa-calc-v6';

const ASSETS = [
  './',
  './index.html',
  './print.html',
  './transcript.html',
  './style.css',
  './script.js',
  './icon.svg',
  './manifest.json',

  // LOCAL libraries (IMPORTANT)
  './js/chart.min.js',
  './js/jspdf.min.js',
  './js/html2canvas.js'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
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

// Fetch (Cache First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
