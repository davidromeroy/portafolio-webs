/* ============================================================
   motion.js — detalles de movimiento propios de Luna Studio
   Hoy: sombra en el nav cuando la página ya scrolleó. Se hace con
   un sentinel + IntersectionObserver en vez de escuchar scroll, así
   no corre nada en cada frame.
   ============================================================ */

(function () {
  "use strict";

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
