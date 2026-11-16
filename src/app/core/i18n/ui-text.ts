import { Source } from '../models/ayah';
import { Lang } from '../models/lang';
import { Theme } from '../models/theme';

export interface UiText {
  appTitle: string;
  home: string;
  /** The site's two sections, in the header and footer. */
  signsSection: string;
  namesSection: string;
  allSigns: string;
  journey: string;
  method: string;
  nextSteps: string;
  themeLabel: string;
  themeNames: Record<Theme, string>;
  /** The language switch's label, for screen readers. */
  languageLabel: string;
  /** The link that skips the header, for keyboard users. */
  skipToContent: string;
  /** Names of the header's and footer's menus, for screen readers. */
  mainNav: string;
  footerNav: string;
  /** The footer's two columns of links. */
  footerExplore: string;
  footerAbout: string;
  /** Short labels for the tab bar at the bottom of a phone's screen. */
  journeyShort: string;
  namesShort: string;
  heroEyebrow: string;
  heroIntro: string;
  browseAll: string;
  /** The figures under the hero: «٣٨ معجزة · ٢٧ علامة للتفكر · ٩ مجالات · ٢٨٢ مصدرًا». */
  statMiracles: string;
  statReflection: string;
  statFields: string;
  statSources: string;
  continueReading: string;
  continueWhere: (title: string) => string;
  journeyTitle: string;
  /**
   * What the hero's fold «غير مسلم أو جديدٌ على الإسلام؟» holds. Kept short, like portal.lead: both
   * are on a phone's first screen, with the figures under the fold.
   */
  journeyIntro: (stops: string, minutes: string) => string;
  journeyStop: (n: string, total: string) => string;
  /** Labels that name one sign gloss it «(معجزة)» only when it isn't a sign for reflection. */
  ayahOfTheDay: (reflection: boolean) => string;
  readMore: string;
  categoriesTitle: string;
  categoriesIntro: string;
  /** A field's count: «٤ معجزات · ٥ علامات للتفكر». */
  fieldCount: (miracles: number, reflection: number) => string;
  /** The two lists: the miracles, and the signs for reflection («علامات تُظهر عظمة الخالق»). */
  miraclesTitle: string;
  miraclesIntro: string;
  reflectionTitle: string;
  reflectionIntro: string;
  /** The second list's name where space is short: «علامات للتفكر». */
  reflectionShort: string;
  /** The links to each part of a long page, for screen readers. */
  onThisPage: string;
  /** Under a list on a phone: «اعرض المزيد (بقي ٣٢)». */
  showMore: (left: string) => string;
  filterAll: string;
  filterLabel: string;
  /** The badge on a sign for reflection, and what it means (its tooltip). */
  reflectionBadge: string;
  reflectionHint: string;
  /** Each list's search box: its name for screen readers, from the list's title, and its examples. */
  searchLabel: (list: string) => string;
  searchPlaceholder: string;
  searchReflectionPlaceholder: string;
  noResults: string;
  loading: string;
  loadError: string;
  retry: string;
  /** «قرأت ٥ من ٢٠ آية». */
  progress: (read: string, total: string) => string;
  progressDone: string;
  resetAll: string;
  resetAllConfirm: string;
  resetAllYes: string;
  cancel: string;
  methodBandTitle: string;
  methodBandText: string;
  nextBandTitle: string;
  nextBandText: string;
  waqfNote: string;
  /** On every illustrative picture, and the footer's note about them. */
  illustrativeImage: string;
  imagesNote: string;
  minutes: (n: number) => string;
  textSize: string;
  /** The letter on the text-size buttons: «أ−» «أ+» / "A−" "A+". */
  sizeLetter: string;
  smaller: string;
  larger: string;
  share: string;
  shareText: (title: string) => string;
  linkCopied: string;
  sections: {
    evidence: string;
    then: string;
    now: string;
    nowHistory: string;
    timeline: string;
    didYouKnow: string;
    reflection: string;
    sources: string;
  };
  quranLabel: string;
  hadithLabel: string;
  sourceKinds: Record<Source['kind'], string>;
  opensNewTab: string;
  markRead: string;
  isRead: string;
  markUnread: string;
  nextUp: (reflection: boolean) => string;
  nextStop: string;
  journeyEndTitle: string;
  journeyEndText: string;
  previous: string;
  next: string;
  backToAll: string;
  notFound: string;
  listen: string;
  pause: string;
  resume: string;
  stop: string;
  noVoice: string;
  versesSkipped: string;
  /** The site's front page. */
  portal: {
    intro: string;
    /**
     * Under the title: what the site offers, in a sentence. Kept short (see journeyIntro); the
     * English one more than the Arabic, as its page also has the line «Know Allah».
     */
    lead: string;
    /**
     * Under it: what the site holds is a few of Allah's signs, not all of them, so a reader doesn't
     * take its signs and miracles for all there are.
     */
    notAll: string;
    startJourney: string;
    /** The questions that take turns in the hero's fold: each opens a stop of the journey. */
    questionLabel: string;
    questionOf: (n: string, total: string) => string;
    discover: string;
    /**
     * The button under them. It opens the first and leads through the rest one after another, so it
     * names them: the reader should know it goes through these same questions, not somewhere else.
     */
    answersInOrder: (count: number) => string;
    pauseQuestions: string;
    playQuestions: string;
    /** «١٠٧ أسماء» under the figures in the hero, and on the names' card. */
    statNames: (n: number) => string;
    questionsTitle: string;
    questionsIntro: string;
    readAnswer: string;
    /**
     * Folded sections: what each holds, said before it is opened. The journey's, on /signs, describes
     * its stops in ayat.json, in order; the questions' names the fields of the home page's questions.
     */
    journeySummary: (stops: string, minutes: string) => string;
    questionsSummary: (count: string) => string;
    forExample: string;
    showStops: string;
    showQuestions: string;
    /** What opens the hero's fold: the journey's questions, named by their count. */
    showJourney: (count: number) => string;
    hide: string;
    pathsTitle: string;
    signsTitle: string;
    signsBlurb: string;
    namesTitle: string;
    namesBlurb: string;
    enter: string;
    newHere: string;
    todayTitle: string;
    trustTitle: string;
    trust: { title: string; text: string }[];
    trustLink: string;
  };
  /** The Beautiful Names section. */
  names: {
    title: string;
    /** The small line over the section's title. */
    kicker: string;
    intro: string;
    /** «تصفّح الأسماء ١٠٧» / "Browse the 107 names", and a name at random. */
    browse: (count: number) => string;
    surprise: string;
    nameOfTheDay: string;
    readName: string;
    search: string;
    comingSoon: string;
    /** «قرأت ٥ من ١٠٧ أسماء». */
    progress: (read: number, total: number) => string;
    sections: { evidence: string; impact: string; dua: string };
    nextName: string;
    allNames: string;
  };
}

