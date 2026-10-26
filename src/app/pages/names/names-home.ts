import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { DivineName } from '../../core/models/divine-name';
import { LanguageService } from '../../core/services/language.service';
import { NamesService } from '../../core/services/names.service';
import { ReadingService } from '../../core/services/reading.service';
import { matchesName } from '../../core/utils/search';
import { Ornament } from '../../shared/ornament';
import { ProgressRing } from '../../shared/progress-ring';
import { Reveal } from '../../shared/reveal';

/** The front page of the Beautiful Names section: the name of the day, search and every name. */
@Component({
  selector: 'app-names-home',
  imports: [RouterLink, Ornament, ProgressRing, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './names-home.html',
  styleUrl: './names-home.scss',
})
export class NamesHome {
  protected readonly names = inject(NamesService);
  protected readonly reading = inject(ReadingService);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;

  protected readonly query = signal('');
  protected readonly filtered = computed(() => this.names.names().filter((n) => matchesName(n, this.query())));

  protected readonly readCount = computed(() => this.reading.countRead(this.names.names().map((n) => n.slug)));
  protected readonly progress = computed(() => {
    const total = this.names.names().length;
    return total ? this.readCount() / total : 0;
  });

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.t().names.title} | ${this.t().appTitle}`));
  }

  /** The line under a name: its meaning once its page is written, else (in English) a gloss. */
  protected meaningOf(name: DivineName): string {
    if (name.content) return this.language.pick(name.content.meaning);
    return this.language.isArabic() ? '' : name.gloss;
  }

  protected isRead(name: DivineName): boolean {
    return this.reading.countRead([name.slug]) > 0;
  }
}
