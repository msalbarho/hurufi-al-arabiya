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
import { dayKey, emptyProgress, type ItemProgress, type ItemType } from "../rules/mastery.ts";
import {
  getPresentationLiveKey,
  isPresentationExercise,
  isReinforcementExercise,
  isReviewExercise,
} from "./presentationAdapter.ts";

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
  /**
   * Attempts, accuracy, streak, missing required corrects, or a new calendar
   * day that can still raise `minSessions`.
   */
  canAdvanceNow: boolean;
  /**
   * Same-session thresholds are met; only a later calendar day can raise
   * `minSessions`. Do not loop more practice today.
   */
  returnLater: boolean;
}

export type UnitPathStatus = "locked" | "start" | "continue" | "practice" | "later" | "review" | "mastered";
export type UnitRouteAccess = "locked" | "coming_soon" | "play";
export type LessonSchedulePhase = "required" | "optional" | "done";
export type LessonFinishKind = "mastered" | "later" | "keep_practicing";

export interface LessonSchedule {
  index: number;
  phase: LessonSchedulePhase;
  /** True when the same required exercise should remount for another scored attempt. */
  replay: boolean;
}

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
    case "skill.sentence_reading.two_word":
      return "reading";
    case "skill.short_vowel.fatha":
      return "fatha";
    case "skill.short_vowel.kasra":
      return "kasra";
    case "skill.short_vowel.damma":
      return "damma";
    case "skill.syllable_blending.cv": {
      return "blend";
    }
    case "skill.syllable_blending.cvc":
      return "closed";
    case "skill.sukun.basic":
      return "sukun";
    case "skill.long_vowel.madd":
      return "madd_alif";
    case "skill.long_vowel.madd_yaa":
      return "madd_yaa";
    case "skill.long_vowel.madd_waw":
      return "madd_waw";
    case "skill.tanween.damm":
      return "tanween_damm";
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
  if (skillId === "skill.sukun.basic") return "sukun";
  if (skillId === "skill.long_vowel.madd") return "madd_alif";
  if (skillId === "skill.long_vowel.madd_yaa") return "madd_yaa";
  if (skillId === "skill.long_vowel.madd_waw") return "madd_waw";
  return undefined;
}

/**
 * Evidence-key rule:
 * A live key identifies BOTH the content item AND the evidence facet.
 * Two exercises may share a key only when one child action is genuinely
 * equivalent evidence for that same facet (e.g. Unit 2 blending + fatha
 * co-target on the same مَ tap). Discrimination is not blending.
 *
 * Stable live progress key for a taught CV syllable.
 *
 * Wave 1 persisted shape (do not rename): `letter:{legacyId}.{vowelFacet}`
 *   syllable.mim.fatha → letter:mim.fatha
 *   syllable.lam.fatha → letter:lam.fatha
 *   syllable.ba.madd_alif → letter:ba.madd_alif
 * CVV madd uses this helper, never `getClosedChunkLiveKey`.
 *
 * On `syllable_blending` only: blending and a short-vowel co-target on the
 * same syllable share this key so one tap is not counted twice.
 * `missing_haraka` must use `getHarakaLiveKey`, not this helper.
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
 *
 * `audio_to_word`, `picture_to_word`, and `word_to_picture` share this
 * key when they score `skill.word_decoding.simple` on the same word:
 * both directions measure decoding that written form. Different words
 * never share a key (`word:walad.decoding` ≠ `word:yad.decoding`).
 *
 * Mixed-review exercises (`tag: review`) use `word:{slug}.review` so a
 * later unit can still require the child to read an old word. That does
 * not rewrite Wave 1 `.decoding` keys.
 *
 * A later wave that reviews the same word again must use a scoped facet
 * (`tag: review-wave6` → `word:{slug}.review.wave6`) so Wave 2
 * `word:qamar.review` is not reused as Wave 6 evidence.
 */
export function getWordLiveKey(args: {
  wordId?: string;
  facet?: "decoding" | "review" | "review.wave6";
}): { type: ItemType; id: string; liveKey: string } {
  const raw = args.wordId && args.wordId.length > 0 ? args.wordId : "item";
  const stem = raw.startsWith("word.") ? raw.slice("word.".length) : raw;
  const facet = args.facet ?? "decoding";
  const id = `${stem}.${facet}`;
  return { type: "word", id, liveKey: `word:${id}` };
}

