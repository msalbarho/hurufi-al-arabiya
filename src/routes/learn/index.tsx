import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { PageShell } from "@/components/kids/PageShell";
import { BackButton, SectionTitle, StarPill } from "@/components/kids/ui";
import { CurriculumLoadError } from "@/components/learn/CurriculumStatus.tsx";
import {
  evaluateUnitMastery,
  evaluateUnitUnlock,
  exercisesForUnit,
  unitExerciseCompletion,
  unitPathCtaAr,
  unitPathStatus,
} from "@/lib/curriculum/unitMastery.ts";
import {
  listLearnModules,
  listLearnWaves,
  lookupLearnPrereq,
  moduleUnitSlug,
  unitSlugForOrder,
  waveLabelAr,
  type LearnModulePathView,
  type LearnPathView,
} from "@/lib/curriculum/resolveLearn.ts";
import { AudioManager } from "@/lib/audio/AudioManager";
import { useProgress } from "@/lib/progress/store";
import { cn } from "@/lib/utils";
import type { LearningUnitDefinition } from "@/content/curriculum/index.ts";
import type { ItemProgress } from "@/lib/rules/mastery.ts";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "طَرِيقُ التَّعَلُّم — حُرُوفِي العَرَبِيَّة" },
      { name: "description", content: "تعلّم الحروف والكلمات مع حُرُوفِي." },
      { property: "og:title", content: "طَرِيقُ التَّعَلُّم — حُرُوفِي العَرَبِيَّة" },
      { property: "og:description", content: "ابدأ رحلة القراءة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnPathScreen,
});

