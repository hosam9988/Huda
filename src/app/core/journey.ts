import { computed, inject, Injectable } from '@angular/core';
import { Ayah } from './models/ayah';
import { DivineName } from './models/divine-name';
import { Lang, Localized, localize } from './models/lang';
import { ContentService } from './services/content.service';
import { Topic } from './models/topic';
import { NamesService } from './services/names.service';
import { ReadingService } from './services/reading.service';
import { TopicsService } from './services/topics.service';
import { readingMinutes, topicMinutes } from './utils/reading-time';

/**
 * The journey: seven questions a person asks about God, one after the other, each answered by a few
 * of the site's pages (its stops). The home page draws them as a map; a page reached from the map
 * (`?path=map`) shows where it stands and leads on to the next stop. One road for every reader:
 * the seeker and the Muslim take the same stops, and part only at the end, on «ماذا بعد؟».
 *
 * The code calls a question a stage and a page under it a stop. The reader meets two words only:
 * «السؤال» (question) for each of the seven, and «الموضوع» (topic) for a page under one. «مرحلة»
 * and «محطة» appear in nothing the reader sees, so nobody has to tell a stop from a question.
 */

/**
 * A page on the journey: a sign (/signs/:slug), one of the Beautiful Names (/names/:slug), or a
 * topic of the later stages (/topics/:slug).
 */
export interface StopRef {
  kind: 'sign' | 'name' | 'topic';
  slug: string;
}

/**
 * `open`: its stops can be read. `soon`: its pages are still being written, so it is shown but
 * cannot be entered. `page`: it is one page, not a list of stops (the last stage, «ماذا بعد؟»).
 */
export type StageStatus = 'open' | 'soon' | 'page';

export interface StageDef {
  /** A word or two above the question: what the stage is about. */
  kicker: Localized;
  /** The question the stage answers. */
  title: Localized;
  /** One line under the question. */
  line: Localized;
  status: StageStatus;
  stops: StopRef[];
}

const sign = (slug: string): StopRef => ({ kind: 'sign', slug });
const name = (slug: string): StopRef => ({ kind: 'name', slug });
const topic = (slug: string): StopRef => ({ kind: 'topic', slug });

/**
 * The stages, in order. Each open stage takes a few pages of its field, chosen so that together
 * they answer its question; the rest stay in the library (/signs, /names). A page is on the
 * journey once at most.
 */
