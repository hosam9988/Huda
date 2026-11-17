import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Lang, Localized } from '../core/models/lang';
import { Video } from '../core/models/video';
import { LanguageService } from '../core/services/language.service';
import { VideosService } from '../core/services/videos.service';

/** The words of «شاهد», in both languages. */
export const WATCH_TEXT = {
  title: { ar: 'شاهد', en: 'Watch' } as Localized,
  pageTitle: { ar: 'شاهد: مقاطع مختارة', en: 'Watch: chosen clips' } as Localized,
  pageIntro: {
    ar: 'مقاطع قصيرة لعلماء ودعاة معروفين، تجيب عن أسئلة الرحلة بالصوت والصورة. اخترناها مقطعًا مقطعًا، وقرأنا ما يُقال في كلٍّ منها قبل أن نضعه هنا؛ فإن وجدنا فيه ما يحتاج إلى تصحيح كتبنا ملاحظتنا تحته.',
    en: 'Short clips by well-known scholars and speakers that answer the journey’s questions in sound and picture. We chose them one by one and read what is said in each before putting it here; where something needs correcting, our note is under the clip.',
  } as Localized,
  privacy: {
    ar: 'لا يُحمَّل شيءٌ من يوتيوب حتى تضغط زر التشغيل، ويُشغَّل المقطع من النطاق الذي لا يحفظ ملفات تعريف الارتباط. أما الإعلانات والاقتراحات في آخر المقطع فمن يوتيوب، لا منّا.',
    en: 'Nothing loads from YouTube until you press play, and clips play from its domain that does not keep cookies. Any ads, and the suggestions at the end of a clip, come from YouTube, not from us.',
  } as Localized,
  here: {
    ar: 'للمحطة نفسها، بصوت عالمٍ أو داعية.',
    en: 'The same stop, in a scholar’s or speaker’s voice.',
  } as Localized,
  play: { ar: 'شغّل', en: 'Play' } as Localized,
  onYoutube: { ar: 'على يوتيوب', en: 'On YouTube' } as Localized,
  siteNote: { ar: 'ملاحظة الموقع', en: 'A note from the site' } as Localized,
  inArabic: { ar: 'بالعربية', en: 'In Arabic' } as Localized,
  inEnglish: { ar: 'بالإنجليزية', en: 'In English' } as Localized,
  partOf: { ar: 'جزءٌ من مقطعٍ أطول', en: 'Part of a longer video' } as Localized,
};

const ID = /^[\w-]{11}$/;

/** «٤:٢٠» */
export function clipLength(seconds: number, number: (v: string) => string): string {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return number(`${m}:${s}`);
}

/**
 * A clip: a card with the speaker, title and length, which becomes the YouTube player (from
 * youtube-nocookie.com) only when pressed, so the page loads nothing from YouTube until then.
 */
