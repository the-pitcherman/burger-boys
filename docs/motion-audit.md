# Burger Boys: motion audit and v2.1 upgrade

Audited the build that was live at burger-boys.vercel.app (commit `e548dc9`): Vite 6 + TypeScript, GSAP 3.15 + ScrollTrigger, and one lazy Three.js hero scene. The live URL can't be reached from the build sandbox, so the "before" was measured on an identical local build of that commit at 1440×900 and 390×844 (Playwright). The recording is `ribbon-anatomy-before-after.mp4`.

## Bugs found (before)
| Area | Selector / code | Problem | Evidence |
| --- | --- | --- | --- |
| Pink ribbon | `#mq`, `motion.ts` `gsap.to('#mq',{xPercent:-50,repeat:-1})` + scroll `timeScale` | **Freezes.** Reversing an infinite `repeat:-1` tween near `totalTime 0` parks it at the start, and nothing restarts it until the next downward scroll. | Scroll down 500px right after load, then up: x = −65 → **0, 0, 0, 0, 0** for 2.5 s |
| Pink ribbon | same | Two `timeScale` tweens fight: an `overwrite:true` tween, then a delayed non-overwriting one. Speed jumps, and after an upward scroll the strip stays reversed at full speed until the next downward scroll. | Kept moving right at 1× for 3 s after scrolling stopped |
| Pink ribbon | same | Velocity multiplier up to 6×, reached in 0.2 s, so it flips abruptly. Two copies only (seam visible above a 2,368px-wide viewport). No reduced-motion branch (it just didn't run). | |
| Anatomy | `.anatomy` pin `+=170%`, one CSS var `--p` on `#anatBurger` | The burger opened in the first **16%** of the pin (~245px of scroll), then held for 68% with only a colour highlight changing. That's why it read as weak or static. No rotation, depth or settle; layers moved in lockstep. | Recording |
| Anatomy | `.anat-list` | Names and descriptions only in a side list, not tied to the layers. No "take it apart" control. Chips scrolled the page, but there was no button state. Mobile was pinned at 140% too. | |
| Hero | `.medallion` | CSS `spin` keyframes and GSAP transforms both target `.medallion`. A second GSAP tween and a CSS `transition` both write the sun face's transform. | Code |
| Takeaway | `#ticket`, `#seal` | Fire-once drops over the montage; no sequence. | |
| Menu / combo | `menuStage.ts`, `combo.ts` | No expanded view. Combo picks only swapped `srcset` with a scale pop. | |

## What changed (after)
| Priority | Implementation | Files |
| --- | --- | --- |
| **P1 Ribbon** | No tween any more: one `gsap.ticker` loop owns `x` with modulo wrap over 3 identical, measured groups (ResizeObserver).<ul><li>Base speed is one group width per 26 s.</li><li>Scroll velocity is clamped to ±3.2× and decays smoothly back to the reading direction.</li><li>Suns roll with the distance travelled.</li><li>Slight velocity skew, elastic settle on first entry, scalloped bottom edge.</li><li>Hover slows it to 30% (fine pointers only). It pauses off screen; reduced motion leaves it static.</li></ul> | `src/ts/ribbon.ts`, `motion.css` |
| **P2 Anatomy** | **One canonical timeline** with labels: `assembled → opening → inspect … inspectEnd → closing → closed`.<ul><li>Per-layer `--p` with staggered `back.out` springs.</li><li>Each layer has its own x-drift, rotation, rotateX tilt and scale (CSS vars).</li><li>Callouts live inside each layer, so they track it; dashed connectors.</li><li>Close sequence: shadow, contact squash and elastic settle, then the stamp.</li></ul>**Desktop:** ScrollTrigger scrubs the timeline (pin `+=155%`). The buttons and chips scroll to the matching label, so clicks and scroll never fight.<br>**≤900px:** no pin; the buttons `tweenTo` the same timeline, with a one-time auto-open on first view.<br>**Reduced motion:** static exploded view; the buttons still work (instant seek).<br>Hover spotlight, `aria-pressed` toggle, live status text. | `src/ts/anatomy.ts`, `page.ts` (anatomy), `motion.css` |
| **P3 Hero** | 1.7 s directed entrance. The LCP photo is only transformed, never hidden. Separate depth planes respond to the pointer (burger, shadow, medallion wrapper, stickers, price tag). The sun glances at the pointer, squints occasionally while visible, and spins with a burst on click. Gentler scroll-out. The `.med-wrap` wrapper fixes the CSS/GSAP transform conflict. | `motion.ts`, `page.ts` |
| **P4 Menu** | Each card has its own entrance (photo moves independently of card and type). Explore opens a spotlight dialog: a Flip.fit shared-element flight from the stage or card photo, ingredients and price, Add to bag and Combo link, focus trap, Esc. Add to bag: the photo token arcs to the bag, the bag compresses and rebounds, the count pops once, and a hidden nav reappears. | `src/ts/spotlight.ts`, `bag.ts`, `motion.css` |
| **P5 Combo** | Prices update first (`data-value` is the source of truth). Then the chosen thumbnail flies into its tray slot (Flip.fit proxy), the slot settles, the ticket nudges and the total counts. In-flight proxies are killed on rapid changes. Reduced motion swaps instantly. | `src/ts/combo.ts` |
| **P6 Takeaway** | The montage stays a still photo; separate paper props do the physical work in one scrubbed sequence: clip and scale reveal, tape strip, order ticket drop with a shadow lift→land, sun seal press, pickup photos tossed onto the table. | `motion.ts`, `page.ts`, `motion.css` |
| **P7 Ambient** | CSS loops (sun rays, clouds, medallion) pause off screen via IntersectionObserver. The counter's neon "switches on" when the interior photo enters. Masked headline reveals. | `src/ts/ambient.ts` |

Libraries: GSAP **Flip** and **ScrollToPlugin** were added (both ship in the existing `gsap` package). No new dependencies. Bundle: +14.6 KB gzip.

## Verified (local production build, Chromium/Playwright)
- **Ribbon:**
  - No stall after an early upward scroll: x keeps changing and returns leftward within ~2 s.
  - Idle cycle 26.0 s at 1440 and 25.7 s at 390.
  - A downward flick peaks around 3.4× and decays; an upward flick reverses smoothly, then eases back.
  - The 3 groups are identical in markup and width, and the track always covers the viewport.
  - No overflow. Static under reduced motion.
- **Anatomy at 1440:**
  - Scroll states read assembled → opening (springs overshoot to p≈1.07) → inspect (index 0→5 follows scroll) → closing → closed with the stamp.
  - Reverse scroll restores the open state and the right ingredient.
  - Put it back, ingredient click while closed, Reset, Take it apart and keyboard Space all land on the correct state and scroll position.
- **Anatomy at 390 and 768:** auto-open, chips, toggle, open-then-select from closed, and Reset all work. Not pinned.
- **Robustness:**
  - Rapid scroll ×3 and resizing across breakpoints mid-pin left one pin-spacer, 0 orphan proxies and no overflow.
  - Opening `/#menu` directly lands at the menu.
- **Regression:** 36/36 bag, combo and integrity checks pass with motion on and reduced motion on. 0 console errors.
- **Lighthouse mobile** (lab, 3 runs): performance 92/93/96, LCP 2.9/2.8/2.3 s, CLS 0, TBT 160–170 ms. Accessibility 96 (the known story word-reveal contrast flag), Best practices 100, SEO 100.

## Tradeoffs and open items
- Anatomy callouts show names only; the description expands on the active layer. Six full descriptions don't fit between the layers' real photo spacing.
- Mobile LCP moved from 2.2–2.7 s to 2.3–2.9 s (lab), mostly the larger main bundle (Flip + ScrollTo). The hero image is still the preloaded LCP element.
- No sun-shaped progress indicator or "dip the fry" mini-interaction (optional extras), to keep the hierarchy focused.
- Real iOS Safari hasn't been tested: emulated only. `overflow-x: clip` and container-query units need iOS 16+.
