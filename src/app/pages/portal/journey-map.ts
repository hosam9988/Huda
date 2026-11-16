import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  doneOf,
  JOURNEY_TEXT,
  JourneyService,
  nextOf,
  sep,
  Stage,
  stageOf,
  Stop,
  stopsCount,
} from '../../core/journey';
import { LanguageService } from '../../core/services/language.service';
import { artSmallSrc } from '../../core/utils/art';
import { ON_MAP } from '../../shared/journey-stop';

/**
 * What this reader has read lives in their browser, which the prerendered page knows nothing of. So
 * both parts below draw a first visit until the app has taken over the page (hydration needs the
 * same page the server drew), then the reader's own progress.
 */
function mounted() {
  const ready = signal(false);
  afterNextRender(() => ready.set(true));
  return ready;
}

/** Shared by both parts: the stop's title in the page's language. */
function titleOf(language: LanguageService, stop: Stop): string {
  if (stop.arabic && language.isArabic()) return stop.arabic;
  return typeof stop.title === 'string' ? stop.title : language.pick(stop.title);
}

/**
 * The journey's card under the home page's title. A first visit: what it is, and the button that
 * starts it. Later: how far the reader has come, and the button to the next stop.
 */
@Component({
  selector: 'app-journey-start',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="jstart">
      @if (started()) {
        @if (journey.next(); as next) {
          <h2>{{ language.pick(text.continueTitle) }}</h2>
          <p class="line">{{ stageLine() }}</p>
          <div class="bar" role="img" [attr.aria-label]="doneLine()">
            <span [style.inline-size.%]="percent()"></span>
          </div>
          <p class="note">{{ doneLine() }}</p>
          <a class="btn solid big" [routerLink]="next.link" [queryParams]="onMap">
            {{ nextLabel() }}
            <svg viewBox="0 0 24 24" aria-hidden="true" class="arrow"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        } @else {
          <h2>{{ language.pick(text.doneTitle) }}</h2>
          <p class="line">{{ language.pick(text.doneLine) }}</p>
          <a class="btn solid big" routerLink="/next">
            {{ t().nextSteps }}
            <svg viewBox="0 0 24 24" aria-hidden="true" class="arrow"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        }
      } @else {
        <h2>{{ language.pick(text.startTitle) }}</h2>
        <p class="line">{{ language.pick(text.startLine) }}</p>
        @if (first(); as first) {
          <a class="btn solid big" [routerLink]="first.link" [queryParams]="onMap">
            {{ language.pick(text.start) }}
            <svg viewBox="0 0 24 24" aria-hidden="true" class="arrow"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        }
      }
      <a class="to-map" routerLink="/" fragment="map">{{ language.pick(text.seeMap) }}</a>
    </div>
  `,
  styles: `
    :host {
      display: block;
      inline-size: 100%;
    }
    .jstart {
      display: grid;
      justify-items: center;
      gap: 0.4rem;
      padding: clamp(1rem, 2.5vw, 1.5rem) clamp(1rem, 2.5vw, 1.6rem);
      border: 1px solid var(--line-strong);
      border-radius: var(--radius-lg);
      background: rgb(8 12 28 / 60%);
      box-shadow: 0 30px 80px -30px rgb(0 0 0 / 80%);
      text-align: center;
    }
    h2 {
      margin: 0;
      color: var(--text);
      font-size: clamp(1.25rem, 2.6vw, 1.6rem);
    }
    .line {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.92rem;
      line-height: 1.75;
      text-wrap: balance;
    }
    .bar {
      inline-size: 100%;
      block-size: 6px;
      margin-block-start: 0.35rem;
      overflow: hidden;
      border-radius: 999px;
      background: rgb(var(--accent-rgb) / 18%);

      span {
        display: block;
        block-size: 100%;
        border-radius: inherit;
        background: var(--gold-gradient);
      }
    }
    .note {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.8rem;
      line-height: 1.6;
    }
    .btn {
      inline-size: 100%;
      margin-block-start: 0.4rem;
    }
    .arrow {
      inline-size: 1.1em;
      block-size: 1.1em;
    }
    .to-map {
      display: inline-flex;
      align-items: center;
      min-block-size: 2.5rem;
      color: var(--gold-light);
      font-size: 0.92rem;
    }
    :host-context([lang='ar']) :is(.line, .note, .to-map) {
      font-family: var(--font-display-ar);
    }
    @media (max-width: 640px) {
      .jstart {
        gap: 0.25rem;
        padding: 0.85rem 1rem 0.5rem;
      }
      h2 {
        font-size: 1.2rem;
      }
      .line {
        font-size: 0.85rem;
        line-height: 1.6;
      }
    }
  `,
})
export class JourneyStart {
  protected readonly journey = inject(JourneyService);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  protected readonly text = JOURNEY_TEXT;
  protected readonly onMap = ON_MAP;
  private readonly ready = mounted();

  protected readonly first = computed(() => this.journey.stops()[0]);
  /** Started: at least one stop read, in this browser. */
  protected readonly started = computed(() => this.ready() && this.journey.done() > 0);
  protected readonly percent = computed(() => {
    const total = this.journey.stops().length;
    return total ? Math.round((this.journey.done() / total) * 100) : 0;
  });

  protected readonly stageLine = computed(() => {
    const stage = this.journey.stage(this.journey.current());
    const n = (value: number) => this.language.number(value);
    const where = stageOf(this.language.lang(), n(this.journey.current()), n(this.journey.stages().length));
    return stage ? `${where}${sep(this.language.lang())}${this.language.pick(stage.title)}` : where;
  });

  protected readonly doneLine = computed(() =>
    doneOf(this.language.lang(), this.language.number(this.journey.done()), this.language.number(this.journey.stops().length)),
  );

  protected readonly nextLabel = computed(() => {
    const next = this.journey.next();
    return next ? nextOf(this.language.lang(), titleOf(this.language, next)) : '';
  });
}

/**
 * The journey's map, under the home page's title: the seven stages on one road, each a question.
 * The stage the reader is in lists its stops; a finished stage is ticked off; a stage still being
 * written is shown but can't be entered.
 */
@Component({
  selector: 'app-journey-map',
  imports: [NgTemplateOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="section-head">
      <p class="kicker">{{ language.pick(text.mapKicker) }}</p>
      <h2>{{ language.pick(text.mapTitle) }}</h2>
      <p>{{ language.pick(text.mapLine) }}</p>
    </header>

    <ol class="path">
      @for (stage of journey.stages(); track stage.n) {
        @let state = stateOf(stage);
        <li class="stage" [class]="state">
          <span class="node" aria-hidden="true">
            @if (state === 'done') {
              <svg viewBox="0 0 24 24" class="tick"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
            } @else {
              {{ language.number(stage.n) }}
            }
          </span>

          @if (state === 'soon') {
            <div class="card">
              <ng-container *ngTemplateOutlet="head; context: { $implicit: stage, state }" />
            </div>
          } @else if (state === 'here' && stage.stops.length) {
            <div class="card">
              <ng-container *ngTemplateOutlet="head; context: { $implicit: stage, state }" />
              <p class="meta">{{ metaOf(stage) }}</p>
              <ol class="stops">
                @for (stop of stage.stops; track stop.slug) {
                  @let read = isRead(stop);
                  @let isNext = stop === nextHere();
                  <li>
                    <a class="stop" [class.read]="read" [class.next]="isNext" [routerLink]="stop.link" [queryParams]="onMap">
                      @if (stop.art) {
                        <img [src]="artSmallSrc(stop.art)" alt="" width="640" height="400" loading="lazy" decoding="async" />
                      } @else {
                        <span class="name-mark" [class.quran]="stop.kind === 'name'" lang="ar" dir="rtl">{{ stop.mark }}</span>
                      }
                      <span class="stop-text">
                        <span class="stop-title">{{ titleOf(stop) }}</span>
                        <span class="stop-meta">{{ t().minutes(stop.minutes[language.lang()]) }}</span>
                      </span>
                      @if (read) {
                        <svg viewBox="0 0 24 24" class="tick" role="img" [attr.aria-label]="language.pick(text.finished)">
                          <path d="m5 12.5 4.5 4.5L19 7.5" />
                        </svg>
                      } @else if (isNext) {
                        <span class="go">
                          {{ language.pick(journey.done() ? text.goOn : text.go) }}
                          <svg viewBox="0 0 24 24" aria-hidden="true" class="arrow"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                        </span>
                      }
                    </a>
                  </li>
                }
              </ol>
            </div>
          } @else {
            <a class="card" [routerLink]="entry(stage).link" [queryParams]="entry(stage).query">
              <ng-container *ngTemplateOutlet="head; context: { $implicit: stage, state }" />
              <span class="foot">
                @if (stage.stops[0]?.art) {
                  <span class="peek" aria-hidden="true">
                    @for (stop of stage.stops; track stop.slug) {
                      <span class="peek-stop"><img [src]="artSmallSrc(stop.art!)" alt="" width="640" height="400" loading="lazy" decoding="async" /></span>
                    }
                  </span>
                } @else if (stage.stops.length) {
                  <span class="names" [class.quran]="stage.stops[0].kind === 'name'" lang="ar" dir="rtl">{{ namesOf(stage) }}</span>
                }
                <span class="meta">{{ metaOf(stage) }}</span>
              </span>
            </a>
          }
        </li>
      }
    </ol>

    <ng-template #head let-stage let-state="state">
      <span class="top">
        <span class="kicker">{{ language.pick(stage.kicker) }}</span>
        @switch (state) {
          @case ('done') {
            <span class="state">{{ language.pick(text.finished) }}</span>
          }
          @case ('here') {
            <span class="state here">{{ language.pick(journey.done() ? text.here : text.startHere) }}</span>
          }
          @case ('soon') {
            <span class="state soon">{{ language.pick(text.soon) }}</span>
          }
        }
      </span>
      <h3>{{ language.pick(stage.title) }}</h3>
      <span class="line">{{ language.pick(stage.line) }}</span>
    </ng-template>
  `,
  styleUrl: './journey-map.scss',
})
export class JourneyMap {
  protected readonly journey = inject(JourneyService);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  protected readonly text = JOURNEY_TEXT;
  protected readonly onMap = ON_MAP;
  protected readonly artSmallSrc = artSmallSrc;
  private readonly ready = mounted();

