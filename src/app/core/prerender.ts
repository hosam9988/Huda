import { effect, inject, ProviderToken, Signal } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

/**
 * Every page is prerendered (app.routes.server.ts), and in the browser the app takes the page over
 * as it is (hydration). This holds the first page until its data files have loaded, so that the app
 * takes it over with the same content instead of putting its loading state in place of it. Later
 * pages open at once and show that state while their data loads, as before.
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
