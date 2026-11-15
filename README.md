# اعرف الله · Know Allah

**Know Allah through His signs in creation and His Beautiful Names: the signs with their texts and
verified sources, and the names briefly explained, in Arabic and English.**

﴿ذَٰلِكُمُ ٱللَّهُ رَبُّكُمۡۖ لَآ إِلَٰهَ إِلَّا هُوَۖ خَٰلِقُ كُلِّ شَيۡءࣲ فَٱعۡبُدُوهُۚ﴾ [الأنعام: ١٠٢]

The site joins two earlier projects, built the same way: «سنريهم آياتنا»
([`sanurihim-ayatina`](../sanurihim-ayatina)) became its signs section, and «أسماء الله الحسنى»
([`asmaa-alhusna`](../asmaa-alhusna)) its names section, rewritten in a much shorter form. It is
written for two readers: non-Muslims meeting Islam for the first time, and Muslims who want to grow
in certainty.

The folder, the project and the repository are named `huda` («هدى») rather than after the site, so
that more components can join it later.

🔗 **Live site:** `https://<your-username>.github.io/huda/`

## What's in it

- **The home page** (`/`) is made to draw in a reader who is curious about Islam:
  1. the opening questions of the journey's seven stops take turns over their pictures, each leading
     to its stop, with buttons to start the journey or browse the signs, and the figures (signs,
     names, sources);
  2. the journey and nine more questions from every field, each folded under its title, a line on
     what it holds and a glimpse of its pictures, until the reader opens it;
  3. the two sections; today's sign and name; why the site can be trusted (verses from the Mushaf,
     hadith with their numbers, every fact with its source); and al-An'am 6:102 with "What next?".
- **Finding the way:** the header holds the sections, with "Start here" set apart; on a phone they
  are in a tab bar at the foot of the screen (Home, Start here, Signs, Names, Our method).
- **The signs, «سنريهم آياتنا»** (`/signs`): 74 signs in 9 fields — the cosmos; earth and sky;
  seas and water; the living world; the human being; health in the Sunnah; peoples of the past;
  prophecies fulfilled; preserving the Qur'an.
  - **Two lists:** «المعجزات» (Miracles, 44) and «علامات تُظهر عظمة الخالق» (Signs that show the
    Creator's greatness, 30). The second holds the signs for reflection: what they say is true and plain,
    but people already knew it when it was revealed, so they are not offered as i'jaz. They come
    after the miracles, and their cards lead with the verse or hadith. On their own pages and as the sign
    of the day they carry the «للتفكر» badge. Each list has its own field filter, with only the fields
    it has signs in, and its own search. A field's card sets both lists to that field (a list with no
    signs in it shows all its fields) and clears both searches. Each list shows its first twelve
    cards (six on a phone), and «اعرض المزيد» ("Show more") adds as many more, so the page never runs
    on and on.
  - **"Non-Muslim or new to Islam?":** a 7-stop journey through the signs, ending with "What next?".
    It is folded just above «المعجزات» (Miracles), under a line on what its stops hold and their
    pictures, until the reader opens it or follows a link to `/signs#journey` (the header's "Start
    here", the hero's first button and the footer). The hero's other buttons lead to the two lists.
  - **«آية (معجزة)»:** many readers don't know that «آية» can mean a miracle, so where the interface's
    «آية» means the miracles it is followed by «(معجزة)» ("sign (miracle)" in English): «آية اليوم (معجزة
    اليوم)» and «الآية (المعجزة) التالية» when that sign is a miracle, and the hero's «هذه الآيات
    (المعجزات)». Never on words that cover both lists, on a sign for reflection, where «آية» means a
    verse, or in the Qur'an's words and their translation.
  - **Every sign is a short story** (`/signs/:slug`), with a list of its parts («في هذه الصفحة») that
    stays beside the text on a wide screen and sits above it on a phone:
    1. a question to open with;
    2. the verse or hadith;
    3. "Fourteen centuries ago";
    4. "What science found" (or "What history records");
    5. a timeline from revelation to discovery;
    6. "Did you know?" and "A moment to reflect";
    7. the sources, linked.
  - Links from the first site (`/ayah/:slug`) redirect to `/signs/:slug`.
- **The Beautiful Names** (`/names`): 107 names, with the name of the day, a search, and «فاجئني
  باسم» ("Surprise me"), which opens a name not yet read. The list shows its first 24 names (12 on a
  phone, two to a row), and «اعرض المزيد» ("Show more") adds as many more. Each name's page
  (`/names/:slug`) has:
  1. its meaning, in a line;
  2. one to three verses or hadith in which the name is established, each with a short explanation;
  3. «أثره في حياتك», what believing in the name does in your life;
  4. a supplication from the Qur'an or the authentic Sunnah.
- **A reading experience that leads on:** reading progress, read marks and "Continue reading", the
  next sign or name, text size, listen (the device's voice, which skips the Qur'an's own words rather
  than recite them) and share.
- **Seven page colours**: night (the default) plus the six of `asmaa-alhusna` (paper, black, white,
  blue, dark blue, pink), and **Arabic ⇄ English**. More languages can be added; see below.
- **"Our method"** (`/method`) and **"What next?"** (`/next`) pages.

## Our method, in short

- **Verses** were copied from the Mushaf text (Hafs from ‘Asim, KFQPC rendering) through
  al-Maktaba al-Shamela, not typed from memory. That text writes the staggered tanween of idgham
  and ikhfa' with three marks that mean something else in Unicode (U+0657, U+065E, U+0656), which
  Amiri Quran cannot draw as tanween; they are stored as Unicode's open tanween (U+08F0, U+08F1,
  U+08F2), the same marks, and `npm run check:content` refuses the KFQPC ones.
