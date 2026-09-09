/**
 * Temporary prototype visuals for picture_to_word / word_to_picture.
 * Logical image ids stay canonical; no new asset pipeline.
 * Does not import the 720-word bank (Node curriculum scripts cannot load it).
 *
 * Fallback order (display only):
 * 1. Real files for `image.word.*` — not loaded yet (logical ids are preserved).
 * 2. Explicit per-word emoji override.
 * 3. Category emoji (same icons as `/words` chips).
 * 4. Generic camera placeholder.
 */
import type { WordDefinition } from "../../content/curriculum/index.ts";

export type PrototypeVisualSource = "override" | "category" | "placeholder";

export type PrototypeWordVisual =
  | { kind: "emoji"; emoji: string; source: PrototypeVisualSource }
  | { kind: "none" };

/**
 * Wave 1–3 lemmas whose category chip is the wrong object
 * (school building, lion, family, generic hand, sky star, nature tree).
 * Keyed by portable word id — not React, not unit ids.
 */
const WORD_EMOJI: Record<string, string> = {
  "word.qalam": "✏️",
  "word.jamal": "🐪",
  "word.walad": "👦",
  "word.qadam": "🦶",
  "word.yad": "✋",
  "word.qamar": "🌙",
  "word.jabal": "⛰️",
  "word.fam": "👄",
  "word.hajar": "🪨",
  "word.hamal": "🐑",
  "word.raml": "🏜️",
  "word.qalb": "❤️",
  "word.kalb": "🐶",
  "word.bahr": "🌊",
  "word.tamr": "🌴",
  "word.daftar": "📓",
  "word.samak": "🐟",
  "word.shams": "☀️",
  "word.asal": "🍯",
  "word.bab": "🚪",
  "word.dajaj": "🐔",
  "word.nar": "🔥",
  "word.kitab": "📕",
  "word.inab": "🍇",
  "word.jism": "🧍",
  "word.bint": "👧",
};

/**
 * Same emojis as the existing `/words` category chips.
 * Used only until production image files exist for `image.word.*`.
 */
const CATEGORY_EMOJI: Record<string, string> = {
  animals: "🦁",
  food: "🍞",
  fruits: "🍎",
  vegetables: "🥕",
  family: "👨‍👩‍👧",
  body: "✋",
  colors: "🌈",
  numbers: "🔢",
  home: "🏠",
  school: "🏫",
  clothes: "👕",
  nature: "🌳",
  transport: "🚗",
  jobs: "👩‍⚕️",
  birds: "🦋",
  sea: "🐬",
  sky: "⭐",
  verbs: "🏃",
  adjectives: "😀",
};

const PLACEHOLDER_EMOJI = "📷";

/**
 * Prototype glyph for a portable word. Never downloads bitmaps.
 * Callers keep `word.imageAssetId` so later files replace this emoji.
 */
export function prototypeVisualForWord(word: WordDefinition): PrototypeWordVisual {
  const override = WORD_EMOJI[word.id];
  if (override) return { kind: "emoji", emoji: override, source: "override" };

  if (word.category) {
    const emoji = CATEGORY_EMOJI[word.category];
    if (emoji) return { kind: "emoji", emoji, source: "category" };
  }

  return { kind: "emoji", emoji: PLACEHOLDER_EMOJI, source: "placeholder" };
}
