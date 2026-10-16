/* ============================================================
   sw.js — service worker de Academia René (PWA)
   Guarda una copia del mockup para que la app instalada abra rápido
   y sin conexión. Su alcance es solo mockups/academia-rene/.
   - Las páginas (navegación) salen primero de la copia y se actualizan
     en segundo plano: cambiar de página es instantáneo. Un cambio de
     texto se ve en la apertura siguiente (o al subir CACHE, que recarga).
   - CSS, JS, fotos y tipografías salen primero de la copia. Las fotos
     no se precargan todas (son ~25 MB): se guardan al verlas.
   Al publicar cambios de CSS, JS o fotos, sube CACHE (v1 → v2): el
   teléfono borra la copia vieja al activarse la nueva.
   ============================================================ */

const CACHE = "academia-rene-v6";

// Lo mínimo para abrir sin conexión: las 10 páginas, estilos, scripts
// y las imágenes de la portada. Las URL tienen que ser iguales a las
// que pide el HTML.
const PRECACHE = [
  "./",
  "./index.html",
  "./nosotros.html",
  "./autoridades.html",
  "./maestros.html",
  "./personal.html",
  "./carreras.html",
  "./cursos.html",
  "./matricula.html",
  "./galeria.html",
  "./contacto.html",
  "./theme.css",
  "./nav-dropdown.js",
  "./events-carousel.js",
  "./carousel.js",
  "./videos.js",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/splash/marca.svg",
  "./images/logo.png",
  "./images/hero.webp",
  "../../assets/base.css",
  "../../assets/nav.js",
  "../../assets/reveal.js",
  "../../assets/instalar.js",
  "../../assets/instalar.css",
  "../../assets/whatsapp.js"
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
      Promise.all(keys.filter((k) => k.startsWith("academia-rene-") && k !== CACHE).map((k) => caches.delete(k)))
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
  // Videos: Safari los pide por partes (Range) y una copia entera rompe la
  // reproducción; además pesan demasiado para guardarlos. Siempre a la red.
  if (req.headers.has("range") || req.destination === "video" || /\.mp4$/i.test(url.pathname)) return;

  if (req.mode === "navigate") {
    // Primero la copia (cambiar de página es instantáneo, aun con mala
    // señal) y en paralelo se pide a la red para la próxima vez. Sin copia,
    // se espera a la red; sin red ni copia, la portada.
    const fresh = fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    });
    event.waitUntil(fresh.catch(() => {}));
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then(
        (hit) => hit || fresh.catch(() => caches.match("./index.html"))
      )
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
