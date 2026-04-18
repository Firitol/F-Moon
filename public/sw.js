// Simple Service Worker for F-Moon PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch for now to satisfy PWA requirements without caching issues
  event.respondWith(fetch(event.request));
});