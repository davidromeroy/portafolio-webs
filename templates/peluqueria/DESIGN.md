# Luna Studio — sistema de diseño

Demo de peluquería del catálogo. Estructura propia (v3) con la piel de
[Serenity Hair Salon Blaxland](https://serenityhairblaxland.com.au/)
(Awwwards Nominee 2025), ajustada a nuestras fotos y a contraste AA.
Los valores del original se leyeron con `getComputedStyle` el 2026-10-15;
abajo se marca dónde nos apartamos y por qué.

**Tono:** claro y cálido, salón de barrio bien cuidado; no clínica ni
revista. Sin sombras: la profundidad sale de bloques de color superpuestos.

## Archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | La página. Carga `../../assets/base.css` (compartido) y `theme.css` |
| `theme.css` | Todo el estilo propio, ordenado como la página: tokens → base → nav → hero → trabajos → servicios → cita → opiniones → paquetes → salón → cierre → footer → gradación de fotos |
| `servicios.js` | Chips de categoría (`role="tab"`, flechas/Home/End), indicador que se desliza, panel activo y foto que sigue al chip |
| `trabajos.js` | Flechas de la tira de trabajos: avanzan una página y se deshabilitan en los extremos |
| `motion.js` | Botón "volver arriba" y sombra del nav al scrollear |
| `versiones/` | Versiones anteriores congeladas, sin enlazar (ver su `README.md`) |

Al cambiar `theme.css` o un script, subir el `?v=` en `index.html`.

## Recorrido de la página

Hero → Trabajos (prueba) → Servicios y precios → Cómo es tu cita →
Opiniones → Paquetes → El salón y el equipo → Cierre (reserva, horario,
mapa). Prueba antes que precio: así decide una clienta.

## Colores

| Token | Valor | Uso |
|---|---|---|
| `--sage-wash` | `#e1e6e1` | Banda del hero y de opiniones (sage `#c3ccc3` al 50 %) |
| `--peach` | `#ffe4cf` | Bloque detrás del arco del hero, fondo de la foto de servicios, paquete destacado, cierre |
| `--rose-wash` | `#ecdcda` | Banda de paquetes (rose `#d8b8b5` al 50 %); `--rose` en las líneas de los pasos |
| `--terracotta` | `#d9a89e` | Script, estrellas, números de pasos, subrayados. 2.2:1: **solo decorativo**, nunca texto que haya que leer |
| `--slate` | `#3f444b` | Títulos, precios, nav |
| `--ash-text` | `#555555` | Cuerpo y botones (7.4:1). El original usa `#666`; se oscureció porque sobre sage no alcanzaba |
| `--mist` | `#e3e3e3` | Bordes y divisores |
| `--paper` | `#fffefc` | Fondo |

## Tipografía

| Rol | Familia | Peso | Detalle |
|---|---|---|---|
| Títulos | Young Serif | 400 | Mayúsculas y minúsculas. El original usa Nixie One; su trazo fino no se leía sobre las bandas |
| Script | Qwitcher Grypen | 700 | Una vez por pantalla, montado sobre un título, `rotate: -5deg` |
| Cuerpo | Raleway | 400–600 | 16px / 1.5 |
| Etiquetas, nav, links | Raleway | 600 | Mayúsculas, tracking 0.06–0.16em |
| Botones | Open Sans | 500 | Mayúsculas, tracking 0.17em |

## Forma

- Botones y chips: radio 3px, fondo `#555`, texto blanco.
- Fotos destacadas (hero, servicios, salón): **arco** arriba,
  `border-radius: 999px 999px 0 0`.
- Fotos de la tira de trabajos: sin radio, con marco blanco fino a 9px del borde.
- Avatares del equipo: círculo.

## Fotos

Las fotos de Serenity ya traen la paleta; las nuestras (Unsplash) no.
`theme.css` les aplica una gradación común (más luz, menos contraste y
saturación) y un velo rosado `soft-light`, más fuerte en las tres más
oscuras (`lavado`, `ondas`, `coloracion`). Acerca, no iguala: para llegar
al look del original hay que **cambiar las fotos** por otras claras, con
luz suave y fondos rosados o crema.

## Movimiento

- Entrada escalonada del hero, una vez por visita.
- Indicador de chip que se desliza; ítems de la lista entran escalonados.
- `scale(0.97)` al presionar; hover solo con puntero real.
- Todo se apaga con `prefers-reduced-motion` (regla global de `base.css`).

## Hacer / no hacer

- Hacer: separar secciones con bandas de color a sangre, no con líneas.
- Hacer: el script una sola vez por pantalla y siempre sobre un título.
- No: `--terracotta` como color de texto o de botón.
- No: sombras ni radios grandes en tarjetas; el sistema es plano.
