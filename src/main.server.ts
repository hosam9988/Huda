import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

// Prerendering has no window to measure: no media query matches, so the lists of signs show every
// card, as on a wide screen (pages/signs/sign-list.ts).
globalThis.matchMedia ??= (media: string) => ({
  matches: false,
  media,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
});

const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, config, context);

export default bootstrap;
