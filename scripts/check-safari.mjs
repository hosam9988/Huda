// Checks that Safari really paints the gold title words: run `npm run check:safari` while
// `npm start` is running, or pass another address: `npm run check:safari -- https://…/Huda`.
// Safari, on every iPhone, paints gold text (background-clip: text) only into words without a
// paint layer of their own, so a word Chrome shows can be missing there. In WebKit, Safari's
// engine, each word's box is captured as it is and with the word hidden: a painted word changes
// the pixels, a dropped one doesn't. Plain words such as «اعرف» are controls. Then every kind of
// page runs the image and gold-text rules of check-layout.js in WebKit, which sizes some images
// differently from Chrome.
// Once per machine: `npx playwright install webkit`. Screenshots of the page tops go to
// dist/check-safari/.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { devices, webkit } from 'playwright';

const base = (process.argv[2] || 'http://localhost:4200').replace(/\/$/, '');
const shots = new URL('../dist/check-safari/', import.meta.url);
mkdirSync(shots, { recursive: true });

// [route, language, selector, label, prepare]
const targets = [
  ['/', 'ar', 'main h1.title .know', 'home title «اعرف» (control)'],
  ['/', 'ar', 'main h1.title .allah', 'home title «اللّٰه»'],
  ['/', 'ar', '.brand .know', 'logo «اعرف» (control)'],
  ['/', 'ar', '.brand .allah', 'logo «اللّٰه»'],
  ['/names', 'ar', 'main h1.title .beside:not(.lifted)', 'names title «أسماء» (control)'],
  ['/names', 'ar', 'main h1.title .allah', 'names title «اللّٰه»'],
  ['/names', 'ar', 'main h1.title .lifted', 'names title «الحسنى»'],
  ['/', 'en', 'main .title-en .allah-en', 'home subtitle "Allah"'],
  ['/names', 'en', 'main .title-en .allah-en', 'names subtitle "Allah"'],
  ['/names/ar-rahman', 'ar', 'main h1.name', 'name page title'],
  ['/names/ar-rahman', 'ar', 'main h1.name', 'name page title, read aloud', (el) => el.classList.add('reading')],
];

// Final positions: no entrance animations or reveal offsets.
const still = '*,*::before,*::after{animation:none!important;transition:none!important}.reveal{opacity:1!important;translate:none!important;transform:none!important}';

// Share of pixels that differ between two PNG screenshots, decoded in the page.
const changed = (page, a, b) =>
  page.evaluate(
    async ([a, b]) => {
      const load = (s) => new Promise((ok, no) => Object.assign(new Image(), { onload() { ok(this); }, onerror: no, src: 'data:image/png;base64,' + s }));
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      const c = Object.assign(document.createElement('canvas'), { width: ia.width, height: ia.height });
      const x = c.getContext('2d');
      x.drawImage(ia, 0, 0);
      const da = x.getImageData(0, 0, c.width, c.height).data;
      x.clearRect(0, 0, c.width, c.height);
      x.drawImage(ib, 0, 0);
      const db = x.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 0; i < da.length; i += 4) {
        if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 60) n++;
      }
      return n / (da.length / 4);
    },
    [a.toString('base64'), b.toString('base64')],
  );

const open = async (page, route, lang) => {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  if ((await page.evaluate(() => document.documentElement.lang)) !== lang) {
    await page.click('button.lang');
    await page.waitForFunction((l) => document.documentElement.lang === l, lang);
  }
  await page.addStyleTag({ content: still });
  await page.evaluate(() => document.fonts.ready);
};

const browser = await webkit.launch();
let failed = 0;
for (const [name, options] of [['iPhone 13', devices['iPhone 13']], ['desktop 1280', { viewport: { width: 1280, height: 800 } }]]) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  console.log(`\n${name}, WebKit ${browser.version()}, ${base}`);
  for (const [route, lang, selector, label, prepare] of targets) {
    await open(page, route, lang);
    await page.waitForSelector(selector);
    if (prepare) await page.$eval(selector, prepare);
    await page.waitForTimeout(300);
    // The area of the element's text, not of its box: a title's block is far wider than its words.
    const clip = await page.$eval(selector, (el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const b = range.getBoundingClientRect();
      return { x: Math.max(0, b.left - 4), y: Math.max(0, b.top - 4), width: b.width + 8, height: b.height + 8 };
    });
    const shown = await page.screenshot({ clip });
    await page.$eval(selector, (el) => (el.style.visibility = 'hidden'));
    const hidden = await page.screenshot({ clip });
    const share = await changed(page, shown, hidden);
    const ok = share > 0.02;
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(34)} ${(share * 100).toFixed(1)}% of its area painted`);
  }
  // Every kind of page, with a sign begun so that "continue reading" shows: in Safari too, images
  // must keep their shape and no word inside gold text may have a paint layer of its own.
  await context.addInitScript(() => localStorage.setItem('ayat.place.v1', JSON.stringify({ slug: 'expanding-universe', progress: 0.4 })));
  for (const route of ['/', '/signs', '/names', '/method', '/next', '/signs/expanding-universe', '/names/ar-rahman']) {
    await open(page, route, 'ar');
    await page.addScriptTag({ path: fileURLToPath(new URL('./check-layout.js', import.meta.url)) });
    const found = await page.evaluate(() => window.__audit.check().filter((i) => /^(image-|gold-layer|invisible-text)/.test(i.type)));
    for (const f of found) console.log(`FAIL  ${route}: ${f.type} ${f.el} ${f.word} ${JSON.stringify(f.over)} ${f.other ?? ''}`);
    if (!found.length) console.log(`PASS  ${route}: images in shape, gold text whole`);
    failed += found.length;
  }
  for (const [route, file] of [['/', 'home'], ['/names', 'names'], ['/signs', 'signs']]) {
    await open(page, route, 'ar');
    await page.waitForTimeout(300);
    await page.screenshot({ path: fileURLToPath(new URL(`${file}-${name.replace(/\s+/g, '-')}.png`, shots)) });
  }
  await open(page, '/signs', 'ar');
  await page.locator('.continue-card').screenshot({ path: fileURLToPath(new URL(`continue-${name.replace(/\s+/g, '-')}.png`, shots)) });
  await context.close();
}
await browser.close();

if (failed) {
  console.error(`\n${failed} problem(s) in Safari's engine.`);
  process.exit(1);
}
console.log('\nOK: every word is painted, and every image keeps its shape.');
