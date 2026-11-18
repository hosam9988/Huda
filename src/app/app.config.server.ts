import { ɵHTTP_FETCH_MAX_RESPONSE_SIZE as HTTP_FETCH_MAX_RESPONSE_SIZE } from '@angular/common/http';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * On the server, Angular's fetch backend refuses any response over 1 MB, and the prerender then
 * fails with "Http failure response for (unknown url)". public/data/ayat.json passed 1 MB when the
 * journey's new signs were added (2026-11-18), so the server allows 8 MB. The token is Angular's
 * own, though not yet public.
 */
const MAX_DATA_FILE = 8 * 1024 * 1024;

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: HTTP_FETCH_MAX_RESPONSE_SIZE, useValue: MAX_DATA_FILE },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
