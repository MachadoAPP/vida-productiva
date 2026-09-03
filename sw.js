/* Guarda la app en el teléfono para que abra sin internet. */
const CACHE = "vida-productiva-v9";
const BASE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", (ev) => {
  ev.waitUntil(
    caches.open(CACHE)
      // cache:"reload" salta la caché HTTP del navegador. Sin esto addAll guarda
      // en el caché nuevo los archivos viejos que el navegador aún tiene frescos:
      // el nombre del caché sube de versión pero el contenido se queda atrás, y
      // el cambio no aparece nunca. GitHub Pages sirve todo con max-age=600.
      .then((c) => c.addAll(BASE.map((u) => new Request(u, {cache: "reload"}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero lo guardado; si no está, se busca en la red y se guarda para la próxima.
self.addEventListener("fetch", (ev) => {
  if (ev.request.method !== "GET") return;
  ev.respondWith(
    caches.match(ev.request).then((hit) => {
      if (hit) return hit;
      return fetch(ev.request).then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((c) => c.put(ev.request, copia)).catch(() => {});
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
