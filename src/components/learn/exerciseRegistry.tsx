import type { ReactNode } from "react";
import type { ExerciseType } from "@/content/curriculum/index.ts";
import { isExerciseTypeReady } from "@/lib/curriculum/exerciseReadiness.ts";
import type { ExerciseViewProps } from "./exerciseTypes.ts";
import { AudioToWordExercise } from "./AudioToWordExercise.tsx";
import { LetterRecognitionExercise } from "./LetterRecognitionExercise.tsx";
import { SoundToLetterExercise } from "./SoundToLetterExercise.tsx";
import { TracingExercise } from "./TracingExercise.tsx";
import { SyllableBlendingExercise } from "./SyllableBlendingExercise.tsx";

const registry: Partial<Record<ExerciseType, (props: ExerciseViewProps) => ReactNode>> = {
  sound_to_letter: SoundToLetterExercise,
  tracing: TracingExercise,
  syllable_blending: SyllableBlendingExercise,
  letter_recognition: LetterRecognitionExercise,
  audio_to_word: AudioToWordExercise,
};

if (import.meta.env.DEV) {
  for (const type of Object.keys(registry) as ExerciseType[]) {
    if (!isExerciseTypeReady(type)) {
      console.warn(`[exerciseRegistry] ${type} is registered but missing from READY_EXERCISE_TYPES`);
    }
  }
}

export function renderExercise(type: ExerciseType, props: ExerciseViewProps) {
  const View = registry[type];
  if (View) return <View {...props} />;
  return <UnsupportedExercise type={type} />;
}

function UnsupportedExercise({ type }: { type: ExerciseType }) {
  if (import.meta.env.DEV) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-ink/20 bg-card p-6 text-center">
        <p className="font-display text-xl font-extrabold">Unsupported exercise type</p>
        <p className="mt-2 font-mono text-sm text-ink/60">{type}</p>
      </div>
    );
  }
  return (
    <p className="text-center font-display text-2xl font-extrabold text-ink/70">
      هَذَا النَّشَاطُ غَيْرُ جَاهِزٍ بَعْد
    </p>
  );
}
