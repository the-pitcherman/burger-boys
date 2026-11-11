/** Brand marks: the scalloped smiling sun (Burger Boys mascot) as an inline SVG sprite. */
export function sunPath(R = 44, a = 4.2, n = 12): string {
  const pts: string[] = [];
  for (let i = 0; i <= 360; i += 2) {
    const t = (i / 360) * Math.PI * 2;
    const r = R + a * Math.cos(n * t);
    pts.push(`${(r * Math.cos(t)).toFixed(1)} ${(r * Math.sin(t)).toFixed(1)}`);
  }
  return 'M' + pts.join('L') + 'Z';
}

const SUN = sunPath();
/** <use> of a -60..60 symbol must be placed explicitly, otherwise it renders at the viewBox origin. */
export const U = 'x="-60" y="-60" width="120" height="120"';
const FACE = '<path d="M-21 -5 Q-15 -16 -9 -5"/><path d="M9 -5 Q15 -16 21 -5"/><path class="smile" d="M-22 5 C-15 25 15 25 22 5"/>';

export const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<symbol id="sun-b" viewBox="-60 -60 120 120"><path d="${SUN}" fill="#F8C630" stroke="#141414" stroke-width="4.5" stroke-linejoin="round"/><path d="M14 30 A34 34 0 0 0 33 8" fill="none" stroke="#E7A818" stroke-width="5" stroke-linecap="round"/></symbol>
<symbol id="sun-f" viewBox="-60 -60 120 120"><g fill="none" stroke="#141414" stroke-width="4.6" stroke-linecap="round">${FACE}</g></symbol>
<symbol id="sun" viewBox="-60 -60 120 120"><use href="#sun-b" ${U}/><use href="#sun-f" ${U}/></symbol>
<symbol id="sun-line" viewBox="-60 -60 120 120"><path d="${SUN}" fill="none" stroke-width="4" stroke-linejoin="round"/><g fill="none" stroke-width="4" stroke-linecap="round">${FACE}</g></symbol>
<symbol id="scal" viewBox="-60 -60 120 120"><path d="${sunPath(54, 2.6, 18)}" fill="currentColor" stroke="#141414" stroke-width="2.2" stroke-linejoin="round"/><circle r="45" fill="none" stroke="#141414" stroke-width="1.4" stroke-dasharray="3 4"/></symbol>
<symbol id="cloud" viewBox="0 0 160 70"><path d="M22 66 C6 66 2 46 16 40 C12 24 34 16 46 26 C52 6 86 2 96 22 C110 10 134 18 132 38 C150 38 156 62 138 66 Z" fill="currentColor"/></symbol>
<symbol id="bag-ico" viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></symbol>
<symbol id="arrow" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</defs></svg>`;

/** A sun whose body (rays) can spin independently of the face. */
export const sunSVG = (cls = '', spin = true): string =>
  `<svg class="${cls}" viewBox="-60 -60 120 120" aria-hidden="true" focusable="false">${spin ? `<g class="rays"><use href="#sun-b" ${U}/></g>` : `<use href="#sun-b" ${U}/>`}<g class="face"><use href="#sun-f" ${U}/></g></svg>`;

export const SUN_PATH = SUN;
