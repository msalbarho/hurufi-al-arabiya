/**
 * Live unit mastery + prerequisite unlock.
 * Pure: no React, no Zustand. Progress facts come from the existing item store.
 */
import type {
  CurriculumBundle,
  ExerciseDefinition,
  ExerciseMasteryTarget,
  LearningUnitDefinition,
} from "../../content/curriculum/index.ts";
import { emptyProgress, type ItemProgress, type ItemType } from "../rules/mastery.ts";

export interface LiveMasteryRef {
  portableMasteryId: string;
  skillId: string;
  type: ItemType;
  /** Progress store id (not the prototype letter grid id). */
  id: string;
  liveKey: string;
}

export interface UnitMasteryEvaluation {
  mastered: boolean;
  attempts: number;
  correct: number;
  accuracy: number;
  /** Max current streak among unique live refs. The store does not keep a best-ever streak. */
  streak: number;
  /**
   * Max `ItemProgress.sessions` among unique live refs.
   * That field is “distinct days with a correct answer” per item, not a unit visit log.
   */
  sessions: number;
  requiredAttempts: number;
  requiredAccuracy: number;
  requiredStreak?: number;
  requiredSessions?: number;
  completedTargets: number;
  totalTargets: number;
  activitiesDone: number;
  activitiesTotal: number;
  blockers: string[];
  /**
   * Required skills with no mastery target on this unit.
   * Production validation should reject this shape. Runtime still fail-closes.
   */
  unmappedRequiredSkills: string[];
}

export type UnitPathStatus = "locked" | "start" | "continue" | "review" | "mastered";
export type UnitRouteAccess = "locked" | "coming_soon" | "play";

function facetForTarget(target: ExerciseMasteryTarget): string {
  switch (target.skillId) {
    case "skill.letter_sounds.core":
      return "sound";
    case "skill.handwriting.isolated":
      return "tracing";
    case "skill.letter_recognition.core":
      // Isolated recognition from sound-to-letter shares the sound item.
      // Distinct from tracing / positional-form keys. Not letter:${id} free-play.
      return target.letterForm ? `form.${target.letterForm}` : "sound";
    case "skill.letter_forms.positional":
      return target.letterForm ? `form.${target.letterForm}` : "form";
    case "skill.short_vowel.fatha":
      return "fatha";
    case "skill.short_vowel.kasra":
      return "kasra";
    case "skill.short_vowel.damma":
      return "damma";
    case "skill.syllable_blending.cv": {
      return "blend";
    }
    case "skill.word_decoding.simple":
      return "decode";
    default:
      return target.skillId.replace(/^skill\./, "").replace(/\./g, "_");
  }
}

function vowelFacetFromSkill(skillId: string | undefined): string | undefined {
  if (skillId === "skill.short_vowel.fatha") return "fatha";
  if (skillId === "skill.short_vowel.kasra") return "kasra";
  if (skillId === "skill.short_vowel.damma") return "damma";
  return undefined;
}

/**
 * Stable live progress key for a taught CV syllable.
 *
 * Wave 1 persisted shape (do not rename): `letter:{legacyId}.{vowelFacet}`
 *   syllable.mim.fatha → letter:mim.fatha
 *   syllable.lam.fatha → letter:lam.fatha
 *
 * Blending (`skill.syllable_blending.cv`) and short-vowel targets on the
 * same syllable share this key so one attempt is not counted twice.
 * Future syllables must go through this helper — do not concatenate ad hoc.
 */
export function getSyllableLiveKey(args: {
  syllableId?: string;
  letterLegacyId?: string;
  letterId?: string;
  vowelSkillId?: string;
}): { type: ItemType; id: string; liveKey: string } {
  const stem = args.letterLegacyId ?? args.letterId ?? args.syllableId ?? "item";
  const facet = vowelFacetFromSkill(args.vowelSkillId) ?? "blend";
  const id = `${stem}.${facet}`;
  return { type: "letter", id, liveKey: `letter:${id}` };
}

/**
 * Stable live progress key for a taught positional letter form.
 *
 * Wave 1 persisted shape (do not rename): `letter:{legacyId}.form.{slot}`
 *   letter.lam medial → letter:lam.form.medial
 */
