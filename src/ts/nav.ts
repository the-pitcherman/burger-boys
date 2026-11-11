import { gsap } from 'gsap';
import { $, $$, motionOK, trapFocus } from './dom';

export function initNav() {
  const nav = $('#nav')!;
  const solid = () => nav.classList.toggle('solid', window.scrollY > 40);
  window.addEventListener('scroll', solid, { passive: true });
  solid();

  const mm = $('#mobileMenu')!,
    toggle = $('#menuToggle')!;
  let untrap: (() => void) | null = null;
  const open = () => {
    mm.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    untrap = trapFocus(mm);
    if (motionOK()) {
      gsap.fromTo(mm, { clipPath: 'circle(0% at 90% 4%)' }, { clipPath: 'circle(150% at 90% 4%)', duration: 0.7, ease: 'expo.out' });
      gsap.from($$('a', mm), {
        yPercent: 60,
        opacity: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: 'back.out(1.6)',
        delay: 0.1,
        clearProps: 'all',
      });
    }
    $('#mmClose')!.focus();
  };
  const close = (refocus = true) => {
    mm.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    untrap?.();
    if (refocus) toggle.focus();
  };
  toggle.addEventListener('click', open);
  $('#mmClose')!.addEventListener('click', () => close());
  mm.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  $$('a', mm).forEach((a) => a.addEventListener('click', () => close(false)));
}
