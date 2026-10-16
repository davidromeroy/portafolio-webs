/* ============================================================
   motion.js — movimiento de La Parrilla del Sur
   - Titulares de afiche que suben desde una máscara al entrar.
   - Fotos flotantes del hero: parallax con el scroll y con el puntero.
   - Cifras que cuentan hasta su valor.
   - Carrusel: botones anterior/siguiente y arrastre con mouse.
   Todo se apaga con prefers-reduced-motion (el <head> no marca
   .motion-on y acá se sale antes). Sin dependencias.
   ============================================================ */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* El carrusel funciona igual con movimiento reducido: solo cambia
     el desplazamiento suave por uno instantáneo. */
  setupReel(reduced);

  if (reduced || !root.classList.contains("motion-on")) return;

  // Avisa al CSS que el script corrió: apaga la red de seguridad que
  // destapa los titulares solos si este archivo no llegara a cargar.
  root.classList.add("motion-js");

  /* ---------- Titulares que suben ---------- */

  var heads = [].slice.call(document.querySelectorAll(".display, .footer-mark"));
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

  /* ---------- Parallax de las fotos del hero ----------
     Una sola variable por foto (--py con el scroll, --px/--pyp con el
     puntero) que el CSS suma en translate. rAF para no correr en cada
     evento. */

  var hero = document.querySelector(".hero");
  var floats = [].slice.call(document.querySelectorAll(".float"));
  var depth = [0.18, -0.12, 0.1, -0.2];
  var pointer = { x: 0, y: 0 };
  var queued = false;

  function paint() {
    queued = false;
    var y = Math.min(window.scrollY, window.innerHeight);
    floats.forEach(function (f, i) {
      var d = depth[i % depth.length];
      f.style.setProperty("--py", (y * d).toFixed(1) + "px");
      f.style.setProperty("--px", (pointer.x * d * 60).toFixed(1) + "px");
      f.style.setProperty("--pyp", (pointer.y * d * 60).toFixed(1) + "px");
    });
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  }

  if (hero && floats.length) {
    window.addEventListener("scroll", queue, { passive: true });
    // Solo con puntero fino: en táctil el "hover" no existe
    if (window.matchMedia("(pointer: fine)").matches) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) / r.width - 0.5;
        pointer.y = (e.clientY - r.top) / r.height - 0.5;
        queue();
      });
      hero.addEventListener("pointerleave", function () {
        pointer.x = pointer.y = 0;
        queue();
      });
    }
  }

  /* ---------- Cifras que cuentan ----------
     El HTML ya trae el valor final (sin JS se lee bien). Acá se
     reemplaza por el conteo solo cuando la cifra entra en pantalla. */

  var counters = [].slice.call(document.querySelectorAll("[data-count]"));

  function count(el) {
    var to = parseFloat(el.getAttribute("data-count"));
    var from = parseFloat(el.getAttribute("data-from") || "0");
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var final = el.textContent;
    var start = null;
    var dur = 1400;

    function step(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = (from + (to - from) * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = final;
    }
    requestAnimationFrame(step);
  }

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
      drag = { x: e.clientX, left: reel.scrollLeft, moved: false };
      reel.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      reel.scrollLeft = drag.left - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!drag) return;
      reel.classList.remove("is-dragging");
      drag = null;
    });
    // Que un arrastre no termine abriendo nada ni seleccionando texto
    reel.addEventListener("dragstart", function (e) { e.preventDefault(); });
  }
})();