export function getLetterFormLiveKey(args: {
  letterLegacyId?: string;
  letterId?: string;
  form: string;
}): { type: ItemType; id: string; liveKey: string } {
  const stem = args.letterLegacyId ?? args.letterId ?? "item";
  const id = `${stem}.form.${args.form}`;
  return { type: "letter", id, liveKey: `letter:${id}` };
}

/**
 * Stable live progress key for a taught word-decoding item.
 *
 * Wave 1 persisted shape: `word:{slug}.decoding`
 *   word.qalam → word:qalam.decoding
 *
 * Distinct from letter/syllable keys and from 720-bank ids (`school-8`).
 * Future word-decoding exercises must go through this helper.
 */
export function getWordLiveKey(args: {
  wordId?: string;
}): { type: ItemType; id: string; liveKey: string } {
  const raw = args.wordId && args.wordId.length > 0 ? args.wordId : "item";
  const stem = raw.startsWith("word.") ? raw.slice("word.".length) : raw;
  const id = `${stem}.decoding`;
  return { type: "word", id, liveKey: `word:${id}` };
}

/**
 * Short-vowel / haraka discrimination on a taught letter.
 * Persisted shape matches `getSyllableLiveKey` (`letter:mim.fatha`).
 * Kasra and damma use their own facets; they do not collapse onto fatha.
 */
export function getHarakaLiveKey(args: {
  letterLegacyId?: string;
  letterId?: string;
  vowelSkillId: string;
}): { type: ItemType; id: string; liveKey: string } {
  return getSyllableLiveKey(args);
}

export function liveRefForTarget(bundle: CurriculumBundle, target: ExerciseMasteryTarget): LiveMasteryRef {
  const syllable = target.syllableId
    ? bundle.syllables?.find((row) => row.id === target.syllableId)
    : undefined;
  const letterId = target.letterId ?? syllable?.letterId;
  const letter = letterId ? bundle.letters.find((row) => row.id === letterId) : undefined;
  if (
    target.wordId &&
    (target.skillId === "skill.word_decoding.simple" || (!target.syllableId && !target.letterId))
  ) {
    const keyed = getWordLiveKey({ wordId: target.wordId });
    return {
      portableMasteryId: target.id,
      skillId: target.skillId,
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    };
  }
  if (syllable && (target.syllableId || target.skillId === "skill.syllable_blending.cv")) {
    const keyed = getSyllableLiveKey({
      syllableId: syllable.id,
      ...(letter?.legacyId ? { letterLegacyId: letter.legacyId } : {}),
      ...(letterId ? { letterId } : {}),
      ...(syllable.vowelSkillId ? { vowelSkillId: syllable.vowelSkillId } : {}),
    });
    return {
      portableMasteryId: target.id,
      skillId: target.skillId,
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    };
  }
  if (
    target.letterForm &&
    (target.skillId === "skill.letter_forms.positional" || target.skillId === "skill.letter_recognition.core")
  ) {
    const keyed = getLetterFormLiveKey({
      ...(letter?.legacyId ? { letterLegacyId: letter.legacyId } : {}),
      ...(letterId ? { letterId } : {}),
      form: target.letterForm,
    });
    return {
      portableMasteryId: target.id,
      skillId: target.skillId,
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    };
  }
  const stem = letter?.legacyId ?? letterId ?? target.wordId ?? target.syllableId ?? "item";
  const id = `${stem}.${facetForTarget(target)}`;
  return {
    portableMasteryId: target.id,
    skillId: target.skillId,
    type: "letter",
    id,
    liveKey: `letter:${id}`,
  };
}

export function exercisesForUnit(bundle: CurriculumBundle, unit: LearningUnitDefinition): ExerciseDefinition[] {
  const byId = new Map(bundle.exercises.map((exercise) => [exercise.id, exercise]));
  return (unit.exerciseIds ?? []).flatMap((id) => {
    const exercise = byId.get(id);
    return exercise ? [exercise] : [];
  });
}

function uniqueRefsForTargets(
  bundle: CurriculumBundle,
  targets: ExerciseMasteryTarget[],
): LiveMasteryRef[] {
  const seen = new Set<string>();
  const refs: LiveMasteryRef[] = [];
  for (const target of targets) {
    const ref = liveRefForTarget(bundle, target);
    if (seen.has(ref.liveKey)) continue;
    seen.add(ref.liveKey);
    refs.push(ref);
  }
  return refs;
}

