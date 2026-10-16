/* ============================================================
   motion.js — movimiento de FORJA Gym
   - Titulares que suben desde una máscara al entrar.
   - Cifras del hero que cuentan hasta su valor.
   - Carrusel de instalaciones: botones, teclado y arrastre con mouse.
   - Filas deslizables de móvil (planes, coaches, opiniones): se
     vuelven enfocables solo cuando de verdad desbordan.
   El carrusel y las filas funcionan con movimiento reducido; lo demás
   se apaga (el <head> no marca .motion-on y acá se sale antes).
   ============================================================ */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  setupReel(reduced);
  setupSnapRows();

  if (reduced || !root.classList.contains("motion-on")) return;

  // Avisa al CSS que el script corrió: apaga la red de seguridad que
  // destapa los titulares solos si este archivo no llegara a cargar.
  root.classList.add("motion-js");

  /* ---------- Titulares que suben ---------- */

  var heads = [].slice.call(document.querySelectorAll(".display"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
    );
    heads.forEach(function (h) { io.observe(h); });
  } else {
    heads.forEach(function (h) { h.classList.add("is-in"); });
  }

  /* ---------- Cifras que cuentan ----------
     El HTML ya trae el valor final (sin JS se lee bien). Acá se
     reemplaza por el conteo solo cuando la cifra entra en pantalla. */

  function miles(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function count(el) {
    var to = parseFloat(el.getAttribute("data-count"));
    var groups = el.getAttribute("data-format") === "miles";
    var final = el.textContent;
    var start = null;
    var dur = 1400;

    function step(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      var v = Math.round(to * (1 - Math.pow(1 - p, 4)));
      el.textContent = groups ? miles(v) : String(v);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = final;
    }
    requestAnimationFrame(step);
  }

  var counters = [].slice.call(document.querySelectorAll("[data-count]"));
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          count(e.target);
          cio.unobserve(e.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Carrusel ---------- */

  function setupReel(instant) {
    var reel = document.querySelector("[data-reel]");
    if (!reel) return;
    var prev = document.querySelector("[data-reel-prev]");
    var next = document.querySelector("[data-reel-next]");

    function stepSize() {
      var card = reel.querySelector(".reel-card");
      if (!card) return reel.clientWidth;
      var gap = parseFloat(getComputedStyle(reel).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function go(dir) {
      reel.scrollBy({ left: dir * stepSize(), behavior: instant ? "auto" : "smooth" });
    }

    function sync() {
      var max = reel.scrollWidth - reel.clientWidth - 2;
      if (prev) prev.disabled = reel.scrollLeft <= 2;
      if (next) next.disabled = reel.scrollLeft >= max;
    }

    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });
    reel.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();

    // Flechas del teclado cuando el carrusel tiene el foco
    reel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });

    /* Arrastre con mouse (en táctil ya se desliza nativo). Mientras se
       arrastra se apaga el snap; al soltar vuelve y acomoda la foto. */
    var drag = null;
    reel.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: reel.scrollLeft };
      reel.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      reel.scrollLeft = drag.left - (e.clientX - drag.x);
    });
    window.addEventListener("pointerup", function () {
      if (!drag) return;
      reel.classList.remove("is-dragging");
      drag = null;
    });
    reel.addEventListener("dragstart", function (e) { e.preventDefault(); });
  }

  /* ---------- Filas deslizables de móvil ----------
     En escritorio son grillas normales y no deben sumar una parada de
     tabulación. Solo cuando desbordan (móvil) se vuelven región
     enfocable, para poder recorrerlas con las flechas del teclado. */

  function setupSnapRows() {
    var rows = [].slice.call(document.querySelectorAll(".plans, .coaches, .testimonials"));
    var labels = { plans: "Planes", coaches: "Coaches", testimonials: "Opiniones de socios" };

    function sync() {
      rows.forEach(function (row) {
        var overflows = row.scrollWidth > row.clientWidth + 2;
        var name = labels[row.classList[0]] || "";
        if (overflows) {
          row.setAttribute("tabindex", "0");
          row.setAttribute("role", "region");
          row.setAttribute("aria-label", name + " (desplazable)");
        } else {
          row.removeAttribute("tabindex");
          row.removeAttribute("role");
          row.removeAttribute("aria-label");
        }
      });
    }

    sync();
    window.addEventListener("resize", sync);
  }
})();
