/* ============================================================
   nav-dropdown.js — dropdown de "Nosotros" (solo este mockup)
   Progresive enhancement sobre el markup estático:
     <div class="nav-item has-dropdown">
       <a href="./nosotros.html">Nosotros</a>
       <div class="nav-dropdown">...</div>
     </div>
   Desktop: hover / focus-within (ver theme.css) ya lo muestra sin JS.
   Mobile: este script inyecta un botón-flecha para abrir/cerrar el
   submenú como acordeón, sin bloquear el link real a nosotros.html.
   ============================================================ */

(function () {
  "use strict";

  var items = [].slice.call(document.querySelectorAll(".nav-item.has-dropdown"));
  if (!items.length) return;

  items.forEach(function (item) {
    var link = item.querySelector(":scope > a");
    var dropdown = item.querySelector(".nav-dropdown");
    if (!link || !dropdown) return;

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-dropdown-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Mostrar submenú de " + link.textContent.trim());
    toggle.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
      'stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
    item.insertBefore(toggle, dropdown);

    function setOpen(open) {
      item.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    }

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!item.classList.contains("is-open"));
    });
  });

  // Cerrar todos al hacer click fuera o al presionar Escape.
  document.addEventListener("click", function (e) {
    items.forEach(function (item) {
      if (!item.contains(e.target)) {
        item.classList.remove("is-open");
        var t = item.querySelector(".nav-dropdown-toggle");
        if (t) t.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    items.forEach(function (item) {
      item.classList.remove("is-open");
      var t = item.querySelector(".nav-dropdown-toggle");
      if (t) t.setAttribute("aria-expanded", "false");
    });
  });
})();
