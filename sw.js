// ===== Mavick Club service worker =====
// This file runs in the background and keeps a copy of the app on the phone,
// so it opens even with no internet.

// Change this name (v2, v3...) every time you update the app,
// so phones throw away the old copy and download the new one.
const CACHE = 'mavick-club-v6';

// Every file the app needs to run offline
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/logo.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // player photos
  './marivick.jpg',
  './pam.jpg',
  './jolo.jpg',
  './andrei.jpg',
  './clarenz.jpg',
  './marah.jpg',
  './maltha.jpg',
  './julian.jpg',
  './dale.jpg',
  './fonts/jakarta-400.woff2',
  './fonts/jakarta-500.woff2',
  './fonts/jakarta-600.woff2',
  './fonts/jakarta-700.woff2',
  './fonts/jakarta-800.woff2',
  './fonts/slab-800.woff2',
  './fonts/slab-900.woff2'
];

// 1) INSTALL: the first time someone opens the link, download all files into the cache
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting(); // activate right away instead of waiting for tabs to close
});

// 2) ACTIVATE: delete caches from older versions of the app
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim(); // take control of the open app immediately
});

// 3) FETCH: whenever the app asks for a file, serve it from the cache first.
//    Only go to the internet if it isn't cached (so it works offline).
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached =>
      cached || fetch(event.request).catch(() => caches.match('./index.html')))
  );
});
