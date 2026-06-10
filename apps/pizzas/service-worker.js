const CACHE_NAME = "pizzas-daily-tips-v1";
const APP_SHELL = [
  "/apps/pizzas/",
  "/apps/pizzas/index.html",
  "/apps/pizzas/styles.css",
  "/apps/pizzas/app.js",
  "/apps/pizzas/manifest.json",
  "/apps/pizzas/icons/icon-192.png",
  "/apps/pizzas/icons/icon-512.png"
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
        .catch(() => caches.match("/apps/pizzas/index.html"));
    })
  );
});
