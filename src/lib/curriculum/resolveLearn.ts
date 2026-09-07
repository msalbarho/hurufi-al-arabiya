import {
  WAVE1_PATH_ID,
  type CurriculumBundle,
  type ExerciseDefinition,
  type LearningPathDefinition,
  type LearningUnitDefinition,
} from "@/content/curriculum/index.ts";
import { legacyLetterFromCanonical } from "./letterAdapter.ts";
import { exercisesForUnit } from "./unitMastery.ts";
import { getWave1Bundle } from "./wave1Bundle.ts";

export const WAVE1_SLUG = "wave-1";

const WAVE_SLUGS: Record<string, { pathId: string; load: () => CurriculumBundle }> = {
  [WAVE1_SLUG]: { pathId: WAVE1_PATH_ID, load: getWave1Bundle },
};

export function unitSlugForOrder(order: number): string {
  return `unit-${order}`;
}

export function parseUnitSlug(unitSlug: string): number | undefined {
  const match = /^unit-(\d+)$/.exec(unitSlug);
  if (!match) return undefined;
  const order = Number(match[1]);
  return Number.isInteger(order) && order > 0 ? order : undefined;
}

function unitsForPath(bundle: CurriculumBundle, path: LearningPathDefinition): LearningUnitDefinition[] {
  const byId = new Map((bundle.units ?? []).map((unit) => [unit.id, unit]));
  return path.unitIds.flatMap((id) => {
    const unit = byId.get(id);
    return unit ? [unit] : [];
  });
}

export { exercisesForUnit };

export interface LearnPathView {
  waveSlug: string;
  bundle: CurriculumBundle;
  path: LearningPathDefinition;
  units: LearningUnitDefinition[];
}

export interface LearnUnitView {
  waveSlug: string;
  unitSlug: string;
  bundle: CurriculumBundle;
  path: LearningPathDefinition;
  unit: LearningUnitDefinition;
  units: LearningUnitDefinition[];
  exercises: ExerciseDefinition[];
}

export function resolveLearnPath(waveSlug: string): LearnPathView | undefined {
  const spec = WAVE_SLUGS[waveSlug];
  if (!spec) return undefined;
  const bundle = spec.load();
  const path = bundle.paths?.find((row) => row.id === spec.pathId);
  if (!path) return undefined;
  return { waveSlug, bundle, path, units: unitsForPath(bundle, path) };
}

export function resolveLearnUnit(waveSlug: string, unitSlug: string): LearnUnitView | undefined {
  const pathView = resolveLearnPath(waveSlug);
  if (!pathView) return undefined;
  const order = parseUnitSlug(unitSlug);
  if (order === undefined) return undefined;
  const unit = pathView.units.find((row) => row.order === order);
  if (!unit) return undefined;
  const exercises = exercisesForUnit(pathView.bundle, unit);
  return {
    ...pathView,
    unitSlug,
    unit,
    exercises,
  };
}

export function missingLearnRefs(view: LearnUnitView): string[] {
  const missing: string[] = [];
  const listed = view.unit.exerciseIds ?? [];
  if (listed.length !== view.exercises.length) {
    const found = new Set(view.exercises.map((exercise) => exercise.id));
    for (const id of listed) {
      if (!found.has(id)) missing.push(`exercise ${id}`);
    }
  }
  for (const exercise of view.exercises) {
    if (!exercise.masteryTargets?.length) missing.push(`masteryTargets on ${exercise.id}`);
    for (const target of exercise.masteryTargets ?? []) {
      if (target.letterId && !view.bundle.letters.some((letter) => letter.id === target.letterId)) {
        missing.push(`letter ${target.letterId} on ${target.id}`);
      }
      if (
        target.syllableId &&
        !view.bundle.syllables?.some((syllable) => syllable.id === target.syllableId)
      ) {
        missing.push(`syllable ${target.syllableId} on ${target.id}`);
      }
      if (target.wordId && !view.bundle.words.some((word) => word.id === target.wordId)) {
        missing.push(`word ${target.wordId} on ${target.id}`);
      }
    }
  }
  if (import.meta.env.DEV) {
    for (const letterId of view.unit.letterIds ?? []) {
      if (!legacyLetterFromCanonical(view.bundle, letterId)) {
        missing.push(`legacy letters.ts mapping for ${letterId}`);
      }
    }
  }
  return missing;
}
