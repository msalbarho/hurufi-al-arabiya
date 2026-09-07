/**
 * Temporary prototype visuals for picture_to_word.
 * Logical image ids stay canonical; no new asset pipeline.
 * Does not import the 720-word bank (Node curriculum scripts cannot load it).
 */
import type { WordDefinition } from "../../content/curriculum/index.ts";

export type PrototypeWordVisual =
  | { kind: "emoji"; emoji: string; source: "category" }
  | { kind: "none" };

/**
 * Same emojis as the existing `/words` category chips.
 * Used only until production image files exist for `image.word.*`.
 * Shared by picture_to_word and word_to_picture.
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

/**
 * Use the portable word's category emoji.
 * وَلَد is not in the 720-word list; family → 👨‍👩‍👧.
 * Never downloads or invents bitmap assets.
 */
export function prototypeVisualForWord(word: WordDefinition): PrototypeWordVisual {
  if (!word.category) return { kind: "none" };
  const emoji = CATEGORY_EMOJI[word.category];
  if (!emoji) return { kind: "none" };
  return { kind: "emoji", emoji, source: "category" };
}
