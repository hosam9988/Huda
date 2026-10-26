import { Lang, Localized } from './lang';

/**
 * A verse or hadith on a name's page — one of its evidences, or its supplication — with a very
 * short explanation, summarised from «فقه الأسماء الحسنى» by Shaykh ʿAbd al-Razzāq al-Badr.
 */
export interface NameText {
  kind: 'quran' | 'hadith';
  /** Exactly as in the Mushaf (verses) or the collection (hadith); the page adds ﴿ ﴾ or « ». */
  text: string;
  /** «الأعراف: ١٨٠» / "Al-Aʿraf 7:180", or the hadith's collection and number. */
  ref: Localized;
  /** For a hadith: who narrated it. */
  narrator?: Localized;
  /** For a hadith outside al-Bukhari and Muslim: its grading and the scholar who gave it. */
  grading?: Localized;
  /** Its meaning for readers of other languages; the Arabic site shows the text itself. */
  translation?: Partial<Record<Lang, string>>;
  /** One or two sentences: what it shows about the name, or when to say the supplication. */
  explanation: Localized;
}

/** A name's page, kept very short: written in batches, so not every name has it yet. */
export interface NameContent {
  /** What the name means, in a line. */
  meaning: Localized;
  /** One to three verses or hadith in which the name is established. */
  evidence: NameText[];
  /** What believing in the name does in a person's heart and life: two or three sentences. */
  impact: Localized;
  /** A supplication from the Qur'an or authentic Sunnah that calls on the name. */
  dua: NameText;
}

/** One of the Beautiful Names, at /names/:slug. */
export interface DivineName {
  slug: string;
  /** Its place in the list, which follows «فقه الأسماء الحسنى». */
  number: number;
  /** The name, fully vowelled. */
  name: string;
  transliteration: string;
  /** A few English words, shown until the name's page is written. */
  gloss: string;
  content?: NameContent;
}

/** public/data/names.json */
export interface NamesData {
  names: DivineName[];
}