@Component({
  selector: 'app-video',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let v = video();
    <figure class="clip">
      @if (playing() && src(); as url) {
        <div class="frame">
          <iframe
            [src]="url"
            [title]="language.pick(v.title)"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      } @else {
        <button type="button" class="cover" (click)="playing.set(true)" [attr.aria-label]="language.pick(text.play) + ': ' + language.pick(v.title)">
          <span class="cover-top">
            <span class="speaker">{{ language.pick(v.speaker) }}</span>
            @if (v.lang !== language.lang()) {
              <span class="chip lang-chip">{{ language.pick(v.lang === 'ar' ? text.inArabic : text.inEnglish) }}</span>
            }
          </span>
          <span class="cover-title" [attr.lang]="language.lang()">{{ language.pick(v.title) }}</span>
          <span class="cover-foot">
            <span class="play" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg>
            </span>
            <span class="length">{{ length() }}</span>
          </span>
        </button>
      }
      <figcaption>
        <p class="about">{{ language.pick(v.about) }}</p>
        @if (v.note) {
          <p class="note"><strong>{{ language.pick(text.siteNote) }}:</strong> {{ language.pick(v.note) }}</p>
        }
        <a class="out" [href]="'https://www.youtube.com/watch?v=' + v.id + (v.start ? '&t=' + v.start + 's' : '')" target="_blank" rel="noopener">
          {{ language.pick(text.onYoutube) }} ↗
          @if (v.start || v.end) {
            <span class="part">{{ language.pick(text.partOf) }}</span>
          }
        </a>
      </figcaption>
    </figure>
  `,
  styles: `
    :host {
      display: block;
    }
    .clip {
      margin: 0;
      overflow: hidden;
      border: 1px solid var(--line-strong);
      border-radius: var(--radius-lg);
      background: linear-gradient(180deg, var(--surface-raised), var(--surface));
    }
    .cover,
    .frame {
      display: block;
      inline-size: 100%;
      aspect-ratio: 16 / 9;
    }
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.5rem;
      padding: clamp(1rem, 4vw, 1.5rem);
      border: 0;
      background:
        radial-gradient(ellipse 80% 70% at 50% 110%, rgb(var(--accent-rgb) / 28%), transparent 70%),
        radial-gradient(ellipse 60% 60% at 15% 0%, rgb(125 226 209 / 10%), transparent 70%),
        #0a0f24;
      color: #f4f1e8;
      text-align: start;
      cursor: pointer;
    }
    .cover:hover .play,
    .cover:focus-visible .play {
      transform: scale(1.08);
    }
    .cover-top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.4rem;
    }
    .speaker {
      color: #f0d68e;
      font-family: var(--font-display-en);
      font-size: 0.92rem;
      font-weight: 600;
    }
    :host-context([lang='ar']) .speaker {
      font-family: var(--font-display-ar);
    }
    .lang-chip {
      border-color: rgb(240 214 142 / 45%);
      color: #f0d68e;
    }
    .cover-title {
      font-family: var(--font-display-en);
      font-size: clamp(1.1rem, 4vw, 1.45rem);
      font-weight: 600;
      line-height: 1.45;
      text-wrap: balance;
    }
    :host-context([lang='ar']) .cover-title {
      font-family: var(--font-display-ar);
      line-height: 1.7;
    }
    .cover-foot {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .play {
      display: grid;
      place-items: center;
      inline-size: 3.25rem;
      block-size: 3.25rem;
      border-radius: 50%;
      background: var(--gold-gradient);
      transition: transform 0.25s var(--ease);

      svg {
        inline-size: 1.4rem;
        block-size: 1.4rem;
        fill: var(--on-accent);
      }
    }
    .length {
      font-family: var(--font-display-en);
      font-size: 0.9rem;
      opacity: 0.85;
    }
    .frame iframe {
      inline-size: 100%;
      block-size: 100%;
      border: 0;
    }
    figcaption {
      display: grid;
      gap: 0.4rem;
      padding: 0.9rem 1.1rem 1rem;
      font-size: 0.95rem;
    }
    .about,
    .note {
      margin: 0;
    }
    .note {
      padding: 0.55rem 0.75rem;
      border-inline-start: 3px solid var(--gold);
      border-radius: 6px;
      background: rgb(var(--accent-rgb) / 8%);
    }
    .out {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      min-block-size: 2.25rem;
      font-size: 0.88rem;
    }
    .part {
      color: var(--text-muted);
    }
  `,
})
export class VideoCard {
  readonly video = input.required<Video>();

  protected readonly language = inject(LanguageService);
  protected readonly text = WATCH_TEXT;
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly playing = signal(false);
  protected readonly length = computed(() => clipLength(this.video().seconds, (v) => this.language.number(v)));

  /** The player's address: youtube-nocookie.com, playing at once, within the part shown. */
  protected readonly src = computed<SafeResourceUrl | null>(() => {
    const v = this.video();
    if (!ID.test(v.id)) return null;
    const query = new URLSearchParams({ autoplay: '1', rel: '0', hl: this.language.lang() });
    if (v.start) query.set('start', String(v.start));
    if (v.end) query.set('end', String(v.end));
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${v.id}?${query}`);
  });
}

/** «شاهد» on a page of the journey: the clips chosen for it, if any. */
@Component({
  selector: 'app-watch-here',
  imports: [VideoCard, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (videos().length) {
      <section class="watch" id="watch">
        <h2 class="eyebrow" tabindex="-1">{{ language.pick(text.title) }}</h2>
        <p class="line">{{ language.pick(text.here) }} <a routerLink="/watch">{{ language.pick(text.pageTitle) }}</a></p>
        <div class="list">
          @for (v of videos(); track v.id + (v.start ?? 0)) {
            <app-video [video]="v" />
          }
        </div>
      </section>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .watch {
      padding-block-start: 3rem;
      font-size: 1rem;
    }
    .eyebrow {
      margin: 0 0 0.3rem;
      color: var(--gold);
      font-size: 0.95rem;
    }
    .line {
      margin: 0 0 1rem;
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .list {
      display: grid;
      gap: 1.25rem;
    }
  `,
})
export class WatchHere {
  /** The page's slug (a sign's, a name's or a topic's). */
  readonly slug = input.required<string>();

  protected readonly language = inject(LanguageService);
  protected readonly text = WATCH_TEXT;
  private readonly service = inject(VideosService);
  protected readonly videos = computed(() => this.service.on(this.slug(), this.language.lang() as Lang));
}
