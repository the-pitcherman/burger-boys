import { defineConfig } from 'vite';
import { renderBody } from './src/render/page';

// Sections are rendered from the typed content model at build time, so the shipped HTML is complete
// (SEO, no-JS, fast LCP). Runtime TS only adds behaviour and motion.
export default defineConfig({
  base: './',
  // hero3d (three.js) is a lazy, fine-pointer-only chunk (~130 KB gzip), so the default warning is expected
  build: { target: 'es2020', assetsInlineLimit: 0, sourcemap: false, chunkSizeWarningLimit: 560 },
  plugins: [
    {
      name: 'burger-boys-render',
      transformIndexHtml: { order: 'pre', handler: (html) => html.replace('<!--APP-->', renderBody()) },
    },
  ],
});
