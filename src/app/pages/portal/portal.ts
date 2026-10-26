import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { NamesService } from '../../core/services/names.service';
import { artSmallSrc, artSrcset } from '../../core/utils/art';
import { Reveal } from '../../shared/reveal';

/** The site's front page: the way into its two sections, and today's sign and name. */
@Component({
  selector: 'app-portal',
  imports: [RouterLink, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal.html',
  styleUrl: './portal.scss',
})
export class Portal {
  protected readonly content = inject(ContentService);
  protected readonly names = inject(NamesService);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  protected readonly artSmallSrc = artSmallSrc;
  protected readonly artSrcset = artSrcset;

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(this.language.isArabic() ? 'اعرف الله' : `${this.t().appTitle} · اعرف الله`));
  }
}
