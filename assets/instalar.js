/* ============================================================
   instalar.js — aviso "Instala la app" para cualquier demo (PWA)
   Lo usa solo la demo que lo enlaza; no toca a las demás.

   Uso, al final del <body>:
     <script src="../../assets/instalar.js" data-sw="./sw.js" defer></script>
   y en el <head> la hoja ../../assets/instalar.css.

   Toma el nombre de <meta name="apple-mobile-web-app-title"> y el
   ícono de <link rel="apple-touch-icon">. Con data-sw registra el
   service worker.

   Qué muestra según dónde se abre la página:
   - Ya instalada (modo app) o dentro de un iframe (vista previa del
     catálogo): nada.
   - Android / computadora con Chrome, Edge o Samsung Internet: botón
     "Instalar" que abre el diálogo del sistema.
   - iPhone o iPad: los dos pasos de Compartir → "Agregar a pantalla
     de inicio" (Apple no deja abrir el diálogo desde la página).
   - Navegador interno de Instagram, Facebook o TikTok: pide abrir la
     página en el navegador del teléfono, con botón para copiar el
     enlace (desde ahí no se puede instalar).
   - Otros navegadores: nada.

   Cuándo aparece: tras mostrar interés (bajar más de una pantalla y
   media, o 20 s en la página), nunca al entrar. "Ahora no" lo oculta
   30 días. Cualquier elemento con [data-instalar-abrir] lo abre a mano.

   Para probar o mostrar en una demo: ?instalar=android | ios | inapp
   | instalada fuerza ese caso al instante.
   ============================================================ */

