import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { DivineName } from '../../core/models/divine-name';
import { LanguageService } from '../../core/services/language.service';
import { NamesService } from '../../core/services/names.service';
import { ReadingService } from '../../core/services/reading.service';
import { matchesName } from '../../core/utils/search';
import { ProgressRing } from '../../shared/progress-ring';
import { Reveal } from '../../shared/reveal';

const PHONE = '(max-width: 640px)';

/**
 * How many names the list shows at first, and how many more each «اعرض المزيد» adds, so that the
 * page never runs on and on: twelve on a phone (six rows of two), twenty-four on a wider screen
 * (four rows of six).
 */
function step(): number {
  return typeof matchMedia === 'function' && matchMedia(PHONE).matches ? 12 : 24;
}

/**
 * The search and how many names are shown. Back and Forward rebuild the page, and the router puts
 * the reader back where they were, so these live out here and survive it.
 */
const query = signal('');
const shown = signal(step());

/** The front page of the Beautiful Names section: the name of the day, search and the names. */
@Component({
  selector: 'app-names-home',
  imports: [RouterLink, ProgressRing, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './names-home.html',
  styleUrl: './names-home.scss',
})
export class NamesHome {
  protected readonly names = inject(NamesService);
  protected readonly reading = inject(ReadingService);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly query = query;
  protected readonly filtered = computed(() => this.names.names().filter((n) => matchesName(n, query())));
  protected readonly visible = computed(() => this.filtered().slice(0, shown()));
  protected readonly hidden = computed(() => this.filtered().length - this.visible().length);

  protected readonly readCount = computed(() => this.reading.countRead(this.names.names().map((n) => n.slug)));
  protected readonly progress = computed(() => {
    const total = this.names.names().length;
    return total ? this.readCount() / total : 0;
  });

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.t().names.title} | ${this.t().appTitle}`));

    // Arriving by a link starts from the first names; Back and Forward find the list as it was left.
    if (this.router.currentNavigation()?.trigger !== 'popstate') {
      query.set('');
      shown.set(step());
    }
    // A phone turned on its side, or upright: never fewer names than it was showing.
    const phone = matchMedia(PHONE);
    const onChange = () => shown.set(Math.max(shown(), step()));
    phone.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => phone.removeEventListener('change', onChange));
  }

  /** Another search starts again from the first names. */
  protected setQuery(value: string): void {
    query.set(value);
    shown.set(step());
  }

  /** More names, and the focus on the first of them, for keyboard and screen-reader users. */
  protected showMore(): void {
    const from = this.visible().length;
    shown.set(from + step());
    afterNextRender(
      () => {
        const card = this.host.nativeElement.querySelectorAll<HTMLElement>('.grid > li .name-card')[from];
        if (!card) return;
        card.focus({ preventScroll: true });
        // It normally takes the button's place; if the page moved, bring it back into view.
        const top = card.getBoundingClientRect().top;
        if (top < 80 || top > innerHeight - 120) card.scrollIntoView({ block: 'center' });
      },
      { injector: this.injector },
    );
  }

  /** The line under a name: its meaning once its page is written, else (in English) a gloss. */
  protected meaningOf(name: DivineName): string {
    if (name.content) return this.language.pick(name.content.meaning);
    return this.language.isArabic() ? '' : name.gloss;
  }

  protected isRead(name: DivineName): boolean {
    return this.reading.countRead([name.slug]) > 0;
  }

  /** «فاجئني باسم»: a name chosen at random, one not yet read when there is one. */
  protected surprise(): void {
    const written = this.names.written();
    const unread = written.filter((n) => !this.isRead(n));
    const pool = unread.length ? unread : written;
    const name = pool[Math.floor(Math.random() * pool.length)];
    if (name) this.router.navigate(['/names', name.slug]);
  }
}
