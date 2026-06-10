const CACHE_NAME = "pasteles-daily-tips-v1";
const APP_SHELL = [
  "/apps/pasteles/",
  "/apps/pasteles/index.html",
  "/apps/pasteles/styles.css",
  "/apps/pasteles/app.js",
  "/apps/pasteles/manifest.json",
  "/apps/pasteles/icons/icon-192.png",
  "/apps/pasteles/icons/icon-512.png"
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
        .catch(() => caches.match("/apps/pasteles/index.html"));
    })
  );
});
