import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { BigButton } from "@/components/kids/ui";
import { playCurriculumAudio } from "@/lib/curriculum/audioAdapter.ts";
import { resolveAudioToSentence } from "@/lib/curriculum/sentenceAdapter.ts";
import { AudioManager } from "@/lib/audio/AudioManager";
import { cn } from "@/lib/utils";
import { useMountedChoiceOrder } from "./useMountedChoiceOrder.ts";
import type { ExerciseViewProps } from "./exerciseTypes.ts";

function isLongLabel(text: string): boolean {
  const letters = text.replace(/[\u064B-\u065F\u0670]/g, "").replace(/\s+/g, "");
  return /\s/.test(text) || letters.length >= 5;
}

export function AudioToSentenceExercise({ exercise, bundle, onResult, locked }: ExerciseViewProps) {
  const [wrongId, setWrongId] = useState<string | null>(null);
  const resolved = resolveAudioToSentence(bundle, exercise);
  const orderedIds = useMountedChoiceOrder(
    exercise.id,
    resolved?.choices.map((row) => row.id) ?? [],
  );

  const playPrompt = () => {
    if (!resolved) return;
    void playCurriculumAudio(bundle, resolved.promptAssetId, resolved.target.displayText);
  };

  useEffect(() => {
    setWrongId(null);
  }, [exercise.id]);

  useEffect(() => {
    const t = setTimeout(playPrompt, 400);
    return () => clearTimeout(t);
    // Replay when this activity mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  if (!resolved) {
    return <p className="text-center font-display text-2xl font-extrabold">تَعَذَّرَ تَحْمِيلُ الْجُمْلَة.</p>;
  }

  const displayChoices = orderedIds.flatMap((id) => {
    const row = resolved.choices.find((choice) => choice.id === id);
    return row ? [row] : [];
  });
  const stacked = displayChoices.some((row) => isLongLabel(row.displayText));

  const pick = (choiceId: string) => {
    if (locked) return;
    AudioManager.tap();
    const correct = choiceId === resolved.target.id;
    if (!correct) {
      setWrongId(choiceId);
      setTimeout(() => setWrongId(null), 700);
    }
    onResult(correct);
  };

  return (
    <div className="animate-pop text-center">
      <p className="mb-5 font-display text-2xl font-extrabold md:text-3xl">اِخْتَرِ الْجُمْلَةَ</p>
      <BigButton tone="sun" onClick={playPrompt} className="mb-8 min-w-48" aria-label="استمع">
        <Volume2 className="size-8" /> اِسْتَمِعْ
      </BigButton>
      <div
        className={cn(
          "mx-auto grid gap-4",
          stacked ? "max-w-xl grid-cols-1" : displayChoices.length > 2 ? "max-w-lg grid-cols-3" : "max-w-lg grid-cols-2",
        )}
      >
        {displayChoices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={locked}
            aria-label={choice.displayText}
            onClick={() => pick(choice.id)}
            className={cn(
              "press grid min-h-36 place-items-center rounded-3xl border-4 bg-card px-3 py-4 shadow-chunky",
              wrongId === choice.id ? "animate-wiggle border-coral bg-coral/10" : "border-ink/10",
              locked && "opacity-80",
            )}
          >
            <span
              className={cn(
                "arabic-letter leading-snug",
                isLongLabel(choice.displayText) ? "text-3xl md:text-4xl" : "text-5xl md:text-6xl",
              )}
            >
              {choice.displayText}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
