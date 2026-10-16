/* ============================================================
   sw.js — service worker de FORJA Gym (PWA)
   Guarda una copia de la demo para que la app instalada abra rápido
   y sin conexión. Su alcance es solo templates/gimnasio/.
   - La página (navegación) va primero a la red: los cambios
     publicados se ven enseguida; sin señal, sale la copia.
   - CSS, JS, fotos y tipografías salen primero de la copia.
   Al publicar cambios de CSS, JS o fotos, sube CACHE (v1 → v2): el
   teléfono borra la copia vieja al activarse la nueva.
   ============================================================ */

const CACHE = "forja-v3";

// Lo mínimo para abrir sin conexión. Las URL tienen que ser iguales a
// las que pide el HTML (theme.css va con su ?v=).
const PRECACHE = [
  "./",
  "./index.html",
  "./theme.css?v=2026-10-15",
  "./pestanas.js",
  "./motion.js",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/splash/marca.svg",
  "./images/hero-800.webp",
  "./images/hero-1600.webp",
  "../../assets/base.css",
  "../../assets/nav.js",
  "../../assets/reveal.js",
  "../../assets/instalar.js",
  "../../assets/instalar.css"
];

// Tipografías de Google: se guardan la primera vez que se usan.
const FONT_HOSTS = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith("forja-") && k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = FONT_HOSTS.includes(url.origin);
  if (!sameOrigin && !isFont) return; // WhatsApp, mapa, etc.: siempre a la red

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok || res.type === "opaque") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
