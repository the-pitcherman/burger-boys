// Optimise source imagery into responsive AVIF + WebP variants and write a typed-friendly manifest.
// Sources (full-quality PNG masters) live in /assets-src and are never shipped.
// Usage: npm run images
import sharp from 'sharp';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SRC = 'assets-src';
const OUT = 'public/images';
await mkdir(OUT, { recursive: true });

/** name, source file, output widths, optional extract crop, alpha (keep transparency) */
const JOBS = [
  { name: 'hero-burger', src: 'hero-burger-cut.png', widths: [420, 720, 1024], alpha: true },
  { name: 'hero-depth', src: 'hero-burger-depth.png', widths: [512], gray: true },
  ...['bun-top', 'lettuce', 'tomato', 'cheese', 'patty', 'bun-bottom'].map((l) => ({ name: `layer-${l}`, src: `layer-${l}.png`, widths: [360, 640], alpha: true })),
  ...['smash', 'bbq', 'special', 'truffle'].map((m) => ({ name: `menu-${m}`, src: `menu-${m}.png`, widths: [480, 760, 1024] })),
  { name: 'side-fries', src: 'side-fries.png', widths: [400, 720] },
  { name: 'side-truffle-fries', src: 'side-truffle-fries.png', widths: [400, 720] },
  { name: 'drink-lemonade', src: 'drink-lemonade.png', widths: [400, 720] },
  { name: 'drink-shake', src: 'drink-shake.png', widths: [400, 720] },
  { name: 'dip-spicy', src: 'dips-trio.png', crop: { left: 0, top: 232, width: 560, height: 560 }, widths: [240, 440] },
  { name: 'dip-boys', src: 'dips-trio.png', crop: { left: 488, top: 232, width: 560, height: 560 }, widths: [240, 440] },
  { name: 'dip-truffle', src: 'dips-trio.png', crop: { left: 976, top: 232, width: 560, height: 560 }, widths: [240, 440] },
  { name: 'storefront', src: 'storefront.png', widths: [480, 760, 1024] },
  { name: 'interior-counter', src: 'interior-counter.png', widths: [640, 1024, 1536] },
  { name: 'interior-seating', src: 'interior-seating.png', widths: [640, 1024, 1536] },
  { name: 'pickup-handoff', src: 'pickup-handoff.png', widths: [640, 1024, 1536] },
  { name: 'pickup-shelf', src: 'pickup-shelf.png', widths: [480, 760, 1024] },
  { name: 'packaging-set', src: 'packaging-set.png', widths: [640, 1024, 1536] },
  { name: 'griddle-smash', src: 'griddle-smash.png', widths: [640, 1024, 1536] },
  { name: 'lifestyle-bite', src: 'lifestyle-bite.png', widths: [480, 760, 1024] },
];

const manifest = {};
let total = 0;
for (const job of JOBS) {
  const input = path.join(SRC, job.src);
  if (!existsSync(input)) throw new Error(`Missing source ${input}`);
  let base = sharp(input);
  if (job.crop) base = base.extract(job.crop);
  const meta = await base.clone().toBuffer({ resolveWithObject: true });
  const W = meta.info.width, H = meta.info.height;
  const entry = { w: W, h: H, widths: [], formats: job.gray ? ['webp'] : ['avif', 'webp'] };
  for (const w of job.widths.filter((x) => x <= W)) {
    const r = sharp(meta.data).resize({ width: w });
    const pipe = job.gray ? r.grayscale() : r;
    if (!job.gray) {
      const f = path.join(OUT, `${job.name}-${w}.avif`);
      await pipe.clone().avif({ quality: job.alpha ? 55 : 50, effort: 6 }).toFile(f);
      total += (await stat(f)).size;
    }
    const f2 = path.join(OUT, `${job.name}-${w}.webp`);
    await pipe.clone().webp({ quality: job.gray ? 80 : 74, alphaQuality: 90, effort: 6 }).toFile(f2);
    total += (await stat(f2)).size;
    entry.widths.push(w);
  }
  manifest[job.name] = entry;
  process.stdout.write(`✓ ${job.name} ${entry.widths.join('/')}\n`);
}
await writeFile('src/content/images.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote ${Object.keys(manifest).length} images, ${(total / 1024 / 1024).toFixed(2)} MB of variants`);
