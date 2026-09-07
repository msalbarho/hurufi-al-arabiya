/**
 * Pure business rules — no React, no storage. Ported 1:1 to Kotlin later.
 */

export type ItemType = "letter" | "word" | "sentence" | "story" | "diacritic";
export type SectionId = "letters" | "words" | "sentences" | "stories" | "diacritics";

export interface ItemProgress {
  mastery: 0 | 1 | 2 | 3;
  attempts: number;
  correct: number;
  streak: number; // consecutive correct answers
  sessions: number; // distinct days with a correct answer
  lastSeen: number; // epoch ms
  lastCorrectDay?: string; // YYYY-MM-DD
}

export const emptyProgress = (): ItemProgress => ({
  mastery: 0,
  attempts: 0,
  correct: 0,
  streak: 0,
  sessions: 0,
  lastSeen: 0,
});

export const dayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Mastery ladder:
 *  0 → never seen
 *  1 → seen & heard
 *  2 → two consecutive correct answers
 *  3 → correct in 3 different sessions (days)
 */
export function applySeen(p: ItemProgress, now = Date.now()): ItemProgress {
  return { ...p, mastery: p.mastery < 1 ? 1 : p.mastery, lastSeen: now };
}

export function applyAttempt(p: ItemProgress, correct: boolean, now = Date.now()): ItemProgress {
  const today = dayKey(new Date(now));
  const next: ItemProgress = {
    ...p,
    attempts: p.attempts + 1,
    correct: p.correct + (correct ? 1 : 0),
    streak: correct ? p.streak + 1 : 0,
    lastSeen: now,
  };
  if (correct && p.lastCorrectDay !== today) {
    next.sessions = p.sessions + 1;
    next.lastCorrectDay = today;
  }
  let mastery = Math.max(1, next.mastery) as ItemProgress["mastery"];
  if (next.streak >= 2) mastery = 2;
  if (next.sessions >= 3 && next.streak >= 1) mastery = 3;
  // Difficulty "easy" is handled by the caller (fewer options), not here.
  next.mastery = mastery;
  return next;
}

export const UNLOCK_THRESHOLD = 0.7; // 70% of items at mastery >= 2

export function sectionCompletion(items: ItemProgress[], total: number): number {
  if (total === 0) return 0;
  const done = items.filter((i) => i.mastery >= 2).length;
  return done / total;
}

/** Which section gates which. Letters is always open. */
export const SECTION_PREREQ: Record<SectionId, SectionId | null> = {
  letters: null,
  diacritics: "letters",
  words: "letters",
  sentences: "words",
  stories: "sentences",
};

export function starsFor(mastery: number) {
  return Math.max(0, Math.min(3, mastery));
}
