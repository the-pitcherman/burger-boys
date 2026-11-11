# Burger Boys v2: handoff

## What's live
- **Not deployed to Vercel yet. Blocker below.**
- **Private preview (Claude artifact):** the same production `dist/` build, hosted as a private Claude artifact. Shareable from its page on claude.ai.

## Implemented
| Section | What it does |
| --- | --- |
| **Hero** | Oversized BURGER BOYS lockup and photoreal cutout burger on a pink scalloped medallion that spins slowly. The photo is the LCP image; it's preloaded and never hidden. On fine-pointer devices a lazy Three.js depth-parallax shader adds per-pixel dimension, along with pointer tilt and parallax stickers. Clicking the sun spins it and bursts mini suns. CTAs: See the menu → `#menu`, Find us → `#visit`. |
| **Anatomy** | Six photographic layers cut from one exploded shot, so lighting and perspective match. A scroll-scrubbed pin opens the burger, spotlights each ingredient with its name and copy, then reassembles it and stamps "Zero animals. All flavour." Ingredient chips (buttons) jump to any layer, or open it statically under reduced motion. The pin runs 170% of the viewport on desktop and 140% on mobile. |
| **Menu** | Editorial stage with the active burger's photo on its brand colour. Hover, focus or click wipes in the next photo from the pointer. Every name, description, price, Add and Combo link is visible without any interaction. On mobile and tablet, each burger gets its own photo card. |
| **Combo builder** | Burger (4), dip (3) and drink (2) are radio inputs. The kraft tray collage swaps photos. Total = burger + €3,95 (Good Mood Fries, a dip and any drink, as on v1). Add combo → bag. |
| **Sides, sips & dips** | Photo grid with Add buttons. The three dip pots rotate and lift their labels on hover/focus. |
| **To go** | Packaging photo stage: a pink order ticket lands on the bag (scroll-scrubbed) and a sun sticker seals the box. Pickup-shelf and handoff photos slide in. A clear "ordering isn't live yet" note. |
| **Story** | Word-by-word scroll reveal, griddle/prep photo, a bouncing GOOD MOOD FOOD type moment, a scroll-rotating sun badge, counter and food-in-hand photos, and stat cards. |
| **Visit** | Storefront and seating concept renders. The location card is labelled *Demo · details to be confirmed* and the hours *sample*. No directions link to a made-up address. |
| **Footer** | Wordmark letters jump in, and the sun's face follows the pointer. Newsletter says sign-ups open soon (no form). Socials are marked "coming soon". AI-imagery and demo disclosure. |
| **Bag** | Add/remove, quantities, combo toggle with dip/drink selects, line merging, totals from `menu.ts`, sessionStorage persistence, focus trap, Esc, scrim close, fly-to-bag photo animation, toast. Checkout button reads "Place demo order". The confirmation says no order was placed and nothing was charged. |
| **Mobile** | Bottom dock (Menu · Bag · Visit), full-screen menu, per-burger photo cards, chip-grid anatomy. |

## Tested here
- **Build and code checks:** `tsc --noEmit` ✓, `eslint` ✓, `prettier --check` ✓, `vite build` ✓.
- **Interactions** (Playwright on the production build, Chromium, motion **and** reduced motion), 18 checks each, all pass:
  - The menu stage swaps and `aria-pressed` updates.
  - Bag count and totals are right. Example: 2× Smash Classic + Truffle Mayo Fries + dip + Boys Special combo = €41,05. The combo toggle adds €3,95 per burger.
  - Combo builder: Boys Special combo = €15,90. Menu combo links preselect the burger.
  - Combo drink change, quantity decrement, focus moves into the drawer, Shift+Tab trap, demo checkout copy, Esc closes, anatomy chips.
  - Every `#anchor` target exists, all 27 image keys load, no page errors.
- **Mobile (390×844, touch):** add from a menu card, dock badge updates, bag opens, mobile menu opens and navigates. No horizontal overflow at 390, 768 or 1440.
- **Screenshots** at 1440, 768 and 390 compared against the five reference boards for palette, scallops, sun, kraft, teal interior and checkerboard.
- **Lighthouse lab results** (local `vite preview`; lab, not field):

  | Run | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
  | --- | --- | --- | --- | --- | --- | --- | --- |
  | Mobile (3 runs, simulated slow 4G) | 95 / 95 / 97 | 96 | 100 | 92 → robots.txt now added | 2.7 / 2.5 / 2.2 s | 0 | 120–170 ms |
  | Desktop | 100 | — | — | — | 0.6 s | — | — |

## Not tested
- Real iOS Safari and Android Chrome devices (only emulated in Chromium).
- Field Web Vitals: needs real traffic.
- A screen reader pass (semantics were checked by hand and with Lighthouse only).

## Known limitations and tradeoffs
- **Contrast flag:** the story's word-by-word reveal starts words at 22% opacity, which Lighthouse marks as low contrast while they're unrevealed. The text is complete for assistive tech, and reduced-motion users get full contrast.
- **three.js chunk** is ~130 KB gzip. It loads only after `load`, on fine-pointer devices with motion allowed, and the still photo stays as the fallback.
- **Imagery is AI concept imagery** (see `docs/assets.md`). Replace it with real photography before launch.
- **Unconfirmed business details** (address, hours, socials, delivery apps, ordering provider) are still placeholders by design.

## Deployment blocker and next commands
Creating a GitHub repository from this session was refused by a permission check. Pushing binaries through the Vercel API one tool call at a time isn't practical (6 MB build plus 42 MB masters). The site is committed locally on `main`.

To deploy from your machine, unpack the git bundle first: `git clone burger-boys-v2.bundle burger-boys`. Then:

```bash
cd burger-boys
gh repo create the-pitcherman/burger-boys --private --source . --push
# then either connect the repo in Vercel (Add New → Project → Import), or:
npx vercel link --yes --project burger-boys
npx vercel            # preview
npx vercel --prod     # production, once the preview checks out
```
Vercel settings are in `vercel.json`: framework Vite, build `npm run build`, output `dist`, immutable caching for `/images` and `/fonts`.

## Next priority
Replace the AI concept photography with a real shoot (hero, four burgers, storefront) once the venue exists. Then confirm the address and hours so the location card and JSON-LD can go live.
