/**
 * P2 · Burger anatomy — ONE canonical GSAP timeline with named states.
 *
 *   0 ─ assembled ─ opening ─▶ 'inspect' ── inspecting ── 'inspectEnd' ─ closing ─▶ 'closed' (stamp)
 *
 * Desktop (pinned): ScrollTrigger scrubs the timeline. Buttons and ingredient chips never touch the
 *   layers directly: they scroll the page to the matching timeline position, so scroll and clicks can't fight.
 * Tablet/phone (no pin): buttons tween the same timeline (tl.tweenTo).
 * Reduced motion: no pin, instant seeks; starts in the exploded "inspect" state.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ANATOMY } from '../content/menu';
import { $, $$, whenMotion, whenReduced } from './dom';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

type Mode = 'scroll' | 'tap' | 'static';
type State = 'assembled' | 'opening' | 'inspecting' | 'closing' | 'closed';

const T = { openAt: 0.5, inspect: 3.1, inspectEnd: 6.9, closed: 9.7, end: 10 };
const OPEN_ORDER = [0, 5, 1, 4, 2, 3]; // buns leave first, the middle follows
const CLOSE_ORDER = [5, 4, 3, 2, 1, 0]; // bottom-up, top bun lands last

let mode: Mode = 'static';
let tl: gsap.core.Timeline | null = null;
let st: ScrollTrigger | null = null;
let selected = -1; // tap/static mode selection
let hover = -1;
let lastState: State | null = null;
let lastShown = -2;

const burger = () => $('#anatBurger')!;
const layers = () => $$('.al', burger());

function build(): gsap.core.Timeline {
  const L = layers();
  const callouts = $$('.co', burger());
  const coIn = $$('.co-in', burger());
  const t = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  t.set(burger(), { '--shadow': 1 }, 0);
  L.forEach((l) => t.set(l, { '--p': 0 }, 0));
  t.set(callouts, { autoAlpha: 0 }, 0);

  // OPEN — springy, staggered, different travel per layer (travel comes from the real photo spacing)
  OPEN_ORDER.forEach((i, k) => t.to(L[i], { '--p': 1, duration: 1.7, ease: 'back.out(1.45)' }, T.openAt + k * 0.11));
  t.to(burger(), { '--shadow': 0.35, duration: 1.2, ease: 'power2.out' }, T.openAt);
  callouts.forEach((c, i) => {
    t.to(c, { autoAlpha: 1, duration: 0.45 }, T.openAt + 1.0 + i * 0.12);
    t.fromTo(coIn[i], { x: -16 }, { x: 0, duration: 0.5, ease: 'power3.out' }, T.openAt + 1.0 + i * 0.12);
  });
  t.addLabel('inspect', T.inspect);
  t.addLabel('inspectEnd', T.inspectEnd);

  // CLOSE — accelerate into contact, then squash + settle, then the stamp
  t.to(callouts.slice().reverse(), { autoAlpha: 0, duration: 0.3, stagger: 0.05 }, T.inspectEnd);
  CLOSE_ORDER.forEach((i, k) => t.to(L[i], { '--p': 0, duration: 1.15, ease: 'power3.in' }, T.inspectEnd + 0.25 + k * 0.1));
  const contact = T.inspectEnd + 0.25 + 5 * 0.1 + 1.15;
  t.to(burger(), { '--shadow': 1, duration: 0.6, ease: 'power2.in' }, contact - 0.6);
  t.to(burger(), { scaleY: 0.94, scaleX: 1.03, duration: 0.12, ease: 'power2.out' }, contact);
  t.to(burger(), { scaleY: 1, scaleX: 1, duration: 0.55, ease: 'elastic.out(1, 0.4)' }, contact + 0.12);
  t.fromTo(
    '#stamp',
    { autoAlpha: 0, scale: 2.4, rotate: -45 },
    { autoAlpha: 1, scale: 1, rotate: -10, duration: 0.5, ease: 'back.out(2)' },
    contact + 0.25,
  );
  t.addLabel('closed', T.closed);
  t.to({}, { duration: T.end - T.closed }, T.closed);
  return t;
}

function stateAt(time: number): State {
  if (time < T.openAt + 0.15) return 'assembled';
  if (time < T.inspect - 0.05) return 'opening';
  if (time <= T.inspectEnd + 0.05) return 'inspecting';
  if (time < T.closed - 0.3) return 'closing';
  return 'closed';
}
const isApart = (s: State) => s === 'opening' || s === 'inspecting';

/** which ingredient the timeline position implies (scroll mode) */
const indexAt = (time: number) => Math.min(5, Math.max(0, Math.floor(((time - T.inspect) / (T.inspectEnd - T.inspect)) * 6)));
/** timeline time for a given ingredient (centre of its slice) */
const timeFor = (i: number) => T.inspect + ((i + 0.5) / 6) * (T.inspectEnd - T.inspect);

