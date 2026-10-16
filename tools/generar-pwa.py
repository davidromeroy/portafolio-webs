#!/usr/bin/env python3
"""
generar-pwa.py — íconos y splash de una PWA a partir de un SVG

Genera, desde un ícono SVG cuadrado:
  icons/icon-192.png, icons/icon-512.png, icons/icon-maskable-512.png,
  icons/apple-touch-icon.png (180, sin transparencia) e
  icons/splash/splash-<ancho>x<alto>.png (12 tamaños de iPhone y iPad),
e imprime las líneas para el <head> y el bloque "icons" del manifest.

Requisito: rsvg-convert (brew install librsvg). Sin dependencias de Python.

Uso:
  python3 tools/generar-pwa.py --svg templates/gimnasio/icons/icon.svg \
      --bg "#000000" --out templates/gimnasio

  --svg     Ícono cuadrado. Para el maskable, el logo tiene que caber en el
            círculo central del 80 % (Android lo recorta).
  --bg      Color de fondo del splash (el mismo que background_color del
            manifest).
  --marca   SVG opcional para el centro del splash (logo + nombre). Si no
            se pasa, usa el ícono.
  --out     Carpeta de la página (donde está el index.html). Crea icons/.
  --ancho   Ancho de la marca en el splash, en % del ancho de pantalla
            (por defecto 22).
"""

import argparse
import base64
import os
import shutil
import subprocess
import sys

# (ancho px, alto px, device-width pt, device-height pt, pixel ratio)
SPLASH = [
    (1320, 2868, 440, 956, 3),   # iPhone 16 Pro Max
    (1206, 2622, 402, 874, 3),   # iPhone 16 Pro
    (1290, 2796, 430, 932, 3),   # iPhone 15/14 Pro Max, 15/16 Plus
    (1179, 2556, 393, 852, 3),   # iPhone 15/16, 14 Pro
    (1284, 2778, 428, 926, 3),   # iPhone 12/13 Pro Max, 14 Plus
    (1170, 2532, 390, 844, 3),   # iPhone 12/13/14
    (1125, 2436, 375, 812, 3),   # iPhone X/XS/11 Pro, 12/13 mini
    (1242, 2688, 414, 896, 3),   # iPhone XS Max/11 Pro Max
    (828, 1792, 414, 896, 2),    # iPhone XR/11
    (750, 1334, 375, 667, 2),    # iPhone SE 2/3, 8
    (1640, 2360, 820, 1180, 2),  # iPad Air
    (2048, 2732, 1024, 1366, 2), # iPad Pro 12.9
]


def render(svg_text, out, w, h):
    subprocess.run(["rsvg-convert", "-w", str(w), "-h", str(h), "-o", out],
                   input=svg_text.encode("utf-8"), check=True)


def data_uri(path):
    with open(path, "rb") as f:
        return "data:image/svg+xml;base64," + base64.b64encode(f.read()).decode("ascii")


def viewbox_ratio(path):
    """Alto/ancho del viewBox del SVG, para no deformar la marca."""
    import re
    txt = open(path, encoding="utf-8").read()
    m = re.search(r'viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)', txt)
    return float(m.group(2)) / float(m.group(1)) if m else 1.0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--svg", required=True)
    ap.add_argument("--bg", default="#000000")
    ap.add_argument("--marca")
    ap.add_argument("--out", required=True)
    ap.add_argument("--ancho", type=float, default=22.0)
    a = ap.parse_args()

    if not shutil.which("rsvg-convert"):
        sys.exit("Falta rsvg-convert: brew install librsvg")

    icons = os.path.join(a.out, "icons")
    splash_dir = os.path.join(icons, "splash")
    os.makedirs(splash_dir, exist_ok=True)
    icon_svg = open(a.svg, encoding="utf-8").read()

    for size, name in [(192, "icon-192.png"), (512, "icon-512.png"),
                       (512, "icon-maskable-512.png"), (180, "apple-touch-icon.png")]:
        render(icon_svg, os.path.join(icons, name), size, size)

    marca = a.marca or a.svg
    uri = data_uri(marca)
    ratio = viewbox_ratio(marca)
    links = []
    for w, h, dw, dh, r in SPLASH:
        mw = w * a.ancho / 100
        mh = mw * ratio
        x, y = (w - mw) / 2, (h - mh) / 2
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
               f'width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
               f'<rect width="{w}" height="{h}" fill="{a.bg}"/>'
               f'<image x="{x:.1f}" y="{y:.1f}" width="{mw:.1f}" height="{mh:.1f}" xlink:href="{uri}"/></svg>')
        name = f"splash-{w}x{h}.png"
        render(svg, os.path.join(splash_dir, name), w, h)
        links.append(
            f'<link rel="apple-touch-startup-image" href="./icons/splash/{name}" '
            f'media="(device-width: {dw}px) and (device-height: {dh}px) and '
            f'(-webkit-device-pixel-ratio: {r}) and (orientation: portrait)">')

    print("\n<!-- 1. En el <head> -->")
    print('<link rel="manifest" href="./manifest.webmanifest">')
    print('<link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">')
    print("\n".join(links))
    print('\n<!-- 2. En manifest.webmanifest, "icons" -->')
    print('''"icons": [
  { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
  { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
  { "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
]''')
    print(f"\nListo: {len(links)} splash + 4 íconos en {icons}")


if __name__ == "__main__":
    main()
