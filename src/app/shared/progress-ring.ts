import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** A gold ring that fills as the reader finishes signs, with the count in the middle. */
@Component({
  selector: 'app-progress-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle class="track" cx="60" cy="60" r="52" />
      <circle
        class="fill"
        cx="60"
        cy="60"
        r="52"
        [attr.stroke-dasharray]="circumference"
        [attr.stroke-dashoffset]="offset()"
      />
    </svg>
    <span class="label"><ng-content /></span>
  `,
  styles: `
    :host {
      position: relative;
      display: inline-grid;
      place-items: center;
      inline-size: var(--size, 7.5rem);
      aspect-ratio: 1;
    }
    svg {
      position: absolute;
      inset: 0;
      rotate: -90deg;
    }
    circle {
      fill: none;
      stroke-width: 7;
    }
    .track {
      stroke: rgb(var(--accent-rgb) / 15%);
    }
    .fill {
      stroke: var(--gold);
      stroke-linecap: round;
      transition: stroke-dashoffset 0.9s var(--ease);
    }
    // Mirror the ring in right-to-left pages, so it fills the way the text reads.
    :host-context([dir='rtl']) svg {
      scale: -1 1;
      rotate: 90deg;
    }
    .label {
      position: relative;
      text-align: center;
      line-height: 1.2;
    }
  `,
})
export class ProgressRing {
  /** 0–1. */
  readonly value = input.required<number>();

  protected readonly circumference = 2 * Math.PI * 52;
  protected readonly offset = computed(() => this.circumference * (1 - Math.min(1, Math.max(0, this.value()))));
}
