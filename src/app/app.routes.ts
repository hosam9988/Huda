import { Routes } from '@angular/router';
import { firstPageData } from './core/prerender';
import { ContentService } from './core/services/content.service';
import { NamesService } from './core/services/names.service';

/** The site's pages, at their Arabic addresses. */
const pages: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/portal/portal').then((m) => m.Portal),
    resolve: { ready: firstPageData(ContentService, NamesService) },
  },
  {
    path: 'signs',
    loadComponent: () => import('./pages/signs/signs-home').then((m) => m.SignsHome),
    resolve: { ready: firstPageData(ContentService) },
  },
  {
    path: 'signs/:slug',
    loadComponent: () => import('./pages/ayah/ayah-page').then((m) => m.AyahPage),
    resolve: { ready: firstPageData(ContentService) },
  },
  {
    path: 'names',
    loadComponent: () => import('./pages/names/names-home').then((m) => m.NamesHome),
    resolve: { ready: firstPageData(NamesService) },
  },
  {
    path: 'names/:slug',
    loadComponent: () => import('./pages/names/name-page').then((m) => m.NamePage),
    resolve: { ready: firstPageData(NamesService) },
  },
  { path: 'method', loadComponent: () => import('./pages/method/method').then((m) => m.Method) },
  {
    path: 'next',
    loadComponent: () => import('./pages/next-steps/next-steps').then((m) => m.NextSteps),
  },
];

export const routes: Routes = [
  ...pages,
  // The same pages in English, at /en/…. LanguageLocationStrategy takes the /en/ out of the address
  // before the router sees it, so these routes only tell the build which English pages to prerender.
  {
    path: 'en',
    children: [...pages.map((route) => ({ ...route })), { path: '**', redirectTo: '' }],
  },
  // Links to signs from the first site, «سنريهم آياتنا».
  { path: 'ayah/:slug', redirectTo: 'signs/:slug' },
  { path: '**', redirectTo: '' },
];
