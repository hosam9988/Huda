import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { LanguageService } from './core/services/language.service';
import { ThemePicker } from './shared/theme-picker';

/** Which part of the site a page belongs to, for the header and the tab bar. */
export type Place = 'home' | 'start' | 'signs' | 'names' | 'method' | 'other';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, ThemePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /**
   * The journey ("Start here") is the map on the home page (/#map), and leads through signs and
   * names with ?path=map; the short tour of seven miracles leads through signs with ?path=journey.
   * Both are told apart from the rest of the site.
   */
  protected readonly active = computed<Place>(() => {
    const tree = this.router.parseUrl(this.url());
    const path = tree.root.children['primary']?.segments.map((s) => s.path) ?? [];
    const onJourney = tree.queryParams['path'] === 'map' || tree.queryParams['path'] === 'journey';
    if (!path.length) return tree.fragment === 'map' ? 'start' : 'home';
    if (path[0] === 'signs') return tree.fragment === 'journey' || onJourney ? 'start' : 'signs';
    if (path[0] === 'names') return onJourney ? 'start' : 'names';
    // A topic (/topics/:slug) is only ever a stop on the journey.
    if (path[0] === 'topics') return 'start';
    if (path[0] === 'method') return 'method';
    return 'other';
  });

  /** The skip link moves the focus to the page's content, without changing the address. */
  protected skip(event: Event): void {
    event.preventDefault();
    document.getElementById('main')?.focus({ preventScroll: false });
  }
}