/**
 * Stable live progress key for a taught sentence-reading item.
 *
 * Persisted shape: `sentence:{stem}.reading`
 *   sentence.l4.001 → sentence:l4.001.reading
 *
 * Distinct from word decoding (`word:{slug}.decoding`) and from
 * presentation-seen keys. One portable sentence id maps to one live key.
 * `audio_to_sentence` uses this when it scores sentence reading.
 */
export function getSentenceLiveKey(args: {
  sentenceId?: string;
}): { type: ItemType; id: string; liveKey: string } {
  const raw = args.sentenceId && args.sentenceId.length > 0 ? args.sentenceId : "item";
  const stem = raw.startsWith("sentence.") ? raw.slice("sentence.".length) : raw;
  const id = `${stem}.reading`;
  return { type: "sentence", id, liveKey: `sentence:${id}` };
}

function letterStem(args: { letterLegacyId?: string; letterId?: string }): string {
  const raw = args.letterLegacyId ?? args.letterId ?? "item";
  return raw.startsWith("letter.") ? raw.slice("letter.".length) : raw;
}

/**
 * Short-vowel / haraka discrimination on a taught letter.
 *
 * Distinct from syllable blending. Persisted shape uses the existing
 * `diacritic` store type (not `letter:`) so Unit 2 `letter:mim.fatha`
 * progress is not reused:
 *   mim + fatha → `diacritic:mim.fatha.discrimination`
 *   mim + kasra → `diacritic:mim.kasra.discrimination`
 *   mim + damma → `diacritic:mim.damma.discrimination`
 *
 * Kasra and damma never collapse onto fatha. Sukun is a distinct facet
 * (`diacritic:{stem}.sukun.discrimination`) and must not fall through to
 * `.vowel.discrimination` or write `letter:{stem}.fatha`.
 * No letter is hardcoded.
 */
export function getHarakaLiveKey(args: {
  letterLegacyId?: string;
  letterId?: string;
  vowelSkillId: string;
}): { type: ItemType; id: string; liveKey: string } {
  const stem = letterStem(args);
  const facet = vowelFacetFromSkill(args.vowelSkillId) ?? "vowel";
  const id = `${stem}.${facet}.discrimination`;
  return { type: "diacritic", id, liveKey: `diacritic:${id}` };
}

function isShortVowelSkill(skillId: string): boolean {
  return (
    skillId === "skill.short_vowel.fatha" ||
    skillId === "skill.short_vowel.kasra" ||
    skillId === "skill.short_vowel.damma"
  );
}

function isHarakaSkill(skillId: string): boolean {
  return isShortVowelSkill(skillId) || skillId === "skill.sukun.basic";
}

/**
 * Non-lexical closed chunk (CVC). Distinct from CV fatha keys, sukun
 * mark discrimination, and real-word decoding.
 *   syllable.ram.closed → letter:ram.closed
 */
export function getClosedChunkLiveKey(args: {
  syllableId?: string;
}): { type: ItemType; id: string; liveKey: string } {
  const raw = args.syllableId && args.syllableId.length > 0 ? args.syllableId : "item";
  const stem = raw.startsWith("syllable.") ? raw.slice("syllable.".length) : raw;
  return { type: "letter", id: stem, liveKey: `letter:${stem}` };
}

function isWordDecodingExercise(type: string | undefined): boolean {
  return type === "audio_to_word" || type === "picture_to_word" || type === "word_to_picture";
}

function isWave6ScopedReview(exercise?: Pick<ExerciseDefinition, "tags" | "config">): boolean {
  if (!exercise) return false;
  if (exercise.tags?.includes("review-wave6")) return true;
  return exercise.config?.["reviewKey"] === "wave6" || exercise.config?.["liveKeyFacet"] === "review.wave6";
}

function wordLiveFacet(exercise?: Pick<ExerciseDefinition, "tags" | "config">): "decoding" | "review" | "review.wave6" {
  if (!exercise || !isReviewExercise(exercise)) return "decoding";
  if (isWave6ScopedReview(exercise)) return "review.wave6";
  return "review";
}

