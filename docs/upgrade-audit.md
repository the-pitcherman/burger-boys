# Burger Boys — upgrade audit

Audited: `Burger Boys — Guilt-free pleasures` (single self-contained HTML, v1), plus the five Sunny Burger art-direction boards (packaging spread, delivery/pickup, uniforms, storefront, counter interior).

No Git repo, framework or Vercel config existed for v1 — it was a single 377 KB HTML file with GSAP, ScrollTrigger and two fonts inlined as base64.

## What stays
- **Name and identity:** BURGER BOYS wordmark with the smiling scalloped sun, sky blue / candy pink / sunshine yellow / mint / deep teal / kraft / ink palette, scalloped "cloud" edges, round sticker badges, heavy Archivo display type.
- **Voice and core lines:** "Guilt-free pleasures", "Good mood food", "100% plant-based. 100% delicious."
- **Section order and content:** hero → marquee → ingredient anatomy → four signature burgers (Smash Classic €9,95, BBQ Bacon €11,50, Boys Special €11,95, Truffle Delight €11,50) → combo (+€3,95: fries & a dip + any drink) → sides & sips → dips (€1,00) → to-go → story → order ahead → visit → footer.
- **Working features:** bag drawer (quantities, combo flag, totals, focus trap, Esc), fly-to-bag feedback, mobile menu, reduced-motion path, GSAP scroll choreography.

## What changes
| Area | v1 | v2 |
| --- | --- | --- |
| Imagery | Zero photos; every burger, pot, bag and shop was an SVG illustration | 19 photoreal art-directed concept images + hero cutout + 6 photographic ingredient layers, optimised to AVIF/WebP |
| Hero | SVG burger dropping in | Photographic cutout burger; lazy Three.js depth-parallax scene on fine-pointer devices, with the still image as LCP and fallback |
| Anatomy | SVG layers | Photo layers split from one exploded shot (consistent light); scroll-driven + tap/click ingredient chips; shorter pin |
| Menu | Equal pastel cards in a pinned horizontal scroller | Editorial stage: big photo of the active burger on its colour, swapping on hover/focus/click; every price and description visible without interaction |
| Combo | A card that only opened the bag | Real combo builder (burger, dip, drink) priced from the same data as the bag |
| Sides/dips | SVG pots | Photo cards and a dip selector |
| To-go, story, visit | SVG packaging and storefront | Packaging, pickup, griddle, interior and storefront photography |
| Content model | Prices duplicated in markup and JS | One typed model (`src/content/menu.ts`) renders the markup at build time and drives bag/combo pricing |
| Fonts/assets | Base64 inline (slow first paint) | Self-hosted woff2 files, preloaded; responsive images with width/height (no CLS) |

## Defects and risks found in v1
1. **Misleading demo behaviour:**
   - Checkout produced a random "order confirmed" number.
   - The newsletter said "You're in the Good Mood Crew".
   - The address (12 Sunshine Street) and opening hours read as fact.
   - The phone mock named a customer and a delivery address.
2. The pinned horizontal menu hid four of the five cards until the visitor scrolled. Keyboard focus needed a workaround.
3. The anatomy pin ran for 220% of the viewport with no non-scroll way to read each layer.
4. The inline base64 fonts and GSAP produced a 377 KB HTML document, which delays the first paint.
5. No favicon, Open Graph image, 404 page or build tooling.
6. The illustration-only food didn't make anyone hungry, which is the core business problem.

## Honesty decisions
- **Checkout** is now an explicit **demo checkout**. The button says "Place demo order", and the confirmation states that nothing was ordered or charged. No order number pretends to be real.
- **Newsletter** removed. In its place: "Sign-ups open soon", with no form that pretends to work.
- **Location, hours, socials, delivery apps:** shown as **sample / to be confirmed**, with no map link to a made-up address and no delivery-app buttons.
- **No structured data (JSON-LD)** until business details are verified.
- **All photography is AI-generated concept imagery.** It's labelled as such in the footer and in `docs/assets.md`.

## Architecture
- **Vite 6 + TypeScript, no UI framework.** The page is static content plus GSAP choreography; React would add hydration cost without new capability. A small Vite plugin renders sections from the typed content model at build time, so the HTML is complete before any script runs (SEO, no-JS, LCP).
- **GSAP + ScrollTrigger** own scroll choreography: anatomy, packaging, typography. They're scoped with `gsap.matchMedia()` for desktop, mobile and reduced-motion.
- **Three.js:** exactly one scene, the hero depth-parallax burger. It's dynamically imported after load, only on fine-pointer devices with motion allowed. DPR is capped at 1.5, it renders only while visible, and on context loss it hands back to the `<img>`.
- **CSS** handles hovers, buttons and the ambient sun spin.
- **Not used:**
  - Lenis: native scrolling keeps anchors, mobile momentum and assistive tech intact.
  - Motion: GSAP and CSS already cover every state transition.
