# Burger Boys — image asset manifest

**Status: all photography is AI-generated concept imagery.** It is not documentary photography of an operating restaurant, real staff or real products. The footer of the site says so, and the venue images are captioned "concept render". Replace it with real photography once the restaurant, food and packaging exist.

## Source and generation
- **Tool:** AI image generation through Figma's image tools.
  - The 19 masters were generated in an earlier pass of this build. Their exact prompts and model weren't kept.
  - One hero regeneration (`gpt-image-2.5-flare`, BB Director plan) lives in the Figma file *Burger Boys — Website imagery (AI concept)* (`Fh5Q3fKP6ELkZC0q6t6GS0`). It isn't used on the site.
- **Art direction:**
  - Driven by the five Sunny Burger reference boards: sky blue / candy pink / sunshine yellow / mint, kraft, deep-teal interior, checkerboard floor, neon smiling sun, Amsterdam canal-house storefront.
  - Every readable brand mark in the images says **BURGER BOYS**. Checked visually: storefront fascia and hanging sign, bag, burger box, delivery bag.
- **Licensing:**
  - The images are AI outputs generated under Viktor's Figma account, so usage is subject to Figma's AI terms.
  - No stock photos, hotlinks or third-party photography are used.
  - The supplied mockup boards are **not** used as page imagery.
- **Masters:** full-quality PNGs in `assets-src/`. They're kept in the repo and never shipped.

## Processing pipeline
1. **Background removal:** `rembg` (isnet-general-use) for the hero burger and the exploded anatomy shot.
2. **Anatomy layers:** `scripts/cut_layers.py` splits the exploded shot into six layers that share one coordinate system and writes `src/content/anatomy-boxes.json`. The assembled overlaps are tuned in `src/render/page.ts` (`AY`).
3. **Hero depth map:** `scripts/make_depth.py` derives a pseudo-depth map from the cutout alpha (dome + luminance detail) for the Three.js parallax shader.
4. **Responsive variants:** `npm run images` (`scripts/build-images.mjs`, sharp) writes AVIF + WebP at the widths below and regenerates `src/content/images.json`. That file feeds intrinsic `width`/`height` and `srcset` into every `<picture>`.
5. **Loading:** only the hero is eager and `fetchpriority="high"`, and it's preloaded. Everything else is `loading="lazy"`.

## Assets in use (27 keys, all integrated in the page)
| Key | Master / derivation | Used in | Widths | Formats |
| --- | --- | --- | --- | --- |
| `hero-burger` | hero-burger.png → rembg cutout hero-burger-cut.png | Hero (LCP image) + Three.js depth-parallax texture; OG image | 420/720/1024 | avif, webp |
| `hero-depth` | hero-burger-depth.png (computed) | Three.js hero depth map (derived from hero cutout alpha, scripts/make_depth.py) | 512 | webp |
| `layer-bun-top` | anatomy-exploded.png → rembg → scripts/cut_layers.py | Anatomy layer 01 | 360/640 | avif, webp |
| `layer-lettuce` | anatomy-exploded.png → rembg → scripts/cut_layers.py | Anatomy layer 02 | 360/640 | avif, webp |
| `layer-tomato` | anatomy-exploded.png → rembg → scripts/cut_layers.py | Anatomy layer 03 | 360/640 | avif, webp |
| `layer-cheese` | anatomy-exploded.png → rembg → scripts/cut_layers.py | Anatomy layer 04 | 360/640 | avif, webp |
| `layer-patty` | anatomy-exploded.png → rembg → scripts/cut_layers.py | Anatomy layer 05 | 360/640 | avif, webp |
| `layer-bun-bottom` | anatomy-exploded.png → rembg → scripts/cut_layers.py | Anatomy layer 06 | 360 | avif, webp |
| `menu-smash` | menu-smash.png | Menu stage/card, combo builder, bag thumb, fly-to-bag | 480/760/1024 | avif, webp |
| `menu-bbq` | menu-bbq.png | Menu stage/card, combo builder, bag thumb | 480/760/1024 | avif, webp |
| `menu-special` | menu-special.png | Menu stage/card, combo builder, bag thumb | 480/760/1024 | avif, webp |
| `menu-truffle` | menu-truffle.png | Menu stage/card, combo builder, bag thumb | 480/760/1024 | avif, webp |
| `side-fries` | side-fries.png | Sides grid (feature card), combo tray | 400/720 | avif, webp |
| `side-truffle-fries` | side-truffle-fries.png | Sides grid | 400/720 | avif, webp |
| `drink-lemonade` | drink-lemonade.png | Sides grid, combo builder/tray | 400/720 | avif, webp |
| `drink-shake` | drink-shake.png | Sides grid, combo builder/tray | 400/720 | avif, webp |
| `dip-spicy` | dips-trio.png (crop) | Dip selector, combo builder (cropped from dips-trio) | 240/440 | avif, webp |
| `dip-boys` | dips-trio.png (crop) | Dip selector, combo builder/tray (cropped from dips-trio) | 240/440 | avif, webp |
| `dip-truffle` | dips-trio.png (crop) | Dip selector, combo builder (cropped from dips-trio) | 240/440 | avif, webp |
| `storefront` | storefront.png | Visit — storefront | 480/760/1024 | avif, webp |
| `interior-counter` | interior-counter.png | Story — counter interior | 640/1024/1536 | avif, webp |
| `interior-seating` | interior-seating.png | Visit — seating | 640/1024/1536 | avif, webp |
| `pickup-handoff` | pickup-handoff.png | To go — handoff | 640/1024/1536 | avif, webp |
| `pickup-shelf` | pickup-shelf.png | To go — pickup shelf / delivery bag | 480/760/1024 | avif, webp |
| `packaging-set` | packaging-set.png | To go — packaging stage (ticket + seal choreography) | 640/1024/1536 | avif, webp |
| `griddle-smash` | griddle-smash.png | Story — preparation | 640/1024/1536 | avif, webp |
| `lifestyle-bite` | lifestyle-bite.png | Story — food in hand | 480/760/1024 | avif, webp |

## Other generated assets
- `public/og.jpg`: Open Graph card, rendered from `scripts/og-template.html` (Playwright screenshot).
- `public/favicon.svg`, `public/apple-touch-icon.png`: the brand sun (`scripts/make-icons.mjs`).
- `public/fonts/archivo-latin-wdth.woff2`: Archivo variable (SIL OFL 1.1), subset and axis-restricted by `scripts/subset_font.py` (90 KB → 50 KB). DM Mono 500 (SIL OFL 1.1).

## Not produced
- **Preparation/handoff video loop:** optional in the brief. No genuinely good clip was available, so none ships rather than a weak one.
- **Uniform photography:** the uniform board wasn't turned into a page image. The staff apron appears in the handoff shot.
