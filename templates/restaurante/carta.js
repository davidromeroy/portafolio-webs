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
})();
