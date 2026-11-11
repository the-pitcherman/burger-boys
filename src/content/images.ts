import manifest from './images.json';

export type ImageKey = keyof typeof manifest;
type Entry = { w: number; h: number; widths: number[]; formats: string[] };

const M = manifest as Record<ImageKey, Entry>;
export const IMG_BASE = 'images/';

export const srcset = (key: ImageKey, fmt: string): string => M[key].widths.map((w) => `${IMG_BASE}${key}-${w}.${fmt} ${w}w`).join(', ');

export const smallest = (key: ImageKey, fmt = 'webp'): string => `${IMG_BASE}${key}-${M[key].widths[0]}.${fmt}`;

export const largest = (key: ImageKey, fmt = 'webp'): string => `${IMG_BASE}${key}-${M[key].widths.at(-1)}.${fmt}`;

export interface PicOpts {
  alt: string;
  sizes: string;
  cls?: string;
  eager?: boolean;
  priority?: boolean;
  attrs?: string;
}

export const attr = (v: string): string => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Responsive <picture> with AVIF + WebP sources and intrinsic width/height to avoid layout shift. */
export function picture(key: ImageKey, o: PicOpts): string {
  const e = M[key];
  const mid = e.widths[Math.min(1, e.widths.length - 1)];
  const sources = e.formats
    .filter((f) => f !== 'webp')
    .map((f) => `<source type="image/${f}" srcset="${srcset(key, f)}" sizes="${o.sizes}">`)
    .join('');
  return `<picture${o.cls ? ` class="${o.cls}"` : ''}>${sources}<img src="${IMG_BASE}${key}-${mid}.webp" srcset="${srcset(key, 'webp')}" sizes="${o.sizes}" width="${e.w}" height="${e.h}" alt="${attr(o.alt)}" ${o.eager ? '' : 'loading="lazy" '}decoding="async"${o.priority ? ' fetchpriority="high"' : ''}${o.attrs ? ' ' + o.attrs : ''}></picture>`;
}

export const imageMeta = (key: ImageKey): Entry => M[key];
