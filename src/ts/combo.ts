/**
 * P5 · Combo builder. Prices are business logic (menu.ts) and update first, synchronously.
 * Visuals follow: the chosen option's thumbnail flies (Flip.fit proxy) into its tray slot, the slot settles,
 * the ticket nudges and the total counts to the new value. Reduced motion: instant swap, no proxies.
 */
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { CATALOG, COMBO_UPCHARGE, comboPrice, eur, type BurgerId, type DipId, type DrinkId } from '../content/menu';
import { srcset, type ImageKey } from '../content/images';
import { $, $$, motionOK } from './dom';
import { addToBag } from './bag';

gsap.registerPlugin(Flip);

const form = () => $<HTMLFormElement>('#comboForm')!;
const val = (name: string) => (form().elements.namedItem(name) as RadioNodeList).value;
const inflight = new Map<string, { p: HTMLImageElement; t: gsap.core.Tween }>();
let shownTotal = comboPrice('smash');

function setSlot(slot: string, key: ImageKey) {
  const el = $(`[data-slot="${slot}"]`);
  if (!el) return;
  const img = el.querySelector('img')!;
  const src = el.querySelector('source');
  if (img.dataset.key === key) return;
  img.dataset.key = key;
  if (src) src.srcset = srcset(key, 'avif');
  img.srcset = srcset(key, 'webp');
  img.src = img.srcset.split(' ')[0];
}

/** fly the selected option's photo into its slot, then swap the slot image */
function flyTo(slot: string, key: ImageKey, from: HTMLImageElement | null) {
  const el = $(`[data-slot="${slot}"]`);
  if (!el) return;
  const prev = inflight.get(slot);
  if (prev) {
    prev.t.kill();
    prev.p.remove();
    inflight.delete(slot);
  }
  if (!motionOK() || !from || el.querySelector('img')?.dataset.key === key) {
    setSlot(slot, key);
    return;
  }
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
    borderRadius: slot === 'dip' ? '50%' : '12px',
  });
  document.body.appendChild(p);
  const t = Flip.fit(p, el, {
    duration: 0.62,
    ease: 'power3.inOut',
    absolute: true,
    onComplete: () => {
      setSlot(slot, key);
      p.remove();
      inflight.delete(slot);
      gsap.fromTo(el, { scale: 0.9 }, { scale: 1, duration: 0.55, ease: 'back.out(2.6)', clearProps: 'scale' });
    },
  }) as gsap.core.Tween;
  inflight.set(slot, { p, t });
}

function renderTicket() {
  const b = val('burger') as BurgerId,
    d = val('dip') as DipId,
    k = val('drink') as DrinkId;
  const burger = CATALOG[b];
  const total = comboPrice(b);
  $('#comboSummary')!.textContent = `${burger.name.replace(/^The /, '')} combo`;
  $('#comboLines')!.innerHTML =
    `<li><span>${burger.name}</span><span>${eur(burger.price)}</span></li><li><span>Good Mood Fries · ${CATALOG[d].name} · ${CATALOG[k].name}</span><span>+${eur(COMBO_UPCHARGE)}</span></li>`;
  ($('#comboAdd') as HTMLButtonElement).textContent = `Add combo to bag · ${eur(total)}`;
  const out = $('#comboTotal')!;
  out.dataset.value = String(total); // source of truth; the visible number may still be counting toward it
  if (!motionOK() || shownTotal === total) {
    gsap.killTweensOf(out);
    out.textContent = eur(total);
    shownTotal = total;
    return;
  }
  const o = { v: shownTotal };
  gsap.to(o, {
    v: total,
    duration: 0.45,
    ease: 'power2.out',
    onUpdate: () => {
      shownTotal = Math.round(o.v);
      out.textContent = eur(shownTotal);
    },
    onComplete: () => {
      shownTotal = total;
      out.textContent = eur(total);
    },
  });
  gsap.fromTo(
    '.tray-sum',
    { y: -6, rotate: -0.8 },
    { y: 0, rotate: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', clearProps: 'transform' },
  );
}

function update(e?: Event) {
  const b = val('burger') as BurgerId,
    d = val('dip') as DipId,
    k = val('drink') as DrinkId;
  renderTicket();
  const changed = (e?.target as HTMLInputElement | undefined)?.name;
  const thumb = (name: string) => $<HTMLImageElement>(`#comboForm input[name="${name}"]:checked + .opt-card img`);
  if (!changed) {
    setSlot('burger', CATALOG[b].image);
    setSlot('dip', CATALOG[d].image);
    setSlot('drink', CATALOG[k].image);
    return;
  }
  if (changed === 'burger') flyTo('burger', CATALOG[b].image, thumb('burger'));
  if (changed === 'dip') flyTo('dip', CATALOG[d].image, thumb('dip'));
  if (changed === 'drink') flyTo('drink', CATALOG[k].image, thumb('drink'));
}

export function selectComboBurger(id: BurgerId) {
  const r = $<HTMLInputElement>(`#comboForm input[name="burger"][value="${id}"]`);
  if (r && !r.checked) {
    r.checked = true;
    update();
  }
}

export function initCombo() {
  if (!$('#comboForm')) return;
  form().addEventListener('change', update);
  $('#comboAdd')!.addEventListener('click', (e) => {
    addToBag(val('burger') as BurgerId, { dip: val('dip') as DipId, drink: val('drink') as DrinkId }, e.currentTarget as HTMLElement);
  });
  $$<HTMLAnchorElement>('[data-combo-pick]').forEach((a) =>
    a.addEventListener('click', () => selectComboBurger(a.dataset.comboPick as BurgerId)),
  );
  $$<HTMLImageElement>('[data-slot] img').forEach((img, i) => (img.dataset.key = ['menu-smash', 'dip-boys', 'drink-lemonade'][i]));
  $('#comboTotal')!.dataset.value = String(comboPrice('smash'));
  update();
}
