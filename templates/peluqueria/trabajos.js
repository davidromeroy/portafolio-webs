/* ============================================================
   trabajos.js — flechas de la tira de trabajos (Luna Studio)
   Avanzan una "página" y se deshabilitan en los extremos. En
   táctil las flechas se ocultan (CSS) y se desliza con el dedo.
   ============================================================ */

(function () {
  "use strict";

  var track = document.querySelector("[data-work-track]");
  var prev = document.querySelector("[data-work-prev]");
  var next = document.querySelector("[data-work-next]");
  if (!track || !prev || !next) return;

  function page() {
    // Avanza lo visible menos una tarjeta, para que siempre quede
    // una de referencia y no se pierda el hilo.
    var first = track.querySelector(".gallery-item");
    var card = first ? first.getBoundingClientRect().width + 11 : 300;
    return Math.max(card, track.clientWidth - card);
  }

  function update() {
    var max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  prev.addEventListener("click", function () {
    track.scrollBy({ left: -page(), behavior: reduce ? "auto" : "smooth" });
  });
  next.addEventListener("click", function () {
    track.scrollBy({ left: page(), behavior: reduce ? "auto" : "smooth" });
  });

  var ticking = false;
  track.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { update(); ticking = false; });
  }, { passive: true });

  window.addEventListener("resize", update);
  update();
})();
