/**
 * P1 · Pink ribbon. A single gsap.ticker loop owns the track's x (no tween to reverse, so it can never
 * stall at time 0 the way the v2.0 repeat:-1 tween did).
 *  - base speed: one group width per CYCLE seconds, in the reading direction
 *  - scroll velocity (clamped) adds speed down / reverses up; it decays smoothly back to the base
 *  - suns roll with the distance travelled; slight skew from velocity; hover slows it
 *  - only runs while the ribbon is on screen; reduced motion = static ribbon
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, fineMQ } from './dom';

const CYCLE = 26; // seconds per group width at rest
const MAX_BOOST = 3.2; // multiplier clamp (|speed| ≤ (1 + MAX_BOOST) × base)

export function initRibbon() {
  const ribbon = $('.marquee');
  const track = $('#mq');
  if (!ribbon || !track) return;
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const groups = $$('.mq-group', track);
    let w = groups[0].getBoundingClientRect().width;
    const ro = new ResizeObserver(() => (w = groups[0].getBoundingClientRect().width));
    ro.observe(groups[0]);

    const setX = gsap.quickSetter(track, 'x', 'px');
    const setSkew = gsap.quickSetter(track, 'skewX', 'deg');
    let x = 0;
    let mult = 1; // current signed speed multiplier
    let target = 1; // where mult is heading (driven by scroll velocity, decays to 1)
    let hoverK = 1;
    let hoverTarget = 1;
    let visible = true;

    const tick = (_t: number, dtMs: number) => {
      if (!visible || !w) return;
      const dt = Math.min(dtMs, 50) / 1000;
      target += (1 - target) * (1 - Math.exp(-dt * 1.8)); // velocity boost fades back to the reading direction
      mult += (target - mult) * (1 - Math.exp(-dt * 5)); // smooth, no abrupt flips
      hoverK += (hoverTarget - hoverK) * (1 - Math.exp(-dt * 6));
      x -= (w / CYCLE) * mult * hoverK * dt;
      x %= w;
      if (x > 0) x -= w;
      setX(x);
      setSkew(gsap.utils.clamp(-6, 6, -(mult - 1) * 1.6));
      track.style.setProperty('--roll', `${(-x / 27) * 57.3}deg`); // a sun of ~27px radius rolling along
    };
    gsap.ticker.add(tick);

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        const boost = gsap.utils.clamp(-MAX_BOOST, MAX_BOOST, s.getVelocity() / 380);
        // keep the stronger of the current target and the new impulse, so a flick reads as one push
        const next = 1 + boost;
        if (Math.abs(next - 1) > Math.abs(target - 1) || Math.sign(next - 1) !== Math.sign(target - 1)) target = next;
      },
    });

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(ribbon);

    const enter = () => (hoverTarget = 0.3);
    const leave = () => (hoverTarget = 1);
    if (fineMQ.matches) {
      ribbon.addEventListener('pointerenter', enter);
      ribbon.addEventListener('pointerleave', leave);
    }

    // elastic settle the first time the ribbon comes into view
    const settle = ScrollTrigger.create({
      trigger: ribbon,
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.fromTo(ribbon, { rotate: -2.2, y: 26 }, { rotate: 0, y: 0, duration: 1.4, ease: 'elastic.out(1, 0.45)' }),
    });

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      settle.kill();
      io.disconnect();
      ro.disconnect();
      ribbon.removeEventListener('pointerenter', enter);
      ribbon.removeEventListener('pointerleave', leave);
      gsap.set(track, { x: 0, skewX: 0 });
      track.style.removeProperty('--roll');
    };
  });
}
