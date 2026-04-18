// Minimal Service Worker for PWA functionality and offline support
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Standard pass-through handler. 
  // Custom caching logic can be added here for specific production needs.
  event.respondWith(fetch(event.request));
});