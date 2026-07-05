// Minimal passthrough service worker — no offline caching, just satisfies
// the "installable PWA" requirement for the Android TWA wrapper.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