function uniqueRefsForExercises(bundle: CurriculumBundle, exercises: ExerciseDefinition[]): LiveMasteryRef[] {
  return uniqueRefsForTargets(
    bundle,
    exercises.flatMap((exercise) => exercise.masteryTargets ?? []),
  );
}

function warnUnmappedRequiredSkills(unitId: string, skillIds: readonly string[]): void {
  const dev =
    typeof import.meta !== "undefined" &&
    Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);
  if (!dev) return;
  console.warn(
    `[unitMastery] unit "${unitId}" required skill(s) have no measurable mastery target: ${skillIds.join(", ")}`,
  );
}

function itemFor(items: Record<string, ItemProgress>, ref: LiveMasteryRef): ItemProgress {
  return items[ref.liveKey] ?? emptyProgress();
}

function targetHasCorrect(items: Record<string, ItemProgress>, ref: LiveMasteryRef): boolean {
  return itemFor(items, ref).correct >= 1;
}

export function exerciseActivitiesComplete(
  bundle: CurriculumBundle,
  exercise: ExerciseDefinition,
  items: Record<string, ItemProgress>,
): boolean {
  const refs = uniqueRefsForTargets(bundle, exercise.masteryTargets ?? []);
  if (refs.length === 0) return false;
  return refs.every((ref) => targetHasCorrect(items, ref));
}

/**
 * Lesson-flow completion: each activity is done after every (unique) target
 * has at least one correct attempt. This is not unit mastery and is not minAttempts.
 */
export function unitExerciseCompletion(
  bundle: CurriculumBundle,
  unit: LearningUnitDefinition,
  exercises: ExerciseDefinition[],
  items: Record<string, ItemProgress>,
): { done: number; total: number; firstIncomplete: number } {
  const total = exercises.length;
  let done = 0;
  let firstIncomplete = 0;
  let foundIncomplete = false;

  exercises.forEach((exercise, index) => {
    const complete = exerciseActivitiesComplete(bundle, exercise, items);
    if (complete) done += 1;
    else if (!foundIncomplete) {
      firstIncomplete = index;
      foundIncomplete = true;
    }
  });

  void unit;
  return { done, total, firstIncomplete: foundIncomplete ? firstIncomplete : 0 };
}

function aggregateRefs(refs: LiveMasteryRef[], items: Record<string, ItemProgress>) {
  let attempts = 0;
  let correct = 0;
  let streak = 0;
  let sessions = 0;
  let completedTargets = 0;
  for (const ref of refs) {
    const row = itemFor(items, ref);
    attempts += row.attempts;
    correct += row.correct;
    streak = Math.max(streak, row.streak);
    sessions = Math.max(sessions, row.sessions);
    if (row.correct >= 1) completedTargets += 1;
  }
  const accuracy = attempts > 0 ? correct / attempts : 0;
  return { attempts, correct, accuracy, streak, sessions, completedTargets };
}

/**
 * Unit mastery uses portable `unit.mastery` against unique live progress refs.
 *
 * minAttempts / minAccuracy are unit aggregates across those refs — not
 * “repeat every activity N times before leaving the lesson”.
 *
 * minSessions uses existing per-item `sessions` (distinct correct days).
 * There is no separate unit-session counter; we do not invent one.
 */
