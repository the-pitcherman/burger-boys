/**
 * Hero burger — the one Three.js scene on the site.
 * A depth-parallax shader over the photographic cutout: each pixel shifts by its baked depth as the pointer
 * moves, plus a soft moving highlight, so the burger reads as a dimensional object rather than a flat cutout.
 * Loaded lazily (after window load) on fine-pointer devices only; the <img> remains the LCP element and fallback.
 */
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  WebGLRenderer,
  LinearFilter,
  NoColorSpace,
  type Texture,
} from 'three';

const vert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const frag = /* glsl */ `
precision mediump float;
uniform sampler2D uTex; uniform sampler2D uDepth; uniform vec2 uMouse; uniform float uTime;
varying vec2 vUv;
void main(){
  float d = texture2D(uDepth, vUv).r;
  vec2 off = uMouse * (d - 0.45) * 0.045;
  off.y += sin(uTime * 1.2) * 0.003 * d;                  // tiny idle "breath"
  vec4 c = texture2D(uTex, vUv - off);
  float light = 1.0 + (d - 0.5) * (uMouse.x * 0.10 - uMouse.y * 0.14);
  float spec = smoothstep(0.72, 1.0, d) * max(0.0, 0.06 - length(vUv - vec2(0.5 + uMouse.x * 0.25, 0.32 - uMouse.y * 0.2)) * 0.12);
  gl_FragColor = vec4(c.rgb * light + spec, c.a);
}`;

export async function initHero3D(): Promise<void> {
  const host = document.getElementById('heroBurger');
  const stage = document.getElementById('heroStage');
  const img = host?.querySelector<HTMLImageElement>('img');
  if (!host || !stage || !img) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power', premultipliedAlpha: false });
  } catch {
    return;
  } // no WebGL: keep the still image
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const loader = new TextureLoader();
  const prep = (t: Texture) => {
    t.colorSpace = NoColorSpace;
    t.minFilter = LinearFilter;
    t.generateMipmaps = false;
    return t;
  };
  let tex: Texture, depth: Texture;
  try {
    [tex, depth] = await Promise.all([
      loader.loadAsync(img.currentSrc || img.src).then(prep),
      loader.loadAsync(new URL('images/hero-depth-512.webp', document.baseURI).href).then(prep),
    ]);
  } catch {
    renderer.dispose();
    return;
  }

  const uniforms = { uTex: { value: tex }, uDepth: { value: depth }, uMouse: { value: new Vector2() }, uTime: { value: 0 } };
  const mat = new ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, transparent: true });
  const scene = new Scene();
  const geo = new PlaneGeometry(2, 2);
  scene.add(new Mesh(geo, mat));
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const resize = () => {
    const r = host.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
  };
  resize();
  host.appendChild(canvas);

  const target = new Vector2(),
    cur = uniforms.uMouse.value;
  let visible = true,
    raf = 0,
    t0 = performance.now();
  const loop = (now: number) => {
    raf = 0;
    if (!visible) return;
    cur.lerp(target, 0.08);
    uniforms.uTime.value = (now - t0) / 1000;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  stage.addEventListener('bb:pointer', ((e: CustomEvent<{ x: number; y: number }>) => {
    target.set(e.detail.x * 2, e.detail.y * 2);
    start();
  }) as EventListener);
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) start();
  });
  io.observe(host);
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // context loss → hand back to the photo
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    host.classList.remove('gl');
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    canvas.remove();
  });

  renderer.render(scene, camera);
  host.classList.add('gl');
  t0 = performance.now();
  start();
}
