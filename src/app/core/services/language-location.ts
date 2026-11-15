import { PathLocationStrategy } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { pathInLang, pathWithoutLang } from '../models/lang';
import { LanguageService } from './language.service';

/**
 * Puts the page's language in its address: English pages are under /en/ (/en/signs/…), Arabic
 * ones have the plain addresses. The router never sees the language folder. Every link, and every
 * address the router writes, gets it from the page's language, so links need no change, and they
 * follow the language switch on their own (a link's href reads the language through here).
 */
@Injectable()
export class LanguageLocationStrategy extends PathLocationStrategy {
  private readonly language = inject(LanguageService);

  /** The router's address («/signs/x») as the browser's, in the page's language. */
  override prepareExternalUrl(internal: string): string {
    return super.prepareExternalUrl(pathInLang(internal, this.language.lang()));
  }

  /** The browser's address without its language folder, for the router. */
  override path(includeHash = false): string {
    const path = super.path(includeHash);
    const base = this.getBaseHref();
    return path.startsWith(base) ? base + pathWithoutLang(path.slice(base.length)) : path;
  }
}
