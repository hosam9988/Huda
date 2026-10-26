import { httpResource } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
import { DivineName, NamesData } from '../models/divine-name';

/** Reads the Beautiful Names — one static JSON file served from `public/data`. */
@Injectable({ providedIn: 'root' })
export class NamesService {
  private readonly resource = httpResource<NamesData>(() => 'data/names.json');

  // value() throws while a resource is in an error state, so guard with hasValue().
  readonly names = computed<DivineName[]>(() => (this.resource.hasValue() ? this.resource.value().names : []));
  readonly isLoading = this.resource.isLoading;
  readonly error = this.resource.error;

  /** The names whose page is written, in order. */
  readonly written = computed(() => this.names().filter((n) => n.content));

  /** Changes on each calendar day, so every visitor sees the same name that day. */
  readonly nameOfTheDay = computed(() => {
    const written = this.written();
    if (!written.length) return undefined;
    return written[Math.floor(Date.now() / 86_400_000) % written.length];
  });

  name(slug: string): DivineName | undefined {
    return this.names().find((n) => n.slug === slug);
  }

  /** The written names before and after this one. */
  neighbours(slug: string): { prev?: DivineName; next?: DivineName } {
    const written = this.written();
    const i = written.findIndex((n) => n.slug === slug);
    if (i === -1) return {};
    return { prev: written[i - 1], next: written[i + 1] };
  }
}