function sync() {
  if (!tl) return;
  const time = tl.time();
  const s = stateAt(time);
  let active = -1;
  if (s === 'inspecting') active = mode === 'scroll' ? indexAt(time) : selected;
  const shown = hover >= 0 && s === 'inspecting' ? hover : active;

  if (s !== lastState) {
    const tog = $('#anatToggle')!;
    tog.textContent = isApart(s) ? 'Put it back' : 'Take it apart';
    tog.setAttribute('aria-pressed', String(isApart(s)));
    if (lastState !== null && (s === 'inspecting' || s === 'closed' || s === 'assembled') && shown < 0) {
      $('#anatActive')!.textContent =
        s === 'inspecting' ? 'Burger taken apart. Pick an ingredient to inspect it.' : 'Burger back together.';
    }
    lastState = s;
  }
  if (shown !== lastShown) {
    burger().classList.toggle('focus', shown >= 0);
    layers().forEach((l, i) => l.classList.toggle('on', i === shown));
    $$('#anatList button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === shown)));
    if (shown >= 0) $('#anatActive')!.textContent = `${ANATOMY[shown].name}: ${ANATOMY[shown].text}`;
    lastShown = shown;
  }
}

/** move to a timeline position, using the right driver for the current mode */
function go(time: number, onDone?: () => void) {
  if (!tl) return;
  if (mode === 'scroll' && st) {
    const y = st.start + (st.end - st.start) * (time / tl.duration());
    const dist = Math.abs(window.scrollY - y);
    gsap.to(window, {
      scrollTo: { y, autoKill: true },
      duration: gsap.utils.clamp(0.5, 1.4, dist / 900),
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: onDone,
    });
  } else if (mode === 'tap') {
    tl.tweenTo(time, {
      duration: gsap.utils.clamp(0.35, 1.3, Math.abs(tl.time() - time) / 3.2),
      ease: 'power1.inOut',
      overwrite: true,
      onComplete: onDone,
    });
  } else {
    tl.seek(time);
    sync();
    onDone?.();
  }
}

function onToggle() {
  if (!tl) return;
  const s = stateAt(tl.time());
  selected = -1;
  if (isApart(s))
    go(tl.time() >= T.inspect ? T.closed : 0); // finish the journey if inspecting, otherwise rewind
  else go(T.inspect + 0.02);
}

function onPick(i: number) {
  if (!tl) return;
  if (mode === 'scroll') {
    go(timeFor(i)); // in scroll mode the position *is* the selection
    return;
  }
  if (stateAt(tl.time()) === 'inspecting') {
    selected = selected === i ? -1 : i;
    sync();
  } else {
    selected = i; // closed: open first, then select
    go(T.inspect + 0.02, sync);
  }
}

function onReset() {
  selected = -1;
  hover = -1;
  go(0);
}

export function initAnatomy() {
  if (!$('#anatBurger')) return;
  $('#anatToggle')!.addEventListener('click', onToggle);
  $('#anatReset')!.addEventListener('click', onReset);
  $$<HTMLButtonElement>('#anatList button').forEach((b) => b.addEventListener('click', () => onPick(Number(b.dataset.i))));
  // hovering a layer (or its callout) spotlights it while inspecting; it never moves the timeline
  layers().forEach((l, i) => {
    l.addEventListener('pointerenter', (e) => {
      if ((e as PointerEvent).pointerType !== 'mouse') return;
      hover = i;
      sync();
    });
    l.addEventListener('pointerleave', () => {
      hover = -1;
      sync();
    });
  });

  const mm = gsap.matchMedia();
  mm.add(
    {
      pin: whenMotion('(min-width: 901px)'),
      tap: whenMotion('(max-width: 900px)'),
      reduce: whenReduced(),
    },
    (ctx) => {
      const c = ctx.conditions!;
      mode = c.pin ? 'scroll' : c.tap ? 'tap' : 'static';
      tl = build();
      tl.progress(0.001).progress(0); // force-render the assembled state (sets are lazy in a paused timeline)
      lastState = null;
      lastShown = -2;
      selected = -1;
      tl.eventCallback('onUpdate', sync);
      if (mode === 'scroll') {
        st = ScrollTrigger.create({
          trigger: '.anatomy',
          start: 'top top',
          end: () => '+=' + Math.round(window.innerHeight * 1.55),
          pin: '.anat-pin',
          scrub: 0.6,
          animation: tl,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      } else if (mode === 'static') {
        tl.seek(T.inspect + 0.02);
      } else {
        // tap mode: play the opening once when the burger first comes into view, so the idea is discoverable
        ScrollTrigger.create({
          trigger: '#anatBurger',
          start: 'top 65%',
          once: true,
          onEnter: () => {
            if (tl && tl.time() < 0.01) go(T.inspect + 0.02);
          },
        });
      }
      sync();
      return () => {
        st?.kill();
        st = null;
        tl?.kill();
        tl = null;
        layers().forEach((l) => l.style.removeProperty('--p'));
        burger().style.removeProperty('--shadow');
        gsap.set([burger(), '#stamp', ...$$('.co', burger()), ...$$('.co-in', burger())], { clearProps: 'all' });
      };
    },
  );
}
