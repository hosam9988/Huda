import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  WritableSignal,
} from '@angular/core';
import { Ayah, CategoryId } from '../../core/models/ayah';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { matchesQuery } from '../../core/utils/search';
import { AyahCard } from '../../shared/ayah-card';

const PHONE = '(max-width: 640px)';

/**
 * How many cards a list shows at first, and how many more each «اعرض المزيد» adds, so that the page
 * never runs on and on: six on a phone, twelve on a wider screen, which fill whole rows of two,
 * three or four cards.
 */
function step(): number {
  return typeof matchMedia === 'function' && matchMedia(PHONE).matches ? 6 : 12;
}

/**
 * One list's field filter and search, and how many of its cards it shows. The page keeps them, so
 * that Back finds the list as the reader left it.
 */
export interface ListState {
  filter: WritableSignal<CategoryId | null>;
  query: WritableSignal<string>;
  /** Cards shown: the first ones again whenever the filter or the search changes. */
  shown: WritableSignal<number>;
}

export function listState(): ListState {
  return { filter: signal(null), query: signal(''), shown: signal(step()) };
}

/** Back to every field, no search, and the first cards. */
export function resetList(list: ListState): void {
  list.filter.set(null);
  list.query.set('');
  list.shown.set(step());
}

/**
 * One list on /signs, the miracles or the signs for reflection: its own field filter (only the
 * fields it has signs in) and search, and its first cards, with «اعرض المزيد» for more at a time.
 */
@Component({
  selector: 'app-sign-list',
  imports: [AyahCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tools">
      <div class="filters" role="group" [attr.aria-label]="t().filterLabel + ': ' + name()">
        <button type="button" class="filter" [attr.aria-pressed]="state().filter() === null" (click)="setFilter(null)">
          {{ t().filterAll }}
        </button>
        @for (category of fields(); track category.id) {
          <button
            type="button"
            class="filter"
            [attr.aria-pressed]="state().filter() === category.id"
            (click)="setFilter(state().filter() === category.id ? null : category.id)"
          >
            {{ language.pick(category.title) }}
          </button>
        }
      </div>
      <label class="search">
        <span class="visually-hidden">{{ t().searchLabel(name()) }}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input
          type="search"
          [placeholder]="placeholder()"
          [value]="state().query()"
          (input)="setQuery($any($event.target).value)"
        />
      </label>
    </div>

    @if (visible().length) {
      <ul class="list" [class.grid]="look() === 'art'" [class.verses]="look() === 'verse'">
        @for (ayah of visible(); track ayah.slug) {
          <li><app-ayah-card [ayah]="ayah" [look]="look()" /></li>
        }
      </ul>
      @if (hidden()) {
        <p class="more">
          <button type="button" class="btn big" (click)="showMore()">
            {{ t().showMore(language.number(hidden())) }}
            <svg viewBox="0 0 24 24" aria-hidden="true" class="chevron"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </p>
      }
    } @else {
      <p class="status">{{ t().noResults }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    // The list's field filter and search, together in one bar.
    .tools {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem 1rem;
      margin-block-end: 1.5rem;
      padding: 0.75rem;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: linear-gradient(180deg, var(--surface-raised), var(--surface));
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .filter {
      min-block-size: 2.5rem;
      padding: 0.3rem 1rem;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: transparent;
      color: var(--text-muted);
      font: inherit;
      font-family: var(--font-display-en);
      font-size: 0.9rem;
      cursor: pointer;
      transition:
        background-color 0.2s,
        color 0.2s,
        border-color 0.2s;

      &:hover {
        border-color: var(--line-strong);
        color: var(--text);
      }

      &[aria-pressed='true'] {
        border-color: transparent;
        background: var(--gold-gradient);
        color: var(--on-accent);
        font-weight: 600;
      }
    }

    .search {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1 1 16rem;
      max-inline-size: 22rem;
      min-block-size: 2.75rem;
      padding-inline: 1rem;
      border: 1px solid var(--line-strong);
      border-radius: 999px;
      background: rgb(var(--bg-rgb) / 60%);
      color: var(--text-muted);

      &:focus-within {
        border-color: var(--gold);
      }

      svg {
        inline-size: 1.1rem;
        flex-shrink: 0;
      }

      // A zero base width: otherwise the input's built-in width pushes the box past narrow screens.
      input {
        flex: 1;
        inline-size: 0;
        min-inline-size: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: var(--text);
        font: inherit;
        font-size: 0.98rem;
      }
    }

    :host-context([lang='ar']) .filter {
      font-family: var(--font-display-ar);
    }

    .list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(17rem, 100%), 1fr));
      gap: 1.25rem;
    }

    // The signs for reflection lead with their verse. Their cards stand in rows too, each row as tall
    // as its tallest card, so that «اعرض المزيد» adds cards below without moving the ones shown.
    .verses {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
      gap: 1.25rem;
    }

    // Every card in a row as tall as the row: the list item stretches with its row, and as a grid it
    // stretches the card inside it too (the card then fills it with its own block-size: 100%).
    .grid > li,
    .verses > li {
      display: grid;
    }

    .more {
      margin: 1.75rem 0 0;
      text-align: center;

      .chevron {
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    }

    .status {
      padding-block: 3rem;
      color: var(--text-muted);
      text-align: center;
    }

    @media (max-width: 560px) {
      .search {
        max-inline-size: none;
      }
    }
  `,
})
export class SignList {
  /** The list's signs in reading order, before its filter and search. */
  readonly signs = input.required<Ayah[]>();
  readonly state = input.required<ListState>();
  /** The list's title, which tells its filter and its search apart from the other list's. */
  readonly name = input.required<string>();
  readonly placeholder = input.required<string>();
  readonly look = input<'art' | 'verse'>('art');

  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  private readonly content = inject(ContentService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** The fields this list has signs in, in the fields' order. */
  protected readonly fields = computed(() => {
    const signs = this.signs();
    return this.content.categories().filter((c) => signs.some((a) => a.category === c.id));
  });

  protected readonly matching = computed(() => {
    const filter = this.state().filter();
    const query = this.state().query();
    return this.signs().filter((a) => (!filter || a.category === filter) && matchesQuery(a, query));
  });

  protected readonly visible = computed(() => this.matching().slice(0, this.state().shown()));

  protected readonly hidden = computed(() => this.matching().length - this.visible().length);

  constructor() {
    const phone = matchMedia(PHONE);
    // A phone turned on its side, or upright: never fewer cards than it was showing, or the reader's
    // card could vanish and leave them at the end of the page.
    const onChange = () => this.state().shown.set(Math.max(this.state().shown(), step()));
    phone.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => phone.removeEventListener('change', onChange));
  }

  /** Another field or search starts again from the first cards. */
  protected setFilter(id: CategoryId | null): void {
    if (id === this.state().filter()) return;
    this.state().filter.set(id);
    this.state().shown.set(step());
  }

  protected setQuery(query: string): void {
    this.state().query.set(query);
    this.state().shown.set(step());
  }

  /** More cards, and the focus on the first of them, for keyboard and screen-reader users. */
  protected showMore(): void {
    const from = this.visible().length;
    this.state().shown.set(from + step());
    afterNextRender(
      () => {
        const card = this.host.nativeElement.querySelectorAll<HTMLElement>('.list > li a')[from];
        if (!card) return;
        card.focus({ preventScroll: true });
        // It normally takes the button's place; if the page moved, bring it back into view.
        const top = card.getBoundingClientRect().top;
        if (top < 80 || top > innerHeight - 120) card.scrollIntoView({ block: 'center' });
      },
      { injector: this.injector },
    );
  }
}
