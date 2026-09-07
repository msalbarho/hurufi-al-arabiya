/**
 * Maps portable mastery targets onto the existing progress store
 * without rewriting it.
 *
 * Live keys stay `letter:${id}`. Item ids encode the facet so
 * tracing stays distinct from sound.
 *
 * Isolated letter recognition from sound-to-letter shares `letter:mim.sound`
 * so one tap is not counted twice. `letter:mim` remains the free-play key.
 *
 * CV syllables use `getSyllableLiveKey` → `letter:{legacyId}.{vowel}` so
 * blending and short-vowel evidence on the same syllable share one live item.
 */
import type { CurriculumBundle, ExerciseDefinition } from "@/content/curriculum/index.ts";
import { useProgress } from "@/lib/progress/store";
import { portableLetter } from "./letterAdapter.ts";
import {
  liveRefForTarget,
  unitExerciseCompletion,
  type LiveMasteryRef,
} from "./unitMastery.ts";

export {
  evaluateUnitMastery,
  evaluateUnitUnlock,
  exerciseActivitiesComplete,
  getLetterFormLiveKey,
  getSyllableLiveKey,
  liveRefForTarget,
  unitExerciseCompletion,
  unitPathStatus,
  resolveUnitRouteAccess,
  type LiveMasteryRef,
  type UnitMasteryEvaluation,
  type UnitPathStatus,
  type UnitRouteAccess,
  type UnitUnlockEvaluation,
} from "./unitMastery.ts";

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