- **In the signs**, hadith are only from al-Bukhari and Muslim. Only established science, never
  passing theories; the Arabic must carry the meaning, and what the early commentators said is
  mentioned. Popular claims that don't hold up are left out on purpose. The sources are journals,
  agencies, universities and reference works, each opened and checked against what the page says (for
  paywalled papers, against the abstract) in October 2026. Web pages move, so re-check the links now
  and then.
- **Eighteen of the signs** (most of the prophecies, the camel and sleep) are the candidates that
  passed all three checks of a review of 132: the science or history, the text and its classical
  reading, and a search for any serious objection. A prophecy's page links the histories and the
  classical commentaries that recorded each fulfilment.
- **The 30 signs for reflection:** 27 come from the same review's 72 candidates that were sound in
  their science and text but showed nothing people did not already know, and 3 were added later
  under the same rules. Each was screened again: the
  reading must be the classical commentators' own and undisputed, the fact established, a ruling
  never given a modern reason its text does not state, and a health statement must rest on current
  guidance or a review. Such a page carries the «للتفكر» badge and is never called a miracle.
- **The page of paired word counts** («كلماتٌ متقابلة بعددٍ واحد») is among the miracles, by the
  owner's decision: a Book recited in parts over twenty-three years whose paired words come out equal
  in number. A count of the Qur'an's words is given only with the rule it was counted by, and only if
  it holds under that one rule; counts that need a chosen exception (365 for "day") or do not hold
  (145 for "life" and "death") stay out.
- **Every page makes the case:** its opening question, card summary and closing thought say why the
  sign is evidence that the Qur'an is the word of Allah and Islam is the truth, without claiming more
  than the page's facts. Neither the timeline nor the text names knowledge from before Islam.
- **On the names' pages**, the explanations are short and in our own words. Hadith are from
  al-Bukhari and Muslim, or from another collection only with its grading quoted from a named
  scholar or edition and shown on the page: al-Tirmidhi, al-Arna'ut's edition of Sunan Abi Dawud, the
  al-Risala edition of Musnad Ahmad, or al-Albani. Hadith whose authenticity is disputed were left out.
