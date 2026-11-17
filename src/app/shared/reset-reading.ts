import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../core/services/language.service';
import { ReadingService } from '../core/services/reading.service';

/**
 * «امسح سجل القراءة»: forgets every read mark and where the reader stopped, after asking once, so
 * the journey and the lists start afresh. It shows only when there is something to forget, and only
 * once the app has taken over the page: what a reader has read lives in their browser, which the
 * prerendered page knows nothing of. Its lines follow the text alignment of the place it is put in.
 */
@Component({
  selector: 'app-reset-reading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (has()) {
      @if (confirming()) {
        <p class="ask">{{ t().resetAllConfirm }}</p>
        <span class="actions">
          <button type="button" class="btn quiet" (click)="reset()">{{ t().resetAllYes }}</button>
          <button type="button" class="btn quiet" (click)="confirming.set(false)">{{ t().cancel }}</button>
        </span>
      } @else {
        <button type="button" class="btn quiet" (click)="confirming.set(true)">{{ t().resetAll }}</button>
      }
    }
    <p class="ask said" role="status">{{ cleared() ? t().resetAllDone : '' }}</p>
  `,
  styles: `
    :host {
      display: block;
    }
    .ask {
      margin: 0 0 0.4rem;
      color: var(--text-muted);
    }
    /* The line that says it is done is always there, for screen readers to hear it fill; empty, it takes no room. */
    .said:empty {
      display: none;
    }
    .said {
      margin: 0;
    }
    .actions {
      display: inline-flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
    }
  `,
})
export class ResetReading {
  private readonly reading = inject(ReadingService);
  protected readonly t = inject(LanguageService).t;
  protected readonly confirming = signal(false);
  private readonly ready = signal(false);
  private readonly done = signal(false);

  protected readonly has = computed(() => this.ready() && this.reading.hasHistory());
  /** Said after clearing, until the reader reads something again. */
  protected readonly cleared = computed(() => this.done() && !this.reading.hasHistory());

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }

  protected reset(): void {
    this.reading.resetAll();
    this.confirming.set(false);
    this.done.set(true);
  }
}
