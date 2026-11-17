import { Lang, Localized } from './lang';

/**
 * A clip in «شاهد» (/watch): a YouTube video by a speaker the owner approved, chosen clip by clip
 * after its transcript was checked against the site's method. It is shown on the journey's pages
 * listed in `stops`, and on /watch.
 */
export interface Video {
  /** The YouTube video id. */
  id: string;
  /** The language spoken in it. */
  lang: Lang;
  speaker: Localized;
  /** Its title, in our words. */
  title: Localized;
  /** One or two sentences: what it argues. */
  about: Localized;
  /** Its length, in seconds (of the part shown, when `start` or `end` is set). */
  seconds: number;
  /** Where to start and stop playing, in seconds, when only part of it is shown. */
  start?: number;
  end?: number;
  /** A word from the site, shown under the clip, where something in it needs a correction. */
  note?: Localized;
  /** The slugs of the pages it is shown on (signs, names, topics). */
  stops: string[];
}

/** public/data/videos.json */
export interface VideosData {
  videos: Video[];
}
