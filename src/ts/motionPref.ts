/**
 * Visitor-controlled motion switch. Default = the device setting (prefers-reduced-motion).
 * If the device asks for reduced motion, a small notice explains why things are still and offers to play them.
 */
import { $, REDUCE, SYSTEM_REDUCE, motionPref, setMotionPref } from './dom';

export function initMotionPref() {
  const t = $('#motionToggle');
  if (t) {
    t.setAttribute('aria-pressed', String(!REDUCE));
    t.innerHTML = `Animations: <strong>${REDUCE ? 'Off' : 'On'}</strong>`;
    t.addEventListener('click', () => setMotionPref(REDUCE ? 'on' : 'off'));
  }
  const note = $('#motionNote');
  let dismissed = false;
  try {
    dismissed = sessionStorage.getItem('bb-motion-note') === '1';
  } catch {
    /* ignore */
  }
  if (note && REDUCE && SYSTEM_REDUCE && motionPref() === null && !dismissed) {
    note.hidden = false;
    $('#motionPlay')!.addEventListener('click', () => setMotionPref('on'));
    $('#motionDismiss')!.addEventListener('click', () => {
      note.hidden = true;
      try {
        sessionStorage.setItem('bb-motion-note', '1');
      } catch {
        /* ignore */
      }
    });
  }
}
