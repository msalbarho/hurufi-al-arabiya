import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { BigButton } from "@/components/kids/ui";
import { letterSoundFallback, playCurriculumAudio } from "@/lib/curriculum/audioAdapter.ts";
import { isolatedGlyph } from "@/lib/curriculum/letterAdapter.ts";
import { AudioManager } from "@/lib/audio/AudioManager";
import { cn } from "@/lib/utils";
import { useMountedChoiceOrder } from "./useMountedChoiceOrder.ts";
import type { ExerciseViewProps } from "./exerciseTypes.ts";

export function SoundToLetterExercise({ exercise, bundle, onResult, locked }: ExerciseViewProps) {
  const [wrongId, setWrongId] = useState<string | null>(null);
  const correctId = exercise.success.correctChoiceId;
  const targetLetterId = exercise.masteryTargets?.[0]?.letterId ?? correctId ?? "";
  const fallback = letterSoundFallback(bundle, targetLetterId);
  const listedChoices = exercise.choices ?? [];
  const orderedIds = useMountedChoiceOrder(
    exercise.id,
    listedChoices.map((choice) => choice.id),
  );

  const playPrompt = () => {
    void playCurriculumAudio(bundle, exercise.promptAssetId, fallback);
  };

  useEffect(() => {
    const t = setTimeout(playPrompt, 400);
    return () => clearTimeout(t);
    // Replay when this activity mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  useEffect(() => {
    setWrongId(null);
  }, [exercise.id]);

  const pick = (choiceId: string) => {
    if (locked) return;
    AudioManager.tap();
    const correct = choiceId === correctId;
    if (!correct) {
      setWrongId(choiceId);
      setTimeout(() => setWrongId(null), 700);
    }
    onResult(correct);
  };

  const displayChoices = orderedIds.flatMap((id) => {
    const row = listedChoices.find((choice) => choice.id === id);
    return row ? [row] : [];
  });

  return (
    <div className="animate-pop text-center">
      <p className="mb-5 font-display text-2xl font-extrabold md:text-3xl">
        {exercise.promptText ?? exercise.learningObjectiveAr}
      </p>
      <BigButton tone="sun" onClick={playPrompt} className="mb-8 min-w-48" aria-label="اسمع الصوت مرة أخرى">
        <Volume2 className="size-8" /> اسمع
      </BigButton>
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-4">
        {displayChoices.map((choice) => {
          const glyph = isolatedGlyph(bundle, choice.id) ?? choice.label ?? "";
          return (
            <button
              key={choice.id}
              type="button"
              disabled={locked}
              aria-label={`حرف ${glyph}`}
              onClick={() => pick(choice.id)}
              className={cn(
                "press grid min-h-36 place-items-center rounded-3xl border-4 bg-card shadow-chunky",
                wrongId === choice.id ? "animate-wiggle border-coral bg-coral/10" : "border-ink/10",
                locked && "opacity-80",
              )}
            >
              <span className="arabic-letter text-7xl md:text-8xl">{glyph}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
