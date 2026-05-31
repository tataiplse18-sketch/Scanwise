// ScanWise Service Worker - Cache First Strategy
const CACHE_NAME = "scanwise-v1";
const STATIC_ASSETS = [
  "/",
  "/home",
  "/scan",
  "/login",
  "/manifest.json",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache first for static, network first for API
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Supabase and API calls
  if (
    url.hostname.includes("supabase") ||
    url.hostname.includes("openfoodfacts") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cached, but also update cache in background
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
            }
          })
          .catch(() => {});
        return cached;
      }

      // Not in cache, fetch from network
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          if (request.destination === "document") {
            return caches.match("/home");
          }
        });
    })
  );
});
