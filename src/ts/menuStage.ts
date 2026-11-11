/** Editorial menu: the stage photo swaps (circular wipe from the pointer) as burgers are hovered, focused or clicked. */
import { BURGERS, eur, type BurgerId } from '../content/menu';
import { $, $$, fineMQ } from './dom';

let current: BurgerId = 'smash';

function setActive(id: BurgerId, x?: number, y?: number) {
  if (id === current) return;
  const stage = $('#stage');
  const b = BURGERS.find((v) => v.id === id)!;
  $$('.mi').forEach((li) => li.classList.toggle('on', li.dataset.id === id));
  $$('.mi-select').forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.select === id)));
  if (!stage) {
    current = id;
    return;
  }
  const prev = $(`.stage-img[data-id="${current}"]`, stage)!;
  const next = $(`.stage-img[data-id="${id}"]`, stage)!;
  const r = stage.getBoundingClientRect();
  const cx = x !== undefined ? `${(((x - r.left) / r.width) * 100).toFixed(1)}%` : '50%';
  const cy = y !== undefined ? `${Math.min(100, Math.max(0, ((y - r.top) / r.height) * 100)).toFixed(1)}%` : '50%';
  $$('.stage-img.was', stage).forEach((s) => s.classList.remove('was'));
  prev.classList.remove('on');
  prev.classList.add('was');
  next.style.setProperty('--cx', cx);
  next.style.setProperty('--cy', cy);
  void next.offsetWidth; // restart the wipe from the new origin
  next.classList.add('on');
  stage.style.setProperty('--bg', b.bg);
  $('#stageName')!.textContent = b.short;
  $('#stagePrice')!.textContent = eur(b.price);
  current = id;
}

export function initMenuStage() {
  $$('.mi').forEach((li) => {
    const id = li.dataset.id as BurgerId;
    li.addEventListener('pointerenter', (e) => {
      if (fineMQ.matches) setActive(id, e.clientX, e.clientY);
    });
    li.addEventListener('focusin', () => setActive(id));
    li.querySelector('.mi-select')?.addEventListener('click', (e) => {
      const ev = e as MouseEvent;
      setActive(id, ev.clientX || undefined, ev.clientY || undefined);
    });
  });
}
