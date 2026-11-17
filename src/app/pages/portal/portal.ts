import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { JOURNEY_TEXT, JourneyService } from '../../core/journey';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { NamesService } from '../../core/services/names.service';
import { artSmallSrc, artSrc, artSrcset } from '../../core/utils/art';
import { readingMinutes } from '../../core/utils/reading-time';
import { Ornament } from '../../shared/ornament';
import { Reveal } from '../../shared/reveal';
import { WATCH_TEXT } from '../../shared/video';
import { JourneyMap, JourneyStart } from './journey-map';

/**
 * The site's front page, and the journey's map. Under its title, the card that starts the journey
 * (or carries a reader who has begun on to their next stop); under that, the map of its seven
 * stages. Then the library (the signs and the names), today's sign and name, and why the site can
 * be trusted.
 */
@Component({
  selector: 'app-portal',
  imports: [Ornament, RouterLink, Reveal, JourneyStart, JourneyMap],
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
  protected readonly watchText = WATCH_TEXT;
  protected readonly artSrcset = artSrcset;
  protected readonly journeyText = JOURNEY_TEXT;

  protected readonly journeyStops = inject(JourneyService).stops;

  /** The short tour: seven miracles for a reader short of time (`?path=journey` on /signs). */
  protected readonly tour = this.content.journey;
  protected readonly quickTour = computed(() => {
    const n = (value: number) => this.language.number(value);
    const minutes = this.tour().reduce((sum, a) => sum + readingMinutes(a, this.language.lang()), 0);
    return this.language.isArabic()
      ? `الجولة السريعة: ${n(this.tour().length)} محطات في ${n(minutes)} دقيقة`
      : `The short tour: ${n(this.tour().length)} stops in ${n(minutes)} minutes`;
  });

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

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(this.language.isArabic() ? 'اعرف الله' : `${this.t().appTitle} · اعرف الله`));
  }
}
