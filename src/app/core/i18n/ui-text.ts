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
  heroEyebrow: string;
  heroIntro: string;
  startJourney: string;
  browseAll: string;
  /** The figures under the hero: «٢٠ آية · ٧ مجالات · ٦٠ مصدرًا». */
  statSigns: string;
  statFields: string;
  statSources: string;
  continueReading: string;
  continueWhere: (title: string) => string;
  journeyEyebrow: string;
  journeyTitle: string;
  journeyIntro: (stops: string, minutes: string) => string;
  journeyStop: (n: string, total: string) => string;
  ayahOfTheDay: string;
  readMore: string;
  categoriesTitle: string;
  categoriesIntro: string;
  signsCount: (n: number) => string;
  allTitle: string;
  allIntro: string;
  filterAll: string;
  filterLabel: string;
  /** The second filter row: every sign, the signs of i'jaz, or the signs for reflection. */
  kindLabel: string;
  kindIjaz: string;
  /** The badge on a sign for reflection, and what it means (its tooltip). */
  reflectionBadge: string;
  reflectionHint: string;
  searchPlaceholder: string;
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
    caution: string;
    sources: string;
  };
  quranLabel: string;
  hadithLabel: string;
  sourceKinds: Record<Source['kind'], string>;
  opensNewTab: string;
  markRead: string;
  isRead: string;
  markUnread: string;
  nextUp: string;
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
  /** The site's front page: the two sections. */
  portal: {
    intro: string;
    signsTitle: string;
    signsBlurb: string;
    namesTitle: string;
    namesBlurb: string;
    enter: string;
    newHere: string;
  };
  /** The Beautiful Names section. */
  names: {
    title: string;
    intro: string;
    nameOfTheDay: string;
    readName: string;
    search: string;
    comingSoon: string;
    /** «قرأت ٥ من ١٠٧ أسماء». */
    progress: (read: number, total: number) => string;
    sections: { evidence: string; impact: string; dua: string };
    /** Under every name's page: where its explanation comes from. */
    sourceNote: string;
    sourceLink: string;
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

const NAME_NOUN: ArabicNoun = { one: 'اسم واحد', two: 'اسمان', few: 'أسماء', many: 'اسمًا', bare: 'اسم' };

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
    heroEyebrow: 'آياتٌ في الآفاق وفي الأنفس',
    heroIntro:
      'نزل القرآن قبل أكثر من أربعة عشر قرنًا على نبيٍّ أُمّي، في صحراء لا مختبرات فيها ولا مراصد. ثم جاء العلم الحديث فكشف عن حقائق في الكون والأرض والبحار والإنسان، تتسق مع ما جاء فيه. هنا تقرأ هذه الآيات واحدةً واحدة: النص، وما كان يعرفه الناس يومها، وما كشفه العلم، ومصادره الموثّقة — بأمانةٍ ودون مبالغة.',
    startJourney: 'ابدأ الرحلة',
    browseAll: 'تصفّح كل الآيات',
    statSigns: 'آية',
    statFields: 'مجالات',
    statSources: 'مصدرًا علميًا',
    continueReading: 'تابع القراءة',
    continueWhere: (title) => `توقفت عند: ${title}`,
    journeyEyebrow: 'جديدٌ على الإسلام؟',
    journeyTitle: 'ابدأ من هنا',
    journeyIntro: (stops, minutes) =>
      `رحلةٌ قصيرة في ${stops} محطات، مرتبة لمن يتعرف على الإسلام أول مرة، تُقرأ في نحو ${minutes} دقيقة.`,
    journeyStop: (n, total) => `المحطة ${n} من ${total}`,
    ayahOfTheDay: 'آية اليوم',
    readMore: 'اقرأ المزيد',
    categoriesTitle: 'مجالات الآيات',
    categoriesIntro: 'من أعماق الكون إلى أعماق البحار، ومن خلق الإنسان إلى نبوءاتٍ تحققت.',
    signsCount: (n) =>
      n === 1 ? 'آية واحدة' : n === 2 ? 'آيتان' : `${toArabicDigits(n)} ${n <= 10 ? 'آيات' : 'آية'}`,
    allTitle: 'كل الآيات',
    allIntro: 'اختر مجالًا، أو ابحث بكلمة.',
    filterAll: 'الكل',
    filterLabel: 'تصفية حسب المجال',
    kindLabel: 'تصفية حسب النوع',
    kindIjaz: 'إعجاز',
    reflectionBadge: 'للتفكر',
    reflectionHint: 'حقيقةٌ كان الناس يعرفونها يوم نزلت، نعرضها للتفكر لا على أنها إعجاز.',
    searchPlaceholder: 'ابحث: الجبال، الجنين، البحر…',
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
    methodBandText: 'لا ننشر إلا ما ثبت علميًا، ونذكر حدود كل استدلال بأمانة. تعرّف على منهجنا.',
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
      caution: 'بأمانةٍ علمية',
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
    nextUp: 'الآية التالية',
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
      signsTitle: 'الإعجاز في القرآن والسنة',
      signsBlurb:
        'آياتٌ تحدّث عنها القرآن والسنة قبل أربعة عشر قرنًا، وكشف العلم جانبًا منها، بأدلتها ومصادرها.',
      namesTitle: 'أسماء الله الحسنى',
      namesBlurb: 'اسمًا اسمًا: معناه، ودليله من القرآن والسنة، وأثره في قلبك وحياتك، في دقائق.',
      enter: 'ادخل',
      newHere: 'جديدٌ على الإسلام؟ ابدأ الرحلة',
    },
    names: {
      title: 'أسماء الله الحسنى',
      intro:
        'عرّفنا الله بنفسه بأسمائه الحسنى. هنا تقرأ كل اسمٍ في دقائق: معناه، ودليله من القرآن والسنة، وأثره في حياتك، ودعاءً به.',
      nameOfTheDay: 'اسم اليوم',
      readName: 'اقرأ عن الاسم',
      search: 'ابحث عن اسم: الرحمن، الرزاق…',
      comingSoon: 'قريبًا',
      progress: (read, total) => `قرأت ${toArabicDigits(read)} من ${arabicCount(total, NAME_NOUN)}`,
      sections: { evidence: 'الأدلة', impact: 'أثره في حياتك', dua: 'دعاء' },
      sourceNote:
        'الشرح مختصرٌ بتصرّف، ومستفادٌ من كتاب «فقه الأسماء الحسنى» للشيخ عبد الرزاق بن عبد المحسن البدر.',
      sourceLink: 'موقع الشيخ',
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
    heroEyebrow: 'Signs on the horizons and within themselves',
    heroIntro:
      'The Qur’an was revealed more than fourteen centuries ago to an unlettered Prophet, in a desert without laboratories or observatories. Modern science has since uncovered facts about the universe, the earth, the seas and the human body that sit remarkably well with what it says. Here you can read them one at a time: the text, what people knew back then, what science found, and the sources — honestly, and without exaggeration.',
    startJourney: 'Start the journey',
    browseAll: 'Browse all the signs',
    statSigns: 'signs',
    statFields: 'fields',
    statSources: 'scientific sources',
    continueReading: 'Continue reading',
    continueWhere: (title) => `You stopped at: ${title}`,
    journeyEyebrow: 'New to Islam?',
    journeyTitle: 'Start here',
    journeyIntro: (stops, minutes) =>
      `A short journey in ${stops} stops, arranged for anyone meeting Islam for the first time. About ${minutes} minutes of reading.`,
    journeyStop: (n, total) => `Stop ${n} of ${total}`,
    ayahOfTheDay: 'Sign of the day',
    readMore: 'Read more',
    categoriesTitle: 'Fields',
    categoriesIntro: 'From the depths of space to the depths of the sea, from the making of a human being to prophecies that came true.',
    signsCount: (n) => (n === 1 ? '1 sign' : `${n} signs`),
    allTitle: 'All the signs',
    allIntro: 'Choose a field, or search for a word.',
    filterAll: 'All',
    filterLabel: 'Filter by field',
    kindLabel: 'Filter by kind',
    kindIjaz: 'Miraculous signs',
    reflectionBadge: 'For reflection',
    reflectionHint: 'Something people already knew when it was revealed, shown here to reflect on, not as a miracle.',
    searchPlaceholder: 'Search: mountains, embryo, sea…',
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
    methodBandText: 'Only established science, and an honest note on the limits of every link we draw. Read about our method.',
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
      caution: 'In all honesty',
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
    nextUp: 'Next sign',
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
      signsTitle: 'Signs in the Qur’an and Sunnah',
      signsBlurb:
        'Signs the Qur’an and Sunnah spoke of fourteen centuries ago, on which science has since shed light — with their evidence and sources.',
      namesTitle: 'The Beautiful Names of Allah',
      namesBlurb:
        'One name at a time: what it means, its evidence from the Qur’an and Sunnah, and what it does to your heart and life — in a few minutes.',
      enter: 'Enter',
      newHere: 'New to Islam? Start the journey',
    },
    names: {
      title: 'The Beautiful Names of Allah',
      intro:
        'Allah made Himself known to us through His Beautiful Names. Here you can read each name in a few minutes: what it means, its evidence from the Qur’an and Sunnah, what it does in your life, and a supplication with it.',
      nameOfTheDay: 'Name of the day',
      readName: 'Read about this name',
      search: 'Search for a name: Ar-Rahman, Ar-Razzaq…',
      comingSoon: 'Coming soon',
      progress: (read, total) => `You have read ${read} of ${total} names`,
      sections: { evidence: 'Evidence', impact: 'In your life', dua: 'Supplication' },
      sourceNote:
        'The explanations are summarised in our own words from «Fiqh al-Asmaʾ al-Husna» by Shaykh ʿAbd al-Razzaq ibn ʿAbd al-Muhsin al-Badr.',
      sourceLink: 'The Shaykh’s website',
      nextName: 'Next name',
      allNames: 'All names',
    },
  },
};

export function toArabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
}
