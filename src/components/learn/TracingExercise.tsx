import { TracingCanvas } from "@/components/kids/TracingCanvas";
import { isolatedGlyph } from "@/lib/curriculum/letterAdapter.ts";
import type { ExerciseViewProps } from "./exerciseTypes.ts";

export function TracingExercise({ exercise, bundle, onResult, locked }: ExerciseViewProps) {
  const letterId =
    (typeof exercise.config?.["letterId"] === "string" ? exercise.config["letterId"] : undefined) ??
    exercise.masteryTargets?.[0]?.letterId ??
    exercise.contentIds[0];
  const glyph = letterId ? isolatedGlyph(bundle, letterId) : undefined;
  const threshold = exercise.success.coverageThreshold ?? 0.55;

  if (!glyph) {
    return <p className="text-center font-display text-2xl font-extrabold">تعذّر تحميل الحرف.</p>;
  }

  return (
    <div className="animate-pop text-center">
      <p className="mb-4 font-display text-2xl font-extrabold md:text-3xl">
        {exercise.promptText ?? exercise.learningObjectiveAr ?? "تتبّع الحرف بإصبعك"}
      </p>
      <TracingCanvas
        glyph={glyph}
        threshold={threshold}
        onComplete={() => {
          if (locked) return;
          onResult(true);
        }}
      />
    </div>
  );
}
