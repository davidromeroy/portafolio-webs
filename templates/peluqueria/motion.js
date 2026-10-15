/* ============================================================
   motion.js — detalles de movimiento propios de Luna Studio
   - Botón "volver arriba" (scroll con rAF, pasivo).
   - Sombra en el nav cuando la página ya scrolleó: sentinel +
     IntersectionObserver en vez de escuchar scroll.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Volver arriba ----------
     Aparece pasada una pantalla y media. Fuera de pantalla queda con
     tabindex=-1 para que el teclado no lo encuentre invisible. */
  var toTop = document.querySelector("[data-to-top]");
  if (toTop) {
    var shown = false;
    var check = function () {
      var want = window.scrollY > window.innerHeight * 1.5;
      if (want === shown) return;
      shown = want;
      toTop.classList.toggle("is-visible", want);
      toTop.setAttribute("tabindex", want ? "0" : "-1");
    };
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { check(); ticking = false; });
    }, { passive: true });
    check();

    toTop.addEventListener("click", function () {
      var reduce = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      // El foco vuelve al inicio, no se queda en un botón que desaparece.
      var home = document.querySelector(".brand");
      if (home) home.focus({ preventScroll: true });
    });
  }

  /* ---------- Sombra del nav ---------- */

  var nav = document.querySelector(".site-nav");
  if (!nav || !("IntersectionObserver" in window)) return;

  var sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none;";
  document.body.insertBefore(sentinel, document.body.firstChild);

  new IntersectionObserver(function (entries) {
    nav.classList.toggle("is-scrolled", !entries[0].isIntersecting);
  }).observe(sentinel);
})();
