/**
 * Supporting + ambient choreography (P3–P7). The two signature pieces live in their own controllers:
 * ribbon.ts (P1) and anatomy.ts (P2). Everything here is scoped in gsap.matchMedia() so desktop, mobile and
 * reduced-motion each get their own auto-reverted setup. Content is fully visible without this file.
 *
 * Motion grammar: fast friendly entrance (expo/power3.out) → soft spring settle (back.out 1.4–2.2) →
 * crisp type reveals (yPercent masks). Ambient loops are paused offscreen (ambient.ts).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, fineMQ, whenMotion, whenReduced } from './dom';

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
  for (let i = 0; i < 9; i++) {
    const f = document.createElement('div');
    f.style.cssText = 'position:fixed;left:0;top:0;width:40px;height:40px;z-index:130;pointer-events:none';
    f.innerHTML = '<svg viewBox="-60 -60 120 120" width="40" height="40"><use href="#sun" x="-60" y="-60" width="120" height="120"/></svg>';
    document.body.appendChild(f);
    const a = (i / 9) * Math.PI * 2 + Math.random() * 0.5,
      d = 110 + Math.random() * 140;
    gsap.fromTo(
      f,
      { x: r.left + r.width / 2 - 20, y: r.top + r.height / 2 - 20, scale: 0.2 },
      {
        x: `+=${Math.cos(a) * d}`,
        y: `+=${Math.sin(a) * d}`,
        scale: 0.35 + Math.random() * 0.5,
        rotate: (Math.random() - 0.5) * 540,
        opacity: 0,
        duration: 1.1 + Math.random() * 0.4,
        ease: 'power3.out',
        onComplete: () => f.remove(),
      },
    );
  }
}

export function initMotion() {
  const mm = gsap.matchMedia();
  const neon = $('#neonSun');

  mm.add(whenReduced(), () => {
    neon?.classList.remove('off');
  });

  mm.add(
    {
      desk: whenMotion('(min-width: 901px)'),
      mob: whenMotion('(max-width: 900px)'),
    },
    (ctx) => {
      const desk = Boolean(ctx.conditions?.desk);
      const cleanups: Array<() => void> = [];

      /* =========================================================
         P3 · Hero opening scene (~1.7s). The burger photo is the LCP element: it is never hidden,
         only transformed, so first paint is not delayed.
         ========================================================= */
      const heroSun = $('#heroSun')!;
      const face = $('.face', heroSun);
      gsap
        .timeline({ delay: 0.05 })
        .from('.lockup .l1 > span, .lockup .l2 .mask > span', { yPercent: 105, duration: 0.8, ease: 'expo.out', stagger: 0.09 })
        .from('.med-wrap', { scale: 0.55, rotate: -70, duration: 1.1, ease: 'expo.out' }, 0)
        .from('#heroBurger', { y: -46, scale: 1.07, rotate: -4, duration: 0.9, ease: 'back.out(1.6)' }, 0.12)
        .from('.hero-shadow', { scaleX: 0.4, opacity: 0, duration: 0.7, ease: 'power2.out' }, 0.35)
        .from(heroSun, { scale: 0, rotate: -200, duration: 0.9, ease: 'back.out(1.8)' }, 0.5)
        .from('.h-in', { y: 22, opacity: 0, duration: 0.55, stagger: 0.07 }, 0.45)
        .from('.hero-stage .sticker, .price-tag', { scale: 0, rotate: -60, duration: 0.6, ease: 'back.out(2.2)', stagger: 0.1 }, 0.95);

      // the sun reacts: click = spin + burst; idle = an occasional happy squint; pointer = glance
      const onSun = () => {
        gsap.fromTo(heroSun, { rotate: 0 }, { rotate: 360, duration: 1.1, ease: 'back.inOut(1.4)' });
        if (face) gsap.fromTo(face, { scale: 1.25 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)', transformOrigin: '50% 50%' });
        sunBurst(heroSun);
      };
      heroSun.addEventListener('click', onSun);
      cleanups.push(() => heroSun.removeEventListener('click', onSun));
      let heroVisible = true;
      const heroIO = new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting));
      heroIO.observe($('.hero')!);
      let blinkCall: gsap.core.Tween | null = null;
      const blink = () => {
        if (heroVisible && face)
          gsap.fromTo(face, { scaleY: 1 }, { scaleY: 0.55, duration: 0.09, yoyo: true, repeat: 1, transformOrigin: '50% 40%' });
        blinkCall = gsap.delayedCall(3.5 + Math.random() * 3, blink);
      };
      blinkCall = gsap.delayedCall(3, blink);
      cleanups.push(() => {
        blinkCall?.kill();
        heroIO.disconnect();
      });

      // 2.5D depth: each plane moves by a different amount (burger < medallion/shadow inverse < stickers)
      if (fineMQ.matches) {
        const stage = $('#heroStage')!,
          burger = $('#heroBurger')!;
        const q = (el: gsap.TweenTarget, p: string, d = 0.6) => gsap.quickTo(el, p, { duration: d, ease: 'power3.out' });
        const bx = q(burger, 'x'),
          by = q(burger, 'y'),
          rx = q(burger, 'rotationX'),
          ry = q(burger, 'rotationY');
        const shx = q('.hero-shadow', 'x', 0.8),
          shs = q('.hero-shadow', 'scaleX', 0.8);
        const mx = q('.med-wrap', 'x', 0.9),
          my = q('.med-wrap', 'y', 0.9);
        const sx = q('.hero-stage .sticker', 'x', 0.8),
          sy = q('.hero-stage .sticker', 'y', 0.8);
        const px = q('.price-tag', 'x', 0.7),
          py = q('.price-tag', 'y', 0.7);
        const fx = face ? q(face, 'x', 0.4) : null,
          fy = face ? q(face, 'y', 0.4) : null;
        const move = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          const nx = gsap.utils.clamp(-0.6, 0.6, (e.clientX - r.left) / r.width - 0.5);
          const ny = gsap.utils.clamp(-0.6, 0.6, (e.clientY - r.top) / r.height - 0.5);
          bx(nx * 14);
          by(ny * 10);
          ry(nx * 12);
          rx(-ny * 8);
          shx(-nx * 18);
          shs(1 - Math.abs(nx) * 0.12);
          mx(-nx * 8);
          my(-ny * 6);
          sx(nx * 26);
          sy(ny * 18);
          px(nx * 20);
          py(ny * 14);
          const s = heroSun.getBoundingClientRect();
          const dx = e.clientX - (s.left + s.width / 2),
            dy = e.clientY - (s.top + s.height / 2),
            d = Math.hypot(dx, dy) || 1;
          fx?.((dx / d) * 4);
          fy?.((dy / d) * 4);
          stage.dispatchEvent(new CustomEvent('bb:pointer', { detail: { x: nx, y: ny } }));
        };
        const leave = () => {
          [bx, by, rx, ry, shx, mx, my, sx, sy, px, py].forEach((f) => f(0));
          shs(1);
          stage.dispatchEvent(new CustomEvent('bb:pointer', { detail: { x: 0, y: 0 } }));
        };
        window.addEventListener('pointermove', move, { passive: true });
        stage.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          window.removeEventListener('pointermove', move);
          stage.removeEventListener('pointerleave', leave);
        });
        // magnetic pull only on the two hero CTAs
        $$('.magnetic').forEach((b) => {
          const qx = gsap.quickTo(b, 'x', { duration: 0.4 }),
            qy = gsap.quickTo(b, 'y', { duration: 0.4 });
          const m = (e: PointerEvent) => {
            const r = b.getBoundingClientRect();
            qx((e.clientX - r.left - r.width / 2) * 0.2);
            qy((e.clientY - r.top - r.height / 2) * 0.3);
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

      // scroll-out: hand attention to the ribbon without opening a parallax gap
      gsap
        .timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
        .to('.hero-copy', { y: -60, opacity: 0.35, ease: 'none' }, 0)
        .to('.hero-stage', { y: 40, scale: 0.9, rotate: 3, ease: 'none' }, 0);

      /* ---------- nav hides on scroll down, returns on scroll up ---------- */
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

      /* ---------- section title reveals (ambient) ---------- */
      $$('.h2, .visit-copy h2').forEach((h) =>
        gsap.from($$('.mask > span', h), {
          yPercent: 110,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: h, start: 'top 86%' },
        }),
      );
      gsap.from('.anat-head > *, .anat-ui > *', {
        y: 36,
        opacity: 0,
        stagger: 0.07,
        duration: 0.8,
        scrollTrigger: { trigger: '.anatomy', start: 'top 72%' },
      });

      /* =========================================================
         P4 · Menu gallery — photos move independently of card and type; each card has its own personality
         ========================================================= */
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
      const PERSONALITY = [
        { x: -28, r: -6, s: 1.14 },
        { x: 32, r: 5, s: 1.1 },
        { x: -18, r: -3.5, s: 1.18 },
        { x: 24, r: 7, s: 1.12 },
      ];
      if (desk) {
        gsap.from('.stage', {
          clipPath: 'inset(12% 12% 12% 12% round 32px)',
          scale: 0.92,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.menu-grid', start: 'top 80%' },
        });
        gsap.from('.stage-img.on picture', {
          scale: 1.25,
          rotate: -6,
          duration: 1.4,
          ease: 'back.out(1.3)',
          scrollTrigger: { trigger: '.menu-grid', start: 'top 80%' },
        });
        $$('.mi').forEach((m, i) =>
          gsap.from(m, {
            x: 70 + i * 14,
            rotate: PERSONALITY[i].r * 0.4,
            opacity: 0,
            duration: 0.85,
            delay: i * 0.09,
            ease: 'back.out(1.4)',
            scrollTrigger: { trigger: '.menu-grid', start: 'top 75%' },
          }),
        );
        $$('.stage-img picture').forEach((p) =>
          gsap.fromTo(
            p,
            { yPercent: -3 },
            { yPercent: 3, ease: 'none', scrollTrigger: { trigger: '.menu-grid', start: 'top bottom', end: 'bottom top', scrub: true } },
          ),
        );
      } else {
        $$('.mi').forEach((m, i) => {
          const P = PERSONALITY[i % 4];
          const tl = gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 88%' } });
          tl.from(m, { y: 50, opacity: 0, duration: 0.6 })
            .from($('.mi-photo picture', m), { x: P.x, rotate: P.r, scale: P.s, duration: 1.1, ease: 'back.out(1.6)' }, 0.05)
            .from($$('.mi-title, .mi-desc, .mi-row', m), { y: 22, opacity: 0, stagger: 0.07, duration: 0.5 }, 0.25);
        });
      }

      /* ---------- P5 · combo builder entrance ---------- */
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

      /* =========================================================
         P6 · Takeaway: the montage stays a still photo; separate paper props do the physical work:
         tape sticks the photo down, the order ticket drops onto the bag, the sun seal presses onto the box,
         and the two pickup photos are tossed onto the table.
         ========================================================= */
      const togo = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: desk
          ? { trigger: '#togoStage', start: 'top 85%', end: 'center 50%', scrub: 0.6 }
          : { trigger: '#togoStage', start: 'top 75%' },
      });
      togo
        .fromTo(
          '.togo-pic',
          { clipPath: 'inset(9% 7% 9% 7% round 40px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 29px)', duration: 0.6, ease: 'power2.out' },
          0,
        )
        .fromTo('.togo-pic img', { scale: 1.16 }, { scale: 1, duration: 0.9, ease: 'power2.out' }, 0)
        .fromTo('#tape', { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, 0.35)
        .fromTo(
          '#ticket',
          { y: -280, rotate: -36, autoAlpha: 0, '--lift': 1 },
          { y: 0, rotate: -9, autoAlpha: 1, '--lift': 0.2, duration: 0.45, ease: 'power2.in' },
          0.45,
        )
        .to('#ticket', { rotate: -6, '--lift': 0, duration: 0.2, ease: 'back.out(3)' }, 0.9)
        .fromTo(
          '#seal',
          { scale: 2.6, rotate: -130, autoAlpha: 0, '--lift': 1 },
          { scale: 0.9, rotate: -10, autoAlpha: 1, '--lift': 0.25, duration: 0.35, ease: 'power3.in' },
          0.95,
        )
        .to('#seal', { scale: 1, '--lift': 0, duration: 0.18, ease: 'back.out(3)' }, 1.3);
      if (!desk) togo.duration(1.6);
      gsap
        .timeline({
          scrollTrigger: desk
            ? { trigger: '.togo-pair', start: 'top bottom', end: 'top 40%', scrub: 0.6 }
            : { trigger: '.togo-pair', start: 'top 85%' },
        })
        .from('.tp-a', { x: -120, y: 70, rotate: -12, opacity: 0, duration: 1, ease: desk ? 'none' : 'back.out(1.4)' }, 0)
        .from('.tp-b', { x: 120, y: 110, rotate: 10, opacity: 0, duration: 1, ease: desk ? 'none' : 'back.out(1.4)' }, 0.15);

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
      // the counter's neon sun "switches on" as the interior photo enters
      const counter = $('.sp-b img');
      if (counter)
        ScrollTrigger.create({
          trigger: counter,
          start: 'top 70%',
          once: true,
          onEnter: () =>
            gsap
              .timeline()
              .set(counter, { filter: 'brightness(0.55) saturate(0.7)' })
              .to(counter, { filter: 'brightness(1.08) saturate(1.1)', duration: 0.06 }, 0.15)
              .to(counter, { filter: 'brightness(0.65) saturate(0.8)', duration: 0.05 }, 0.3)
              .to(counter, { filter: 'brightness(1)', duration: 0.5, ease: 'power2.out', clearProps: 'filter' }, 0.42),
        });
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
          ff = $('.face', fsun)!;
        const qx = gsap.quickTo(ff, 'x', { duration: 0.4 }),
          qy = gsap.quickTo(ff, 'y', { duration: 0.4 });
        const onMove = (e: PointerEvent) => {
          const r = fsun.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;
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

  // layout settles after fonts/images: recompute trigger positions once each
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
