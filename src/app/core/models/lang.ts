/**
 * The site's languages. To add one (say French): add it here, add its labels to UI_TEXT in
 * i18n/ui-text.ts, then translate the content in public/data/ayat.json. Any text not translated
 * yet falls back to English, then Arabic (see `localize`). The backend reads only the languages
 * in its LocalizedText (backend/src/Huda.Domain/LocalizedText.cs), so add it there too.
 */
export const LANGUAGES = [
  { id: 'ar', name: 'العربية', dir: 'rtl' },
  { id: 'en', name: 'English', dir: 'ltr' },
] as const;

export type Lang = (typeof LANGUAGES)[number]['id'];

/** Text in several languages. Arabic is always there; the others may come later. */
export type Localized = { ar: string } & Partial<Record<Lang, string>>;

export function localize(text: Localized | undefined, lang: Lang): string {
  if (!text) return '';
  return text[lang] ?? text.en ?? text.ar;
}

export function isLang(value: unknown): value is Lang {
  return LANGUAGES.some((l) => l.id === value);
}

/**
 * Arabic, the site's first language, has the plain addresses (/signs/…); every other language has
 * the same pages under its own folder (/en/signs/…). The address decides a page's language.
 */
export const FIRST_LANGUAGE: Lang = 'ar';

/** The language of an address, from its path below the base href: «en/signs/x» is English. */
export function langOfPath(path: string): Lang {
  const folder = path.replace(/^\//, '').split(/[/?#]/)[0];
  return isLang(folder) && folder !== FIRST_LANGUAGE ? folder : FIRST_LANGUAGE;
}

/** The path without its language folder: «en/signs/x» → «signs/x». */
export function pathWithoutLang(path: string): string {
  const lang = langOfPath(path);
  if (lang === FIRST_LANGUAGE) return path;
  return path.replace(new RegExp(`^(/?)${lang}(?:/|(?=[?#])|$)`), '$1');
}

/** A path of the router («/signs/x», «/») in a language's folder: «/en/signs/x», «/en/». */
export function pathInLang(path: string, lang: Lang): string {
  return lang === FIRST_LANGUAGE ? path : `/${lang}/${path.replace(/^\//, '')}`;
}
