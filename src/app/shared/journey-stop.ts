import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JOURNEY_TEXT, JourneyService, sep, Stop, stopOf } from '../core/journey';
import { LanguageService } from '../core/services/language.service';
import { artSmallSrc } from '../core/utils/art';

/** The query that marks a page as reached from the journey's map, so it leads on along it. */
export const ON_MAP = { path: 'map' } as const;

/**
 * At the top of a stop: the way back to the map, where the stop stands («المرحلة ٣ · المحطة ١ من
 * ٦»), and a bar with one step for each stop of its stage.
 */
@Component({
  selector: 'app-journey-place',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="place">
      <a routerLink="/" fragment="map">
        <svg viewBox="0 0 24 24" aria-hidden="true" class="arrow back"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        {{ language.pick(text.seeMap) }}
      </a>
      <span class="chip where">{{ where() }}</span>
    </p>
    <span class="steps" aria-hidden="true">
      @for (step of steps(); track $index) {
        <span [class.on]="step"></span>
      }
    </span>
  `,
  styles: `
    :host {
      display: block;
    }
    .place {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 0.9rem;

      a {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        min-block-size: 2.25rem;
        margin-inline-end: 0.25rem;
        color: var(--gold-light);
        font-family: var(--font-display-en);
        font-weight: 500;
      }

      .arrow {
        inline-size: 1em;
        block-size: 1em;
      }
    }
    :host-context([lang='ar']) .place a {
      font-family: var(--font-display-ar);
    }
    .where {
      border-color: rgb(240 214 142 / 50%);
      background: rgb(240 214 142 / 10%);
      color: var(--gold-light);
    }
    /* Over a centred title (a name's page). */
    :host(.centered) .place {
      justify-content: center;
    }
    :host(.centered) .steps {
      margin-inline: auto;
    }
    .steps {
      display: flex;
      gap: 4px;
      max-inline-size: 15rem;
      margin-block: 0.7rem 0.2rem;

      span {
        flex: 1;
        block-size: 4px;
        border-radius: 999px;
        background: rgb(240 214 142 / 26%);
      }

      .on {
        background: var(--gold-light);
      }
    }
  `,
})
export class JourneyPlace {
  readonly stop = input.required<Stop>();

  protected readonly language = inject(LanguageService);
  private readonly journey = inject(JourneyService);
  protected readonly text = JOURNEY_TEXT;

  protected readonly where = computed(() => {
    const stop = this.stop();
    const total = this.journey.stage(stop.stage)?.stops.length ?? 0;
    const n = (value: number) => this.language.number(value);
    return stopOf(this.language.lang(), n(stop.stage), n(stop.inStage + 1), n(total));
  });

  /** One step per stop of the stage: lit up to this one. */
  protected readonly steps = computed(() => {
    const stop = this.stop();
    const total = this.journey.stage(stop.stage)?.stops.length ?? 0;
    return Array.from({ length: total }, (_, i) => i <= stop.inStage);
  });
}

/**
 * At the end of a stop: what it showed, in a line, then the next stop (in this stage or the next),
 * or, after the last stop written so far, «ماذا بعد؟».
 */
@Component({
  selector: 'app-journey-onward',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="carry">
      <p class="eyebrow">{{ language.pick(text.summaryTitle) }}</p>
      <p>{{ language.pick(stop().summary) }}</p>
    </aside>

    @if (next(); as next) {
      <a class="next-card" [class.no-art]="!next.art" [routerLink]="next.link" [queryParams]="onMap">
        @if (next.art) {
          <span class="next-art">
            <img [src]="artSmallSrc(next.art)" alt="" width="640" height="400" loading="lazy" decoding="async" />
          </span>
        }
        <span class="next-text">
          <span class="eyebrow">{{ label() }}</span>
          @if (next.arabic) {
            <span class="next-name quran gold-text" lang="ar" dir="rtl">{{ next.arabic }}</span>
          }
          @if (!next.arabic || !language.isArabic()) {
            <span class="next-title">{{ titleOf(next) }}</span>
          }
          <span class="next-hook">{{ language.pick(next.summary) }}</span>
          <span class="next-go">
            {{ language.pick(text.readOn) }}
            <svg viewBox="0 0 24 24" aria-hidden="true" class="arrow"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </span>
      </a>
    } @else {
      <a class="next-card no-art end" routerLink="/next">
        <span class="next-text">
          <span class="eyebrow">{{ language.pick(text.lastTitle) }}</span>
          <span class="next-title">{{ t().nextSteps }}</span>
          <span class="next-hook">{{ language.pick(text.lastLine) }}</span>
          <span class="next-go">
            {{ t().nextSteps }}
            <svg viewBox="0 0 24 24" aria-hidden="true" class="arrow"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </span>
      </a>
    }

    <p class="links">
      @if (previous(); as prev) {
        <a [routerLink]="prev.link" [queryParams]="onMap">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="arrow back"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          {{ t().previous }}: {{ titleOf(prev) }}
        </a>
      }
      <a routerLink="/" fragment="map">{{ language.pick(text.seeMap) }}</a>
    </p>
  `,
  styles: `
    :host {
      display: block;
      margin-block-start: 2.5rem;
      font-size: 1rem;
    }
    .carry {
      margin-block-end: 1.5rem;
      padding: 1.1rem 1.25rem 1.2rem;
      border: 1px solid var(--line-strong);
      border-radius: var(--radius);
      background: rgb(var(--accent-rgb) / 6%);

      .eyebrow {
        margin: 0 0 0.3rem;
      }

      p:last-child {
        margin: 0;
      }
    }
    .next-card {
      display: grid;
      grid-template-columns: minmax(0, 38%) minmax(0, 1fr);
      overflow: hidden;
      border: 1px solid var(--line-strong);
      border-radius: var(--radius-lg);
      background:
        radial-gradient(ellipse 70% 90% at 50% 0%, rgb(var(--accent-rgb) / 8%), transparent 70%),
        linear-gradient(180deg, var(--surface-raised), var(--surface));
      color: inherit;
      transition:
        transform 0.3s var(--ease),
        box-shadow 0.3s var(--ease),
        border-color 0.3s;

      &:hover {
        transform: translateY(-3px);
        border-color: var(--gold);
        box-shadow: var(--shadow);
      }

      &.no-art {
        grid-template-columns: minmax(0, 1fr);
      }

      &.end {
        border-color: var(--science-line);
      }
    }
    .next-art {
      position: relative;
      display: block;
      min-block-size: 100%;

      img {
        position: absolute;
        inset: 0;
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }
    }
    .next-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 0.35rem;
      padding: 1.4rem 1.6rem;
    }
    .next-name {
      font-size: 2.2rem;
      line-height: 1.6;
    }
    .next-title {
      color: var(--gold-light);
      font-family: var(--font-display-en);
      font-size: 1.35rem;
      font-weight: 600;
      line-height: 1.4;
    }
    :host-context([lang='ar']) .next-title {
      font-family: var(--font-display-ar);
      line-height: 1.7;
    }
    .next-hook {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .next-go {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      margin-block-start: 0.35rem;
      color: var(--gold-light);
      font-family: var(--font-display-en);
      font-weight: 500;

      .arrow {
        inline-size: 1.1em;
        block-size: 1.1em;
      }
    }
    :host-context([lang='ar']) .next-go {
      font-family: var(--font-display-ar);
    }
    .end .next-go {
      color: var(--science);
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.5rem 1rem;
      margin: 1.25rem 0 0;
      font-size: 0.95rem;

      a {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        min-block-size: 2.75rem;
      }

      .arrow {
        flex-shrink: 0;
        inline-size: 1em;
        block-size: 1em;
      }
    }
    @media (max-width: 560px) {
      .next-card {
        grid-template-columns: minmax(0, 1fr);
      }
      .next-art {
        aspect-ratio: 16 / 9;
      }
      .next-text {
        padding: 1.1rem 1.2rem 1.25rem;
      }
    }
  `,
})
export class JourneyOnward {
  readonly stop = input.required<Stop>();

  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  private readonly journey = inject(JourneyService);
  protected readonly text = JOURNEY_TEXT;
  protected readonly onMap = ON_MAP;
  protected readonly artSmallSrc = artSmallSrc;

  protected readonly next = computed(() => this.journey.after(this.stop()));
  protected readonly previous = computed(() => this.journey.before(this.stop()));

  /** «المحطة التالية، ٢ من ٦», or, at a stage's first stop, «المرحلة التالية، من هو؟». */
  protected readonly label = computed(() => {
    const next = this.next();
    if (!next) return '';
    const n = (value: number) => this.language.number(value);
    const stage = this.journey.stage(next.stage);
    if (next.stage !== this.stop().stage) {
      return `${this.language.pick(this.text.nextStage)}${sep(this.language.lang())}${this.language.pick(stage?.title)}`;
    }
    const total = n(stage?.stops.length ?? 0);
    return `${this.t().nextStop}${sep(this.language.lang())}${this.language.isArabic() ? `${n(next.inStage + 1)} من ${total}` : `${n(next.inStage + 1)} of ${total}`}`;
  });

  protected titleOf(stop: Stop): string {
    if (stop.arabic && this.language.isArabic()) return stop.arabic;
    return typeof stop.title === 'string' ? stop.title : this.language.pick(stop.title);
  }
}
