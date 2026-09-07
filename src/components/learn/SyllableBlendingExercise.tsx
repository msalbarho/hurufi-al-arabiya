import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { BigButton } from "@/components/kids/ui";
import { playCurriculumAudio } from "@/lib/curriculum/audioAdapter.ts";
import { hashString, resolveSyllableBlending, shuffleWithSeed } from "@/lib/curriculum/syllableAdapter.ts";
import { AudioManager } from "@/lib/audio/AudioManager";
import { cn } from "@/lib/utils";
import type { ExerciseViewProps } from "./exerciseTypes.ts";

export function SyllableBlendingExercise({ exercise, bundle, onResult, locked }: ExerciseViewProps) {
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [choiceOrder, setChoiceOrder] = useState<{ exerciseId: string; ids: string[] } | null>(null);
  const resolved = resolveSyllableBlending(bundle, exercise);

  const playLetter = () => {
    if (!resolved) return;
    void playCurriculumAudio(bundle, resolved.target.letterAudioId, resolved.target.letterGlyph);
  };

  const playSyllable = () => {
    if (!resolved) return;
    void playCurriculumAudio(bundle, resolved.target.syllableAudioId, resolved.target.text);
  };

  const playBlend = () => {
    if (!resolved) return;
    void (async () => {
      await playCurriculumAudio(bundle, resolved.target.letterAudioId, resolved.target.letterGlyph);
      await playCurriculumAudio(bundle, resolved.target.syllableAudioId, resolved.target.text);
    })();
  };

  useEffect(() => {
    const t = setTimeout(playBlend, 450);
    return () => clearTimeout(t);
    // Replay when this activity mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  useEffect(() => {
    setWrongId(null);
    if (!resolved) {
      setChoiceOrder(null);
      return;
    }
    const seed = (Date.now() ^ hashString(exercise.id)) >>> 0 || 1;
    setChoiceOrder({
      exerciseId: exercise.id,
      ids: shuffleWithSeed(resolved.choices, seed).map((row) => row.id),
    });
    // Shuffle once after mount / when the activity changes. JSON order is used
    // for SSR + the first client paint so hydration matches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  if (!resolved) {
    return <p className="text-center font-display text-2xl font-extrabold">تَعَذَّرَ تَحْمِيلُ الْمَقْطَع.</p>;
  }

  const displayChoices =
    choiceOrder?.exerciseId === exercise.id
      ? choiceOrder.ids.flatMap((id) => {
          const row = resolved.choices.find((choice) => choice.id === id);
          return row ? [row] : [];
        })
      : resolved.choices;

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
      <p className="mb-5 font-display text-2xl font-extrabold md:text-3xl">اِقْرَأْ</p>

      <div dir="rtl" className="mx-auto mb-6 flex max-w-lg flex-wrap items-center justify-center gap-3">
        <BlendPiece glyph={resolved.target.letterGlyph} label="الْحَرْف" onPlay={playLetter} />
        <span className="font-display text-4xl font-extrabold text-ink/35" aria-hidden>
          +
        </span>
        <BlendPiece glyph={resolved.target.harakaCarrier} label="الْحَرَكَة" onPlay={playSyllable} />
        <span className="font-display text-4xl font-extrabold text-coral" aria-hidden>
          ←
        </span>
        <BlendPiece glyph={resolved.target.text} label="الْمَقْطَع" prominent onPlay={playSyllable} />
      </div>

      <BigButton tone="sun" onClick={playBlend} className="mb-8 min-w-48" aria-label="استمع">
        <Volume2 className="size-8" /> اِسْتَمِعْ
      </BigButton>

      <p className="mb-5 font-display text-2xl font-extrabold md:text-3xl">
        {exercise.promptText ?? `أَيْنَ ${resolved.target.text}؟`}
      </p>

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

function BlendPiece({
  glyph,
  label,
  prominent,
  onPlay,
}: {
  glyph: string;
  label: string;
  prominent?: boolean;
  onPlay: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPlay}
      className={cn(
        "press grid min-h-28 min-w-24 place-items-center rounded-3xl border-4 bg-card px-4 shadow-chunky-xs",
        prominent ? "border-sun bg-sun/20" : "border-ink/10",
      )}
    >
      <span className={cn("arabic-letter", prominent ? "text-7xl md:text-8xl" : "text-6xl md:text-7xl")}>{glyph}</span>
    </button>
  );
}