  /** The stage the reader is in: the first one, until the app knows what they have read. */
  private readonly current = computed(() => (this.ready() ? this.journey.current() : 1));

  /** The next stop to read in the stage the reader is in. */
  protected readonly nextHere = computed(() => (this.ready() ? this.journey.next() : this.journey.stops()[0]));

  protected stateOf(stage: Stage): 'done' | 'here' | 'ahead' | 'soon' {
    if (stage.status === 'soon') return 'soon';
    if (stage.status === 'page') return 'ahead';
    if (this.ready() && stage.stops.length && stage.stops.every((stop) => this.journey.isRead(stop))) return 'done';
    return stage.n === this.current() ? 'here' : 'ahead';
  }

  protected isRead(stop: Stop): boolean {
    return this.ready() && this.journey.isRead(stop);
  }

  /** Where a stage's card leads: its first stop not yet read, or «ماذا بعد؟» for the last. */
  protected entry(stage: Stage): { link: string[]; query: typeof ON_MAP | null } {
    if (stage.status === 'page') return { link: ['/next'], query: null };
    const stop = stage.stops.find((s) => !this.isRead(s)) ?? stage.stops[0];
    return { link: stop.link, query: ON_MAP };
  }

  /** «٦ محطات، ٢١ دقيقة», or «صفحة واحدة». */
  protected metaOf(stage: Stage): string {
    if (stage.status === 'page') return this.language.pick(this.text.onePage);
    const lang = this.language.lang();
    const count = stopsCount(lang, stage.stops.length, this.language.number(stage.stops.length));
    return `${count}${sep(lang)}${this.t().minutes(stage.minutes[lang])}`;
  }

  protected namesOf(stage: Stage): string {
    return stage.stops.map((stop) => stop.mark).join(' · ');
  }

  protected titleOf(stop: Stop): string {
    return titleOf(this.language, stop);
  }
}
