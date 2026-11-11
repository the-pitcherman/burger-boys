/**
 * Build-time renderer: produces the complete <body> markup from the typed content model.
 * Runs inside vite.config.ts (transformIndexHtml), so the shipped HTML is complete before any JS runs.
 */
import { BURGERS, SIDES, DRINKS, DIPS, ANATOMY, COMBO_UPCHARGE, COMBO_INCLUDES, eur, comboPrice, type Item } from '../content/menu';
import { picture, type ImageKey } from '../content/images';
import { SPRITE, sunSVG, U } from '../content/brand';
import boxes from '../content/anatomy-boxes.json';

const arrow = '<svg class="ico" aria-hidden="true"><use href="#arrow"/></svg>';
const clouds = (n: number[][]) =>
  `<div class="clouds" aria-hidden="true">${n.map(([w, t, d, dl]) => `<svg class="cloud" style="--w:${w}px;top:${t}%;--d:${d}s;--dl:-${dl}s"><use href="#cloud"/></svg>`).join('')}</div>`;

/* ---------------- nav ---------------- */
const nav = () => `
<a class="skip" href="#menu">Skip to the menu</a>
<header class="nav" id="nav">
  <a class="nav-logo" href="#top" aria-label="Burger Boys, back to top">${sunSVG('nav-sun', false)}<span class="mini">Burger<br>Boys</span></a>
  <nav class="nav-links" aria-label="Main">
    <a href="#inside">The burger</a><a href="#menu">Menu</a><a href="#combo">Combos</a><a href="#togo">To go</a><a href="#visit">Visit</a>
  </nav>
  <div class="nav-actions">
    <button class="bag-btn" type="button" data-open-bag aria-controls="drawer" aria-label="Open your bag, 0 items"><svg aria-hidden="true"><use href="#bag-ico"/></svg><span class="bag-count" data-bag-count>0</span></button>
    <a class="btn btn-pink nav-cta" href="#menu">Order</a>
    <button class="menu-toggle" id="menuToggle" type="button" aria-expanded="false" aria-controls="mobileMenu">Menu</button>
  </div>
</header>
<div class="mobile-menu" id="mobileMenu" role="dialog" aria-modal="true" aria-label="Site menu" hidden>
  <button class="x mm-close" id="mmClose" type="button" aria-label="Close menu">×</button>
  <a class="disp" href="#inside">The burger</a><a class="disp" href="#menu">Menu</a><a class="disp" href="#combo">Combos</a><a class="disp" href="#togo">To go</a><a class="disp" href="#story">Story</a><a class="disp" href="#visit">Visit</a>
</div>`;

/* ---------------- hero ---------------- */
const hero = () => `
<section class="hero" id="top" aria-labelledby="heroTitle">
  ${clouds([
    [190, 14, 70, 20],
    [120, 36, 55, 44],
    [240, 6, 90, 70],
    [150, 64, 80, 10],
    [100, 78, 60, 36],
  ])}
  <div class="hero-inner">
    <div class="hero-copy">
      <p class="eyebrow h-in">${sunSVG('eb-sun', false)}Plant-based smash burgers · Amsterdam</p>
      <h1 class="lockup disp" id="heroTitle"><span class="l1"><span>Burger</span></span><span class="l2"><span class="mask"><span>Boys</span></span><button class="lk-sun" id="heroSun" type="button" aria-label="Give the sun a spin">${sunSVG('', true)}</button></span></h1>
      <p class="hero-tag h-in"><strong>Guilt-free pleasures.</strong><br>100% plant-based. 100% delicious.</p>
      <div class="hero-ctas h-in">
        <a class="btn btn-ink magnetic" href="#menu">See the menu ${arrow}</a>
        <a class="btn magnetic" href="#visit">Find us</a>
      </div>
    </div>
    <div class="hero-stage" id="heroStage">
      <svg class="medallion" viewBox="-60 -60 120 120" aria-hidden="true"><use href="#scal" ${U}/></svg>
      <div class="hero-burger" id="heroBurger">
        ${picture('hero-burger', { alt: 'The Smash Classic: a towering plant-based smash burger with melted cheese, iceberg, tomato and pink Boys Sauce on a toasted sesame bun', sizes: '(max-width: 900px) 82vw, 46vw', eager: true, priority: true, cls: 'hero-pic' })}
      </div>
      <div class="hero-shadow" aria-hidden="true"></div>
      <div class="badge sticker s1" aria-hidden="true">Good<br>mood<br>food</div>
      <div class="badge sticker s2" aria-hidden="true">100%<br>plant-<br>based</div>
      <a class="price-tag" href="#menu"><span>The Smash Classic</span><strong>${eur(BURGERS[0].price)}</strong></a>
    </div>
  </div>
  <div class="scallop" style="--c:var(--pink)" aria-hidden="true"></div>
</section>
<div class="marquee" aria-hidden="true"><div class="mq-track" id="mq">${[0, 1].map(() => `<div class="mq-group">${['Guilt-free pleasures', '100% plant-based', '100% delicious', 'Good mood food'].map((t) => `<span class="disp">${t}</span><svg><use href="#sun"/></svg>`).join('')}</div>`).join('')}</div></div>`;

