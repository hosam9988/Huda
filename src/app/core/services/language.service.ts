import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toArabicDigits, UI_TEXT } from '../i18n/ui-text';
import { isLang, Lang, LANGUAGES, localize, Localized } from '../models/lang';
import { readStorage, writeStorage } from './storage';

/** Also read by the inline script in index.html, which sets <html dir> before first paint. */
const KEY = 'ayat.lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);

  readonly lang = signal<Lang>(initialLang());
  readonly isArabic = computed(() => this.lang() === 'ar');
  readonly t = computed(() => UI_TEXT[this.lang()]);
  /** The language the switch in the header changes to. */
  readonly nextLanguage = computed(() => {
    const i = LANGUAGES.findIndex((l) => l.id === this.lang());
    return LANGUAGES[(i + 1) % LANGUAGES.length];
  });

  constructor() {
    effect(() => {
      const lang = this.lang();
      const html = this.document.documentElement;
      html.lang = lang;
      html.dir = LANGUAGES.find((l) => l.id === lang)!.dir;
      writeStorage(KEY, lang);
    });
  }

  toggle(): void {
    this.lang.set(this.nextLanguage().id);
  }

  /** The text in the current language (reactive when called in a template or computed). */
  pick(text: Localized | undefined): string {
    return localize(text, this.lang());
  }

  number(value: number | string): string {
    return this.isArabic() ? toArabicDigits(value) : String(value);
  }
}

function initialLang(): Lang {
  const saved = readStorage(KEY);
  if (isLang(saved)) return saved;
  const browser = navigator.language?.toLowerCase() ?? '';
  return LANGUAGES.find((l) => browser.startsWith(l.id))?.id ?? 'en';
}
