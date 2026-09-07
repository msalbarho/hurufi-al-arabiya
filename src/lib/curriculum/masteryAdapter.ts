/**
 * Maps portable mastery targets onto the existing progress store
 * without rewriting it.
 *
 * Live keys stay `letter:${id}`. Item ids encode the facet so
 * sound / tracing / recognition are not collapsed into one star.
 *
 * Example:
 *   mastery.letter.mim.sound   → letter:mim.sound
 *   mastery.letter.mim.tracing → letter:mim.tracing
 *
 * `letter:mim` remains the free-play letter page key.
 */
import type {
  CurriculumBundle,
  ExerciseDefinition,
  ExerciseMasteryTarget,
  LearningUnitDefinition,
} from "@/content/curriculum/index.ts";
import { useProgress } from "@/lib/progress/store";
import type { ItemProgress, ItemType } from "@/lib/rules/mastery";
import { portableLetter } from "./letterAdapter.ts";

export interface LiveMasteryRef {
  portableMasteryId: string;
  skillId: string;
  type: ItemType;
  /** Progress store id (not the prototype letter grid id). */
  id: string;
  liveKey: string;
}

function facetForTarget(target: ExerciseMasteryTarget): string {
  switch (target.skillId) {
    case "skill.letter_sounds.core":
      return "sound";
    case "skill.handwriting.isolated":
      return "tracing";
    case "skill.letter_recognition.core":
      return "recognition";
    case "skill.letter_forms.positional":
      return target.letterForm ? `form.${target.letterForm}` : "form";
    case "skill.short_vowel.fatha":
      return "fatha";
    case "skill.short_vowel.kasra":
      return "kasra";
    case "skill.short_vowel.damma":
      return "damma";
    case "skill.syllable_blending.cv":
      return "blend";
    case "skill.word_decoding.simple":
      return "decode";
    default:
      return target.skillId.replace(/^skill\./, "").replace(/\./g, "_");
  }
}

export function liveRefForTarget(
  bundle: CurriculumBundle,
  target: ExerciseMasteryTarget,
): LiveMasteryRef {
  const letter = target.letterId ? portableLetter(bundle, target.letterId) : undefined;
  const stem = letter?.legacyId ?? target.letterId ?? target.syllableId ?? target.wordId ?? "item";
  const id = `${stem}.${facetForTarget(target)}`;
  return {
    portableMasteryId: target.id,
    skillId: target.skillId,
    type: "letter",
    id,
    liveKey: `letter:${id}`,
  };
}

export function recordExerciseAttempt(
  bundle: CurriculumBundle,
  exercise: ExerciseDefinition,
  correct: boolean,
): { starsGained: number; mastery: number; refs: LiveMasteryRef[] } {
  const targets = exercise.masteryTargets ?? [];
  const refs = targets.map((target) => liveRefForTarget(bundle, target));
  const store = useProgress.getState();

  for (const target of targets) {
    if (!target.letterId) continue;
    const legacyId = portableLetter(bundle, target.letterId)?.legacyId;
    if (legacyId) store.markSeen("letter", legacyId);
  }

  let starsGained = 0;
  let mastery = 0;
  for (const ref of refs) {
    const result = store.recordAttempt(ref.type, ref.id, correct);
    starsGained += result.starsGained;
    mastery = Math.max(mastery, result.mastery);
  }

  return { starsGained, mastery, refs };
}

export function targetHasCorrect(
  items: Record<string, ItemProgress>,
  ref: LiveMasteryRef,
): boolean {
  return (items[ref.liveKey]?.correct ?? 0) >= 1;
}

export function unitExerciseCompletion(
  bundle: CurriculumBundle,
  unit: LearningUnitDefinition,
  exercises: ExerciseDefinition[],
  items: Record<string, ItemProgress>,
): { done: number; total: number; firstIncomplete: number } {
  const total = exercises.length;
  let done = 0;
  let firstIncomplete = 0;
  let foundIncomplete = false;

  exercises.forEach((exercise, index) => {
    const target = exercise.masteryTargets?.[0];
    const complete = target ? targetHasCorrect(items, liveRefForTarget(bundle, target)) : false;
    if (complete) done += 1;
    else if (!foundIncomplete) {
      firstIncomplete = index;
      foundIncomplete = true;
    }
  });

  void unit;
  return { done, total, firstIncomplete: foundIncomplete ? firstIncomplete : 0 };
}
