import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { JourneyService, Stop } from '../../core/journey';
import { Video } from '../../core/models/video';
import { LanguageService } from '../../core/services/language.service';
import { VideosService } from '../../core/services/videos.service';
import { ON_MAP } from '../../shared/journey-stop';
import { Reveal } from '../../shared/reveal';
import { VideoCard, WATCH_TEXT } from '../../shared/video';

interface Group {
  n: number;
  kicker: string;
  title: string;
  clips: { video: Video; stop?: Stop }[];
}

/**
 * «شاهد» (/watch): every clip, under the stage of the journey it belongs to, each with a link to its
 * stop. A clip on no stop is listed last.
 */
@Component({
  selector: 'app-watch',
  imports: [RouterLink, Reveal, VideoCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="container watch-page">
      <header class="head">
        <p class="eyebrow">{{ language.pick(text.title) }}</p>
        <h1>{{ language.pick(text.pageTitle) }}</h1>
        <p>{{ language.pick(text.pageIntro) }}</p>
        <p class="privacy">{{ language.pick(text.privacy) }}</p>
      </header>

      @for (group of groups(); track group.n) {
        <section class="group" appReveal>
          <p class="kicker">{{ group.kicker }}</p>
          <h2>{{ group.title }}</h2>
          <div class="grid">
            @for (clip of group.clips; track clip.video.id + (clip.video.start ?? 0)) {
              <div class="item">
                <app-video [video]="clip.video" />
                @if (clip.stop; as stop) {
                  <a class="to-stop" [routerLink]="stop.link" [queryParams]="onMap">{{ stopLabel(stop) }}</a>
                }
              </div>
            }
          </div>
        </section>
      } @empty {
        <p class="status">{{ videos.isLoading() ? t().loading : '' }}</p>
      }
    </article>
  `,
  styles: `
    .watch-page {
      max-inline-size: 64rem;
      padding-block: 3rem 4rem;
    }
    .head {
      max-inline-size: 44rem;
      margin-block-end: 1rem;

      h1 {
        margin: 0.2rem 0 0.6rem;
        font-size: clamp(1.8rem, 5vw, 2.6rem);
      }
      p {
        margin: 0 0 0.6rem;
      }
    }
    .privacy {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .group {
      padding-block-start: 2.5rem;

      h2 {
        margin: 0 0 1rem;
        font-size: clamp(1.3rem, 3.5vw, 1.7rem);
      }
    }
    .kicker {
      margin: 0;
      color: var(--gold);
      font-size: 0.9rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
      gap: 1.25rem;
    }
    .item {
      display: grid;
      align-content: start;
      gap: 0.4rem;
      min-inline-size: 0;
    }
    .to-stop {
      display: inline-flex;
      align-items: center;
      min-block-size: 2.25rem;
      font-size: 0.9rem;
    }
  `,
})
export class Watch {
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  protected readonly videos = inject(VideosService);
  private readonly journey = inject(JourneyService);
  protected readonly text = WATCH_TEXT;
  protected readonly onMap = ON_MAP;

  /** The clips under their stages, in the journey's order; the page's language first in each. */
  protected readonly groups = computed<Group[]>(() => {
    const lang = this.language.lang();
    const stops = this.journey.stops();
    const groups = new Map<number, Group>();
    for (const video of this.videos.videos()) {
      const stop = stops.find((s) => video.stops.includes(s.slug));
      const n = stop?.stage ?? 99;
      if (!groups.has(n)) {
        const stage = stop ? this.journey.stage(stop.stage) : undefined;
        groups.set(n, {
          n,
          kicker: stage ? this.language.pick(stage.kicker) : '',
          title: stage ? this.language.pick(stage.title) : this.language.pick(this.text.title),
          clips: [],
        });
      }
      groups.get(n)!.clips.push({ video, stop });
    }
    const order = (c: Group['clips'][number]) => (c.stop?.index ?? 999) + (c.video.lang === lang ? 0 : 0.5);
    return [...groups.values()].sort((a, b) => a.n - b.n).map((g) => ({ ...g, clips: g.clips.sort((a, b) => order(a) - order(b)) }));
  });

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.language.pick(WATCH_TEXT.pageTitle)} | ${this.t().appTitle}`));
  }

  /** «الموضوع: لماذا خُلقنا؟» */
  protected stopLabel(stop: Stop): string {
    const name = stop.arabic && this.language.isArabic() ? stop.arabic : typeof stop.title === 'string' ? stop.title : this.language.pick(stop.title);
    return this.language.isArabic() ? `الموضوع: ${name}` : `Topic: ${name}`;
  }
}
