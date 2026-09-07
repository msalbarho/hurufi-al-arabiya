import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { BigButton } from "@/components/kids/ui";
import { playCurriculumAudio } from "@/lib/curriculum/audioAdapter.ts";
import { resolveWordToPicture } from "@/lib/curriculum/wordAdapter.ts";
import { AudioManager } from "@/lib/audio/AudioManager";
import { cn } from "@/lib/utils";
import { useMountedChoiceOrder } from "./useMountedChoiceOrder.ts";
import type { ExerciseViewProps } from "./exerciseTypes.ts";

export function WordToPictureExercise({ exercise, bundle, onResult, locked }: ExerciseViewProps) {
  const [wrongId, setWrongId] = useState<string | null>(null);
  const resolved = resolveWordToPicture(bundle, exercise);
  const audioPrompt =
    typeof exercise.promptAssetId === "string" && exercise.promptAssetId.startsWith("audio.")
      ? exercise.promptAssetId
      : undefined;
  const orderedIds = useMountedChoiceOrder(
    exercise.id,
    resolved?.choices.map((row) => row.id) ?? [],
  );

  const playPrompt = () => {
    if (!resolved || !audioPrompt) return;
    void playCurriculumAudio(bundle, audioPrompt, resolved.target.displayText);
  };

  useEffect(() => {
    setWrongId(null);
  }, [exercise.id]);

  if (!resolved) {
    return <p className="text-center font-display text-2xl font-extrabold">تَعَذَّرَ تَحْمِيلُ الصُّورَة.</p>;
  }

  const displayChoices = orderedIds.flatMap((id) => {
    const row = resolved.choices.find((choice) => choice.id === id);
    return row ? [row] : [];
  });

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
      <p className="mb-5 font-display text-2xl font-extrabold md:text-3xl">اِخْتَرِ الصُّورَةَ</p>
      <div className="mx-auto mb-8 grid min-h-36 max-w-xs place-items-center rounded-[2rem] border-4 border-sun bg-sun/20 px-6 shadow-chunky-xs">
        <span className="arabic-letter text-6xl md:text-7xl">{resolved.target.displayText}</span>
      </div>
      {audioPrompt ? (
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
            aria-label={choice.displayText}
            onClick={() => pick(choice.id)}
            className={cn(
              "press grid min-h-36 place-items-center rounded-3xl border-4 bg-card px-3 shadow-chunky",
              wrongId === choice.id ? "animate-wiggle border-coral bg-coral/10" : "border-ink/10",
              locked && "opacity-80",
            )}
          >
            <span className="text-7xl" aria-hidden>
              {choice.visual.kind === "emoji" ? choice.visual.emoji : "📷"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
