/* ============================================================
   events-carousel.js — carrusel de eventos destacados (Inicio)
   Vanilla JS, sin dependencias. Rota automáticamente entre los
   slides de eventos reales (Desfile de Pijamas Navideñas, Feria
   Artesanal, Reina del Centro) con un track en flexbox que se
   traslada con transform. Los puntos permiten saltar a un slide
   y reinician el temporizador automático.

   Progressive enhancement: sin JS los slides quedan apilados uno
   debajo de otro (el CSS solo aplica el layout de carrusel dentro
   de [data-events-carousel]), así el contenido nunca desaparece.
   ============================================================ */

(function () {
  "use strict";

  var carousel = document.querySelector("[data-events-carousel]");
  if (!carousel) return;

  var track = carousel.querySelector("[data-events-track]");
  var slides = [].slice.call(carousel.querySelectorAll("[data-events-slide]"));
  var dots = [].slice.call(carousel.querySelectorAll("[data-events-dot]"));
  if (!track || slides.length < 2) return;

  var current = 0;
  var AUTO_MS = 4000;
  var timer = null;

  function render() {
    track.style.transform = "translateX(-" + (current * 100) + "%)";
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    render();
  }

  function next() {
    goTo(current + 1);
  }

  function startAuto() {
    stopAuto();
    timer = window.setInterval(next, AUTO_MS);
  }

  function stopAuto() {
    if (timer) window.clearInterval(timer);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      goTo(i);
      startAuto();
    });
  });

  carousel.addEventListener("mouseenter", stopAuto);
  carousel.addEventListener("mouseleave", startAuto);

  carousel.setAttribute("data-active", "");
  render();
  startAuto();
})();
