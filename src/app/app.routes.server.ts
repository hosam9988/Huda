import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { firstValueFrom } from 'rxjs';
import { Content } from './core/models/ayah';
import { NamesData } from './core/models/divine-name';

/** Every sign's slug, from public/data/ayat.json. */
async function signs(): Promise<Record<string, string>[]> {
  const content = await firstValueFrom(inject(HttpClient).get<Content>('data/ayat.json'));
  return content.ayat.map(({ slug }) => ({ slug }));
}

/** Every name's slug, from public/data/names.json. */
async function names(): Promise<Record<string, string>[]> {
  const data = await firstValueFrom(inject(HttpClient).get<NamesData>('data/names.json'));
  return data.names.map(({ slug }) => ({ slug }));
}

/**
 * Every page is prerendered at build time into an HTML file of its own, in Arabic and, under /en/,
 * in English, with its text, title and description in it, so that GitHub Pages serves it as a page
 * (200) rather than through 404.html. scripts/finish-build.mjs then lays the files out for Pages.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'signs/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: signs },
  { path: 'names/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: names },
  { path: 'en/signs/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: signs },
  { path: 'en/names/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: names },
  // The first site's links: a page that sends the reader on to the sign.
  { path: 'ayah/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: signs },
  // The home page, /signs, /names, /method and /next, in both languages. Unknown addresses get
  // 404.html.
  { path: '**', renderMode: RenderMode.Prerender },
];
