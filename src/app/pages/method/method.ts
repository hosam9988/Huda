import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Localized } from '../../core/models/lang';
import { LanguageService } from '../../core/services/language.service';
import { Ornament } from '../../shared/ornament';
import { Reveal } from '../../shared/reveal';

interface Principle {
  title: Localized;
  text: Localized;
}

const INTRO: Localized = {
  ar: 'القرآن كتاب هداية، لا كتاب فيزياء ولا طب. لكنه يدعو الإنسان مرةً بعد مرة إلى النظر في السماوات والأرض وفي نفسه. فإذا ثبتت حقيقةٌ علمية، ووافقت ما تدل عليه الآية بلغتها، كان ذلك آيةً تدعو إلى التأمل. أما الاستدلال المتكلَّف فيضر ولا ينفع؛ ولذلك التزمنا هذه المبادئ.',
  en: 'The Qur’an is a book of guidance, not a textbook of physics or medicine. Yet again and again it calls on people to look at the heavens, the earth and themselves. When a fact is firmly established, and what a verse says in its own language agrees with it, that is a sign worth reflecting on. A forced link does more harm than good, which is why we hold to these principles.',
};

const PRINCIPLES: Principle[] = [
  {
    title: { ar: 'الحقائق الثابتة لا النظريات المتغيرة', en: 'Established facts, not passing theories' },
    text: {
      ar: 'لا نذكر إلا ما استقر عليه العلم وأجمع عليه المختصون، ولا نربط آيةً بفرضيةٍ قد تتغير غدًا.',
      en: 'We only cite what science has settled and specialists agree on. We never tie a verse to a hypothesis that may change tomorrow.',
    },
  },
  {
    title: { ar: 'لا نلوي النص', en: 'We do not bend the text' },
    text: {
      ar: 'يجب أن تحتمل ألفاظ الآية المعنى بلغة العرب التي نزل بها القرآن. ونذكر ما قاله المفسرون الأوائل، ونبيّن متى يكون الربط بالعلم الحديث فهمًا معاصرًا محتملًا لا تفسيرًا قطعيًا.',
      en: 'The words of the verse must carry the meaning in the Arabic the Qur’an was revealed in. We mention what the early commentators said, and make clear when a link to modern science is a possible modern reading rather than a definitive explanation.',
    },
  },
  {
    title: { ar: 'نصوصٌ موثّقة', en: 'Verified texts' },
    text: {
      ar: 'نُقلت الآيات بنصها من المصحف برواية حفص عن عاصم، ولم تُكتب من الذاكرة، وترجمتها الإنجليزية ترجمة «صحيح إنترناشونال» (Saheeh International). وأحاديث قسم الإعجاز كلها من الصحيحين، بأرقامها. وفي قسم الأسماء الحسنى نذكر ما في الصحيحين، وما صحّحه أو حسّنه أهل العلم من غيرهما مع ذكر الحكم ومن قاله، وتركنا ما اختُلف في ثبوته.',
      en: 'Every verse is copied from the text of the Mushaf (the reading of Hafs from ‘Asim), never typed from memory, and its English translation is Saheeh International’s. Every hadith in the Signs section is from the two Sahihs, al-Bukhari and Muslim, with its number. In the Beautiful Names section we also cite hadith from other collections that scholars graded sahih or hasan, giving the grading and who gave it, and we left out any whose authenticity is disputed.',
    },
  },
  {
    title: { ar: 'مصادر يمكنك التحقق منها', en: 'Sources you can check' },
    text: {
      ar: 'في صفحة كل آيةٍ روابط إلى مجلاتٍ علمية محكّمة، ووكالاتٍ مثل ناسا والإدارة الوطنية للمحيطات والغلاف الجوي الأمريكية، وجامعاتٍ وموسوعات، وفي صفحة كل نبوءةٍ روابط إلى كتب التاريخ وشروح الحديث التي سجّلت تحقّقها. لا تأخذ كلامنا على الثقة: افتح المصدر واقرأ.',
      en: 'Every sign’s page links to peer-reviewed journals, agencies such as NASA and NOAA, universities and encyclopaedias, and every prophecy’s page to the histories and hadith commentaries that recorded its fulfilment. Don’t take our word for it: open the source and read it.',
    },
  },
  {
    title: { ar: 'أمانةٌ في الحدود', en: 'Honest about the limits' },
    text: {
      ar: 'في آخر صفحة كل آيةٍ فقرة «بأمانةٍ علمية» تبيّن حدود الاستدلال، وما اختلف فيه العلماء، وما لا يصح أن يُقال.',
      en: 'Each sign’s page ends with an “In all honesty” note on how far the link goes, where scholars differ, and what should not be claimed.',
    },
  },
  {
    title: { ar: 'آياتٌ للتفكر', en: 'Signs for reflection' },
    text: {
      ar: 'على بعض الآيات علامة «للتفكر»: ما تذكره حقٌّ ظاهر، لكن الناس كانوا يعرفونه يوم نزل، فلا نعرضه إعجازًا. نذكر ما عرفوه يومئذٍ وما نعرفه اليوم، لنتفكر في خلق الله ورحمته، ولا ندّعي أن العلم كشف ما لم يكن معروفًا.',
      en: 'Some signs carry the “For reflection” badge: what they say is true and plain, but people already knew it when it was revealed, so we do not present it as a miracle. We set out what was known then and what we know now, to reflect on Allah’s creation and mercy — never to claim that science uncovered something unknown.',
    },
  },
  {
    title: { ar: 'ما استبعدناه عمدًا', en: 'What we left out on purpose' },
    text: {
      ar: 'استبعدنا ادعاءاتٍ منتشرة لا تثبت، مثل قصة رائد الفضاء الذي «سمع الأذان على القمر»، والاستدلال بأحاديث ضعيفة أو موضوعة، و«الإعجاز العددي» القائم على عدٍّ انتقائي. الحق لا يحتاج إلى باطلٍ ينصره.',
      en: 'We left out popular claims that do not hold up, such as the astronaut who supposedly “heard the call to prayer on the Moon”, arguments built on weak or fabricated hadith, and “numerical miracles” built on selective counting. The truth needs no falsehood to support it.',
    },
  },
  {
    title: { ar: 'إن أخطأنا فالخطأ منا', en: 'If we are wrong, the mistake is ours' },
    text: {
      ar: 'صدق القرآن لا يتوقف على فهمنا. فإن تبيّن خطأ ربطٍ من هذه الروابط، فالخطأ في فهمنا نحن، لا في كلام الله.',
      en: 'The truth of the Qur’an does not depend on our understanding. If one of these links turns out to be mistaken, the mistake is in our understanding, not in the word of Allah.',
    },
  },
];

