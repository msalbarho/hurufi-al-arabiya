import { useEffect } from "react";
import { Volume2 } from "lucide-react";
import { BigButton } from "@/components/kids/ui";
import { playCurriculumAudio } from "@/lib/curriculum/audioAdapter.ts";
import { resolvePresentation } from "@/lib/curriculum/presentationAdapter.ts";
import { AudioManager } from "@/lib/audio/AudioManager";
import type { ExerciseViewProps } from "./exerciseTypes.ts";

function glyphSizeClass(text: string | undefined): string {
  const value = text ?? "";
  const letters = value.replace(/[\u064B-\u065F\u0670]/g, "").replace(/\s+/g, "");
  if (/\s/.test(value) || letters.length >= 5) return "text-3xl leading-snug md:text-4xl";
  if (letters.length >= 3) return "text-4xl md:text-5xl";
  return "text-6xl md:text-7xl";
}

export function PresentationExercise({ exercise, bundle, onResult, locked }: ExerciseViewProps) {
  const resolved = resolvePresentation(bundle, exercise);

  const playPrompt = () => {
    if (!resolved) return;
    void playCurriculumAudio(bundle, resolved.promptAssetId, resolved.fallbackText);
  };

  useEffect(() => {
    if (!resolved) return;
    const t = setTimeout(playPrompt, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  if (!resolved) {
    return <p className="text-center font-display text-2xl font-extrabold">تَعَذَّرَ تَحْمِيلُ الدَّرْس.</p>;
  }

  const continueLesson = () => {
    if (locked) return;
    AudioManager.tap();
    onResult(true);
  };

  return (
    <div className="animate-pop text-center">
      <p className="mb-5 font-display text-2xl font-extrabold md:text-3xl">{resolved.headlineAr}</p>
      {resolved.show === "contrast" ? (
        <div className="mx-auto mb-8 flex max-w-lg flex-wrap items-center justify-center gap-3">
          <span className={`arabic-letter grid min-h-28 min-w-24 place-items-center rounded-3xl border-4 border-ink/10 bg-card px-4 shadow-chunky-xs ${glyphSizeClass(resolved.glyph)}`}>
            {resolved.glyph}
          </span>
          <span className="font-display text-3xl font-extrabold text-ink/40" aria-hidden>
            /
          </span>
          <span className={`arabic-letter grid min-h-28 min-w-24 place-items-center rounded-3xl border-4 border-coral bg-coral/10 px-4 shadow-chunky-xs ${glyphSizeClass(resolved.secondaryGlyph)}`}>
            {resolved.secondaryGlyph}
          </span>
        </div>
      ) : resolved.show === "cv" || resolved.show === "chunk" ? (
        <div className="mx-auto mb-8 flex max-w-lg flex-wrap items-center justify-center gap-3">
          <span className={`arabic-letter grid min-h-28 min-w-24 place-items-center rounded-3xl border-4 border-sun bg-sun/20 px-4 shadow-chunky-xs ${glyphSizeClass(resolved.glyph)}`}>
            {resolved.glyph}
          </span>
          <span className="font-display text-4xl font-extrabold text-ink/40" aria-hidden>
            +
          </span>
          <span className={`arabic-letter grid min-h-28 min-w-24 place-items-center rounded-3xl border-4 border-ink/10 bg-card px-4 shadow-chunky-xs ${glyphSizeClass(resolved.secondaryGlyph)}`}>
            {resolved.secondaryGlyph}
          </span>
          <span className="font-display text-4xl font-extrabold text-ink/40" aria-hidden>
            ←
          </span>
          <span className={`arabic-letter grid min-h-28 min-w-24 place-items-center rounded-3xl border-4 border-coral bg-coral/10 px-4 shadow-chunky-xs ${glyphSizeClass(resolved.resultGlyph)}`}>
            {resolved.resultGlyph}
          </span>
        </div>
      ) : (
        <div className="mx-auto mb-8 grid min-h-40 max-w-xs place-items-center rounded-[2rem] border-4 border-sun bg-sun/20 px-6 shadow-chunky-xs">
          <span className="arabic-letter text-7xl md:text-8xl">{resolved.glyph}</span>
        </div>
      )}
      <BigButton tone="sun" onClick={playPrompt} className="mb-6 min-w-48" aria-label="استمع">
        <Volume2 className="size-8" /> اِسْتَمِعْ
      </BigButton>
      <div>
        <BigButton tone="coral" onClick={continueLesson} className="min-w-48" aria-label="تابع">
          تَابِع
        </BigButton>
      </div>
    </div>
  );
}
