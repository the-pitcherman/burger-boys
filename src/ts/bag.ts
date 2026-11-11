/**
 * Shopping bag — demo mode. All prices come from src/content/menu.ts.
 * Nothing is sent anywhere; checkout explicitly says no order was placed.
 */
import { gsap } from 'gsap';
import {
  CATALOG,
  COMBO_UPCHARGE,
  DIPS,
  DRINKS,
  eur,
  isBurger,
  type BurgerId,
  type DipId,
  type DrinkId,
  type ItemId,
} from '../content/menu';
import { largest, smallest } from '../content/images';
import { $, $$, motionOK, toast, trapFocus, visibleBagButton } from './dom';

export interface ComboChoice {
  dip: DipId;
  drink: DrinkId;
}
interface Line {
  id: ItemId;
  q: number;
  combo?: ComboChoice;
}

const KEY = 'bb-bag-v2';
let lines: Line[] = load();
const listeners: Array<() => void> = [];

function load(): Line[] {
  try {
    const raw = JSON.parse(sessionStorage.getItem(KEY) || '[]') as Line[];
    return Array.isArray(raw) ? raw.filter((l) => l && l.id in CATALOG && l.q > 0) : [];
  } catch {
    return [];
  }
}
function save() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* storage unavailable: bag stays in memory */
  }
}

const lineKey = (l: Line) => l.id + (l.combo ? `|${l.combo.dip}|${l.combo.drink}` : '');
export const linePrice = (l: Line) => (CATALOG[l.id].price + (l.combo ? COMBO_UPCHARGE : 0)) * l.q;
export const bagTotal = () => lines.reduce((s, l) => s + linePrice(l), 0);
export const bagCount = () => lines.reduce((s, l) => s + l.q, 0);

function merge() {
  const map = new Map<string, Line>();
  for (const l of lines) {
    const k = lineKey(l);
    const ex = map.get(k);
    if (ex) ex.q += l.q;
    else map.set(k, { ...l });
  }
  lines = [...map.values()].filter((l) => l.q > 0);
}

export function addToBag(id: ItemId, combo?: ComboChoice, source?: HTMLElement | null) {
  lines.push({ id, q: 1, combo: combo && isBurger(id) ? combo : undefined });
  merge();
  save();
  render();
  const name = CATALOG[id].name + (combo ? ' combo' : '');
  toast(`Added ${name} to your bag`);
  if (source) feedback(source, id);
}

function feedback(btn: HTMLElement, id: ItemId) {
  if (btn.classList.contains('add')) {
    const old = btn.textContent;
    btn.classList.add('done');
    btn.textContent = 'Added ✓';
    window.setTimeout(() => {
      btn.classList.remove('done');
      btn.textContent = old;
    }, 1100);
  }
  const target = visibleBagButton();
  if (!target || !motionOK()) return;
  const card = btn.closest('.mi, .side-card, .dip, .tray');
  const img = card?.querySelector<HTMLImageElement>('img');
  const src = img?.currentSrc || largest(CATALOG[id].image);
  const a = btn.getBoundingClientRect(),
    b = target.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'flyer';
  f.style.backgroundImage = `url("${src}")`;
  document.body.appendChild(f);
  const x0 = a.left + a.width / 2 - 32,
    y0 = a.top + a.height / 2 - 32;
  const x1 = b.left + b.width / 2 - 32,
    y1 = b.top + b.height / 2 - 32;
  gsap.set(f, { x: x0, y: y0, scale: 0.4, rotate: -20 });
  gsap
    .timeline({
      onComplete: () => {
        f.remove();
        gsap.fromTo(target, { scale: 1.25, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'elastic.out(1,.4)' });
      },
    })
    .to(f, { x: x1, duration: 0.8, ease: 'power1.inOut' }, 0)
    .to(f, { y: Math.min(y0, y1) - 140, duration: 0.34, ease: 'power2.out' }, 0)
    .to(f, { y: y1, duration: 0.46, ease: 'power2.in' }, 0.34)
    .to(f, { scale: 1.1, rotate: 340, duration: 0.8, ease: 'none' }, 0)
    .to(f, { scale: 0.25, opacity: 0, duration: 0.14 }, 0.68);
}

export function onBagChange(fn: () => void) {
  listeners.push(fn);
}

/* ---------------- drawer ---------------- */
const drawer = () => $('#drawer')!;
let untrap: (() => void) | null = null;
let lastFocus: HTMLElement | null = null;

const opt = (items: readonly { id: string; name: string }[], sel: string) =>
  items.map((i) => `<option value="${i.id}"${i.id === sel ? ' selected' : ''}>${i.name}</option>`).join('');

