import './styles/main.css';
import './styles/motion.css';
import { initNav } from './ts/nav';
import { initBag } from './ts/bag';
import { initMenuStage } from './ts/menuStage';
import { initCombo } from './ts/combo';
import { initAnatomy } from './ts/anatomy';
import { initMotion } from './ts/motion';
import { initRibbon } from './ts/ribbon';
import { initSpotlight } from './ts/spotlight';
import { initAmbient } from './ts/ambient';
import { fineMQ, motionOK } from './ts/dom';

initNav();
initBag();
initMenuStage();
initCombo();
initAnatomy();
initRibbon();
initMotion();
initSpotlight();
initAmbient();

// Three.js hero: progressive enhancement only — after load, on fine pointers, with motion allowed.
const hasWebGL = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl');
  } catch {
    return false;
  }
};
const loadHero3D = () => {
  if (!fineMQ.matches || !motionOK() || !hasWebGL()) return;
  import('./ts/hero3d')
    .then((m) => m.initHero3D())
    .catch(() => {
      /* stays on the still image */
    });
};
const idle = (fn: () => void) => {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(fn, { timeout: 2500 });
  else setTimeout(fn, 600);
};
if (document.readyState === 'complete') idle(loadHero3D);
else window.addEventListener('load', () => idle(loadHero3D), { once: true });
