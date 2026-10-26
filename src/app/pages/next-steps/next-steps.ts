import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Localized } from '../../core/models/lang';
import { LanguageService } from '../../core/services/language.service';
import { Ornament } from '../../shared/ornament';
import { Reveal } from '../../shared/reveal';

interface Step {
  title: Localized;
  text: Localized;
  link?: { url: string; label: Localized };
}

const TEXT = {
  title: { ar: 'ماذا بعد؟', en: 'What next?' } as Localized,
  intro: {
    ar: 'إن كانت هذه الآيات قد حرّكت فيك سؤالًا أو يقينًا، فهذه الصفحة لك، أيًّا كان دينك.',
    en: 'If these signs have stirred a question or a certainty in you, this page is for you, whatever your faith.',
  } as Localized,
  seekerTitle: { ar: 'إن لم تكن مسلمًا', en: 'If you are not a Muslim' } as Localized,
  seekerIntro: {
    ar: 'الإسلام في كلمات: أن تؤمن بإلهٍ واحدٍ خالقٍ لا شريك له، وأن محمدًا ﷺ عبده ورسوله وخاتم الأنبياء، وأن القرآن كلام الله. وكلمة «الله» هي اسم الإله الواحد بالعربية، يقولها العرب المسيحيون أيضًا.',
    en: 'Islam in a few words: to believe in One God, the Creator, who has no partner; that Muhammad ﷺ is His servant and messenger, the last of the prophets; and that the Qur’an is the word of God. “Allah” is simply the Arabic word for the One God; Arab Christians use it too.',
  } as Localized,
  believerTitle: { ar: 'وإن كنت مسلمًا', en: 'And if you are a Muslim' } as Localized,
  believerText: {
    ar: 'هذه الآيات تزيد اليقين، لكن الإيمان لا يقوم على العلم التجريبي وحده: فهداية القرآن، وبيانه الذي تحدّى العرب، وسيرة النبي ﷺ، كلها دلائل أعظم. اقرأ، وتأمل، وشارك هذه الصفحات مع من تحب؛ فلعل كلمةً تصل إلى قلب.',
    en: 'These signs increase certainty, but faith does not rest on experimental science alone: the guidance of the Qur’an, the eloquence that challenged the Arabs, and the life of the Prophet ﷺ are greater proofs. Read, reflect, and share these pages with people you love; one word may reach a heart.',
  } as Localized,
  shahadaTitle: { ar: 'الشهادتان', en: 'The declaration of faith' } as Localized,
  shahadaMeaning: {
    ar: 'لا معبود بحقٍّ إلا الله، ومحمدٌ رسولُ الله. من قالها صادقًا مؤمنًا بمعناها دخل في الإسلام، ولا يحتاج ذلك إلى طقوسٍ أو وسيط؛ ويُستحب أن ينطق بها أمام بعض المسلمين في مسجد ليعينوه على ما بعدها.',
    en: '“I bear witness that there is no god but God, and I bear witness that Muhammad is the messenger of God.” Whoever says it sincerely, believing its meaning, has become a Muslim. No ceremony or intermediary is needed, though it is good to say it before a few Muslims at a mosque, who can help with what comes next.',
  } as Localized,
};

