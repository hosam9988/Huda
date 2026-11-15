import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideClientHydration,
  Title,
  withEventReplay,
  withNoHttpTransferCache,
} from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { showWhenRedrawn } from './core/prerender';
import { PageMeta, PageTitle } from './core/services/page-meta.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    // The app takes over the prerendered page instead of drawing it again. The data files stay out
    // of the page (ayat.json alone is 850 kB): the first page waits for them (core/prerender.ts).
    provideClientHydration(withEventReplay(), withNoHttpTransferCache()),
    { provide: Title, useExisting: PageTitle },
    provideAppInitializer(() => {
      inject(PageMeta);
    }),
    provideAppInitializer(showWhenRedrawn),
  ],
};