function LearnPathScreen() {
  const waves = listLearnWaves();
  const modules = listLearnModules();
  const stars = useProgress((s) => s.stars);
  const items = useProgress((s) => s.items);

  if (waves.length === 0) {
    return (
      <PageShell>
        <header className="mx-auto flex max-w-4xl items-center gap-4 px-6 pt-6">
          <BackButton />
        </header>
        <main className="mx-auto max-w-4xl px-6 pt-10 pb-16">
          <CurriculumLoadError detail="No literacy waves resolved from production JSON" />
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
            <p className="text-xs font-bold text-coral">طَرِيقُ التَّعَلُّم</p>
            <h1 className="font-display text-3xl font-extrabold leading-none">نَقْرَأُ</h1>
          </div>
        </div>
        <StarPill stars={stars} />
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-8 pb-16">
        {waves.map((view) => (
          <WaveSection key={view.waveSlug} view={view} items={items} />
        ))}
        {modules.map((view) => (
          <ModuleSection key={view.moduleSlug} view={view} items={items} />
        ))}
      </main>
    </PageShell>
  );
}

function WaveSection({
  view,
  items,
}: {
  view: LearnPathView;
  items: Record<string, ItemProgress>;
}) {
  return (
    <section className="mb-12 last:mb-0">
      <p className="text-xs font-bold text-coral">{waveLabelAr(view.waveSlug)}</p>
      <h2 className="mb-2 font-display text-3xl font-extrabold leading-none">{view.path.titleAr}</h2>
      {view.path.descriptionAr ? (
        <p className="mb-8 text-lg leading-relaxed text-ink/60">{view.path.descriptionAr}</p>
      ) : (
        <div className="mb-8" />
      )}
      <SectionTitle>الْوَحَدَات</SectionTitle>
      <div className="grid gap-5">
        {view.units.map((unit) => (
          <UnitCard key={unit.id} view={view} unit={unit} items={items} />
        ))}
      </div>
    </section>
  );
}

function UnitCard({
  view,
  unit,
  items,
}: {
  view: LearnPathView;
  unit: LearningUnitDefinition;
  items: Record<string, ItemProgress>;
}) {
  const exercises = exercisesForUnit(view.bundle, unit);
  const unlock = evaluateUnitUnlock(view.bundle, view.units, unit, items, lookupLearnPrereq);
  if (import.meta.env.DEV && unlock.missingPrereqs.length) {
    console.warn(`[learn] missing prereqs for ${unit.id}:`, unlock.missingPrereqs.join(", "));
  }
  const mastery = evaluateUnitMastery(view.bundle, unit, exercises, items);
  const status = unitPathStatus(unlock.unlocked, mastery);
  const playable = status !== "locked";
  const slug = unitSlugForOrder(unit.order);
  const progress = unitExerciseCompletion(view.bundle, unit, exercises, items);
  const ratio = progress.total ? progress.done / progress.total : 0;
  const cta = unitPathCtaAr(status);
  const objective = playable ? unit.childGoalAr : undefined;

  const inner = (
    <>
      <span className="absolute -top-4 right-6 grid size-14 place-items-center rounded-full bg-sun font-display text-2xl font-extrabold text-ink shadow-chunky-xs">
        {playable ? unit.order.toLocaleString("ar-EG") : <Lock className="size-6" />}
      </span>
      <h2 className="mt-2 font-display text-2xl font-extrabold">{unit.titleAr}</h2>
      {objective ? (
        <p className="mt-2 text-sm leading-relaxed text-ink/55">{objective}</p>
      ) : (
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
      {cta ? (
        <span className={cn("mt-4 inline-flex items-center gap-1 text-sm font-bold text-coral")}>
          {cta} <span>←</span>
        </span>
      ) : null}
    </>
  );

  const cardClass = cn(
    "group relative block rounded-3xl border-2 border-ink/10 bg-card p-5 pt-6 shadow-chunky",
    playable ? "press" : "opacity-70",
  );

  if (!playable) {
    return (
      <div
        className={cardClass}
        role="button"
        aria-disabled
        onClick={() => {
          AudioManager.error();
          void AudioManager.speak("أكمل الوحدة السابقة أولاً");
        }}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      to="/learn/$waveId/$unitId"
      params={{ waveId: view.waveSlug, unitId: slug }}
      className={cardClass}
      onClick={() => AudioManager.tap()}
    >
      {inner}
    </Link>
  );
}

function ModuleSection({
  view,
  items,
}: {
  view: LearnModulePathView;
  items: Record<string, ItemProgress>;
}) {
  const last = view.units[view.units.length - 1];
  const lastMastered = last
    ? evaluateUnitMastery(view.bundle, last, exercisesForUnit(view.bundle, last), items).mastered
    : false;
  return (
    <section className="mb-12 last:mb-0">
      <p className="text-xs font-bold text-coral">الْفُصُول</p>
      <h2 className="mb-2 font-display text-3xl font-extrabold leading-none">{view.path.titleAr}</h2>
      {view.path.descriptionAr ? (
        <p className="mb-8 text-lg leading-relaxed text-ink/60">{view.path.descriptionAr}</p>
      ) : (
        <div className="mb-8" />
      )}
      {lastMastered ? <p className="mb-4 text-sm font-bold text-coral">أَتْقَنْتَ</p> : null}
      <SectionTitle>الْوَحَدَات</SectionTitle>
      <div className="grid gap-5">
        {view.units.map((unit) => (
          <ModuleUnitCard key={unit.id} view={view} unit={unit} items={items} />
        ))}
      </div>
    </section>
  );
}

function ModuleUnitCard({
  view,
  unit,
  items,
}: {
  view: LearnModulePathView;
  unit: LearningUnitDefinition;
  items: Record<string, ItemProgress>;
}) {
  const exercises = exercisesForUnit(view.bundle, unit);
  const unlock = evaluateUnitUnlock(view.bundle, view.units, unit, items, lookupLearnPrereq);
  if (import.meta.env.DEV && unlock.missingPrereqs.length) {
    console.warn(`[learn] missing prereqs for ${unit.id}:`, unlock.missingPrereqs.join(", "));
  }
  const mastery = evaluateUnitMastery(view.bundle, unit, exercises, items);
  const status = unitPathStatus(unlock.unlocked, mastery);
  const playable = status !== "locked";
  const slug = moduleUnitSlug(unit.id);
  const progress = unitExerciseCompletion(view.bundle, unit, exercises, items);
  const ratio = progress.total ? progress.done / progress.total : 0;
  const cta = unitPathCtaAr(status);
  const objective = playable ? unit.childGoalAr : undefined;

  const inner = (
    <>
      <span className="absolute -top-4 right-6 grid size-14 place-items-center rounded-full bg-sun font-display text-2xl font-extrabold text-ink shadow-chunky-xs">
        {playable ? unit.order.toLocaleString("ar-EG") : <Lock className="size-6" />}
      </span>
      <h2 className="mt-2 font-display text-2xl font-extrabold">{unit.titleAr}</h2>
      {objective ? (
        <p className="mt-2 text-sm leading-relaxed text-ink/55">{objective}</p>
      ) : (
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
      {cta ? (
        <span className={cn("mt-4 inline-flex items-center gap-1 text-sm font-bold text-coral")}>
          {cta} <span>←</span>
        </span>
      ) : null}
    </>
  );

  const cardClass = cn(
    "group relative block rounded-3xl border-2 border-ink/10 bg-card p-5 pt-6 shadow-chunky",
    playable ? "press" : "opacity-70",
  );

  if (!playable) {
    return (
      <div
        className={cardClass}
        role="button"
        aria-disabled
        onClick={() => {
          AudioManager.error();
          void AudioManager.speak("أكمل الوحدة السابقة أولاً");
        }}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      to="/learn/modules/$moduleId/$unitId"
      params={{ moduleId: view.moduleSlug, unitId: slug }}
      className={cardClass}
      onClick={() => AudioManager.tap()}
    >
      {inner}
    </Link>
  );
}

