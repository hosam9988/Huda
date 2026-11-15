import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, Injector, signal, untracked } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { UiText } from '../i18n/ui-text';
import { artSrc } from '../utils/art';
import { ContentService } from './content.service';
import { LanguageService } from './language.service';
import { NamesService } from './names.service';

/** Where the site is published. Its path is the production build's base href, in angular.json. */
export const SITE_URL = 'https://hosam9988.github.io/Huda/';

/**
 * The pages whose address ends in a slash: GitHub Pages answers /signs with a redirect to /signs/,
 * the folder that holds the signs' own pages (see scripts/finish-build.mjs).
 */
const FOLDERS = new Set(['signs', 'names']);

const OG_LOCALE = { ar: 'ar_AR', en: 'en_US' } as const;

/**
 * What a page shows in search results and link previews besides its title. The image is in
 * public/images: a sign's own (1280×800), else a hero (1536×864).
 */
interface Preview {
  description: string;
  image: string;
  width: number;
  height: number;
  type: 'website' | 'article';
}

/**
 * Each page's description, canonical address and Open Graph tags, for search engines and link
 * previews, in the reader's language. The server writes them into every prerendered page. The
 * title stays the page's own, which PageTitle copies into og:title.
 */
@Injectable({ providedIn: 'root' })
export class PageMeta {
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly language = inject(LanguageService);
  /** The page shown: the deepest route of the last navigation. */
  private readonly route = signal<ActivatedRouteSnapshot | undefined>(undefined);

  constructor() {
    const router = inject(Router);
    router.events.subscribe((e) => {
      if (!(e instanceof NavigationEnd)) return;
      let route = router.routerState.snapshot.root;
      while (route.firstChild) route = route.firstChild;
      this.route.set(route);
    });
    effect(() => {
      const route = this.route();
      if (route) this.apply(route);
    });
  }

  private apply(route: ActivatedRouteSnapshot): void {
    const t = this.language.t();
    const path = route.pathFromRoot.flatMap((r) => r.url.map((s) => s.path)).join('/');
    const url = SITE_URL + (FOLDERS.has(path) ? `${path}/` : path);
    const page = this.preview(route.routeConfig?.path ?? '', route.params['slug'], t);

    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:type', content: page.type });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:site_name', content: t.appTitle });
    this.meta.updateTag({ property: 'og:locale', content: OG_LOCALE[this.language.lang()] });
    this.meta.updateTag({ property: 'og:image', content: SITE_URL + artSrc(page.image) });
    this.meta.updateTag({ property: 'og:image:type', content: 'image/webp' });
    this.meta.updateTag({ property: 'og:image:width', content: String(page.width) });
    this.meta.updateTag({ property: 'og:image:height', content: String(page.height) });
    this.meta.updateTag({ property: 'og:image:alt', content: t.illustrativeImage });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  /** A sign's page opens with its question, a name's with its meaning, the others with their intro. */
  private preview(path: string, slug: string | undefined, t: UiText): Preview {
    const hero = { image: 'hero', width: 1536, height: 864 };
    const namesHero = { image: 'names-hero', width: 1536, height: 864 };
    switch (path) {
      case 'signs/:slug': {
        // Untracked: the service starts loading its file when first created, which isn't allowed
        // inside an effect. Its signals are still tracked.
        const sign = untracked(() => this.injector.get(ContentService)).ayah(slug ?? '');
        if (!sign) return { description: t.heroIntro, type: 'website', ...hero };
        return {
          description: this.language.pick(sign.hook),
          type: 'article',
          image: sign.art,
          width: 1280,
          height: 800,
        };
      }
      case 'names/:slug': {
        const name = untracked(() => this.injector.get(NamesService)).name(slug ?? '');
        const meaning = name?.content ? this.language.pick(name.content.meaning) : undefined;
        return {
          description: meaning ?? t.names.intro,
          type: meaning ? 'article' : 'website',
          ...namesHero,
        };
      }
      case 'signs':
        return { description: t.heroIntro, type: 'website', ...hero };
      case 'names':
        return { description: t.names.intro, type: 'website', ...namesHero };
      case 'method':
        return { description: t.methodBandText, type: 'website', ...hero };
      case 'next':
        return { description: t.nextBandText, type: 'website', ...hero };
      default:
        return { description: t.portal.intro, type: 'website', ...hero };
    }
  }
}

/** The page's title as the page sets it, copied into og:title so that link previews carry it too. */
@Injectable({ providedIn: 'root' })
export class PageTitle extends Title {
  private readonly meta = inject(Meta);

  override setTitle(title: string): void {
    super.setTitle(title);
    this.meta.updateTag({ property: 'og:title', content: title });
  }
}
