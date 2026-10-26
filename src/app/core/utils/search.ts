import { Ayah } from '../models/ayah';
import { DivineName } from '../models/divine-name';

/** Strips tashkeel and unifies letter variants so "السماء" matches "ٱلسَّمَآءِ". */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

function normalizeLatin(text: string): string {
  return text.toLowerCase().replace(/[’'`-]/g, '').replace(/\s+/g, ' ');
}

/** Whether every word of the query appears in the sign's title, summary, hook or verses. */
export function matchesQuery(ayah: Ayah, query: string): boolean {
  const q = query.trim();
  if (!q) return true;

  const haystack = [
    ...Object.values(ayah.title),
    ...Object.values(ayah.summary),
    ...Object.values(ayah.hook),
    ...ayah.evidence.flatMap((e) => [e.text, ...Object.values(e.ref)]),
  ].join(' ');

  const arabic = normalizeArabic(haystack);
  const latin = normalizeLatin(haystack);
  return q.split(/\s+/).every((word) => {
    const a = normalizeArabic(word);
    const l = normalizeLatin(word);
    return arabic.includes(a) || (!!l && latin.includes(l));
  });
}

/**
 * Whether a name matches: in Arabic with or without tashkeel and «ال» («رحمن» finds «الرَّحْمَٰنُ»),
 * by transliteration ("ar rahman"), by meaning, or by its number.
 */
export function matchesName(name: DivineName, query: string): boolean {
  const q = query.trim();
  if (!q) return true;

  const arabicQuery = normalizeArabic(q).replace(/^ال/, '');
  if (arabicQuery && normalizeArabic(name.name).includes(arabicQuery)) return true;

  const latinQuery = normalizeLatin(q).replace(/\s/g, '');
  if (!latinQuery) return false;
  const meanings = [name.gloss, ...Object.values(name.content?.meaning ?? {})].join(' ');
  return (
    normalizeLatin(name.transliteration).replace(/\s/g, '').includes(latinQuery) ||
    normalizeLatin(meanings).includes(normalizeLatin(q)) ||
    normalizeArabic(meanings).includes(normalizeArabic(q)) ||
    String(name.number) === latinQuery
  );
}
