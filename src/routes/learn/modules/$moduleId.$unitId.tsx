import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/kids/PageShell";
import { BackButton } from "@/components/kids/ui";
import { CurriculumLoadError, UnitComingSoonCard, UnitLockedCard } from "@/components/learn/CurriculumStatus.tsx";
import { LessonPlayer } from "@/components/learn/LessonPlayer.tsx";
import { unitRenderersReady } from "@/lib/curriculum/exerciseReadiness.ts";
import {
  evaluateUnitUnlock,
  lessonEntry,
  resolveUnitRouteAccess,
} from "@/lib/curriculum/unitMastery.ts";
import { missingLearnRefs, resolveLearnModuleUnit, lookupLearnPrereq } from "@/lib/curriculum/resolveLearn.ts";
import { useProgress } from "@/lib/progress/store";

export const Route = createFileRoute("/learn/modules/$moduleId/$unitId")({
  loader: ({ params }) => {
    const view = resolveLearnModuleUnit(params.moduleId, params.unitId);
    if (!view) throw notFound();
    return { view };
  },
  head: ({ loaderData }) => {
    const unit = loaderData?.view.unit;
    const title = unit ? `${unit.titleAr} — حُرُوفِي العَرَبِيَّة` : "وَحْدَة — حُرُوفِي العَرَبِيَّة";
    return {
      meta: [
        { title },
        { name: "description", content: unit?.titleEn ?? "وحدة تعليمية" },
        { property: "og:title", content: title },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: LearnModuleUnitScreen,
});

function LearnModuleUnitScreen() {
  const { view } = Route.useLoaderData();
  const items = useProgress((s) => s.items);
  const hydrated = useProgress((s) => s.hydrated);
  const missing = missingLearnRefs(view);
  const entry = lessonEntry(view.bundle, view.unit, view.exercises, items);
  const unlock = evaluateUnitUnlock(view.bundle, view.units, view.unit, items, lookupLearnPrereq);
  const hasPrereqs = (view.unit.prereqUnitIds ?? []).length > 0;
  const unlocked = hasPrereqs ? hydrated && unlock.unlocked : unlock.unlocked;
  if (import.meta.env.DEV && unlock.missingPrereqs.length) {
    console.warn(`[learn] missing prereqs for ${view.unit.id}:`, unlock.missingPrereqs.join(", "));
  }
  const access = resolveUnitRouteAccess(unlocked, unitRenderersReady(view.exercises));

  return (
    <PageShell>
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-4">
          <BackButton to="/learn" />
          <div>
            <p className="text-xs font-bold text-coral">{view.path.titleAr}</p>
            <h1 className="font-display text-3xl font-extrabold leading-none">{view.unit.titleAr}</h1>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-4xl flex-col px-6 pt-8 pb-16">
        {missing.length > 0 ? (
          <CurriculumLoadError detail={missing.join("; ")} />
        ) : access === "locked" ? (
          <UnitLockedCard title={view.unit.titleAr} />
        ) : access === "coming_soon" ? (
          <UnitComingSoonCard title={view.unit.titleAr} />
        ) : (
          <LessonPlayer
            key={hydrated ? "ready" : "pending"}
            view={view}
            startAt={hydrated ? entry.startAt : 0}
            startFinished={hydrated ? entry.startFinished : false}
          />
        )}
      </main>
    </PageShell>
  );
}
