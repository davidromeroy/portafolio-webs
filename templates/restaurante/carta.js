/* ============================================================
   carta.js — pestañas de la carta (La Parrilla del Sur)
   Patrón "tabs" de WAI-ARIA con activación automática: flechas
   izquierda/derecha, Inicio y Fin mueven el foco y muestran el panel.
   Sin JS no se agrega .is-ready y los cuatro paneles se ven seguidos.
   ============================================================ */

(function () {
  "use strict";

  var root = document.querySelector("[data-tabs]");
  if (!root) return;

  var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (tab) {
    return document.getElementById(tab.getAttribute("aria-controls"));
  });

  function select(index, focus) {
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    if (focus) tabs[index].focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      select(i, false);
    });

    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      select(next, true);
    });
  });

  root.classList.add("is-ready");
  select(0, false);

  /* ---------- Vista grande del plato (escritorio) ----------
     Dos <img> apiladas: la nueva foto carga en la oculta y se cruza
     con la visible, así el cambio no parpadea mientras baja la imagen. */

  var preview = root.querySelector(".carta-preview");
  if (!preview) return;
  var frames = [].slice.call(preview.querySelectorAll("img"));
  var caption = preview.querySelector("figcaption");
  var current = frames[0].getAttribute("src");
  var on = 0;

  function show(item) {
    var src = item.getAttribute("data-photo");
    if (!src || src === current) return;
    current = src;
    var next = frames[1 - on];
    var name = item.querySelector("h4");
    var prevShown = root.querySelector(".menu-item.is-showing");
    if (prevShown) prevShown.classList.remove("is-showing");
    item.classList.add("is-showing");
    var swap = function () {
      frames[on].classList.remove("is-on");
      next.classList.add("is-on");
      on = 1 - on;
      if (caption && name) caption.textContent = name.textContent;
    };
    next.onload = swap;
    next.setAttribute("src", src);
    if (next.complete) { next.onload = null; swap(); }
  }

  [].forEach.call(root.querySelectorAll(".menu-item"), function (item) {
    item.addEventListener("mouseenter", function () { show(item); });
    item.addEventListener("focusin", function () { show(item); });
  });

  // Al cambiar de pestaña (clic o flechas, que mueven el foco), la vista
  // arranca en el primer plato con foto
  tabs.forEach(function (tab, i) {
    var reset = function () {
      var first = panels[i].querySelector(".menu-item[data-photo]");
      if (first) show(first);
    };
    tab.addEventListener("click", reset);
    tab.addEventListener("focus", reset);
  });
})();
