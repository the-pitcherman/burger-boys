export const $ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => c.querySelector<T>(s);
export const $$ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => Array.from(c.querySelectorAll<T>(s));

export const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
export const fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
export const desktopMQ = window.matchMedia('(min-width: 901px)');
/**
 * Motion mode: follows the OS "reduce motion" setting unless the visitor chose otherwise with the on-page
 * switch (stored as bb-motion = on | off). Decided once in <head> (html.reduce-motion) so CSS and JS agree.
 */
export const REDUCE = document.documentElement.classList.contains('reduce-motion');
export const SYSTEM_REDUCE = document.documentElement.classList.contains('sys-reduce');
export const motionOK = () => !REDUCE;
const NEVER = '(max-width: 0px)';
const ALWAYS = '(min-width: 0px)';
/** gsap.matchMedia condition that only matches when motion is on (optionally narrowed by a width query) */
export const whenMotion = (q = ALWAYS) => (REDUCE ? NEVER : q);
/** gsap.matchMedia condition for the reduced-motion branch */
export const whenReduced = () => (REDUCE ? ALWAYS : NEVER);
export function motionPref(): string | null {
  try {
    return localStorage.getItem('bb-motion');
  } catch {
    return null;
  }
}
export function setMotionPref(v: 'on' | 'off') {
  try {
    localStorage.setItem('bb-motion', v);
  } catch {
    /* storage blocked: preference lasts for this page only */
  }
  window.location.reload();
}

let toastTimer = 0;
export function toast(msg: string) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('show'), 1800);
}

/** Keep Tab focus inside an open dialog. Returns a cleanup fn. */
export function trapFocus(root: HTMLElement): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const f = $$<HTMLElement>('button:not([disabled]),select,input,a[href]', root).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0],
      last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  root.addEventListener('keydown', onKey);
  return () => root.removeEventListener('keydown', onKey);
}

/** Visible bag button (nav on desktop, dock on mobile) — target for fly-to-bag. */
export function visibleBagButton(): HTMLElement | null {
  return $$<HTMLElement>('[data-open-bag]').find((b) => b.offsetParent !== null && b.getBoundingClientRect().width > 0) ?? null;
}
