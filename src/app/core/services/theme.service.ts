import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';
import { Theme, THEMES } from '../models/theme';
import { readStorage, writeStorage } from './storage';

/** Also read by the inline script in index.html, which applies the theme before first paint. */
const KEY = 'ayat.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<Theme>(initialTheme());

  constructor() {
    effect(() => {
      const theme = this.theme();
      this.document.documentElement.dataset['theme'] = theme;
      const background = THEMES.find((t) => t.id === theme)!.background;
      this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
      writeStorage(KEY, theme);
    });
  }
}

function initialTheme(): Theme {
  const saved = readStorage(KEY);
  return THEMES.find((t) => t.id === saved)?.id ?? 'night';
}
