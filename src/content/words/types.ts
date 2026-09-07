export type CategoryId =
  | "animals"
  | "food"
  | "family"
  | "body"
  | "colors"
  | "numbers"
  | "home"
  | "school"
  | "clothes"
  | "nature"
  | "transport"
  | "jobs"
  | "fruits"
  | "vegetables"
  | "birds"
  | "sea"
  | "sky"
  | "verbs"
  | "adjectives";

export interface Word {
  id: string;
  /** plain text without diacritics */
  text: string;
  /** fully diacritized text */
  diacritized: string;
  emoji: string;
  category: CategoryId;
}

const HARAKAT = /[\u064B-\u0652\u0670\u0640]/g;

/** strip diacritics to get the plain form */
export const strip = (s: string) => s.replace(HARAKAT, "");

/** build a category's word list from `[diacritized, emoji]` tuples */
export function build(category: CategoryId, rows: readonly (readonly [string, string])[]): Word[] {
  return rows.map(([diacritized, emoji], i) => ({
    id: `${category}-${i + 1}`,
    text: strip(diacritized),
    diacritized,
    emoji,
    category,
  }));
}
