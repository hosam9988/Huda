import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { LanguageService } from '../core/services/language.service';
import { ThemeService } from '../core/services/theme.service';
import { Theme, THEMES } from '../core/models/theme';

/** Palette button in the header that opens a small menu of colour themes. */
@Component({
  selector: 'app-theme-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close(true)',
  },
  template: `
    <button
      #trigger
      type="button"
      class="trigger"
      [attr.aria-label]="t().themeLabel"
      [attr.title]="t().themeLabel"
      aria-haspopup="true"
      [attr.aria-expanded]="open()"
      (click)="open.set(!open())"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3a9 9 0 1 0 0 18c1.1 0 1.7-.9 1.4-1.9-.3-.9-.1-1.9.9-2.2.6-.2 1.3-.2 2-.2A4.7 4.7 0 0 0 21 12 9 9 0 0 0 12 3Z"
        />
        <circle cx="7.5" cy="11" r="1.3" />
        <circle cx="10.5" cy="7" r="1.3" />
        <circle cx="15" cy="7.5" r="1.3" />
      </svg>
    </button>

    @if (open()) {
      <div class="menu" role="radiogroup" [attr.aria-label]="t().themeLabel">
        <p class="title">{{ t().themeLabel }}</p>
        @for (option of themes; track option.id) {
          <button
            type="button"
            role="radio"
            class="option"
            [attr.aria-checked]="theme.theme() === option.id"
            (click)="choose(option.id)"
          >
            <span class="swatch" [style.background]="option.background"></span>
            <span class="label">{{ t().themeNames[option.id] }}</span>
            @if (theme.theme() === option.id) {
              <svg class="check" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            }
          </button>
        }
      </div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: inline-flex;
    }

    .trigger {
      display: grid;
      place-items: center;
      inline-size: 2.75rem;
      block-size: 2.75rem;
      padding: 0;
      border: 1px solid var(--line-strong);
      border-radius: 50%;
      background: transparent;
      color: var(--gold);
      cursor: pointer;
      touch-action: manipulation;
      transition: background-color 0.25s var(--ease), border-color 0.25s var(--ease);

      &:hover,
      &[aria-expanded='true'] {
        border-color: var(--gold);
        background: rgb(var(--accent-rgb) / 10%);
      }

      svg {
        inline-size: 1.3rem;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.6;
        stroke-linejoin: round;
      }

      circle {
        fill: currentColor;
        stroke: none;
      }
    }

    .menu {
      position: absolute;
      inset-block-start: calc(100% + 0.5rem);
      inset-inline-end: 0;
      z-index: 20;
      min-inline-size: 11rem;
      padding: 0.4rem;
      background: var(--surface-raised);
      border: 1px solid var(--line-strong);
      border-radius: var(--radius);
      box-shadow: 0 16px 40px -12px rgb(0 0 0 / 45%);
      animation: pop 0.18s var(--ease);
    }

    @keyframes pop {
      from {
        opacity: 0;
        translate: 0 -4px;
      }
    }

    .title {
      margin: 0.2rem 0.6rem 0.3rem;
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .option {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      inline-size: 100%;
      min-block-size: 2.75rem;
      padding: 0.35rem 0.6rem;
      border: 0;
      border-radius: calc(var(--radius) - 6px);
      background: transparent;
      color: var(--text);
      font: inherit;
      font-size: 0.98rem;
      text-align: start;
      cursor: pointer;

      &:hover,
      &:focus-visible {
        background: rgb(var(--accent-rgb) / 10%);
      }

      &[aria-checked='true'] {
        color: var(--gold-light);
      }
    }

    .swatch {
      flex-shrink: 0;
      inline-size: 1.5rem;
      block-size: 1.5rem;
      border-radius: 50%;
      // A thin gold ring shows the accent every theme keeps, and outlines the light swatches.
      box-shadow:
        inset 0 0 0 1px rgb(0 0 0 / 15%),
        0 0 0 2px var(--gold);
    }

    .label {
      flex: 1;
    }

    .check {
      inline-size: 1.1rem;
      fill: none;
      stroke: var(--gold);
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class ThemePicker {
  protected readonly theme = inject(ThemeService);
  protected readonly t = inject(LanguageService).t;
  protected readonly themes = THEMES;
  protected readonly open = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected choose(id: Theme): void {
    this.theme.theme.set(id);
    this.close(true);
  }

  protected close(restoreFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    if (restoreFocus) this.trigger().nativeElement.focus();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }
}