- Every hadith's text and number was checked in the collections themselves: Bukhari in the common
  Fath al-Bari numbering, Muslim in ‘Abd al-Baqi's.

A qualified student of knowledge should review the Arabic glosses, the scholarly notes and the names'
explanations before the site is promoted widely.

## Images

The images are in `public/images/` as WebP:

| Image | Size | Saved as |
|---|---|---|
| the 74 sign images | 1280×800 | `<name>.webp` 1280 wide, `<name>-sm.webp` 640 wide |
| the home page's Earth (`hero`) | 1536×864 | 1536 wide, `-sm` 768 wide |
| the names' golden dome (`names-hero`) | 1536×864 | 1536 wide, `-sm` 768 wide |

Every image follows these rules:
- no people, animals or faces: honey is shown as honeycomb, not bees, and the embryo as abstract
  cells, not a fetus;
- no Arabic or Qur'an-like script in the pictures: the manuscript page shows closed codices;
- nothing that pretends to be a real photo of a scientific claim.

The signs' large images and the home page's Earth are labelled «صورة تعبيرية» ("illustrative
image"). The names' dome is an ornament behind the title, so it carries no label.

To replace one: convert a PNG of the same size to the two WebP sizes (for example with Pillow), and
keep the file name — for a sign, the one in `art` in
`ayat.json`. Then run `npm run check:content`, which checks that every sign's images exist. While
`npm start` is running, restart it after adding a new file to `public/`: the dev server only serves
the files that were there when it started.

## Running locally

Requires Node 22.22+ or 24.15+.

```bash
npm install
npm start              # http://localhost:4200
npm run check:content  # checks public/data/ayat.json and names.json
npm run build          # prerenders every page into dist/huda/browser, laid out for GitHub Pages
npm run preview        # serves that build as GitHub Pages does: http://localhost:4300/Huda/
```

After changing styles, check that no text is cut off or touches something it shouldn't, and that
no image is out of shape: with `npm start` running, paste
[`scripts/check-layout.js`](scripts/check-layout.js) into the browser's console and run
`await __audit.sweep(await __audit.routes(), 'ar 390'); __audit.summary()`. It visits every page
and lists each problem with the page and element; an empty list is a pass. Run it in both
languages, at a phone width and a desktop width. Amiri Quran's marks and letters reach far above
and below its line, which is what it catches most.

Safari, on every iPhone, paints the gold titles and sizes some images differently from Chrome, so
they are also checked in WebKit, Safari's engine: run `npx playwright install webkit` once, then
`npm run check:safari` while `npm start` is running. Another copy of the site, such as the live
one, can be checked with `npm run check:safari -- <its address>`.

## Deploying

Every push to `main` checks the content, builds the app and publishes it to GitHub Pages
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). Before the first deploy, set the
repo's **Settings → Pages → Source** to **GitHub Actions**.

The build prerenders every page (the home page, `/signs`, `/names`, `/method`, `/next`, each sign
and each name) into an HTML file of its own, with its text, title, description and Open Graph tags
in it ([`src/app/app.routes.server.ts`](src/app/app.routes.server.ts)), so Pages answers every
address as a page that search engines can index. A new sign or name gets its page on the next
build. In the browser, the app then takes over the page it was given rather than drawing it again
(hydration).

Every page is there twice: in Arabic at its plain address (`/signs/<slug>`) and in English under
`/en/` (`/en/signs/<slug>`). Each names the other with `hreflang` (and the English one for readers
of other languages), so that search engines show each reader the page in their language. The
address gives a page's language
([`language-location.ts`](src/app/core/services/language-location.ts) takes the `/en/` out before
the router sees it, and puts it in every link). The language switch moves the page to its other
address without reloading it and saves the choice: from then on, `src/index.html` opens every page
in that language before it is drawn. Search engines save no choice, so they see each address in its
own language.

