// Lays the prerendered build out for GitHub Pages and adds what search engines read. `npm run build`
// runs it after `ng build`.
//
// Angular writes every page as <route>/index.html. Pages serves x.html at /x itself, but answers /x
// with a redirect to /x/ wherever there is a folder x/. So a page with no pages under it becomes
// <route>.html, while /signs/ and /names/, the folders of the signs' and the names' pages, keep
// their index.html and their address ends in a slash (as in src/app/core/services/page-meta.service.ts).
// Then it writes 404.html (the app with no page in it, for any other address), sitemap.xml and
// robots.txt, and checks that every sign and name has its page, with its own text and description,
// and that each page's canonical address is the one it is served at.
import {
  existsSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/huda/browser/', import.meta.url));
const data = (file) =>
  JSON.parse(readFileSync(new URL(`../public/data/${file}`, import.meta.url), 'utf8'));
const errors = [];

// 1. <route>/index.html → <route>.html, wherever the folder holds nothing else.
function flatten(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) flatten(join(dir, entry.name));
  }
  const entries = readdirSync(dir);
  if (dir !== dist && entries.length === 1 && entries[0] === 'index.html') {
    renameSync(join(dir, 'index.html'), `${dir}.html`);
    rmdirSync(dir);
  }
}
flatten(dist);

// 2. 404.html: the app without a prerendered page, which finds its way from the address.
const shell = join(dist, 'index.csr.html');
if (existsSync(shell)) {
  const html = readFileSync(shell, 'utf8');
  const marked = html.replace(
    '<meta charset="utf-8">',
    '$&\n  <meta name="robots" content="noindex">',
  );
  if (marked === html) errors.push('index.csr.html: no <meta charset> to put the noindex after');
  writeFileSync(join(dist, '404.html'), marked);
  unlinkSync(shell);
}

// 3. Every page, at the address Pages serves it at.
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
const attr = (html, pattern) => {
  const m = html.match(pattern);
  return m ? decode(m[1]) : undefined;
};
const canonicalOf = (html) => attr(html, /<link rel="canonical" href="([^"]*)"/);
const descriptionOf = (html) => attr(html, /<meta name="description" content="([^"]*)"/);
const textOf = (html) =>
  decode((html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? '').replace(/<[^>]*>/g, ''));

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html') && entry.name !== '404.html') yield path;
  }
}

const home = readFileSync(join(dist, 'index.html'), 'utf8');
const site = canonicalOf(home);
const base = attr(home, /<base href="([^"]*)"/);
if (!site || new URL(site).pathname !== base) {
  errors.push(`index.html: its canonical address (${site}) doesn't end in its base href (${base})`);
}

const pages = new Map(); // served path → canonical address
const redirects = [];
for (const file of htmlFiles(dist)) {
  const served = relative(dist, file)
    .split(sep)
    .join('/')
    .replace(/(^|\/)index\.html$/, '$1')
    .replace(/\.html$/, '');
  const html = readFileSync(file, 'utf8');
  const refresh = attr(html, /<meta http-equiv="refresh" content="0; url=([^"]*)"/);
  if (refresh) {
    // A redirect from the first site's links (/ayah/<slug>): name its page as the canonical one.
    const target = new URL(refresh, site).href;
    if (!canonicalOf(html)) {
      writeFileSync(
        file,
        html.replace(
          /<meta http-equiv="refresh"[^>]*>/,
          `$&\n    <link rel="canonical" href="${target}">`,
        ),
      );
    }
    redirects.push([served, target]);
    continue;
  }
  const canonical = canonicalOf(html);
  if (canonical !== site + served)
    errors.push(`${served || '/'}: its canonical address is ${canonical}, not ${site + served}`);
  // An error while prerendering is only logged, and can leave a page half drawn.
  if (!/<main[^>]*>[\s\S]*?<h1[\s>]/.test(html))
    errors.push(`${served || '/'}: no <h1> in its <main>`);
  pages.set(served, canonical);
}

for (const [served, target] of redirects) {
  if (![...pages.values()].includes(target))
    errors.push(`${served}: redirects to ${target}, which has no page`);
}
for (const served of ['', 'signs/', 'names/', 'method', 'next']) {
  if (!pages.has(served)) errors.push(`${served || '/'}: not prerendered`);
}

// 4. Every sign and name: its page, its text and its description.
const check = (served, title, description) => {
  const file = join(dist, `${served}.html`);
  if (!existsSync(file)) return errors.push(`${served}: not prerendered`);
  const html = readFileSync(file, 'utf8');
  if (!textOf(html).includes(title)) errors.push(`${served}: «${title}» is not in the page`);
  if (description && descriptionOf(html) !== description)
    errors.push(`${served}: its description isn't «${description}»`);
};
for (const sign of data('ayat.json').ayat) check(`signs/${sign.slug}`, sign.title.ar, sign.hook.ar);
for (const name of data('names.json').names)
  check(`names/${name.slug}`, name.name, name.content?.meaning.ar);

if (errors.length) {
  console.error(
    `finish-build: ${errors.length} problem(s)\n${errors.map((e) => `  ${e}`).join('\n')}`,
  );
  process.exit(1);
}

// 5. The sitemap lists every page by its canonical address; robots.txt points to it.
const urls = [...pages.values()].sort();
writeFileSync(
  join(dist, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${url.replace(/&/g, '&amp;')}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n'),
);
writeFileSync(
  join(dist, 'robots.txt'),
  [
    '# Crawlers read robots.txt only at the root of a host: this one counts once the site has a domain',
    '# of its own. Until then, submit sitemap.xml in Google Search Console and Bing Webmaster Tools.',
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${site}sitemap.xml`,
    '',
  ].join('\n'),
);

console.log(
  `finish-build: ${pages.size} pages and ${redirects.length} redirects for ${site}, listed in sitemap.xml`,
);
