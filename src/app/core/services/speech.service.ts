import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { Lang } from '../models/lang';

/** One block of the page to read, e.g. a paragraph; `key` lets the page highlight it. */
export interface SpeechSegment {
  key: string;
  text: string;
}

type State = 'idle' | 'playing' | 'paused';

/** The voice each language prefers when the device has several. */
const PREFERRED_LOCALE: Record<Lang, string> = { ar: 'ar-sa', en: 'en-us' };

/**
 * Reads text aloud with the browser's own speech synthesis (free, offline, no downloads).
 * Text is spoken in short, sentence-sized utterances one after another: Chrome can silently stop
 * long utterances, and short ones keep pause/resume and the reading highlight accurate.
 */
@Injectable({ providedIn: 'root' })
export class SpeechService {
  private readonly synth = inject(DOCUMENT).defaultView?.speechSynthesis;
  private readonly voices = signal<SpeechSynthesisVoice[]>([]);
  private queue: { key: string; text: string }[] = [];
  private position = 0;
  private run = 0; // bumped on every start/stop so callbacks from an old run are ignored

  readonly supported = !!this.synth;
  readonly state = signal<State>('idle');
  /** Key of the segment being read, for highlighting. */
  readonly activeKey = signal<string | null>(null);

  constructor() {
    if (!this.synth) return;
    const load = () => this.voices.set(this.synth!.getVoices());
    load();
    this.synth.addEventListener?.('voiceschanged', load);
  }

  /** Whether the device has a voice for this language (reactive: voices can load late). */
  hasVoice(lang: Lang): boolean {
    return !!this.pickVoice(lang);
  }

  speak(segments: SpeechSegment[], lang: Lang): void {
    if (!this.synth) return;
    this.stop();
    this.queue = segments.flatMap((s) => chunk(speakable(s.text, lang)).map((text) => ({ key: s.key, text })));
    this.position = 0;
    const run = ++this.run;
    this.state.set('playing');
    this.next(run, lang);
  }

  pause(): void {
    if (this.state() !== 'playing') return;
    this.synth?.pause();
    this.state.set('paused');
  }

  resume(): void {
    if (this.state() !== 'paused') return;
    this.synth?.resume();
    this.state.set('playing');
  }

  stop(): void {
    this.run++;
    this.synth?.cancel();
    this.state.set('idle');
    this.activeKey.set(null);
  }

  private next(run: number, lang: Lang): void {
    if (run !== this.run) return;
    const item = this.queue[this.position++];
    if (!item) return this.stop();
    const u = new SpeechSynthesisUtterance(item.text);
    const voice = this.pickVoice(lang);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? PREFERRED_LOCALE[lang];
    u.rate = lang === 'ar' ? 0.9 : 0.95;
    u.onstart = () => run === this.run && this.activeKey.set(item.key);
    u.onend = () => this.next(run, lang);
    u.onerror = (e) => (e.error === 'interrupted' || e.error === 'canceled' ? undefined : this.next(run, lang));
    this.synth!.speak(u);
  }

  /** Best available voice for the language: prefer natural/online voices over basic local ones. */
  private pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
    const matching = this.voices().filter((v) => v.lang.toLowerCase().startsWith(lang));
    const score = (v: SpeechSynthesisVoice) =>
      (/natural|neural|online|google|premium|enhanced/i.test(v.name) ? 2 : 0) +
      (v.lang.toLowerCase() === PREFERRED_LOCALE[lang] ? 1 : 0);
    return matching.sort((a, b) => score(b) - score(a))[0];
  }
}

/** Prepare text for speech: skip Qur'an verses (no synthetic recitation), expand ﷺ, drop marks. */
function speakable(text: string, lang: Lang): string {
  return text
    .replace(/﴿[^﴾]*﴾|﴾[^﴿]*﴿/g, ' … ')
    .replace(/ﷺ/g, lang === 'ar' ? ' صلى الله عليه وسلم ' : ' peace be upon him ')
    .replace(/[«»"“”\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split into sentence-sized pieces (≤ ~200 characters), breaking at punctuation where possible. */
function chunk(text: string, max = 200): string[] {
  const sentences = text.split(/(?<=[.!?؟؛:،,;])\s+/);
  const out: string[] = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + ' ' + s).trim().length <= max) cur = (cur + ' ' + s).trim();
    else {
      if (cur) out.push(cur);
      if (s.length <= max) cur = s;
      else {
        const words = s.split(' ');
        cur = '';
        for (const w of words) {
          if ((cur + ' ' + w).trim().length > max) {
            out.push(cur);
            cur = w;
          } else cur = (cur + ' ' + w).trim();
        }
      }
    }
  }
  if (cur) out.push(cur);
  return out.filter((t) => t.replace(/[\s…]/g, '').length > 0);
}
