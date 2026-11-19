// ===== Mavick Club service worker =====
// This file runs in the background and keeps a copy of the app on the phone,
// so it opens even with no internet.

// Change this name (v2, v3...) every time you update the app,
// so phones throw away the old copy and download the new one.
const CACHE = 'mavick-club-v16';

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
  './dale.jpg.png',
  './fonts/jakarta-400.woff2',
  './fonts/jakarta-500.woff2',
  './fonts/jakarta-600.woff2',
  './fonts/jakarta-700.woff2',
  './fonts/jakarta-800.woff2',
  './fonts/slab-800.woff2',
  './fonts/slab-900.woff2',
  // celebration song for the podium
  './audio/celebration.mp3',
  './celebration.mp3'          // backup spot, in case it was uploaded without the folder
];

// 1) INSTALL: the first time someone opens the link, download all files into the cache
self.addEventListener('install', event => {
  // Save each file one by one. If one file is missing (404), skip it
  // instead of failing the WHOLE update (addAll fails if even one file is missing).
  event.waitUntil(caches.open(CACHE).then(cache =>
    Promise.all(FILES.map(f => cache.add(f).catch(() => console.warn('Missing file:', f))))
  ));
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

// 3) FETCH:
//    - The app page itself (index.html): try the INTERNET first, so a new
//      version shows right away when you're online. Save it to the cache too.
//      If there's no internet, use the saved copy (still works offline).
//    - Everything else (photos, fonts, icons): use the cache first (fast).
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {            // opening the app / the page
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const copy = res.clone();                     // keep a copy for offline use
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;                                   // show the fresh page
        })
        .catch(() => caches.match('./index.html'))      // offline: saved page
    );
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached =>
      cached || fetch(event.request))
  );
});
