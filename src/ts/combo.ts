/** Combo builder: burger + Good Mood Fries + dip + drink. Price = burger + COMBO_UPCHARGE (from menu.ts). */
import { gsap } from 'gsap';
import { BURGERS, CATALOG, COMBO_UPCHARGE, comboPrice, eur, type BurgerId, type DipId, type DrinkId } from '../content/menu';
import { srcset, type ImageKey } from '../content/images';
import { $, $$, motionOK } from './dom';
import { addToBag } from './bag';

const form = () => $<HTMLFormElement>('#comboForm')!;
const val = (name: string) => (form().elements.namedItem(name) as RadioNodeList).value;

function swap(slot: string, key: ImageKey) {
  const el = $(`[data-slot="${slot}"]`);
  if (!el) return;
  const img = el.querySelector('img')!;
  const src = el.querySelector('source');
  if (img.dataset.key === key) return;
  img.dataset.key = key;
  if (src) src.srcset = srcset(key, 'avif');
  img.srcset = srcset(key, 'webp');
  img.src = img.srcset.split(' ')[0];
  if (motionOK())
    gsap.fromTo(el, { scale: 0.86, rotate: '-=6' }, { scale: 1, rotate: '+=6', duration: 0.6, ease: 'back.out(2.2)', clearProps: 'scale' });
}

function update() {
  const b = val('burger') as BurgerId,
    d = val('dip') as DipId,
    k = val('drink') as DrinkId;
  const burger = CATALOG[b];
  $('#comboSummary')!.textContent = `${burger.name.replace(/^The /, '')} combo`;
  $('#comboLines')!.innerHTML =
    `<li><span>${burger.name}</span><span>${eur(burger.price)}</span></li><li><span>Good Mood Fries · ${CATALOG[d].name} · ${CATALOG[k].name}</span><span>+${eur(COMBO_UPCHARGE)}</span></li>`;
  $('#comboTotal')!.textContent = eur(comboPrice(b));
  ($('#comboAdd') as HTMLButtonElement).textContent = `Add combo to bag · ${eur(comboPrice(b))}`;
  swap('burger', burger.image);
  swap('dip', CATALOG[d].image);
  swap('drink', CATALOG[k].image);
}

export function selectComboBurger(id: BurgerId) {
  const r = $<HTMLInputElement>(`#comboForm input[name="burger"][value="${id}"]`);
  if (r) {
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
  update();
  void BURGERS;
}
