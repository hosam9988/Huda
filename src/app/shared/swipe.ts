import { afterNextRender, Directive, ElementRef, inject, output, signal } from '@angular/core';

/**
 * A sideways drag: how far it has gone (CSS pixels, rightwards positive), how wide the element is,
 * and which way it leads in reading order (1 to the next page, -1 to the one before).
 */
export interface SwipeDrag {
  x: number;
  width: number;
  step: 1 | -1;
}

/** How far a finger may wander before a press becomes a drag, in CSS pixels. */
const SLOP = 10;

/**
 * Lets the reader swipe through an element whose pages take turns: a finger, a pen or a mouse
 * dragging it sideways, or a trackpad's two-finger swipe. `drag` follows the move, so the page can
 * go with it, and `swiped` fires when it is let go far or fast enough. In Arabic the next page comes
 * from the left, so a swipe to the right brings it. Up-and-down moves stay the browser's: give the
 * element `touch-action: pan-y` and the page scrolls as usual. A drag that ends on a link doesn't
 * open it; a tap still does.
 */
@Directive({
  selector: '[appSwipe]',
  exportAs: 'appSwipe',
  host: {
    '(pointerdown)': 'down($event)',
    '(pointermove)': 'move($event)',
    '(pointerup)': 'up($event)',
    '(pointercancel)': 'drop()',
    '(dragstart)': '$event.preventDefault()',
    '(wheel)': 'wheel($event)',
  },
})
export class Swipe {
  /** The drag under way, or null. */
  readonly drag = signal<SwipeDrag | null>(null);
  /** A drag let go far or fast enough: the page it leads to should show. */
  readonly swiped = output<SwipeDrag>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private press: {
    id: number;
    x: number;
    y: number;
    time: number;
    width: number;
    rtl: boolean;
  } | null = null;
  /** Until this moment a click ends a drag rather than a tap, so it must not follow the link. */
  private noClickUntil = 0;
  // A trackpad swipe sends a stream of wheel events, and goes on sending them (its momentum) after
  // it has turned the page: one swipe turns one page, and the next needs a pause before it.
  private wheelSum = 0;
  private wheelLast = -Infinity;
  private wheelSpent = false;

  constructor() {
    // The capture phase, before the link under the pointer sees the click.
    afterNextRender(() => {
      this.element.addEventListener(
        'click',
        (event) => {
          if (performance.now() > this.noClickUntil) return;
          event.preventDefault();
          event.stopPropagation();
        },
        { capture: true },
      );
    });
  }

  protected down(event: PointerEvent): void {
    if (!event.isPrimary || event.button !== 0) return;
    this.noClickUntil = 0;
    this.press = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
      width: this.element.clientWidth || 1,
      rtl: getComputedStyle(this.element).direction === 'rtl',
    };
  }

  protected move(event: PointerEvent): void {
    const press = this.press;
    if (!press || event.pointerId !== press.id) return;
    const x = event.clientX - press.x;
    const y = event.clientY - press.y;
    if (!this.drag()) {
      if (Math.max(Math.abs(x), Math.abs(y)) < SLOP) return;
      // Up or down: the reader is scrolling the page, not turning it.
      if (Math.abs(x) <= Math.abs(y)) {
        this.press = null;
        return;
      }
      // Keep the moves coming when the pointer leaves the element mid-drag.
      this.element.setPointerCapture(event.pointerId);
    }
    this.drag.set({ x, width: press.width, step: this.step(x, press.rtl) });
  }

  protected up(event: PointerEvent): void {
    const press = this.press;
    const drag = this.drag();
    this.drop();
    if (!press || !drag || event.pointerId !== press.id) return;
    this.noClickUntil = performance.now() + 400;
    const distance = Math.abs(drag.x);
    const speed = distance / Math.max(1, event.timeStamp - press.time);
    if (distance >= Math.min(96, drag.width / 4) || (distance >= 32 && speed >= 0.45)) {
      this.swiped.emit(drag);
    }
  }

  protected drop(): void {
    this.press = null;
    this.drag.set(null);
  }

  protected wheel(event: WheelEvent): void {
    // Mostly up or down: the page scrolls.
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    // Sideways over the element is a swipe here, not the browser's Back or Forward.
    event.preventDefault();
    if (event.timeStamp - this.wheelLast > 250) {
      this.wheelSum = 0;
      this.wheelSpent = false;
    }
    this.wheelLast = event.timeStamp;
    if (this.wheelSpent) return;
    this.wheelSum +=
      event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaX * 16 : event.deltaX;
    if (Math.abs(this.wheelSum) < 60) return;
    this.wheelSpent = true;
    // Scrolling rightwards moves the content left, like a drag to the left.
    const x = -this.wheelSum;
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    this.swiped.emit({ x, width: this.element.clientWidth || 1, step: this.step(x, rtl) });
  }

  /** A drag to the left leads to the next page, unless the pages run right to left. */
  private step(x: number, rtl: boolean): 1 | -1 {
    return x < 0 !== rtl ? 1 : -1;
  }
}
