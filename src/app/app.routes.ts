import { Routes } from '@angular/router';
import { firstPageData } from './core/prerender';
import { ContentService } from './core/services/content.service';
import { NamesService } from './core/services/names.service';

export const routes: Routes = [
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
  { path: 'next', loadComponent: () => import('./pages/next-steps/next-steps').then((m) => m.NextSteps) },
  // Links to signs from the first site, «سنريهم آياتنا».
  { path: 'ayah/:slug', redirectTo: 'signs/:slug' },
  { path: '**', redirectTo: '' },
];
