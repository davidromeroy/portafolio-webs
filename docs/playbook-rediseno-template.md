# Playbook: rediseñar un template del catálogo

Cómo se rediseñó `templates/restaurante/` (La Parrilla del Sur) en octubre
de 2026, escrito para repetirlo con otro template. Ejemplo de aplicación al
final: **gimnasio (FORJA Gym)**.

Repo: `github.com/davidromeroy/portafolio-webs`. HTML/CSS/JS estático, sin
build, sin frameworks. Bóveda David: `Proyectos/portafolio-web/`.

---

## 0. Reglas fijas del proyecto (no negociables)

- **Español de Ecuador con tuteo. Nunca voseo** (nada de "vení",
  "confirmá", "escribinos", "querés", "podés", "vos", "Visitanos"). Va en
  el texto de la página, los botones, el alt, los READMEs y los
  comparadores. Antes de commitear texto, grep del voseo (ver §8).
- **Flujo de ramas:** rama de trabajo → `develop` → el usuario valida →
  `main` (producción/Vercel). Nunca mergear directo a `main`.
  Nombre de rama: `design/<template>-refresh`.
- **Commits sin coautor de IA** en este repo. Conventional commits:
  `redesign(gimnasio): …`, `fix(gimnasio): …`, `style(…)`, `chore(…)`.
  Merges con commit propio y mensaje `merge: <qué> into develop`.
- **`assets/base.css`, `nav.js` y `reveal.js` los comparten las 5 demos.**
  Un rediseño vive entero en el `theme.css` del template (más JS propio si
  hace falta). Si tocas `base.css`, revisa las 5 demos y el catálogo.
- `develop` suele estar abierta en la carpeta principal. Si git dice
  `'develop' is already used by worktree`, haz el merge desde esa carpeta
  (verifica antes que esté limpia).

## 1. Auditoría antes de tocar nada

Abrir el template en el navegador a **1366px y 375px** y medir:

- Alto total en móvil (`document.documentElement.scrollHeight`). Era
  10.117px en el restaurante: la carta en 3 columnas apiladas lo inflaba.
- Que no haya scroll horizontal (`scrollWidth === innerWidth`).
- Contraste del color de acento sobre el fondo (ver §5): el rojo de marca
  daba 2.8:1 y no servía ni para titulares.
- Peso de imágenes (`du -ch images/*.webp`). Unos 600KB está bien.
- Estilos en línea, saltos de nivel en títulos (h2 → h4 en el pie), y
  `aria-label` sobre `div` sin `role` (las estrellas de opiniones).
- `og:image` con ruta relativa: no funciona al compartir en redes. Queda
  pendiente hasta tener dominio.

## 2. Elegir la referencia y bajarla a tokens

El usuario eligió un estilo de **Refero** (`styles.refero.design/style/<id>`).
La página trae un `DESIGN.md` completo (colores, tipografía, componentes,
reglas). Para leerlo:

```js
// en la consola de la página de Refero
[...document.querySelectorAll('pre, code, [class*=markdown]')]
  .map(e => e.innerText).sort((a, b) => b.length - a.length)[0]
```

Restaurante → "Impossible Foods": afiche punk de carnicería.

Hay que preguntar **cuánto** aplicar, con dos opciones: A) adaptar la
referencia al tono actual, B) aplicarla completa y reescribir los textos
con ese tono. El usuario eligió **B**.

## 3. Sistema visual (lo que salió del restaurante)

| Pieza | Decisión |
|---|---|
| Paleta | Seis colores y nada más: lienzo `#260212`, tarjetas `#4f0423`, acción `#e10600`, texto rojo `#ff2a1f`, secundario `#ffc7c6`, negro |
| Display | Anton (solo existe en 400: pedir 700 produce negrita sintética). Mayúsculas, `line-height: 0.84`, `letter-spacing: 0.02em` |
| Remate | Titular + paréntesis en otra línea: `PURO FUEGO (CERO APURO)` con `.aside` al 42 % |
| Texto corrido | Archivo (variable, `wdth 75..100`, `wght 400..700`) |
| Forma | Radio 15px en botones/pestañas/nav, 12px en tarjetas, 38px en la tarjeta destacada |
| Elevación | **Plano:** sin sombras, sin degradados, sin franjas de color entre secciones. Solo aire |
| Eyebrow | `◂ TEXTO ▸` con pseudo-elementos y texto alternativo vacío: `content: "◂" / ""` |
| Fotos del hero | 3–4 platos con `clip-path: polygon(...)` irregular flotando alrededor del titular |
| Nav | Barra negra sólida (se apaga el blur de `base.css` con `.site-nav::before { display: none }`) |
| Cierre | Franja de color de acción a todo el ancho + nombre gigante en el pie |

