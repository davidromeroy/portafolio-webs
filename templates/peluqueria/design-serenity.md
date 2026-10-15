# Serenity Hair — Style Reference

> Fuente: https://serenityhairblaxland.com.au/ (Awwwards Nominee 2025, hatchlingweb).
> Valores extraídos el 2026-10-15 con `getComputedStyle` desde el navegador,
> no de un generador de terceros. Aplicado a Luna Studio en `serenity.html`.

**Tema:** claro. Calidez de salón de barrio bien cuidado, no de clínica ni de
revista. La paleta sale del mural pintado a mano del local.

## Colores

| Nombre | Valor | Rol en el original |
|---|---|---|
| Sage | `#c3ccc3` (al 50–75 % sobre blanco) | Banda del hero, bloque de testimonios, mosaico "galería" |
| Peach | `#ffe4cf` | Bloque detrás de la foto del hero, mosaico "equipo", footer |
| Dusty Rose | `#d8b8b5` (al 50 %) | Banda de extensiones, mosaico "servicios" |
| Terracotta Rose | `#d9a89e` | Link activo del nav, acentos. 2.2:1 sobre blanco: **solo decorativo**, nunca texto |
| Ash Text | `#666666` | Cuerpo, títulos, botón |
| Deep Slate | `#3f444b` | Texto de mayor peso |
| Cream | `#f9f8f5` | Texto sobre bandas oscuras, superficies |
| Hairline | `#e3e3e3` | Bordes y divisores |

## Tipografía

| Rol | Familia | Peso | Tamaño | Detalle |
|---|---|---|---|---|
| Script de acento | Qwitcher Grypen | 400 | 70px | Una sola vez por pantalla, montado sobre el título ("Hey & welcome!") |
| Títulos | Nixie One | 400 | 28–35px | Mayúsculas en el hero, mixto en secciones |
| Cuerpo | Raleway | 400 | 16–18px / 1.5 | `#666666` |
| Etiquetas y nav | Raleway | 500–600 | 14–16px | Mayúsculas |
| Botones | Open Sans | 500 | 14–16px | Mayúsculas, `letter-spacing: 2.72px` (~0.17em) |

## Forma

- Botones: radio 3px, padding 12×24px, fondo `#666666`, texto blanco (5.7:1).
- Fotos de servicios: marco fino de 1px con un pequeño inset, sin radio.
- Fotos destacadas: **arco** arriba (`border-radius: 999px 999px 0 0`).
- Sin sombras. La profundidad sale de bloques de color superpuestos.

## Componentes firma

1. **Hero partido:** banda sage a sangre; a la izquierda, una foto con arco sobre un bloque durazno que se sale de la banda; a la derecha, el script de bienvenida, el título serif en mayúsculas, el cuerpo y el botón.
2. **Mosaicos de navegación:** tres bloques de color (durazno, rosa, sage) con "VIEW OUR" chico y la palabra grande.
3. **Servicios en 4 columnas:** foto vertical con marco fino, título serif centrado y párrafo corto.
4. **Banda de testimonios:** fondo sage, citas centradas, flechas laterales y puntos.
5. **Tira de Instagram** y **footer durazno**.

## Do / Don't

- Do: alternar bandas de color a sangre para separar secciones, sin líneas.
- Do: usar el script una sola vez por pantalla, y siempre superpuesto a un título.
- Don't: usar `#d9a89e` como color de texto o de botón (no pasa contraste).
- Don't: agregar sombras ni radios grandes en cards; el sistema es plano.
