import { ChangeDetectionStrategy, Component } from '@angular/core';

/** A thin gold rule with a small star at its centre, used to divide sections. */
@Component({
  selector: 'app-ornament',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="line"></span>
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 2 L25 15 L38 20 L25 25 L20 38 L15 25 L2 20 L15 15 Z" />
      <circle cx="20" cy="20" r="3.5" />
    </svg>
    <span class="line"></span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      inline-size: min(22rem, 100%);
      margin-inline: auto;
    }
    .line {
      flex: 1;
      block-size: 1px;
      background: linear-gradient(90deg, transparent, var(--gold) 60%, var(--gold-light));
    }
    .line:last-child {
      transform: scaleX(-1);
    }
    svg {
      inline-size: 1.4rem;
      fill: none;
      stroke: var(--gold);
      stroke-width: 1.6;
    }
    circle {
      fill: var(--gold);
      stroke: none;
    }
  `,
})
export class Ornament {}
