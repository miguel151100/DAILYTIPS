const CACHE_NAME = "tamales-daily-tips-v1";
const APP_SHELL = [
  "/apps/tamales/",
  "/apps/tamales/index.html",
  "/apps/tamales/styles.css",
  "/apps/tamales/app.js",
  "/apps/tamales/manifest.json",
  "/apps/tamales/icons/icon-192.png",
  "/apps/tamales/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("/apps/tamales/index.html"));
    })
  );
});