export function liveRefForTarget(
  bundle: CurriculumBundle,
  target: ExerciseMasteryTarget,
  exercise?: Pick<ExerciseDefinition, "type" | "tags" | "config">,
): LiveMasteryRef {
  const syllable = target.syllableId
    ? bundle.syllables?.find((row) => row.id === target.syllableId)
    : undefined;
  const letterId = target.letterId ?? syllable?.letterId;
  const letter = letterId ? bundle.letters.find((row) => row.id === letterId) : undefined;
  if (syllable?.pattern === "CVC") {
    const keyed = getClosedChunkLiveKey({ syllableId: syllable.id });
    return {
      portableMasteryId: target.id,
      skillId: target.skillId,
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    };
  }
  if (exercise?.type === "missing_haraka" && isHarakaSkill(target.skillId)) {
    const keyed = getHarakaLiveKey({
      ...(letter?.legacyId ? { letterLegacyId: letter.legacyId } : {}),
      ...(letterId ? { letterId } : {}),
      vowelSkillId: target.skillId,
    });
    return {
      portableMasteryId: target.id,
      skillId: target.skillId,
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    };
  }
  if (target.sentenceId) {
    const keyed = getSentenceLiveKey({ sentenceId: target.sentenceId });
    return {
      portableMasteryId: target.id,
      skillId: target.skillId,
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    };
  }
  if (
    target.wordId &&
    target.skillId === "skill.word_decoding.simple" &&
    (isWordDecodingExercise(exercise?.type) || !exercise)
  ) {
    const keyed = getWordLiveKey({ wordId: target.wordId, facet: wordLiveFacet(exercise) });
    return {
      portableMasteryId: target.id,
      skillId: target.skillId,
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    };
  }
  if (
    target.wordId &&
    (target.skillId === "skill.word_decoding.simple" || (!target.syllableId && !target.letterId))
  ) {
    const keyed = getWordLiveKey({ wordId: target.wordId, facet: wordLiveFacet(exercise) });
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
  const stem = letter?.legacyId ?? letterId ?? target.sentenceId ?? target.wordId ?? target.syllableId ?? "item";
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
  exercise?: Pick<ExerciseDefinition, "type" | "tags" | "config">,
): LiveMasteryRef[] {
  const seen = new Set<string>();
  const refs: LiveMasteryRef[] = [];
  for (const target of targets) {
    const ref = liveRefForTarget(bundle, target, exercise);
    if (seen.has(ref.liveKey)) continue;
    seen.add(ref.liveKey);
    refs.push(ref);
  }
  return refs;
}

function uniqueRefsForExercises(bundle: CurriculumBundle, exercises: ExerciseDefinition[]): LiveMasteryRef[] {
  const seen = new Set<string>();
  const refs: LiveMasteryRef[] = [];
  for (const exercise of exercises) {
    if (isPresentationExercise(exercise) || isReinforcementExercise(exercise)) continue;
    for (const target of exercise.masteryTargets ?? []) {
      const ref = liveRefForTarget(bundle, target, exercise);
      if (seen.has(ref.liveKey)) continue;
      seen.add(ref.liveKey);
      refs.push(ref);
    }
  }
  return refs;
}

/**
 * Live refs that gate unit mastery: those whose skillId is in
 * `unit.mastery.requiredSkillIds`. Other targets remain recordable
 * practice and still count toward lesson-step completion.
 *
 * Empty `requiredSkillIds` keeps the fail-closed “all unique refs” rule.
 */
function uniqueRequiredRefsForExercises(
  bundle: CurriculumBundle,
  unit: LearningUnitDefinition,
  exercises: ExerciseDefinition[],
): LiveMasteryRef[] {
  const required = unit.mastery.requiredSkillIds ?? [];
  if (required.length === 0) return uniqueRefsForExercises(bundle, exercises);
  const wanted = new Set(required);
  const seen = new Set<string>();
  const refs: LiveMasteryRef[] = [];
  for (const exercise of exercises) {
    if (isPresentationExercise(exercise) || isReinforcementExercise(exercise)) continue;
    for (const target of exercise.masteryTargets ?? []) {
      if (!wanted.has(target.skillId)) continue;
      const ref = liveRefForTarget(bundle, target, exercise);
      if (seen.has(ref.liveKey)) continue;
      seen.add(ref.liveKey);
      refs.push(ref);
    }
  }
  return refs;
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
  if (isPresentationExercise(exercise) || isReinforcementExercise(exercise)) {
    const seen = items[getPresentationLiveKey(exercise.id).liveKey];
    return (seen?.mastery ?? 0) >= 1;
  }
  const refs = uniqueRefsForTargets(bundle, exercise.masteryTargets ?? [], exercise);
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
 * Unit mastery uses portable `unit.mastery` against unique live refs for
 * `requiredSkillIds`. Catalog/practice targets (for example handwriting
 * when it is not required) are recorded but do not gate unlock.
 *
 * minAttempts / minAccuracy are aggregates across those required refs — not
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
  now = Date.now(),
): UnitMasteryEvaluation {
  const criteria = unit.mastery;
  const refs = uniqueRequiredRefsForExercises(bundle, unit, exercises);
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
    const matching = exercises.flatMap((exercise) => {
      if (isPresentationExercise(exercise) || isReinforcementExercise(exercise)) return [];
      return (exercise.masteryTargets ?? [])
        .filter((target) => target.skillId === skillId)
        .map((target) => liveRefForTarget(bundle, target, exercise));
    });
    if (matching.length === 0) continue;
    if (!matching.every((ref) => targetHasCorrect(items, ref))) {
      blockers.push(`required skill ${skillId} incomplete`);
    }
  }

  const mastered = blockers.length === 0 && refs.length > 0;
  const sameSessionGap =
    stats.completedTargets < refs.length ||
    stats.attempts < criteria.minAttempts ||
    stats.accuracy < criteria.minAccuracy ||
    (criteria.minStreak !== undefined && stats.streak < criteria.minStreak);
  const sessionsGap = criteria.minSessions !== undefined && stats.sessions < criteria.minSessions;
  const canRaiseSessionToday = sessionsGap && sessionCanRiseToday(refs, items, stats.sessions, now);
  const measurable = unmappedRequiredSkills.length === 0 && refs.length > 0;

  return {
    mastered,
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
    canAdvanceNow: measurable && !mastered && (sameSessionGap || canRaiseSessionToday),
    returnLater: measurable && !mastered && !sameSessionGap && sessionsGap && !canRaiseSessionToday,
  };
}

