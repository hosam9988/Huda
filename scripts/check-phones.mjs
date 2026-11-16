// Checks every page at phone sizes: run `npm run build`, `npm run preview`, then
// `npm run check:phones` (about 35 minutes). Arguments, all optional: another address, how many
// pages to check at once, and only some sizes, e.g.
// `npm run check:phones -- http://localhost:4300/Huda 4 320x568,440x956`. Needs Chrome installed.
//
// Every page, in both languages, at 20 phone sizes upright and sideways (320 to 440 points wide; 568
// to 932 sideways). On each page it runs check-layout.js (text cut off or touching, images out of
// shape, the page scrolling sideways), and on the main sizes also:
// - the same again with every fold open and every list shown in full;
// - anything cut off at the screen's sides, or sticking out of its card;
// - the end of the page hidden under the tab bar;
// - buttons smaller than 24 points.
// The sign and name pages are checked again with the reader's text at its largest (140%).
// It runs without Playwright's isMobile, which widens the page to hide sideways overflow, as a
// phone's browser does. It ends with the findings grouped by problem and page, and fails if any.
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const base = (process.argv[2] || 'http://localhost:4300/Huda').replace(/\/$/, '');
const lanes = Number(process.argv[3] || 4);
const only = process.argv[4]?.split(',');
const script = fileURLToPath(new URL('./check-layout.js', import.meta.url));

const FULL = [
  '320x568',
  '360x740',
  '375x667',
  '390x844',
  '412x915',
  '430x932',
  '440x956',
  '667x375',
  '844x390',
];
const QUICK = [
  '344x882',
  '375x812',
  '393x852',
  '402x874',
  '414x896',
  '428x926',
  '568x320',
  '740x360',
  '932x430',
];
const BIG_TEXT = ['320x568', '375x667', '390x844'];
let tasks = [];
for (const lang of ['ar', 'en']) {
  for (const size of FULL) tasks.push({ size, lang, mode: 'full' });
  for (const size of QUICK) tasks.push({ size, lang, mode: 'quick' });
  for (const size of BIG_TEXT) tasks.push({ size, lang, mode: 'big-text' });
}
if (only) tasks = tasks.filter((t) => only.includes(t.size));

// In the page: what check-layout.js doesn't look for.
const extras = () => {
  const vw = document.documentElement.clientWidth;
  const css = new Map();
  const gcs = (el) => css.get(el) || (css.set(el, getComputedStyle(el)), css.get(el));
  const shown = (el) =>
    el.getClientRects().length > 0 && el.checkVisibility({ visibilityProperty: true });
  const desc = window.__audit.desc;
  const issues = [];
  // An ancestor (below `stop`) that hides or scrolls what overflows it sideways, by design.
  const clipper = (el, stop) => {
    for (
      let a = el.parentElement;
      a && a !== stop && a !== document.body && a !== document.documentElement;
      a = a.parentElement
    ) {
      if (/hidden|clip|auto|scroll/.test(gcs(a).overflowX)) return a;
    }
    return null;
  };
  const all = [...document.body.querySelectorAll('*')].filter(
    (el) => !el.closest('script,style,noscript,[hidden],svg *') && shown(el),
  );
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const over = Math.max(-r.left, r.right - vw);
    if (over > 1 && !clipper(el))
      issues.push({
        type: 'cut-off',
        el: desc(el),
        word: (el.textContent || '').trim().slice(0, 24),
        over: { px: over },
      });
  }
  // A card: a rounded box with a border or a background of its own.
  const transparent = (c) => /^transparent$|,\s*0\)$/.test(c);
  const isCard = (a) => {
    const cs = gcs(a);
    if (!(parseFloat(cs.borderTopLeftRadius) > 0 || parseFloat(cs.borderTopRightRadius) > 0))
      return false;
    const border = parseFloat(cs.borderTopWidth) > 0 && !transparent(cs.borderTopColor);
    return border || cs.backgroundImage !== 'none' || !transparent(cs.backgroundColor);
  };
  for (const el of all) {
    let card = null;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (isCard(a)) {
        card = a;
        break;
      }
    }
    if (!card || clipper(el, card) || /hidden|clip/.test(gcs(card).overflowX)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const c = card.getBoundingClientRect();
    const over = Math.max(c.left - r.left, r.right - c.right, c.top - r.top, r.bottom - c.bottom);
    if (over > 1)
      issues.push({
        type: 'out-of-card',
        el: desc(el),
        word: (el.textContent || '').trim().slice(0, 24),
        over: { px: over },
        other: desc(card),
      });
  }
  // Tap targets under 24 points a side, leaving out links inside running text.
  for (const el of all) {
    if (!el.matches('a[href], button, summary, input, select, textarea, [role=button]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width >= 24 && r.height >= 24) continue;
    const cs = gcs(el);
    const inText =
      cs.display === 'inline' &&
      el.parentElement &&
      el.parentElement.textContent.trim().length > el.textContent.trim().length + 10;
    if (!inText)
      issues.push({
        type: 'small-target',
        el: desc(el),
        word: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24),
        over: { w: r.width, h: r.height },
      });
  }
  return issues;
};