export const STAGES: StageDef[] = [
  {
    kicker: { ar: 'الخالق', en: 'The Creator' },
    title: { ar: 'هل لهذا الكون خالق؟', en: 'Does this universe have a Creator?' },
    line: {
      ar: 'آياتٌ في الكون وفي نفسك تدلّ على من صنعها.',
      en: 'Signs in the universe and within you that point to the One who made them.',
    },
    status: 'open',
    stops: [
      sign('a-blazing-lamp'),
      sign('the-water-you-drink'),
      sign('cleaver-of-grain'),
      sign('form-then-guidance'),
      sign('never-create-a-fly'),
      sign('languages-and-colours'),
    ],
  },
  {
    kicker: { ar: 'أسماؤه الحسنى', en: 'His Beautiful Names' },
    title: { ar: 'من هو؟', en: 'Who is He?' },
    line: {
      ar: 'عرّفنا بنفسه بأسمائه الحسنى، فنعرفه بها.',
      en: 'He made Himself known by His Beautiful Names, and by them we know Him.',
    },
    status: 'open',
    stops: [name('allah'), name('al-ahad'), name('al-khaliq'), name('al-alim'), name('al-hakim'), name('ar-rahman')],
  },
  {
    kicker: { ar: 'كلامه', en: 'His word' },
    title: { ar: 'هل كلّمنا؟', en: 'Has He spoken to us?' },
    line: {
      ar: 'القرآن: آياتٌ وافقت ما كشفه العلم بعد قرون، وكتابٌ حُفظ كما نزل.',
      en: 'The Qur’an: verses that agree with what science found centuries later, and a book kept as it was revealed.',
    },
    status: 'open',
    stops: [
      sign('expanding-universe'),
      sign('darkness-of-the-deep'),
      sign('stages-of-the-embryo'),
      sign('skins-renewed'),
      sign('each-in-an-orbit'),
      sign('the-quran-preserved'),
    ],
  },
  {
    kicker: { ar: 'رسوله ﷺ', en: 'His Messenger ﷺ' },
    title: { ar: 'من الذي بلّغنا؟', en: 'Who brought it to us?' },
    line: {
      ar: 'محمد ﷺ: أخبر بأمورٍ قبل وقوعها، فوقعت كما قال.',
      en: 'Muhammad ﷺ: he foretold things before they happened, and they happened as he said.',
    },
    status: 'open',
    stops: [
      sign('romans-will-overcome'),
      sign('the-host-will-be-routed'),
      sign('return-to-mecca'),
      sign('commanders-of-mutah'),
      sign('you-will-conquer-egypt'),
      sign('competing-in-tall-buildings'),
    ],
  },
  {
    kicker: { ar: 'دينه', en: 'His religion' },
    title: { ar: 'ماذا يريد منّا؟', en: 'What does He ask of us?' },
    line: {
      ar: 'أن نعبده وحده؛ وقد بيّن لنا الطريق، وما ينتظرنا في آخره.',
      en: 'To worship Him alone. He has shown us the way, and what waits at its end.',
    },
    status: 'open',
    stops: [
      topic('why-we-were-created'),
      topic('pillars-of-islam'),
      topic('pillars-of-faith'),
      topic('what-he-commands'),
      topic('the-last-day'),
      topic('the-door-is-open'),
    ],
  },
  {
    kicker: { ar: 'أسئلتك', en: 'Your questions' },
    title: { ar: 'وماذا عن أسئلتي؟', en: 'And what about my questions?' },
    line: {
      ar: 'أسئلةٌ يسألها كل باحثٍ صادق، ولكلٍّ منها جوابه بالدليل.',
      en: 'Questions every honest seeker asks, each answered with its evidence.',
    },
    status: 'open',
    stops: [
      topic('who-created-allah'),
      topic('why-pain'),
      topic('why-islam'),
      topic('jesus-in-islam'),
      topic('faith-and-reason'),
      topic('never-reached'),
    ],
  },
  {
    kicker: { ar: 'خطوتك', en: 'Your step' },
    title: { ar: 'ماذا بعد؟', en: 'What next?' },
    line: {
      ar: 'الشهادتان لمن اقتنع، وزادُ كل يوم لمن آمن.',
      en: 'The declaration of faith for whoever is convinced, and something for every day for whoever believes.',
    },
    status: 'page',
    stops: [],
  },
];

/** The words of the journey, in both languages. Counts take the number already in the page's digits. */
export const JOURNEY_TEXT = {
  mapKicker: { ar: 'خريطة الرحلة', en: 'The journey’s map' } as Localized,
  mapTitle: { ar: 'سبعة أسئلة، كلٌّ يبني على ما قبله', en: 'Seven questions, each building on the last' } as Localized,
  mapLine: {
    ar: 'رحلةٌ واحدة لكل قارئ: لمن يبحث عن الحق، ولمن آمن ويريد أن يطمئن قلبه.',
    en: 'One journey for every reader: for whoever is looking for the truth, and for whoever believes and wants their heart at rest.',
  } as Localized,
  startTitle: { ar: 'رحلةٌ في سبعة أسئلة', en: 'A journey in seven questions' } as Localized,
  startLine: {
    ar: 'من «هل لهذا الكون خالق؟» إلى «ماذا بعد؟»، بالدليل والمصدر.',
    en: 'From “Does this universe have a Creator?” to “What next?”, with the evidence and its sources.',
  } as Localized,
  start: { ar: 'ابدأ الرحلة', en: 'Start the journey' } as Localized,
  seeMap: { ar: 'خريطة الرحلة', en: 'The journey’s map' } as Localized,
  continueTitle: { ar: 'أكمل رحلتك', en: 'Continue your journey' } as Localized,
  doneTitle: { ar: 'أتممت الرحلة', en: 'You have finished the journey' } as Localized,
  doneLine: {
    ar: 'قرأت أجوبة الأسئلة الستة كلها. بقيت خطوتك أنت.',
    en: 'You have read the answers to all six questions. What remains is your own step.',
  } as Localized,
  here: { ar: 'أنت هنا', en: 'You are here' } as Localized,
  startHere: { ar: 'ابدأ هنا', en: 'Start here' } as Localized,
  finished: { ar: 'أتممتها', en: 'Done' } as Localized,
  soon: { ar: 'تُكتب قريبًا', en: 'Being written' } as Localized,
  onePage: { ar: 'صفحة واحدة', en: 'One page' } as Localized,
  quickAsk: { ar: 'مستعجل؟', en: 'Short of time?' } as Localized,
  summaryTitle: { ar: 'خلاصة الموضوع', en: 'This topic in short' } as Localized,
  nextStage: { ar: 'السؤال التالي', en: 'Next question' } as Localized,
  lastTitle: { ar: 'السؤال الأخير، خطوتك', en: 'The last question: your step' } as Localized,
  lastLine: {
    ar: 'رأيت الدليل، وسمعت الجواب عن أسئلتك. فماذا بعد؟',
    en: 'You have seen the evidence and heard the answers to your questions. So what next?',
  } as Localized,
  readOn: { ar: 'اقرأ', en: 'Read' } as Localized,
};

