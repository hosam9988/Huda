// Checks public/data/ayat.json and names.json after they are edited: run `npm run check:content`.
// Every text needs Arabic and English, every sign a known field, an image, a revelation step on
// its timeline, at least one https source and only hadith from al-Bukhari or Muslim; the journey
// stops must run 1, 2, 3…
// A written name needs a meaning, one to three evidences, its impact and a du'a; a hadith from
// outside the two Sahihs needs its grading.
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const content = JSON.parse(readFileSync(new URL('public/data/ayat.json', root), 'utf8'));
const { names } = JSON.parse(readFileSync(new URL('public/data/names.json', root), 'utf8'));

const SOURCE_KINDS = ['journal', 'preprint', 'agency', 'university', 'encyclopedia', 'book', 'news'];
// The method page says every hadith in the signs is from al-Bukhari or Muslim, with its number, so
// each one's ref must start with one of them: «صحيح مسلم (٢٧٨)، وبنحوه في…» / "Sahih Muslim 278; …".
const SAHIHAYN_REF = { ar: /^صحيح (البخاري|مسلم) \([٠-٩]+\)/, en: /^Sahih (al-Bukhari|Muslim) \d+/ };
const errors = [];

const localized = (v, where) => {
  for (const lang of ['ar', 'en']) {
    if (typeof v?.[lang] !== 'string' || !v[lang].trim()) errors.push(`${where}: missing ${lang}`);
  }
};
// Each image is a 1280-wide WebP and a 640-wide copy (see src/app/core/utils/art.ts).
const art = (name, where) => {
  for (const file of [`${name}.webp`, `${name}-sm.webp`]) {
    if (!existsSync(new URL(`public/images/${file}`, root))) errors.push(`${where}: no images/${file}`);
  }
};

const categories = new Set();
for (const c of content.categories) {
  categories.add(c.id);
  localized(c.title, `category ${c.id} title`);
  localized(c.blurb, `category ${c.id} blurb`);
  art(c.art, `category ${c.id}`);
}

const slugs = new Set();
const journey = [];
for (const a of content.ayat) {
  const at = `sign "${a.slug}"`;
  if (slugs.has(a.slug)) errors.push(`${at}: duplicate slug`);
  slugs.add(a.slug);
  if (!categories.has(a.category)) errors.push(`${at}: unknown field "${a.category}"`);
  if (a.journey !== undefined) journey.push(a.journey);
  if (a.nowLabel !== undefined && a.nowLabel !== 'history') errors.push(`${at}: nowLabel must be "history" or absent`);
  art(a.art, at);
  for (const key of ['title', 'hook', 'summary', 'reflection', 'caution']) localized(a[key], `${at} ${key}`);
  if (a.didYouKnow) localized(a.didYouKnow, `${at} didYouKnow`);
  localized(a.highlight?.value, `${at} highlight.value`);
  localized(a.highlight?.label, `${at} highlight.label`);
  for (const key of ['then', 'now']) {
    if (!a[key]?.length) errors.push(`${at}: "${key}" is empty`);
    a[key]?.forEach((p, i) => localized(p, `${at} ${key}[${i}]`));
  }
  if (!a.evidence?.length) errors.push(`${at}: no evidence`);
  a.evidence?.forEach((e, i) => {
    const where = `${at} evidence[${i}]`;
    if (!['quran', 'hadith'].includes(e.kind)) errors.push(`${where}: kind must be quran or hadith`);
    if (!e.text?.trim()) errors.push(`${where}: no text`);
    // The page adds ﴿ ﴾ around verses and « » around hadith itself.
    if (/[﴿﴾«»]/.test(e.text ?? '')) errors.push(`${where}: remove the brackets from the text`);
    localized(e.meaning, `${where} meaning`);
    localized(e.ref, `${where} ref`);
    if (e.kind !== 'hadith') return;
    localized(e.narrator, `${where} narrator`);
    if (!SAHIHAYN_REF.ar.test(e.ref?.ar ?? '') || !SAHIHAYN_REF.en.test(e.ref?.en ?? '')) {
      errors.push(`${where}: a sign's hadith must be cited from al-Bukhari or Muslim first, with its number`);
    }
  });
  if (!a.timeline?.some((m) => m.revelation)) errors.push(`${at}: the timeline has no revelation step`);
  a.timeline?.forEach((m, i) => {
    if (typeof m.year !== 'string') localized(m.year, `${at} timeline[${i}] year`);
    localized(m.text, `${at} timeline[${i}]`);
  });
  if (!a.sources?.length) errors.push(`${at}: no sources`);
  a.sources?.forEach((s, i) => {
    if (!/^https:\/\//.test(s.url ?? '')) errors.push(`${at} source[${i}]: the url must start with https://`);
    if (!SOURCE_KINDS.includes(s.kind)) errors.push(`${at} source[${i}]: kind must be one of ${SOURCE_KINDS.join(', ')}`);
  });
}

const stops = [...journey].sort((x, y) => x - y);
if (stops.some((n, i) => n !== i + 1)) errors.push(`journey stops must run 1, 2, 3… (found ${stops.join(', ')})`);

// A verse or hadith on a name's page.
const nameText = (t, where) => {
  if (!['quran', 'hadith'].includes(t?.kind)) errors.push(`${where}: kind must be quran or hadith`);
  if (!t?.text?.trim()) errors.push(`${where}: no text`);
  if (/[﴿﴾«»]/.test(t?.text ?? '')) errors.push(`${where}: remove the brackets from the text`);
  localized(t?.ref, `${where} ref`);
  localized(t?.explanation, `${where} explanation`);
  if (!t?.translation?.en?.trim()) errors.push(`${where}: missing the English translation`);
  if (t?.kind !== 'hadith') return;
  localized(t.narrator, `${where} narrator`);
  if (!/صحيح (البخاري|مسلم)/.test(t.ref?.ar ?? '')) localized(t.grading, `${where} grading`);
};

const nameSlugs = new Set();
names.forEach((n, i) => {
  const at = `name "${n.slug}"`;
  if (nameSlugs.has(n.slug)) errors.push(`${at}: duplicate slug`);
  nameSlugs.add(n.slug);
  if (n.number !== i + 1) errors.push(`${at}: number ${n.number} should be ${i + 1}`);
  for (const key of ['name', 'transliteration', 'gloss']) if (!n[key]?.trim()) errors.push(`${at}: no ${key}`);
  const c = n.content;
  if (!c) return;
  localized(c.meaning, `${at} meaning`);
  localized(c.impact, `${at} impact`);
  if (!(c.evidence?.length >= 1 && c.evidence.length <= 3)) errors.push(`${at}: needs one to three evidences`);
  c.evidence?.forEach((e, j) => nameText(e, `${at} evidence[${j}]`));
  nameText(c.dua, `${at} dua`);
});

if (errors.length) {
  console.error(`${errors.length} problem(s) in public/data:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
const sources = new Set(content.ayat.flatMap((a) => a.sources.map((s) => s.url))).size;
const written = names.filter((n) => n.content).length;
console.log(`OK: ${content.categories.length} fields, ${content.ayat.length} signs, ${stops.length} journey stops, ${sources} sources.`);
console.log(`OK: ${names.length} names, ${written} written.`);
