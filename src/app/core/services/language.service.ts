import { DOCUMENT, isPlatformBrowser, Location, PlatformLocation } from '@angular/common';
import { computed, effect, inject, Injectable, Injector, PLATFORM_ID, signal } from '@angular/core';
import { toArabicDigits, UI_TEXT } from '../i18n/ui-text';
import { Lang, LANGUAGES, langOfPath, localize, Localized } from '../models/lang';
import { writeStorage } from './storage';

/**
 * The language the reader chose with the switch. Read by the inline script in index.html, which
 * then opens every page in that language, before the page is drawn.
 */
const KEY = 'ayat.lang';

/**
 * The page's language. Its address gives it: /en/… is English, the plain addresses Arabic (see
 * LanguageLocationStrategy), so that search engines find each page in both languages.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly platformLocation = inject(PlatformLocation);

  readonly lang = signal<Lang>(this.addressLang());
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
    });
    // Back and Forward can return to an address from before the reader switched: keep the language
    // they chose, and give that page the address in it.
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      this.platformLocation.onPopState(() => {
        if (this.addressLang() !== this.lang()) this.readdress();
      });
    }
  }

  /** The switch in the header: this page in the other language, kept for the reader's later visits. */
  toggle(): void {
    const next = this.nextLanguage().id;
    writeStorage(KEY, next);
    this.lang.set(next);
    this.readdress();
  }

  /** The text in the current language (reactive when called in a template or computed). */
  pick(text: Localized | undefined): string {
    return localize(text, this.lang());
  }

  number(value: number | string): string {
    return this.isArabic() ? toArabicDigits(value) : String(value);
  }

  /** The language of the address in the browser, or of the page being prerendered. */
  private addressLang(): Lang {
    const base = this.platformLocation.getBaseHrefFromDOM() ?? '/';
    const path = this.platformLocation.pathname;
    return langOfPath(path.startsWith(base) ? path.slice(base.length) : '');
  }

  /** Writes the page's address again in the page's language: /signs/x ⇄ /en/signs/x. */
  private readdress(): void {
    const location = this.injector.get(Location);
    location.replaceState(location.path(true), '', location.getState());
  }
}
