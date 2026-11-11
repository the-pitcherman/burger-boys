/** P7 · Pause CSS ambient loops (sun rays, clouds, medallion) while their section is off screen. */
export function initAmbient() {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-off', !e.isIntersecting)), {
    rootMargin: '120px 0px',
  });
  document.querySelectorAll('section, footer, .marquee, .nav, .drawer').forEach((el) => io.observe(el));
}