// In the page: scrolled to the very bottom, is anything of the footer under the tab bar?
const underTabBar = async () => {
  const bar = document.querySelector('nav.tabbar');
  if (
    !bar ||
    getComputedStyle(bar).display === 'none' ||
    getComputedStyle(bar).position !== 'fixed'
  )
    return [];
  scrollTo(0, document.documentElement.scrollHeight);
  await new Promise((r) => setTimeout(r, 120));
  const top = bar.getBoundingClientRect().top;
  let bottom = 0;
  let last = null;
  for (const el of document.querySelectorAll('footer *')) {
    if (!el.checkVisibility()) continue;
    if (!el.textContent.trim() && !/^(IMG|svg)$/i.test(el.tagName)) continue;
    const r = el.getBoundingClientRect();
    if (r.height && r.bottom > bottom) {
      bottom = r.bottom;
      last = el;
    }
  }
  scrollTo(0, 0);
  return bottom > top + 1
    ? [
        {
          type: 'under-tab-bar',
          el: window.__audit.desc(last),
          word: last.textContent.trim().slice(0, 24),
          over: { px: bottom - top },
        },
      ]
    : [];
};

// In the page: every fold open, every list shown in full, then back at the top, so that nothing
// sits under the sticky header.
const openAll = async () => {
  for (const d of document.querySelectorAll('details')) d.open = true;
  for (let i = 0; i < 40; i++) {
    const b = document.querySelector('p.more > button');
    if (!b) break;
    b.click();
    await new Promise((r) => setTimeout(r, 120));
  }
  scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 350));
};

async function run(browser, task) {
  const [width, height] = task.size.split('x').map(Number);
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  if (task.mode === 'big-text')
    await context.addInitScript(() => localStorage.setItem('ayat.textScale', '1.4'));
  const page = await context.newPage();
  const errors = new Set();
  page.on('pageerror', (e) => errors.add(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.add(m.text().slice(0, 200)));
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  if ((await page.evaluate(() => document.documentElement.lang)) !== task.lang) {
    await page.click('button.lang');
    await page.waitForFunction((l) => document.documentElement.lang === l, task.lang);
  }
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.addScriptTag({ path: script });
  let routes = await page.evaluate(() => __audit.routes());
  if (task.mode === 'big-text') routes = routes.filter((r) => /^\/(signs|names|topics)\/./.test(r));
  const issues = [];
  for (const route of routes) {
    try {
      const found = await page.evaluate(
        async ({ route, mode, extrasSrc, underSrc, openSrc }) => {
          const extras = eval(extrasSrc);
          const under = eval(underSrc);
          const openAll = eval(openSrc);
          await __audit.go(route);
          const out = __audit.check().map((f) => ({ ...f, phase: 'load' }));
          if (mode === 'quick') return out;
          out.push(...extras().map((f) => ({ ...f, phase: 'load' })));
          if (mode === 'big-text') return out;
          out.push(...(await under()).map((f) => ({ ...f, phase: 'load' })));
          await openAll();
          out.push(...__audit.check().map((f) => ({ ...f, phase: 'open' })));
          out.push(...extras().map((f) => ({ ...f, phase: 'open' })));
          return out;
        },
        {
          route,
          mode: task.mode,
          extrasSrc: `(${extras})`,
          underSrc: `(${underTabBar})`,
          openSrc: `(${openAll})`,
        },
      );
      for (const f of found) issues.push({ route, ...f });
    } catch (e) {
      issues.push({
        route,
        type: 'error',
        el: '',
        word: String(e).slice(0, 160),
        over: {},
        phase: 'load',
      });
    }
  }
  await context.close();
  return { ...task, pages: routes.length, issues, errors: [...errors].slice(0, 5) };
}

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: lanes }, async () => {
    while (next < tasks.length) {
      const r = await run(browser, tasks[next++]);
      results.push(r);
      const label = `${r.lang} ${r.size}${r.mode === 'big-text' ? ' text 140%' : r.mode === 'quick' ? ' (as loaded)' : ''}`;
      const console_ = r.errors.length ? `; console: ${r.errors.join(' | ')}` : '';
      console.log(`${label}: ${r.pages} pages, ${r.issues.length} finding(s)${console_}`);
    }
  }),
);
await browser.close();

// The findings, by problem, phase, page and element, with the sizes they show at.
const groups = new Map();
for (const r of results) {
  for (const f of r.issues) {
    const key = [f.type, f.phase, f.route, f.el, f.other || ''].join(' | ');
    const g = groups.get(key) || { max: 0, words: new Set(), sizes: new Set() };
    g.max = Math.max(
      g.max,
      ...Object.values(f.over || {})
        .map(Number)
        .filter((x) => !isNaN(x)),
      0,
    );
    if (g.words.size < 3) g.words.add(f.word);
    g.sizes.add(`${r.lang} ${r.size}${r.mode === 'big-text' ? ' 140%' : ''}`);
    groups.set(key, g);
  }
}
for (const [key, g] of [...groups].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(
    `\n${key}\n  worst ${Math.round(g.max)} · ${[...g.sizes].join(', ')} · ${[...g.words].join(' / ')}`,
  );
}
console.log(groups.size ? `\n${groups.size} problem(s)` : '\nNo problems at any phone size.');
process.exit(groups.size ? 1 : 0);
