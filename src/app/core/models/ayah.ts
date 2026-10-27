import { Localized } from './lang';

/** The fields of knowledge the signs are grouped under, in the order the home page shows them. */
export type CategoryId =
  | 'cosmos'
  | 'earth'
  | 'seas'
  | 'life'
  | 'human'
  | 'health'
  | 'history'
  | 'prophecies'
  | 'preservation';

export interface Category {
  id: CategoryId;
  title: Localized;
  /** One line under the title on the home page. */
  blurb: Localized;
  /** Illustration file in public/illustrations, without the extension. */
  art: string;
}

/** The scripture a sign rests on: a verse (or a few) of the Qur'an, or a hadith. */
export interface Evidence {
  kind: 'quran' | 'hadith';
  /** The Arabic text, exactly as in the Mushaf (verses) or the collection (hadith). */
  text: string;
  /**
   * Shown under the Arabic, never in its place: in Arabic, a short gloss of its key words from
   * the books of tafsir; in other languages, a translation of its meaning.
   */
  meaning: Localized;
  /** «الذاريات: ٤٧» / "Adh-Dhariyat 51:47", or the hadith's collection and number. */
  ref: Localized;
  /** For a hadith: who narrated it. */
  narrator?: Localized;
}

/** A dated step on the way from revelation to discovery. */
export interface Milestone {
  /** A plain year such as "1929" (its digits follow the language), or text for each language. */
  year: string | Localized;
  text: Localized;
  /** The step where the scripture came; drawn in gold. Discoveries are drawn in teal. */
  revelation?: boolean;
}

export interface Source {
  title: string;
  /** Journal, agency, university or publisher. */
  publisher: string;
  year?: string;
  url: string;
  /** `preprint`: not peer-reviewed yet. `news`: a science news report or press release. */
  kind: 'journal' | 'preprint' | 'agency' | 'university' | 'encyclopedia' | 'book' | 'news';
}

/** One sign: a page of its own at /ayah/:slug. */
export interface Ayah {
  slug: string;
  category: CategoryId;
  /** Position on the "Start here" journey, for readers new to Islam; absent if not on it. */
  journey?: number;
  title: Localized;
  /** The question the page opens with. */
  hook: Localized;
  /** One or two sentences for the cards. */
  summary: Localized;
  evidence: Evidence[];
  /** What people knew or believed when it was revealed. */
  then: Localized[];
  /** What has since been found, paragraph by paragraph. */
  now: Localized[];
  /** `history`: «now» is headed "What history records" (a prophecy, a manuscript), not science. */
  nowLabel?: 'history';
  /**
   * `reflection`: a sign to reflect on. What it says is true and plainly meant, but people already
   * knew it when it was revealed, so it is not offered as i'jaz. It carries the «للتفكر» badge and
   * comes after its field's other signs.
   */
  type?: 'reflection';
  /** One large figure for the page, e.g. «١٣٠٠ عام» "between the verse and Hubble". */
  highlight: { value: Localized; label: Localized };
  timeline: Milestone[];
  /** The page's closing thought. */
  reflection: Localized;
  /** An honest note on how far the link between the text and the finding goes. */
  caution: Localized;
  /** A short extra fact for the "Did you know?" box. */
  didYouKnow?: Localized;
  sources: Source[];
  /** Illustration file in public/illustrations, without the extension. */
  art: string;
}

/** public/data/ayat.json */
export interface Content {
  categories: Category[];
  ayat: Ayah[];
}