Variables de `base.css` que se sobreescriben en `:root`: `--bg`,
`--surface`, `--surface-2`, `--text`, `--text-muted`, `--border`,
`--border-strong`, `--accent`, `--accent-contrast`, `--nav-bg`,
`--font-heading`, `--font-body`, `--weight-display`, `--tracking-display`,
`--radius`, `--radius-sm`, `--radius-pill`, `--maxw`, `--section-y`,
`--map-filter`.

## 4. Estructura y componentes que se reemplazaron

- **Carta en pestañas** (`carta.js`): patrón tabs de WAI-ARIA, con flechas,
  Inicio y Fin. Sin JS se ven todos los paneles seguidos (la lista de
  pestañas solo aparece con `.is-ready`). Esto bajó mucho el alto en móvil.
  → En el gimnasio, el equivalente son **disciplinas** u **horarios**.
- **Galería → carrusel** con `scroll-snap`: la siguiente foto asoma por el
  borde; `role="region"`, `tabindex="0"`, `aria-label` y botones ‹ › con
  estado `disabled`.
- **Cifras** con remate en mayúsculas ("1.240 reseñas. Cero pagadas.").
- **Opiniones** en tarjetas planas; avatar con `alt=""` porque el nombre
  ya está al lado.
- **Mapa:** filtro **gris oscuro neutro**
  `invert(0.9) hue-rotate(180deg) grayscale(1) contrast(1.05)`. Teñirlo
  del color de marca se probó y se descartó: no se leía.
- **Hero en móvil:** las flotantes quedan chicas (96px), así que se agrega
  una foto grande recortada bajo los botones (`.hero-feature`, solo en
  móvil) y se ocultan las flotantes de abajo.
- **WhatsApp flotante** en el color de acción, con **borde claro** (si no,
  desaparece sobre la franja del mismo color), y `padding-bottom` extra
  en el pie en móvil para que no tape "Volver al catálogo".

## 5. Contraste (lo que más se rompe)

- Calcularlo siempre, no a ojo. Snippet:

```js
const L = h => { const c = [1,3,5].map(i => parseInt(h.slice(i,i+2),16)/255)
  .map(v => v <= .03928 ? v/12.92 : ((v+.055)/1.055)**2.4);
  return .2126*c[0] + .7152*c[1] + .0722*c[2]; };
const cr = (a,b) => { const [x,y] = [L(a),L(b)].sort((p,q) => q-p);
  return +((x+.05)/(y+.05)).toFixed(2); };
cr('#ff2a1f', '#260212'); // 5.09
```

- Si el acento de marca no llega a 3:1 sobre el fondo, se usa **solo como
  fondo de botón** y para texto se crea una variante más clara.
- Texto grande = 24px o más en peso normal. Anton es 400 aunque se vea
  bold: los precios en rojo sobre burdeos (4.1:1) necesitaron **24px
  mínimo**.
- El foco (`:focus-visible`) también necesita 3:1: se pasó a rosa.

## 6. Movimiento (estilo de la referencia)

Archivo `motion.js` propio del template + bloque "Movimiento" en
`theme.css`. Todo cuelga de `.motion-on`, una clase que un `<script>`
inline en el `<head>` pone **antes de pintar** y solo sin
`prefers-reduced-motion`:

- **Titulares que suben desde una máscara:** el markup va
  `<span class="d-mask"><span>texto</span></span>`; IntersectionObserver
  agrega `.is-in`. Con `padding-top: 0.14em` en la máscara, para que no
  corte las tildes de las mayúsculas. Si `motion.js` no carga, una red de
  seguridad CSS destapa todo a los 1.5s.
- **Fotos del hero:** entran con rebote y luego se mecen. El parallax con
  el scroll y con el puntero (solo `pointer: fine`) usa las propiedades
  individuales `rotate`/`translate`/`scale`, que no se pisan entre sí.
- **Cinta de texto corrido** girada −1.5° en el color de acción, con el
  grupo duplicado y animación a −50 %, `aria-hidden`; se pausa con hover.
