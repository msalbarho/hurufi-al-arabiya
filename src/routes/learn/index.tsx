import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { PageShell } from "@/components/kids/PageShell";
import { BackButton, SectionTitle, StarPill } from "@/components/kids/ui";
import { CurriculumLoadError } from "@/components/learn/CurriculumStatus.tsx";
import { unitExerciseCompletion } from "@/lib/curriculum/masteryAdapter.ts";
import { resolveLearnPath, unitSlugForOrder, WAVE1_SLUG } from "@/lib/curriculum/resolveLearn.ts";
import { AudioManager } from "@/lib/audio/AudioManager";
import { useProgress } from "@/lib/progress/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "طَرِيقُ التَّعَلُّم — حُرُوفِي العَرَبِيَّة" },
      { name: "description", content: "الموجة الأولى: تعلّم الحروف الأولى مع حُرُوفِي." },
      { property: "og:title", content: "طَرِيقُ التَّعَلُّم — حُرُوفِي العَرَبِيَّة" },
      { property: "og:description", content: "ابدأ وحدة الميم واللام." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnPathScreen,
});

function LearnPathScreen() {
  const view = resolveLearnPath(WAVE1_SLUG);
  const stars = useProgress((s) => s.stars);
  const items = useProgress((s) => s.items);

  if (!view) {
    return (
      <PageShell>
        <header className="mx-auto flex max-w-4xl items-center gap-4 px-6 pt-6">
          <BackButton />
        </header>
        <main className="mx-auto max-w-4xl px-6 pt-10 pb-16">
          <CurriculumLoadError detail="Wave 1 path did not resolve from literacy-path.wave-1.json" />
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <p className="text-xs font-bold text-coral">الْمَوْجَةُ الْأُولَى</p>
            <h1 className="font-display text-3xl font-extrabold leading-none">{view.path.titleAr}</h1>
          </div>
        </div>
        <StarPill stars={stars} />
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-8 pb-16">
        {view.path.descriptionAr ? (
          <p className="mb-8 text-lg leading-relaxed text-ink/60">{view.path.descriptionAr}</p>
        ) : null}
        <SectionTitle>الْوَحَدَات</SectionTitle>
        <div className="grid gap-5">
          {view.units.map((unit) => {
            const playable = unit.order === 1;
            const slug = unitSlugForOrder(unit.order);
            const exercises = playable
              ? (unit.exerciseIds ?? [])
                  .map((id) => view.bundle.exercises.find((row) => row.id === id))
                  .filter((row): row is NonNullable<typeof row> => Boolean(row))
              : [];
            const progress = playable
              ? unitExerciseCompletion(view.bundle, unit, exercises, items)
              : { done: 0, total: unit.exerciseIds?.length ?? 0, firstIncomplete: 0 };
            const ratio = progress.total ? progress.done / progress.total : 0;
            const cta = !playable ? "قَرِيباً" : progress.done === 0 ? "ابْدَأ" : progress.done >= progress.total ? "أَعِدْ" : "تَابِع";
            const objective =
              playable && exercises.length
                ? exercises
                    .map((ex) => ex.learningObjectiveAr)
                    .filter((text): text is string => Boolean(text))
                    .join(" · ")
                : undefined;

            const inner = (
              <>
                <span className="absolute -top-4 right-6 grid size-14 place-items-center rounded-full bg-sun font-display text-2xl font-extrabold text-ink shadow-chunky-xs">
                  {playable ? unit.order.toLocaleString("ar-EG") : <Lock className="size-6" />}
                </span>
                <h2 className="mt-2 font-display text-2xl font-extrabold">{unit.titleAr}</h2>
                {objective ? <p className="mt-2 text-sm leading-relaxed text-ink/55">{objective}</p> : (
                  <p className="mt-2 text-sm text-ink/45">الْوَحْدَةُ التَّالِيَة</p>
                )}
                {playable && progress.total > 0 ? (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-bold text-ink/50">
                      {progress.done.toLocaleString("ar-EG")} / {progress.total.toLocaleString("ar-EG")}
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full rounded-full bg-coral" style={{ width: `${Math.round(ratio * 100)}%` }} />
                    </div>
                  </div>
                ) : null}
                <span className={cn("mt-4 inline-flex items-center gap-1 text-sm font-bold", playable ? "text-coral" : "text-ink/40")}>
                  {cta} {playable ? <span>←</span> : null}
                </span>
              </>
            );

            const cardClass = cn(
              "group relative block rounded-3xl border-2 border-ink/10 bg-card p-5 pt-6 shadow-chunky",
              playable ? "press" : "opacity-70",
            );

            if (!playable) {
              return (
                <div
                  key={unit.id}
                  className={cardClass}
                  role="button"
                  aria-disabled
                  onClick={() => {
                    AudioManager.error();
                    void AudioManager.speak("قريباً");
                  }}
                >
                  {inner}
                </div>
              );
            }

            return (
              <Link
                key={unit.id}
                to="/learn/$waveId/$unitId"
                params={{ waveId: WAVE1_SLUG, unitId: slug }}
                className={cardClass}
                onClick={() => AudioManager.tap()}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </main>
    </PageShell>
  );
}
