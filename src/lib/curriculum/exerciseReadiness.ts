import type { ExerciseDefinition, ExerciseType } from "../../content/curriculum/index.ts";

/**
 * Exercise types that have a live renderer.
 * Keep in sync with `exerciseRegistry.tsx`.
 * Do not treat an unimplemented type as playable lesson content.
 */
export const READY_EXERCISE_TYPES: ReadonlySet<ExerciseType> = new Set([
  "sound_to_letter",
  "tracing",
  "syllable_blending",
  "letter_recognition",
  "audio_to_word",
  "missing_haraka",
  "picture_to_word",
]);

export function isExerciseTypeReady(type: ExerciseType): boolean {
  return READY_EXERCISE_TYPES.has(type);
}

export function unitRenderersReady(exercises: ExerciseDefinition[]): boolean {
  return exercises.every((exercise) => isExerciseTypeReady(exercise.type));
}
