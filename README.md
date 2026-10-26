# اعرف الله · Know Allah

**Know Allah through His signs in creation and His Beautiful Names: the signs with their texts and
verified sources, and the names briefly explained, in Arabic and English.**

﴿ذَٰلِكُمُ ٱللَّهُ رَبُّكُمۡۖ لَآ إِلَٰهَ إِلَّا هُوَۖ خَٰلِقُ كُلِّ شَيۡءٖ فَٱعۡبُدُوهُۚ﴾ [الأنعام: ١٠٢]

The site joins two earlier projects, built the same way: «سنريهم آياتنا»
([`sanurihim-ayatina`](../sanurihim-ayatina)) became its signs section, and «أسماء الله الحسنى»
([`asmaa-alhusna`](../asmaa-alhusna)) its names section, rewritten in a much shorter form. It is
written for two readers: non-Muslims meeting Islam for the first time, and Muslims who want to grow
in certainty.

The folder, the project and the repository are named `huda` («هدى») rather than after the site, so
that more components can join it later.

🔗 **Live site:** `https://<your-username>.github.io/huda/`

## What's in it

- **The home page** (`/`) leads to the two sections, and to "Start here" for readers new to Islam.
- **The signs, «سنريهم آياتنا»** (`/signs`): 20 signs in 7 fields — the cosmos; earth and sky;
  seas and water; the human being; health in the Sunnah; prophecies fulfilled; preserving the Qur'an.
  - **"Start here":** a 7-stop journey through the signs, ending with "What next?"
  - **Every sign is a short story** (`/signs/:slug`):
    1. a question to open with;
    2. the verse or hadith;
    3. "Fourteen centuries ago";
    4. "What science found" (or "What history records");
    5. a timeline from revelation to discovery;
    6. "Did you know?" and "A moment to reflect";
    7. **"In all honesty"**: the limits of the link, where scholars differ, and claims we refuse to make;
    8. the sources, linked.
  - Links from the first site (`/ayah/:slug`) redirect to `/signs/:slug`.
- **The Beautiful Names** (`/names`): 107 names in the order of «فقه الأسماء الحسنى» by Shaykh
  ʿAbd al-Razzāq al-Badr, with the name of the day and a search. Each name's page (`/names/:slug`) has:
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
  al-Maktaba al-Shamela, not typed from memory.
- **In the signs**, hadith are only from al-Bukhari and Muslim. Only established science, never
  passing theories; the Arabic must carry the meaning, and what the early commentators said is
  mentioned. Popular claims that don't hold up are left out on purpose. The sources are journals,
  agencies, universities and reference works, each opened and checked against what the page says (for
  paywalled papers, against the abstract) in October 2026. Web pages move, so re-check the links now
  and then.
- **On the names' pages**, the explanations summarise Shaykh al-Badr's book in our own words. Hadith
  are from al-Bukhari and Muslim, or from another collection only with its grading quoted from a named
  scholar or edition and shown on the page: al-Tirmidhi, al-Arna'ut's edition of Sunan Abi Dawud, the
  al-Risala edition of Musnad Ahmad, or al-Albani. Hadith whose authenticity is disputed were left out.
- Every hadith's text and number was checked in the books themselves: Bukhari in the common Fath
  al-Bari numbering, Muslim in ‘Abd al-Baqi's. Where the book's footnotes gave a different number, the
  number in the collection was used.

A qualified student of knowledge should review the Arabic glosses, the scholarly notes and the names'
explanations before the site is promoted widely.

## Images

The images are in `public/images/` as WebP:

| Image | Size | Saved as |
|---|---|---|
| the 20 sign images | 1280×800 | `<name>.webp` 1280 wide, `<name>-sm.webp` 640 wide |
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
npm run build          # production build in dist/huda/browser
```

## Deploying

Every push to `main` checks the content, builds the app and publishes it to GitHub Pages
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). The build's base path is the
repository's name, so name the repository `huda` for the address above. Before the first
deploy, set the repo's **Settings → Pages → Source** to **GitHub Actions**.

## Editing the content

The content is in two files under `public/data/`. Run `npm run check:content` after editing either:
it reports any missing translation, source, field, image or part of a name's page, a sign's hadith
not cited from al-Bukhari or Muslim, and a name's hadith from another collection without its grading.

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
    "reflection": {…}, "caution": {…}, "didYouKnow": {…},
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
    "number": 1,                           // the book's order; must run 1, 2, 3…
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
4. Update the `ayat.lang` check in `src/index.html` so the page opens in the right direction.

The saved settings (`ayat.lang`, `ayat.theme`, `ayat.textScale`) keep the first site's `ayat.`
prefix. Both sites are served from the same `github.io` origin, so readers keep their settings.

## Project structure

```
src/app/
  core/
    models/ayah.ts             a sign; divine-name.ts a name; lang.ts the languages; theme.ts the page colours
    services/content.service   loads ayat.json: fields, signs, journey, sign of the day
    services/names.service     loads names.json: the names, name of the day, the previous and next name
    services/reading.service   read marks, where the reader stopped, text size (localStorage)
    services/language.service  the language, sets <html dir/lang>
    services/speech.service    listen, with the browser's speech synthesis
    services/theme.service     page colour, sets <html data-theme> (palettes in styles.scss)
    i18n/ui-text.ts            interface labels in each language
    utils/                     image paths, search (ignores tashkeel), reading time
  shared/                      sign card, progress ring, scroll reveal, theme picker, listen, ornament
  pages/portal                 the home page (/): the two sections
  pages/signs                  the signs (/signs): journey, sign of the day, fields, all signs
  pages/ayah                   one sign (/signs/:slug; ?path=journey keeps the journey's order)
  pages/names                  the names (/names) and one name (/names/:slug)
  pages/method, next-steps     "Our method" (/method) and "What next?" (/next)
public/data/ayat.json          the signs
public/data/names.json         the names
public/images/                 the images
scripts/check-content.mjs      the content checker
```

Built with Angular 22.