/* ---------------- anatomy ---------------- */
const AY = [0, 160, 225, 261, 330, 357]; // assembled offsets (source px), tuned visually — see docs/assets.md
const anatomy = () => {
  const L = boxes.layers as Record<string, { x: number; y: number; w: number; h: number }>;
  const asmH = AY[5] + L['bun-bottom'].h;
  const H = 1404; // exploded height incl. margins (source px)
  const pad = (H - asmH) / 2;
  const y0 = L['bun-top'].y;
  const layers = ANATOMY.map((a, i) => {
    const b = L[a.id];
    const ay = AY[i] + pad;
    const ey = b.y - y0;
    return `<div class="al" data-i="${i}" style="--x:${b.x};--w:${b.w};--ay:${ay.toFixed(0)};--d:${(ey - ay).toFixed(0)};z-index:${10 - i}">${picture(`layer-${a.id}` as ImageKey, { alt: '', sizes: '(max-width: 900px) 60vw, 34vw' })}</div>`;
  }).join('');
  return `
<section class="anatomy" id="inside" aria-labelledby="anatTitle">
  <div class="anat-pin">
    <div class="anat-copy">
      <p class="eyebrow">Anatomy of a good mood</p>
      <h2 class="disp anat-title" id="anatTitle">What's inside a <em>Burger Boy?</em></h2>
      <p class="anat-sub">Scroll to take The Smash Classic apart, or tap an ingredient.</p>
      <ol class="anat-list" id="anatList">
        ${ANATOMY.map((a, i) => `<li><button type="button" data-i="${i}" aria-pressed="false"><span class="n">0${i + 1}</span><span class="nm">${a.name}</span></button><p class="tx">${a.text}</p></li>`).join('')}
      </ol>
      <p class="anat-active-tx" id="anatActive" aria-live="polite">${ANATOMY[0].name}: ${ANATOMY[0].text}</p>
    </div>
    <div class="anat-stage">
      <div class="anat-burger" id="anatBurger" role="img" aria-label="The Smash Classic, layer by layer: ${ANATOMY.map((a) => a.name).join(', ')}">${layers}</div>
      <div class="badge stamp" id="stamp" aria-hidden="true">Zero<br>animals.<br>All<br>flavour.</div>
    </div>
  </div>
</section>`;
};

