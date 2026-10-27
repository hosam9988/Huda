import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ayah } from '../core/models/ayah';
import { ContentService } from '../core/services/content.service';
import { LanguageService } from '../core/services/language.service';
import { ReadingService } from '../core/services/reading.service';
import { artSmallSrc, artSrcset } from '../core/utils/art';
import { readingMinutes } from '../core/utils/reading-time';

/** A sign on the home page: its picture, field, title and summary, linking to its page. */
@Component({
  selector: 'app-ayah-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      class="card"
      [routerLink]="['/signs', ayah().slug]"
      [queryParams]="fromJourney() ? { path: 'journey' } : undefined"
    >
      <div class="art">
        <img
          [src]="artSmallSrc(ayah().art)"
          [attr.srcset]="artSrcset(ayah().art)"
          sizes="(max-width: 640px) 100vw, 420px"
          alt=""
          loading="lazy"
          decoding="async"
          width="640"
          height="400"
        />
        @if (step(); as step) {
          <span class="step">{{ language.number(step) }}</span>
        }
        @if (isRead()) {
          <span class="read" [attr.title]="t().isRead">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
            <span class="visually-hidden">{{ t().isRead }}</span>
          </span>
        }
      </div>
      <div class="body">
        <div class="meta">
          <span class="chips">
            @if (category(); as category) {
              <span class="chip">{{ language.pick(category.title) }}</span>
            }
            @if (ayah().type === 'reflection') {
              <span class="chip reflection" [attr.title]="t().reflectionHint">{{ t().reflectionBadge }}</span>
            }
          </span>
          <span class="time">{{ t().minutes(minutes()) }}</span>
        </div>
        <h3>{{ language.pick(ayah().title) }}</h3>
        <p>{{ language.pick(ayah().summary) }}</p>
      </div>
    </a>
  `,
  styles: `
    :host {
      display: block;
    }

    .card {
      display: flex;
      flex-direction: column;
      block-size: 100%;
      overflow: hidden;
      color: inherit;
      background: linear-gradient(180deg, var(--surface-raised), var(--surface));
      border: 1px solid var(--line);
      border-radius: var(--radius);
      transition:
        transform 0.35s var(--ease),
        border-color 0.35s var(--ease),
        box-shadow 0.35s var(--ease);

      &:hover {
        transform: translateY(-4px);
        border-color: var(--line-strong);
        box-shadow: var(--shadow);

        img {
          scale: 1.05;
        }
      }
    }

    .art {
      position: relative;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      background: #0a0f24;

      img {
        display: block;
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
        transition: scale 0.6s var(--ease);
      }
    }

    .step,
    .read {
      position: absolute;
      inset-block-start: 0.75rem;
      display: grid;
      place-items: center;
      inline-size: 2.1rem;
      block-size: 2.1rem;
      border-radius: 50%;
      font-weight: 700;
      line-height: 1;
    }

    .step {
      inset-inline-start: 0.75rem;
      background: var(--gold-gradient);
      color: var(--on-accent);
    }

    .read {
      inset-inline-end: 0.75rem;
      background: rgb(var(--science-rgb) / 90%);

      svg {
        inline-size: 1.15rem;
        fill: none;
        stroke: #06221f;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      padding: 1.1rem 1.25rem 1.35rem;
    }

    .meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .reflection {
      border-color: var(--line-strong);
      color: var(--text-muted);
    }

    .time {
      color: var(--text-muted);
      font-size: 0.82rem;
      white-space: nowrap;
    }

    h3 {
      margin: 0.2rem 0 0;
      color: var(--gold-light);
      font-size: 1.3rem;
    }

    p {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.98rem;
      line-height: 1.75;
    }
  `,
})
export class AyahCard {
  readonly ayah = input.required<Ayah>();
  /** Shows its number on the journey, and keeps the journey's order on its page. */
  readonly fromJourney = input(false);

  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  private readonly content = inject(ContentService);
  private readonly reading = inject(ReadingService);

  protected readonly artSmallSrc = artSmallSrc;
  protected readonly artSrcset = artSrcset;
  protected readonly category = computed(() => this.content.category(this.ayah().category));
  protected readonly isRead = computed(() => this.reading.countRead([this.ayah().slug]) > 0);
  protected readonly step = computed(() => (this.fromJourney() ? this.ayah().journey : undefined));
  protected readonly minutes = computed(() => readingMinutes(this.ayah(), this.language.lang()));
}
