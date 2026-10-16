/* ============================================================
   whatsapp.js — los enlaces de WhatsApp abren la app en el teléfono
   Lo usa solo la demo que lo enlaza; no toca a las demás.

   Uso, al final del <body>:
     <script src="../../assets/whatsapp.js" defer></script>

   Los enlaces se escriben como siempre (https://wa.me/<número>?text=…):
   sin JS, en computadora o si la app no está, siguen funcionando igual.
   En el teléfono se cambian al tocar:
   - Android: intent:// con el paquete de WhatsApp (si no está
     instalada, Chrome abre wa.me solo).
   - iPhone: whatsapp://send.
   En los dos, si a los 1,5 s la página sigue visible (no abrió nada),
   se va a wa.me: sin WhatsApp, el enlace de siempre.
   Por qué: wa.me pasa primero por el navegador, y en una web instalada
   como app iOS lo muestra en una hoja de Safari con un botón «Abrir
   aplicación» en vez de saltar a WhatsApp.
   ============================================================ */

(function () {
  "use strict";

  var ua = navigator.userAgent || "";
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (!isAndroid && !isIOS) return;

  function parse(href) {
    var m = href.match(/^https:\/\/(?:wa\.me|api\.whatsapp\.com\/send)\/?(\d*)\/?(?:\?(.*))?$/i);
    if (!m) return null;
    var params = new URLSearchParams(m[2] || "");
    return { phone: m[1] || params.get("phone") || "", text: params.get("text") || "" };
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var fallback = a.href;
    var wa = parse(fallback);
    if (!wa) return;

    e.preventDefault();
    var query = "phone=" + encodeURIComponent(wa.phone) + (wa.text ? "&text=" + encodeURIComponent(wa.text) : "");

    // Si WhatsApp abre, la página pasa a segundo plano y el temporizador
    // no hace nada; si no (no está instalada, o el navegador no entiende
    // intent://), la página sigue visible y se va a wa.me.
    var timer = setTimeout(function () {
      if (!document.hidden) window.location.href = fallback;
    }, 1500);
    document.addEventListener("visibilitychange", function onHide() {
      if (document.hidden) { clearTimeout(timer); document.removeEventListener("visibilitychange", onHide); }
    });
    window.location.href = isAndroid
      ? "intent://send?" + query + "#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=" +
        encodeURIComponent(fallback) + ";end"
      : "whatsapp://send?" + query;
  });
})();
