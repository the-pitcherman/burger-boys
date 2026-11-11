/**
 * GSAP choreography. Everything is scoped in gsap.matchMedia() so desktop, mobile and reduced-motion
 * each get their own (auto-reverted) setup. Content is fully visible without this file.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, fineMQ } from './dom';
import { setActiveLayer, setAnatomyJump } from './anatomy';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out' });

function splitWords(el: HTMLElement) {
  if (el.dataset.split) return; // idempotent across matchMedia re-runs
  el.dataset.split = '1';
  const wrap = (text: string, into: Node) =>
    text.split(/(\s+)/).forEach((t) => {
      if (!t) return;
      if (/^\s+$/.test(t)) into.appendChild(document.createTextNode(t));
      else {
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = t;
        into.appendChild(s);
      }
    });
  const frag = document.createDocumentFragment();
  Array.from(el.childNodes).forEach((n) => {
    if (n.nodeType === 3) wrap(n.textContent || '', frag);
    else {
      const c = n.cloneNode(false);
      wrap(n.textContent || '', c);
      frag.appendChild(c);
    }
  });
  el.replaceChildren(frag);
}

function sunBurst(from: HTMLElement) {
  const r = from.getBoundingClientRect();
  for (let i = 0; i < 10; i++) {
    const f = document.createElement('div');
    f.style.cssText = 'position:fixed;left:0;top:0;width:40px;height:40px;z-index:130;pointer-events:none';
    f.innerHTML = '<svg viewBox="-60 -60 120 120" width="40" height="40"><use href="#sun" x="-60" y="-60" width="120" height="120"/></svg>';
    document.body.appendChild(f);
    const a = Math.random() * Math.PI * 2,
      d = 110 + Math.random() * 170;
    gsap.fromTo(
      f,
      { x: r.left + r.width / 2 - 20, y: r.top + r.height / 2 - 20, scale: 0.2 },
      {
        x: `+=${Math.cos(a) * d}`,
        y: `+=${Math.sin(a) * d}`,
        scale: 0.4 + Math.random() * 0.6,
        rotate: (Math.random() - 0.5) * 540,
        opacity: 0,
        duration: 1.2 + Math.random() * 0.5,
        ease: 'power3.out',
        onComplete: () => f.remove(),
      },
    );
  }
}

export function initMotion() {
  const mm = gsap.matchMedia();
  const neon = $('#neonSun');

  mm.add('(prefers-reduced-motion: reduce)', () => {
    neon?.classList.remove('off');
    setAnatomyJump(null);
  });

  mm.add(
    {
      desk: '(min-width: 901px) and (prefers-reduced-motion: no-preference)',
      mob: '(max-width: 900px) and (prefers-reduced-motion: no-preference)',
    },
    (ctx) => {
      const desk = Boolean(ctx.conditions?.desk);
      const cleanups: Array<() => void> = [];

      /* ---------- hero intro (the hero photo is never hidden: it is the LCP element) ---------- */
      const heroSun = $('#heroSun')!;
      gsap
        .timeline({ delay: 0.05 })
        .from('.lockup .l1 > span, .lockup .l2 .mask > span', { yPercent: 105, duration: 0.85, ease: 'expo.out', stagger: 0.1 })
        .from(heroSun, { scale: 0, rotate: -200, duration: 1.1, ease: 'back.out(1.7)' }, 0.2)
        .from('.h-in', { y: 22, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.25)
        .from('#heroBurger', { scale: 0.94, y: 24, duration: 1.3, ease: 'expo.out' }, 0)
        .from('.hero-stage .sticker, .price-tag', { scale: 0, rotate: -60, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.12 }, 0.55);

      const onSun = () => {
        gsap.fromTo(heroSun, { rotate: 0 }, { rotate: 360, duration: 1.1, ease: 'back.inOut(1.4)' });
        sunBurst(heroSun);
      };
      heroSun.addEventListener('click', onSun);
      cleanups.push(() => heroSun.removeEventListener('click', onSun));

      // pointer-driven tilt (Three.js adds per-pixel parallax inside it when available)
      if (fineMQ.matches) {
        const stage = $('#heroStage')!,
          burger = $('#heroBurger')!;
        const rx = gsap.quickTo(burger, 'rotationX', { duration: 0.6 }),
          ry = gsap.quickTo(burger, 'rotationY', { duration: 0.6 });
        const sx = gsap.quickTo('.hero-stage .sticker', 'x', { duration: 0.8 }),
          sy = gsap.quickTo('.hero-stage .sticker', 'y', { duration: 0.8 });
        const move = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5,
            ny = (e.clientY - r.top) / r.height - 0.5;
          ry(nx * 14);
          rx(-ny * 10);
          sx(-nx * 26);
          sy(-ny * 18);
          stage.dispatchEvent(new CustomEvent('bb:pointer', { detail: { x: nx, y: ny } }));
        };
        const leave = () => {
          rx(0);
          ry(0);
          sx(0);
          sy(0);
          stage.dispatchEvent(new CustomEvent('bb:pointer', { detail: { x: 0, y: 0 } }));
        };
        window.addEventListener('pointermove', move, { passive: true });
        stage.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          window.removeEventListener('pointermove', move);
          stage.removeEventListener('pointerleave', leave);
        });

        // magnetic CTAs
        $$('.magnetic').forEach((b) => {
          const qx = gsap.quickTo(b, 'x', { duration: 0.4 }),
            qy = gsap.quickTo(b, 'y', { duration: 0.4 });
          const m = (e: PointerEvent) => {
            const r = b.getBoundingClientRect();
            qx((e.clientX - r.left - r.width / 2) * 0.25);
            qy((e.clientY - r.top - r.height / 2) * 0.35);
          };
          const l = () => {
            qx(0);
            qy(0);
          };
          b.addEventListener('pointermove', m);
          b.addEventListener('pointerleave', l);
          cleanups.push(() => {
            b.removeEventListener('pointermove', m);
            b.removeEventListener('pointerleave', l);
          });
        });
      }

      gsap
        .timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
        .to('.hero-copy', { y: -110, opacity: 0.25, ease: 'none' }, 0)
        .to('.hero-stage', { y: 90, scale: 0.94, ease: 'none' }, 0);

      /* ---------- nav hide on scroll down ---------- */
      const nav = $('#nav')!;
      let lastY = window.scrollY;
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (s) => {
          const y = s.scroll();
          const down = y > lastY && y > 320;
          lastY = y;
          gsap.to(nav, { yPercent: down ? -170 : 0, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        },
      });

      /* ---------- marquee reacts to scroll velocity ---------- */
      const mq = gsap.to('#mq', { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
      ScrollTrigger.create({
        trigger: '.marquee',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (s) => {
          const v = Math.min(Math.abs(s.getVelocity()) / 300, 5);
          gsap.to(mq, { timeScale: s.direction * (1 + v), duration: 0.2, overwrite: true });
          gsap.to(mq, { timeScale: s.direction, duration: 1.2, delay: 0.25 });
        },
      });

      /* ---------- anatomy: pinned, scrubbed, reversible ---------- */
      const burger = $('#anatBurger')!;
      gsap.set(burger, { '--p': 0 });
      const OPEN = 0.16,
        HOLD = 0.68;
      const anat = gsap.timeline({
        scrollTrigger: {
          trigger: '.anatomy',
          start: 'top top',
          end: desk ? '+=170%' : '+=140%',
          pin: '.anat-pin',
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (s) => {
            const p = s.progress;
            setActiveLayer(p < OPEN + 0.01 || p > OPEN + HOLD ? -1 : Math.min(5, Math.floor(((p - OPEN) / HOLD) * 6)));
          },
        },
      });
      anat
        .to(burger, { '--p': 1, duration: OPEN, ease: 'power2.inOut' })
        .to({}, { duration: HOLD })
        .to(burger, { '--p': 0, duration: 0.12, ease: 'back.out(1.3)' })
        .from('#stamp', { scale: 2.6, rotate: -40, opacity: 0, duration: 0.04, ease: 'back.out(2)' });
      setAnatomyJump((i) => {
        const st = anat.scrollTrigger!;
        const p = OPEN + ((i + 0.5) / 6) * HOLD;
        window.scrollTo({ top: st.start + (st.end - st.start) * p, behavior: 'smooth' });
      });
      gsap.from('.anat-copy > *', {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        scrollTrigger: { trigger: '.anatomy', start: 'top 70%' },
      });
      cleanups.push(() => setAnatomyJump(null));

      /* ---------- section title reveals ---------- */
      $$('.h2, .visit-copy h2').forEach((h) =>
        gsap.from($$('.mask > span', h), {
          yPercent: 110,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: h, start: 'top 86%' },
        }),
      );

      /* ---------- menu ---------- */
      ScrollTrigger.create({
        trigger: '#menu',
        start: 'top 60%',
        onEnter: () => {
          const t = gsap.timeline();
          [0, 0.09, 0.2, 0.27, 0.4].forEach((at) => t.call(() => neon?.classList.toggle('off'), undefined, at));
          t.call(() => neon?.classList.remove('off'), undefined, 0.6);
        },
        onLeaveBack: () => neon?.classList.add('off'),
      });
      gsap.from('.menu-head > *', {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        scrollTrigger: { trigger: '#menu', start: 'top 72%' },
      });
      if (desk) {
        gsap.from('.stage', {
          clipPath: 'inset(12% 12% 12% 12% round 32px)',
          scale: 0.92,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.menu-grid', start: 'top 80%' },
        });
        gsap.from('.mi', { x: 60, opacity: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.menu-grid', start: 'top 75%' } });
      } else {
        $$('.mi').forEach((m) =>
          gsap.from(m, { y: 70, rotate: -2, opacity: 0, duration: 0.8, scrollTrigger: { trigger: m, start: 'top 90%' } }),
        );
      }

      /* ---------- combo ---------- */
      gsap.from('.slot', {
        scale: 0.4,
        opacity: 0,
        rotate: (i) => [-20, 18, -14, 24][i],
        stagger: 0.1,
        duration: 0.8,
        ease: 'back.out(1.8)',
        scrollTrigger: { trigger: '.tray', start: 'top 80%' },
      });
      gsap.from('.combo-form fieldset', {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        scrollTrigger: { trigger: '.combo-form', start: 'top 82%' },
      });

      /* ---------- sides & dips ---------- */
      gsap.from('.side-card', {
        y: 80,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        scrollTrigger: { trigger: '.sides-grid', start: 'top 82%' },
      });
      gsap.from('.dip-img', {
        rotate: -120,
        scale: 0.5,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: '.dips', start: 'top 78%' },
      });

      /* ---------- takeaway: ticket lands on the bag, sticker seals the box ---------- */
      gsap.fromTo(
        '.togo-pic img',
        { scale: 1.14 },
        { scale: 1, ease: 'none', scrollTrigger: { trigger: '#togoStage', start: 'top bottom', end: 'center center', scrub: true } },
      );
      gsap.from('#ticket', {
        y: -320,
        rotate: -38,
        opacity: 0,
        ease: 'power2.out',
        scrollTrigger: { trigger: '#togoStage', start: 'top 85%', end: 'top 25%', scrub: 0.6 },
      });
      gsap.from('#seal', {
        scale: 3.2,
        rotate: -120,
        opacity: 0,
        duration: 0.55,
        ease: 'back.out(2.4)',
        scrollTrigger: { trigger: '#togoStage', start: 'top 35%' },
      });
      $$('.tp').forEach((f, i) =>
        gsap.from(f, {
          y: desk ? 140 + i * 80 : 60,
          opacity: 0,
          ease: desk ? 'none' : 'power3.out',
          duration: 0.8,
          scrollTrigger: desk
            ? { trigger: '.togo-pair', start: 'top bottom', end: 'top 45%', scrub: 0.6 }
            : { trigger: f, start: 'top 88%' },
        }),
      );

      /* ---------- story ---------- */
      const story = $('#storyText')!;
      splitWords(story);
      gsap.to('.story-text .w', {
        opacity: 1,
        stagger: 0.05,
        ease: 'none',
        scrollTrigger: { trigger: story, start: 'top 80%', end: 'bottom 50%', scrub: true },
      });
      gsap.to('#orbit', {
        rotate: 300,
        ease: 'none',
        scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.from('.gc', {
        yPercent: 120,
        rotate: (i) => (i % 2 ? 16 : -16),
        stagger: 0.035,
        duration: 0.9,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: '#gmf', start: 'top 88%' },
      });
      gsap.fromTo(
        '#gmf',
        { xPercent: 4 },
        { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '#gmf', start: 'top bottom', end: 'bottom top', scrub: true } },
      );
      $$('.story-photo img, .visit-in img').forEach((img) =>
        gsap.fromTo(
          img,
          { yPercent: -5, scale: 1.12 },
          { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } },
        ),
      );
      $$('.stat').forEach((s, i) => {
        const num = $('.num', s)!,
          to = Number(num.dataset.to),
          from = Number(num.dataset.from ?? 0),
          suf = num.dataset.suffix ?? '';
        const o = { v: from };
        gsap.from(s, {
          y: 60,
          rotate: i % 2 ? 3 : -3,
          opacity: 0,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: '.stats', start: 'top 86%' },
        });
        gsap.to(o, {
          v: to,
          duration: 1.6,
          delay: 0.2 + i * 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.stats', start: 'top 86%' },
          onUpdate: () => {
            num.textContent = Math.round(o.v) + suf;
          },
        });
      });

      /* ---------- visit ---------- */
      gsap.from('.visit-front', {
        clipPath: 'inset(100% 0 0 0 round 32px)',
        duration: 1.2,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: '.visit', start: 'top 70%' },
      });
      gsap.from('.loc-card, .visit-in', {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        scrollTrigger: { trigger: '.visit-copy', start: 'top 75%' },
      });

      /* ---------- footer ---------- */
      gsap.from('#footerMark .ch', {
        yPercent: 120,
        rotate: (i) => (i % 2 ? 12 : -12),
        duration: 0.9,
        ease: 'back.out(1.8)',
        stagger: 0.04,
        scrollTrigger: { trigger: '#footerMark', start: 'top 94%' },
      });
      gsap.from('#footerMark .fsun', {
        scale: 0,
        rotate: -180,
        duration: 1,
        delay: 0.35,
        ease: 'back.out(1.8)',
        scrollTrigger: { trigger: '#footerMark', start: 'top 94%' },
      });
      if (fineMQ.matches) {
        const fsun = $('#footerMark .fsun')!,
          face = $('.face', fsun)!;
        const qx = gsap.quickTo(face, 'x', { duration: 0.4 }),
          qy = gsap.quickTo(face, 'y', { duration: 0.4 });
        const onMove = (e: PointerEvent) => {
          const r = fsun.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2),
            dy = e.clientY - (r.top + r.height / 2),
            d = Math.hypot(dx, dy) || 1;
          qx((dx / d) * 7);
          qy((dy / d) * 7);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        cleanups.push(() => window.removeEventListener('pointermove', onMove));
      }

      return () => cleanups.forEach((f) => f());
    },
  );

  // layout settles after fonts/images: recompute trigger positions once
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
