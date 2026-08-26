/* ============================================================
   reveal.js — fade-up al entrar en viewport
   Vanilla JS, sin dependencias. Compartido por los 5 templates.

   Uso: class="reveal" en un elemento, o class="reveal-stagger"
   en un contenedor para escalonar sus hijos directos.
   ============================================================ */

(function () {
  "use strict";

  // El CSS deja el contenido oculto asumiendo que este script corre.
  // Si algo falla antes de tiempo, .no-js lo devuelve a visible.
  document.documentElement.classList.remove("no-js");

  var targets = document.querySelectorAll(".reveal, .reveal-stagger");
  if (!targets.length) return;

  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !("IntersectionObserver" in window)) {
    [].forEach.call(targets, function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // una sola vez
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );

  [].forEach.call(targets, function (el) {
    observer.observe(el);
  });
})();