- **Cifras que cuentan** hasta su valor; el HTML ya trae el valor final.
- **Carta:** los platos entran escalonados al cambiar de pestaña; el
  precio se inclina con hover.
- **Carrusel:** botones, arrastre con mouse (sin snap mientras se arrastra)
  y flechas del teclado; las tarjetas se inclinan con hover.
- **Opiniones:** inclinación de calcomanía con hover. **Botones:** la
  flecha empuja.
- Todo con `@media (hover: hover)` donde corresponde, y apagado con
  movimiento reducido.

## 7. Fotos

- **Capa de color común:** `--photo-grade: contrast(1.14) saturate(1.18)
  sepia(0.16) hue-rotate(-10deg) brightness(0.9)` aplicada a todas las
  fotos, más un velo plano del color de fondo al 18 % sobre el carrusel.
  Plano, porque la referencia no usa degradados.
- **Reemplazo:** buscar en Unsplash fotos acordes al rubro y al tono.
  **Pasarle la lista al usuario (autor, URL, tamaño) antes de
  descargar.** Convertir a `.webp` como las actuales.

## 8. Verificación antes de commitear

```bash
# voseo (no debe devolver nada salvo nombres y pretéritos de 1ª persona)
grep -rnoiE "\b\w+(ás|és|ís)\b|\b(vení|traé|elegí|reservá|confirmá|escribinos|contanos|decinos|visitanos|vos)\b" templates/<tpl>
```

- 1366px y 375px: sin scroll horizontal, consola sin errores, pestañas y
  carrusel con clic y teclado.
- Las pruebas de IntersectionObserver/rAF necesitan la pestaña **al
  frente**: en segundo plano no disparan.

## 9. Versiones y comparador

Mismo esquema que peluquería y restaurante:

- `templates/<tpl>/versiones/<nombre>/`: la versión anterior **congelada**
  (`git show <commit>:templates/<tpl>/index.html` + su `theme.css`), con
  `noindex` y las rutas reescritas (`./images/` → `../../images/`,
  `../../assets/` → `../../../../assets/`, catálogo →
  `../../../../index.html`).
- `versiones/comparar.html`: copiar el de restaurante y cambiar el título
  y las opciones del `<select>`.
- `versiones/README.md`: tabla con qué es cada versión y por qué quedó atrás.

## 10. Cierre

- Commit en la rama → merge a `develop` → push → el usuario valida →
  `develop` → `main` → push.
- Nota en la bóveda David:
  `Proyectos/portafolio-web/<tpl>/00 - Descripción General.md` (estado,
  tabla del sistema visual, diagrama Mermaid de secciones, contraste,
  pendientes) + línea en `00 - MOC Portafolio Web.md`.

---

## Aplicación al gimnasio (FORJA Gym)

Punto de partida (`templates/gimnasio/`, oct 2026):

- Tema actual: "galpón industrial, hormigón y un amarillo que no pide
  permiso". Fondo `#0c0c0d`, acento `#d8ff33` (lima), Oswald + Barlow,
  radio 2–3px, barra diagonal de advertencia en el hero.
- Secciones: hero (`Acá no se viene a mirar. Se entrena.`), cifras,
  disciplinas (6), instalaciones, horarios (grilla), planes, equipo
  (3 coaches), opiniones, contacto.
- Imágenes: `barra-olimpica`, `boxeo`, `clase-grupal`, `cycling`,
  `funcional`, `maquinas`, `zona-pesas`, `hero`, 3 coaches, 3 testimonios.
- **Ya corregido el voseo** del gimnasio (16 oct). Revisar igual el texto
  nuevo que se escriba.

Pasos sugeridos:

1. `git checkout -b design/gimnasio-refresh` desde `develop` actualizado.
2. Auditoría (§1) a 1366/375. Medir el alto en móvil: la grilla de
   horarios y los planes probablemente lo inflan.
3. Pedirle al usuario la referencia de Refero (o proponer 2–3) y
   preguntar A/B (§2).
4. Candidatos a pestañas: **horarios por día** o **disciplinas**.
   Candidato a carrusel: **instalaciones**.
5. Calcular el contraste del lima nuevo o de la marca nueva sobre el
   fondo (§5).
6. Movimiento (§6): reutilizar `motion.js` del restaurante como base
   (máscaras, cinta, contadores, carrusel).
7. Versiones + comparador (§9) antes del merge a `develop`.