export function evaluateUnitMastery(
  bundle: CurriculumBundle,
  unit: LearningUnitDefinition,
  exercises: ExerciseDefinition[],
  items: Record<string, ItemProgress>,
): UnitMasteryEvaluation {
  const criteria = unit.mastery;
  const refs = uniqueRefsForExercises(bundle, exercises);
  const stats = aggregateRefs(refs, items);
  const activities = unitExerciseCompletion(bundle, unit, exercises, items);
  const blockers: string[] = [];

  const allTargets = exercises.flatMap((exercise) => exercise.masteryTargets ?? []);
  const mappedSkills = new Set(allTargets.map((target) => target.skillId));
  const unmappedRequiredSkills = (criteria.requiredSkillIds ?? []).filter((skillId) => !mappedSkills.has(skillId));

  if (unmappedRequiredSkills.length > 0) {
    for (const skillId of unmappedRequiredSkills) {
      blockers.push(`required skill ${skillId} has no mastery target`);
    }
    warnUnmappedRequiredSkills(unit.id, unmappedRequiredSkills);
  }

  if (refs.length === 0) blockers.push("no mastery targets");
  if (stats.completedTargets < refs.length) {
    blockers.push(`targets ${stats.completedTargets}/${refs.length} with a correct attempt`);
  }
  if (stats.attempts < criteria.minAttempts) {
    blockers.push(`attempts ${stats.attempts} < ${criteria.minAttempts}`);
  }
  if (stats.accuracy < criteria.minAccuracy) {
    blockers.push(`accuracy ${stats.accuracy.toFixed(3)} < ${criteria.minAccuracy}`);
  }
  if (criteria.minStreak !== undefined && stats.streak < criteria.minStreak) {
    blockers.push(`streak ${stats.streak} < ${criteria.minStreak}`);
  }
  if (criteria.minSessions !== undefined && stats.sessions < criteria.minSessions) {
    blockers.push(`sessions ${stats.sessions} < ${criteria.minSessions} (per-item correct days)`);
  }
  for (const skillId of criteria.requiredSkillIds ?? []) {
    const matching = allTargets.filter((target) => target.skillId === skillId);
    if (matching.length === 0) continue;
    if (!matching.every((target) => targetHasCorrect(items, liveRefForTarget(bundle, target)))) {
      blockers.push(`required skill ${skillId} incomplete`);
    }
  }

  return {
    mastered: blockers.length === 0 && refs.length > 0,
    attempts: stats.attempts,
    correct: stats.correct,
    accuracy: stats.accuracy,
    streak: stats.streak,
    sessions: stats.sessions,
    requiredAttempts: criteria.minAttempts,
    requiredAccuracy: criteria.minAccuracy,
    ...(criteria.minStreak !== undefined ? { requiredStreak: criteria.minStreak } : {}),
    ...(criteria.minSessions !== undefined ? { requiredSessions: criteria.minSessions } : {}),
    completedTargets: stats.completedTargets,
    totalTargets: refs.length,
    activitiesDone: activities.done,
    activitiesTotal: activities.total,
    blockers,
    unmappedRequiredSkills,
  };
}

export interface UnitUnlockEvaluation {
  unlocked: boolean;
  blockers: string[];
  missingPrereqs: string[];
}

function unitById(units: LearningUnitDefinition[], id: string): LearningUnitDefinition | undefined {
  return units.find((row) => row.id === id);
}

/**
 * A unit with no prereqUnitIds is unlocked.
 * Otherwise every prerequisite unit in the same bundle/path must be mastered.
 * Missing/invalid prereqs fail closed.
 */
export function evaluateUnitUnlock(
  bundle: CurriculumBundle,
  pathUnits: LearningUnitDefinition[],
  unit: LearningUnitDefinition,
  items: Record<string, ItemProgress>,
): UnitUnlockEvaluation {
  const prereqs = unit.prereqUnitIds ?? [];
  if (prereqs.length === 0) return { unlocked: true, blockers: [], missingPrereqs: [] };

  const catalog = bundle.units ?? [];
  const blockers: string[] = [];
  const missingPrereqs: string[] = [];

  for (const prereqId of prereqs) {
    const prereq = unitById(pathUnits, prereqId) ?? unitById(catalog, prereqId);
    if (!prereq) {
      missingPrereqs.push(prereqId);
      blockers.push(`missing prereq ${prereqId}`);
      continue;
    }
    const mastery = evaluateUnitMastery(bundle, prereq, exercisesForUnit(bundle, prereq), items);
    if (!mastery.mastered) {
      blockers.push(`prereq ${prereqId} not mastered`);
    }
  }

  return { unlocked: blockers.length === 0, blockers, missingPrereqs };
}

export function unitPathStatus(
  unlocked: boolean,
  mastery: UnitMasteryEvaluation,
): UnitPathStatus {
  if (!unlocked) return "locked";
  if (mastery.mastered) return "mastered";
  if (mastery.attempts === 0 && mastery.activitiesDone === 0) return "start";
  if (mastery.activitiesDone >= mastery.activitiesTotal && mastery.activitiesTotal > 0) return "review";
  return "continue";
}

export function resolveUnitRouteAccess(unlocked: boolean, renderersReady: boolean): UnitRouteAccess {
  if (!unlocked) return "locked";
  if (!renderersReady) return "coming_soon";
  return "play";
}
