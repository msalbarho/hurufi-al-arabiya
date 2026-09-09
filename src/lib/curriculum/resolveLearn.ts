import {
  WAVE1_PATH_ID,
  WAVE2_PATH_ID,
  WAVE3_PATH_ID,
  WAVE4_PATH_ID,
  WAVE5_PATH_ID,
  WAVE6_PATH_ID,
  WAVE7_PATH_ID,
  WAVE8_PATH_ID,
  WAVE9_PATH_ID,
  WAVE10_PATH_ID,
  WAVE11_PATH_ID,
  WAVE12_PATH_ID,
  WAVE13_PATH_ID,
  WAVE14_PATH_ID,
  WAVE15_PATH_ID,
  WAVE16_PATH_ID,
  WAVE17_PATH_ID,
  WAVE18_PATH_ID,
  WAVE19_PATH_ID,
  WAVE20_PATH_ID,
  WAVE21_PATH_ID,
  WAVE22_PATH_ID,
  READING_FOUNDATIONS_PATH_ID,
  ORTHOGRAPHIC_FOUNDATIONS_PATH_ID,
  type CurriculumBundle,
  type ExerciseDefinition,
  type LearningPathDefinition,
  type LearningUnitDefinition,
} from "@/content/curriculum/index.ts";
import { legacyLetterFromCanonical } from "./letterAdapter.ts";
import {
  evaluateUnitMastery,
  evaluateUnitUnlock,
  exercisesForUnit,
  type UnitPrereqResolver,
} from "./unitMastery.ts";
import { getWave1Bundle } from "./wave1Bundle.ts";
import { getWave2Bundle } from "./wave2Bundle.ts";
import { getWave3Bundle } from "./wave3Bundle.ts";
import { getWave4Bundle } from "./wave4Bundle.ts";
import { getWave5Bundle } from "./wave5Bundle.ts";
import { getWave6Bundle } from "./wave6Bundle.ts";
import { getWave7Bundle } from "./wave7Bundle.ts";
import { getWave8Bundle } from "./wave8Bundle.ts";
import { getWave9Bundle } from "./wave9Bundle.ts";
import { getWave10Bundle } from "./wave10Bundle.ts";
import { getWave11Bundle } from "./wave11Bundle.ts";
import { getWave12Bundle } from "./wave12Bundle.ts";
import { getWave13Bundle } from "./wave13Bundle.ts";
import { getWave14Bundle } from "./wave14Bundle.ts";
import { getWave15Bundle } from "./wave15Bundle.ts";
import { getWave16Bundle } from "./wave16Bundle.ts";
import { getWave17Bundle } from "./wave17Bundle.ts";
import { getWave18Bundle } from "./wave18Bundle.ts";
import { getWave19Bundle } from "./wave19Bundle.ts";
import { getWave20Bundle } from "./wave20Bundle.ts";
import { getWave21Bundle } from "./wave21Bundle.ts";
import { getWave22Bundle } from "./wave22Bundle.ts";
import { getReadingFoundationsBundle } from "./readingFoundationsBundle.ts";
import { getOrthographicFoundationsBundle } from "./orthographicFoundationsBundle.ts";
import type { ItemProgress } from "../rules/mastery.ts";

export const WAVE1_SLUG = "wave-1";
export const WAVE2_SLUG = "wave-2";
export const WAVE3_SLUG = "wave-3";
export const WAVE4_SLUG = "wave-4";
export const WAVE5_SLUG = "wave-5";
export const WAVE6_SLUG = "wave-6";
export const WAVE7_SLUG = "wave-7";
export const WAVE8_SLUG = "wave-8";
export const WAVE9_SLUG = "wave-9";
export const WAVE10_SLUG = "wave-10";
export const WAVE11_SLUG = "wave-11";
export const WAVE12_SLUG = "wave-12";
export const WAVE13_SLUG = "wave-13";
export const WAVE14_SLUG = "wave-14";
export const WAVE15_SLUG = "wave-15";
export const WAVE16_SLUG = "wave-16";
export const WAVE17_SLUG = "wave-17";
export const WAVE18_SLUG = "wave-18";
export const WAVE19_SLUG = "wave-19";
export const WAVE20_SLUG = "wave-20";
export const WAVE21_SLUG = "wave-21";
export const WAVE22_SLUG = "wave-22";

