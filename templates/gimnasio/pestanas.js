/* ============================================================
   pestanas.js — pestañas de disciplinas y horarios (FORJA Gym)
   Patrón "tabs" de WAI-ARIA con activación automática: flechas
   izquierda/derecha, Inicio y Fin mueven el foco y muestran el panel.
   Sirve para cada [data-tabs] de la página. Sin JS no se agrega
   .is-ready y los paneles se ven todos seguidos.
   ============================================================ */

(function () {
  "use strict";

  [].forEach.call(document.querySelectorAll("[data-tabs]"), function (root) {
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
      // Que la pestaña elegida no quede cortada en la lista deslizable (móvil)
      tabs[index].scrollIntoView({ block: "nearest", inline: "nearest" });
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
    tabs.forEach(function (tab, i) {
      var on = i === 0;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
  });
})();
