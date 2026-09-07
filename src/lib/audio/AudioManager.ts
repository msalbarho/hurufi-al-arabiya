/**
 * AudioManager — single place that plays every sound in the app.
 *
 * Strategy (offline-first):
 *  1. If a bundled audio file is registered for the id → play it (HTMLAudio, preloaded).
 *  2. Otherwise fall back to on-device Arabic speech synthesis (works offline on Android).
 *  3. UI feedback sounds (tap / success / error) are synthesised with WebAudio → zero assets.
 */

type AudioId = string;

const registry = new Map<AudioId, string>(); // id -> url
const cache = new Map<AudioId, HTMLAudioElement>();

let current: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let enabled = true;

const isBrowser = () => typeof window !== "undefined";

function getCtx() {
  if (!isBrowser()) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.12, when = 0) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, c.currentTime + when);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + when + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + when);
  o.stop(c.currentTime + when + dur + 0.05);
}

function pickArabicVoice(): SpeechSynthesisVoice | undefined {
  if (!isBrowser() || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("ar") && /female|zariyah|salma|hoda|laila|amira/i.test(v.name)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("ar"))
  );
}

export const AudioManager = {
  setEnabled(v: boolean) {
    enabled = v;
    if (!v) AudioManager.stop();
  },
  isEnabled: () => enabled,

  /** Register bundled files: AudioManager.register({ "letters/ba_name": "/audio/letters/ba_name.m4a" }) */
  register(map: Record<AudioId, string>) {
    for (const [id, url] of Object.entries(map)) registry.set(id, url);
  },

  preload(ids: AudioId[]) {
    if (!isBrowser()) return;
    for (const id of ids) {
      const url = registry.get(id);
      if (!url || cache.has(id)) continue;
      const a = new Audio(url);
      a.preload = "auto";
      cache.set(id, a);
    }
  },

  stop() {
    if (current) {
      current.pause();
      current.currentTime = 0;
      current = null;
    }
    if (isBrowser() && "speechSynthesis" in window) window.speechSynthesis.cancel();
  },

  /**
   * Play by id. If no file is registered, `fallbackText` is spoken with TTS.
   * Resolves when playback ends.
   */
  play(id: AudioId, fallbackText?: string, opts?: { rate?: number }): Promise<void> {
    if (!enabled || !isBrowser()) return Promise.resolve();
    AudioManager.stop();

    const url = registry.get(id);
    if (url) {
      return new Promise((resolve) => {
        const a = cache.get(id) ?? new Audio(url);
        cache.set(id, a);
        current = a;
        a.onended = () => resolve();
        a.onerror = () => resolve();
        a.currentTime = 0;
        void a.play().catch(() => resolve());
      });
    }

    if (fallbackText && "speechSynthesis" in window) {
      return new Promise((resolve) => {
        const u = new SpeechSynthesisUtterance(fallbackText);
        u.lang = "ar-SA";
        u.rate = opts?.rate ?? 0.85;
        u.pitch = 1.1;
        const v = pickArabicVoice();
        if (v) u.voice = v;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      });
    }
    return Promise.resolve();
  },

  speak(text: string, opts?: { rate?: number }) {
    return AudioManager.play(`tts:${text}`, text, opts);
  },

  async playSequence(items: { id: AudioId; text?: string }[], gapMs = 250) {
    for (const it of items) {
      await AudioManager.play(it.id, it.text);
      await new Promise((r) => setTimeout(r, gapMs));
    }
  },

  /* ---------- UI feedback (synthesised) ---------- */
  tap() {
    if (!enabled) return;
    tone(520, 0.08, "triangle", 0.08);
  },
  success() {
    if (!enabled) return;
    tone(523, 0.15, "sine", 0.12, 0);
    tone(659, 0.15, "sine", 0.12, 0.12);
    tone(784, 0.25, "sine", 0.14, 0.24);
  },
  error() {
    if (!enabled) return;
    tone(220, 0.18, "triangle", 0.08, 0);
    tone(196, 0.22, "triangle", 0.08, 0.12);
  },
  star() {
    if (!enabled) return;
    [880, 1109, 1319, 1760].forEach((f, i) => tone(f, 0.12, "sine", 0.1, i * 0.07));
  },
};

// Warm up voices list (Chrome loads it asynchronously)
if (isBrowser() && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => void window.speechSynthesis.getVoices();
}
