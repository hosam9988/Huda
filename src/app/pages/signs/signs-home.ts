import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationSkipped, NavigationStart, Router, RouterLink } from '@angular/router';
import { CategoryId } from '../../core/models/ayah';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { ReadingService } from '../../core/services/reading.service';
import { artSmallSrc, artSrc, artSrcset } from '../../core/utils/art';
import { readingMinutes } from '../../core/utils/reading-time';
import { matchesQuery } from '../../core/utils/search';
import { AyahCard } from '../../shared/ayah-card';
import { Ornament } from '../../shared/ornament';
import { ProgressRing } from '../../shared/progress-ring';
import { Reveal } from '../../shared/reveal';

// Back and Forward rebuild this page, and the router restores the scroll position the reader left.
// That position belongs to the page as it was then, so what changes its height lives out here:
/** Whether the journey is open, kept for the whole visit. */
const journeyOpen = signal(false);
/** The field filter and the search, kept while Back/Forward rebuild the page. */
const filter = signal<CategoryId | null>(null);
const query = signal('');
/** The sign the continue card offered when the page was last reached by a link. */
let continueSlug: string | undefined;

/** The front page of the I'jaz section, «سنريهم آياتنا»: the fields, the folded journey, the miracles and the signs for reflection. */
@Component({
  selector: 'app-signs-home',
  imports: [RouterLink, AyahCard, Ornament, ProgressRing, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signs-home.html',
  styleUrl: './signs-home.scss',
})
export class SignsHome {
  protected readonly content = inject(ContentService);
  protected readonly reading = inject(ReadingService);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  protected readonly artSrc = artSrc;
  protected readonly artSmallSrc = artSmallSrc;
  protected readonly artSrcset = artSrcset;
  protected readonly query = query;
  protected readonly filter = filter;
  protected readonly confirmingReset = signal(false);
  /** The journey stays folded until the reader opens it, or arrives by a link to `#journey`. */
  protected readonly journeyOpen = journeyOpen;
  private readonly fragment = toSignal(inject(ActivatedRoute).fragment);

  /** The field filter and the search apply to both lists. */
  private readonly shown = computed(() => {
    const filter = this.filter();
    const query = this.query();
    return this.content.ordered().filter((a) => (!filter || a.category === filter) && matchesQuery(a, query));
  });
  protected readonly miracles = computed(() => this.shown().filter((a) => a.type !== 'reflection'));
  protected readonly reflections = computed(() => this.shown().filter((a) => a.type === 'reflection'));

  protected readonly stats = computed(() => ({
    signs: this.content.ayat().length,
    miracles: this.content.ayat().filter((a) => a.type !== 'reflection').length,
    fields: this.content.categories().length,
    sources: new Set(this.content.ayat().flatMap((a) => a.sources.map((s) => s.url))).size,
  }));

  protected readonly journeyMinutes = computed(() =>
    this.content.journey().reduce((sum, a) => sum + readingMinutes(a, this.language.lang()), 0),
  );

  /** The sign where the reader stopped, unless they had already finished it, chosen when a link led here. */
  protected readonly continueAt = computed(() =>
    continueSlug && this.reading.place() ? this.content.ayah(continueSlug) : undefined,
  );

  protected readonly readCount = computed(() => this.reading.countRead(this.content.ayat().map((a) => a.slug)));

  protected readonly progress = computed(() => {
    const total = this.content.ayat().length;
    return total ? this.readCount() / total : 0;
  });

  constructor() {
    const title = inject(Title);
    effect(() =>
      title.setTitle(
        this.language.isArabic()
          ? `سنريهم آياتنا | ${this.t().appTitle}`
          : `We Will Show Them Our Signs | ${this.t().appTitle}`,
      ),
    );
    const router = inject(Router);
    // How the navigation that built this page, then each later one, was started: Back/Forward
    // ("popstate") return to the page as the reader left it.
    let trigger = router.currentNavigation()?.trigger;
    if (trigger !== 'popstate') {
      filter.set(null);
      query.set('');
      const place = this.reading.place();
      continueSlug = place && !this.reading.isRead(place.slug) ? place.slug : undefined;
    }

    // Links to #journey open the journey; Back and Forward leave it as the reader left it.
    effect(() => {
      if (this.fragment() === 'journey' && trigger !== 'popstate') this.journeyOpen.set(true);
    });
    router.events.pipe(takeUntilDestroyed()).subscribe((e) => {
      if (e instanceof NavigationStart) trigger = e.navigationTrigger;
      // A second click on a link to #journey is the same URL, so the fragment doesn't change, but the
      // router still scrolls there: open the journey too.
      if (e instanceof NavigationSkipped && router.parseUrl(e.url).fragment === 'journey') this.journeyOpen.set(true);
    });

    // The router scrolls to #journey, #all or #reflection once, a frame after navigating. Arriving
    // before ayat.json has loaded (a fresh load, or from /method, /next or /names), those sections
    // aren't there yet, so scroll once they are. Jump rather than glide: a smooth scroll this long
    // outlasts the web fonts' swap and ends at a stale offset, so jump again once they are in,
    // unless the reader has scrolled meanwhile.
    if (!this.content.ayat().length) {
      let pending = true;
      effect(() => {
        if (!pending || !this.content.ayat().length) return;
        pending = false;
        const fragment = untracked(this.fragment);
        if (!fragment) return;
        afterNextRender(
          () => {
            const go = () => this.document.getElementById(fragment)?.scrollIntoView({ block: 'start', behavior: 'instant' });
            go();
            const y = scrollY;
            this.document.fonts?.ready.then(() => scrollY === y && go());
          },
          { injector: this.injector },
        );
      });
    }
  }

  protected miraclesIn(id: CategoryId): number {
    return this.content.inCategory(id).filter((a) => a.type !== 'reflection').length;
  }

  protected reflectionIn(id: CategoryId): number {
    return this.content.inCategory(id).filter((a) => a.type === 'reflection').length;
  }

  protected readIn(id: CategoryId): number {
    return this.reading.countRead(this.content.inCategory(id).map((a) => a.slug));
  }

  /**
   * From a field's card: show only its signs, then scroll down to them (to its signs for reflection
   * if it has no miracles) and move the focus to that list's heading.
   */
  protected showCategory(id: CategoryId): void {
    this.filter.set(id);
    this.query.set('');
    const list = this.miraclesIn(id) ? 'all' : 'reflection';
    // Until the lists re-render, #reflection still sits below every miracle.
    afterNextRender(
      () => {
        const section = this.document.getElementById(list);
        section?.scrollIntoView({ block: 'start' });
        section?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  protected reset(): void {
    this.reading.resetAll();
    this.confirmingReset.set(false);
  }
}