/**
 * Between two parts of a label. Not «·» in Arabic: beside an Arabic-Indic digit it looks like «٠», so
 * «التالية · ٣ من ٦» reads as «٣٠ من ٦».
 */
export function sep(lang: Lang): string {
  return lang === 'ar' ? '، ' : ' · ';
}

/** «السؤال ٣ من ٧» */
export function stageOf(lang: Lang, n: string, total: string): string {
  return lang === 'ar' ? `السؤال ${n} من ${total}` : `Question ${n} of ${total}`;
}

/** «السؤال ٣، الموضوع ١ من ٦» */
export function stopOf(lang: Lang, stage: string, n: string, total: string): string {
  return lang === 'ar' ? `السؤال ${stage}، الموضوع ${n} من ${total}` : `Question ${stage} · topic ${n} of ${total}`;
}

/** The word a count of topics takes in Arabic: «٦ موضوعات», «٣٦ موضوعًا». */
function topicsWord(count: number): string {
  const lastTwo = count % 100;
  if (lastTwo >= 3 && lastTwo <= 10) return 'موضوعات';
  return lastTwo >= 11 ? 'موضوعًا' : 'موضوع';
}

/** «قرأت ١٣ من ٣٦ موضوعًا». `count` is the total as a number: it picks the word that follows it. */
export function doneOf(lang: Lang, done: string, total: string, count: number): string {
  return lang === 'ar' ? `قرأت ${done} من ${total} ${topicsWord(count)}` : `${done} of ${total} topics read`;
}

/** «٦ موضوعات» */
export function stopsCount(lang: Lang, count: number, n: string): string {
  if (lang === 'en') return count === 1 ? '1 topic' : `${n} topics`;
  if (count === 1) return 'موضوع واحد';
  if (count === 2) return 'موضوعان';
  return `${n} ${topicsWord(count)}`;
}

/** «أكمل: …» on the button of a reader who has started. */
export function nextOf(lang: Lang, title: string): string {
  return lang === 'ar' ? `أكمل: ${title}` : `Continue: ${title}`;
}

/** A stop, ready to draw: its page's title, picture and reading time. */
export interface Stop extends StopRef {
  /** Its place on the whole journey (0, 1, 2…) and in its stage. */
  index: number;
  stage: number;
  inStage: number;
  title: Localized | string;
  /** For a name: the name itself, in Arabic, shown in every language. */
  arabic?: string;
  /** For a name or a topic, which have no picture: a word in Arabic, drawn in a gold ring. */
  mark?: string;
  /** For a sign: its picture (images/<art>-sm.webp). */
  art?: string;
  /** One or two sentences: a sign's summary, a name's meaning. */
  summary: Localized;
  /** Minutes to read it, in Arabic and in English. */
  minutes: Record<Lang, number>;
  link: string[];
}

export interface Stage extends StageDef {
  /** 1–7 */
  n: number;
  stops: Stop[];
  minutes: Record<Lang, number>;
}

/** Arabic words are read a little slower than English ones (as in utils/reading-time.ts). */
const WORDS_PER_MINUTE: Record<Lang, number> = { ar: 150, en: 200 };

