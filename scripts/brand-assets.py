"""Generate favicons and Open Graph images from the logo geometry in src/lib/brand.ts.

Run from the project root:  python3 -I scripts/brand-assets.py
Requires: pip install playwright && playwright install chromium
"""

from __future__ import annotations

import base64
import pathlib
import re
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
BRAND_TS = (ROOT / "src/lib/brand.ts").read_text(encoding="utf-8")
SEGMENTS_TS = (ROOT / "src/data/segments.ts").read_text(encoding="utf-8")
FONTS = ROOT / "node_modules/@fontsource-variable"


def const(name: str) -> str:
    match = re.search(rf"export const {name} =\s*'([^']+)'", BRAND_TS)
    if not match:
        sys.exit(f"brand.ts: {name} not found")
    return match.group(1)


SYMBOL = const("SYMBOL_PATH")
SQUARE = const("SYMBOL_SQUARE_PATH")
K = const("SYMBOL_K_PATH")
CHEVRON = const("WORDMARK_CHEVRON")
STROKES = re.findall(r"'(M[^']+)'", BRAND_TS.split("WORDMARK_STROKES = [", 1)[1].split("] as const", 1)[0])
CIRCLES = re.findall(r"cx: (\d+), cy: (\d+), r: (\d+)", BRAND_TS)

if not STROKES or len(CIRCLES) != 2:
    sys.exit("brand.ts: wordmark geometry not parsed")

INK, PAPER, LINE, MUTE, ASH = "#09090B", "#FAFAFA", "#27272A", "#71717A", "#A1A1AA"


def horizontal(color: str) -> str:
    strokes = "".join(f'<path d="{d}"/>' for d in STROKES)
    circles = "".join(f'<circle cx="{cx}" cy="{cy}" r="{r}"/>' for cx, cy, r in CIRCLES)
    return (
        f'<svg viewBox="0 0 575 144" style="height:40px;display:block">'
        f'<path d="{SYMBOL}" fill="{color}" fill-rule="evenodd"/>'
        f'<g transform="translate(184 22)"><g fill="none" stroke="{color}" stroke-width="16">{strokes}{circles}</g>'
        f'<polygon points="{CHEVRON}" fill="{color}"/></g></svg>'
    )


def segment_headlines() -> dict[str, str]:
    pairs = re.findall(r"slug: '([a-z]+)',.*?headline: '([^']+)'", SEGMENTS_TS, re.S)
    return dict(pairs)


def font_face(family: str, path: pathlib.Path, weights: str) -> str:
    # Inlined as data URLs: pages built with set_content cannot fetch file:// fonts.
    data = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"@font-face {{ font-family: {family}; src: url(data:font/woff2;base64,{data}) format('woff2'); font-weight: {weights}; }}"


FONT_CSS = "\n".join(
    [
        font_face("Inter", FONTS / "inter/files/inter-latin-wght-normal.woff2", "100 900"),
        font_face("Mono", FONTS / "jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2", "100 800"),
    ]
)


def og_html(headline: str, route: str) -> str:
    cross = lambda x, y: (  # noqa: E731
        f'<div style="position:absolute;left:{x - 8}px;top:{y}px;width:17px;height:1px;background:{MUTE}"></div>'
        f'<div style="position:absolute;left:{x}px;top:{y - 8}px;width:1px;height:17px;background:{MUTE}"></div>'
    )
    g = "rgba(250,250,250,0.09)"
    construct = ",".join(
        f"linear-gradient(to bottom, transparent {o}em, {g} {o}em, {g} calc({o}em + 1px), transparent calc({o}em + 1px))"
        for o in (0.145, 0.329, 0.882)
    )
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{FONT_CSS}
    * {{ box-sizing: border-box; }}
    body {{ margin:0; width:1200px; height:630px; background:{INK}; color:{PAPER}; font-family:Inter; position:relative; overflow:hidden; }}
    .v {{ position:absolute; top:0; bottom:0; width:1px; background:{LINE}; }}
    .h {{ position:absolute; left:0; right:0; height:1px; background:{LINE}; }}
    .band {{ position:absolute; left:65px; right:65px; top:121px; height:389px; display:flex; align-items:center; }}
    h1 {{ width:100%; margin:0; padding:0 47px; font-size:68px; line-height:1.05;
          font-weight:600; letter-spacing:-0.045em; text-wrap:balance; background-image:{construct}; background-size:100% 1.05em; background-repeat:repeat-y; }}
    .label {{ font-family:Mono, monospace; font-size:20px; color:{ASH}; position:absolute; top:550px; }}
    </style></head><body>
    <div class="v" style="left:64px"></div><div class="v" style="left:1136px"></div>
    <div class="h" style="top:120px"></div><div class="h" style="top:510px"></div>
    {cross(64,120)}{cross(1136,120)}{cross(64,510)}{cross(1136,510)}
    <div style="position:absolute;left:112px;top:40px">{horizontal(PAPER)}</div>
    <div class="band"><h1>{headline}</h1></div>
    <div class="label" style="left:112px">software house · Belém, PA</div>
    <div class="label" style="right:112px;color:{PAPER}">{route}</div>
    </body></html>"""


def main() -> None:
    PUBLIC.mkdir(exist_ok=True)
    (PUBLIC / "og").mkdir(exist_ok=True)

    favicon = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">'
        f"<style>path{{fill:{INK}}}@media (prefers-color-scheme:dark){{path{{fill:{PAPER}}}}}</style>"
        f'<path d="{SYMBOL}" fill-rule="evenodd"/></svg>\n'
    )
    (PUBLIC / "favicon.svg").write_text(favicon, encoding="utf-8")

    headlines = segment_headlines()
    if len(headlines) != 4:
        sys.exit(f"segments.ts: expected 4 headlines, got {len(headlines)}")

    pages = {
        "default": ("Você descreve o problema.<br>A gente escreve o sistema.", "bkode"),
        "cases": ("Projetos que já construímos.", "/cases"),
        "marca": ("Um K que também é código.", "/marca"),
        **{slug: (text, f"/{slug}") for slug, text in headlines.items()},
    }

    with sync_playwright() as p:
        browser = p.chromium.launch()

        icon = browser.new_page(viewport={"width": 48, "height": 48})
        icon.set_content(
            f'<body style="margin:0"><svg viewBox="0 0 144 144" width="48" height="48">'
            f'<path d="{SQUARE}" fill="{INK}"/><path d="{K}" fill="{PAPER}"/></svg></body>'
        )
        icon.screenshot(path=str(PUBLIC / "favicon-48.png"), omit_background=True)

        touch = browser.new_page(viewport={"width": 180, "height": 180})
        touch.set_content(
            f'<body style="margin:0;background:{INK}"><svg viewBox="0 0 144 144" width="180" height="180">'
            f'<path d="{K}" fill="{PAPER}"/></svg></body>'
        )
        touch.screenshot(path=str(PUBLIC / "apple-touch-icon.png"))

        og = browser.new_page(viewport={"width": 1200, "height": 630})
        for name, (headline, route) in pages.items():
            og.set_content(og_html(headline, route))
            og.evaluate("Promise.all([...document.fonts].map((f) => f.load())).then(() => document.fonts.ready)")
            og.wait_for_timeout(150)
            og.screenshot(path=str(PUBLIC / "og" / f"{name}.png"))
            print(f"og/{name}.png")

        browser.close()


if __name__ == "__main__":
    main()
