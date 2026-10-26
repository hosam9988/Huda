import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/portal/portal').then((m) => m.Portal) },
  { path: 'signs', loadComponent: () => import('./pages/signs/signs-home').then((m) => m.SignsHome) },
  { path: 'signs/:slug', loadComponent: () => import('./pages/ayah/ayah-page').then((m) => m.AyahPage) },
  { path: 'names', loadComponent: () => import('./pages/names/names-home').then((m) => m.NamesHome) },
  { path: 'names/:slug', loadComponent: () => import('./pages/names/name-page').then((m) => m.NamePage) },
  { path: 'method', loadComponent: () => import('./pages/method/method').then((m) => m.Method) },
  { path: 'next', loadComponent: () => import('./pages/next-steps/next-steps').then((m) => m.NextSteps) },
  // Links to signs from the first site, «سنريهم آياتنا».
  { path: 'ayah/:slug', redirectTo: 'signs/:slug' },
  { path: '**', redirectTo: '' },
];
