// Favicon (SVG) + apple-touch-icon (PNG) from the brand sun. Usage: node scripts/make-icons.mjs
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const R = 44, a = 4.2, n = 12, pts = [];
for (let i = 0; i <= 360; i += 2) { const t = (i / 360) * Math.PI * 2, r = R + a * Math.cos(n * t); pts.push(`${(r * Math.cos(t)).toFixed(1)} ${(r * Math.sin(t)).toFixed(1)}`); }
const sun = `<path d="M${pts.join('L')}Z" fill="#F8C630" stroke="#141414" stroke-width="5" stroke-linejoin="round"/><g fill="none" stroke="#141414" stroke-width="5.5" stroke-linecap="round"><path d="M-21 -5 Q-15 -16 -9 -5"/><path d="M9 -5 Q15 -16 21 -5"/><path d="M-22 5 C-15 25 15 25 22 5"/></g>`;
const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-52 -52 104 104">${sun}</svg>`;
await writeFile('public/favicon.svg', fav);
const touch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -60 120 120"><rect x="-60" y="-60" width="120" height="120" fill="#86C8EC"/>${sun}</svg>`;
await sharp(Buffer.from(touch)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
console.log('icons written');
