import { Ayah } from '../models/ayah';
import { Lang, localize } from '../models/lang';

/** Words a minute: Arabic words are longer and carry more, so they read a little slower. */
const WORDS_PER_MINUTE: Record<Lang, number> = { ar: 150, en: 200 };

/** Minutes to read a sign's page, rounded up. */
export function readingMinutes(ayah: Ayah, lang: Lang): number {
  const texts = [
    ayah.hook,
    ...ayah.then,
    ...ayah.now,
    ayah.reflection,
    ayah.caution,
    ayah.didYouKnow,
    ...ayah.evidence.map((e) => e.meaning),
    ...ayah.timeline.map((m) => m.text),
  ];
  const words =
    texts.reduce((sum, t) => sum + localize(t, lang).split(/\s+/).filter(Boolean).length, 0) +
    ayah.evidence.reduce((sum, e) => sum + e.text.split(/\s+/).length, 0);
  return Math.max(2, Math.ceil(words / WORDS_PER_MINUTE[lang]));
}