@Component({
  selector: 'app-method',
  imports: [RouterLink, Ornament, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="container text-page">
      <header>
        <p class="eyebrow">{{ t().method }}</p>
        <h1>{{ t().methodBandTitle }}</h1>
        <p>{{ language.pick(intro) }}</p>
      </header>

      <div class="verse-box" appReveal>
        <p class="quran" lang="ar" dir="rtl">
          ﴿إِنَّ فِي خَلۡقِ ٱلسَّمَٰوَٰتِ وَٱلۡأَرۡضِ وَٱخۡتِلَٰفِ ٱلَّيۡلِ وَٱلنَّهَارِ لَأٓيَٰتࣲ لِّأُوْلِي ٱلۡأَلۡبَٰبِ﴾
        </p>
        @if (!language.isArabic()) {
          <p class="meaning">
            “In the creation of the heavens and the earth, and the alternation of night and day, there are
            signs for people of understanding.”
          </p>
        }
        <cite>{{ language.isArabic() ? 'آل عمران: ١٩٠' : 'Al ‘Imran 3:190' }}</cite>
      </div>

      <ol class="steps">
        @for (p of principles; track $index) {
          <li appReveal>
            <h3>{{ language.pick(p.title) }}</h3>
            <p>{{ language.pick(p.text) }}</p>
          </li>
        }
      </ol>

      <app-ornament class="end" />
      <p class="actions">
        <a class="btn solid" routerLink="/signs" fragment="all">{{ t().browseAll }}</a>
      </p>
    </article>
  `,
  styles: `
    .end {
      margin-block-start: 3rem;
    }
    .actions {
      margin: 1.5rem 0 0;
      text-align: center;
    }
  `,
})
export class Method {
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  protected readonly intro = INTRO;
  protected readonly principles = PRINCIPLES;

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.t().method} | ${this.t().appTitle}`));
  }
}
