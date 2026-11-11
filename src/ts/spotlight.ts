/**
 * P4 · Menu spotlight. A shared-element transition with GSAP Flip.fit: a fixed proxy of the clicked photo
 * flies from the menu (stage photo on desktop, card photo on mobile) into the dialog, and back on close.
 * The proxy lives on <body>, so nothing is clipped by the sticky stage's overflow, and the real menu DOM never moves.
 */
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { BURGERS, COMBO_UPCHARGE, eur, type BurgerId } from '../content/menu';
import { srcset } from '../content/images';
import { $, $$, motionOK, trapFocus } from './dom';
import { selectComboBurger } from './combo';

gsap.registerPlugin(Flip);

let openId: BurgerId | null = null;
let source: HTMLImageElement | null = null;
let lastFocus: HTMLElement | null = null;
let untrap: (() => void) | null = null;

/** the photo the visitor is actually looking at for this burger */
function sourceImg(id: BurgerId): HTMLImageElement | null {
  const card = $<HTMLImageElement>(`.mi[data-id="${id}"] .mi-photo img`);
  if (card && card.offsetParent !== null && card.getBoundingClientRect().width > 0) return card;
  return $<HTMLImageElement>(`.stage-img[data-id="${id}"] img`);
}

function proxy(from: HTMLImageElement): HTMLImageElement {
  const r = from.getBoundingClientRect();
  const p = document.createElement('img');
  p.src = from.currentSrc || from.src;
  p.alt = '';
  p.className = 'flip-proxy';
  Object.assign(p.style, {
    left: `${r.left}px`,
    top: `${r.top}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    borderRadius: getComputedStyle(from.closest('.stage, .mi-photo') ?? from).borderRadius,
  });
  document.body.appendChild(p);
  return p;
}

export function openSpotlight(id: BurgerId, trigger?: HTMLElement | null) {
  const b = BURGERS.find((x) => x.id === id);
  if (!b) return;
  openId = id;
  lastFocus = trigger ?? (document.activeElement as HTMLElement);
  source = sourceImg(id);

  const spot = $('#spot')!,
    scrim = $('#spotScrim')!,
    img = $<HTMLImageElement>('#spotImg')!;
  img.srcset = srcset(b.image, 'webp');
  img.sizes = '(max-width: 900px) 90vw, 560px';
  img.src = img.srcset.split(' ')[0];
  img.alt = b.alt;
  $('#spotMedia')!.style.setProperty('--bg', b.bg);
  $('#spotTitle')!.innerHTML = `<small>The</small> ${b.short}`;
  $('#spotDesc')!.textContent = b.blurb;
  $('#spotIng')!.innerHTML = b.ingredients.map((x) => `<li>${x}</li>`).join('');
  $('#spotPrice')!.textContent = eur(b.price);
  $('#spotAdd')!.dataset.add = id;
  $('#spotAdd')!.setAttribute('aria-label', `Add ${b.name} to bag`);
  const combo = $<HTMLAnchorElement>('#spotCombo')!;
  combo.dataset.comboPick = id;
  combo.textContent = `Make it a combo +${eur(COMBO_UPCHARGE)}`;

  spot.hidden = false;
  scrim.hidden = false;
  document.body.style.overflow = 'hidden';
  untrap = trapFocus(spot);
  $('#spotClose')!.focus({ preventScroll: true });

  if (!motionOK() || !source) return;
  const p = proxy(source);
  img.style.visibility = 'hidden';
  source.style.visibility = 'hidden';
  gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.35 });
  gsap.fromTo('.spot-card', { '--card': 0 }, { '--card': 1, duration: 0.5, ease: 'power2.out' });
  gsap.from('.spot-body > *', { x: 40, opacity: 0, stagger: 0.05, duration: 0.55, delay: 0.25, ease: 'power3.out', clearProps: 'all' });
  Flip.fit(p, img, {
    duration: 0.7,
    ease: 'power3.inOut',
    absolute: true,
    onComplete: () => {
      img.style.visibility = '';
      p.remove();
    },
  });
  gsap.to(p, { borderRadius: 24, duration: 0.7 });
}

export function closeSpotlight(instant = false) {
  const spot = $('#spot')!,
    scrim = $('#spotScrim')!,
    img = $<HTMLImageElement>('#spotImg')!;
  if (spot.hidden) return;
  const src = source;
  const finish = () => {
    spot.hidden = true;
    scrim.hidden = true;
    document.body.style.overflow = '';
    if (src) src.style.visibility = '';
    img.style.visibility = '';
    untrap?.();
    lastFocus?.focus?.({ preventScroll: true });
    openId = null;
  };
  if (instant || !motionOK() || !src) return finish();
  const p = proxy(img);
  img.style.visibility = 'hidden';
  gsap.to(scrim, { opacity: 0, duration: 0.45 });
  gsap.to('.spot-card', { '--card': 0, duration: 0.35, ease: 'power2.in' });
  Flip.fit(p, src, {
    duration: 0.6,
    ease: 'power3.inOut',
    absolute: true,
    onComplete: () => {
      p.remove();
      finish();
    },
  });
}

export function initSpotlight() {
  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-explore]');
    if (t) openSpotlight(t.dataset.explore as BurgerId, t);
  });
  $('#spotClose')?.addEventListener('click', () => closeSpotlight());
  $('#spotScrim')?.addEventListener('click', () => closeSpotlight());
  $('#spot')?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSpotlight();
  });
  // jumping to the combo builder: close instantly (no fly-back while the page scrolls away)
  $('#spotCombo')?.addEventListener('click', () => {
    if (openId) selectComboBurger(openId);
    closeSpotlight(true);
  });
  // keep the stage explore button pointed at whichever burger is on stage
  $$('.mi').forEach((li) =>
    ['pointerenter', 'focusin', 'click'].forEach((ev) =>
      li.addEventListener(ev, () => {
        const btn = $('#stageExplore');
        const b = BURGERS.find((x) => x.id === li.dataset.id);
        if (btn && b) {
          btn.dataset.explore = b.id;
          btn.setAttribute('aria-label', `Explore ${b.name}`);
        }
      }),
    ),
  );
}
