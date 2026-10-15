/* ============================================================
   servicios.js — carta de servicios por categoría (Luna Studio)
   Un botón .chip (role="tab") por categoría, un .chip-panel
   (role="tabpanel") por categoría, y una foto por categoría en
   .services-photo que sigue al chip activo. Sin dependencias.

   Con JS: un .chip-indicator negro se desliza detrás del chip
   activo, flechas izquierda/derecha (y Home/End) mueven entre
   chips. Sin JS: el chip activo se pinta solo (ver theme.css) y
   el panel de Cabello queda visible.
   ============================================================ */

(function () {
  "use strict";

  var row = document.querySelector(".chips-row");
  if (!row) return;

  var chips = [].slice.call(row.querySelectorAll(".chip"));
  if (!chips.length) return;

  var indicator = document.createElement("span");
  indicator.className = "chip-indicator";
  indicator.setAttribute("aria-hidden", "true");
  row.insertBefore(indicator, row.firstChild);
  row.classList.add("has-indicator");

  var photos = [].slice.call(document.querySelectorAll(".services-photo img[data-photo]"));

  function showPhoto(chip) {
    photos.forEach(function (img) {
      img.classList.toggle("is-active", img.dataset.photo === chip.dataset.chip);
    });
  }

  function activeChip() {
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].getAttribute("aria-selected") === "true") return chips[i];
    }
    return chips[0];
  }

  // Posición relativa a .chips-row (offsetParent). Usa translate en
  // vez de left/top para no disparar layout en cada cambio; el tamaño
  // sí cambia porque los chips miden distinto.
  function moveIndicator(chip, instant) {
    if (instant) indicator.style.transition = "none";
    indicator.style.width = chip.offsetWidth + "px";
    indicator.style.height = chip.offsetHeight + "px";
    indicator.style.transform =
      "translate(" + chip.offsetLeft + "px, " + chip.offsetTop + "px)";
    if (instant) {
      // Fuerza el reflow antes de devolver la transición.
      void indicator.offsetWidth;
      indicator.style.transition = "";
    }
  }

  function select(chip, focus) {
    chips.forEach(function (c) {
      var on = c === chip;
      c.setAttribute("aria-selected", on ? "true" : "false");
      c.setAttribute("tabindex", on ? "0" : "-1");
    });
    document.querySelectorAll(".chip-panel").forEach(function (p) {
      p.classList.remove("is-active");
    });
    var panel = document.getElementById("panel-" + chip.dataset.chip) ||
      document.querySelector('[data-panel="' + chip.dataset.chip + '"]');
    if (panel) panel.classList.add("is-active");
    showPhoto(chip);
    moveIndicator(chip, false);
    if (focus) chip.focus();
  }

  chips.forEach(function (chip, i) {
    chip.addEventListener("click", function () {
      if (chip.getAttribute("aria-selected") === "true") return;
      select(chip, false);
    });

    chip.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = chips[(i + 1) % chips.length];
      else if (e.key === "ArrowLeft") next = chips[(i - 1 + chips.length) % chips.length];
      else if (e.key === "Home") next = chips[0];
      else if (e.key === "End") next = chips[chips.length - 1];
      if (!next) return;
      e.preventDefault();
      select(next, true);
    });
  });

  showPhoto(activeChip());
  moveIndicator(activeChip(), true);

  // Los chips pueden pasar a dos filas en móvil, o cambiar de ancho
  // cuando carga la fuente: recolocar sin animar.
  var onResize = function () { moveIndicator(activeChip(), true); };
  window.addEventListener("resize", onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
})();