const STEPS: Step[] = [
  {
    title: { ar: 'اقرأ القرآن بنفسك', en: 'Read the Qur’an for yourself' },
    text: {
      ar: 'لا تكتفِ بما يُقال عنه. اقرأه، أو اقرأ ترجمةً لمعانيه بلغتك، ولو صفحةً كل يوم.',
      en: 'Don’t settle for what people say about it. Read it, or a translation of its meanings in your language, even a page a day.',
    },
    link: { url: 'https://quran.com', label: { ar: 'quran.com', en: 'quran.com' } },
  },
  {
    title: { ar: 'تعرّف على النبي ﷺ', en: 'Get to know the Prophet ﷺ' },
    text: {
      ar: 'سيرته وأحاديثه تُريك كيف عاش القرآن على الأرض: رحمته، وصدقه، وعدله.',
      en: 'His life and sayings show how the Qur’an was lived on earth: his mercy, his honesty and his justice.',
    },
    link: { url: 'https://sunnah.com', label: { ar: 'sunnah.com', en: 'sunnah.com' } },
  },
  {
    title: { ar: 'اسأل', en: 'Ask' },
    text: {
      ar: 'زر أقرب مسجد، أو اسأل صديقًا مسلمًا. لا سؤال محرج، والمسلمون يسعدون بمن يسأل.',
      en: 'Visit a local mosque, or ask a Muslim friend. No question is embarrassing, and Muslims are glad when someone asks.',
    },
  },
  {
    title: { ar: 'خذ وقتك', en: 'Take your time' },
    text: {
      ar: 'الإيمان قناعةٌ في القلب لا تُفرض. فكّر بهدوء، وادعُ الخالق أن يهديك إلى الحق، أيًّا كان.',
      en: 'Faith is a conviction of the heart; it cannot be forced. Think it through calmly, and ask the Creator to guide you to the truth, wherever it lies.',
    },
  },
];

@Component({
  selector: 'app-next-steps',
  imports: [RouterLink, Ornament, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="container text-page">
      <header>
        <p class="eyebrow">{{ t().appTitle }}</p>
        <h1>{{ language.pick(text.title) }}</h1>
        <p>{{ language.pick(text.intro) }}</p>
      </header>

      <div class="verse-box" appReveal>
        <p class="quran" lang="ar" dir="rtl">﴿لَآ إِكۡرَاهَ فِي ٱلدِّينِۖ قَد تَّبَيَّنَ ٱلرُّشۡدُ مِنَ ٱلۡغَيِّۚ﴾</p>
        @if (!language.isArabic()) {
          <p class="meaning">“There is no compulsion in religion; the right way has become clearly distinct from error.”</p>
        }
        <cite>{{ language.isArabic() ? 'البقرة: ٢٥٦' : 'Al-Baqarah 2:256' }}</cite>
      </div>

      <h2>{{ language.pick(text.seekerTitle) }}</h2>
      <p>{{ language.pick(text.seekerIntro) }}</p>

      <ol class="steps">
        @for (step of steps; track $index) {
          <li appReveal>
            <h3>{{ language.pick(step.title) }}</h3>
            <p>{{ language.pick(step.text) }}</p>
            @if (step.link; as link) {
              <a class="step-link" [href]="link.url" target="_blank" rel="noopener">
                {{ language.pick(link.label) }} ↗
                <span class="visually-hidden">{{ t().opensNewTab }}</span>
              </a>
            }
          </li>
        }
      </ol>

      <section class="panel shahada" appReveal>
        <app-ornament />
        <h2>{{ language.pick(text.shahadaTitle) }}</h2>
        <p class="shahada-ar" lang="ar" dir="rtl">أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللهِ</p>
        <p>{{ language.pick(text.shahadaMeaning) }}</p>
      </section>

      <h2>{{ language.pick(text.believerTitle) }}</h2>
      <p>{{ language.pick(text.believerText) }}</p>

      <p class="actions">
        <a class="btn solid" routerLink="/signs" fragment="all">{{ t().browseAll }}</a>
      </p>
    </article>
  `,
  styles: `
    .step-link {
      display: inline-flex;
      align-items: center;
      min-block-size: 2.5rem;
      font-family: var(--font-body-en);
    }
    .shahada {
      margin-block-start: 2.5rem;
      text-align: center;

      h2 {
        margin-block-start: 1rem;
      }
    }
    .shahada-ar {
      margin: 0.5rem 0 1rem;
      color: var(--verse);
      font-family: var(--font-quran);
      font-size: clamp(1.4rem, 4.5vw, 1.9rem);
      line-height: 2.2;
    }
    .actions {
      margin: 2.5rem 0 0;
      text-align: center;
    }
  `,
})
export class NextSteps {
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  protected readonly text = TEXT;
  protected readonly steps = STEPS;

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.language.pick(TEXT.title)} | ${this.t().appTitle}`));
  }
}