interface ArabicNoun {
  /** «اسم واحد», «اسمان»: said in full for one and two. */
  one: string;
  two: string;
  /** After 3–10: «أسماء». After 11–99: «اسمًا». After 100, 101, 102…: «اسم». */
  few: string;
  many: string;
  bare: string;
}

/** «٣ أسماء»، «١٥ اسمًا»، «١٠٧ أسماء»: the noun's form follows the number's last two digits. */
function arabicCount(n: number, noun: ArabicNoun): string {
  const lastTwo = n % 100;
  if (n === 1) return noun.one;
  if (n === 2) return noun.two;
  const form = lastTwo >= 3 && lastTwo <= 10 ? noun.few : lastTwo >= 11 ? noun.many : noun.bare;
  return `${toArabicDigits(n)} ${form}`;
}

/** A count from 3 to 10 in words, after a masculine plural: «الأجوبة السبعة». */
const ARABIC_THREE_TO_TEN = ['الثلاثة', 'الأربعة', 'الخمسة', 'الستة', 'السبعة', 'الثمانية', 'التسعة', 'العشرة'];

const NAME_NOUN: ArabicNoun = { one: 'اسم واحد', two: 'اسمان', few: 'أسماء', many: 'اسمًا', bare: 'اسم' };
const MIRACLE_NOUN: ArabicNoun = { one: 'معجزة واحدة', two: 'معجزتان', few: 'معجزات', many: 'معجزة', bare: 'معجزة' };
const REFLECTION_NOUN: ArabicNoun = {
  one: 'علامة واحدة للتفكر',
  two: 'علامتان للتفكر',
  few: 'علامات للتفكر',
  many: 'علامة للتفكر',
  bare: 'علامة للتفكر',
};

