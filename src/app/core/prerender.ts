import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  effect,
  inject,
  Injector,
  PLATFORM_ID,
  ProviderToken,
  Signal,
} from '@angular/core';
import { NavigationEnd, NavigationError, ResolveFn, Router } from '@angular/router';
import { first } from 'rxjs';

// Every page is prerendered (app.routes.server.ts). In the browser, the app then takes the page over
// as it is (hydration): these keep that hand-over seamless.

/**
 * Holds the first page until its data files have loaded, so that the app takes over the prerendered
 * page with the same content instead of putting its loading state in place of it. Later pages open
 * at once and show that state while their data loads, as before.
 */
export function firstPageData(
  ...sources: ProviderToken<{ isLoading: Signal<boolean> }>[]
): ResolveFn<boolean> {
  return () => {
    if (inject(Router).navigated) return true;
    const services = sources.map((source) => inject(source));
    return new Promise<boolean>((resolve) => {
      const watch = effect(() => {
        if (services.some((service) => service.isLoading())) return;
        watch.destroy();
        resolve(true);
      });
    });
  };
}

/**
 * The pages are prerendered in Arabic. For a reader of another language, the script in index.html
 * hides the page (`html.relang`) until the app has drawn it in theirs: show it once the first page
 * is in place.
 */
export function showWhenRedrawn(): void {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
  const html = inject(DOCUMENT).documentElement;
  if (!html.classList.contains('relang')) return;
  const injector = inject(Injector);
  inject(Router)
    .events.pipe(first((e) => e instanceof NavigationEnd || e instanceof NavigationError))
    .subscribe(() => afterNextRender(() => html.classList.remove('relang'), { injector }));
}
