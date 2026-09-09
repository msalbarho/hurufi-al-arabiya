import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { BigButton } from "@/components/kids/ui";
import { playCurriculumAudio } from "@/lib/curriculum/audioAdapter.ts";
import { resolveSyllableBlending } from "@/lib/curriculum/syllableAdapter.ts";
import { AudioManager } from "@/lib/audio/AudioManager";
import { cn } from "@/lib/utils";
import { useMountedChoiceOrder } from "./useMountedChoiceOrder.ts";
import type { ExerciseViewProps } from "./exerciseTypes.ts";

export function SyllableBlendingExercise({ exercise, bundle, onResult, locked }: ExerciseViewProps) {
  const [wrongId, setWrongId] = useState<string | null>(null);
  const resolved = resolveSyllableBlending(bundle, exercise);
  const orderedIds = useMountedChoiceOrder(
    exercise.id,
    resolved?.choices.map((row) => row.id) ?? [],
  );

  const playPrompt = () => {
    if (!resolved) return;
    void playCurriculumAudio(bundle, resolved.promptAssetId, resolved.target.text);
  };

  useEffect(() => {
    const t = setTimeout(playPrompt, 450);
    return () => clearTimeout(t);
    // Replay when this activity mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  useEffect(() => {
    setWrongId(null);
  }, [exercise.id]);

  if (!resolved) {
    return <p className="text-center font-display text-2xl font-extrabold">تَعَذَّرَ تَحْمِيلُ الْمَقْطَع.</p>;
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
      <p className="mb-5 font-display text-2xl font-extrabold md:text-3xl">{resolved.promptText}</p>
      <BigButton tone="sun" onClick={playPrompt} className="mb-8 min-w-48" aria-label="استمع">
        <Volume2 className="size-8" /> اِسْتَمِعْ
      </BigButton>
      <div className={cn("mx-auto grid max-w-lg gap-4", displayChoices.length > 2 ? "grid-cols-3" : "grid-cols-2")}>
        {displayChoices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={locked}
            aria-label={choice.text}
            onClick={() => pick(choice.id)}
            className={cn(
              "press grid min-h-36 place-items-center rounded-3xl border-4 bg-card shadow-chunky",
              wrongId === choice.id ? "animate-wiggle border-coral bg-coral/10" : "border-ink/10",
              locked && "opacity-80",
            )}
          >
            <span className="arabic-letter text-7xl md:text-8xl">{choice.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
