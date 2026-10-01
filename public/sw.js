const CACHE_NAME = "paymerch-cache-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/favicon.png",
  "/mlogopaymerch.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ASSETS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin && request.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        const cached = await caches.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        if (response && response.status === 200 && request.url.startsWith(self.location.origin)) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        return caches.match(request) || caches.match("/") || caches.match("/index.html");
      }
    })(),
  );
});