/** Minutes to read a name's page: its meaning, texts, their explanations, its effect and du'a. */
export function nameMinutes(item: DivineName, lang: Lang): number {
  const c = item.content;
  if (!c) return 2;
  const count = (text: string | undefined) => (text ?? '').split(/\s+/).filter(Boolean).length;
  const texts = [...c.evidence, c.dua];
  const words =
    count(localize(c.meaning, lang)) +
    count(localize(c.impact, lang)) +
    texts.reduce((sum, t) => sum + count(t.text) + count(localize(t.explanation, lang)), 0);
  return Math.max(2, Math.ceil(words / WORDS_PER_MINUTE[lang]));
}

/** The journey's stages with their pages, and how far this reader has come. */
@Injectable({ providedIn: 'root' })
export class JourneyService {
  private readonly content = inject(ContentService);
  private readonly names = inject(NamesService);
  private readonly topics = inject(TopicsService);
  private readonly reading = inject(ReadingService);

  /** Every stage, its stops drawn from the data (a stop whose page is missing is left out). */
  readonly stages = computed<Stage[]>(() => {
    let index = 0;
    return STAGES.map((def, s) => {
      const stops: Stop[] = [];
      for (const ref of def.stops) {
        const stop =
          ref.kind === 'sign'
            ? this.signStop(this.content.ayah(ref.slug))
            : ref.kind === 'name'
              ? this.nameStop(this.names.name(ref.slug))
              : this.topicStop(this.topics.topic(ref.slug));
        if (stop) stops.push({ ...stop, index: index++, stage: s + 1, inStage: stops.length });
      }
      const minutes = {
        ar: stops.reduce((sum, stop) => sum + stop.minutes.ar, 0),
        en: stops.reduce((sum, stop) => sum + stop.minutes.en, 0),
      };
      return { ...def, n: s + 1, stops, minutes };
    });
  });

  /** Every stop, in order. */
  readonly stops = computed(() => this.stages().flatMap((stage) => stage.stops));

  /** How many stops this reader has read, of all the stops written so far. */
  readonly done = computed(() => this.reading.countRead(this.stops().map((stop) => stop.slug)));

  /** The first stop not yet read; none once every stop written so far has been read. */
  readonly next = computed(() => this.stops().find((stop) => !this.reading.isRead(stop.slug)));

  /** The stage the reader is in: that of the next stop, or the last stage once all are read. */
  readonly current = computed(() => this.next()?.stage ?? this.stages().length);

  isRead(stop: StopRef): boolean {
    return this.reading.isRead(stop.slug);
  }

  /** A page's place on the journey, if it is a stop. */
  find(kind: StopRef['kind'], slug: string): Stop | undefined {
    return this.stops().find((stop) => stop.kind === kind && stop.slug === slug);
  }

  /** The stop after this one, on the whole journey. */
  after(stop: Stop): Stop | undefined {
    return this.stops()[stop.index + 1];
  }

  before(stop: Stop): Stop | undefined {
    return stop.index > 0 ? this.stops()[stop.index - 1] : undefined;
  }

  stage(n: number): Stage | undefined {
    return this.stages()[n - 1];
  }

  private signStop(a: Ayah | undefined): Omit<Stop, 'index' | 'stage' | 'inStage'> | undefined {
    if (!a) return undefined;
    return {
      kind: 'sign',
      slug: a.slug,
      title: a.title,
      art: a.art,
      summary: a.summary,
      minutes: { ar: readingMinutes(a, 'ar'), en: readingMinutes(a, 'en') },
      link: ['/signs', a.slug],
    };
  }

  private nameStop(item: DivineName | undefined): Omit<Stop, 'index' | 'stage' | 'inStage'> | undefined {
    if (!item?.content) return undefined;
    return {
      kind: 'name',
      slug: item.slug,
      title: item.transliteration,
      arabic: item.name,
      mark: item.name,
      summary: item.content.meaning,
      minutes: { ar: nameMinutes(item, 'ar'), en: nameMinutes(item, 'en') },
      link: ['/names', item.slug],
    };
  }

  private topicStop(t: Topic | undefined): Omit<Stop, 'index' | 'stage' | 'inStage'> | undefined {
    if (!t) return undefined;
    return {
      kind: 'topic',
      slug: t.slug,
      title: t.title,
      mark: t.mark,
      summary: t.summary,
      minutes: { ar: topicMinutes(t, 'ar'), en: topicMinutes(t, 'en') },
      link: ['/topics', t.slug],
    };
  }
}
