/**
 * Maps portable mastery targets onto the existing progress store
 * without rewriting it.
 *
 * Letter live keys stay `letter:${id}`. Item ids encode the facet so
 * tracing stays distinct from sound.
 *
 * Isolated letter recognition from sound-to-letter shares `letter:mim.sound`
 * so one tap is not counted twice. `letter:mim` remains the free-play key.
 *
 * CV blending uses `getSyllableLiveKey` → `letter:{legacyId}.{vowel}`.
 * Haraka discrimination uses `getHarakaLiveKey` →
 * `diacritic:{legacyId}.{vowel}.discrimination`. Those keys must not be shared.
 *
 * Word decoding uses `getWordLiveKey` → `word:{slug}.decoding`
 * for audio_to_word, picture_to_word, and word_to_picture when they
 * score the same word. Not a letter key.
 *
 * Sentence reading uses `getSentenceLiveKey` → `sentence:{stem}.reading`
 * for audio_to_sentence. Not a word key.
 */
import type { CurriculumBundle, ExerciseDefinition } from "@/content/curriculum/index.ts";
import { useProgress } from "@/lib/progress/store";
import { portableLetter } from "./letterAdapter.ts";
import { getPresentationLiveKey } from "./presentationAdapter.ts";
import {
  liveRefForTarget,
  type LiveMasteryRef,
} from "./unitMastery.ts";

export {
  evaluateUnitMastery,
  evaluateUnitUnlock,
  exerciseActivitiesComplete,
  getLetterFormLiveKey,
  getSyllableLiveKey,
  getHarakaLiveKey,
  getWordLiveKey,
  getSentenceLiveKey,
  liveRefForTarget,
  lessonEntry,
  lessonFinishKind,
  lessonFinishMessageAr,
  scheduleLesson,
  unitExerciseCompletion,
  unitPathCtaAr,
  unitPathStatus,
  resolveUnitRouteAccess,
  type LessonFinishKind,
  type LiveMasteryRef,
  type UnitMasteryEvaluation,
  type UnitPathStatus,
  type UnitRouteAccess,
  type UnitUnlockEvaluation,
  type UnitPrereqResolver,
} from "./unitMastery.ts";
export {
  getPresentationLiveKey,
  isPresentationExercise,
  isReinforcementExercise,
  isReviewExercise,
} from "./presentationAdapter.ts";

export function completePresentation(exercise: ExerciseDefinition): void {
  const key = getPresentationLiveKey(exercise.id);
  useProgress.getState().markSeen(key.type, key.id);
}

export function recordExerciseAttempt(
  bundle: CurriculumBundle,
  exercise: ExerciseDefinition,
  correct: boolean,
): { starsGained: number; mastery: number; refs: LiveMasteryRef[] } {
  const targets = exercise.masteryTargets ?? [];
  const refs = targets.map((target) => liveRefForTarget(bundle, target, exercise));
  const store = useProgress.getState();

  for (const target of targets) {
    if (!target.letterId) continue;
    const legacyId = portableLetter(bundle, target.letterId)?.legacyId;
    if (legacyId) store.markSeen("letter", legacyId);
  }

  const unique = new Map<string, LiveMasteryRef>();
  for (const ref of refs) {
    if (!unique.has(ref.liveKey)) unique.set(ref.liveKey, ref);
  }

  let starsGained = 0;
  let mastery = 0;
  for (const ref of unique.values()) {
    const result = store.recordAttempt(ref.type, ref.id, correct);
    starsGained += result.starsGained;
    mastery = Math.max(mastery, result.mastery);
  }

  return { starsGained, mastery, refs: [...unique.values()] };
}