/* ---------------- menu ---------------- */
const menu = () => `
<section class="menu" id="menu" aria-labelledby="menuTitle">
  <header class="menu-head">
    <h2 class="disp" id="menuTitle">Signature<br>burgers${'<svg class="neon-sun off" id="neonSun" viewBox="-60 -60 120 120" aria-hidden="true"><use href="#sun-line" ' + U + '/></svg>'}</h2>
    <p>Four smash burgers. Zero animals. Every one comes on a toasted brioche-style bun with a lick of Boys Sauce. Pick your mood.</p>
  </header>
  <div class="menu-grid">
    <div class="stage" id="stage" style="--bg:${BURGERS[0].bg}" aria-hidden="true">
      ${BURGERS.map((b, i) => `<div class="stage-img${i === 0 ? ' on' : ''}" data-id="${b.id}" style="--bg:${b.bg}">${picture(b.image, { alt: '', sizes: '(max-width: 900px) 1px, 52vw' })}</div>`).join('')}
      <div class="stage-cap"><span class="disp" id="stageName">${BURGERS[0].short}</span><span class="stage-price" id="stagePrice">${eur(BURGERS[0].price)}</span></div>
      ${sunSVG('stage-sun', true)}
    </div>
    <ol class="menu-list" id="menuList">
      ${BURGERS.map(
        (b, i) => `
      <li class="mi${i === 0 ? ' on' : ''}" data-id="${b.id}" style="--bg:${b.bg};--accent:${b.accent}">
        <div class="mi-photo">${picture(b.image, { alt: b.alt, sizes: '(max-width: 900px) 92vw, 1px' })}</div>
        <h3 class="mi-title"><button type="button" class="mi-select" data-select="${b.id}" aria-pressed="${i === 0}"><span class="num">0${i + 1}</span><span class="disp"><small>The</small> ${b.short}</span></button></h3>
        <p class="mi-desc">${b.blurb}</p>
        <div class="mi-row">
          <span class="price">${eur(b.price)}</span>
          <button type="button" class="add" data-add="${b.id}">Add to bag</button>
          <a class="mi-combo" href="#combo" data-combo-pick="${b.id}">Combo +${eur(COMBO_UPCHARGE)}</a>
        </div>
      </li>`,
      ).join('')}
    </ol>
  </div>
</section>`;

/* ---------------- combo builder ---------------- */
const opt = (name: string, it: Item, checked: boolean, img: string, extra = '') => `
  <label class="opt">
    <input type="radio" name="${name}" value="${it.id}"${checked ? ' checked' : ''}>
    <span class="opt-card">${img}<span class="opt-txt"><strong>${it.name.replace(/^The /, '')}</strong>${extra}</span></span>
  </label>`;
const thumb = (it: Item) => picture(it.image, { alt: '', sizes: '96px' });
const combo = () => `
<section class="combo" id="combo" aria-labelledby="comboTitle">
  <div class="combo-inner">
    <div class="combo-copy">
      <p class="eyebrow">Combo builder</p>
      <h2 class="disp h2" id="comboTitle"><span class="mask"><span>Make it</span></span><span class="mask"><span>a combo.</span></span></h2>
      <p class="combo-lede">Any burger plus ${COMBO_INCLUDES} for <strong>+${eur(COMBO_UPCHARGE)}</strong>.</p>
      <form id="comboForm" class="combo-form">
        <fieldset><legend><span>1</span> Pick your burger</legend><div class="opts opts-4">${BURGERS.map((b, i) => opt('burger', b, i === 0, thumb(b), `<em>${eur(b.price)}</em>`)).join('')}</div></fieldset>
        <fieldset><legend><span>2</span> Pick a dip</legend><div class="opts">${DIPS.map((d, i) => opt('dip', d, i === 1, thumb(d))).join('')}</div></fieldset>
        <fieldset><legend><span>3</span> Pick a drink</legend><div class="opts opts-2">${DRINKS.map((d, i) => opt('drink', d, i === 0, thumb(d))).join('')}</div></fieldset>
      </form>
    </div>
    <div class="tray" id="tray">
      <div class="tray-stage" aria-hidden="true">
        <div class="slot slot-burger" data-slot="burger">${picture('menu-smash', { alt: '', sizes: '(max-width: 900px) 70vw, 30vw' })}</div>
        <div class="slot slot-fries">${picture('side-fries', { alt: '', sizes: '(max-width: 900px) 30vw, 13vw' })}</div>
        <div class="slot slot-dip" data-slot="dip">${picture('dip-boys', { alt: '', sizes: '(max-width: 900px) 24vw, 9vw' })}</div>
        <div class="slot slot-drink" data-slot="drink">${picture('drink-lemonade', { alt: '', sizes: '(max-width: 900px) 30vw, 12vw' })}</div>
      </div>
      <div class="tray-sum" aria-live="polite">
        <p class="tray-title" id="comboSummary">Smash Classic combo</p>
        <ul class="tray-lines" id="comboLines"><li><span>The Smash Classic</span><span>${eur(BURGERS[0].price)}</span></li><li><span>Good Mood Fries · Boys Sauce · Sparkling Lemonade</span><span>+${eur(COMBO_UPCHARGE)}</span></li></ul>
        <p class="tray-total"><span>Total</span><strong id="comboTotal">${eur(comboPrice('smash'))}</strong></p>
        <button type="button" class="btn btn-pink w100" id="comboAdd">Add combo to bag</button>
      </div>
    </div>
  </div>
</section>`;

