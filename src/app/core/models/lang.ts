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