export const LEARN_WAVE_SLUGS = [WAVE1_SLUG, WAVE2_SLUG, WAVE3_SLUG, WAVE4_SLUG, WAVE5_SLUG, WAVE6_SLUG, WAVE7_SLUG, WAVE8_SLUG, WAVE9_SLUG, WAVE10_SLUG, WAVE11_SLUG, WAVE12_SLUG, WAVE13_SLUG, WAVE14_SLUG, WAVE15_SLUG, WAVE16_SLUG, WAVE17_SLUG, WAVE18_SLUG, WAVE19_SLUG, WAVE20_SLUG, WAVE21_SLUG, WAVE22_SLUG] as const;

export const READING_FOUNDATIONS_SLUG = "reading-foundations";
export const ORTHOGRAPHIC_FOUNDATIONS_SLUG = "orthographic-foundations";
export const LEARN_MODULE_SLUGS = [READING_FOUNDATIONS_SLUG, ORTHOGRAPHIC_FOUNDATIONS_SLUG] as const;

const WAVE_LABELS_AR = [
  "الْمَوْجَةُ الْأُولَى",
  "الْمَوْجَةُ الثَّانِيَة",
  "الْمَوْجَةُ الثَّالِثَة",
  "الْمَوْجَةُ الرَّابِعَة",
  "الْمَوْجَةُ الْخَامِسَة",
  "الْمَوْجَةُ السَّادِسَة",
  "الْمَوْجَةُ السَّابِعَة",
  "الْمَوْجَةُ الثَّامِنَة",
  "الْمَوْجَةُ التَّاسِعَة",
  "الْمَوْجَةُ الْعَاشِرَة",
  "الْمَوْجَةُ الْحَادِيَةَ عَشْرَة",
  "الْمَوْجَةُ الثَّانِيَةَ عَشْرَة",
  "الْمَوْجَةُ الثَّالِثَةَ عَشْرَة",
  "الْمَوْجَةُ الرَّابِعَةَ عَشْرَة",
  "الْمَوْجَةُ الْخَامِسَةَ عَشْرَة",
  "الْمَوْجَةُ السَّادِسَةَ عَشْرَة",
  "الْمَوْجَةُ السَّابِعَةَ عَشْرَة",
  "الْمَوْجَةُ الثَّامِنَةَ عَشْرَة",
  "الْمَوْجَةُ التَّاسِعَةَ عَشْرَة",
  "الْمَوْجَةُ الْعِشْرُون",
  "الْمَوْجَةُ الْحَادِيَةُ وَالْعِشْرُون",
  "الْمَوْجَةُ الثَّانِيَةُ وَالْعِشْرُون",
] as const;

const WAVE_SLUGS: Record<string, { pathId: string; load: () => CurriculumBundle }> = {
  [WAVE1_SLUG]: { pathId: WAVE1_PATH_ID, load: getWave1Bundle },
  [WAVE2_SLUG]: { pathId: WAVE2_PATH_ID, load: getWave2Bundle },
  [WAVE3_SLUG]: { pathId: WAVE3_PATH_ID, load: getWave3Bundle },
  [WAVE4_SLUG]: { pathId: WAVE4_PATH_ID, load: getWave4Bundle },
  [WAVE5_SLUG]: { pathId: WAVE5_PATH_ID, load: getWave5Bundle },
  [WAVE6_SLUG]: { pathId: WAVE6_PATH_ID, load: getWave6Bundle },
  [WAVE7_SLUG]: { pathId: WAVE7_PATH_ID, load: getWave7Bundle },
  [WAVE8_SLUG]: { pathId: WAVE8_PATH_ID, load: getWave8Bundle },
  [WAVE9_SLUG]: { pathId: WAVE9_PATH_ID, load: getWave9Bundle },
  [WAVE10_SLUG]: { pathId: WAVE10_PATH_ID, load: getWave10Bundle },
  [WAVE11_SLUG]: { pathId: WAVE11_PATH_ID, load: getWave11Bundle },
  [WAVE12_SLUG]: { pathId: WAVE12_PATH_ID, load: getWave12Bundle },
  [WAVE13_SLUG]: { pathId: WAVE13_PATH_ID, load: getWave13Bundle },
  [WAVE14_SLUG]: { pathId: WAVE14_PATH_ID, load: getWave14Bundle },
  [WAVE15_SLUG]: { pathId: WAVE15_PATH_ID, load: getWave15Bundle },
  [WAVE16_SLUG]: { pathId: WAVE16_PATH_ID, load: getWave16Bundle },
  [WAVE17_SLUG]: { pathId: WAVE17_PATH_ID, load: getWave17Bundle },
  [WAVE18_SLUG]: { pathId: WAVE18_PATH_ID, load: getWave18Bundle },
  [WAVE19_SLUG]: { pathId: WAVE19_PATH_ID, load: getWave19Bundle },
  [WAVE20_SLUG]: { pathId: WAVE20_PATH_ID, load: getWave20Bundle },
  [WAVE21_SLUG]: { pathId: WAVE21_PATH_ID, load: getWave21Bundle },
  [WAVE22_SLUG]: { pathId: WAVE22_PATH_ID, load: getWave22Bundle },
};

