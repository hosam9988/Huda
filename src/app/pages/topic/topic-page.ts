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
import { JOURNEY_TEXT, JourneyService } from '../../core/journey';
import { LanguageService } from '../../core/services/language.service';
import { ReadingService } from '../../core/services/reading.service';
import { SpeechSegment, SpeechService } from '../../core/services/speech.service';
import { TopicsService } from '../../core/services/topics.service';
import { topicMinutes } from '../../core/utils/reading-time';
import { JourneyOnward, JourneyPlace } from '../../shared/journey-stop';
import { Ornament } from '../../shared/ornament';
import { ReadAloud } from '../../shared/read-aloud';
import { Reveal } from '../../shared/reveal';
import { WatchHere } from '../../shared/video';

/** A part of a topic's page, for the list of links to its parts. */
interface Part {
  id: string;
  label: string;
}

/**
 * A topic of the journey's later stages (/topics/:slug): what Islam asks of us, and the questions a
 * reader brings. Its texts, then its argument part by part, a closing thought and its sources. Every
 * topic is a stop on the journey, so it always shows its place and leads on to the next stop.
 */
@Component({
  selector: 'app-topic-page',
  imports: [RouterLink, Ornament, ReadAloud, Reveal, JourneyPlace, JourneyOnward, WatchHere],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topic-page.html',
  styleUrls: ['../ayah/ayah-page.scss', './topic-page.scss'],
  host: { '(window:scroll)': 'onScroll()' },
})
export class TopicPage {
  /** Bound from /topics/:slug. */
  readonly slug = input<string>('');

  protected readonly topics = inject(TopicsService);
  private readonly journey = inject(JourneyService);
  protected readonly reading = inject(ReadingService);
  protected readonly language = inject(LanguageService);
  protected readonly speech = inject(SpeechService);
  protected readonly t = this.language.t;
  protected readonly journeyText = JOURNEY_TEXT;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly article = viewChild<ElementRef<HTMLElement>>('article');

  protected readonly topic = computed(() => this.topics.topic(this.slug()));
  protected readonly stop = computed(() => this.journey.find('topic', this.slug()));
  protected readonly minutes = computed(() => {
    const topic = this.topic();
    return topic ? topicMinutes(topic, this.language.lang()) : 0;
  });
  protected readonly isRead = computed(() => this.reading.countRead([this.slug()]) > 0);

  /** The page's parts, in order: the links at its side (or, on a phone, under its tools) lead to them. */
  protected readonly parts = computed<Part[]>(() => {
    const topic = this.topic();
    if (!topic) return [];
    const s = this.t().sections;
    return [
      { id: 'text', label: s.evidence },
      ...topic.sections.map((section, i) => ({ id: `part${i}`, label: this.language.pick(section.heading) })),
      { id: 'reflect', label: s.reflection },
      { id: 'sources', label: s.sources },
    ];
  });
  /** The part the reader is in, marked in the list. */
  protected readonly currentPart = signal('text');

  /** 0–1: how far down the page the reader is. */
  protected readonly progress = signal(0);
  protected readonly copied = signal(false);

  /** What «استمع / Listen» reads: the title and question, the texts' meanings, then each part. */
  protected readonly readAloud = computed<SpeechSegment[]>(() => {
    const topic = this.topic();
    if (!topic) return [];
    const pick = (text: Parameters<LanguageService['pick']>[0]) => this.language.pick(text);
    return [
      { key: 'title', text: pick(topic.title) },
      { key: 'hook', text: pick(topic.hook) },
      ...topic.evidence.map((e, i) => ({ key: `e${i}`, text: pick(e.meaning) })),
      ...topic.sections.flatMap((section, i) =>
        section.paragraphs.map((p, j) => ({
          key: `p${i}-${j}`,
          text: j ? pick(p) : `${pick(section.heading)}. ${pick(p)}`,
        })),
      ),
      { key: 'reflection', text: pick(topic.reflection) },
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

    // A new topic: start at the top. Until the router scrolls up a frame later, the window keeps the
    // last page's offset, clamped to this page's end, which would count it as read on arrival.
    afterRenderEffect(() => {
      const topic = this.topic();
      if (!topic || !this.article()) return;
      untracked(() => {
        this.progress.set(0);
        this.copied.set(false);
        scrollTo({ top: 0, behavior: 'instant' });
        this.onScroll();
      });
    });

    const title = inject(Title);
    effect(() => {
      const topic = this.topic();
      title.setTitle(topic ? `${this.language.pick(topic.title)} | ${this.t().appTitle}` : this.t().appTitle);
    });
  }

  protected onScroll(): void {
    const el = this.article()?.nativeElement;
    const topic = this.topic();
    if (!el || !topic) return;
    const scrollable = Math.max(1, el.offsetHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, (scrollY - el.offsetTop) / scrollable));
    const before = this.progress();
    this.progress.set(progress);
    // Reaching the end counts as having read it, as on a sign's page.
    if (progress > 0.97 && before <= 0.97 && !this.reading.isRead(topic.slug)) this.reading.setRead(topic.slug, true);
    // The part in view: the last one whose top has passed a third of the way down the window.
    let current = this.parts()[0]?.id ?? '';
    for (const part of this.parts()) {
      const top = this.host.nativeElement.querySelector(`#${part.id}`)?.getBoundingClientRect().top;
      if (top !== undefined && top < innerHeight / 3) current = part.id;
    }
    if (current !== this.currentPart()) this.currentPart.set(current);
  }

  /** From the list of parts: to that part, with the focus on its heading for keyboard users. */
  protected goTo(id: string): void {
    const section = this.host.nativeElement.querySelector<HTMLElement>(`#${id}`);
    if (!section) return;
    section.scrollIntoView({ block: 'start' });
    section.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
    this.currentPart.set(id);
  }

  /** The phone's share sheet where there is one; otherwise copy the link. */
  protected async share(): Promise<void> {
    const topic = this.topic();
    if (!topic) return;
    const url = location.href.split('?')[0];
    const text = this.t().shareText(this.language.pick(topic.title));
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
