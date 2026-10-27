import { httpResource } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
import { Ayah, Category, CategoryId, Content } from '../models/ayah';

/** Reads the signs — one static JSON file served from `public/data`. */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly resource = httpResource<Content>(() => 'data/ayat.json');

  // value() throws while a resource is in an error state, so guard with hasValue().
  private readonly content = computed(() => (this.resource.hasValue() ? this.resource.value() : undefined));
  readonly categories = computed<Category[]>(() => this.content()?.categories ?? []);
  readonly ayat = computed<Ayah[]>(() => this.content()?.ayat ?? []);
  readonly isLoading = this.resource.isLoading;
  readonly error = this.resource.error;

  /** The "Start here" journey for readers new to Islam, in order. */
  readonly journey = computed(() =>
    this.ayat()
      .filter((a) => a.journey !== undefined)
      .sort((a, b) => a.journey! - b.journey!),
  );

  /** Changes on each calendar day, so every visitor sees the same sign that day. */
  readonly ayahOfTheDay = computed(() => {
    const ayat = this.ayat();
    if (!ayat.length) return undefined;
    return ayat[Math.floor(Date.now() / 86_400_000) % ayat.length];
  });

  ayah(slug: string): Ayah | undefined {
    return this.ayat().find((a) => a.slug === slug);
  }

  category(id: CategoryId): Category | undefined {
    return this.categories().find((c) => c.id === id);
  }

  inCategory(id: CategoryId): Ayah[] {
    return this.ayat().filter((a) => a.category === id);
  }

  /** The signs in reading order: the miracles, then the signs for reflection, each by field in the fields' order. */
  readonly ordered = computed(() => {
    const signs = this.categories().flatMap((c) => this.inCategory(c.id));
    return [...signs.filter((a) => a.type !== 'reflection'), ...signs.filter((a) => a.type === 'reflection')];
  });

  neighbours(slug: string): { prev?: Ayah; next?: Ayah } {
    const ayat = this.ordered();
    const i = ayat.findIndex((a) => a.slug === slug);
    if (i === -1) return {};
    return { prev: ayat[i - 1], next: ayat[i + 1] };
  }
}