Pages answers `/x` with `x.html` but redirects it to `/x/` wherever a folder `x/` exists, so
[`scripts/finish-build.mjs`](scripts/finish-build.mjs) moves each page to `<route>.html`; only the
folders `/signs/`, `/names/`, `/en/`, `/en/signs/` and `/en/names/` keep their `index.html`, and
their address ends in a slash. It also writes `404.html` for any other address, `sitemap.xml` with
every page in both languages and `robots.txt`, and fails the build if a sign or name lacks its page
in either language, its text or its description, or a page's canonical address isn't the one it is
served at, or its `hreflang` links don't name its two versions.

The site's address is set in two places: the base href in `angular.json` (`/Huda/`) and `SITE_URL`
in [`src/app/core/services/page-meta.service.ts`](src/app/core/services/page-meta.service.ts).
Change both if the repository is renamed or the site moves to a domain of its own; the build
refuses a mismatch. Search engines read `robots.txt` only at a host's root, so submit
`https://hosam9988.github.io/Huda/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## The API

[`backend/`](backend/README.md) holds an API for the same content. It runs on ASP.NET Core and
PostgreSQL. Its migrator imports `public/data` into the database, and the API serves the images
from `public/images` as they are. The site doesn't use it yet: it still reads `public/data` itself.

## Editing the content

The content is in two files under `public/data/`. Run `npm run check:content` after editing either:
it reports any missing translation, source, field, image or part of a name's page, a sign's hadith
not cited from al-Bukhari or Muslim, a name's hadith from another collection without its grading,
and any "God" in the English outside a verse's translation. The site's English says "Allah", and
"deity" for «إله»; the English of every verse is Saheeh International's, cut to the part shown.

### The signs: [`ayat.json`](public/data/ayat.json)

Typed in [`src/app/core/models/ayah.ts`](src/app/core/models/ayah.ts).

```jsonc
{
  "categories": [{ "id": "cosmos", "title": { "ar": "…", "en": "…" }, "blurb": {…}, "art": "expansion" }],
  "ayat": [{
    "slug": "expanding-universe",          // URL: /signs/expanding-universe
    "category": "cosmos",
    "journey": 1,                          // optional: its stop on "Start here"
    "art": "expansion",                    // public/images/expansion.webp and expansion-sm.webp
    "title": {…}, "hook": {…}, "summary": {…},
    "evidence": [{ "kind": "quran",        // or "hadith" (then also "narrator")
                   "text": "…",            // exactly as in the Mushaf; no ﴿ ﴾, the page adds them
                   "meaning": {…}, "ref": {…} }],
    "then": [{…}], "now": [{…}],           // paragraphs
    "nowLabel": "history",                 // optional: "What history records" instead of science
    "highlight": { "value": {…}, "label": {…} },
    "timeline": [{ "year": "1929", "text": {…} },
                 { "year": "610–632", "revelation": true, "text": {…} }],
    "reflection": {…}, "didYouKnow": {…},
    "sources": [{ "title": "…", "publisher": "…", "year": "…", "url": "https://…",
                  "kind": "journal" }]     // journal | preprint | agency | university | encyclopedia | book | news
  }]
}
```

### The names: [`names.json`](public/data/names.json)

Typed in [`src/app/core/models/divine-name.ts`](src/app/core/models/divine-name.ts).

```jsonc
{
  "names": [{
    "slug": "allah",                       // URL: /names/allah
    "number": 1,                           // its place in the list; must run 1, 2, 3…
    "name": "اللَّهُ", "transliteration": "Allah", "gloss": "The One truly worshipped",
    "content": {                           // optional: without it, the name shows "Coming soon"
      "meaning": {…},                      // one line
      "evidence": [{                       // one to three
        "kind": "hadith",                  // or "quran" (then no narrator or grading)
        "text": "…",                       // no ﴿ ﴾ or « »: the page adds them
        "narrator": {…},
        "ref": { "ar": "سنن أبي داود (١٤٩٥)", "en": "Sunan Abi Dawud 1495" },
        "grading": {…},                    // required outside al-Bukhari and Muslim
        "translation": { "en": "…" },
        "explanation": {…}                 // one or two sentences
      }],
      "impact": {…},                       // «أثره في حياتك»: two or three sentences
      "dua": {…}                           // the same shape as an evidence
    }
  }]
}
```

A verse's `ref` reads `{ "ar": "النساء: ٨٥", "en": "An-Nisa 4:85" }`; for several verses,
`{ "ar": "العلق: ٣–٥", "en": "Al-‘Alaq 96:3–5" }`.

In both files, every `{…}` is `{ "ar": "…", "en": "…" }`, and joined verses use the Mushaf's
end-of-verse mark: `…يَلۡتَقِيَانِ ۝١٩ بَيۡنَهُمَا…`.

### Adding a language

1. Add it to `LANGUAGES` in [`src/app/core/models/lang.ts`](src/app/core/models/lang.ts).
2. Add its labels to `UI_TEXT` in [`src/app/core/i18n/ui-text.ts`](src/app/core/i18n/ui-text.ts).
3. Add its key next to `ar` and `en` in the content. Any text not translated yet falls back to
   English, then Arabic.
4. Give it its own address folder, as `/en/` has: a `{ path: 'fr', children: … }` copy of the
   pages in `src/app/app.routes.ts`, its `fr/signs/:slug` and `fr/names/:slug` in
   `app.routes.server.ts`, its `OG_LOCALE` in `page-meta.service.ts`, the redirect to a saved
   choice in `src/index.html`, and the checks for its pages in `scripts/finish-build.mjs`.
5. Add it to `LocalizedText` in
   [`backend/src/Huda.Domain/LocalizedText.cs`](backend/src/Huda.Domain/LocalizedText.cs), or the
   backend's import refuses the new key.

The saved settings (`ayat.lang`, `ayat.theme`, `ayat.textScale`) keep the first site's `ayat.`
prefix. Both sites are served from the same `github.io` origin, so readers keep their settings.

## Project structure

```
src/main.server.ts             the app as the build prerenders it
src/app/
  app.routes.server.ts         the pages prerendered at build time
  core/
    prerender.ts               how the app takes over a prerendered page
    models/ayah.ts             a sign; divine-name.ts a name; lang.ts the languages; theme.ts the page colours
    services/content.service   loads ayat.json: fields, signs, journey, sign of the day
    services/page-meta.service each page's description, canonical address and Open Graph tags
    services/names.service     loads names.json: the names, name of the day, the previous and next name
    services/reading.service   read marks, where the reader stopped, text size (localStorage)
    services/language.service  the language, from the address; sets <html dir/lang>
    services/language-location puts the language in the address: English pages under /en/
    services/speech.service    listen, with the browser's speech synthesis
    services/theme.service     page colour, sets <html data-theme> (palettes in styles.scss)
    i18n/ui-text.ts            interface labels in each language
    utils/                     image paths, search (ignores tashkeel), reading time
  shared/                      sign card, progress ring, scroll reveal, swipe, theme picker, listen, ornament
  pages/portal                 the home page (/): the journey's questions (they take turns, or swipe), the folded journey and questions, the two sections
  pages/signs                  the signs (/signs): sign of the day, fields, the folded journey, the miracles, the signs for reflection
  pages/ayah                   one sign (/signs/:slug; ?path=journey keeps the journey's order)
  pages/names                  the names (/names) and one name (/names/:slug)
  pages/method, next-steps     "Our method" (/method) and "What next?" (/next)
public/data/ayat.json          the signs
public/data/names.json         the names
public/images/                 the images
scripts/check-content.mjs      the content checker
scripts/finish-build.mjs       lays the build out for GitHub Pages; 404.html, sitemap.xml, robots.txt
scripts/preview.mjs            serves the build as GitHub Pages does
scripts/check-layout.js        the layout check, run in the browser
scripts/check-safari.mjs       the gold titles in Safari's engine
backend/                       the API, which the site doesn't use yet (backend/README.md)
```

Built with Angular 22.
