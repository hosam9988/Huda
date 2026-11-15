import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Ayah } from '../../core/models/ayah';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { NamesService } from '../../core/services/names.service';
import { artSmallSrc, artSrc, artSrcset } from '../../core/utils/art';
import { readingMinutes } from '../../core/utils/reading-time';
import { Ornament } from '../../shared/ornament';
import { Reveal } from '../../shared/reveal';
import { Swipe, SwipeDrag } from '../../shared/swipe';

/**
 * The signs whose opening questions the home page shows under the journey: one or two from each
 * field, chosen because their question alone makes a reader want the answer.
 */
const QUESTIONS = [
  'iron-sent-down',
  'mountains-as-pegs',
  'barrier-between-seas',
  'the-fingertips',
  'healing-in-honey',
  'abu-lahab-foretold',
  'competing-in-tall-buildings',
  'green-arabia',
  'never-create-a-fly',
];

/** The question the folded list of questions quotes, to show what it holds. */
const SAMPLE_QUESTION = 'mountains-as-pegs';

/** How long each of the hero's questions stays before the next, in milliseconds. */
const TURN = 7000;

/** How long a question sent away by a swipe takes to fade out (`.question` in portal.scss). */
const LEAVE = 800;

/** A question a swipe is moving: above the others, its moving edge casting a shadow on them. */
const ON_TOP = { 'z-index': '1', 'box-shadow': '0 0 48px rgb(0 0 0 / 60%)' };

/**
 * The journey (in the hero) and the questions are folded until the reader opens them. Back and
 * Forward rebuild the page, so whether each is open is kept here, for the whole visit.
 */
const journeyOpen = signal(false);
const questionsOpen = signal(false);

/** A sign's opening question, split into its first question and what follows it. */
export function splitQuestion(text: string): { lead: string; rest: string } {
  const m = /^([^?؟]*[?؟])\s+(\S[\s\S]*)$/.exec(text);
  return m ? { lead: m[1], rest: m[2] } : { lead: text, rest: '' };
}

/**
 * The site's front page. Under its title, the journey for readers new to Islam is folded under a
 * line that says what it holds; open, its questions take turns. Then more questions, folded too;
 * then the two sections, today's sign and name, and why the site can be trusted.
 */
@Component({
  selector: 'app-portal',
  imports: [Ornament, RouterLink, Reveal, Swipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal.html',
  styleUrl: './portal.scss',
})
export class Portal {
  protected readonly content = inject(ContentService);
  protected readonly names = inject(NamesService);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  protected readonly artSrc = artSrc;
  protected readonly artSmallSrc = artSmallSrc;
  protected readonly artSrcset = artSrcset;
  protected readonly splitQuestion = splitQuestion;

  protected readonly journey = this.content.journey;
  protected readonly questions = computed(() =>
    QUESTIONS.map((slug) => this.content.ayah(slug)).filter((a): a is Ayah => !!a),
  );
  protected readonly sample = computed(() => {
    const sign = this.content.ayah(SAMPLE_QUESTION);
    return sign ? splitQuestion(this.language.pick(sign.hook)).lead : '';
  });
  protected readonly journeyOpen = journeyOpen;
  protected readonly questionsOpen = questionsOpen;
  protected readonly journeyMinutes = computed(() =>
    this.journey().reduce((sum, a) => sum + readingMinutes(a, this.language.lang()), 0),
  );
  protected readonly stats = computed(() => {
    const ayat = this.content.ayat();
    const miracles = ayat.filter((a) => a.type !== 'reflection').length;
    return {
      miracles,
      reflection: ayat.length - miracles,
      names: this.names.names().length,
      sources: new Set(ayat.flatMap((a) => a.sources.map((s) => s.url))).size,
    };
  });

  /** The hero's question on show, and whether the questions are taking turns. */
  protected readonly current = signal(0);
  /** Stopped by the reader's button; held while the pointer or the focus is on the questions. */
  protected readonly stopped = signal(false);
  protected readonly held = signal(false);
  /** The question a swipe has just sent away, and how far it goes while it fades out. */
  private readonly leaving = signal<{ i: number; x: number } | null>(null);
  private leavingTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(this.language.isArabic() ? 'اعرف الله' : `${this.t().appTitle} · اعرف الله`));

    // The questions take turns while their fold is open, unless the reader prefers less motion.
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) this.stopped.set(true);
      const timer = setInterval(() => {
        const count = this.journey().length;
        if (!count || !journeyOpen() || this.stopped() || this.held() || document.hidden) return;
        this.current.set((this.current() + 1) % count);
      }, TURN);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  protected categoryTitle(sign: Ayah): string {
    return this.language.pick(this.content.category(sign.category)?.title);
  }

  protected show(i: number): void {
    this.current.set(i);
    this.stopped.set(true);
  }

  /** A swipe on the questions: the next or the one before, and the turns stop, as with the dots. */
  protected turn(drag: SwipeDrag): void {
    const count = this.journey().length;
    if (!count) return;
    const from = this.current();
    this.leaving.set({ i: from, x: drag.x + Math.sign(drag.x) * drag.width * 0.3 });
    clearTimeout(this.leavingTimer);
    this.leavingTimer = setTimeout(() => this.leaving.set(null), LEAVE);
    this.show((from + drag.step + count) % count);
  }

  /**
   * Where a question sits while a swipe moves it. The one on show follows the drag, on top, and
   * the one the drag leads to lies under it, seen where the top one has moved off, like the next
   * card of a stack. Once let go, the question sent away keeps going while it fades out.
   */
  protected swipeStyle(i: number, drag: SwipeDrag | null): Record<string, string> | null {
    const count = this.journey().length;
    if (drag && count) {
      if (i === this.current()) return { translate: `${drag.x}px 0`, ...ON_TOP };
      if (i === (this.current() + drag.step + count) % count) {
        return { visibility: 'visible', opacity: '1' };
      }
    }
    const leaving = this.leaving();
    return leaving?.i === i ? { translate: `${leaving.x}px 0`, ...ON_TOP } : null;
  }
}
