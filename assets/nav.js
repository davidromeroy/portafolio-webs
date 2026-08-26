/* ============================================================
   nav.js — menu hamburguesa + scroll spy
   Vanilla JS, sin dependencias. Compartido por los 5 templates.

   Markup esperado:
     <button class="nav-toggle" aria-expanded="false"
             aria-controls="nav-links" data-nav-toggle>...</button>
     <nav id="nav-links" class="nav-links">...</nav>
     <div class="nav-backdrop" data-nav-backdrop></div>
   ============================================================ */

(function () {
  "use strict";

  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.getElementById("nav-links");
  var backdrop = document.querySelector("[data-nav-backdrop]");

  /* ---------- Menu hamburguesa ---------- */

  function setOpen(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute(
      "aria-label",
      open ? "Cerrar menú de navegación" : "Abrir menú de navegación"
    );
  }

  function isOpen() {
    return toggle && toggle.getAttribute("aria-expanded") === "true";
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      setOpen(!isOpen());
    });

    // Cerrar al elegir un destino
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setOpen(false);
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Si se agranda la ventana con el panel abierto, restaurar estado
    var mq = window.matchMedia("(min-width: 761px)");
    var onChange = function (e) {
      if (e.matches) setOpen(false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---------- Scroll spy ---------- */

  var links = [].slice.call(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );
  if (!links.length || !("IntersectionObserver" in window)) return;

  var byId = {};
  var sections = [];

  links.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    if (!id) return;
    var section = document.getElementById(id);
    if (!section) return;
    byId[id] = link;
    sections.push(section);
  });

  if (!sections.length) return;

  var visible = new Set();

  function highlight() {
    // Gana la seccion visible que este mas arriba en el documento.
    var best = null;
    sections.forEach(function (section) {
      if (visible.has(section.id) && best === null) best = section.id;
    });
    links.forEach(function (link) {
      link.classList.remove("is-active");
    });
    if (best && byId[best]) byId[best].classList.add("is-active");
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      highlight();
    },
    // La banda excluye la navbar arriba y el 55% inferior de la pantalla,
    // asi la seccion "activa" es la que domina el area de lectura.
    { rootMargin: "-88px 0px -55% 0px", threshold: 0 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();
