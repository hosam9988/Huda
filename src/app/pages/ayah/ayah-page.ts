import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Milestone } from '../../core/models/ayah';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { ReadingService } from '../../core/services/reading.service';
import { SpeechSegment, SpeechService } from '../../core/services/speech.service';
import { artSmallSrc, artSrc, artSrcset } from '../../core/utils/art';
import { readingMinutes } from '../../core/utils/reading-time';
import { Ornament } from '../../shared/ornament';
import { ReadAloud } from '../../shared/read-aloud';
import { Reveal } from '../../shared/reveal';

/** One sign, told as a short story: the text, then and now, the timeline, and the sources. */
@Component({
  selector: 'app-ayah-page',
  imports: [RouterLink, Ornament, ReadAloud, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ayah-page.html',
  styleUrl: './ayah-page.scss',
  host: { '(window:scroll)': 'onScroll()' },
})
export class AyahPage {
  /** Bound from /ayah/:slug. */
  readonly slug = input<string>('');
  /** `?path=journey`: the reader came from the "Start here" journey, so lead on along it. */
  readonly path = input<string | undefined>(undefined);
  /** `?resume=1`: scroll to where the reader stopped. */
  readonly resume = input<string | undefined>(undefined);

  protected readonly content = inject(ContentService);
  protected readonly reading = inject(ReadingService);
  protected readonly language = inject(LanguageService);
  protected readonly speech = inject(SpeechService);
  protected readonly t = this.language.t;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly article = viewChild<ElementRef<HTMLElement>>('article');

  protected readonly artSrc = artSrc;
  protected readonly artSmallSrc = artSmallSrc;
  protected readonly artSrcset = artSrcset;
  protected readonly ayah = computed(() => this.content.ayah(this.slug()));
  protected readonly category = computed(() => {
    const a = this.ayah();
    return a ? this.content.category(a.category) : undefined;
  });
  protected readonly onJourney = computed(() => this.path() === 'journey' && this.ayah()?.journey !== undefined);
  protected readonly journeyTotal = computed(() => this.content.journey().length);
  protected readonly neighbours = computed(() => {
    const a = this.ayah();
    if (!a) return {};
    if (!this.onJourney()) return this.content.neighbours(a.slug);
    const journey = this.content.journey();
    const i = journey.findIndex((j) => j.slug === a.slug);
    return { prev: journey[i - 1], next: journey[i + 1] };
  });
  protected readonly minutes = computed(() => {
    const a = this.ayah();
    return a ? readingMinutes(a, this.language.lang()) : 0;
  });
  protected readonly isRead = computed(() => {
    const a = this.ayah();
    return !!a && this.reading.countRead([a.slug]) > 0;
  });

  /** 0–1: how far down the page the reader is. */
  protected readonly progress = signal(0);
  protected readonly copied = signal(false);

  /** What «استمع / Listen» reads: the title and question, then each part of the story. */
  protected readonly readAloud = computed<SpeechSegment[]>(() => {
    const a = this.ayah();
    if (!a) return [];
    const pick = (text: Parameters<LanguageService['pick']>[0]) => this.language.pick(text);
    return [
      { key: 'title', text: pick(a.title) },
      { key: 'hook', text: pick(a.hook) },
      ...a.evidence.map((e, i) => ({ key: `e${i}`, text: pick(e.meaning) })),
      ...a.then.map((p, i) => ({ key: `then${i}`, text: pick(p) })),
      ...a.now.map((p, i) => ({ key: `now${i}`, text: pick(p) })),
      { key: 'reflection', text: pick(a.reflection) },
      { key: 'caution', text: pick(a.caution) },
    ];
  });

  constructor() {
    // Keep the paragraph being read in view.
    effect(() => {
      if (!this.speech.activeKey()) return;
      setTimeout(() => {
        const el = this.host.nativeElement.querySelector('.reading') as HTMLElement | null;
        const r = el?.getBoundingClientRect();
        if (el && r && (r.top < 90 || r.bottom > innerHeight)) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    });

    // A new sign: start at the top, or where the reader stopped when they asked to resume.
    afterRenderEffect(() => {
      const a = this.ayah();
      const article = this.article();
      if (!a || !article) return;
      untracked(() => {
        this.progress.set(0);
        this.copied.set(false);
        const place = this.reading.place();
        if (this.resume() === '1' && place?.slug === a.slug) {
          const el = article.nativeElement;
          const top = el.offsetTop + place.progress * Math.max(0, el.offsetHeight - innerHeight);
          scrollTo({ top, behavior: 'instant' });
        }
        this.onScroll();
      });
    });

    const title = inject(Title);
    effect(() => {
      const a = this.ayah();
      title.setTitle(a ? `${this.language.pick(a.title)} | ${this.t().appTitle}` : this.t().appTitle);
    });
  }

  protected onScroll(): void {
    const el = this.article()?.nativeElement;
    const a = this.ayah();
    if (!el || !a) return;
    const scrollable = Math.max(1, el.offsetHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, (scrollY - el.offsetTop) / scrollable));
    const before = this.progress();
    this.progress.set(progress);
    const rounded = Math.round(progress * 100) / 100;
    const place = this.reading.place();
    if (place?.slug !== a.slug || place.progress !== rounded) this.reading.place.set({ slug: a.slug, progress: rounded });
    // Reaching the end counts as having read the sign: on arriving there, so that marking it
    // unread while at the end sticks.
    if (progress > 0.97 && before <= 0.97 && !this.reading.isRead(a.slug)) this.reading.setRead(a.slug, true);
  }

  protected yearOf(m: Milestone): string {
    return typeof m.year === 'string' ? this.language.number(m.year) : this.language.pick(m.year);
  }

  /** The phone's share sheet where there is one; otherwise copy the link. */
  protected async share(): Promise<void> {
    const a = this.ayah();
    if (!a) return;
    const url = location.href.split('?')[0];
    const text = this.t().shareText(this.language.pick(a.title));
    try {
      if (navigator.share) {
        await navigator.share({ title: text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    } catch {
      // The reader closed the share sheet, or the clipboard is blocked: nothing to do.
    }
  }
}
