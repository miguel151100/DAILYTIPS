const CACHE_NAME = "tamales-daily-tips-v8";
const APP_SHELL = [
  "/apps/tamales/",
  "/apps/tamales/index.html",
  "/apps/tamales/styles.css",
  "/apps/tamales/styles.css?v=8",
  "/apps/tamales/app.js",
  "/apps/tamales/app.js?v=8",
  "/apps/tamales/manifest.json",
  "/apps/tamales/icons/icon-192.png",
  "/apps/tamales/icons/icon-512.png",
  "/apps/tamales/images/foto-coccion-vaporera.jpg",
  "/apps/tamales/images/foto-torta-tamal-venta.jpg",
  "/apps/tamales/images/foto-preparacion-masa.jpg",
  "/apps/tamales/images/foto-tamal-abierto-vapor.jpg",
  "/apps/tamales/images/foto-salsas-proceso.jpg",
  "/apps/tamales/images/tamales-rojos.png",
  "/apps/tamales/images/tamales-verdes.png",
  "/apps/tamales/images/tamales-rajas.png",
  "/apps/tamales/images/tamales-dulces.png",
  "/apps/tamales/images/tamales-oaxaquenos.png",
  "/apps/tamales/images/paquete-tamales-venta.png"
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
