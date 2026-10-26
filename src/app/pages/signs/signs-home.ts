import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CategoryId } from '../../core/models/ayah';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { ReadingService } from '../../core/services/reading.service';
import { artSmallSrc, artSrc, artSrcset } from '../../core/utils/art';
import { readingMinutes } from '../../core/utils/reading-time';
import { matchesQuery } from '../../core/utils/search';
import { AyahCard } from '../../shared/ayah-card';
import { Ornament } from '../../shared/ornament';
import { ProgressRing } from '../../shared/progress-ring';
import { Reveal } from '../../shared/reveal';

/** The front page of the I'jaz section, «سنريهم آياتنا»: the journey, the fields and every sign. */
@Component({
  selector: 'app-signs-home',
  imports: [RouterLink, AyahCard, Ornament, ProgressRing, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signs-home.html',
  styleUrl: './signs-home.scss',
})
export class SignsHome {
  protected readonly content = inject(ContentService);
  protected readonly reading = inject(ReadingService);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  private readonly document = inject(DOCUMENT);

  protected readonly artSrc = artSrc;
  protected readonly artSmallSrc = artSmallSrc;
  protected readonly artSrcset = artSrcset;
  protected readonly query = signal('');
  protected readonly filter = signal<CategoryId | null>(null);
  protected readonly confirmingReset = signal(false);

  protected readonly filtered = computed(() => {
    const filter = this.filter();
    const query = this.query();
    return this.content
      .ordered()
      .filter((a) => (!filter || a.category === filter) && matchesQuery(a, query));
  });

  protected readonly stats = computed(() => ({
    signs: this.content.ayat().length,
    fields: this.content.categories().length,
    sources: new Set(this.content.ayat().flatMap((a) => a.sources.map((s) => s.url))).size,
  }));

  protected readonly journeyMinutes = computed(() =>
    this.content.journey().reduce((sum, a) => sum + readingMinutes(a, this.language.lang()), 0),
  );

  /** The sign where the reader stopped, unless they had already finished it. */
  protected readonly continueAt = computed(() => {
    const place = this.reading.place();
    if (!place || this.reading.isRead(place.slug)) return undefined;
    return this.content.ayah(place.slug);
  });

  protected readonly readCount = computed(() => this.reading.countRead(this.content.ayat().map((a) => a.slug)));

  protected readonly progress = computed(() => {
    const total = this.content.ayat().length;
    return total ? this.readCount() / total : 0;
  });

  constructor() {
    const title = inject(Title);
    effect(() =>
      title.setTitle(
        this.language.isArabic()
          ? `سنريهم آياتنا | ${this.t().appTitle}`
          : `We Will Show Them Our Signs | ${this.t().appTitle}`,
      ),
    );
  }

  protected countIn(id: CategoryId): number {
    return this.content.inCategory(id).length;
  }

  protected readIn(id: CategoryId): number {
    return this.reading.countRead(this.content.inCategory(id).map((a) => a.slug));
  }

  /** From a field's card: show only its signs, and scroll down to them. */
  protected showCategory(id: CategoryId): void {
    this.filter.set(id);
    this.query.set('');
    this.document.getElementById('all')?.scrollIntoView({ block: 'start' });
  }

  protected reset(): void {
    this.reading.resetAll();
    this.confirmingReset.set(false);
  }
}
