/* ============================================================
   carousel.js — carrusel por categoría (usado en Galería)
   Vanilla JS, sin dependencias, solo para este mockup.

   Progressive enhancement: sin JS, [data-carousel] no recibe el
   atributo data-active y el CSS muestra todas las categorías como
   grillas completas, una debajo de otra (igual que antes), así el
   contenido nunca desaparece. Los tabs de categoría tampoco hacen
   nada sin JS, así que se ocultan (ver .no-js .gallery-tabs).

   Con JS se activa el modo carrusel: los tabs eligen qué categoría
   se ve, y dentro de la categoría activa una foto visible a la vez,
   con flechas prev/next y un contador "X / N" relativos a esa
   categoría.
   ============================================================ */

(function () {
  "use strict";

  var root = document.querySelector("[data-carousel]");
  if (!root) return;

  var tracks = [].slice.call(root.querySelectorAll("[data-carousel-track]"));
  if (tracks.length < 1) return;

  var tabs = [].slice.call(document.querySelectorAll("[data-gallery-tab]"));
  var prevBtn = root.querySelector("[data-carousel-prev]");
  var nextBtn = root.querySelector("[data-carousel-next]");
  var counter = root.querySelector("[data-carousel-counter]");

  // Estado por categoría: cada track guarda su propio índice de foto,
  // así volver a una categoría no reinicia la posición.
  var state = tracks.map(function (track) {
    return {
      track: track,
      category: track.getAttribute("data-category"),
      slides: [].slice.call(track.querySelectorAll(".gallery-item")),
      current: 0
    };
  });

  var activeIndex = 0;

  function renderTrack() {
    var entry = state[activeIndex];
    entry.slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === entry.current);
    });
    if (counter) counter.textContent = (entry.current + 1) + " / " + entry.slides.length;
  }

  function renderTracks() {
    state.forEach(function (entry, i) {
      entry.track.classList.toggle("is-current", i === activeIndex);
    });
  }

  function renderTabs() {
    var activeCategory = state[activeIndex].category;
    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-gallery-tab") === activeCategory;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  }

  function render() {
    renderTracks();
    renderTabs();
    renderTrack();
  }

  function goSlide(delta) {
    var entry = state[activeIndex];
    if (entry.slides.length < 2) return;
    entry.current = (entry.current + delta + entry.slides.length) % entry.slides.length;
    renderTrack();
  }

  function goCategory(index) {
    activeIndex = (index + state.length) % state.length;
    render();
  }

  function categoryIndexByName(name) {
    for (var i = 0; i < state.length; i++) {
      if (state[i].category === name) return i;
    }
    return -1;
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { goSlide(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { goSlide(1); });

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var idx = categoryIndexByName(tab.getAttribute("data-gallery-tab"));
      if (idx > -1) goCategory(idx);
    });

    // Flechas del teclado entre tabs (patrón estándar de role="tablist").
    tab.addEventListener("keydown", function (e) {
      var idx = tabs.indexOf(tab);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        var next = tabs[(idx + 1) % tabs.length];
        next.focus();
        next.click();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        var prev = tabs[(idx - 1 + tabs.length) % tabs.length];
        prev.focus();
        prev.click();
      }
    });
  });

  // Flechas del teclado para las fotos cuando el foco está en el carrusel.
  root.setAttribute("tabindex", "-1");
  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); goSlide(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); goSlide(1); }
  });

  root.setAttribute("data-active", "");
  render();
})();
