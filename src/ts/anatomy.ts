/**
 * Ingredient anatomy controls. Works without scroll animation: chips (buttons) open the burger and
 * spotlight a layer. When the pinned scroll timeline is active (motion.ts), chips jump the scroll to that layer.
 */
import { ANATOMY } from '../content/menu';
import { $, $$ } from './dom';

let jump: ((i: number) => void) | null = null;
let active = -1;

export function setAnatomyJump(fn: ((i: number) => void) | null) {
  jump = fn;
}

/** i = -1 clears the spotlight */
export function setActiveLayer(i: number) {
  if (i === active) return;
  active = i;
  const burger = $('#anatBurger');
  burger?.classList.toggle('focus', i >= 0);
  $$('.al').forEach((l) => l.classList.toggle('on', Number(l.dataset.i) === i));
  $$('#anatList li').forEach((li, k) => {
    li.classList.toggle('on', k === i);
    li.querySelector('button')?.setAttribute('aria-pressed', String(k === i));
  });
  const tx = $('#anatActive');
  if (tx && i >= 0) tx.textContent = `${ANATOMY[i].name}: ${ANATOMY[i].text}`;
}

export function initAnatomy() {
  $$<HTMLButtonElement>('#anatList button').forEach((b) =>
    b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      if (jump) jump(i);
      else {
        $('#anatBurger')?.style.setProperty('--p', '1');
        setActiveLayer(active === i ? -1 : i);
      }
    }),
  );
}
