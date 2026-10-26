import { effect, Injectable, signal } from '@angular/core';
import { readStorage, removeStorage, writeStorage } from './storage';

const READ_KEY = 'ayat.read.v1';
const PLACE_KEY = 'ayat.place.v1';
const SCALE_KEY = 'ayat.textScale';

/** Where the reader stopped: a sign and how far down its page (0–1). */
export interface Place {
  slug: string;
  progress: number;
}

export const TEXT_SCALES = [0.9, 1, 1.12, 1.25, 1.4] as const;

/** The reader's progress through the signs, kept in this browser. */
@Injectable({ providedIn: 'root' })
export class ReadingService {
  private readonly read = signal<ReadonlySet<string>>(new Set(parse<string[]>(READ_KEY) ?? []));
  readonly place = signal<Place | null>(parse<Place>(PLACE_KEY));
  readonly textScale = signal<number>(Number(readStorage(SCALE_KEY)) || 1);

  constructor() {
    effect(() => writeStorage(READ_KEY, JSON.stringify([...this.read()])));
    effect(() => {
      const place = this.place();
      if (place) writeStorage(PLACE_KEY, JSON.stringify(place));
      else removeStorage(PLACE_KEY);
    });
    effect(() => writeStorage(SCALE_KEY, String(this.textScale())));
  }

  isRead(slug: string): boolean {
    return this.read().has(slug);
  }

  /** How many of these slugs have been read (reactive). */
  countRead(slugs: readonly string[]): number {
    const read = this.read();
    return slugs.filter((s) => read.has(s)).length;
  }

  setRead(slug: string, read: boolean): void {
    this.read.update((set) => {
      const next = new Set(set);
      if (read) next.add(slug);
      else next.delete(slug);
      return next;
    });
  }

  /** Starts over: forgets every read mark, and where the reader stopped. */
  resetAll(): void {
    this.read.set(new Set());
    this.place.set(null);
  }

  /** Bigger or smaller text, one step at a time. */
  stepScale(direction: 1 | -1): void {
    const i = TEXT_SCALES.indexOf(this.textScale() as (typeof TEXT_SCALES)[number]);
    const next = TEXT_SCALES[Math.min(TEXT_SCALES.length - 1, Math.max(0, (i === -1 ? 1 : i) + direction))];
    this.textScale.set(next);
  }
}

function parse<T>(key: string): T | null {
  try {
    return JSON.parse(readStorage(key) ?? 'null') as T | null;
  } catch {
    return null;
  }
}
