# FORJA Gym — versiones archivadas

Versiones anteriores de la demo de gimnasio, guardadas para comparar y
rescatar ideas. **No se enlazan desde ningún lado** (ni el catálogo ni la
demo publicada) y llevan `noindex`. La versión actual es
`templates/gimnasio/index.html`.

Cada carpeta está **congelada**: trae su propia copia del CSS con que se
aprobó. Si la demo actual cambia su `theme.css`, estas no se rompen.
Solo comparten `assets/` del catálogo y `../images/` (por eso las fotos de
la versión actual llevan nombres nuevos: `hero-1600.webp`, `inst-*.webp`,
`coach-*-600.webp`; las de la industrial no se tocan).

| Carpeta | Qué es | Fecha | Por qué quedó atrás |
|---|---|---|---|
| `industrial/` | Galpón industrial: fondo `#0c0c0d`, acento lima `#d8ff33`, Oswald + Barlow, radio 2–3px, barra diagonal de advertencia en el hero | oct 2026 | Estructura de plantilla compartida por las 5 demos; en móvil medía ~12.200px (disciplinas, planes y equipo apilados). Reemplazada por el rediseño estilo WHOOP |

## Comparar

Abrir `comparar.html` (desde el servidor local o la URL de Vercel con la
ruta completa). Cada lado tiene un selector con la actual y las archivadas.

## Contexto

Bóveda David: `Proyectos/portafolio-web/gimnasio/00 - Descripción General`.