/* ---------------- sides & dips ---------------- */
const sides = () => `
<section class="sides" id="sides" aria-labelledby="sidesTitle">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="disp h2" id="sidesTitle"><span class="mask"><span>Sides, sips</span></span><span class="mask"><span>&amp; dips.</span></span></h2>
      <p>The supporting cast. Crispy, cold, or both.</p>
    </div>
    <div class="sides-grid">
      ${[...SIDES, ...DRINKS]
        .map(
          (s, i) => `
      <article class="side-card sc-${i}">
        <div class="sc-img">${picture(s.image, { alt: s.alt, sizes: i === 0 ? '(max-width: 900px) 92vw, 44vw' : '(max-width: 900px) 92vw, 26vw' })}</div>
        <div class="sc-body"><h3 class="disp">${s.name}</h3><p>${s.blurb}</p><div class="sc-row"><span class="price">${eur(s.price)}</span><button type="button" class="add" data-add="${s.id}">Add</button></div></div>
      </article>`,
        )
        .join('')}
    </div>
    <div class="dips" id="dips">
      <div class="dips-head"><h3 class="disp">Dip happy.</h3><p>Three house dips, made fresh every morning. ${eur(DIPS[0].price)} each.</p></div>
      <div class="dips-row">
        ${DIPS.map(
          (d) => `
        <article class="dip">
          <div class="dip-img">${picture(d.image, { alt: d.alt, sizes: '(max-width: 900px) 56vw, 220px' })}<span class="dip-label disp" aria-hidden="true">${d.name}</span></div>
          <h4 class="disp">${d.name}</h4><p>${d.blurb}</p>
          <button type="button" class="add" data-add="${d.id}">Add · ${eur(d.price)}</button>
        </article>`,
        ).join('')}
      </div>
    </div>
  </div>
</section>`;

/* ---------------- to go ---------------- */
const togo = () => `
<section class="togo" id="togo" aria-labelledby="togoTitle">
  <div class="togo-top"></div><div class="scallop down" style="--c:var(--pink)" aria-hidden="true"></div>
  <div class="wrap">
    <div class="togo-head">
      <p class="eyebrow">Pickup &amp; takeaway</p>
      <h2 class="disp h2" id="togoTitle"><span class="mask"><span>Good mood,</span></span><span class="mask"><span>packed to go.</span></span></h2>
      <p>Every order leaves sealed with a smile. Mostly the sticker.</p>
    </div>
    <div class="togo-stage" id="togoStage">
      ${picture('packaging-set', { alt: 'Burger Boys takeaway set: sky-blue and pink kraft bag, burger box, fries carton, mint cup, dip pots and napkins on a yellow table', sizes: '(max-width: 1240px) 94vw, 1180px', cls: 'togo-pic' })}
      <div class="ticket" id="ticket" aria-hidden="true"><span class="t-sm">Order ticket</span><strong class="disp">Enjoy your guilt-free pleasures!</strong>${sunSVG('t-sun', false)}</div>
      <div class="seal" id="seal" aria-hidden="true">${sunSVG('', false)}</div>
    </div>
    <div class="togo-pair">
      <figure class="tp tp-a">${picture('pickup-shelf', { alt: 'Pickup counter with a Burger Boys insulated delivery bag, sealed kraft bags and a boxed burger under a neon "pick up" sign', sizes: '(max-width: 900px) 92vw, 36vw' })}<figcaption>The pickup shelf. Order ahead, grab and go.</figcaption></figure>
      <figure class="tp tp-b">${picture('pickup-handoff', { alt: 'Staff member in a pink apron handing a sealed kraft bag across the teal counter', sizes: '(max-width: 900px) 92vw, 54vw' })}<figcaption>Hot, sealed, handed over.</figcaption></figure>
    </div>
    <p class="demo-note"><strong>Heads up:</strong> online ordering isn't live yet. The bag on this site is a working <em>demo</em>: prices and combos are real menu data, but nothing is ordered or charged.</p>
  </div>
</section>`;

