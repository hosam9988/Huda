import { ChangeDetectionStrategy, Component, effect, inject, input, OnDestroy, signal, untracked } from '@angular/core';
import { LanguageService } from '../core/services/language.service';
import { SpeechSegment, SpeechService } from '../core/services/speech.service';

/** Listen / pause / stop controls that read the given segments aloud in the current language. */
@Component({
  selector: 'app-read-aloud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (speech.supported) {
      <div class="controls">
        @if (speech.state() === 'idle') {
          <button type="button" class="btn" (click)="play()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
            {{ t().listen }}
          </button>
        } @else {
          @if (speech.state() === 'playing') {
            <button type="button" class="btn" (click)="speech.pause()">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zM13 5h3v14h-3z" /></svg>
              {{ t().pause }}
            </button>
          } @else {
            <button type="button" class="btn" (click)="speech.resume()">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
              {{ t().resume }}
            </button>
          }
          <button type="button" class="btn" (click)="speech.stop()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v10H7z" /></svg>
            {{ t().stop }}
          </button>
        }
      </div>
      @if (missingVoice()) {
        <p class="hint" role="status">{{ t().noVoice }}</p>
      } @else {
        <p class="hint">{{ t().versesSkipped }}</p>
      }
    }
  `,
  styles: `
    :host {
      display: block;
      text-align: center;
    }
    .controls {
      display: flex;
      justify-content: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }
    svg {
      inline-size: 1.05rem;
      fill: currentColor;
    }
    .hint {
      margin: 0.5rem 0 0;
      color: var(--text-muted);
      font-size: 0.82rem;
    }
  `,
})
export class ReadAloud implements OnDestroy {
  /** What to read, in order (read when Listen is pressed). */
  readonly segments = input.required<SpeechSegment[]>();
  /** Identifies the content (e.g. the name's slug): when it changes, the current reading stops. */
  readonly resetKey = input.required<string>();

  protected readonly speech = inject(SpeechService);
  private readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  protected readonly missingVoice = signal(false);

  constructor() {
    // Stop when the page switches to another name or the language changes (but not when the
    // segments are merely refined, e.g. the vowelled text finishes loading mid-reading).
    effect(() => {
      this.resetKey();
      this.language.lang();
      untracked(() => {
        this.speech.stop();
        this.missingVoice.set(false);
      });
    });
  }

  protected play(): void {
    const lang = this.language.lang();
    if (!this.speech.hasVoice(lang)) {
      this.missingVoice.set(true);
      return;
    }
    this.missingVoice.set(false);
    this.speech.speak(this.segments(), lang);
  }

  ngOnDestroy(): void {
    this.speech.stop();
  }
}