function sessionCanRiseToday(
  refs: LiveMasteryRef[],
  items: Record<string, ItemProgress>,
  currentMaxSessions: number,
  now: number,
): boolean {
  const today = dayKey(new Date(now));
  for (const ref of refs) {
    const row = itemFor(items, ref);
    if (row.lastCorrectDay === today) continue;
    if (row.sessions + 1 > currentMaxSessions) return true;
  }
  return false;
}

export interface UnitUnlockEvaluation {
  unlocked: boolean;
  blockers: string[];
  missingPrereqs: string[];
}

function unitById(units: LearningUnitDefinition[], id: string): LearningUnitDefinition | undefined {
  return units.find((row) => row.id === id);
}

/** Optional lookup for a prerequisite that lives in another registered wave bundle. */
export type UnitPrereqResolver = (
  prereqId: string,
) => { bundle: CurriculumBundle; unit: LearningUnitDefinition } | undefined;

/**
 * A unit with no prereqUnitIds is unlocked.
 * Otherwise every prerequisite unit must be mastered.
 * Same-bundle/path units are resolved first; `resolvePrereq` may supply
 * a unit from another registered wave. Missing/invalid prereqs fail closed.
 */
export function evaluateUnitUnlock(
  bundle: CurriculumBundle,
  pathUnits: LearningUnitDefinition[],
  unit: LearningUnitDefinition,
  items: Record<string, ItemProgress>,
  resolvePrereq?: UnitPrereqResolver,
): UnitUnlockEvaluation {
  const prereqs = unit.prereqUnitIds ?? [];
  if (prereqs.length === 0) return { unlocked: true, blockers: [], missingPrereqs: [] };

  const catalog = bundle.units ?? [];
  const blockers: string[] = [];
  const missingPrereqs: string[] = [];

  for (const prereqId of prereqs) {
    const local = unitById(pathUnits, prereqId) ?? unitById(catalog, prereqId);
    const external = local ? undefined : resolvePrereq?.(prereqId);
    const prereqBundle = local ? bundle : external?.bundle;
    const prereq = local ?? external?.unit;
    if (!prereq || !prereqBundle) {
      missingPrereqs.push(prereqId);
      blockers.push(`missing prereq ${prereqId}`);
      continue;
    }
    const mastery = evaluateUnitMastery(
      prereqBundle,
      prereq,
      exercisesForUnit(prereqBundle, prereq),
      items,
    );
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
  if (mastery.returnLater) return "later";
  if (mastery.attempts === 0 && mastery.activitiesDone === 0) return "start";
  if (mastery.activitiesDone >= mastery.activitiesTotal && mastery.activitiesTotal > 0) return "practice";
  return "continue";
}

export function unitPathCtaAr(status: UnitPathStatus): string | undefined {
  if (status === "locked") return undefined;
  if (status === "mastered") return "أَتْقَنْتَ";
  if (status === "later") return "عُدْ لَاحِقًا";
  if (status === "practice" || status === "review") return "تَدَرَّبْ";
  if (status === "continue") return "تَابِع";
  return "ابْدَأ";
}

export function lessonFinishKind(mastery: UnitMasteryEvaluation): LessonFinishKind {
  if (mastery.mastered) return "mastered";
  if (mastery.returnLater) return "later";
  return "keep_practicing";
}

export function lessonFinishMessageAr(kind: LessonFinishKind): string {
  if (kind === "mastered") return "أَكْمَلْتَ هَذِهِ الْوَحْدَة";
  if (kind === "later") return "عُدْ لِلتَّدَرُّبِ مَرَّةً أُخْرَى لَاحِقًا";
  return "تَدَرَّبْ";
}

export function resolveUnitRouteAccess(unlocked: boolean, renderersReady: boolean): UnitRouteAccess {
  if (!unlocked) return "locked";
  if (!renderersReady) return "coming_soon";
  return "play";
}

function exerciseServesRequiredSkills(
  unit: LearningUnitDefinition,
  exercise: ExerciseDefinition,
): boolean {
  if (isPresentationExercise(exercise) || isReinforcementExercise(exercise)) return false;
  const targets = exercise.masteryTargets ?? [];
  if (targets.length === 0) return false;
  const required = unit.mastery.requiredSkillIds ?? [];
  if (required.length === 0) return true;
  const wanted = new Set(required);
  return targets.some((target) => wanted.has(target.skillId));
}

function requiredIndexesForUnit(
  unit: LearningUnitDefinition,
  exercises: ExerciseDefinition[],
): number[] {
  return exercises.map((_, index) => index).filter((index) => exerciseServesRequiredSkills(unit, exercises[index]!));
}

function requiredRefsForExercise(
  bundle: CurriculumBundle,
  unit: LearningUnitDefinition,
  exercise: ExerciseDefinition,
): LiveMasteryRef[] {
  const required = unit.mastery.requiredSkillIds ?? [];
  const failClosedAll = required.length === 0;
  const wanted = new Set(required);
  const seen = new Set<string>();
  const refs: LiveMasteryRef[] = [];
  for (const target of exercise.masteryTargets ?? []) {
    if (!failClosedAll && !wanted.has(target.skillId)) continue;
    const ref = liveRefForTarget(bundle, target, exercise);
    if (seen.has(ref.liveKey)) continue;
    seen.add(ref.liveKey);
    refs.push(ref);
  }
  return refs;
}

function firstIncompleteIndex(
  bundle: CurriculumBundle,
  exercises: ExerciseDefinition[],
  items: Record<string, ItemProgress>,
  predicate: (exercise: ExerciseDefinition, index: number) => boolean,
): number | undefined {
  for (let index = 0; index < exercises.length; index += 1) {
    const exercise = exercises[index]!;
    if (!predicate(exercise, index)) continue;
    if (!exerciseActivitiesComplete(bundle, exercise, items)) return index;
  }
  return undefined;
}

function resumeRequiredIndex(
  bundle: CurriculumBundle,
  unit: LearningUnitDefinition,
  exercises: ExerciseDefinition[],
  items: Record<string, ItemProgress>,
  requiredIndexes: number[],
): number {
  const fallback = requiredIndexes[0] ?? 0;
  for (const index of requiredIndexes) {
    const refs = requiredRefsForExercise(bundle, unit, exercises[index]!);
    if (refs.some((ref) => itemFor(items, ref).correct < 1)) return index;
  }
  return fallback;
}

function nextRequiredIndex(requiredIndexes: number[], fromIndex: number): number {
  const after = requiredIndexes.find((index) => index > fromIndex);
  return after ?? requiredIndexes[0] ?? 0;
}

/**
 * Which activity to show. When the unit is not mastered, exercises that
 * score `requiredSkillIds` take priority over incomplete optional practice.
 */
export function scheduleLesson(
  bundle: CurriculumBundle,
  unit: LearningUnitDefinition,
  exercises: ExerciseDefinition[],
  items: Record<string, ItemProgress>,
  opts?: { fromIndex?: number; now?: number },
): LessonSchedule {
  if (exercises.length === 0) return { index: 0, phase: "done", replay: false };

  const now = opts?.now ?? Date.now();
  const mastery = evaluateUnitMastery(bundle, unit, exercises, items, now);
  const requiredIndexes = requiredIndexesForUnit(unit, exercises);
  const fromIndex = opts?.fromIndex;

  const nextUnseenPresentation = (): number | undefined => {
    if (fromIndex === undefined) {
      return firstIncompleteIndex(bundle, exercises, items, (exercise) => isPresentationExercise(exercise));
    }
    const next = fromIndex + 1;
    const following = exercises[next];
    if (following && isPresentationExercise(following) && !exerciseActivitiesComplete(bundle, following, items)) {
      return next;
    }
    return firstIncompleteIndex(bundle, exercises, items, (exercise) => isPresentationExercise(exercise));
  };

  const unseenDemo = nextUnseenPresentation();
  if (unseenDemo !== undefined && !(fromIndex !== undefined && mastery.mastered)) {
    return { index: unseenDemo, phase: "optional", replay: false };
  }

  if (mastery.returnLater) {
    return { index: fromIndex ?? 0, phase: "done", replay: false };
  }

  if (!mastery.mastered && mastery.canAdvanceNow && requiredIndexes.length > 0) {
    const index =
      fromIndex === undefined
        ? resumeRequiredIndex(bundle, unit, exercises, items, requiredIndexes)
        : nextRequiredIndex(requiredIndexes, fromIndex);
    return {
      index,
      phase: "required",
      replay: fromIndex !== undefined && index === fromIndex,
    };
  }

  // In-lesson: mastery just reached → celebrate. Optional practice is for re-entry.
  if (fromIndex !== undefined && mastery.mastered) {
    return { index: fromIndex, phase: "done", replay: false };
  }

  const optionalIncomplete = firstIncompleteIndex(
    bundle,
    exercises,
    items,
    (exercise) => !exerciseServesRequiredSkills(unit, exercise),
  );
  if (optionalIncomplete !== undefined) {
    return { index: optionalIncomplete, phase: "optional", replay: false };
  }

  const anyIncomplete = firstIncompleteIndex(bundle, exercises, items, () => true);
  if (anyIncomplete !== undefined && mastery.mastered) {
    return { index: anyIncomplete, phase: "optional", replay: false };
  }

  return { index: fromIndex ?? 0, phase: "done", replay: false };
}

/** Resume index (and whether to open on the end card) for the unit route. */
export function lessonEntry(
  bundle: CurriculumBundle,
  unit: LearningUnitDefinition,
  exercises: ExerciseDefinition[],
  items: Record<string, ItemProgress>,
  now = Date.now(),
): { startAt: number; startFinished: boolean } {
  const mastery = evaluateUnitMastery(bundle, unit, exercises, items, now);
  const scheduled = scheduleLesson(bundle, unit, exercises, items, { now });
  if (scheduled.phase === "done") {
    if (mastery.mastered) return { startAt: 0, startFinished: false };
    return { startAt: scheduled.index, startFinished: true };
  }
  return { startAt: scheduled.index, startFinished: false };
}
