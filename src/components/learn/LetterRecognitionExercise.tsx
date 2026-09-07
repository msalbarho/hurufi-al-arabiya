import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { BigButton } from "@/components/kids/ui";
import { playCurriculumAudio } from "@/lib/curriculum/audioAdapter.ts";
import { resolveLetterRecognition } from "@/lib/curriculum/letterRecognitionAdapter.ts";
import { AudioManager } from "@/lib/audio/AudioManager";
import { cn } from "@/lib/utils";
import { useMountedChoiceOrder } from "./useMountedChoiceOrder.ts";
import type { ExerciseViewProps } from "./exerciseTypes.ts";

export function LetterRecognitionExercise({ exercise, bundle, onResult, locked }: ExerciseViewProps) {
  const [wrongId, setWrongId] = useState<string | null>(null);
  const resolved = resolveLetterRecognition(bundle, exercise);
  const orderedIds = useMountedChoiceOrder(
    exercise.id,
    resolved?.choices.map((row) => row.id) ?? [],
  );

  useEffect(() => {
    setWrongId(null);
  }, [exercise.id]);

  const playPrompt = () => {
    if (!resolved?.promptAssetId) return;
    void playCurriculumAudio(bundle, resolved.promptAssetId, resolved.promptGlyph);
  };

  useEffect(() => {
    if (!resolved?.promptAssetId) return;
    const t = setTimeout(playPrompt, 400);
    return () => clearTimeout(t);
    // Replay when this activity mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  if (!resolved) {
    return <p className="text-center font-display text-2xl font-extrabold">تَعَذَّرَ تَحْمِيلُ الْحَرْف.</p>;
  }

  const displayChoices = orderedIds.flatMap((id) => {
    const row = resolved.choices.find((choice) => choice.id === id);
    return row ? [row] : [];
  });

  const pick = (choiceId: string) => {
    if (locked) return;
    AudioManager.tap();
    const correct = choiceId === (exercise.success.correctChoiceId ?? resolved.targetLetterId);
    if (!correct) {
      setWrongId(choiceId);
      setTimeout(() => setWrongId(null), 700);
    }
    onResult(correct);
  };

  return (
    <div className="animate-pop text-center">
      <p className="mb-5 font-display text-2xl font-extrabold md:text-3xl">
        {resolved.promptText ?? "اِخْتَرِ الْحَرْفَ"}
      </p>

      <div className="mx-auto mb-6 grid min-h-36 max-w-xs place-items-center rounded-[2rem] border-4 border-sun bg-sun/20 px-6 shadow-chunky-xs">
        <span className="arabic-letter text-7xl md:text-8xl">{resolved.promptGlyph}</span>
      </div>

      {resolved.promptAssetId ? (
        <BigButton tone="sun" onClick={playPrompt} className="mb-8 min-w-48" aria-label="استمع">
          <Volume2 className="size-8" /> اِسْتَمِعْ
        </BigButton>
      ) : null}

      <div className={cn("mx-auto grid max-w-lg gap-4", displayChoices.length > 2 ? "grid-cols-3" : "grid-cols-2")}>
        {displayChoices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={locked}
            aria-label={choice.glyph}
            onClick={() => pick(choice.id)}
            className={cn(
              "press grid min-h-36 place-items-center rounded-3xl border-4 bg-card shadow-chunky",
              wrongId === choice.id ? "animate-wiggle border-coral bg-coral/10" : "border-ink/10",
              locked && "opacity-80",
            )}
          >
            <span className="arabic-letter text-7xl md:text-8xl">{choice.glyph}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