const MODULE_SLUGS: Record<string, { pathId: string; load: () => CurriculumBundle }> = {
  [READING_FOUNDATIONS_SLUG]: { pathId: READING_FOUNDATIONS_PATH_ID, load: getReadingFoundationsBundle },
  [ORTHOGRAPHIC_FOUNDATIONS_SLUG]: { pathId: ORTHOGRAPHIC_FOUNDATIONS_PATH_ID, load: getOrthographicFoundationsBundle },
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

export function moduleUnitSlug(unitId: string): string {
  const stem = unitId.split(".").pop() ?? unitId;
  return stem.replaceAll("_", "-");
}

export function unitByModuleSlug(units: LearningUnitDefinition[], unitSlug: string): LearningUnitDefinition | undefined {
  return units.find((unit) => moduleUnitSlug(unit.id) === unitSlug);
}

export function waveLabelAr(waveSlug: string): string {
  if (waveSlug === WAVE1_SLUG) return WAVE_LABELS_AR[0];
  if (waveSlug === WAVE2_SLUG) return WAVE_LABELS_AR[1];
  if (waveSlug === WAVE3_SLUG) return WAVE_LABELS_AR[2];
  if (waveSlug === WAVE4_SLUG) return WAVE_LABELS_AR[3];
  if (waveSlug === WAVE5_SLUG) return WAVE_LABELS_AR[4];
  if (waveSlug === WAVE6_SLUG) return WAVE_LABELS_AR[5];
  if (waveSlug === WAVE7_SLUG) return WAVE_LABELS_AR[6];
  if (waveSlug === WAVE8_SLUG) return WAVE_LABELS_AR[7];
  if (waveSlug === WAVE9_SLUG) return WAVE_LABELS_AR[8];
  if (waveSlug === WAVE10_SLUG) return WAVE_LABELS_AR[9];
  if (waveSlug === WAVE11_SLUG) return WAVE_LABELS_AR[10];
  if (waveSlug === WAVE12_SLUG) return WAVE_LABELS_AR[11];
  if (waveSlug === WAVE13_SLUG) return WAVE_LABELS_AR[12];
  if (waveSlug === WAVE14_SLUG) return WAVE_LABELS_AR[13];
  if (waveSlug === WAVE15_SLUG) return WAVE_LABELS_AR[14];
  if (waveSlug === WAVE16_SLUG) return WAVE_LABELS_AR[15];
  if (waveSlug === WAVE17_SLUG) return WAVE_LABELS_AR[16];
  if (waveSlug === WAVE18_SLUG) return WAVE_LABELS_AR[17];
  if (waveSlug === WAVE19_SLUG) return WAVE_LABELS_AR[18];
  if (waveSlug === WAVE20_SLUG) return WAVE_LABELS_AR[19];
  if (waveSlug === WAVE21_SLUG) return WAVE_LABELS_AR[20];
  if (waveSlug === WAVE22_SLUG) return WAVE_LABELS_AR[21];
  return "طَرِيقُ التَّعَلُّم";
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

export interface LearnModulePathView {
  moduleSlug: string;
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

export interface LearnModuleUnitView {
  moduleSlug: string;
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

export function listLearnWaves(): LearnPathView[] {
  return LEARN_WAVE_SLUGS.flatMap((slug) => {
    const view = resolveLearnPath(slug);
    return view ? [view] : [];
  });
}

export function resolveLearnModulePath(moduleSlug: string): LearnModulePathView | undefined {
  const spec = MODULE_SLUGS[moduleSlug];
  if (!spec) return undefined;
  const bundle = spec.load();
  const path = bundle.paths?.find((row) => row.id === spec.pathId);
  if (!path) return undefined;
  return { moduleSlug, bundle, path, units: unitsForPath(bundle, path) };
}

export function listLearnModules(): LearnModulePathView[] {
  return LEARN_MODULE_SLUGS.flatMap((slug) => {
    const view = resolveLearnModulePath(slug);
    return view ? [view] : [];
  });
}

export function lookupLearnPrereq(id: string): ReturnType<UnitPrereqResolver> {
  for (const view of listLearnWaves()) {
    const unit = view.bundle.units?.find((row) => row.id === id);
    if (unit) return { bundle: view.bundle, unit };
  }
  for (const view of listLearnModules()) {
    const unit = view.bundle.units?.find((row) => row.id === id);
    if (unit) return { bundle: view.bundle, unit };
  }
  return undefined;
}

export interface ContinueLearnTarget {
  waveSlug?: string;
  moduleSlug?: string;
  unitSlug: string;
}

/** First unlocked unit that is not yet mastered, across registered waves then modules. */
export function resolveContinueLearn(items: Record<string, ItemProgress>): ContinueLearnTarget | undefined {
  for (const view of listLearnWaves()) {
    for (const unit of view.units) {
      const unlock = evaluateUnitUnlock(view.bundle, view.units, unit, items, lookupLearnPrereq);
      if (!unlock.unlocked) continue;
      const mastery = evaluateUnitMastery(
        view.bundle,
        unit,
        exercisesForUnit(view.bundle, unit),
        items,
      );
      if (!mastery.mastered) {
        return { waveSlug: view.waveSlug, unitSlug: unitSlugForOrder(unit.order) };
      }
    }
  }
  for (const view of listLearnModules()) {
    for (const unit of view.units) {
      const unlock = evaluateUnitUnlock(view.bundle, view.units, unit, items, lookupLearnPrereq);
      if (!unlock.unlocked) continue;
      const mastery = evaluateUnitMastery(
        view.bundle,
        unit,
        exercisesForUnit(view.bundle, unit),
        items,
      );
      if (!mastery.mastered) {
        return { moduleSlug: view.moduleSlug, unitSlug: moduleUnitSlug(unit.id) };
      }
    }
  }
  return undefined;
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

export function resolveLearnModuleUnit(moduleSlug: string, unitSlug: string): LearnModuleUnitView | undefined {
  const pathView = resolveLearnModulePath(moduleSlug);
  if (!pathView) return undefined;
  const unit = unitByModuleSlug(pathView.units, unitSlug);
  if (!unit) return undefined;
  const exercises = exercisesForUnit(pathView.bundle, unit);
  return {
    ...pathView,
    unitSlug,
    unit,
    exercises,
  };
}

export function missingLearnRefs(view: LearnUnitView | LearnModuleUnitView): string[] {
  const missing: string[] = [];
  const listed = view.unit.exerciseIds ?? [];
  if (listed.length !== view.exercises.length) {
    const found = new Set(view.exercises.map((exercise) => exercise.id));
    for (const id of listed) {
      if (!found.has(id)) missing.push(`exercise ${id}`);
    }
  }
  for (const exercise of view.exercises) {
    if (exercise.type === "presentation") continue;
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
      if (target.sentenceId && !view.bundle.sentences.some((sentence) => sentence.id === target.sentenceId)) {
        missing.push(`sentence ${target.sentenceId} on ${target.id}`);
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