/* ---------------- story ---------------- */
const story = () => `
<section class="story" id="story" aria-labelledby="storyTitle">
  <svg class="orbit" id="orbit" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="circ" d="M100 100 m-78 0 a78 78 0 1 1 156 0 a78 78 0 1 1 -156 0"/></defs><circle cx="100" cy="100" r="98" fill="#86C8EC" stroke="#141414" stroke-width="3"/><text class="orbit-txt"><textPath href="#circ">GUILT-FREE PLEASURES • GOOD MOOD FOOD •</textPath></text><use href="#sun" x="58" y="58" width="84" height="84"/></svg>
  <div class="wrap story-grid">
    <div class="story-copy">
      <p class="eyebrow" id="storyTitle">Our story</p>
      <p class="story-text" id="storyText">We're Burger Boys. We make big, messy, proper smash burgers, and every single bite is <span class="hl">100% plant-based.</span> No lectures. No sad salads. No compromise on the crispy edges. Just guilt-free pleasures and good mood food, served with a grin.</p>
    </div>
    <figure class="story-photo sp-a">${picture('griddle-smash', { alt: 'Gloved hand smashing a plant-based patty flat on a hot griddle, cheese slices waiting alongside', sizes: '(max-width: 900px) 92vw, 44vw' })}<figcaption>Smashed hard, crispy edges, every time.</figcaption></figure>
  </div>
  <p class="gmf disp" id="gmf"><span class="sr-only">Good mood food</span><span class="gw" aria-hidden="true">${'Good'
    .split('')
    .map((c) => `<span class="gc">${c}</span>`)
    .join('')}</span> <span class="gw" aria-hidden="true">${'Mood'
    .split('')
    .map((c) => `<span class="gc">${c}</span>`)
    .join('')}</span> <span class="gw" aria-hidden="true">${'Food'
    .split('')
    .map((c) => `<span class="gc">${c}</span>`)
    .join('')}</span></p>
  <div class="wrap story-photos">
    <figure class="story-photo sp-b">${picture('interior-counter', { alt: 'Concept interior: deep-teal counter with a neon smiling sun, colourful burger menu boards and a black-and-white checkerboard floor', sizes: '(max-width: 900px) 92vw, 58vw' })}<figcaption>The counter. Teal, neon, checkerboard.</figcaption></figure>
    <figure class="story-photo sp-c">${picture('lifestyle-bite', { alt: 'Two hands holding a half-unwrapped smash burger over a marble table with fries in a pink carton and a mint cup', sizes: '(max-width: 900px) 92vw, 30vw' })}<figcaption>Best eaten with both hands.</figcaption></figure>
  </div>
  <div class="wrap stats">
    <div class="stat" style="--bg:var(--pink)"><span class="num disp" data-to="100" data-suffix="%">100%</span><p>Plant-based. Always.</p></div>
    <div class="stat" style="--bg:var(--sun)"><span class="num disp" data-to="0" data-from="100" data-suffix="%">0%</span><p>Guilt. Measured carefully.</p></div>
    <div class="stat" style="--bg:var(--mint)"><span class="num disp" data-to="4">4</span><p>Signature smash burgers</p></div>
  </div>
</section>`;

/* ---------------- visit ---------------- */
const visit = () => `
<section class="visit" id="visit" aria-labelledby="visitTitle">
  <div class="wrap visit-grid">
    <figure class="visit-front">${picture('storefront', { alt: 'Concept storefront: cream Amsterdam canal-house facade with BURGER BOYS lettering, an open hot-pink door, a neon sun in the window and a round blue hanging sign', sizes: '(max-width: 900px) 92vw, 40vw' })}<figcaption>Concept render of the storefront.</figcaption></figure>
    <div class="visit-copy">
      <p class="eyebrow">Come say hi</p>
      <h2 class="disp" id="visitTitle"><span class="mask"><span>Visit the</span></span><span class="mask"><span>Boys.</span></span></h2>
      <div class="loc-card">
        <span class="demo-chip">Demo · details to be confirmed</span>
        <p class="addr">Amsterdam</p>
        <p class="loc-txt">The address, opening hours and directions will go here once the location is confirmed. Until then, here's what you can expect:</p>
        <ul class="hours" aria-label="Sample opening hours, not confirmed">
          <li><span>Mon – Thu</span><span>11:30 – 22:00</span></li>
          <li><span>Fri – Sat</span><span>11:30 – 23:30</span></li>
          <li><span>Sunday</span><span>12:00 – 21:00</span></li>
        </ul>
        <p class="fine">Sample hours, not yet confirmed.</p>
        <div class="loc-actions"><span class="order-tag" aria-hidden="true"><span class="arr">↓</span> Order here</span><a class="btn btn-sun" href="#menu">Browse the menu</a></div>
      </div>
  <figure class="visit-in">${picture('interior-seating', { alt: 'Concept interior: pink banquettes, marble tables, mint chairs and a neon sun, with canal houses outside the window', sizes: '(max-width: 900px) 92vw, 50vw' })}<figcaption>Pink booths, canal views. Concept render.</figcaption></figure>
    </div>

  </div>
  <div class="checker" aria-hidden="true"></div>
</section>`;

