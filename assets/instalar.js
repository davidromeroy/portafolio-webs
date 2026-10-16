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

   Cómo se ve: una barra de una sola línea (ícono, frase y un botón).
   En iPhone la barra imita una notificación de iOS y "Cómo" abre
   una hoja inferior con el estilo nativo (filas agrupadas, tirador,
   íconos de Safari) y los nombres reales de los menús de iOS:
   Compartir → Agregar a Inicio → Agregar. En el navegador interno los
   pasos se despliegan dentro de la barra.

   Cuándo aparece: cuando ya recorrió más de la mitad de la página (o
   tras 45 s), nunca al entrar y como mucho una vez por visita. La X la
   oculta 30 días en ese navegador. Cualquier elemento con
   [data-instalar-abrir] la abre a mano.

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
  var SESSION_KEY = "instalar-visto";
  var DAYS = 30;
  var deferred = null; // evento beforeinstallprompt guardado (Chrome/Edge)
  var card = null;
  var shown = false;

  /* ---------- Service worker ---------- */

  if (cfg.sw && "serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register(cfg.sw).catch(function () {});
    });

    // Actualización: si se publicó un sw.js nuevo (CACHE subió), el
    // nuevo toma el control y la página se recarga una vez para mostrar
    // ya el CSS/JS/fotos nuevos. Solo si había uno antes: en la primera
    // visita no recarga.
    var hadController = !!navigator.serviceWorker.controller;
    var reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController || reloaded) return;
      reloaded = true;
      window.location.reload();
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
  // Safari de iOS 26 (Liquid Glass) movió Compartir dentro del menú «⋯».
  // La versión de iOS sale de "Version/NN" (el "OS 18_6" del UA quedó
  // congelado). ?instalar=ios26 fuerza esta variante para probar.
  var iosMajor = parseInt((ua.match(/Version\/(\d+)/) || [])[1], 10) || 0;
  var isLiquid = forced === "ios26" || (isIOS && iosMajor >= 26);
  if (forced === "ios26") forced = "ios";

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
    var timer = setTimeout(maybeShow, 45000);
    function onScroll() {
      var doc = document.documentElement;
      if (window.scrollY + window.innerHeight > doc.scrollHeight * 0.55) {
        window.removeEventListener("scroll", onScroll);
        clearTimeout(timer);
        maybeShow();
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function maybeShow() {
    var m = mode();
    if (!m || m === "instalada" || snoozed() || seenThisVisit()) return;
    show(m);
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
  }

  function seenThisVisit() {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) { return false; }
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
  var MORE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" class="instalar-share"><g fill="currentColor" stroke="none"><circle cx="5.5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18.5" cy="12" r="1.7"/></g></svg>';
  var PLUS_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" class="instalar-share"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8.5v7M8.5 12h7"/></svg>';

  function step(ico, cls, title, small, n) {
    return '<li><span class="instalar-hoja-ico' + cls + '">' + ico + "</span>" +
      "<span><b>" + title + "</b><small>" + small + "</small></span><em>" + n + "</em></li>";
  }

  // Hasta iOS 18: Compartir está en la barra de abajo. Visto en el
  // simulador (iOS 18, español).
  var STEPS_18 =
    step(SHARE_SVG, " is-azul", "Toca Compartir", "En la barra de Safari, abajo al centro", 1) +
    step(PLUS_SVG, "", "Elige «Agregar a Inicio»", "Desliza la lista hacia arriba si no lo ves", 2) +
    step("Agregar", " is-texto", "Toca «Agregar»", "Arriba a la derecha. Listo: queda junto a tus apps", 3);

  // iOS 26 (Liquid Glass). SIN VERIFICAR paso a paso en un iPhone: el
  // «⋯» y Compartir dentro de él sí se vieron en el simulador (16 oct
  // 2026); «Ver más» y «Abrir como app web» son de memoria.
  var STEPS_26 =
    step(MORE_SVG, " is-azul", "Toca «⋯»", "Abajo a la derecha, junto a la dirección", 1) +
    step(SHARE_SVG, " is-azul", "Toca «Compartir»", "En el menú que se abre", 2) +
    step(PLUS_SVG, "", "Elige «Agregar a Inicio»", "Toca «Ver más» si no lo ves", 3) +
    step("Agregar", " is-texto", "Toca «Agregar»", "Deja activo «Abrir como app web». Listo: queda junto a tus apps", 4);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function body(m) {
    var name = esc(cfg.name);
    var how = '<button type="button" class="instalar-btn" data-act="como" aria-expanded="false">Cómo</button>';
    if (m === "android") {
      return {
        title: isMobile ? "Instala la app" : "Instala " + name + " como app",
        action: '<button type="button" class="instalar-btn" data-act="instalar">Instalar</button>',
        detail: ""
      };
    }
    if (m === "ios") {
      return {
        title: name,
        sub: "Agrégala a Inicio",
        action: '<button type="button" class="instalar-btn" data-act="hoja">Cómo</button>',
        detail: ""
      };
    }
    if (m === "inapp") {
      var where = isIOS ? "Safari" : "Chrome";
      return {
        title: "Ábrela en " + where,
        action: how,
        detail: "<p>Desde Instagram o Facebook no se puede instalar. Toca <b>⋯</b> arriba y elige <b>Abrir en el navegador</b>, o copia el enlace y pégalo en " + where + ".</p>" +
          '<button type="button" class="instalar-btn instalar-btn--sec" data-act="copiar">Copiar enlace</button>'
      };
    }
    return {
      title: "Instalar " + name,
      action: how,
      detail: "<p>Ábrela en Chrome (Android o computadora) o en Safari (iPhone) y vuelve a tocar «Instalar la app».</p>"
    };
  }

  function show(m) {
    if (m === "instalada") return;
    if (!card) build();
    var b = body(m);
    card.setAttribute("data-modo", m);
    card.classList.toggle("instalar--ios", m === "ios");
    card.querySelector(".instalar-titulo").innerHTML = b.title +
      (b.sub ? '<span class="instalar-sub">' + b.sub + "</span>" : "");
    card.querySelector(".instalar-accion").innerHTML = b.action;
    var detail = card.querySelector(".instalar-detalle");
    detail.innerHTML = b.detail;
    detail.hidden = true;
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
      '<div class="instalar-fila">' +
        (cfg.icon ? '<img class="instalar-icono" src="' + esc(cfg.icon) + '" width="32" height="32" alt="">' : "") +
        '<p class="instalar-titulo"></p>' +
        '<span class="instalar-accion"></span>' +
        '<button type="button" class="instalar-cerrar" data-act="cerrar" aria-label="Cerrar (no vuelve a aparecer en 30 días)">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      "</div>" +
      '<div class="instalar-detalle" hidden></div>';
    document.body.appendChild(card);

    card.addEventListener("click", function (e) {
      var act = e.target.closest && e.target.closest("[data-act]");
      if (!act) return;
      var a = act.getAttribute("data-act");
      if (a === "cerrar") { snooze(DAYS); hide(); }
      if (a === "instalar") install(act);
      if (a === "copiar") copy(act);
      if (a === "hoja") openSheet(act);
      if (a === "como") {
        var d = card.querySelector(".instalar-detalle");
        d.hidden = !d.hidden;
        act.setAttribute("aria-expanded", String(!d.hidden));
        act.textContent = d.hidden ? "Cómo" : "Ocultar";
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && shown && !card.hidden) { snooze(DAYS); hide(); }
    });
  }

  /* ---------- Hoja de pasos al estilo iOS ---------- */

  var sheet = null;
  var opener = null;

  function openSheet(from) {
    opener = from;
    if (!sheet) buildSheet();
    sheet.hidden = false;
    document.documentElement.classList.add("instalar-hoja-abierta");
    requestAnimationFrame(function () { sheet.classList.add("is-open"); });
    // Sin anillo de foco si se abrió con el dedo; con teclado sí se ve
    try { sheet.querySelector("[data-hoja=listo]").focus({ focusVisible: false }); }
    catch (e) { sheet.querySelector("[data-hoja=listo]").focus(); }
  }

  function closeSheet() {
    if (!sheet) return;
    sheet.classList.remove("is-open");
    document.documentElement.classList.remove("instalar-hoja-abierta");
    setTimeout(function () { sheet.hidden = true; }, 300);
    if (opener) opener.focus();
  }

  function buildSheet() {
    var name = esc(cfg.name);
    sheet = document.createElement("div");
    sheet.className = "instalar-hoja";
    sheet.hidden = true;
    sheet.innerHTML =
      '<div class="instalar-hoja-fondo" data-hoja="cerrar"></div>' +
      '<div class="instalar-hoja-panel" role="dialog" aria-modal="true" aria-labelledby="instalar-hoja-titulo">' +
        '<span class="instalar-hoja-tirador" aria-hidden="true"></span>' +
        '<div class="instalar-hoja-cabeza">' +
          (cfg.icon ? '<img src="' + esc(cfg.icon) + '" width="44" height="44" alt="">' : "") +
          '<div><p id="instalar-hoja-titulo" class="instalar-hoja-titulo">Instala ' + name + '</p>' +
          '<p class="instalar-hoja-sub">Abre a pantalla completa, como una app.</p></div>' +
          '<button type="button" class="instalar-hoja-x" data-hoja="cerrar" aria-label="Cerrar">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg></button>' +
        "</div>" +
        '<ol class="instalar-hoja-lista">' + (isLiquid ? STEPS_26 : STEPS_18) + "</ol>" +
        '<button type="button" class="instalar-hoja-listo" data-hoja="listo">Entendido</button>' +
      "</div>";
    document.body.appendChild(sheet);
    sheet.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-hoja]");
      if (t) closeSheet();
    });
    sheet.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.stopPropagation(); closeSheet(); }
      if (e.key === "Tab") {
        // El foco no sale de la hoja mientras está abierta
        var f = sheet.querySelectorAll("button");
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
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