export const UI_TEXT: Record<Lang, UiText> = {
  ar: {
    appTitle: 'اعرف الله',
    home: 'الرئيسية',
    signsSection: 'الإعجاز',
    namesSection: 'الأسماء الحسنى',
    allSigns: 'الآيات',
    journey: 'ابدأ من هنا',
    method: 'منهجنا',
    nextSteps: 'ماذا بعد؟',
    themeLabel: 'لون الصفحات',
    themeNames: {
      night: 'ليلي',
      paper: 'ورقي',
      black: 'أسود',
      white: 'أبيض',
      blue: 'أزرق',
      navy: 'كحلي',
      pink: 'وردي',
    },
    languageLabel: 'اللغة',
    skipToContent: 'انتقل إلى المحتوى',
    mainNav: 'أقسام الموقع',
    footerNav: 'روابط الموقع',
    footerExplore: 'اكتشف',
    footerAbout: 'عن الموقع',
    journeyShort: 'ابدأ هنا',
    namesShort: 'الأسماء',
    heroEyebrow: 'آياتٌ في الآفاق وفي الأنفس',
    heroIntro:
      'نزل القرآن قبل أكثر من أربعة عشر قرنًا على نبيٍّ أُمّي، في صحراء لا مختبرات فيها ولا مراصد. ثم جاء العلم الحديث فكشف عن حقائق في الكون والأرض والبحار والإنسان، تتسق مع ما جاء فيه. هنا تقرأ هذه الآيات (المعجزات) واحدةً واحدة: النص، وما كان يعرفه الناس يومها، وما كشفه العلم، ومصادره الموثّقة — بأمانةٍ ودون مبالغة.',
    browseAll: 'تصفّح كل الآيات',
    statMiracles: 'معجزة',
    statReflection: 'علامة للتفكر',
    statFields: 'مجالات',
    statSources: 'مصدرًا علميًا',
    continueReading: 'تابع القراءة',
    continueWhere: (title) => `توقفت عند: ${title}`,
    journeyTitle: 'غير مسلم أو جديدٌ على الإسلام؟',
    journeyIntro: (stops, minutes) =>
      `رحلةٌ قصيرة في ${stops} محطات، مرتبة لمن يتعرف على الإسلام أول مرة، تُقرأ في نحو ${minutes} دقيقة.`,
    journeyStop: (n, total) => `المحطة ${n} من ${total}`,
    ayahOfTheDay: (reflection) => (reflection ? 'آية اليوم' : 'آية اليوم (معجزة اليوم)'),
    readMore: 'اقرأ المزيد',
    categoriesTitle: 'مجالات الآيات',
    categoriesIntro: 'من أعماق الكون إلى أعماق البحار، ومن خلق الإنسان إلى نبوءاتٍ تحققت.',
    fieldCount: (miracles, reflection) =>
      [miracles ? arabicCount(miracles, MIRACLE_NOUN) : '', reflection ? arabicCount(reflection, REFLECTION_NOUN) : '']
        .filter(Boolean)
        .join(' · '),
    miraclesTitle: 'المعجزات',
    miraclesIntro:
      'ما سبق به القرآن والسنة علمَ الناس، أو وصفاه بدقةٍ لم تتبيّن إلا بعد قرون، أو أخبرا به من غيبٍ فوقع كما أخبرا.',
    reflectionTitle: 'علامات تُظهر عظمة الخالق',
    reflectionIntro:
      'في خلق الكون والإنسان، وفي حكمة شرعه وسننه في الأمم. ليست إعجازًا: كان الناس يعرفونها يوم نزل الوحي، وهو يدعونا إلى التفكر فيها.',
    reflectionShort: 'علامات للتفكر',
    onThisPage: 'في هذه الصفحة',
    showMore: (left) => `اعرض المزيد (بقي ${left})`,
    filterAll: 'الكل',
    filterLabel: 'تصفية حسب المجال',
    reflectionBadge: 'للتفكر',
    reflectionHint: 'حقيقةٌ كان الناس يعرفونها يوم نزلت، نعرضها للتفكر لا على أنها إعجاز.',
    searchLabel: (list) => `ابحث في ${list}`,
    searchPlaceholder: 'ابحث: الجبال، الجنين، البحر…',
    searchReflectionPlaceholder: 'ابحث: الشمس، النجوم، الطير…',
    noResults: 'لا توجد نتائج مطابقة.',
    loading: 'جارٍ التحميل…',
    loadError: 'تعذّر تحميل المحتوى. تأكد من الإنترنت ثم حاول مرة أخرى.',
    retry: 'أعد المحاولة',
    progress: (read, total) => `قرأت ${read} من ${total} آية`,
    progressDone: 'ما شاء الله! أتممت قراءة الآيات كلها.',
    resetAll: 'إعادة ضبط',
    resetAllConfirm: 'مسح علامات القراءة كلها، والموضع الذي توقفت عنده؟',
    resetAllYes: 'نعم، امسحها',
    cancel: 'إلغاء',
    methodBandTitle: 'كيف نختار ما ننشره؟',
    methodBandText: 'لا ننشر إلا ما ثبت علميًا، ولا نلوي النص ليوافقه. تعرّف على منهجنا.',
    nextBandTitle: 'ماذا بعد؟',
    nextBandText: 'إن لامست هذه الآيات قلبك، فهذه خطوتك التالية.',
    waqfNote: 'هذا المشروع وقفٌ لله تعالى، وهو غير ربحي.',
    illustrativeImage: 'صورة تعبيرية',
    imagesNote: 'الصور في هذا الموقع صورٌ تعبيرية، وليست صورًا حقيقية للظواهر المذكورة.',
    minutes: (n) =>
      n === 1 ? 'دقيقة واحدة' : n === 2 ? 'دقيقتان' : `${toArabicDigits(n)} ${n <= 10 ? 'دقائق' : 'دقيقة'}`,
    textSize: 'حجم الخط',
    sizeLetter: 'أ',
    smaller: 'تصغير الخط',
    larger: 'تكبير الخط',
    share: 'مشاركة',
    shareText: (title) => `${title} — من موقع «اعرف الله»`,
    linkCopied: 'نُسخ الرابط',
    sections: {
      evidence: 'الدليل',
      then: 'قبل أربعة عشر قرنًا',
      now: 'ماذا كشف العلم؟',
      nowHistory: 'ماذا سجّل التاريخ؟',
      timeline: 'من الوحي إلى الاكتشاف',
      didYouKnow: 'هل تعلم؟',
      reflection: 'وقفة تأمل',
      sources: 'المصادر',
    },
    quranLabel: 'من القرآن الكريم',
    hadithLabel: 'من السنة النبوية',
    sourceKinds: {
      journal: 'مجلة علمية محكّمة',
      preprint: 'بحثٌ أولي غير محكّم',
      agency: 'جهة علمية رسمية',
      university: 'جامعة أو هيئة علمية',
      encyclopedia: 'مرجع',
      book: 'كتاب',
      news: 'خبرٌ علمي',
    },
    opensNewTab: '(يفتح في نافذة جديدة)',
    markRead: 'أتممت القراءة',
    isRead: 'تمّت القراءة',
    markUnread: 'إلغاء علامة القراءة',
    nextUp: (reflection) => (reflection ? 'الآية التالية' : 'الآية (المعجزة) التالية'),
    nextStop: 'المحطة التالية',
    journeyEndTitle: 'أتممت الرحلة',
    journeyEndText: 'شكرًا لأنك قرأت حتى هنا. اقرأ «ماذا بعد؟» لتعرف خطوتك التالية.',
    previous: 'السابق',
    next: 'التالي',
    backToAll: 'كل الآيات',
    notFound: 'لم يُعثر على هذه الصفحة.',
    listen: 'استمع',
    pause: 'إيقاف مؤقت',
    resume: 'متابعة',
    stop: 'إيقاف',
    noVoice: 'لا يتوفر صوت عربي على هذا الجهاز. يمكنك إضافته من إعدادات اللغة والكلام في جهازك.',
    versesSkipped: 'قراءة آلية؛ تُتخطّى الآيات القرآنية.',
    portal: {
      intro:
        'طريقان لمعرفة الله: آياته في الكون وفي أنفسنا، وأسماؤه الحسنى التي عرّفنا بها نفسه. ابدأ بأيهما شئت.',
      lead: 'آياتٌ في الكون وفي نفسك تدل على خالقها، وأسماءٌ حسنى عرّفنا الله بها نفسه: بأدلتها من القرآن والسنة، ومصادرها الموثّقة.',
      notAll:
        'وليس ما هنا كلَّ الآيات والمعجزات، بل هو قليلٌ من كثير: فآيات الله في القرآن والسنة، وفي الكون وفي أنفسنا، تُعدّ بالآلاف.',
      startJourney: 'ابدأ الرحلة',
      questionLabel: 'سؤالٌ يستحق التفكير',
      questionOf: (n, total) => `السؤال ${n} من ${total}`,
      discover: 'اكتشف الجواب',
      answersInOrder: (count) =>
        ARABIC_THREE_TO_TEN[count - 3]
          ? `اكتشف الأجوبة ${ARABIC_THREE_TO_TEN[count - 3]} بالترتيب`
          : 'اكتشف الأجوبة كلها بالترتيب',
      pauseQuestions: 'أوقف تبديل الأسئلة',
      playQuestions: 'تابع تبديل الأسئلة',
      statNames: (n) => arabicCount(n, NAME_NOUN).replace(/^[٠-٩]+ /, ''),
      questionsTitle: 'أسئلةٌ تستحق أن تتوقف عندها',
      questionsIntro: 'وراء كل سؤالٍ صفحةٌ تُقرأ في دقائق: النص، وما كان يعرفه الناس يوم نزل، وما كشفه العلم أو سجّله التاريخ، بمصادره.',
      readAnswer: 'اقرأ الجواب',
      journeySummary: (stops, minutes) =>
        `رحلةٌ في ${stops} محطات مرتّبة لمن يتعرف على الإسلام أول مرة، تُقرأ في نحو ${minutes} دقيقة: من الكون الذي يتسع، إلى ظلمات أعماق البحر، إلى أطوار الجنين وألم الحروق، إلى نبوءةٍ تحققت ووقايةٍ من الأوبئة، إلى كتابٍ حُفظ أربعة عشر قرنًا.`,
      questionsSummary: (count) =>
        `${count} أسئلة من الكون والأرض والبحار، ومن عالم الأحياء وخلق الإنسان والصحة، ومن نبوءاتٍ تحققت. وراء كل سؤالٍ صفحةٌ تُقرأ في دقائق: النص، وما كشفه العلم أو سجّله التاريخ، بمصادره.`,
      forExample: 'مثلًا:',
      showStops: 'اعرض المحطات',
      showQuestions: 'اعرض الأسئلة',
      showJourney: (count) =>
        ARABIC_THREE_TO_TEN[count - 3]
          ? `اعرض الأسئلة ${ARABIC_THREE_TO_TEN[count - 3]}`
          : 'اعرض الأسئلة',
      hide: 'إخفاء',
      pathsTitle: 'طريقان لمعرفة الله',
      signsTitle: 'الإعجاز في القرآن والسنة',
      signsBlurb:
        'معجزاتٌ تحدّث عنها القرآن والسنة قبل أربعة عشر قرنًا، وكشف العلم والتاريخ جانبًا منها، وعلاماتٌ تُظهر عظمة الخالق وتدعو إلى التفكر، بأدلتها ومصادرها.',
      namesTitle: 'أسماء الله الحسنى',
      namesBlurb: 'اسمًا اسمًا: معناه، ودليله من القرآن والسنة، وأثره في قلبك وحياتك، في دقائق.',
      enter: 'ادخل',
      newHere: 'جديدٌ على الإسلام؟ ابدأ الرحلة',
      todayTitle: 'كل يومٍ آيةٌ واسم',
      trustTitle: 'لماذا تثق بما تقرؤه هنا؟',
      trust: [
        { title: 'آياتٌ من المصحف', text: 'نُقلت الآيات بنصها من المصحف، ولم تُكتب من الذاكرة.' },
        { title: 'أحاديث بأرقامها', text: 'رُوجع كل حديثٍ في كتابه برقمه، وأحاديث الإعجاز كلها من صحيحي البخاري ومسلم.' },
        { title: 'كل معلومةٍ بمصدرها', text: 'كل معلومةٍ علمية مربوطةٌ بمصدرٍ فتحناه وتحققنا أنه يقولها.' },
      ],
      trustLink: 'تعرّف على منهجنا',
    },
    names: {
      title: 'أسماء الله الحسنى',
      kicker: 'تعرّف على ربك بأسمائه',
      browse: (count) => `تصفّح ${arabicCount(count, NAME_NOUN)}`,
      surprise: 'فاجئني باسم',
      intro:
        'عرّفنا الله بنفسه بأسمائه الحسنى. هنا تقرأ كل اسمٍ في دقائق: معناه، ودليله من القرآن والسنة، وأثره في حياتك، ودعاءً به.',
      nameOfTheDay: 'اسم اليوم',
      readName: 'اقرأ عن الاسم',
      search: 'ابحث عن اسم: الرحمن، الرزاق…',
      comingSoon: 'قريبًا',
      progress: (read, total) => `قرأت ${toArabicDigits(read)} من ${arabicCount(total, NAME_NOUN)}`,
      sections: { evidence: 'الأدلة', impact: 'أثره في حياتك', dua: 'دعاء' },
      nextName: 'الاسم التالي',
      allNames: 'كل الأسماء',
    },
  },
  en: {
    appTitle: 'Know Allah',
    home: 'Home',
    signsSection: 'Signs',
    namesSection: 'Beautiful Names',
    allSigns: 'Signs',
    journey: 'Start here',
    method: 'Our method',
    nextSteps: 'What next?',
    themeLabel: 'Page colour',
    themeNames: {
      night: 'Night',
      paper: 'Paper',
      black: 'Black',
      white: 'White',
      blue: 'Blue',
      navy: 'Dark blue',
      pink: 'Pink',
    },
    languageLabel: 'Language',
    skipToContent: 'Skip to content',
    mainNav: 'Sections',
    footerNav: 'Site links',
    footerExplore: 'Explore',
    footerAbout: 'About',
    journeyShort: 'Start here',
    namesShort: 'Names',
    heroEyebrow: 'Signs on the horizons and within themselves',
    heroIntro:
      'The Qur’an was revealed more than fourteen centuries ago to an unlettered Prophet, in a desert without laboratories or observatories. Modern science has since uncovered facts about the universe, the earth, the seas and the human body that sit remarkably well with what it says. Here you can read them one at a time: the text, what people knew back then, what science found, and the sources — honestly, and without exaggeration.',
    browseAll: 'Browse all the signs',
    statMiracles: 'miracles',
    statReflection: 'signs for reflection',
    statFields: 'fields',
    statSources: 'scientific sources',
    continueReading: 'Continue reading',
    continueWhere: (title) => `You stopped at: ${title}`,
    journeyTitle: 'Non-Muslim or new to Islam?',
    journeyIntro: (stops, minutes) =>
      `A ${minutes}-minute journey in ${stops} stops for anyone new to Islam.`,
    journeyStop: (n, total) => `Stop ${n} of ${total}`,
    ayahOfTheDay: (reflection) => (reflection ? 'Sign of the day' : 'Sign (miracle) of the day'),
    readMore: 'Read more',
    categoriesTitle: 'Fields',
    categoriesIntro: 'From the depths of space to the depths of the sea, from the making of a human being to prophecies that came true.',
    fieldCount: (miracles, reflection) =>
      [
        miracles ? `${miracles} ${miracles === 1 ? 'miracle' : 'miracles'}` : '',
        reflection ? `${reflection} ${reflection === 1 ? 'sign' : 'signs'} for reflection` : '',
      ]
        .filter(Boolean)
        .join(' · '),
    miraclesTitle: 'Miracles',
    miraclesIntro:
      'What the Qur’an and Sunnah told of before people knew it, or described with a precision that only became clear centuries later, or foretold before it came to pass.',
    reflectionTitle: 'Signs that show the Creator’s greatness',
    reflectionIntro:
      'In the making of the universe and of people, in the wisdom of His law, and in His ways with nations. They are not miracles: people already knew them when the revelation came, and it calls us to reflect on them.',
    reflectionShort: 'Signs for reflection',
    onThisPage: 'On this page',
    showMore: (left) => `Show more (${left} left)`,
    filterAll: 'All',
    filterLabel: 'Filter by field',
    reflectionBadge: 'For reflection',
    reflectionHint: 'Something people already knew when it was revealed, shown here to reflect on, not as a miracle.',
    searchLabel: (list) => `Search: ${list}`,
    searchPlaceholder: 'Search: mountains, embryo, sea…',
    searchReflectionPlaceholder: 'Search: sun, stars, birds…',
    noResults: 'Nothing matches.',
    loading: 'Loading…',
    loadError: 'Could not load the content. Check your connection and try again.',
    retry: 'Try again',
    progress: (read, total) => `You have read ${read} of ${total} signs`,
    progressDone: 'Masha’Allah! You have read every sign.',
    resetAll: 'Reset',
    resetAllConfirm: 'Clear every read mark, and where you stopped reading?',
    resetAllYes: 'Yes, clear them',
    cancel: 'Cancel',
    methodBandTitle: 'How do we choose what to publish?',
    methodBandText: 'Only established science, and never a verse bent to fit it. Read about our method.',
    nextBandTitle: 'What next?',
    nextBandText: 'If these signs have touched your heart, here is your next step.',
    waqfNote: 'This project is a waqf (an endowment for the sake of Allah) and is non-profit.',
    illustrativeImage: 'Illustrative image',
    imagesNote: 'The images on this site are illustrations, not real photographs of the phenomena described.',
    minutes: (n) => `${n} min`,
    textSize: 'Text size',
    sizeLetter: 'A',
    smaller: 'Smaller text',
    larger: 'Larger text',
    share: 'Share',
    shareText: (title) => `${title} — from “Know Allah”`,
    linkCopied: 'Link copied',
    sections: {
      evidence: 'The text',
      then: 'Fourteen centuries ago',
      now: 'What science found',
      nowHistory: 'What history records',
      timeline: 'From revelation to discovery',
      didYouKnow: 'Did you know?',
      reflection: 'A moment to reflect',
      sources: 'Sources',
    },
    quranLabel: 'From the Qur’an',
    hadithLabel: 'From the Sunnah',
    sourceKinds: {
      journal: 'Peer-reviewed journal',
      preprint: 'Preprint (not peer-reviewed)',
      agency: 'Scientific agency',
      university: 'University or learned body',
      encyclopedia: 'Reference work',
      book: 'Book',
      news: 'Science news',
    },
    opensNewTab: '(opens in a new tab)',
    markRead: 'I have finished reading',
    isRead: 'Finished reading',
    markUnread: 'Mark as unread',
    nextUp: (reflection) => (reflection ? 'Next sign' : 'Next sign (miracle)'),
    nextStop: 'Next stop',
    journeyEndTitle: 'You have finished the journey',
    journeyEndText: 'Thank you for reading this far. Read “What next?” to find your next step.',
    previous: 'Previous',
    next: 'Next',
    backToAll: 'All signs',
    notFound: 'This page could not be found.',
    listen: 'Listen',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    noVoice: 'No English voice is available on this device. You can add one in your device’s language and speech settings.',
    versesSkipped: 'Computer voice; Qur’an verses are skipped.',
    portal: {
      intro:
        'Two paths to knowing Allah: His signs in the universe and in ourselves, and the Beautiful Names by which He made Himself known. Start with either.',
      lead: 'Signs in the universe and within you that point to their Creator, and Allah’s Beautiful Names.',
      notAll:
        'What is here is not every sign and miracle, only a few of many: Allah’s signs, in the Qur’an and Sunnah, in the universe and in ourselves, number in the thousands.',
      startJourney: 'Start the journey',
      questionLabel: 'A question worth thinking about',
      questionOf: (n, total) => `Question ${n} of ${total}`,
      discover: 'Discover the answer',
      answersInOrder: (count) => `Discover all ${count} answers in order`,
      pauseQuestions: 'Stop changing the questions',
      playQuestions: 'Keep changing the questions',
      statNames: (n) => (n === 1 ? 'name' : 'names'),
      questionsTitle: 'Questions worth stopping for',
      questionsIntro: 'Behind each question is a page you can read in minutes: the text, what people knew when it came, what science found or history recorded, and the sources.',
      readAnswer: 'Read the answer',
      journeySummary: (stops, minutes) =>
        `A journey in ${stops} stops, arranged for anyone meeting Islam for the first time, about ${minutes} minutes of reading: from a universe that keeps expanding, to the darkness of the deep sea, the stages of the embryo and the pain of burns, a prophecy that came true and a rule against epidemics, and a book kept unchanged for fourteen centuries.`,
      questionsSummary: (count) =>
        `${count} questions from the cosmos, the earth and the seas, the living world, the human body and health, and prophecies that came true. Behind each is a page you can read in minutes: the text, what science found or history recorded, and the sources.`,
      forExample: 'For example:',
      showStops: 'Show the stops',
      showQuestions: 'Show the questions',
      showJourney: (count) => `Show the ${count} questions`,
      hide: 'Hide',
      pathsTitle: 'Two paths to knowing Allah',
      signsTitle: 'Signs in the Qur’an and Sunnah',
      signsBlurb:
        'Miracles the Qur’an and Sunnah spoke of fourteen centuries ago, on which science and history have since shed light, and signs that show the Creator’s greatness and call for reflection — with their evidence and sources.',
      namesTitle: 'The Beautiful Names of Allah',
      namesBlurb:
        'One name at a time: what it means, its evidence from the Qur’an and Sunnah, and what it does to your heart and life — in a few minutes.',
      enter: 'Enter',
      newHere: 'New to Islam? Start the journey',
      todayTitle: 'A sign and a name for every day',
      trustTitle: 'Why trust what you read here?',
      trust: [
        { title: 'Verses from the Mushaf', text: 'Every verse is copied from the text of the Mushaf, never typed from memory.' },
        { title: 'Hadith with their numbers', text: 'Every hadith was checked in its book, with its number; those in the signs are all from al-Bukhari and Muslim.' },
        { title: 'Every fact with its source', text: 'Every scientific claim links to a source we opened and checked.' },
      ],
      trustLink: 'Read our method',
    },
    names: {
      title: 'The Beautiful Names of Allah',
      kicker: 'Know your Lord by His names',
      browse: (count) => `Browse the ${count} names`,
      surprise: 'Surprise me',
      intro:
        'Allah made Himself known to us through His Beautiful Names. Here you can read each name in a few minutes: what it means, its evidence from the Qur’an and Sunnah, what it does in your life, and a supplication with it.',
      nameOfTheDay: 'Name of the day',
      readName: 'Read about this name',
      search: 'Search for a name: Ar-Rahman, Ar-Razzaq…',
      comingSoon: 'Coming soon',
      progress: (read, total) => `You have read ${read} of ${total} names`,
      sections: { evidence: 'Evidence', impact: 'In your life', dua: 'Supplication' },
      nextName: 'Next name',
      allNames: 'All names',
    },
  },
};

export function toArabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
}
