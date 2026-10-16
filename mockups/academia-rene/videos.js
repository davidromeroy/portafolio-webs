/* ============================================================
   videos.js — los videos de la franja de talleres (portada)
   Antes iban con autoplay: el navegador bajaba los 6 (~5 MB) al
   entrar, aunque no se vieran. Ahora cargan y se reproducen solo
   mientras están en pantalla; hasta entonces se ve el póster.
   Con movimiento reducido o ahorro de datos se quedan en el póster.
   ============================================================ */
(function () {
  var vids = document.querySelectorAll("video[data-auto]");
  if (!vids.length) return;

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  if (reduce || saveData || !("IntersectionObserver" in window)) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.25 });

  vids.forEach(function (v) { io.observe(v); });
})();
