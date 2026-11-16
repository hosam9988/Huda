import { Evidence } from './ayah';
import { Localized } from './lang';

/** A part of a topic's page: a heading and its paragraphs. */
export interface TopicSection {
  heading: Localized;
  paragraphs: Localized[];
}

/**
 * A page of the journey's later stages (/topics/:slug): what Islam asks of us, and the questions a
 * reader brings. It argues from its texts, as a sign does, but has no "then and now".
 */
export interface Topic {
  slug: string;
  /** A word in Arabic, drawn in a gold ring where a sign would show its picture. */
  mark: string;
  title: Localized;
  /** The question the page opens with. */
  hook: Localized;
  /** One or two sentences: on the map, at the end of the stop, in search results. */
  summary: Localized;
  evidence: Evidence[];
  sections: TopicSection[];
  /** The page's closing thought. */
  reflection: Localized;
  sources: TopicSource[];
}

/** A book or page the topic rests on: a tafsir, a collection of hadith. Titled in each language. */
export interface TopicSource {
  title: Localized;
  url: string;
}

/** public/data/topics.json */
export interface TopicsData {
  topics: Topic[];
}