(function () {
  "use strict";

  var script = document.currentScript;
  var cfg = {
    sw: script && script.getAttribute("data-sw"),
    name: meta("apple-mobile-web-app-title") || document.title.split("—")[0].trim(),
    icon: link("apple-touch-icon")
  };

  var KEY = "instalar-oculto-hasta";
  var DAYS = 30;
  var deferred = null; // evento beforeinstallprompt guardado (Chrome/Edge)
  var card = null;
  var shown = false;

  /* ---------- Service worker ---------- */

  if (cfg.sw && "serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register(cfg.sw).catch(function () {});
    });
  }

  /* ---------- Dónde estamos ---------- */

  var ua = navigator.userAgent || "";
  var forced = (new URLSearchParams(location.search).get("instalar") || "").toLowerCase();

  function isStandalone() {
    return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true;
  }

  var inIframe = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var isMobile = /Mobi|Android/i.test(ua) || isIOS;
  var isInApp =/Instagram|FBAN|FBAV|FB_IAB|FBIOS|TikTok|musical_ly|BytedanceWebview|Line\//i.test(ua);

  function mode() {
    if (forced === "instalada") return "instalada";
    if (forced === "android" || forced === "ios" || forced === "inapp") return forced;
    if (isStandalone()) return "instalada";
    if (isInApp) return "inapp";
    if (isIOS) return "ios";
    return deferred ? "android" : null;
  }

  if (inIframe && !forced) return;

  /* ---------- Chrome / Edge: guardar el diálogo del sistema ---------- */

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
    armTriggers();
  });

  window.addEventListener("appinstalled", function () {
    deferred = null;
    hide();
    snooze(3650);
  });

  /* ---------- Cuándo mostrarlo ---------- */

  function snoozed() {
    try { return Number(localStorage.getItem(KEY) || 0) > Date.now(); } catch (e) { return false; }
  }

  function snooze(days) {
    try { localStorage.setItem(KEY, String(Date.now() + days * 864e5)); } catch (e) {}
  }

  var armed = false;
  function armTriggers() {
    if (armed) return;
    armed = true;
    var timer = setTimeout(maybeShow, 20000);
    function onScroll() {
      if (window.scrollY > window.innerHeight * 1.5) {
        window.removeEventListener("scroll", onScroll);
        clearTimeout(timer);
        maybeShow();
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function maybeShow() {
    var m = mode();
    if (!m || m === "instalada" || snoozed()) return;
    show(m);
  }

  // Botones o enlaces de la página que abren el aviso a mano
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-instalar-abrir]");
    if (!t) return;
    e.preventDefault();
    var m = mode() || (isIOS ? "ios" : "otro");
    show(m);
  });

  /* ---------- Vista ---------- */

  var SHARE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" class="instalar-share"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>';
  var PLUS_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" class="instalar-share"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8.5v7M8.5 12h7"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function body(m) {
    var name = esc(cfg.name);
    if (m === "android") {
      return {
        title: "Instala " + name + (isMobile ? " en tu teléfono" : " como app"),
        text: isMobile
          ? "Ábrela desde la pantalla de inicio, a pantalla completa y aunque tengas mala señal."
          : "Ábrela en su propia ventana, sin pestañas, y aunque te quedes sin internet.",
        action: '<button type="button" class="instalar-btn" data-act="instalar">Instalar</button>'
      };
    }
    if (m === "ios") {
      return {
        title: "Agrega " + name + " a tu iPhone",
        text: '<ol class="instalar-pasos">' +
          "<li>Toca " + SHARE_SVG + " <b>Compartir</b> en la barra del navegador.</li>" +
          "<li>Elige " + PLUS_SVG + " <b>Agregar a pantalla de inicio</b> y luego <b>Agregar</b>.</li>" +
          "</ol>",
        action: ""
      };
    }
    if (m === "inapp") {
      var where = isIOS ? "Safari" : "Chrome";
      return {
        title: "Ábrela en " + where + " para instalarla",
        text: "Desde Instagram o Facebook no se puede instalar. Toca <b>⋯</b> arriba y elige <b>Abrir en el navegador</b>, o copia el enlace y pégalo en " + where + ".",
        action: '<button type="button" class="instalar-btn" data-act="copiar">Copiar enlace</button>'
      };
    }
    return {
      title: "Instalar " + name,
      text: "Ábrela en Chrome (Android o computadora) o en Safari (iPhone) y vuelve a tocar «Instalar la app».",
      action: ""
    };
  }

  function show(m) {
    if (m === "instalada") return;
    if (!card) build();
    var b = body(m);
    card.setAttribute("data-modo", m);
    card.querySelector(".instalar-titulo").innerHTML = b.title;
    card.querySelector(".instalar-texto").innerHTML = b.text;
    card.querySelector(".instalar-accion").innerHTML = b.action;
    card.hidden = false;
    requestAnimationFrame(function () { card.classList.add("is-open"); });
    shown = true;
  }

  function hide() {
    if (!card) return;
    card.classList.remove("is-open");
    setTimeout(function () { card.hidden = true; }, 250);
  }

  function build() {
    card = document.createElement("aside");
    card.className = "instalar";
    card.setAttribute("aria-label", "Instalar la app");
    card.hidden = true;
    card.innerHTML =
      (cfg.icon ? '<img class="instalar-icono" src="' + esc(cfg.icon) + '" width="48" height="48" alt="">' : "") +
      '<div class="instalar-cuerpo">' +
        '<p class="instalar-titulo"></p>' +
        '<div class="instalar-texto"></div>' +
        '<div class="instalar-pie"><span class="instalar-accion"></span>' +
          '<button type="button" class="instalar-cerrar" data-act="cerrar">Ahora no</button></div>' +
      "</div>";
    document.body.appendChild(card);

    card.addEventListener("click", function (e) {
      var act = e.target.closest && e.target.closest("[data-act]");
      if (!act) return;
      var a = act.getAttribute("data-act");
      if (a === "cerrar") { snooze(DAYS); hide(); }
      if (a === "instalar") install(act);
      if (a === "copiar") copy(act);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && shown && !card.hidden) { snooze(DAYS); hide(); }
    });
  }

  function install(btn) {
    if (!deferred) {
      // Caso forzado con ?instalar=android en un navegador sin el diálogo
      btn.textContent = "En un Android real se abre el diálogo del sistema";
      btn.disabled = true;
      return;
    }
    deferred.prompt();
    deferred.userChoice.then(function (choice) {
      deferred = null;
      if (choice && choice.outcome === "accepted") { snooze(3650); }
      hide();
    });
  }

  function copy(btn) {
    var url = location.href.replace(/[?&]instalar=[^&]*/, "").replace(/\?$/, "");
    function ok() { btn.textContent = "Enlace copiado"; }
    function fail() { window.prompt ? window.prompt("Copia este enlace:", url) : null; }
    try {
      navigator.clipboard.writeText(url).then(ok, fail);
    } catch (e) { fail(); }
  }

  /* ---------- Arranque ---------- */

  if (forced) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { show(mode()); });
    else show(mode());
  } else if (isInApp || isIOS) {
    // En iPhone y en navegadores internos no hay evento: se arma solo
    if (!isStandalone()) armTriggers();
  }

  window.Instalar = { abrir: function (m) { show(m || mode() || "otro"); }, modo: mode };

  /* ---------- Utilidades ---------- */

  function meta(name) {
    var el = document.querySelector('meta[name="' + name + '"]');
    return el && el.getAttribute("content");
  }

  function link(rel) {
    var el = document.querySelector('link[rel="' + rel + '"]');
    return el && el.getAttribute("href");
  }
})();
