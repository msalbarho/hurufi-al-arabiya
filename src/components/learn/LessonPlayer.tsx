import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { recordExerciseAttempt, completePresentation } from "@/lib/curriculum/masteryAdapter.ts";
import { evaluateUnitMastery, lessonFinishMessageAr, lessonFinishKind, scheduleLesson } from "@/lib/curriculum/unitMastery.ts";
import { isPresentationExercise, isReinforcementExercise } from "@/lib/curriculum/presentationAdapter.ts";
import type { LearnModuleUnitView, LearnUnitView } from "@/lib/curriculum/resolveLearn.ts";
import { useProgress } from "@/lib/progress/store";
import { AudioManager } from "@/lib/audio/AudioManager";
import { FeedbackBurst } from "./FeedbackBurst.tsx";
import { renderExercise } from "./exerciseRegistry.tsx";

export function LessonPlayer({
  view,
  startAt,
  startFinished = false,
}: {
  view: Pick<LearnUnitView | LearnModuleUnitView, "bundle" | "unit" | "exercises">;
  startAt: number;
  startFinished?: boolean;
}) {
  const exercises = view.exercises;
  const total = exercises.length;
  const initial = Math.min(Math.max(0, startAt), Math.max(0, total - 1));
  const [step, setStep] = useState(initial);
  const [visit, setVisit] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "retry" | null>(null);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(startFinished || total === 0);

  const exercise = exercises[step];
  const progressLabel = useMemo(
    () => `${(step + 1).toLocaleString("ar-EG")} / ${total.toLocaleString("ar-EG")}`,
    [step, total],
  );

  if (finished || !exercise) {
    const items = useProgress.getState().items;
    const mastery = evaluateUnitMastery(view.bundle, view.unit, exercises, items);
    return (
      <div className="animate-pop mx-auto max-w-lg text-center">
        <div className="rounded-[2rem] border-2 border-ink/10 bg-card p-8 shadow-chunky">
          <p className="text-6xl" aria-hidden>
            🌟
          </p>
          <h2 className="mt-4 font-display text-4xl font-extrabold">أَحْسَنْتَ!</h2>
          <p className="mt-3 text-lg text-ink/60">{lessonFinishMessageAr(lessonFinishKind(mastery))}</p>
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
    const demo = isPresentationExercise(exercise);
    if (demo) {
      completePresentation(exercise);
    } else {
      recordExerciseAttempt(view.bundle, exercise, correct);
      if (correct && isReinforcementExercise(exercise)) completePresentation(exercise);
    }
    setLocked(true);
    if (demo || correct) {
      if (!demo) AudioManager.success();
      setFeedback(demo ? null : "ok");
      window.setTimeout(() => {
        setFeedback(null);
        setLocked(false);
        const items = useProgress.getState().items;
        const next = scheduleLesson(view.bundle, view.unit, exercises, items, { fromIndex: step });
        if (next.phase === "done") {
          setFinished(true);
          return;
        }
        setStep(next.index);
        setVisit((n) => n + 1);
      }, demo ? 400 : 1400);
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
      <div key={`${exercise.id}:${visit}`}>
        {renderExercise(exercise.type, {
          exercise,
          bundle: view.bundle,
          onResult: handleResult,
          locked,
        })}
      </div>
      {feedback ? <FeedbackBurst kind={feedback} /> : null}
    </div>
  );
}
