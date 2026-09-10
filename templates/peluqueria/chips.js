/* ============================================================
   chips.js — carta de servicios por categoría (Luna Studio)
   Un botón .chip por categoría, un panel .chip-panel por categoría.
   Sin dependencias. Ver patrón "Chips de servicio" en theme.css.
   ============================================================ */

(function () {
  "use strict";

  var chips = document.querySelectorAll(".chip");
  if (!chips.length) return;

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.setAttribute("aria-selected", "false"); });
      document.querySelectorAll(".chip-panel").forEach(function (p) {
        p.classList.remove("is-active");
      });

      chip.setAttribute("aria-selected", "true");
      var panel = document.querySelector('[data-panel="' + chip.dataset.chip + '"]');
      if (panel) panel.classList.add("is-active");
    });
  });
})();