function render() {
  const list = $('#bagList')!;
  list.innerHTML = '';
  lines.forEach((l, i) => {
    const it = CATALOG[l.id];
    const li = document.createElement('li');
    const burger = isBurger(l.id);
    const comboTxt = l.combo
      ? `<small>Combo: Good Mood Fries · ${CATALOG[l.combo.dip].name} · ${CATALOG[l.combo.drink].name}</small>`
      : `<small>${eur(it.price)} each</small>`;
    li.innerHTML = `
      <span class="thumb"><img src="${smallest(it.image)}" alt="" width="56" height="56" loading="lazy"></span>
      <span class="nm">${it.name}${comboTxt}</span>
      <span class="lp">${eur(linePrice(l))}</span>
      <span class="qty"><button type="button" data-a="dec" aria-label="Remove one ${it.name}">−</button><span aria-label="Quantity">${l.q}</span><button type="button" data-a="inc" aria-label="Add one more ${it.name}">+</button></span>
      ${burger ? `<span class="line-opts"><label><input type="checkbox" data-a="combo"${l.combo ? ' checked' : ''}> Combo +${eur(COMBO_UPCHARGE)}</label>${l.combo ? `<select data-a="dip" aria-label="Combo dip">${opt(DIPS, l.combo.dip)}</select><select data-a="drink" aria-label="Combo drink">${opt(DRINKS, l.combo.drink)}</select>` : ''}</span>` : ''}`;
    li.addEventListener('click', (e) => {
      const a = (e.target as HTMLElement).dataset?.a;
      if (a === 'inc') {
        l.q++;
        commit(i, 'inc');
      }
      if (a === 'dec') {
        l.q--;
        commit(i, 'dec');
      }
    });
    li.addEventListener('change', (e) => {
      const t = e.target as HTMLInputElement & HTMLSelectElement;
      if (t.dataset.a === 'combo') l.combo = t.checked ? { dip: 'dip-boys', drink: 'lemon' } : undefined;
      if (t.dataset.a === 'dip' && l.combo) l.combo.dip = t.value as DipId;
      if (t.dataset.a === 'drink' && l.combo) l.combo.drink = t.value as DrinkId;
      commit(i, t.dataset.a || '');
    });
    list.appendChild(li);
  });
  const n = bagCount();
  $('#bagEmpty')!.hidden = lines.length > 0;
  $('#bagTotal')!.textContent = eur(bagTotal());
  ($('#checkout') as HTMLButtonElement).disabled = lines.length === 0;
  $$('[data-bag-count]').forEach((c) => (c.textContent = String(n)));
  $$('[data-open-bag]').forEach((b) =>
    b.setAttribute('aria-label', `Open your bag, ${n} item${n === 1 ? '' : 's'}, total ${eur(bagTotal())}`),
  );
  listeners.forEach((f) => f());
}

/** Re-render while keeping keyboard focus on the equivalent control. */
function commit(i: number, action: string) {
  merge();
  save();
  render();
  const li = $$('#bagList li')[Math.min(i, lines.length - 1)];
  const el = li?.querySelector<HTMLElement>(`[data-a="${action}"]`) ?? li?.querySelector<HTMLElement>('button') ?? $('#drawerClose');
  el?.focus();
}

export function openBag() {
  const d = drawer(),
    scrim = $('#scrim')!;
  lastFocus = document.activeElement as HTMLElement;
  d.hidden = false;
  scrim.hidden = false;
  document.body.style.overflow = 'hidden';
  if (motionOK()) {
    gsap.fromTo(d, { xPercent: 100 }, { xPercent: 0, duration: 0.55, ease: 'expo.out' });
    gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.from('#bagList li', { x: 40, opacity: 0, stagger: 0.05, duration: 0.4, delay: 0.12, ease: 'power3.out', clearProps: 'all' });
  }
  untrap = trapFocus(d);
  $('#drawerClose')!.focus();
}

export function closeBag() {
  const d = drawer(),
    scrim = $('#scrim')!;
  const done = () => {
    d.hidden = true;
    scrim.hidden = true;
    document.body.style.overflow = '';
    untrap?.();
    lastFocus?.focus?.();
    // always reopen on the bag view, never on a stale demo confirmation
    $('#drawerBody')!.hidden = false;
    $('#drawerFoot')!.hidden = false;
    $('#confirm')!.hidden = true;
  };
  if (motionOK()) {
    gsap.to(scrim, { opacity: 0, duration: 0.25 });
    gsap.to(d, { xPercent: 100, duration: 0.4, ease: 'power3.in', onComplete: done });
  } else done();
}

export function initBag() {
  render();
  $$('[data-open-bag]').forEach((b) => b.addEventListener('click', openBag));
  $('#drawerClose')!.addEventListener('click', closeBag);
  $('#scrim')!.addEventListener('click', closeBag);
  $$('[data-close-bag]').forEach((a) => a.addEventListener('click', closeBag));
  drawer().addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBag();
  });
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-add]');
    if (b) addToBag(b.dataset.add as ItemId, undefined, b);
  });
  $('#checkout')!.addEventListener('click', () => {
    $('#confirmTotal')!.textContent = `${bagCount()} item${bagCount() === 1 ? '' : 's'} · ${eur(bagTotal())}`;
    $('#drawerBody')!.hidden = true;
    $('#drawerFoot')!.hidden = true;
    $('#confirm')!.hidden = false;
    if (motionOK())
      gsap.from('#confirm > *', { y: 30, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(1.6)', clearProps: 'all' });
    $('#newOrder')!.focus();
  });
  $('#newOrder')!.addEventListener('click', () => {
    lines = [];
    save();
    render();
    $('#drawerBody')!.hidden = false;
    $('#drawerFoot')!.hidden = false;
    $('#confirm')!.hidden = true;
    closeBag();
    $('#menu')?.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto' });
  });
}

export type { BurgerId };
