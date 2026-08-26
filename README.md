# Catálogo de demos web

Cinco páginas web de demostración para mostrar a clientes potenciales, más un
catálogo que las presenta con vista previa. HTML, CSS y JavaScript estáticos:
**sin frameworks, sin build, sin `npm`**. Se abre con doble clic en
`index.html` o se sirve como sitio estático.

## Estructura

```
.
├── index.html                  Catálogo con preview en iframe de cada demo
├── favicon.svg
├── .nojekyll                   Evita que GitHub Pages procese el sitio con Jekyll
├── assets/
│   ├── base.css                Reset + sistema de componentes compartido
│   ├── catalog.css             Estilos propios del catálogo
│   ├── nav.js                  Menú hamburguesa + scroll spy
│   └── reveal.js               Fade-up al entrar en viewport
└── templates/
    ├── landing-generica/       Vértice Estudio Web (landing de servicio)
    ├── restaurante/            La Parrilla del Sur
    ├── gimnasio/               FORJA Gym
    ├── profesional/            Camila Torres Abogada
    └── peluqueria/             Luna Studio
```

Cada template tiene la misma forma:

```
templates/<nombre>/
├── index.html
├── theme.css                   Variables de color y tipografía en :root
├── favicon.svg
└── images/                     Fotos .webp optimizadas
```

## Cómo funcionan los temas

`base.css` define los componentes y un `:root` con valores neutros.
`theme.css` de cada template sobreescribe esas variables (`--bg`, `--surface`,
`--text`, `--text-muted`, `--border`, `--accent`, `--accent-contrast`,
`--radius`, `--nav-bg`, `--font-heading`, `--font-body`, entre otras).

**El orden de carga importa**: `base.css` primero, `theme.css` después.

```html
<link rel="stylesheet" href="../../assets/base.css">
<link rel="stylesheet" href="./theme.css">
```

Para crear un template nuevo, copiá cualquier carpeta de `templates/`,
cambiá el bloque `:root` de su `theme.css` y reemplazá el contenido del
`index.html`.

## Ver el sitio en local

Doble clic en `index.html` alcanza para casi todo. Los previews del catálogo
usan `iframe` con rutas relativas, así que también funcionan sobre `file://`.

Si preferís un servidor local:

```bash
python3 -m http.server 8000
# luego abrí http://localhost:8000
```

## Publicar en GitHub Pages

1. Subí el repositorio a GitHub (rama `main`).
2. En el repo, entrá a **Settings → Pages**.
3. En **Source**, elegí **Deploy from a branch**.
4. En **Branch**, elegí `main` y la carpeta `/ (root)`. Guardá.
5. Esperá uno o dos minutos. La URL queda en
   `https://<usuario>.github.io/<repositorio>/`.

Notas:

- El archivo `.nojekyll` en la raíz ya está incluido. Sin él, GitHub Pages
  procesa el sitio con Jekyll y puede ignorar archivos o carpetas que empiecen
  con `_`.
- Todas las rutas del sitio son relativas, así que funciona igual publicado en
  la raíz del dominio (`usuario.github.io`) o en un subpath
  (`usuario.github.io/portafolio-webs`).
- Si usás un dominio propio, agregá un archivo `CNAME` en la raíz con el
  dominio y configurá el DNS según la documentación de GitHub Pages.

## Créditos y licencias

- **Fotografías**: [Unsplash](https://unsplash.com), bajo la Unsplash License
  (uso comercial permitido, sin atribución obligatoria). Descargadas y
  convertidas a `.webp` en `templates/<nombre>/images/` — el sitio no depende
  de ningún servicio externo para las imágenes.
- **Tipografías**: [Google Fonts](https://fonts.google.com), licencia SIL Open
  Font License. Se cargan por `<link>` desde el CDN de Google, sin build step.
- **Contenido**: los nombres de negocio, direcciones, teléfonos, precios,
  testimonios y personas son **ficticios** y existen solo para la
  demostración. Los mapas apuntan a una zona genérica de la ciudad, no a la
  dirección inventada.