/* ---------------- footer ---------------- */
const footer = () => `
<footer class="footer" id="footer">
  ${clouds([
    [160, 10, 80, 30],
    [110, 30, 60, 5],
    [210, 4, 95, 60],
  ])}
  <div class="wrap footer-inner">
    <div class="crew">
      <h2 class="disp">Join the<br>Good Mood Crew</h2>
      <div class="crew-copy"><p><strong>Sign-ups open soon.</strong> Our newsletter isn't live yet, so we're not collecting emails. Check back when the doors open.</p></div>
    </div>
    <p class="footer-mark disp" id="footerMark"><span class="sr-only">Burger Boys</span><span class="fm-word" aria-hidden="true">${'Burger'
      .split('')
      .map((c) => `<span class="ch">${c}</span>`)
      .join('')}</span><span class="fm-word" aria-hidden="true">${'Boys'
      .split('')
      .map((c) => `<span class="ch">${c}</span>`)
      .join('')}</span>${sunSVG('fsun', true)}</p>
    <div class="footer-row">
      <nav aria-label="Footer"><a href="#inside">The burger</a><a href="#menu">Menu</a><a href="#combo">Combos</a><a href="#togo">To go</a><a href="#story">Story</a><a href="#visit">Visit</a></nav>
      <p class="socials">Instagram · TikTok <span class="soon">coming soon</span></p>
    </div>
    <div class="footer-fine">
      <span>© ${new Date().getFullYear()} Burger Boys · Guilt-free pleasures</span>
      <span>Concept site. All photography is AI-generated concept imagery, not documentary photos of an operating restaurant. Ordering is a demo.</span>
    </div>
  </div>
</footer>
<nav class="dock" aria-label="Quick actions"><a href="#menu">Menu</a><button type="button" data-open-bag aria-controls="drawer">Bag <span data-bag-count>0</span></button><a href="#visit">Visit</a></nav>`;

/* ---------------- bag drawer ---------------- */
const drawer = () => `
<div class="scrim" id="scrim" hidden></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" hidden>
  <header><h2 class="disp" id="drawerTitle">Your bag</h2><button class="x" id="drawerClose" type="button" aria-label="Close bag">×</button></header>
  <div class="drawer-body" id="drawerBody">
    <ul class="bag-list" id="bagList"></ul>
    <div class="bag-empty" id="bagEmpty">${sunSVG('', false)}<p>Your bag is empty.<br>Good mood pending.</p><a class="btn btn-sun" href="#menu" data-close-bag>See the menu</a></div>
  </div>
  <div class="confirm" id="confirm" hidden>
    ${sunSVG('', true)}
    <h3 class="disp">That was<br>a demo!</h3>
    <p>Online ordering isn't live yet, so <strong>no order was placed and nothing was charged</strong>. Your bag added up correctly though:</p>
    <p class="confirm-total" id="confirmTotal"></p>
    <button class="btn btn-sun" id="newOrder" type="button">Back to the menu</button>
  </div>
  <div class="drawer-foot" id="drawerFoot">
    <div class="tot"><span>Total</span><strong id="bagTotal">€0,00</strong></div>
    <button class="btn btn-pink w100" id="checkout" type="button">Place demo order</button>
    <p class="fine">Demo checkout. Nothing is ordered or charged until online ordering launches.</p>
  </div>
</aside>`;

export function renderBody(): string {
  return `${SPRITE}${nav()}<main id="main">${hero()}${anatomy()}${menu()}${combo()}${sides()}${togo()}${story()}${visit()}</main>${footer()}${drawer()}`;
}
