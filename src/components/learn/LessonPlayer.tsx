import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { recordExerciseAttempt } from "@/lib/curriculum/masteryAdapter.ts";
import type { LearnUnitView } from "@/lib/curriculum/resolveLearn.ts";
import { AudioManager } from "@/lib/audio/AudioManager";
import { FeedbackBurst } from "./FeedbackBurst.tsx";
import { renderExercise } from "./exerciseRegistry.tsx";

export function LessonPlayer({
  view,
  startAt,
}: {
  view: LearnUnitView;
  startAt: number;
}) {
  const exercises = view.exercises;
  const total = exercises.length;
  const initial = Math.min(Math.max(0, startAt), Math.max(0, total - 1));
  const [step, setStep] = useState(initial);
  const [feedback, setFeedback] = useState<"ok" | "retry" | null>(null);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(total === 0);

  const exercise = exercises[step];
  const progressLabel = useMemo(
    () => `${(step + 1).toLocaleString("ar-EG")} / ${total.toLocaleString("ar-EG")}`,
    [step, total],
  );

  if (finished || !exercise) {
    return (
      <div className="animate-pop mx-auto max-w-lg text-center">
        <div className="rounded-[2rem] border-2 border-ink/10 bg-card p-8 shadow-chunky">
          <p className="text-6xl" aria-hidden>
            🌟
          </p>
          <h2 className="mt-4 font-display text-4xl font-extrabold">أَحْسَنْتَ!</h2>
          <p className="mt-3 text-lg text-ink/60">أَكْمَلْتَ هَذِهِ الْوَحْدَة</p>
          <Link
            to="/learn"
            onClick={() => AudioManager.tap()}
            className="press mt-8 inline-flex min-h-[72px] items-center justify-center rounded-2xl bg-coral px-6 font-display text-2xl font-extrabold text-paper shadow-chunky-sm"
          >
            رُجُوعٌ لِلطَّرِيق
          </Link>
        </div>
      </div>
    );
  }

  const handleResult = (correct: boolean) => {
    if (locked) return;
    recordExerciseAttempt(view.bundle, exercise, correct);
    setLocked(true);
    if (correct) {
      AudioManager.success();
      setFeedback("ok");
      window.setTimeout(() => {
        setFeedback(null);
        setLocked(false);
        if (step + 1 >= total) setFinished(true);
        else setStep((n) => n + 1);
      }, 1400);
    } else {
      AudioManager.error();
      setFeedback("retry");
      window.setTimeout(() => {
        setFeedback(null);
        setLocked(false);
      }, 1100);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="font-display text-lg font-extrabold text-ink/50">{progressLabel}</p>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-coral transition-all"
            style={{ width: `${Math.round(((step + 1) / total) * 100)}%` }}
          />
        </div>
      </div>
      {renderExercise(exercise.type, {
        exercise,
        bundle: view.bundle,
        onResult: handleResult,
        locked,
      })}
      {feedback ? <FeedbackBurst kind={feedback} /> : null}
    </div>
  );
}
