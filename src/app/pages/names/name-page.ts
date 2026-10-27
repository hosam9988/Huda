import { NgTemplateOutlet } from '@angular/common';
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
import { NameText } from '../../core/models/divine-name';
import { LanguageService } from '../../core/services/language.service';
import { NamesService } from '../../core/services/names.service';
import { ReadingService } from '../../core/services/reading.service';
import { SpeechSegment, SpeechService } from '../../core/services/speech.service';
import { Ornament } from '../../shared/ornament';
import { ReadAloud } from '../../shared/read-aloud';
import { Reveal } from '../../shared/reveal';

/** One of the Beautiful Names, kept short: its meaning, evidence, effect on a life, and a du'a. */
@Component({
  selector: 'app-name-page',
  imports: [NgTemplateOutlet, RouterLink, Ornament, ReadAloud, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './name-page.html',
  styleUrl: './name-page.scss',
  host: { '(window:scroll)': 'onScroll()' },
})
export class NamePage {
  /** Bound from /names/:slug. */
  readonly slug = input<string>('');

  protected readonly names = inject(NamesService);
  protected readonly reading = inject(ReadingService);
  protected readonly language = inject(LanguageService);
  protected readonly speech = inject(SpeechService);
  protected readonly t = this.language.t;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly article = viewChild<ElementRef<HTMLElement>>('article');

  protected readonly name = computed(() => this.names.name(this.slug()));
  protected readonly content = computed(() => this.name()?.content);
  protected readonly neighbours = computed(() => this.names.neighbours(this.slug()));
  protected readonly isRead = computed(() => this.reading.countRead([this.slug()]) > 0);

  /** 0–1: how far down the page the reader is. */
  protected readonly progress = signal(0);
  protected readonly copied = signal(false);

  /** What «استمع / Listen» reads: the name and its meaning, then each part of the page. */
  protected readonly readAloud = computed<SpeechSegment[]>(() => {
    const name = this.name();
    const content = this.content();
    if (!name || !content) return [];
    // Verses are skipped by the speech service; in English their translation is read instead.
    const say = (text: NameText) =>
      this.language.isArabic()
        ? text.explanation.ar
        : `${this.translationOf(text)} ${this.language.pick(text.explanation)}`;
    const title = this.language.isArabic() ? name.name : name.transliteration;
    return [
      { key: 'meaning', text: `${title}. ${this.language.pick(content.meaning)}` },
      ...content.evidence.map((e, i) => ({ key: `e${i}`, text: say(e) })),
      { key: 'impact', text: this.language.pick(content.impact) },
      { key: 'dua', text: say(content.dua) },
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

    // A new name: start counting the reading progress from the top.
    afterRenderEffect(() => {
      const name = this.name();
      const article = this.article();
      if (!name || !article) return;
      untracked(() => {
        this.progress.set(0);
        this.copied.set(false);
        this.onScroll();
      });
    });

    const title = inject(Title);
    effect(() => {
      const name = this.name();
      const label = name ? (this.language.isArabic() ? name.name : name.transliteration) : this.t().names.title;
      title.setTitle(`${label} | ${this.t().appTitle}`);
    });
  }

  /** A verse's or hadith's meaning in the reader's language (empty on the Arabic site). */
  protected translationOf(text: NameText): string {
    if (this.language.isArabic()) return '';
    return text.translation?.[this.language.lang()] ?? text.translation?.en ?? '';
  }

  protected onScroll(): void {
    const el = this.article()?.nativeElement;
    const name = this.name();
    if (!el || !name?.content) return;
    const scrollable = Math.max(1, el.offsetHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, (scrollY - el.offsetTop) / scrollable));
    const before = this.progress();
    this.progress.set(progress);
    // Reaching the end counts as having read the name: on arriving there, so that marking it
    // unread while at the end sticks.
    if (progress > 0.97 && before <= 0.97 && !this.reading.isRead(name.slug)) this.reading.setRead(name.slug, true);
  }

  /** The phone's share sheet where there is one; otherwise copy the link. */
  protected async share(): Promise<void> {
    const name = this.name();
    if (!name) return;
    const url = location.href.split('?')[0];
    const text = this.t().shareText(`${name.name} (${name.transliteration})`);
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
