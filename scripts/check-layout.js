// Layout check: finds text that is cut off or runs into something, on every page of the site.
// Run it in the browser's console on any page of `npm start`. For every visible word it works out
// where the glyphs really paint, and reports:
//   gold-clipped      ink outside the box of a gold (background-clip: text) element, so invisible
//   overflow-clipped  ink outside an overflow: hidden or clip ancestor
//   off-screen        ink past the edge of the screen
//   text-overlap      glyphs of two different blocks touching
//   lines-collide     glyphs of two lines of the same Qur'an-script block touching
//   runs-into         glyphs on an ornament, button, field or panel the text isn't part of
//   invisible-text    transparent letters that no text-clipped background paints
//
//   await __audit.sweep(await __audit.routes(), 'ar 390'); __audit.summary()
//
// An empty summary means every page passed, in the current language and window width. Content
// that changes daily can be tried with every name: await __audit.probeNames('/', '.today-name').
(() => {
  const A = (window.__audit = {});
  const style = document.getElementById('audit-style') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'audit-style' }));
  // Final positions: no entrance animations or reveal offsets.
  style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}.reveal{opacity:1!important;translate:none!important;transform:none!important}';
  const mctx = document.createElement('canvas').getContext('2d');
  const cv = document.createElement('canvas');
  const c2 = cv.getContext('2d', { willReadFrequently: true });
  const desc = (el) => el.tagName.toLowerCase() + [...el.classList].filter((c) => !/^ng-/.test(c)).slice(0, 3).map((c) => '.' + c).join('');
  A.desc = desc;
  const isClipText = (cs) => cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text';
  const isBlock = (cs) => cs.display !== 'inline' && cs.display !== 'contents';

  // Every visible word with its layout box, baseline and ink box.
  A.words = () => {
    const words = [];
    const css = new Map();
    const gcs = (el) => css.get(el) || (css.set(el, getComputedStyle(el)), css.get(el));
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode()); ) {
      const text = n.nodeValue;
      if (!text.trim()) continue;
      const p = n.parentElement;
      if (!p || p.closest('script,style,noscript,svg,.visually-hidden,[hidden]')) continue;
      if (!p.getClientRects().length) continue;
      const cs = gcs(p);
      if (cs.visibility !== 'visible') continue;
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const ls = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      mctx.font = font;
      mctx.direction = cs.direction;
      mctx.letterSpacing = ls;
      mctx.textAlign = 'left';
      mctx.textBaseline = 'alphabetic';
      let block = p;
      while (block.parentElement && !isBlock(gcs(block))) block = block.parentElement;
      for (const m of text.matchAll(/\S+/g)) {
        const r = document.createRange();
        r.setStart(n, m.index);
        r.setEnd(n, m.index + m[0].length);
        const rects = [...r.getClientRects()].filter((x) => x.width > 0.5 && x.height > 0.5);
        // A word broken over two lines can't be measured as one; leave it out.
        if (!rects.length || rects.some((x) => Math.abs(x.top - rects[0].top) > 2)) continue;
        const box = { left: Math.min(...rects.map((x) => x.left)), right: Math.max(...rects.map((x) => x.right)), top: rects[0].top, bottom: rects[0].bottom };
        const word = cs.textTransform === 'uppercase' ? m[0].toUpperCase() : m[0];
        const t = mctx.measureText(word);
        const fit = (box.bottom - box.top) / (t.fontBoundingBoxAscent + t.fontBoundingBoxDescent);
        const baseline = box.top + t.fontBoundingBoxAscent * fit;
        const sx = t.width > 0 ? (box.right - box.left) / t.width : 1;
        words.push({
          word, el: p, block, box, baseline, font, ls, dir: cs.direction,
          ink: { left: box.left - t.actualBoundingBoxLeft * sx, right: box.left + t.actualBoundingBoxRight * sx, top: baseline - t.actualBoundingBoxAscent, bottom: baseline + t.actualBoundingBoxDescent },
        });
      }
    }
    return words;
  };

  // Glyph pixels of a word inside a region of the page, at 2 device pixels per CSS pixel.
  const mask = (w, R) => {
    const S = 2, W = Math.max(1, Math.ceil((R.right - R.left) * S)), H = Math.max(1, Math.ceil((R.bottom - R.top) * S));
    cv.width = W;
    cv.height = H;
    c2.setTransform(S, 0, 0, S, -R.left * S, -R.top * S);
    Object.assign(c2, { font: w.font, direction: w.dir, letterSpacing: w.ls, textAlign: 'left', textBaseline: 'alphabetic', fillStyle: '#000' });
    c2.fillText(w.word, w.box.left, w.baseline);
    const d = c2.getImageData(0, 0, W, H).data;
    const m = new Uint8Array(W * H);
    for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 110 ? 1 : 0;
    return m;
  };
  const inter = (a, b) => ({ left: Math.max(a.left, b.left), right: Math.min(a.right, b.right), top: Math.max(a.top, b.top), bottom: Math.min(a.bottom, b.bottom) });
  const empty = (R) => R.right - R.left <= 0 || R.bottom - R.top <= 0;
  A.shared = (a, b) => {
    const R = inter(a.ink, b.ink);
    if (empty(R)) return 0;
    const ma = mask(a, R), mb = mask(b, R);
    let n = 0;
    for (let i = 0; i < ma.length; i++) n += ma[i] & mb[i];
    return n / 4;
  };
  A.inRect = (w, r) => {
    const R = inter(w.ink, r);
    if (empty(R)) return 0;
    let n = 0;
    for (const v of mask(w, R)) n += v;
    return n / 4;
  };

  A.check = () => {
    const words = A.words();
    const issues = [];
    const vw = document.documentElement.clientWidth;
    const css = new Map();
    const gcs = (el) => css.get(el) || (css.set(el, getComputedStyle(el)), css.get(el));
    const add = (type, el, w, over, other) => {
      const o = Object.fromEntries(Object.entries(over).filter(([, v]) => v > 1).map(([k, v]) => [k, Math.round(v)]));
      issues.push({ type, el: typeof el === 'string' ? el : desc(el), word: w.word, over: o, other });
    };
    // Gold text is transparent and painted by its clipped background: if a rule replaces that
    // background (a highlight, say), the letters vanish.
    const seen = new Set();
    for (const w of words) {
      if (seen.has(w.el)) continue;
      seen.add(w.el);
      if (!/,\s*0\)$|^transparent$/.test(gcs(w.el).webkitTextFillColor)) continue;
      let painted = false;
      for (let a = w.el; a && a !== document.body && !painted; a = a.parentElement) {
        const cs = gcs(a);
        painted = isClipText(cs) && (cs.backgroundImage !== 'none' || !/,\s*0\)$/.test(cs.backgroundColor));
      }
      if (!painted) add('invisible-text', w.el, w, {});
    }
    for (const w of words) {
      // Gold text: the gradient only paints inside the element's own box.
      for (let a = w.el; a && a !== document.body; a = a.parentElement) {
        if (!isClipText(gcs(a))) continue;
        const boxes = [...a.getClientRects()];
        const b = boxes.find((x) => w.box.top < x.bottom && w.box.bottom > x.top && w.box.left < x.right + 1 && w.box.right > x.left - 1) || boxes[0];
        const over = { top: b.top - w.ink.top, bottom: w.ink.bottom - b.bottom, left: b.left - w.ink.left, right: w.ink.right - b.right };
        if (Object.values(over).some((v) => v > 1)) add('gold-clipped', a, w, over);
        break;
      }
      // Containers that hide what overflows them.
      for (let a = w.el; a && a !== document.body; a = a.parentElement) {
        const cs = gcs(a);
        const hx = /hidden|clip/.test(cs.overflowX), hy = /hidden|clip/.test(cs.overflowY);
        if (!hx && !hy) continue;
        const r = a.getBoundingClientRect();
        const pb = { left: r.left + parseFloat(cs.borderLeftWidth), right: r.right - parseFloat(cs.borderRightWidth), top: r.top + parseFloat(cs.borderTopWidth), bottom: r.bottom - parseFloat(cs.borderBottomWidth) };
        const over = { top: hy ? pb.top - w.ink.top : 0, bottom: hy ? w.ink.bottom - pb.bottom : 0, left: hx ? pb.left - w.ink.left : 0, right: hx ? w.ink.right - pb.right : 0 };
        if (Object.values(over).some((v) => v > 1)) add('overflow-clipped', a, w, over);
      }
      if (w.ink.left < -1 || w.ink.right > vw + 1) add('off-screen', w.el, w, { left: -w.ink.left, right: w.ink.right - vw });
    }
    // Glyphs of different blocks, or of two lines of the same Qur'an-script block, meeting.
    const sorted = [...words].sort((a, b) => a.ink.top - b.ink.top);
    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i];
      for (let j = i + 1; j < sorted.length && sorted[j].ink.top < a.ink.bottom; j++) {
        const b = sorted[j];
        const same = a.block === b.block;
        if (same ? Math.abs(a.box.top - b.box.top) < 2 || !/Amiri Quran/.test(a.font) : a.block.contains(b.block) || b.block.contains(a.block)) continue;
        if (Math.min(a.ink.right, b.ink.right) - Math.max(a.ink.left, b.ink.left) <= 0) continue;
        const px = A.shared(a, b);
        if (px >= 2) add(same ? 'lines-collide' : 'text-overlap', a.block, a, { px }, (same ? '' : desc(b.block) + ' ') + '«' + b.word + '»');
      }
    }
    // Glyphs on ornaments, buttons, fields and panels the text isn't part of.
    const solids = [...document.querySelectorAll('app-ornament .line, app-ornament svg, .btn, button, input, .panel, .search')]
      .filter((e) => e.getClientRects().length)
      .map((e) => ({ e, r: e.getBoundingClientRect() }));
    for (const w of words) {
      for (const s of solids) {
        if (s.e.contains(w.el) || w.el.contains(s.e)) continue;
        const px = A.inRect(w, { left: s.r.left, right: s.r.right, top: s.r.top - 0.5, bottom: s.r.bottom + 0.5 });
        if (px >= 2) add('runs-into', w.block, w, { px }, desc(s.e));
      }
    }
    if (document.documentElement.scrollWidth > vw + 1) issues.push({ type: 'page-scrolls-sideways', el: 'html', word: '', over: { by: document.documentElement.scrollWidth - vw } });
    return issues;
  };

  A.go = async (route) => {
    if (location.pathname !== route) {
      history.pushState({}, '', route);
      dispatchEvent(new PopStateEvent('popstate'));
    }
    const t0 = performance.now();
    await new Promise((r) => setTimeout(r, 250));
    while (performance.now() - t0 < 6000 && (!document.querySelector('main h1') || document.querySelector('main .status'))) await new Promise((r) => setTimeout(r, 100));
    await document.fonts.ready;
    scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 100));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  };

  A.routes = async () => {
    const names = (await (await fetch('data/names.json')).json()).names.map((n) => '/names/' + n.slug);
    const signs = (await (await fetch('data/ayat.json')).json()).ayat.map((a) => '/signs/' + a.slug);
    return ['/', '/signs', '/names', '/method', '/next', ...signs, ...names];
  };

  // Runs in the background; poll __audit.state.
  A.sweep = async (routes, label) => {
    A.state = { label, i: 0, n: routes.length, issues: [], done: false, t0: Date.now() };
    for (const route of routes) {
      try {
        await A.go(route);
        for (const f of A.check()) A.state.issues.push({ route, ...f });
      } catch (e) {
        A.state.issues.push({ route, type: 'error', el: '', word: String(e), over: {} });
      }
      A.state.i++;
    }
    A.state.done = true;
    A.state.secs = Math.round((Date.now() - A.state.t0) / 1000);
  };

  // Content that changes daily: put every name into a slot and report the ones that clip.
  A.probeNames = async (route, selector) => {
    const names = (await (await fetch('data/names.json')).json()).names.map((n) => n.name);
    await A.go(route);
    const el = document.querySelector(selector);
    if (!el) return 'missing ' + selector;
    const orig = el.textContent;
    const bad = [];
    for (const n of names) {
      el.textContent = n;
      const mine = A.check().filter((i) => i.el === desc(el) && i.type === 'gold-clipped');
      if (mine.length) bad.push(n + ' ' + JSON.stringify(mine[0].over));
    }
    el.textContent = orig;
    return { checked: names.length, clipped: bad.length, eg: bad.slice(0, 4) };
  };

  // Where every word sits on some pages, to prove a change moved nothing (or only what it meant to).
  A.snapshot = async (routes) => {
    const out = {};
    for (const r of routes) {
      await A.go(r);
      out[r] = A.words().map((w) => [w.word, Math.round(w.box.left * 10) / 10, Math.round(w.box.top * 10) / 10]);
    }
    return out;
  };
  A.moved = (before, after) => {
    const diffs = [];
    for (const r of Object.keys(before)) {
      const a = before[r], b = after[r] || [];
      if (a.length !== b.length) diffs.push(`${r}: ${a.length} words before, ${b.length} after`);
      for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i][0] !== b[i][0] || Math.abs(a[i][1] - b[i][1]) > 0.5 || Math.abs(a[i][2] - b[i][2]) > 0.5) {
          diffs.push(`${r}: «${a[i][0]}» moved from ${a[i][1]},${a[i][2]} to ${b[i][1]},${b[i][2]}`);
          break;
        }
      }
    }
    return diffs;
  };

  // Grouped by problem, page template and element, with the worst value.
  A.summary = (issues = A.state.issues) => {
    const g = new Map();
    for (const f of issues) {
      const tpl = f.route.replace(/^\/(names|signs)\/.+$/, '/$1/:slug');
      const key = `${f.type} | ${tpl} | ${f.el}`;
      let e = g.get(key);
      if (!e) g.set(key, (e = { key, routes: new Set(), max: {}, eg: new Set() }));
      e.routes.add(f.route);
      for (const [k, v] of Object.entries(f.over || {})) e.max[k] = Math.max(e.max[k] || 0, v);
      if (e.eg.size < 3) e.eg.add(f.word + (f.other ? ' × ' + f.other : ''));
    }
    return [...g.values()].map((e) => `${e.key} — ${e.routes.size} page(s), worst ${JSON.stringify(e.max)}, e.g. ${[...e.eg].join(' / ')} (${[...e.routes].slice(0, 2).join(', ')})`);
  };
  return 'audit ready';
})();
