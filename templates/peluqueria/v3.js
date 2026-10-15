/* ============================================================
   v3.js — piezas propias de la estructura v3 de Luna Studio
   1. La foto de la columna de servicios sigue al chip activo.
      Observa aria-selected en vez de escuchar clics, así funciona
      igual con mouse, teclado o cualquier cambio que haga chips.js.
   2. Flechas de la tira de trabajos: avanzan una "página" y se
      deshabilitan en los extremos. En táctil se oculta (CSS) y se
      desliza con el dedo.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. Foto de servicios ---------- */

  var photos = [].slice.call(document.querySelectorAll(".services-photo img[data-photo]"));
  var chips = [].slice.call(document.querySelectorAll(".chip[data-chip]"));

  if (photos.length && chips.length && "MutationObserver" in window) {
    var show = function () {
      var active = chips.filter(function (c) {
        return c.getAttribute("aria-selected") === "true";
      })[0];
      if (!active) return;
      photos.forEach(function (img) {
        img.classList.toggle("is-active", img.dataset.photo === active.dataset.chip);
      });
    };

    var mo = new MutationObserver(show);
    chips.forEach(function (c) {
      mo.observe(c, { attributes: true, attributeFilter: ["aria-selected"] });
    });
    show();
  }

  /* ---------- 2. Tira de trabajos ---------- */

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
