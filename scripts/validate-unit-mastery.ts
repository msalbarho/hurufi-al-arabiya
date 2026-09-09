/**
 * Deterministic unit mastery + unlock checks. No test runner.
 * Run: node --experimental-strip-types --no-warnings scripts/validate-unit-mastery.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { asCurriculumBundle, validateCurriculum, WAVE1_PATH_ID, WAVE1_FINAL_UNIT_ID, WAVE2_PATH_ID, WAVE2_FINAL_UNIT_ID, WAVE3_PATH_ID, WAVE3_FINAL_UNIT_ID, WAVE4_PATH_ID, WAVE5_PATH_ID, WAVE6_PATH_ID, WAVE7_PATH_ID, WAVE8_PATH_ID, WAVE9_PATH_ID, WAVE10_PATH_ID, WAVE11_PATH_ID, WAVE12_PATH_ID, WAVE13_PATH_ID, WAVE14_PATH_ID, WAVE15_PATH_ID, WAVE16_PATH_ID, WAVE17_PATH_ID, WAVE18_PATH_ID, WAVE19_PATH_ID, WAVE20_PATH_ID, WAVE21_PATH_ID, WAVE22_PATH_ID, WAVE22_FINAL_UNIT_ID, READING_FOUNDATIONS_PATH_ID, READING_FOUNDATIONS_UNIT_IDS, READING_FOUNDATIONS_REQUIRED_LIVE_KEYS, READING_FOUNDATIONS_FINAL_UNIT_ID, ORTHOGRAPHIC_FOUNDATIONS_PATH_ID, ORTHOGRAPHIC_FOUNDATIONS_UNIT_IDS, ORTHOGRAPHIC_FOUNDATIONS_REQUIRED_LIVE_KEYS, ORTHOGRAPHIC_FOUNDATIONS_FINAL_UNIT_ID } from "../src/content/curriculum/validation/validateCurriculum.ts";
import type { LearningUnitDefinition } from "../src/content/curriculum/types/models.ts";
import { unitRenderersReady } from "../src/lib/curriculum/exerciseReadiness.ts";
import { resolveLetterRecognition } from "../src/lib/curriculum/letterRecognitionAdapter.ts";
import { resolveMissingHaraka } from "../src/lib/curriculum/missingHarakaAdapter.ts";
import {
  resolveSyllableBlending,
  scoredSyllablePromptText,
  shuffleWithSeed,
  syllablePromptExposesTarget,
} from "../src/lib/curriculum/syllableAdapter.ts";
import {
  portableWord,
  prototypeVisualForWord,
  resolveAudioToWord,
  resolvePictureToWord,
  resolveWordToPicture,
} from "../src/lib/curriculum/wordAdapter.ts";
import { resolveAudioToSentence } from "../src/lib/curriculum/sentenceAdapter.ts";
import {
  evaluateUnitMastery,
  evaluateUnitUnlock,
  exerciseActivitiesComplete,
  exercisesForUnit,
  getClosedChunkLiveKey,
  getHarakaLiveKey,
  getLetterFormLiveKey,
  getSyllableLiveKey,
  getWordLiveKey,
  getSentenceLiveKey,
  lessonEntry,
  lessonFinishKind,
  lessonFinishMessageAr,
  liveRefForTarget,
  resolveUnitRouteAccess,
  scheduleLesson,
  unitPathCtaAr,
  unitPathStatus,
  type LiveMasteryRef,
} from "../src/lib/curriculum/unitMastery.ts";
import {
  getPresentationLiveKey,
  isReinforcementExercise,
  isReviewExercise,
  resolvePresentation,
} from "../src/lib/curriculum/presentationAdapter.ts";
import { applyAttempt, emptyProgress, type ItemProgress } from "../src/lib/rules/mastery.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wave1Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-1.json");
const wave2Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-2.json");
const wave3Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-3.json");
const wave4Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-4.json");
const wave5Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-5.json");
const wave6Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-6.json");
const wave7Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-7.json");
const wave8Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-8.json");
const wave9Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-9.json");
const wave10Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-10.json");
const wave11Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-11.json");
const wave12Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-12.json");
const wave13Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-13.json");
const wave14Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-14.json");
const wave15Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-15.json");
const wave16Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-16.json");
const wave17Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-17.json");
const wave18Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-18.json");
const wave19Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-19.json");
const wave20Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-20.json");
const wave21Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-21.json");
const wave22Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-22.json");
const readingFoundationsPath = join(root, "src/content/curriculum/data/production/literacy-path.reading-foundations.json");
const orthographicFoundationsPath = join(root, "src/content/curriculum/data/production/literacy-path.orthographic-foundations.json");

let failed = 0;

function uniqueRefs(refs: LiveMasteryRef[]): LiveMasteryRef[] {
  const seen = new Map<string, LiveMasteryRef>();
  for (const ref of refs) {
    if (!seen.has(ref.liveKey)) seen.set(ref.liveKey, ref);
  }
  return [...seen.values()];
}

function refsForExercises(
  bundle: ReturnType<typeof asCurriculumBundle>,
  exercises: ReturnType<typeof exercisesForUnit>,
): LiveMasteryRef[] {
  return uniqueRefs(
    exercises.filter(isScoredExercise).flatMap((exercise) =>
      (exercise.masteryTargets ?? []).map((target) => liveRefForTarget(bundle, target, exercise)),
    ),
  );
}

function assert(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`ok  ${name}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${name}${detail ? ` — ${detail}` : ""}`);
}

function itemsFrom(
  refs: LiveMasteryRef[],
  sequences: boolean[][],
  now = Date.now(),
): Record<string, ItemProgress> {
  const items: Record<string, ItemProgress> = {};
  refs.forEach((ref, i) => {
    let progress = emptyProgress();
    for (const correct of sequences[i] ?? []) {
      progress = applyAttempt(progress, correct, now);
    }
    items[ref.liveKey] = progress;
  });
  return items;
}

function isScoredExercise(exercise: { type: string; tags?: string[]; config?: Record<string, unknown> }): boolean {
  return exercise.type !== "presentation" && !isReinforcementExercise(exercise);
}

function activitySeen(exercise: { id: string }): Record<string, ItemProgress> {
  const key = getPresentationLiveKey(exercise.id).liveKey;
  return { [key]: { ...emptyProgress(), mastery: 1 } };
}

function seenItems(exercises: Array<{ id: string; type: string; tags?: string[]; config?: Record<string, unknown> }>): Record<string, ItemProgress> {
  const items: Record<string, ItemProgress> = {};
  for (const exercise of exercises) {
    if (exercise.type !== "presentation") continue;
    Object.assign(items, activitySeen(exercise));
  }
  return items;
}

function applyScheduledCorrect(
  bundle: ReturnType<typeof asCurriculumBundle>,
  exercises: ReturnType<typeof exercisesForUnit>,
  items: Record<string, ItemProgress>,
  index: number,
  now?: number,
): Record<string, ItemProgress> {
  const exercise = exercises[index];
  if (!exercise) return items;
  if (!isScoredExercise(exercise) || !exercise.masteryTargets?.[0]) {
    return { ...items, ...seenItems([exercise]) };
  }
  const ref = liveRefForTarget(bundle, exercise.masteryTargets[0]!, exercise);
  return {
    ...items,
    [ref.liveKey]: applyAttempt(items[ref.liveKey] ?? emptyProgress(), true, now),
  };
}

function requiredRefsForUnit(
  bundle: ReturnType<typeof asCurriculumBundle>,
  unit: LearningUnitDefinition,
  exercises: ReturnType<typeof exercisesForUnit>,
): LiveMasteryRef[] {
  const wanted = new Set(unit.mastery.requiredSkillIds ?? []);
  return uniqueRefs(
    exercises.filter(isScoredExercise).flatMap((exercise) =>
      (exercise.masteryTargets ?? [])
        .filter((target) => wanted.size === 0 || wanted.has(target.skillId))
        .map((target) => liveRefForTarget(bundle, target, exercise)),
    ),
  );
}

function masterRequired(
  bundle: ReturnType<typeof asCurriculumBundle>,
  unit: LearningUnitDefinition,
  exercises: ReturnType<typeof exercisesForUnit>,
  base: Record<string, ItemProgress> = {},
  day0 = Date.parse("2026-03-01T12:00:00Z"),
): Record<string, ItemProgress> {
  const items = { ...base };
  const minAttempts = unit.mastery.minAttempts ?? 3;
  const minStreak = unit.mastery.minStreak ?? 2;
  const minSessions = unit.mastery.minSessions ?? 1;
  const dayMs = 24 * 60 * 60 * 1000;
  for (const ref of requiredRefsForUnit(bundle, unit, exercises)) {
    let progress = items[ref.liveKey] ?? emptyProgress();
    for (let session = 0; session < Math.max(minSessions, 1); session++) {
      const now = day0 + session * dayMs;
      const count = session === 0 ? Math.max(minAttempts, minStreak) : 1;
      for (let i = 0; i < count; i++) progress = applyAttempt(progress, true, now);
    }
    items[ref.liveKey] = progress;
  }
  return items;
}

function masterPath(
  bundle: ReturnType<typeof asCurriculumBundle>,
  units: LearningUnitDefinition[],
): Record<string, ItemProgress> {
  let items: Record<string, ItemProgress> = {};
  for (const unit of units) {
    items = masterRequired(bundle, unit, exercisesForUnit(bundle, unit), items);
  }
  return items;
}

function main(): void {
  const bundle = asCurriculumBundle(JSON.parse(readFileSync(wave1Path, "utf8")));
  const path = bundle.paths?.find((row) => row.id === WAVE1_PATH_ID);
  if (!path) throw new Error("Wave 1 path missing");
  const byId = new Map((bundle.units ?? []).map((unit) => [unit.id, unit]));
  const units = path.unitIds.flatMap((id) => {
    const unit = byId.get(id);
    return unit ? [unit] : [];
  });
  const unit1 = units[0];
  const unit2 = units[1];
  const unit3 = units[2];
  const unit4 = units[3];
  const unit5 = units[4];
  const unit6 = units[5];
  if (!unit1 || !unit2 || !unit3 || !unit4 || !unit5 || !unit6) throw new Error("Wave 1 units 1–6 missing");

  const unit1Exercises = exercisesForUnit(bundle, unit1);
  const unit2Exercises = exercisesForUnit(bundle, unit2);
  const unit3Exercises = exercisesForUnit(bundle, unit3);
  const unit4Exercises = exercisesForUnit(bundle, unit4);
  const unit5Exercises = exercisesForUnit(bundle, unit5);
  const unit6Exercises = exercisesForUnit(bundle, unit6);
  const unit1Refs = refsForExercises(bundle, unit1Exercises);
  const unit2Refs = refsForExercises(bundle, unit2Exercises);
  const mimSoundRef = unit1Refs.find((ref) => ref.liveKey === "letter:mim.sound");
  const lamSoundRef = unit1Refs.find((ref) => ref.liveKey === "letter:lam.sound");
  const tracingRef = unit1Refs.find((ref) => ref.liveKey === "letter:mim.tracing");
  assert("unit 1 has three unique live refs (mim sound + lam sound + tracing)", unit1Refs.length === 3, String(unit1Refs.length));
  assert("unit 1 recognition shares the sound live key", Boolean(mimSoundRef));
  assert("unit 1 tracing live key is unchanged", tracingRef?.liveKey === "letter:mim.tracing");
  assert("unit 1 adds letter:lam.sound without renaming mim keys", Boolean(lamSoundRef));
  assert(
    "no persisted Unit 1 live-key rename",
    unit1Refs.some((ref) => ref.liveKey === "letter:mim.sound") &&
      unit1Refs.some((ref) => ref.liveKey === "letter:mim.tracing"),
  );
  const persistStoreSrc = readFileSync(join(root, "src/lib/progress/store.ts"), "utf8");
  assert("progress store name remains hurufi-progress-v1", persistStoreSrc.includes('name: "hurufi-progress-v1"'));
  const soundExercise = unit1Exercises.find((row) => row.id === "exercise.wave1.sound_to_letter.mim");
  const lamSoundExercise = unit1Exercises.find((row) => row.id === "exercise.wave1.sound_to_letter.lam");
  const soundChoiceIds = soundExercise?.choices?.map((choice) => choice.id) ?? [];
  const soundChoiceSet = new Set(soundChoiceIds);
  assert("Unit 1 sound_to_letter correct choice remains letter.mim", soundExercise?.success.correctChoiceId === "letter.mim");
  assert(
    "Unit 1 sound_to_letter keeps both curriculum choices once",
    soundChoiceIds.length === 2 &&
      soundChoiceSet.size === 2 &&
      soundChoiceSet.has("letter.mim") &&
      soundChoiceSet.has("letter.lam"),
  );
  const soundFirstSlots = new Set(
    [1, 2, 3, 5, 8, 13, 21, 34].map((seed) => shuffleWithSeed(soundChoiceIds, seed)[0]),
  );
  assert("Unit 1 shared shuffle is not stuck on JSON-first choice", soundFirstSlots.size > 1);
  const soundRendererSrc = readFileSync(join(root, "src/components/learn/SoundToLetterExercise.tsx"), "utf8");
  assert(
    "SoundToLetterExercise reuses useMountedChoiceOrder",
    soundRendererSrc.includes("useMountedChoiceOrder") && !soundRendererSrc.includes("Math.random"),
  );
  const soundRef = mimSoundRef;
  const tracingExercise = unit1Exercises.find((row) => row.type === "tracing");
  assert(
    "Unit 1 requiredSkillIds are recognition and sound, not handwriting",
    (unit1.mastery.requiredSkillIds ?? []).includes("skill.letter_recognition.core") &&
      (unit1.mastery.requiredSkillIds ?? []).includes("skill.letter_sounds.core") &&
      !(unit1.mastery.requiredSkillIds ?? []).includes("skill.handwriting.isolated"),
  );
  assert(
    "Unit 1 tracing stays in the lesson and keeps letter:mim.tracing",
    Boolean(tracingExercise) &&
      tracingExercise?.masteryTargets?.some((target) => target.id === "mastery.letter.mim.tracing") === true &&
      tracingRef?.liveKey === "letter:mim.tracing",
  );
  assert("Unit 1 tracing prompt is short child MSA", tracingExercise?.promptText === "تَتَبَّعْ حَرْفَ م");
  assert(
    "Unit 1 wrong sound_to_letter tap does not complete the activity",
    Boolean(soundExercise) &&
      Boolean(soundRef) &&
      !exerciseActivitiesComplete(bundle, soundExercise!, itemsFrom([soundRef!], [[false]])),
  );
  assert(
    "Unit 1 correct sound_to_letter tap completes the activity",
    Boolean(soundExercise) &&
      Boolean(soundRef) &&
      exerciseActivitiesComplete(bundle, soundExercise!, itemsFrom([soundRef!], [[true]])),
  );
  assert("unit 1 has no prereqs", (unit1.prereqUnitIds ?? []).length === 0);
  assert("unit 2 prereq is unit 1", unit2.prereqUnitIds[0] === unit1.id);
  assert("unit 2 unique live keys are mim.fatha and lam.fatha", unit2Refs.length === 2);
  assert("10. no duplicate live-ref double counting", unit2Refs.length === 2);
  assert(
    "unit 2 includes letter:mim.fatha",
    unit2Refs.some((ref) => ref.liveKey === "letter:mim.fatha"),
  );
  assert(
    "unit 2 includes letter:lam.fatha",
    unit2Refs.some((ref) => ref.liveKey === "letter:lam.fatha"),
  );
  assert(
    "getSyllableLiveKey preserves Wave 1 mim shape",
    getSyllableLiveKey({
      syllableId: "syllable.mim.fatha",
      letterLegacyId: "mim",
      vowelSkillId: "skill.short_vowel.fatha",
    }).liveKey === "letter:mim.fatha",
  );
  assert(
    "getSyllableLiveKey preserves Wave 1 lam shape",
    getSyllableLiveKey({
      syllableId: "syllable.lam.fatha",
      letterLegacyId: "lam",
      vowelSkillId: "skill.short_vowel.fatha",
    }).liveKey === "letter:lam.fatha",
  );

  const empty = {};

  const u1empty = evaluateUnitMastery(bundle, unit1, unit1Exercises, empty);
  const u1emptyUnlock = evaluateUnitUnlock(bundle, units, unit1, empty);
  assert("1. unit 1 zero progress is playable", u1emptyUnlock.unlocked);
  assert("1. unit 1 zero progress is not mastered", !u1empty.mastered);

  const u2empty = evaluateUnitUnlock(bundle, units, unit2, empty);
  assert("2. unit 2 locked when unit 1 not mastered", !u2empty.unlocked);
  assert(
    "2. unit 2 route is locked",
    resolveUnitRouteAccess(u2empty.unlocked, unitRenderersReady(unit2Exercises)) === "locked",
  );

  const insufficient = {
    ...itemsFrom([soundRef!], [[true]]),
    ...itemsFrom([tracingRef!], [[true]]),
  };
  const u1short = evaluateUnitMastery(bundle, unit1, unit1Exercises, insufficient);
  assert("3. one required-skill correct plus tracing is not mastered", !u1short.mastered);
  assert("3. tracing does not pad required-skill attempts (1 < 3)", u1short.attempts === 1 && u1short.requiredAttempts === 3);
  assert(
    "3. unit 2 still locked",
    !evaluateUnitUnlock(bundle, units, unit2, insufficient).unlocked,
  );

  const lowAccuracy = itemsFrom([soundRef!], [[false, false, true, true]]);
  const u1acc = evaluateUnitMastery(bundle, unit1, unit1Exercises, lowAccuracy);
  assert("4. enough attempts with accuracy < 0.7 is not mastered", !u1acc.mastered);
  assert("4. required-skill attempts >= 3", u1acc.attempts >= 3);
  assert("4. tracing does not inflate required-skill accuracy", u1acc.attempts === 4 && u1acc.accuracy === 0.5);
  assert("4. accuracy below 0.7", u1acc.accuracy < 0.7);
  assert("4. streak still meets 2", u1acc.streak >= 2);

  const tracingDoesNotPad = {
    ...itemsFrom([soundRef!], [[true, true]]),
    ...itemsFrom([tracingRef!], [[true]]),
  };
  const u1padded = evaluateUnitMastery(bundle, unit1, unit1Exercises, tracingDoesNotPad);
  assert(
    "tracing correct attempts do not count toward required minAttempts",
    !u1padded.mastered && u1padded.attempts === 2,
    u1padded.blockers.join("; "),
  );

  const tracingOnly = itemsFrom([tracingRef!], [[true, true, true]]);
  const u1traceOnly = evaluateUnitMastery(bundle, unit1, unit1Exercises, tracingOnly);
  assert(
    "tracing does not satisfy required sound/recognition evidence",
    !u1traceOnly.mastered &&
      u1traceOnly.attempts === 0 &&
      u1traceOnly.completedTargets === 0 &&
      tracingOnly["letter:mim.tracing"]?.correct === 3,
    u1traceOnly.blockers.join("; "),
  );

  const masteredItems = {
    ...itemsFrom([soundRef!], [[true, true, true]]),
    ...itemsFrom([lamSoundRef!], [[true]]),
    ...itemsFrom([tracingRef!], [[false, false]]),
  };
  const u1ok = evaluateUnitMastery(bundle, unit1, unit1Exercises, masteredItems);
  assert(
    "5. Unit 1 masters from required sound/recognition even with no tracing correct",
    u1ok.mastered,
    u1ok.blockers.join("; "),
  );
  assert("5. unit 1 recognition skill is mapped", u1ok.unmappedRequiredSkills.length === 0);
  assert("5. accuracy >= 0.7", u1ok.accuracy >= 0.7);
  assert("5. streak >= 2", u1ok.streak >= 2);
  assert("5. sessions >= 1 from item correct-days", u1ok.sessions >= 1);
  assert("5. shared sound/recognition key is not double-counted", u1ok.attempts === 4 && u1ok.totalTargets === 2);
  assert(
    "5. tracing evidence is stored independently without a correct attempt",
    masteredItems["letter:mim.tracing"]?.attempts === 2 &&
      masteredItems["letter:mim.tracing"]?.correct === 0 &&
      masteredItems["letter:mim.sound"]?.correct === 3,
  );
  assert("5. lesson can still show tracing incomplete", u1ok.activitiesDone === 2 && u1ok.activitiesTotal === 5);

  const unit1RequiringHandwriting = {
    ...unit1,
    mastery: {
      ...unit1.mastery,
      requiredSkillIds: [...(unit1.mastery.requiredSkillIds ?? []), "skill.handwriting.isolated"],
    },
  };
  const u1handwritingGate = evaluateUnitMastery(bundle, unit1RequiringHandwriting, unit1Exercises, masteredItems);
  assert(
    "if handwriting is required, tracing without a correct attempt blocks mastery",
    !u1handwritingGate.mastered &&
      u1handwritingGate.blockers.some((row) => row.includes("skill.handwriting.isolated")),
    u1handwritingGate.blockers.join("; "),
  );
  const handwritingMasteredItems = {
    ...itemsFrom([soundRef!], [[true, true, true]]),
    ...itemsFrom([lamSoundRef!], [[true]]),
    ...itemsFrom([tracingRef!], [[true]]),
  };
  const u1handwritingOk = evaluateUnitMastery(
    bundle,
    unit1RequiringHandwriting,
    unit1Exercises,
    handwritingMasteredItems,
  );
  assert(
    "if handwriting is required, tracing evidence is then mandatory",
    u1handwritingOk.mastered && u1handwritingOk.totalTargets === 3 && u1handwritingOk.attempts === 5,
    u1handwritingOk.blockers.join("; "),
  );

  const unit1UnmappedRequired = {
    ...unit1,
    mastery: {
      ...unit1.mastery,
      requiredSkillIds: [...(unit1.mastery.requiredSkillIds ?? []), "skill.word_decoding.simple"],
    },
  };
  const u1unmapped = evaluateUnitMastery(bundle, unit1UnmappedRequired, unit1Exercises, masteredItems);
  assert(
    "UNMAPPED_REQUIRED_SKILL still fail-closes at runtime",
    !u1unmapped.mastered && u1unmapped.unmappedRequiredSkills.includes("skill.word_decoding.simple"),
    u1unmapped.blockers.join("; "),
  );

  const u2ok = evaluateUnitUnlock(bundle, units, unit2, masteredItems);
  const route = resolveUnitRouteAccess(u2ok.unlocked, unitRenderersReady(unit2Exercises));
  assert("6. unit 2 unlock evaluator is playable after unit 1 required mastery", u2ok.unlocked);
  assert("6. path logic agrees (unlocked)", u2ok.unlocked);
  assert("6. route is playable (syllable_blending renderer ready)", route === "play");
  assert("6. renderer readiness reports syllable_blending supported", unitRenderersReady(unit2Exercises));
  assert(
    "6. Unit 2 stays locked when only tracing is complete",
    !evaluateUnitUnlock(bundle, units, unit2, tracingOnly).unlocked,
  );

  const unit1Seen = seenItems(unit1Exercises);
  const mimSoundIndex = unit1Exercises.findIndex((row) => row.id === "exercise.wave1.sound_to_letter.mim");
  const oneSoundNoTrace = { ...unit1Seen, ...itemsFrom([soundRef!], [[true]]) };
  const u1resumeAfterOneSound = scheduleLesson(bundle, unit1, unit1Exercises, oneSoundNoTrace);
  assert(
    "Unit 1 after one sound correct still schedules required sound practice",
    u1resumeAfterOneSound.phase === "required" &&
      unit1Exercises[u1resumeAfterOneSound.index]?.type === "sound_to_letter",
    `${u1resumeAfterOneSound.phase} @ ${u1resumeAfterOneSound.index}`,
  );
  const u1afterOneCorrect = scheduleLesson(bundle, unit1, unit1Exercises, oneSoundNoTrace, { fromIndex: mimSoundIndex });
  assert(
    "incomplete tracing does not monopolize resume while Unit 1 mastery is unmet",
    u1afterOneCorrect.phase === "required" &&
      unit1Exercises[u1afterOneCorrect.index]?.type === "sound_to_letter" &&
      unit1Exercises.some((row) => row.type === "tracing"),
    `${u1afterOneCorrect.phase} @ ${u1afterOneCorrect.index}`,
  );
  const u1entryOneSound = lessonEntry(bundle, unit1, unit1Exercises, oneSoundNoTrace);
  assert(
    "Unit 1 entry after one sound is a sound activity, not tracing",
    !u1entryOneSound.startFinished && unit1Exercises[u1entryOneSound.startAt]?.type === "sound_to_letter",
  );

  let u1loopItems: Record<string, ItemProgress> = { ...unit1Seen };
  let u1from: number | undefined;
  let u1loops = 0;
  while (u1loops < 10 && !evaluateUnitMastery(bundle, unit1, unit1Exercises, u1loopItems).mastered) {
    const scheduled = scheduleLesson(
      bundle,
      unit1,
      unit1Exercises,
      u1loopItems,
      u1from === undefined ? undefined : { fromIndex: u1from },
    );
    assert(
      `Unit 1 in-lesson loop stays on required evidence (step ${u1loops})`,
      scheduled.phase === "required" && unit1Exercises[scheduled.index]?.type === "sound_to_letter",
      scheduled.phase,
    );
    u1loopItems = applyScheduledCorrect(bundle, unit1Exercises, u1loopItems, scheduled.index);
    u1from = scheduled.index;
    u1loops += 1;
  }
  const u1looped = evaluateUnitMastery(bundle, unit1, unit1Exercises, u1loopItems);
  assert("Unit 1 can master from in-lesson required practice without tracing", u1looped.mastered, u1looped.blockers.join("; "));
  assert("Unit 1 required loop is finite", u1loops >= 3 && u1loops < 10, String(u1loops));
  assert(
    "Unit 2 unlocks after in-lesson Unit 1 mastery with tracing still incomplete",
    evaluateUnitUnlock(bundle, units, unit2, u1loopItems).unlocked &&
      (u1loopItems["letter:mim.tracing"]?.correct ?? 0) === 0,
  );
  const afterMastery = scheduleLesson(bundle, unit1, unit1Exercises, u1loopItems);
  assert(
    "once Unit 1 is mastered, tracing remains available as optional practice",
    afterMastery.phase === "optional" && unit1Exercises[afterMastery.index]?.type === "tracing",
    `${afterMastery.phase} @ ${afterMastery.index}`,
  );
  const afterMasteryInLesson = scheduleLesson(bundle, unit1, unit1Exercises, u1loopItems, { fromIndex: mimSoundIndex });
  assert(
    "in-lesson Unit 1 mastery stops to celebrate instead of trapping on tracing",
    afterMasteryInLesson.phase === "done" && lessonFinishKind(u1looped) === "mastered",
    afterMasteryInLesson.phase,
  );
  assert(
    "mastered finish copy is أَكْمَلْتَ هَذِهِ الْوَحْدَة",
    lessonFinishMessageAr("mastered") === "أَكْمَلْتَ هَذِهِ الْوَحْدَة",
  );
  const u1reentry = lessonEntry(bundle, unit1, unit1Exercises, u1loopItems);
  assert(
    "returning to mastered Unit 1 still offers tracing",
    !u1reentry.startFinished && unit1Exercises[u1reentry.startAt]?.type === "tracing",
  );
  const tracingRecorded = {
    ...u1loopItems,
    ...itemsFrom([tracingRef!], [[true]]),
  };
  assert(
    "tracing still records letter:mim.tracing independently",
    tracingRecorded["letter:mim.tracing"]?.correct === 1 &&
      tracingRecorded["letter:mim.sound"]?.correct === u1loopItems["letter:mim.sound"]?.correct,
  );
  const afterTrace = scheduleLesson(bundle, unit1, unit1Exercises, tracingRecorded);
  assert("mastered Unit 1 with tracing done does not keep looping required practice", afterTrace.phase === "done");

  const bothActivitiesOnce = {
    ...unit1Seen,
    ...itemsFrom([soundRef!, lamSoundRef!, tracingRef!], [[true], [true], [true]]),
  };
  const bothOnceStatus = unitPathStatus(true, evaluateUnitMastery(bundle, unit1, unit1Exercises, bothActivitiesOnce));
  assert(
    "completed exercises without mastery is a practice continuation, not mastered/review",
    bothOnceStatus === "practice" &&
      !evaluateUnitMastery(bundle, unit1, unit1Exercises, bothActivitiesOnce).mastered &&
      unitPathCtaAr(bothOnceStatus) === "تَدَرَّبْ",
    bothOnceStatus,
  );

  const u1wrong = { ...unit1Seen, ...itemsFrom([soundRef!], [[false]]) };
  assert(
    "a wrong Unit 1 sound attempt does not master or complete required evidence",
    !evaluateUnitMastery(bundle, unit1, unit1Exercises, u1wrong).mastered &&
      scheduleLesson(bundle, unit1, unit1Exercises, u1wrong).phase === "required" &&
      u1wrong["letter:mim.sound"]?.correct === 0 &&
      u1wrong["letter:mim.sound"]?.attempts === 1,
  );

  assert("Unit 1 also scores ل as a target", lamSoundExercise?.success.correctChoiceId === "letter.lam");
  assert(
    "Unit 1 demos do not write mastery attempts",
    unit1Exercises.filter((row) => row.type === "presentation").every((row) => (row.masteryTargets ?? []).length === 0),
  );
  const mimDemo = unit1Exercises.find((row) => row.id === "exercise.wave1.presentation.mim");
  assert("Unit 1 starts with an unscored م demo", mimDemo?.type === "presentation" && mimDemo.success.type === "continue");
  assert(
    "a seen demo completes without attempts",
    Boolean(mimDemo) &&
      exerciseActivitiesComplete(bundle, mimDemo!, activitySeen(mimDemo!)) &&
      (activitySeen(mimDemo!)[getPresentationLiveKey(mimDemo!.id).liveKey]?.attempts ?? 0) === 0,
  );

  const mimExercise = unit2Exercises.find((row) => row.id === "exercise.wave1.syllable_blending.mim_fatha");
  const lamExercise = unit2Exercises.find((row) => row.id === "exercise.wave1.syllable_blending.lam_fatha");
  const resolvedMim = mimExercise ? resolveSyllableBlending(bundle, mimExercise) : undefined;
  const resolvedLam = lamExercise ? resolveSyllableBlending(bundle, lamExercise) : undefined;
  assert("3. both مَ and لَ exercises resolve", Boolean(resolvedMim) && Boolean(resolvedLam));
  assert("3. taught syllable is مَ", resolvedMim?.target.text === "مَ" && resolvedMim?.target.id === "syllable.mim.fatha");
  assert("3. taught syllable is لَ", resolvedLam?.target.text === "لَ" && resolvedLam?.target.id === "syllable.lam.fatha");
  assert(
    "7. each unit 2 syllable reference exists",
    (unit2.syllableIds ?? []).every((id) => bundle.syllables?.some((row) => row.id === id)),
  );
  assert(
    "4. مَ uses لَ as legal distractor",
    resolvedMim?.choices.some((row) => row.id === "syllable.lam.fatha") === true &&
      resolvedMim?.choices.every((row) => row.id === "syllable.mim.fatha" || row.id === "syllable.lam.fatha") === true,
  );
  assert(
    "4. لَ uses مَ as legal distractor",
    resolvedLam?.choices.some((row) => row.id === "syllable.mim.fatha") === true &&
      resolvedLam?.choices.every((row) => row.id === "syllable.mim.fatha" || row.id === "syllable.lam.fatha") === true,
  );
  assert(
    "Unit 2 mim scored prompt does not print مَ",
    Boolean(resolvedMim) &&
      !syllablePromptExposesTarget(resolvedMim?.promptText, resolvedMim?.target.text ?? "") &&
      (resolvedMim?.promptGlyphs.length ?? 1) === 0,
  );
  assert(
    "Unit 2 lam scored prompt does not print لَ",
    Boolean(resolvedLam) &&
      !syllablePromptExposesTarget(resolvedLam?.promptText, resolvedLam?.target.text ?? "") &&
      (resolvedLam?.promptGlyphs.length ?? 1) === 0,
  );
  assert(
    "Unit 2 mim still offers the correct printed choice",
    resolvedMim?.choices.some((row) => row.id === resolvedMim.target.id && row.text === "مَ") === true,
  );
  assert(
    "Unit 2 lam still offers the correct printed choice",
    resolvedLam?.choices.some((row) => row.id === resolvedLam.target.id && row.text === "لَ") === true,
  );
  assert(
    "leaking syllable promptText is replaced before scoring",
    scoredSyllablePromptText("اقْرَأْ هَذَا الْمَقْطَع: مَ", "مَ") === "اِسْتَمِعْ وَاخْتَرِ الْمَقْطَع" &&
      scoredSyllablePromptText("اِسْتَمِعْ وَاخْتَرِ الْمَقْطَع", "مَ") === "اِسْتَمِعْ وَاخْتَرِ الْمَقْطَع" &&
      syllablePromptExposesTarget("اقْرَأْ هَذَا الْمَقْطَع: مَ", "مَ") &&
      !syllablePromptExposesTarget("اِسْتَمِعْ وَاخْتَرِ الْمَقْطَع", "مَ"),
  );
  const leakyMim = resolveSyllableBlending(bundle, {
    ...mimExercise!,
    promptText: "اقْرَأْ هَذَا الْمَقْطَع: مَ",
  });
  assert(
    "adapter sanitizes a leaking Unit 2 prompt without changing choices",
    leakyMim !== undefined &&
      !syllablePromptExposesTarget(leakyMim.promptText, "مَ") &&
      leakyMim.promptGlyphs.length === 0 &&
      leakyMim.choices.some((row) => row.id === "syllable.mim.fatha") === true &&
      leakyMim.choices.some((row) => row.id === "syllable.lam.fatha") === true,
  );
  assert(
    "5. JSON does not put both correct answers first",
    resolvedMim?.choices[0]?.id !== resolvedMim?.target.id || resolvedLam?.choices[0]?.id !== resolvedLam?.target.id,
  );
  const shuffledIds = resolvedMim?.choices.map((row) => row.id) ?? [];
  const firstSlots = new Set(
    [1, 2, 3, 5, 8, 13, 21, 34].map((seed) => shuffleWithSeed(shuffledIds, seed)[0]),
  );
  assert("5. seeded shuffle is not stuck on one first choice", firstSlots.size > 1);

  const unknownBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const unknownExercises = unknownBundle["exercises"] as Array<Record<string, unknown>>;
  const blendRow = unknownExercises.find((row) => row["id"] === "exercise.wave1.syllable_blending.mim_fatha");
  if (blendRow) {
    blendRow["contentIds"] = [...(blendRow["contentIds"] as string[]), "syllable.does.not.exist"];
  }
  const unknownResult = validateCurriculum(unknownBundle);
  assert(
    "8. illegal/unknown syllable ref fails validation",
    unknownResult.issues.some((issue) => issue.code === "MISSING_SYLLABLE" && issue.message.includes("syllable.does.not.exist")),
  );

  const prematureBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const prematureExercises = prematureBundle["exercises"] as Array<Record<string, unknown>>;
  const prematureRow = prematureExercises.find((row) => row["id"] === "exercise.wave1.syllable_blending.mim_fatha");
  if (prematureRow) {
    prematureRow["choices"] = [
      ...(Array.isArray(prematureRow["choices"]) ? prematureRow["choices"] : []),
      { id: "syllable.qaf.fatha", label: "قَ" },
    ];
  }
  const prematureResult = validateCurriculum(prematureBundle);
  assert(
    "8. premature distractor syllable fails validation",
    prematureResult.issues.some(
      (issue) =>
        issue.code === "PREMATURE_CONTENT" &&
        issue.message.includes("syllable.qaf.fatha") &&
        issue.message.includes("exercise.wave1.syllable_blending.mim_fatha"),
    ),
  );

  assert(
    "8. expected live key for mim blending is letter:mim.fatha",
    liveRefForTarget(bundle, mimExercise!.masteryTargets![0]!, mimExercise).liveKey === "letter:mim.fatha",
  );
  assert(
    "8. expected live key for lam blending is letter:lam.fatha",
    liveRefForTarget(bundle, lamExercise!.masteryTargets![0]!, lamExercise).liveKey === "letter:lam.fatha",
  );
  assert(
    "1. Unit 2 fatha co-target still uses the blending live key",
    liveRefForTarget(bundle, mimExercise!.masteryTargets![1]!, mimExercise).liveKey === "letter:mim.fatha",
  );

  const conflictBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const conflictExercises = conflictBundle["exercises"] as Array<Record<string, unknown>>;
  const conflictRow = conflictExercises.find((row) => row["id"] === "exercise.wave1.syllable_blending.lam_fatha");
  if (conflictRow && Array.isArray(conflictRow["masteryTargets"])) {
    const first = conflictRow["masteryTargets"][0] as Record<string, unknown>;
    first["id"] = "mastery.syllable.mim.fatha";
  }
  const conflictResult = validateCurriculum(conflictBundle);
  assert(
    "8. duplicate mastery ids with conflicting payloads fail",
    conflictResult.issues.some(
      (issue) =>
        issue.code === "DUPLICATE_ID" &&
        issue.message.includes("mastery.syllable.mim.fatha") &&
        issue.message.includes("different skill/item payload"),
    ),
  );

  const unscoredBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const unscoredUnits = unscoredBundle["units"] as Array<Record<string, unknown>>;
  const unscoredUnit = unscoredUnits.find((row) => row["id"] === "unit.literacy.wave1.fatha_cv");
  if (unscoredUnit) {
    unscoredUnit["exerciseIds"] = ["exercise.wave1.syllable_blending.mim_fatha"];
  }
  const unscoredResult = validateCurriculum(unscoredBundle);
  assert(
    "8. unit 2 requires both listed syllables to be scored",
    unscoredResult.issues.some(
      (issue) =>
        issue.code === "MISSING_MASTERY_TARGET" &&
        issue.message.includes("syllable.lam.fatha") &&
        issue.message.includes("no syllable_blending exercise scores it"),
    ),
  );

  const mimRef = unit2Refs.find((ref) => ref.liveKey === "letter:mim.fatha")!;
  const lamRef = unit2Refs.find((ref) => ref.liveKey === "letter:lam.fatha")!;
  const orderedUnit2Refs = [mimRef, lamRef];
  assert(
    "6. wrong attempt does not complete",
    !exerciseActivitiesComplete(bundle, mimExercise!, itemsFrom(orderedUnit2Refs, [[false]])),
  );
  const oneCorrect = itemsFrom(orderedUnit2Refs, [[true]]);
  assert("7. correct attempt completes that activity", exerciseActivitiesComplete(bundle, mimExercise!, oneCorrect));
  assert("7. the other activity is still incomplete", !exerciseActivitiesComplete(bundle, lamExercise!, oneCorrect));
  const u2one = evaluateUnitMastery(bundle, unit2, unit2Exercises, oneCorrect);
  assert("8. finishing one step does not master unit 2", !u2one.mastered);
  assert("8. one activity done, one attempt", u2one.activitiesDone === 1 && u2one.attempts === 1);

  const unit2Seen = seenItems(unit2Exercises);
  const bothOnce = { ...unit2Seen, ...itemsFrom(orderedUnit2Refs, [[true], [true]]) };
  const u2both = evaluateUnitMastery(bundle, unit2, unit2Exercises, bothOnce);
  assert("8. finishing both once does not automatically master Unit 2", !u2both.mastered);
  assert("8. both scored activities can complete in one visit", u2both.activitiesDone === 3);
  assert("8. attempts are 2 < 3", u2both.attempts === 2 && u2both.requiredAttempts === 3);
  assert(
    "Unit 2 completed-but-not-mastered is practice, not mastered",
    unitPathStatus(true, u2both) === "practice",
  );
  assert(
    "Unit 2 one clean pass does not show final mastery copy",
    lessonFinishKind(u2both) === "keep_practicing" &&
      lessonFinishMessageAr(lessonFinishKind(u2both)) !== "أَكْمَلْتَ هَذِهِ الْوَحْدَة" &&
      unitPathCtaAr(unitPathStatus(true, u2both)) === "تَدَرَّبْ",
  );
  const u2afterBothOnce = scheduleLesson(bundle, unit2, unit2Exercises, bothOnce);
  assert(
    "Unit 2 stays in required practice after both activities have one correct",
    u2afterBothOnce.phase === "required",
    u2afterBothOnce.phase,
  );
  const u2afterBothOnceFromEnd = scheduleLesson(bundle, unit2, unit2Exercises, bothOnce, { fromIndex: 1 });
  assert(
    "Unit 2 after one pass continues required practice instead of finishing the lesson",
    u2afterBothOnceFromEnd.phase === "required" && !u2both.mastered,
    u2afterBothOnceFromEnd.phase,
  );

  let u2loopItems: Record<string, ItemProgress> = { ...unit2Seen };
  let u2from: number | undefined;
  let u2loops = 0;
  while (u2loops < 12 && !evaluateUnitMastery(bundle, unit2, unit2Exercises, u2loopItems).mastered) {
    const scheduled = scheduleLesson(
      bundle,
      unit2,
      unit2Exercises,
      u2loopItems,
      u2from === undefined ? undefined : { fromIndex: u2from },
    );
    assert(
      `Unit 2 in-lesson loop is required practice (step ${u2loops})`,
      scheduled.phase === "required",
      scheduled.phase,
    );
    u2loopItems = applyScheduledCorrect(bundle, unit2Exercises, u2loopItems, scheduled.index);
    u2from = scheduled.index;
    u2loops += 1;
  }
  const u2looped = evaluateUnitMastery(bundle, unit2, unit2Exercises, u2loopItems);
  assert("Unit 2 can master from in-lesson required practice without re-entering the route", u2looped.mastered, u2looped.blockers.join("; "));
  assert("Unit 2 required loop is finite", u2loops >= 3 && u2loops < 12, String(u2loops));
  assert("Unit 2 in-lesson loop does not double-count a tap", u2looped.attempts === u2loops);
  const afterU2Mastery = scheduleLesson(bundle, unit2, unit2Exercises, u2loopItems);
  assert("Unit 2 stops required looping once mastered", afterU2Mastery.phase === "done");
  assert(
    "in-lesson Unit 2 mastery finishes the player",
    scheduleLesson(bundle, unit2, unit2Exercises, u2loopItems, { fromIndex: 1 }).phase === "done" &&
      lessonFinishKind(u2looped) === "mastered",
  );
  assert(
    "Unit 3 unlocks after in-lesson Unit 2 mastery without route re-entry",
    evaluateUnitUnlock(bundle, units, unit3, u2loopItems).unlocked,
  );

  const u2mastered = evaluateUnitMastery(
    bundle,
    unit2,
    unit2Exercises,
    itemsFrom(orderedUnit2Refs, [[true, true], [true]]),
  );
  assert("9. mastery only after thresholds are met", u2mastered.mastered, u2mastered.blockers.join("; "));
  assert("9. unique refs were not double-counted", u2mastered.attempts === 3);
  assert("unit 2 required skills remain mapped", u2mastered.unmappedRequiredSkills.length === 0);

  const unit3Refs = refsForExercises(bundle, unit3Exercises);
  const formExercise = unit3Exercises.find((row) => row.type === "letter_recognition");
  const qafBlend = unit3Exercises.find((row) => row.type === "syllable_blending");
  const qafSound = unit3Exercises.find((row) => row.id === "exercise.wave1.sound_to_letter.qaf");
  const resolvedForm = formExercise ? resolveLetterRecognition(bundle, formExercise) : undefined;
  const resolvedQaf = qafBlend ? resolveSyllableBlending(bundle, qafBlend) : undefined;
  const formRef = unit3Refs.find((ref) => ref.liveKey === "letter:lam.form.medial");
  const qafRef = unit3Refs.find((ref) => ref.liveKey === "letter:qaf.fatha");
  const qafSoundRef = unit3Refs.find((ref) => ref.liveKey === "letter:qaf.sound");

  assert("unit 3 prereq is unit 2", unit3.prereqUnitIds[0] === unit2.id);
  assert("unit 4 prereq is unit 3", unit4.prereqUnitIds[0] === unit3.id);
  assert("3. letter_recognition renderer reports ready", unitRenderersReady(unit3Exercises));
  assert(
    "1. Unit 3 locked when Unit 2 is not mastered",
    !evaluateUnitUnlock(bundle, units, unit3, empty).unlocked,
  );
  assert(
    "1. Unit 3 route is locked without Unit 2 mastery",
    resolveUnitRouteAccess(false, unitRenderersReady(unit3Exercises)) === "locked",
  );
  const u2doneItems = itemsFrom(orderedUnit2Refs, [[true, true], [true]]);
  const u3unlock = evaluateUnitUnlock(bundle, units, unit3, u2doneItems);
  assert("2. Unit 3 unlocks after valid Unit 2 mastery", u3unlock.unlocked);
  assert(
    "2. Unit 3 becomes curriculum-playable after Unit 2 mastery",
    resolveUnitRouteAccess(u3unlock.unlocked, unitRenderersReady(unit3Exercises)) === "play",
  );
  assert("4. Unit 3 letter-recognition exercise resolves", Boolean(resolvedForm));
  assert("5. target letter exists", resolvedForm?.targetLetterId === "letter.lam");
  assert("6. requested letter form is legal", resolvedForm?.targetForm === "medial" && resolvedForm.promptGlyph === "ـلـ");
  assert(
    "Unit 3 distractors are lam/mim/qaf",
    resolvedForm?.choices.every((row) => ["letter.lam", "letter.mim", "letter.qaf"].includes(row.id)) === true &&
      resolvedForm.choices.length === 3,
  );
  assert("Unit 3 qaf blending resolves", resolvedQaf?.target.id === "syllable.qaf.fatha");
  assert(
    "Unit 3 qaf scored prompt does not print قَ",
    Boolean(resolvedQaf) &&
      !syllablePromptExposesTarget(resolvedQaf?.promptText, resolvedQaf?.target.text ?? "") &&
      (resolvedQaf?.promptGlyphs.length ?? 1) === 0,
  );
  assert(
    "Unit 3 qaf still offers قَ among printed choices",
    resolvedQaf?.choices.some((row) => row.id === "syllable.qaf.fatha" && row.text === "قَ") === true,
  );
  assert(
    "Unit 3 qaf distractors remain مَ and لَ",
    resolvedQaf?.choices.some((row) => row.id === "syllable.mim.fatha") === true &&
      resolvedQaf?.choices.some((row) => row.id === "syllable.lam.fatha") === true &&
      resolvedQaf.choices.length === 3,
  );
  assert(
    "11. form live key is letter:lam.form.medial",
    formRef?.liveKey === "letter:lam.form.medial" &&
      getLetterFormLiveKey({ letterLegacyId: "lam", form: "medial" }).liveKey === "letter:lam.form.medial",
  );
  assert("11. qaf blending live key is letter:qaf.fatha", qafRef?.liveKey === "letter:qaf.fatha");
  assert("11. qaf sound live key is letter:qaf.sound", qafSoundRef?.liveKey === "letter:qaf.sound");
  assert("unit 3 unique refs are form + qaf syllable + qaf sound", unit3Refs.length === 3, String(unit3Refs.length));
  assert("Unit 3 scores ق as a letter target", qafSound?.success.correctChoiceId === "letter.qaf");
  assert("Unit 3 medial-ل prompt does not print ـلـ", formExercise?.promptText === "اِخْتَرِ الْحَرْفَ");

  const illegalFormBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const illegalFormExercises = illegalFormBundle["exercises"] as Array<Record<string, unknown>>;
  const illegalFormRow = illegalFormExercises.find((row) => row["id"] === "exercise.wave1.letter_forms.lam");
  if (illegalFormRow) {
    illegalFormRow["config"] = { task: "match_form", targetForm: "medial", letterId: "letter.dal" };
  }
  const illegalFormResult = validateCurriculum(illegalFormBundle);
  assert(
    "7. illegal form fails validation",
    illegalFormResult.issues.some(
      (issue) => issue.code === "INVALID_LETTER_FORM" && issue.message.includes("letter.dal"),
    ),
  );

  const unknownLetterBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const unknownLetterExercises = unknownLetterBundle["exercises"] as Array<Record<string, unknown>>;
  const unknownLetterRow = unknownLetterExercises.find((row) => row["id"] === "exercise.wave1.letter_forms.lam");
  if (unknownLetterRow) {
    unknownLetterRow["choices"] = [
      ...(Array.isArray(unknownLetterRow["choices"]) ? unknownLetterRow["choices"] : []),
      { id: "letter.notreal", label: "?" },
    ];
  }
  const unknownLetterResult = validateCurriculum(unknownLetterBundle);
  assert(
    "8. future/unknown letter choice fails validation",
    unknownLetterResult.issues.some(
      (issue) => issue.code === "MISSING_LETTER" && issue.message.includes("letter.notreal"),
    ),
  );

  const prematureLetterBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const prematureLetterExercises = prematureLetterBundle["exercises"] as Array<Record<string, unknown>>;
  const prematureLetterRow = prematureLetterExercises.find((row) => row["id"] === "exercise.wave1.letter_forms.lam");
  if (prematureLetterRow) {
    prematureLetterRow["choices"] = [
      ...(Array.isArray(prematureLetterRow["choices"]) ? prematureLetterRow["choices"] : []),
      { id: "letter.dal", label: "د" },
    ];
  }
  const prematureLetterResult = validateCurriculum(prematureLetterBundle);
  assert(
    "8. future-unit letter choice fails validation",
    prematureLetterResult.issues.some(
      (issue) =>
        issue.code === "PREMATURE_CONTENT" &&
        issue.message.includes("letter.dal") &&
        issue.message.includes("exercise.wave1.letter_forms.lam"),
    ),
  );

  const orderedUnit3Refs = [formRef!, qafRef!, qafSoundRef!];
  assert(
    "9. wrong answer does not complete the activity",
    !exerciseActivitiesComplete(bundle, formExercise!, itemsFrom(orderedUnit3Refs, [[false]])),
  );
  const formCorrect = itemsFrom(orderedUnit3Refs, [[true]]);
  assert("10. correct answer completes that activity step", exerciseActivitiesComplete(bundle, formExercise!, formCorrect));
  assert("10. qaf step still incomplete", !exerciseActivitiesComplete(bundle, qafBlend!, formCorrect));

  const bothUnit3Once = itemsFrom(orderedUnit3Refs, [[true], [true], [true]]);
  const u3once = evaluateUnitMastery(bundle, unit3, unit3Exercises, bothUnit3Once);
  assert("12. finishing Unit 3 lesson once does not bypass mastery", !u3once.mastered);
  assert("12. Unit 3 scored activities can complete in one visit", u3once.activitiesDone === 3);
  assert("12. attempts are 3 and still need streak", u3once.attempts === 3 && u3once.requiredAttempts === 3);

  const unmappedRequiredBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const unmappedUnits = unmappedRequiredBundle["units"] as Array<Record<string, unknown>>;
  const unmappedUnit3 = unmappedUnits.find((row) => row["id"] === "unit.literacy.wave1.qaf_qalam");
  const unmappedMastery = unmappedUnit3?.["mastery"];
  if (unmappedMastery && typeof unmappedMastery === "object" && !Array.isArray(unmappedMastery)) {
    (unmappedMastery as Record<string, unknown>)["requiredSkillIds"] = ["skill.word_decoding.simple"];
  }
  const unmappedResult = validateCurriculum(unmappedRequiredBundle);
  assert(
    "required skill without a mastery target fails validation",
    unmappedResult.issues.some(
      (issue) =>
        issue.code === "UNMAPPED_REQUIRED_SKILL" &&
        issue.message.includes("unit.literacy.wave1.qaf_qalam") &&
        issue.message.includes("skill.word_decoding.simple"),
    ),
    unmappedResult.issues.map((issue) => `${issue.code}: ${issue.message}`).join(" | "),
  );

  const unit3MeasuredSkills = new Set(
    unit3Exercises.flatMap((exercise) => (exercise.masteryTargets ?? []).map((target) => target.skillId)),
  );
  assert(
    "Unit 3 has no unmapped required skill",
    (unit3.mastery.requiredSkillIds ?? []).every((skillId) => unit3MeasuredSkills.has(skillId)) &&
      u3once.unmappedRequiredSkills.length === 0,
  );
  assert(
    "Unit 3 does not require word decoding",
    !(unit3.mastery.requiredSkillIds ?? []).includes("skill.word_decoding.simple") &&
      !unit3MeasuredSkills.has("skill.word_decoding.simple"),
  );
  assert("Unit 3 keeps word.qalam as catalog/availability", (unit3.wordIds ?? []).includes("word.qalam"));

  const formOnly = itemsFrom(orderedUnit3Refs, [[true, true], []]);
  const blendOnly = itemsFrom(orderedUnit3Refs, [[], [true, true]]);
  const u3formOnly = evaluateUnitMastery(bundle, unit3, unit3Exercises, formOnly);
  const u3blendOnly = evaluateUnitMastery(bundle, unit3, unit3Exercises, blendOnly);
  assert(
    "Unit 3 cannot master without every required skill (form only)",
    !u3formOnly.mastered &&
      u3formOnly.blockers.some((row) => row.includes("skill.syllable_blending.cv")),
  );
  assert(
    "Unit 3 cannot master without every required skill (syllable only)",
    !u3blendOnly.mastered &&
      u3blendOnly.blockers.some((row) => row.includes("skill.letter_forms.positional")),
  );

  const wordDecodingUnit = {
    ...unit3,
    mastery: {
      ...unit3.mastery,
      requiredSkillIds: ["skill.word_decoding.simple"],
    },
  };
  const syllableAsWord = evaluateUnitMastery(bundle, wordDecodingUnit, unit3Exercises, blendOnly);
  const formAsWord = evaluateUnitMastery(bundle, wordDecodingUnit, unit3Exercises, formOnly);
  const bothAsWord = evaluateUnitMastery(
    bundle,
    wordDecodingUnit,
    unit3Exercises,
    itemsFrom(orderedUnit3Refs, [[true, true], [true], [true]]),
  );
  assert(
    "syllable evidence cannot satisfy word-decoding mastery",
    !syllableAsWord.mastered &&
      syllableAsWord.unmappedRequiredSkills.includes("skill.word_decoding.simple") &&
      syllableAsWord.blockers.some((row) => row.includes("skill.word_decoding.simple") && row.includes("no mastery target")),
  );
  assert(
    "letter-form evidence cannot satisfy word-decoding mastery",
    !formAsWord.mastered &&
      formAsWord.unmappedRequiredSkills.includes("skill.word_decoding.simple") &&
      formAsWord.blockers.some((row) => row.includes("skill.word_decoding.simple") && row.includes("no mastery target")),
  );
  assert("qaf syllable live key is not a word-decoding key", qafRef?.liveKey === "letter:qaf.fatha");
  assert("lam form live key is not a word-decoding key", formRef?.liveKey === "letter:lam.form.medial");
  assert(
    "malformed unmapped required skill fails closed at runtime",
    !bothAsWord.mastered && bothAsWord.unmappedRequiredSkills.includes("skill.word_decoding.simple"),
  );

  const u3mastered = evaluateUnitMastery(
    bundle,
    unit3,
    unit3Exercises,
    itemsFrom(orderedUnit3Refs, [[true, true], [true], [true]]),
  );
  assert("Unit 3 mastery after thresholds", u3mastered.mastered, u3mastered.blockers.join("; "));
  assert("Unit 3 valid mastery has no unmapped required skills", u3mastered.unmappedRequiredSkills.length === 0);
  assert(
    "Unit 3 valid mastery does not invent word-decoding evidence",
    !Object.keys(itemsFrom(orderedUnit3Refs, [[true, true], [true], [true]])).some((key) => key.startsWith("word:")),
  );

  assert(
    "13. Unit 4 remains locked until Unit 3 mastery",
    !evaluateUnitUnlock(bundle, units, unit4, { ...u2doneItems, ...bothUnit3Once }).unlocked,
  );
  const u4after = evaluateUnitUnlock(bundle, units, unit4, {
    ...u2doneItems,
    ...itemsFrom(orderedUnit3Refs, [[true, true], [true], [true]]),
  });
  assert("13. Unit 4 unlocks after Unit 3 mastery", u4after.unlocked);
  assert(
    "2. Unit 4 becomes curriculum-playable after Unit 3 mastery",
    resolveUnitRouteAccess(u4after.unlocked, unitRenderersReady(unit4Exercises)) === "play",
  );
  assert("3. audio_to_word renderer reports ready", unitRenderersReady(unit4Exercises));

  const wordExercise = unit4Exercises.find((row) => row.id === "exercise.wave1.audio_to_word.qadam");
  const resolvedWord = wordExercise ? resolveAudioToWord(bundle, wordExercise) : undefined;
  assert("4. Unit 4 word exercise resolves", Boolean(resolvedWord));
  assert("5. target word exists", resolvedWord?.target.id === "word.qadam" && resolvedWord.target.displayText === "قَدَم");
  assert(
    "6. both choices exist",
    resolvedWord?.choices.some((row) => row.id === "word.qadam") === true &&
      resolvedWord.choices.some((row) => row.id === "word.qalam") === true &&
      resolvedWord.choices.length === 2,
  );
  assert(
    "getWordLiveKey uses word:qadam.decoding",
    getWordLiveKey({ wordId: "word.qadam" }).liveKey === "word:qadam.decoding",
  );
  assert("Unit 4 title does not reveal قَدَم", !unit4.titleAr.includes("قَدَم") && !unit4.titleAr.includes("قَلَم"));

  const unit4Refs = refsForExercises(bundle, unit4Exercises);
  const qadamRef = unit4Refs.find((ref) => ref.liveKey === "word:qadam.decoding");
  const dalSoundRef = unit4Refs.find((ref) => ref.liveKey === "letter:dal.sound");
  assert("11. Unit 4 live key is word:qadam.decoding", qadamRef?.liveKey === "word:qadam.decoding");
  assert("11. Unit 4 also scores د", dalSoundRef?.liveKey === "letter:dal.sound");
  assert("11. Unit 4 unique scored refs are dal sound + qadam", unit4Refs.length === 2, String(unit4Refs.length));
  assert("Unit 4 required skill is mapped", (unit4.mastery.requiredSkillIds ?? []).includes("skill.word_decoding.simple"));

  const unknownWordBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const unknownWordExercises = unknownWordBundle["exercises"] as Array<Record<string, unknown>>;
  const unknownWordRow = unknownWordExercises.find((row) => row["id"] === "exercise.wave1.audio_to_word.qalam");
  if (unknownWordRow) {
    unknownWordRow["choices"] = [
      ...(Array.isArray(unknownWordRow["choices"]) ? unknownWordRow["choices"] : []),
      { id: "word.notreal", label: "?" },
    ];
  }
  const unknownWordResult = validateCurriculum(unknownWordBundle);
  assert(
    "7. unknown word ref fails validation",
    unknownWordResult.issues.some(
      (issue) => issue.code === "MISSING_WORD" && issue.message.includes("word.notreal"),
    ),
  );

  const prematureWordBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const prematureWordExercises = prematureWordBundle["exercises"] as Array<Record<string, unknown>>;
  const prematureWordRow = prematureWordExercises.find((row) => row["id"] === "exercise.wave1.audio_to_word.qalam");
  if (prematureWordRow) {
    prematureWordRow["choices"] = [
      ...(Array.isArray(prematureWordRow["choices"]) ? prematureWordRow["choices"] : []),
      { id: "word.walad", label: "وَلَد" },
    ];
  }
  const prematureWordResult = validateCurriculum(prematureWordBundle);
  assert(
    "8. future/premature word fails validation",
    prematureWordResult.issues.some(
      (issue) =>
        issue.code === "PREMATURE_CONTENT" &&
        issue.message.includes("word.walad") &&
        issue.message.includes("exercise.wave1.audio_to_word.qalam"),
    ),
    prematureWordResult.issues.map((issue) => `${issue.code}: ${issue.message}`).join(" | "),
  );

  const mismatchWordBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const mismatchWordExercises = mismatchWordBundle["exercises"] as Array<Record<string, unknown>>;
  const mismatchWordRow = mismatchWordExercises.find((row) => row["id"] === "exercise.wave1.audio_to_word.qalam");
  if (mismatchWordRow && Array.isArray(mismatchWordRow["masteryTargets"])) {
    const targets = mismatchWordRow["masteryTargets"] as Array<Record<string, unknown>>;
    if (targets[0]) targets[0]["wordId"] = "word.qadam";
  }
  const mismatchWordResult = validateCurriculum(mismatchWordBundle);
  assert(
    "word-decoding target must match the scored word",
    mismatchWordResult.issues.some(
      (issue) =>
        issue.code === "MISSING_MASTERY_TARGET" &&
        issue.message.includes("word.qalam"),
    ),
  );

  const emptyTargetBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const emptyTargetExercises = emptyTargetBundle["exercises"] as Array<Record<string, unknown>>;
  const emptyTargetRow = emptyTargetExercises.find((row) => row["id"] === "exercise.wave1.audio_to_word.qalam");
  if (emptyTargetRow) {
    emptyTargetRow["contentIds"] = [];
    emptyTargetRow["choices"] = [];
    emptyTargetRow["success"] = { type: "correct_choice" };
    emptyTargetRow["masteryTargets"] = [{ id: "mastery.word.broken.decode", skillId: "skill.word_decoding.simple" }];
  }
  const emptyTargetResult = validateCurriculum(emptyTargetBundle);
  assert(
    "malformed audio_to_word with no playable target fails",
    emptyTargetResult.issues.some(
      (issue) =>
        issue.code === "MISSING_FIELD" &&
        issue.message.includes("playable target word"),
    ),
  );

  const orderedUnit4Refs = [qadamRef!, dalSoundRef!];
  assert(
    "9. wrong answer does not complete",
    !exerciseActivitiesComplete(bundle, wordExercise!, itemsFrom(orderedUnit4Refs, [[false]])),
  );
  const wordCorrect = itemsFrom(orderedUnit4Refs, [[true]]);
  assert("10. correct answer completes the activity step", exerciseActivitiesComplete(bundle, wordExercise!, wordCorrect));
  assert("11. attempt writes to expected word live key", Object.keys(wordCorrect)[0] === "word:qadam.decoding");

  const u4syllableOnly = evaluateUnitMastery(
    bundle,
    unit4,
    unit4Exercises,
    { ...itemsFrom(orderedUnit3Refs, [[true, true], [true], [true]]), ...itemsFrom([{ liveKey: "letter:qaf.fatha" } as LiveMasteryRef], [[true, true, true]]) },
  );
  const u4letterOnly = evaluateUnitMastery(
    bundle,
    unit4,
    unit4Exercises,
    { ...itemsFrom(orderedUnit3Refs, [[true, true], [true], [true]]), ...itemsFrom([{ liveKey: "letter:lam.form.medial" } as LiveMasteryRef], [[true, true, true]]) },
  );
  assert(
    "12. syllable evidence cannot satisfy word decoding",
    !u4syllableOnly.mastered &&
      u4syllableOnly.blockers.some((row) => row.includes("skill.word_decoding.simple") || row.includes("targets")),
  );
  assert(
    "13. letter evidence cannot satisfy word decoding",
    !u4letterOnly.mastered &&
      u4letterOnly.blockers.some((row) => row.includes("skill.word_decoding.simple") || row.includes("targets")),
  );

  const unit4Seen = seenItems(unit4Exercises);
  const u4once = evaluateUnitMastery(bundle, unit4, unit4Exercises, {
    ...unit4Seen,
    ...itemsFrom(orderedUnit4Refs, [[true], [true]]),
  });
  assert("14. finishing Unit 4 lesson once does not bypass mastery", !u4once.mastered);
  assert("14. Unit 4 scored activities can complete in one visit", u4once.activitiesDone === 4);
  assert("14. attempts are 2 < 3", u4once.attempts === 2 && u4once.requiredAttempts === 3);
  const qadamIndex = unit4Exercises.findIndex((row) => row.id === "exercise.wave1.audio_to_word.qadam");
  assert(
    "Unit 4 after one correct continues the required decoding exercise",
    scheduleLesson(bundle, unit4, unit4Exercises, { ...unit4Seen, ...itemsFrom([qadamRef!], [[true]]) }, { fromIndex: qadamIndex }).phase ===
      "required",
  );

  let u4loopItems: Record<string, ItemProgress> = { ...unit4Seen };
  let u4from: number | undefined;
  let u4loops = 0;
  while (u4loops < 10 && !evaluateUnitMastery(bundle, unit4, unit4Exercises, u4loopItems).mastered) {
    const scheduled = scheduleLesson(
      bundle,
      unit4,
      unit4Exercises,
      u4loopItems,
      u4from === undefined ? undefined : { fromIndex: u4from },
    );
    assert(
      `Unit 4 in-lesson loop is required practice (step ${u4loops})`,
      scheduled.phase === "required",
      scheduled.phase,
    );
    u4loopItems = applyScheduledCorrect(bundle, unit4Exercises, u4loopItems, scheduled.index);
    u4from = scheduled.index;
    u4loops += 1;
  }
  const u4looped = evaluateUnitMastery(bundle, unit4, unit4Exercises, u4loopItems);
  assert("Unit 4 can master from repeated required practice without re-entering the route", u4looped.mastered, u4looped.blockers.join("; "));
  assert("Unit 4 required loop is finite", u4loops >= 3 && u4loops < 10, String(u4loops));
  assert(
    "Unit 4 in-lesson mastery stops looping",
    scheduleLesson(bundle, unit4, unit4Exercises, u4loopItems, { fromIndex: qadamIndex }).phase === "done",
  );

  const u4masteredItems = itemsFrom(orderedUnit4Refs, [[true, true], [true]]);
  const u4mastered = evaluateUnitMastery(bundle, unit4, unit4Exercises, u4masteredItems);
  assert("Unit 4 mastery after thresholds", u4mastered.mastered, u4mastered.blockers.join("; "));
  assert("Unit 4 valid mastery has no unmapped required skills", u4mastered.unmappedRequiredSkills.length === 0);

  const u3masteredItems = {
    ...u2doneItems,
    ...itemsFrom(orderedUnit3Refs, [[true, true], [true], [true]]),
  };
  assert(
    "15. Unit 5 remains locked until Unit 4 mastery",
    !evaluateUnitUnlock(bundle, units, unit5, u3masteredItems).unlocked,
  );
  const u5after = evaluateUnitUnlock(bundle, units, unit5, { ...u3masteredItems, ...u4masteredItems });
  assert("1. Unit 5 remains locked until Unit 4 mastery", !evaluateUnitUnlock(bundle, units, unit5, u3masteredItems).unlocked);
  assert("1. Unit 5 unlocks after Unit 4 mastery", u5after.unlocked);
  assert(
    "2. Unit 5 becomes curriculum-playable after Unit 4 mastery",
    resolveUnitRouteAccess(u5after.unlocked, unitRenderersReady(unit5Exercises)) === "play",
  );
  assert("3. missing_haraka renderer reports ready", unitRenderersReady(unit5Exercises.filter((row) => row.type === "missing_haraka")));
  assert("4. picture_to_word renderer reports ready", unitRenderersReady(unit5Exercises.filter((row) => row.type === "picture_to_word")));
  assert("Unit 5 both renderers ready", unitRenderersReady(unit5Exercises));

  const harakaExercise = unit5Exercises.find((row) => row.type === "missing_haraka");
  const pictureExercise = unit5Exercises.find((row) => row.type === "picture_to_word");
  const resolvedHaraka = harakaExercise ? resolveMissingHaraka(bundle, harakaExercise) : undefined;
  const resolvedPicture = pictureExercise ? resolvePictureToWord(bundle, pictureExercise) : undefined;
  assert("5. missing_haraka resolves", Boolean(resolvedHaraka));
  assert("5. picture_to_word resolves", Boolean(resolvedPicture));
  assert("missing_haraka scores fatha", resolvedHaraka?.target.id === "syllable.mim.fatha" && resolvedHaraka.target.vowelSkillId === "skill.short_vowel.fatha");
  const harakaPrompt = resolvedHaraka?.promptGlyph ?? "";
  assert(
    "missing_haraka prompt does not reveal the vowel",
    harakaPrompt.length > 0 &&
      !harakaPrompt.includes("\u064E") &&
      !harakaPrompt.includes("\u064F") &&
      !harakaPrompt.includes("\u0650"),
  );
  assert(
    "6. haraka choices are fatha/kasra/damma",
    resolvedHaraka?.choices.some((row) => row.id === "syllable.mim.fatha") === true &&
      resolvedHaraka.choices.some((row) => row.id === "syllable.mim.kasra") === true &&
      resolvedHaraka.choices.some((row) => row.id === "syllable.mim.damma") === true,
  );
  assert("9. picture target word exists", resolvedPicture?.target.id === "word.walad" && resolvedPicture.target.displayText === "وَلَد");
  assert(
    "picture choices are walad/qalam/qadam",
    resolvedPicture?.choices.some((row) => row.id === "word.walad") === true &&
      resolvedPicture.choices.some((row) => row.id === "word.qalam") === true &&
      resolvedPicture.choices.some((row) => row.id === "word.qadam") === true &&
      resolvedPicture.choices.length === 3,
  );
  assert(
    "picture visual is prototype emoji",
    resolvedPicture?.visual.kind === "emoji" &&
      resolvedPicture.visual.source === "override" &&
      resolvedPicture.visual.emoji === "👦",
  );
  const waladAudio = unit5Exercises.find((row) => row.id === "exercise.wave1.audio_to_word.walad");
  assert("Unit 5 decodes وَلَد from audio before the picture", Boolean(waladAudio) && waladAudio?.success.correctChoiceId === "word.walad");
  assert("Unit 5 picture is reinforcement", pictureExercise?.tags?.includes("reinforcement") === true);

  const visualCases: Array<[string, string, string]> = [
    ["word.qalam", "✏️", "image.word.qalam"],
    ["word.jamal", "🐪", "image.word.jamal"],
    ["word.walad", "👦", "image.word.walad"],
    ["word.qadam", "🦶", "image.word.qadam"],
    ["word.yad", "✋", "image.word.yad"],
  ];
  for (const [wordId, emoji, imageId] of visualCases) {
    const word = portableWord(bundle, wordId);
    const visual = word ? prototypeVisualForWord(word) : undefined;
    assert(
      `${wordId} uses a lemma-matching prototype emoji`,
      word?.imageAssetId === imageId && visual?.kind === "emoji" && visual.source === "override" && visual.emoji === emoji,
    );
  }
  const categoryFallback = prototypeVisualForWord({
    id: "word.not.in.wave1",
    lemma: "كتاب",
    diacritized: "كِتَاب",
    category: "school",
  });
  assert(
    "non-overridden words still use category emoji",
    categoryFallback.kind === "emoji" && categoryFallback.source === "category" && categoryFallback.emoji === "🏫",
  );
  const placeholderFallback = prototypeVisualForWord({
    id: "word.unknown.uncategorized",
    lemma: "س",
    diacritized: "س",
  });
  assert(
    "uncategorized unknown words use the generic placeholder",
    placeholderFallback.kind === "emoji" &&
      placeholderFallback.source === "placeholder" &&
      placeholderFallback.emoji === "📷",
  );
  const harakaLiveKey = getHarakaLiveKey({
    letterLegacyId: "mim",
    vowelSkillId: "skill.short_vowel.fatha",
  }).liveKey;
  const blendingLiveKey = getSyllableLiveKey({
    letterLegacyId: "mim",
    vowelSkillId: "skill.short_vowel.fatha",
  }).liveKey;
  assert("1. Unit 2 syllable evidence key remains letter:mim.fatha", blendingLiveKey === "letter:mim.fatha");
  assert(
    "2. missing_haraka uses a distinct haraka live key",
    harakaLiveKey === "diacritic:mim.fatha.discrimination",
  );
  assert("2. haraka helper does not alias syllable blending", harakaLiveKey !== blendingLiveKey);
  assert(
    "kasra discrimination does not collapse onto fatha",
    getHarakaLiveKey({ letterLegacyId: "mim", vowelSkillId: "skill.short_vowel.kasra" }).liveKey ===
      "diacritic:mim.kasra.discrimination",
  );
  assert(
    "damma discrimination does not collapse onto fatha",
    getHarakaLiveKey({ letterLegacyId: "mim", vowelSkillId: "skill.short_vowel.damma" }).liveKey ===
      "diacritic:mim.damma.discrimination",
  );

  const unit5Refs = refsForExercises(bundle, unit5Exercises);
  const harakaRef = unit5Refs.find((ref) => ref.liveKey === harakaLiveKey);
  const waladRef = unit5Refs.find((ref) => ref.liveKey === "word:walad.decoding");
  assert(
    "2. Unit 5 missing_haraka live key is diacritic:mim.fatha.discrimination",
    harakaRef?.liveKey === "diacritic:mim.fatha.discrimination" && harakaRef.type === "diacritic",
  );
  assert("missing_haraka does not use the blending key", harakaRef?.liveKey !== "letter:mim.fatha");
  assert("13. walad live key is word:walad.decoding", waladRef?.liveKey === "word:walad.decoding");
  const wawSoundRef = unit5Refs.find((ref) => ref.liveKey === "letter:waw.sound");
  assert("Unit 5 also scores و", wawSoundRef?.liveKey === "letter:waw.sound");
  assert("Unit 5 unique refs are haraka + walad + waw sound", unit5Refs.length === 3, String(unit5Refs.length));
  assert("Unit 5 title does not claim all harakat", !unit5.titleAr.includes("الْحَرَكَات"));
  assert(
    "Unit 5 required skills are mapped",
    (unit5.mastery.requiredSkillIds ?? []).includes("skill.short_vowel.fatha") &&
      (unit5.mastery.requiredSkillIds ?? []).includes("skill.word_decoding.simple") &&
      !(unit5.mastery.requiredSkillIds ?? []).includes("skill.short_vowel.kasra") &&
      !(unit5.mastery.requiredSkillIds ?? []).includes("skill.short_vowel.damma"),
  );
  assert(
    "2. missing_haraka does not resolve through the syllable-blending helper",
    liveRefForTarget(bundle, harakaExercise!.masteryTargets![0]!, harakaExercise).liveKey === harakaLiveKey,
  );
  assert(
    "picture_to_word still uses a word live key",
    liveRefForTarget(bundle, pictureExercise!.masteryTargets![0]!, pictureExercise).liveKey === "word:walad.decoding",
  );

  const u5fromUnit2 = evaluateUnitMastery(bundle, unit5, unit5Exercises, u2doneItems);
  assert(
    "3. Unit 2 blending progress cannot satisfy Unit 5 fatha discrimination",
    !u5fromUnit2.mastered &&
      u5fromUnit2.blockers.some((row) => row.includes("skill.short_vowel.fatha")),
    u5fromUnit2.blockers.join("; "),
  );
  const u5fromUnit2PlusWalad = evaluateUnitMastery(bundle, unit5, unit5Exercises, {
    ...u2doneItems,
    ...itemsFrom([waladRef!], [[true, true, true]]),
  });
  assert(
    "3. Unit 2 blending plus walad still cannot master Unit 5",
    !u5fromUnit2PlusWalad.mastered &&
      u5fromUnit2PlusWalad.blockers.some((row) => row.includes("skill.short_vowel.fatha")),
    u5fromUnit2PlusWalad.blockers.join("; "),
  );

  const unknownHarakaBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const unknownHarakaExercises = unknownHarakaBundle["exercises"] as Array<Record<string, unknown>>;
  const unknownHarakaRow = unknownHarakaExercises.find((row) => row["id"] === "exercise.wave1.missing_haraka.mim");
  if (unknownHarakaRow) {
    unknownHarakaRow["choices"] = [
      ...(Array.isArray(unknownHarakaRow["choices"]) ? unknownHarakaRow["choices"] : []),
      { id: "syllable.does.not.exist", label: "?" },
    ];
  }
  const unknownHarakaResult = validateCurriculum(unknownHarakaBundle);
  assert(
    "7. unknown/illegal haraka ref fails validation",
    unknownHarakaResult.issues.some(
      (issue) => issue.code === "MISSING_SYLLABLE" && issue.message.includes("syllable.does.not.exist"),
    ),
  );

  const prematureVowelBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const prematureVowelUnits = prematureVowelBundle["units"] as Array<Record<string, unknown>>;
  const prematureUnit4 = prematureVowelUnits.find((row) => row["id"] === "unit.literacy.wave1.dal_qadam");
  if (prematureUnit4 && Array.isArray(prematureUnit4["exerciseIds"])) {
    prematureUnit4["exerciseIds"] = [...prematureUnit4["exerciseIds"], "exercise.wave1.missing_haraka.mim"];
  }
  const prematureVowelResult = validateCurriculum(prematureVowelBundle);
  assert(
    "8. premature vowel use fails validation",
    prematureVowelResult.issues.some(
      (issue) =>
        issue.code === "PREMATURE_CONTENT" &&
        (issue.message.includes("skill.short_vowel.kasra") || issue.message.includes("syllable.mim.kasra")),
    ),
    prematureVowelResult.issues.map((issue) => `${issue.code}: ${issue.message}`).join(" | "),
  );

  const mismatchHarakaBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const mismatchHarakaExercises = mismatchHarakaBundle["exercises"] as Array<Record<string, unknown>>;
  const mismatchHarakaRow = mismatchHarakaExercises.find((row) => row["id"] === "exercise.wave1.missing_haraka.mim");
  if (mismatchHarakaRow && Array.isArray(mismatchHarakaRow["masteryTargets"])) {
    const targets = mismatchHarakaRow["masteryTargets"] as Array<Record<string, unknown>>;
    if (targets[0]) targets[0]["skillId"] = "skill.short_vowel.kasra";
  }
  const mismatchHarakaResult = validateCurriculum(mismatchHarakaBundle);
  assert(
    "haraka mastery must match scored vowel",
    mismatchHarakaResult.issues.some(
      (issue) =>
        issue.code === "MISSING_MASTERY_TARGET" &&
        issue.message.includes("skill.short_vowel.fatha"),
    ),
  );

  const unknownPictureBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const unknownPictureExercises = unknownPictureBundle["exercises"] as Array<Record<string, unknown>>;
  const unknownPictureRow = unknownPictureExercises.find((row) => row["id"] === "exercise.wave1.picture_to_word.walad");
  if (unknownPictureRow) {
    unknownPictureRow["choices"] = [
      ...(Array.isArray(unknownPictureRow["choices"]) ? unknownPictureRow["choices"] : []),
      { id: "word.notreal", label: "?" },
    ];
  }
  const unknownPictureResult = validateCurriculum(unknownPictureBundle);
  assert(
    "10. unknown picture-to-word choice fails validation",
    unknownPictureResult.issues.some(
      (issue) => issue.code === "MISSING_WORD" && issue.message.includes("word.notreal"),
    ),
  );

  const prematurePictureBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const prematurePictureExercises = prematurePictureBundle["exercises"] as Array<Record<string, unknown>>;
  const prematurePictureRow = prematurePictureExercises.find((row) => row["id"] === "exercise.wave1.picture_to_word.walad");
  if (prematurePictureRow) {
    prematurePictureRow["choices"] = [
      ...(Array.isArray(prematurePictureRow["choices"]) ? prematurePictureRow["choices"] : []),
      { id: "word.yad", label: "يَد" },
    ];
  }
  const prematurePictureResult = validateCurriculum(prematurePictureBundle);
  assert(
    "10. premature picture-to-word choice fails validation",
    prematurePictureResult.issues.some(
      (issue) =>
        issue.code === "PREMATURE_CONTENT" &&
        issue.message.includes("word.yad") &&
        issue.message.includes("exercise.wave1.picture_to_word.walad"),
    ),
  );

  const noVisualBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const noVisualExercises = noVisualBundle["exercises"] as Array<Record<string, unknown>>;
  const noVisualWords = noVisualBundle["words"] as Array<Record<string, unknown>>;
  const noVisualRow = noVisualExercises.find((row) => row["id"] === "exercise.wave1.picture_to_word.walad");
  const noVisualWord = noVisualWords.find((row) => row["id"] === "word.walad");
  if (noVisualRow) delete noVisualRow["promptAssetId"];
  if (noVisualWord) delete noVisualWord["imageAssetId"];
  const noVisualResult = validateCurriculum(noVisualBundle);
  assert(
    "malformed picture_to_word visual target fails",
    noVisualResult.issues.some(
      (issue) => issue.code === "MISSING_FIELD" && issue.message.includes("visual target"),
    ),
  );

  const orderedUnit5Refs = [harakaRef!, waladRef!, wawSoundRef!];
  assert(
    "11. wrong haraka does not complete",
    !exerciseActivitiesComplete(bundle, harakaExercise!, itemsFrom(orderedUnit5Refs, [[false]])),
  );
  const pictureSeen = activitySeen(pictureExercise!);
  assert(
    "11. wrong picture choice does not complete",
    !exerciseActivitiesComplete(bundle, pictureExercise!, itemsFrom(orderedUnit5Refs, [[], [false]])),
  );
  const harakaCorrect = itemsFrom(orderedUnit5Refs, [[true]]);
  const pictureCorrect = { ...itemsFrom(orderedUnit5Refs, [[], [true]]), ...pictureSeen };
  assert("12. correct haraka completes that activity", exerciseActivitiesComplete(bundle, harakaExercise!, harakaCorrect));
  assert("12. picture step still incomplete without being seen", !exerciseActivitiesComplete(bundle, pictureExercise!, harakaCorrect));
  assert("12. picture completes by being seen, not by sharing decoding progress", exerciseActivitiesComplete(bundle, pictureExercise!, pictureCorrect));
  assert("12. decoding progress alone does not complete the picture reinforcement", !exerciseActivitiesComplete(bundle, pictureExercise!, itemsFrom(orderedUnit5Refs, [[], [true]])));
  assert("13. haraka attempt writes diacritic:mim.fatha.discrimination", Object.keys(harakaCorrect)[0] === harakaLiveKey);
  assert("13. picture reinforcement still carries the walad decoding target", pictureExercise?.masteryTargets?.[0]?.wordId === "word.walad");
  assert("13. haraka write is not letter:mim.fatha", Object.keys(harakaCorrect)[0] !== "letter:mim.fatha");

  const harakaOnly = itemsFrom(orderedUnit5Refs, [[true, true, true], []]);
  const waladOnly = itemsFrom(orderedUnit5Refs, [[], [true, true, true]]);
  const u5harakaOnly = evaluateUnitMastery(bundle, unit5, unit5Exercises, harakaOnly);
  const u5waladOnly = evaluateUnitMastery(bundle, unit5, unit5Exercises, waladOnly);
  assert(
    "14. haraka evidence cannot satisfy word decoding",
    !u5harakaOnly.mastered &&
      u5harakaOnly.blockers.some((row) => row.includes("skill.word_decoding.simple")),
  );
  assert(
    "15. word evidence cannot satisfy unrelated vowel mastery",
    !u5waladOnly.mastered &&
      u5waladOnly.blockers.some((row) => row.includes("skill.short_vowel.fatha")),
  );

  const u5once = evaluateUnitMastery(bundle, unit5, unit5Exercises, itemsFrom(orderedUnit5Refs, [[true], [true], [true]]));
  assert("16. finishing Unit 5 lesson once does not bypass mastery", !u5once.mastered);
  assert("16. Unit 5 required evidence can complete in one visit", u5once.completedTargets === 3);
  assert("16. attempts are 3 and still need streak", u5once.attempts === 3 && u5once.requiredAttempts === 3);

  const u5masteredItems = itemsFrom(orderedUnit5Refs, [[true, true], [true], [true]]);
  const u5mastered = evaluateUnitMastery(bundle, unit5, unit5Exercises, u5masteredItems);
  assert("Unit 5 mastery after thresholds", u5mastered.mastered, u5mastered.blockers.join("; "));
  assert("Unit 5 valid mastery has no unmapped required skills", u5mastered.unmappedRequiredSkills.length === 0);

  const u4unlockItems = { ...u3masteredItems, ...u4masteredItems };
  assert(
    "17. Unit 6 remains locked until Unit 5 mastery",
    !evaluateUnitUnlock(bundle, units, unit6, u4unlockItems).unlocked,
  );
  const u6after = evaluateUnitUnlock(bundle, units, unit6, { ...u4unlockItems, ...u5masteredItems });
  assert("1. Unit 6 remains locked until Unit 5 mastery", !evaluateUnitUnlock(bundle, units, unit6, u4unlockItems).unlocked);
  assert("1. Unit 6 unlocks after Unit 5 mastery", u6after.unlocked);
  assert(
    "2. Unit 6 becomes curriculum-playable after valid Unit 5 mastery",
    resolveUnitRouteAccess(u6after.unlocked, unitRenderersReady(unit6Exercises)) === "play",
  );
  assert("3. word_to_picture renderer reports ready", unitRenderersReady(unit6Exercises));

  const yadExercise = unit6Exercises.find((row) => row.type === "word_to_picture");
  const resolvedYad = yadExercise ? resolveWordToPicture(bundle, yadExercise) : undefined;
  assert("4. Unit 6 exercise resolves", Boolean(resolvedYad));
  assert("5. target word exists", resolvedYad?.target.id === "word.yad" && resolvedYad.target.displayText === "يَد");
  assert(
    "6. all visual choices resolve",
    resolvedYad?.choices.length === 3 &&
      resolvedYad.choices.every((row) => row.visual.kind === "emoji") === true &&
      resolvedYad.choices.some((row) => row.id === "word.yad") === true &&
      resolvedYad.choices.some((row) => row.id === "word.qalam") === true &&
      resolvedYad.choices.some((row) => row.id === "word.jamal") === true,
  );
  const yadChoice = resolvedYad?.choices.find((row) => row.id === "word.yad");
  const qalamChoice = resolvedYad?.choices.find((row) => row.id === "word.qalam");
  const jamalChoice = resolvedYad?.choices.find((row) => row.id === "word.jamal");
  assert(
    "Unit 6 pictures match lemmas",
    yadChoice?.visual.kind === "emoji" &&
      yadChoice.visual.emoji === "✋" &&
      qalamChoice?.visual.kind === "emoji" &&
      qalamChoice.visual.emoji === "✏️" &&
      jamalChoice?.visual.kind === "emoji" &&
      jamalChoice.visual.emoji === "🐪",
  );
  assert(
    "Unit 6 keeps logical image.word.* ids",
    yadChoice?.imageAssetId === "image.word.yad" &&
      qalamChoice?.imageAssetId === "image.word.qalam" &&
      jamalChoice?.imageAssetId === "image.word.jamal",
  );
  assert(
    "word_to_picture uses getWordLiveKey",
    getWordLiveKey({ wordId: "word.yad" }).liveKey === "word:yad.decoding",
  );
  const unit6Refs = refsForExercises(bundle, unit6Exercises);
  const yadRef = unit6Refs.find((ref) => ref.liveKey === "word:yad.decoding");
  const jamalRef = unit6Refs.find((ref) => ref.liveKey === "word:jamal.decoding");
  const jimSoundRef = unit6Refs.find((ref) => ref.liveKey === "letter:jim.sound");
  const yaSoundRef = unit6Refs.find((ref) => ref.liveKey === "letter:ya.sound");
  assert("11. Unit 6 live key is word:yad.decoding", yadRef?.liveKey === "word:yad.decoding" && yadRef.type === "word");
  assert("Unit 6 also scores جَمَل", jamalRef?.liveKey === "word:jamal.decoding");
  assert("Unit 6 scores ج and ي", jimSoundRef?.liveKey === "letter:jim.sound" && yaSoundRef?.liveKey === "letter:ya.sound");
  assert("Unit 6 unique scored refs are two letters + two words", unit6Refs.length === 4, String(unit6Refs.length));
  assert("Unit 6 picture is reinforcement", yadExercise?.tags?.includes("reinforcement") === true);
  const jamalAudio = unit6Exercises.find((row) => row.id === "exercise.wave1.audio_to_word.jamal");
  const yadAudio = unit6Exercises.find((row) => row.id === "exercise.wave1.audio_to_word.yad");
  assert("Unit 6 reads جَمَل from audio before the picture", jamalAudio?.success.correctChoiceId === "word.jamal");
  assert("Unit 6 reads يَد from audio before the picture", yadAudio?.success.correctChoiceId === "word.yad");
  assert(
    "Unit 6 required skill is mapped",
    (unit6.mastery.requiredSkillIds ?? []).includes("skill.word_decoding.simple") &&
      !(unit6.mastery.requiredSkillIds ?? []).includes("skill.letter_recognition.core"),
  );
  assert(
    "picture_to_word and word_to_picture share the decoding facet for a given word",
    getWordLiveKey({ wordId: "word.walad" }).liveKey === "word:walad.decoding" &&
      getWordLiveKey({ wordId: "word.yad" }).liveKey !== "word:walad.decoding",
  );

  const unknownYadBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const unknownYadExercises = unknownYadBundle["exercises"] as Array<Record<string, unknown>>;
  const unknownYadRow = unknownYadExercises.find((row) => row["id"] === "exercise.wave1.word_to_picture.yad");
  if (unknownYadRow) {
    unknownYadRow["choices"] = [
      ...(Array.isArray(unknownYadRow["choices"]) ? unknownYadRow["choices"] : []),
      { id: "word.notreal", label: "?" },
    ];
  }
  const unknownYadResult = validateCurriculum(unknownYadBundle);
  assert(
    "7. unknown word/visual ref fails validation",
    unknownYadResult.issues.some(
      (issue) => issue.code === "MISSING_WORD" && issue.message.includes("word.notreal"),
    ),
  );

  const prematureYadBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const prematureYadUnits = prematureYadBundle["units"] as Array<Record<string, unknown>>;
  const prematureUnit5 = prematureYadUnits.find((row) => row["id"] === "unit.literacy.wave1.waw_walad_vowels");
  if (prematureUnit5 && Array.isArray(prematureUnit5["exerciseIds"])) {
    prematureUnit5["exerciseIds"] = [...prematureUnit5["exerciseIds"], "exercise.wave1.word_to_picture.yad"];
  }
  const prematureYadResult = validateCurriculum(prematureYadBundle);
  assert(
    "8. premature future word fails validation",
    prematureYadResult.issues.some(
      (issue) =>
        issue.code === "PREMATURE_CONTENT" &&
        issue.message.includes("word.yad") &&
        issue.message.includes("exercise.wave1.word_to_picture.yad"),
    ),
    prematureYadResult.issues.map((issue) => `${issue.code}: ${issue.message}`).join(" | "),
  );

  const mismatchYadBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const mismatchYadExercises = mismatchYadBundle["exercises"] as Array<Record<string, unknown>>;
  const mismatchYadRow = mismatchYadExercises.find((row) => row["id"] === "exercise.wave1.word_to_picture.yad");
  if (mismatchYadRow && Array.isArray(mismatchYadRow["masteryTargets"])) {
    const targets = mismatchYadRow["masteryTargets"] as Array<Record<string, unknown>>;
    if (targets[0]) targets[0]["wordId"] = "word.jamal";
  }
  const mismatchYadResult = validateCurriculum(mismatchYadBundle);
  assert(
    "word_to_picture mastery must match scored word",
    mismatchYadResult.issues.some(
      (issue) =>
        issue.code === "MISSING_MASTERY_TARGET" &&
        issue.message.includes("word.yad"),
    ),
  );

  const noYadVisualBundle = JSON.parse(readFileSync(wave1Path, "utf8")) as Record<string, unknown>;
  const noYadVisualExercises = noYadVisualBundle["exercises"] as Array<Record<string, unknown>>;
  const noYadVisualWords = noYadVisualBundle["words"] as Array<Record<string, unknown>>;
  const noYadVisualRow = noYadVisualExercises.find((row) => row["id"] === "exercise.wave1.word_to_picture.yad");
  if (noYadVisualRow && Array.isArray(noYadVisualRow["choices"])) {
    noYadVisualRow["choices"] = (noYadVisualRow["choices"] as Array<Record<string, unknown>>).map((choice) => {
      const next = { ...choice };
      delete next["assetId"];
      return next;
    });
  }
  for (const id of ["word.yad", "word.qalam", "word.jamal"]) {
    const wordRow = noYadVisualWords.find((row) => row["id"] === id);
    if (wordRow) delete wordRow["imageAssetId"];
  }
  const noYadVisualResult = validateCurriculum(noYadVisualBundle);
  assert(
    "malformed word_to_picture visual target fails",
    noYadVisualResult.issues.some(
      (issue) => issue.code === "MISSING_FIELD" && issue.message.includes("visual target"),
    ),
  );

  const orderedUnit6Refs = [yadRef!, jamalRef!, jimSoundRef!, yaSoundRef!];
  const yadPictureSeen = activitySeen(yadExercise!);
  assert(
    "9. wrong answer does not complete activity",
    !exerciseActivitiesComplete(bundle, yadExercise!, itemsFrom(orderedUnit6Refs, [[false]])),
  );
  const yadCorrect = { ...itemsFrom(orderedUnit6Refs, [[true]]), ...yadPictureSeen };
  assert("10. picture reinforcement completes when seen", exerciseActivitiesComplete(bundle, yadExercise!, yadCorrect));
  assert("10. decoding alone does not complete the Unit 6 picture", !exerciseActivitiesComplete(bundle, yadExercise!, itemsFrom(orderedUnit6Refs, [[true]])));
  assert("11. audio_to_word still uses word:yad.decoding", getWordLiveKey({ wordId: "word.yad" }).liveKey === "word:yad.decoding");

  const u6fromHaraka = evaluateUnitMastery(bundle, unit6, unit6Exercises, itemsFrom(orderedUnit5Refs, [[true, true, true], []]));
  assert(
    "12. Unit 5 haraka evidence cannot satisfy Unit 6 word evidence",
    !u6fromHaraka.mastered &&
      (u6fromHaraka.blockers.some((row) => row.includes("skill.word_decoding.simple")) ||
        u6fromHaraka.completedTargets === 0),
  );
  const waladAsYad = evaluateUnitMastery(
    bundle,
    unit6,
    unit6Exercises,
    itemsFrom([{ ...yadRef!, liveKey: "word:walad.decoding" }], [[true, true, true, true]]),
  );
  const qalamAsYad = evaluateUnitMastery(
    bundle,
    unit6,
    unit6Exercises,
    itemsFrom([{ ...yadRef!, liveKey: "word:qalam.decoding" }], [[true, true, true, true]]),
  );
  assert(
    "13. unrelated earlier word evidence cannot satisfy Unit 6 target word",
    !waladAsYad.mastered && !qalamAsYad.mastered,
  );

  const u6once = evaluateUnitMastery(bundle, unit6, unit6Exercises, itemsFrom(orderedUnit6Refs, [[true], [true], [true], [true]]));
  assert("14. one lesson completion does not bypass thresholds", !u6once.mastered);
  assert("14. Unit 6 required evidence can complete in one visit", u6once.completedTargets === 4);
  assert("14. attempts are 4 and still need streak/sessions", u6once.attempts === 4 && u6once.requiredAttempts === 4);

  const day1 = Date.UTC(2026, 0, 1);
  const day2 = Date.UTC(2026, 0, 2);
  const unit6Seen = seenItems(unit6Exercises);
  const u6sameDayItems = {
    ...unit6Seen,
    ...itemsFrom(orderedUnit6Refs, [[true, true], [true], [true], [true]], day1),
  };
  const u6sameDay = evaluateUnitMastery(bundle, unit6, unit6Exercises, u6sameDayItems, day1);
  assert("14. four same-day attempts do not meet minSessions 2", !u6sameDay.mastered);
  const u6sameDaySchedule = scheduleLesson(bundle, unit6, unit6Exercises, u6sameDayItems, { now: day1 });
  assert(
    "Unit 6 does not infinite-loop required practice when only minSessions remains",
    u6sameDaySchedule.phase === "done",
    u6sameDaySchedule.phase,
  );
  assert("Unit 6 same-day stop is return-later, not mastered", u6sameDay.returnLater && !u6sameDay.canAdvanceNow);
  assert(
    "Unit 6 same-day path is later, not practice/mastered",
    unitPathStatus(true, u6sameDay) === "later" && unitPathCtaAr("later") === "عُدْ لَاحِقًا",
  );
  assert(
    "Unit 6 later finish copy is not full mastery",
    lessonFinishKind(u6sameDay) === "later" &&
      lessonFinishMessageAr("later") === "عُدْ لِلتَّدَرُّبِ مَرَّةً أُخْرَى لَاحِقًا" &&
      lessonFinishMessageAr("later") !== "أَكْمَلْتَ هَذِهِ الْوَحْدَة",
  );
  assert(
    "Unit 6 same-day sessions stay at 1 (no fake second session)",
    u6sameDay.sessions === 1 && u6sameDayItems[yadRef!.liveKey]?.sessions === 1,
  );
  const u6sameDayEntry = lessonEntry(bundle, unit6, unit6Exercises, u6sameDayItems, day1);
  assert("Unit 6 same-day entry opens the return-later card", u6sameDayEntry.startFinished);
  const u6nextDay = evaluateUnitMastery(bundle, unit6, unit6Exercises, u6sameDayItems, day2);
  const u6nextDaySchedule = scheduleLesson(bundle, unit6, unit6Exercises, u6sameDayItems, { now: day2 });
  assert(
    "Unit 6 on a new day offers required practice so minSessions can rise",
    !u6nextDay.mastered &&
      u6nextDay.canAdvanceNow &&
      !u6nextDay.returnLater &&
      u6nextDaySchedule.phase === "required",
    `${u6nextDaySchedule.phase} returnLater=${String(u6nextDay.returnLater)}`,
  );
  const u6nextDayEntry = lessonEntry(bundle, unit6, unit6Exercises, u6sameDayItems, day2);
  assert("Unit 6 next-day entry is playable, not the later card", !u6nextDayEntry.startFinished);
  const u6secondDayAttempt = applyAttempt(u6sameDayItems[yadRef!.liveKey]!, true, day2);
  assert("a real next-day correct raises sessions to 2", u6secondDayAttempt.sessions === 2);
  const u6masteredItems = {
    ...u6sameDayItems,
    [yadRef!.liveKey]: u6secondDayAttempt,
  };
  assert(
    "Unit 6 masters after a real second-day correct, without faking sessions",
    evaluateUnitMastery(bundle, unit6, unit6Exercises, u6masteredItems, day2).mastered,
  );
  const u6mastered = evaluateUnitMastery(bundle, unit6, unit6Exercises, u6masteredItems);
  assert("Unit 6 mastery after thresholds", u6mastered.mastered, u6mastered.blockers.join("; "));
  assert("Unit 6 valid mastery has no unmapped required skills", u6mastered.unmappedRequiredSkills.length === 0);

  const unit7 = {
    ...unit6,
    id: "unit.literacy.wave1.next",
    order: 7,
    prereqUnitIds: [unit6.id],
    exerciseIds: [] as string[],
  };
  const u6unlockItems = { ...u4unlockItems, ...u5masteredItems };
  assert(
    "15. Unit 7 remains locked until Unit 6 mastery",
    !evaluateUnitUnlock(bundle, units, unit7, u6unlockItems).unlocked,
  );
  const u7after = evaluateUnitUnlock(bundle, units, unit7, { ...u6unlockItems, ...u6masteredItems });
  assert("15. Unit 7 unlocks after Unit 6 mastery", u7after.unlocked);
  assert(
    "15. Unit 7 stays coming_soon without a ready renderer",
    resolveUnitRouteAccess(u7after.unlocked, false) === "coming_soon",
  );

  const ghost = evaluateUnitUnlock(
    bundle,
    units,
    { ...unit2, prereqUnitIds: ["unit.does.not.exist"] },
    masteredItems,
  );
  assert("missing prereq fails closed", !ghost.unlocked && ghost.missingPrereqs.includes("unit.does.not.exist"));

  const wave2Bundle = asCurriculumBundle(JSON.parse(readFileSync(wave2Path, "utf8")));
  const wave2PathRow = wave2Bundle.paths?.find((row) => row.id === WAVE2_PATH_ID);
  if (!wave2PathRow) throw new Error("Wave 2 path missing");
  const wave2ById = new Map((wave2Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave2Units = wave2PathRow.unitIds.flatMap((id) => {
    const unit = wave2ById.get(id);
    return unit ? [unit] : [];
  });
  const w2u1 = wave2Units[0];
  const w2u2 = wave2Units[1];
  const w2u3 = wave2Units[2];
  const w2u4 = wave2Units[3];
  if (!w2u1 || !w2u2 || !w2u3 || !w2u4) throw new Error("Wave 2 units 1–4 missing");
  assert("Wave 2 declares exactly four units", wave2Units.length === 4);
  assert("Wave 2 Unit 1 prereq is Wave 1 final unit", w2u1.prereqUnitIds?.[0] === WAVE1_FINAL_UNIT_ID);

  const lookupPrereq = (id: string) => {
    const w1 = bundle.units?.find((row) => row.id === id);
    if (w1) return { bundle, unit: w1 };
    const w2 = wave2Bundle.units?.find((row) => row.id === id);
    if (w2) return { bundle: wave2Bundle, unit: w2 };
    return undefined;
  };

  const w2u1Exercises = exercisesForUnit(wave2Bundle, w2u1);
  const w2u2Exercises = exercisesForUnit(wave2Bundle, w2u2);
  const w2u3Exercises = exercisesForUnit(wave2Bundle, w2u3);
  const w2u4Exercises = exercisesForUnit(wave2Bundle, w2u4);
  const emptyWave2 = {};
  assert(
    "W2.1 Wave 2 locked before Wave 1 final prerequisite mastery",
    !evaluateUnitUnlock(wave2Bundle, wave2Units, w2u1, emptyWave2, lookupPrereq).unlocked,
  );
  const wave1Mastered = masterPath(bundle, units);
  assert(
    "Wave 1 helper actually masters the final Wave 1 unit",
    evaluateUnitMastery(bundle, unit6, unit6Exercises, wave1Mastered).mastered,
  );
  const w2u1Unlock = evaluateUnitUnlock(wave2Bundle, wave2Units, w2u1, wave1Mastered, lookupPrereq);
  assert("W2.2 Wave 2 Unit 1 unlocks after Wave 1 mastery", w2u1Unlock.unlocked, w2u1Unlock.blockers.join("; "));
  assert(
    "W2.2 later Wave 2 units stay locked until their own prereqs",
    !evaluateUnitUnlock(wave2Bundle, wave2Units, w2u2, wave1Mastered, lookupPrereq).unlocked,
  );

  const raDemo = w2u1Exercises.find((row) => row.id === "exercise.wave2.presentation.ra");
  assert("W2.3 ر demo is presentation with continue success", raDemo?.type === "presentation" && raDemo.success.type === "continue");
  assert("W2.3 ر demo has no mastery targets", (raDemo?.masteryTargets ?? []).length === 0);
  const raDemoSeen = raDemo ? activitySeen(raDemo) : {};
  const raDemoMastery = evaluateUnitMastery(wave2Bundle, w2u1, w2u1Exercises, raDemoSeen);
  assert(
    "W2.3 ر demo does not record attempts",
    raDemoMastery.attempts === 0 && !raDemoMastery.mastered,
    `attempts=${raDemoMastery.attempts}`,
  );

  const w2u1Required = requiredRefsForUnit(wave2Bundle, w2u1, w2u1Exercises);
  assert(
    "W2.4 Unit 1 required live keys include ر sound, رَ, form, and قَمَر",
    w2u1Required.some((ref) => ref.liveKey === "letter:ra.sound") &&
      w2u1Required.some((ref) => ref.liveKey === "letter:ra.fatha") &&
      w2u1Required.some((ref) => ref.liveKey === "letter:ra.form.final") &&
      w2u1Required.some((ref) => ref.liveKey === "word:qamar.decoding"),
    w2u1Required.map((ref) => ref.liveKey).join(", "),
  );
  const w2u1Mastered = masterRequired(wave2Bundle, w2u1, w2u1Exercises, wave1Mastered);
  const w2u1ok = evaluateUnitMastery(wave2Bundle, w2u1, w2u1Exercises, w2u1Mastered);
  assert("W2.4 ر required practice reaches mastery normally", w2u1ok.mastered, w2u1ok.blockers.join("; "));
  assert("W2.4 Unit 1 has no unmapped required skills", w2u1ok.unmappedRequiredSkills.length === 0);

  const qamarAudioIdx = w2u1Exercises.findIndex((row) => row.id === "exercise.wave2.audio_to_word.qamar");
  const qamarPictureIdx = w2u1Exercises.findIndex((row) => row.id === "exercise.wave2.picture_to_word.qamar");
  const qamarAudio = w2u1Exercises[qamarAudioIdx];
  const qamarPicture = w2u1Exercises[qamarPictureIdx];
  assert("W2.5 قَمَر audio_to_word exists", qamarAudio?.type === "audio_to_word" && qamarAudio.success.correctChoiceId === "word.qamar");
  assert("W2.5 قَمَر is not picture-first decoding", qamarAudioIdx >= 0 && qamarPictureIdx > qamarAudioIdx);
  assert("W2.5 قَمَر picture is reinforcement", qamarPicture?.tags?.includes("reinforcement") === true);

  const w2u2Required = requiredRefsForUnit(wave2Bundle, w2u2, w2u2Exercises);
  assert(
    "W2.6 Unit 2 teaches ب without جَبَل decoding",
    w2u2Required.some((ref) => ref.liveKey === "letter:ba.sound") &&
      w2u2Required.some((ref) => ref.liveKey === "letter:ba.fatha") &&
      w2u2Required.some((ref) => ref.liveKey === "letter:ba.form.medial") &&
      !w2u2Required.some((ref) => ref.liveKey === "word:jabal.decoding") &&
      !(w2u2.mastery.requiredSkillIds ?? []).includes("skill.word_decoding.simple"),
  );
  assert(
    "W2.6 Unit 2 has no scored jabal audio_to_word",
    !w2u2Exercises.some((row) => row.type === "audio_to_word" && row.success.correctChoiceId === "word.jabal"),
  );
  assert(
    "W2.6 Unit 2 does not show جَبَل",
    !w2u2Exercises.some((row) => row.id === "exercise.wave2.presentation.jabal") &&
      !w2u2Exercises.some((row) => (row.contentIds ?? []).includes("word.jabal")) &&
      !(w2u2.wordIds ?? []).includes("word.jabal"),
  );

  const w2u3Required = requiredRefsForUnit(wave2Bundle, w2u3, w2u3Exercises);
  const jabalDemo = w2u3Exercises[0];
  const jabalAudio = w2u3Exercises.find((row) => row.id === "exercise.wave2.audio_to_word.jabal");
  const jabalPicture = w2u3Exercises.find((row) => row.type === "word_to_picture");
  const jabalAudioIdx = w2u3Exercises.findIndex((row) => row.id === "exercise.wave2.audio_to_word.jabal");
  const jabalPictureIdx = w2u3Exercises.findIndex((row) => row.type === "word_to_picture");
  assert(
    "W2.7 Unit 3 begins with unscored جَبَل presentation",
    jabalDemo?.id === "exercise.wave2.presentation.jabal" &&
      jabalDemo.type === "presentation" &&
      jabalDemo.success.type === "continue" &&
      (jabalDemo.masteryTargets ?? []).length === 0 &&
      !jabalDemo.tags?.includes("reinforcement"),
  );
  assert(
    "W2.7 Unit 3 requires real جَبَل decoding after the SHOW",
    (w2u3.mastery.requiredSkillIds ?? []).includes("skill.word_decoding.simple") &&
      w2u3Required.some((ref) => ref.liveKey === "word:jabal.decoding") &&
      jabalAudio?.type === "audio_to_word" &&
      jabalAudio.success.correctChoiceId === "word.jabal" &&
      jabalAudioIdx > 0,
  );
  assert("W2.7 جَبَل picture is after decoding", jabalAudioIdx >= 0 && jabalPictureIdx > jabalAudioIdx);
  assert("W2.7 جَبَل picture is reinforcement", jabalPicture?.tags?.includes("reinforcement") === true);
  assert(
    "W2.7 جَبَل presentation is not decoding evidence",
    !w2u3Required.some((ref) => ref.liveKey.startsWith("letter:intro.")),
  );
  const jabalShowSeen = jabalDemo ? activitySeen(jabalDemo) : {};
  const jabalShowMastery = evaluateUnitMastery(wave2Bundle, w2u3, w2u3Exercises, jabalShowSeen);
  assert(
    "W2.7 جَبَل SHOW does not record attempts",
    jabalShowMastery.attempts === 0 && !jabalShowMastery.mastered,
    `attempts=${jabalShowMastery.attempts}`,
  );

  const faPresentationIdx = w2u4Exercises.findIndex((row) => row.id === "exercise.wave2.presentation.fa");
  const famAudioIdx = w2u4Exercises.findIndex((row) => row.id === "exercise.wave2.audio_to_word.fam");
  const famPictureIdx = w2u4Exercises.findIndex((row) => row.id === "exercise.wave2.picture_to_word.fam");
  assert("W2.8 Unit 4 teaches ف before فَم", faPresentationIdx >= 0 && famAudioIdx > faPresentationIdx);
  assert(
    "W2.8 Unit 4 title does not leak فَم",
    !w2u4.titleAr.includes("فَم") && !w2u4.childGoalAr?.includes("فَم"),
  );
  const w2u4Required = requiredRefsForUnit(wave2Bundle, w2u4, w2u4Exercises);
  assert(
    "W2.8 Unit 4 required keys include ف and فَم",
    w2u4Required.some((ref) => ref.liveKey === "letter:fa.sound") &&
      w2u4Required.some((ref) => ref.liveKey === "letter:fa.fatha") &&
      w2u4Required.some((ref) => ref.liveKey === "letter:fa.form.initial") &&
      w2u4Required.some((ref) => ref.liveKey === "word:fam.decoding"),
    w2u4Required.map((ref) => ref.liveKey).join(", "),
  );
  assert("W2.8 فَم picture is after decoding", famAudioIdx >= 0 && famPictureIdx > famAudioIdx);
  const qamarReview = w2u4Exercises.find((row) => row.id === "exercise.wave2.audio_to_word.qamar_review");
  const jabalReview = w2u4Exercises.find((row) => row.id === "exercise.wave2.audio_to_word.jabal_review");
  const waladReview = w2u4Exercises.find((row) => row.id === "exercise.wave2.audio_to_word.walad_review");
  const qamarReviewIdx = w2u4Exercises.findIndex((row) => row.id === "exercise.wave2.audio_to_word.qamar_review");
  assert(
    "W2.8 mixed review follows فَم and is scored, not reinforcement",
    famAudioIdx >= 0 &&
      qamarReviewIdx > famAudioIdx &&
      qamarReview?.tags?.includes("review") === true &&
      jabalReview?.tags?.includes("review") === true &&
      waladReview?.tags?.includes("review") === true &&
      qamarReview?.tags?.includes("reinforcement") !== true,
  );
  assert(
    "W2.8 mixed review uses distinct live keys so old words still appear",
    w2u4Required.some((ref) => ref.liveKey === "word:qamar.review") &&
      w2u4Required.some((ref) => ref.liveKey === "word:jabal.review") &&
      w2u4Required.some((ref) => ref.liveKey === "word:walad.review") &&
      liveRefForTarget(wave2Bundle, qamarReview!.masteryTargets![0]!, qamarReview).liveKey === "word:qamar.review",
    w2u4Required.map((ref) => ref.liveKey).join(", "),
  );

  const qamarPictureSeen = qamarPicture ? activitySeen(qamarPicture) : {};
  const pictureOnlyMastery = evaluateUnitMastery(wave2Bundle, w2u1, w2u1Exercises, {
    ...wave1Mastered,
    ...qamarPictureSeen,
  });
  assert(
    "W2.9 picture reinforcement cannot satisfy decoding mastery",
    !pictureOnlyMastery.mastered &&
      !w2u1Required.some((ref) => ref.liveKey.startsWith("letter:intro.")),
    pictureOnlyMastery.blockers.join("; "),
  );

  const raSoundRef = w2u1Required.find((ref) => ref.liveKey === "letter:ra.sound");
  const wrongThenRight = raSoundRef
    ? itemsFrom([raSoundRef], [[false, true, true, true]])
    : {};
  assert(
    "W2.10 wrong answers affect attempts/accuracy/streak normally",
    Boolean(raSoundRef) &&
      wrongThenRight["letter:ra.sound"]?.attempts === 4 &&
      wrongThenRight["letter:ra.sound"]?.correct === 3 &&
      wrongThenRight["letter:ra.sound"]?.streak === 3,
  );

  let scheduled = { ...wave1Mastered };
  const daySame = Date.parse("2026-04-01T12:00:00Z");
  const wave2UnitsWithExercises = [
    [w2u1, w2u1Exercises],
    [w2u2, w2u2Exercises],
    [w2u3, w2u3Exercises],
    [w2u4, w2u4Exercises],
  ] as const;
  for (const [unit, exercises] of wave2UnitsWithExercises) {
    scheduled = masterRequired(wave2Bundle, unit, exercises, scheduled, daySame);
    const result = evaluateUnitMastery(wave2Bundle, unit, exercises, scheduled, daySame);
    assert(
      `W2.11 ${unit.id} progresses with the existing mastery scheduler`,
      result.mastered,
      result.blockers.join("; "),
    );
    assert(
      `W2.12 ${unit.id} does not require a fake second calendar day`,
      (unit.mastery.minSessions ?? 1) === 1 && result.sessions >= 1,
    );
  }
  assert(
    "W2.11 all four Wave 2 units unlock in sequence after prior mastery",
    evaluateUnitUnlock(wave2Bundle, wave2Units, w2u4, scheduled, lookupPrereq).unlocked,
  );

  const wave1Keys = new Set(
    units.flatMap((unit) =>
      requiredRefsForUnit(bundle, unit, exercisesForUnit(bundle, unit)).map((ref) => ref.liveKey),
    ),
  );
  const wave2NewKeys = [
    "letter:ra.sound",
    "letter:ra.fatha",
    "letter:ra.form.final",
    "letter:ra.tracing",
    "word:qamar.decoding",
    "letter:ba.sound",
    "letter:ba.fatha",
    "letter:ba.form.medial",
    "letter:ba.tracing",
    "word:jabal.decoding",
    "letter:fa.sound",
    "letter:fa.fatha",
    "letter:fa.form.initial",
    "word:fam.decoding",
    "diacritic:fa.fatha.discrimination",
    "word:qamar.review",
    "word:jabal.review",
    "word:walad.review",
  ];
  const collided = wave2NewKeys.filter((key) => wave1Keys.has(key));
  assert("W2.14 no live-key collisions with Wave 1 required keys", collided.length === 0, collided.join(", "));
  const persistStoreSrcWave2 = readFileSync(join(root, "src/lib/progress/store.ts"), "utf8");
  assert("W2.15 persistence key remains hurufi-progress-v1", persistStoreSrcWave2.includes('name: "hurufi-progress-v1"'));
  assert("W2.13 Wave 1 Unit 1 still has no prereqs", (unit1.prereqUnitIds ?? []).length === 0);
  assert("W2.13 Wave 1 final unit id is unchanged", unit6.id === WAVE1_FINAL_UNIT_ID);

  const jabalWord = wave2Bundle.words.find((row) => row.id === "word.jabal");
  assert("word.jabal maps to nature-11", jabalWord?.legacyId === "nature-11");
  assert("word.jabal is not Band A", jabalWord?.vocabBand !== "A");

  const wave3Bundle = asCurriculumBundle(JSON.parse(readFileSync(wave3Path, "utf8")));
  const wave3PathRow = wave3Bundle.paths?.find((row) => row.id === WAVE3_PATH_ID);
  if (!wave3PathRow) throw new Error("Wave 3 path missing");
  const wave3ById = new Map((wave3Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave3Units = wave3PathRow.unitIds.flatMap((id) => {
    const unit = wave3ById.get(id);
    return unit ? [unit] : [];
  });
  const w3u1 = wave3Units[0];
  const w3u2 = wave3Units[1];
  const w3u3 = wave3Units[2];
  if (!w3u1 || !w3u2 || !w3u3) throw new Error("Wave 3 units 1–3 missing");
  assert("Wave 3 declares exactly three units", wave3Units.length === 3);
  assert("Wave 3 Unit 1 prereq is Wave 2 final unit", w3u1.prereqUnitIds?.[0] === WAVE2_FINAL_UNIT_ID);
  const resolveLearnSrcEarly = readFileSync(join(root, "src/lib/curriculum/resolveLearn.ts"), "utf8");
  assert("W3 registered slug is wave-3", resolveLearnSrcEarly.includes('WAVE3_SLUG = "wave-3"') && resolveLearnSrcEarly.includes("WAVE3_SLUG]"));
  assert("W3 generic chain now includes Wave 4", resolveLearnSrcEarly.includes('WAVE4_SLUG = "wave-4"'));
  assert("W3 generic chain now includes Wave 5", resolveLearnSrcEarly.includes('WAVE5_SLUG = "wave-5"'));
  assert("W3 generic chain now includes Wave 6", resolveLearnSrcEarly.includes('WAVE6_SLUG = "wave-6"'));
  assert("W3 generic chain now includes Wave 7", resolveLearnSrcEarly.includes('WAVE7_SLUG = "wave-7"'));
  assert("W3 generic chain now includes Wave 8", resolveLearnSrcEarly.includes('WAVE8_SLUG = "wave-8"'));
  assert("W3 generic chain now includes Wave 9", resolveLearnSrcEarly.includes('WAVE9_SLUG = "wave-9"'));
  assert("W3 generic chain now includes Wave 10", resolveLearnSrcEarly.includes('WAVE10_SLUG = "wave-10"'));
  assert("W3 generic chain now includes Wave 11", resolveLearnSrcEarly.includes('WAVE11_SLUG = "wave-11"'));
  assert("W3 generic chain now includes Wave 12", resolveLearnSrcEarly.includes('WAVE12_SLUG = "wave-12"'));
  assert("W3 generic chain now includes Wave 13", resolveLearnSrcEarly.includes('WAVE13_SLUG = "wave-13"'));
  assert("W3 generic chain now includes Wave 14", resolveLearnSrcEarly.includes('WAVE14_SLUG = "wave-14"'));
  assert("W3 generic chain now includes Wave 15", resolveLearnSrcEarly.includes('WAVE15_SLUG = "wave-15"'));
  assert("W3 generic chain now includes Wave 16", resolveLearnSrcEarly.includes('WAVE16_SLUG = "wave-16"'));
  assert("W3 generic chain now includes Wave 17", resolveLearnSrcEarly.includes('WAVE17_SLUG = "wave-17"'));
  assert("W3 generic chain now includes Wave 21", resolveLearnSrcEarly.includes('WAVE21_SLUG = "wave-21"'));
  assert("W3 generic chain now includes Wave 22", resolveLearnSrcEarly.includes('WAVE22_SLUG = "wave-22"'));
  assert("W3 does not register a Wave 23 slug", !resolveLearnSrcEarly.includes("wave-23") && !resolveLearnSrcEarly.includes("WAVE23"));

  const lookupPrereqW3 = (id: string) => {
    const w1 = bundle.units?.find((row) => row.id === id);
    if (w1) return { bundle, unit: w1 };
    const w2 = wave2Bundle.units?.find((row) => row.id === id);
    if (w2) return { bundle: wave2Bundle, unit: w2 };
    const w3 = wave3Bundle.units?.find((row) => row.id === id);
    if (w3) return { bundle: wave3Bundle, unit: w3 };
    return undefined;
  };

  const w3u1Exercises = exercisesForUnit(wave3Bundle, w3u1);
  const w3u2Exercises = exercisesForUnit(wave3Bundle, w3u2);
  const w3u3Exercises = exercisesForUnit(wave3Bundle, w3u3);

  assert(
    "W3.1 Wave 3 locked before Wave 2 final mastery",
    !evaluateUnitUnlock(wave3Bundle, wave3Units, w3u1, wave1Mastered, lookupPrereqW3).unlocked,
  );
  assert(
    "W3.1 Wave 3 still locked after Wave 1 only",
    !evaluateUnitUnlock(wave3Bundle, wave3Units, w3u1, wave1Mastered, lookupPrereq).unlocked,
  );
  const wave2Mastered = masterPath(wave2Bundle, wave2Units);
  const throughWave2 = { ...wave1Mastered, ...wave2Mastered };
  const w3u1Unlock = evaluateUnitUnlock(wave3Bundle, wave3Units, w3u1, throughWave2, lookupPrereqW3);
  assert("W3.2 Wave 3 Unit 1 unlocks after Wave 2 mastery", w3u1Unlock.unlocked, w3u1Unlock.blockers.join("; "));
  assert(
    "W3.2 later Wave 3 units stay locked until their own prereqs",
    !evaluateUnitUnlock(wave3Bundle, wave3Units, w3u2, throughWave2, lookupPrereqW3).unlocked,
  );

  const haDemo = w3u1Exercises.find((row) => row.id === "exercise.wave3.presentation.ha");
  const haTrace = w3u1Exercises.find((row) => row.id === "exercise.wave3.tracing.ha");
  const haDemoIdx = w3u1Exercises.findIndex((row) => row.id === "exercise.wave3.presentation.ha");
  const haFathaIdx = w3u1Exercises.findIndex((row) => row.id === "exercise.wave3.presentation.ha_fatha");
  const haSoundIdx = w3u1Exercises.findIndex((row) => row.id === "exercise.wave3.sound_to_letter.ha");
  const haBlendIdx = w3u1Exercises.findIndex((row) => row.id === "exercise.wave3.syllable_blending.ha_fatha");
  assert(
    "W3.3 Unit 1 order is ح → حَ → scored ح → scored حَ",
    haDemoIdx === 0 && haFathaIdx === 1 && haSoundIdx > haFathaIdx && haBlendIdx > haSoundIdx,
  );
  assert("W3.3 ح demo is presentation with continue success", haDemo?.type === "presentation" && haDemo.success.type === "continue");
  assert("W3.3 ح demo has no mastery targets", (haDemo?.masteryTargets ?? []).length === 0);
  const haDemoSeen = haDemo ? activitySeen(haDemo) : {};
  const haDemoMastery = evaluateUnitMastery(wave3Bundle, w3u1, w3u1Exercises, haDemoSeen);
  assert(
    "W3.3 presentations do not increment mastery attempts",
    haDemoMastery.attempts === 0 && !haDemoMastery.mastered,
    `attempts=${haDemoMastery.attempts}`,
  );
  assert(
    "W3.3 Unit 1 contains no word target",
    !(w3u1.wordIds ?? []).length &&
      !w3u1Exercises.some((row) => (row.contentIds ?? []).some((id) => id.startsWith("word."))),
  );

  const w3u1Required = requiredRefsForUnit(wave3Bundle, w3u1, w3u1Exercises);
  assert(
    "W3.4 Unit 1 required live keys are letter:ha.sound and letter:ha.fatha",
    w3u1Required.some((ref) => ref.liveKey === "letter:ha.sound") &&
      w3u1Required.some((ref) => ref.liveKey === "letter:ha.fatha") &&
      !w3u1Required.some((ref) => ref.liveKey === "letter:ha.tracing") &&
      !w3u1Required.some((ref) => ref.liveKey.startsWith("word:")),
    w3u1Required.map((ref) => ref.liveKey).join(", "),
  );
  const incompleteSound = itemsFrom(
    w3u1Required.filter((ref) => ref.liveKey === "letter:ha.fatha"),
    [[true, true, true]],
  );
  assert(
    "W3.4 incomplete letter:ha.sound fails Unit 1",
    !evaluateUnitMastery(wave3Bundle, w3u1, w3u1Exercises, incompleteSound).mastered,
  );
  const incompleteFatha = itemsFrom(
    w3u1Required.filter((ref) => ref.liveKey === "letter:ha.sound"),
    [[true, true, true]],
  );
  assert(
    "W3.4 incomplete letter:ha.fatha fails Unit 1",
    !evaluateUnitMastery(wave3Bundle, w3u1, w3u1Exercises, incompleteFatha).mastered,
  );
  const haTracingOnly = haTrace
    ? itemsFrom(
        [liveRefForTarget(wave3Bundle, haTrace.masteryTargets![0]!, haTrace)],
        [[true, true, true, true, true]],
      )
    : {};
  assert(
    "W3.4 tracing alone cannot pass Unit 1",
    Boolean(haTrace) && !evaluateUnitMastery(wave3Bundle, w3u1, w3u1Exercises, haTracingOnly).mastered,
  );
  const w3u1Mastered = masterRequired(wave3Bundle, w3u1, w3u1Exercises, throughWave2);
  const w3u1ok = evaluateUnitMastery(wave3Bundle, w3u1, w3u1Exercises, w3u1Mastered);
  assert("W3.4 ح required practice reaches mastery normally", w3u1ok.mastered, w3u1ok.blockers.join("; "));
  assert(
    "W3.5 Unit 2 locked until Unit 1 mastered",
    !evaluateUnitUnlock(wave3Bundle, wave3Units, w3u2, throughWave2, lookupPrereqW3).unlocked &&
      evaluateUnitUnlock(wave3Bundle, wave3Units, w3u2, w3u1Mastered, lookupPrereqW3).unlocked,
  );

  const w3u2Required = requiredRefsForUnit(wave3Bundle, w3u2, w3u2Exercises);
  const hajarFormHaIdx = w3u2Exercises.findIndex((row) => row.id === "exercise.wave3.letter_forms.ha_initial");
  const hajarFormJimIdx = w3u2Exercises.findIndex((row) => row.id === "exercise.wave3.letter_forms.jim_medial");
  const hajarAudioIdx = w3u2Exercises.findIndex((row) => row.id === "exercise.wave3.audio_to_word.hajar");
  const hajarPictureIdx = w3u2Exercises.findIndex((row) => row.type === "word_to_picture" || row.type === "picture_to_word");
  const hajarAudio = w3u2Exercises[hajarAudioIdx];
  const hajarPicture = w3u2Exercises[hajarPictureIdx];
  assert(
    "W3.6 Unit 2 prepares forms before حَجَر",
    hajarFormHaIdx >= 0 && hajarFormJimIdx > hajarFormHaIdx && hajarAudioIdx > hajarFormJimIdx,
  );
  assert("W3.6 first scored حَجَر evidence is audio_to_word", hajarAudio?.type === "audio_to_word" && hajarAudio.success.correctChoiceId === "word.hajar");
  assert("W3.6 picture is after decoding and reinforcement", hajarPictureIdx > hajarAudioIdx && hajarPicture?.tags?.includes("reinforcement") === true);
  assert(
    "W3.6 word:hajar.decoding is required",
    w3u2Required.some((ref) => ref.liveKey === "word:hajar.decoding") &&
      w3u2Required.some((ref) => ref.liveKey === "letter:ha.form.initial") &&
      w3u2Required.some((ref) => ref.liveKey === "letter:jim.form.medial"),
    w3u2Required.map((ref) => ref.liveKey).join(", "),
  );
  const pictureOnlyHajar = hajarPicture ? activitySeen(hajarPicture) : {};
  assert(
    "W3.6 picture evidence cannot pass Unit 2",
    !evaluateUnitMastery(wave3Bundle, w3u2, w3u2Exercises, {
      ...w3u1Mastered,
      ...pictureOnlyHajar,
    }).mastered,
  );
  const w3u2Mastered = masterRequired(wave3Bundle, w3u2, w3u2Exercises, w3u1Mastered);
  const w3u2ok = evaluateUnitMastery(wave3Bundle, w3u2, w3u2Exercises, w3u2Mastered);
  assert("W3.6 Unit 2 masters with form + decoding evidence", w3u2ok.mastered, w3u2ok.blockers.join("; "));
  assert(
    "W3.7 Unit 3 locked until Unit 2 mastered",
    !evaluateUnitUnlock(wave3Bundle, wave3Units, w3u3, w3u1Mastered, lookupPrereqW3).unlocked &&
      evaluateUnitUnlock(wave3Bundle, wave3Units, w3u3, w3u2Mastered, lookupPrereqW3).unlocked,
  );

  const w3u3Required = requiredRefsForUnit(wave3Bundle, w3u3, w3u3Exercises);
  const hamalDemo = w3u3Exercises[0];
  const hamalAudio = w3u3Exercises.find((row) => row.id === "exercise.wave3.audio_to_word.hamal");
  const hamalChoices = (hamalAudio?.choices ?? []).map((choice) => choice.id);
  assert(
    "W3.8 Unit 3 SHOWs حَمَل then tests حَمَل vs جَمَل",
    hamalDemo?.id === "exercise.wave3.presentation.hamal" &&
      hamalDemo.type === "presentation" &&
      (hamalDemo.masteryTargets ?? []).length === 0 &&
      hamalAudio?.type === "audio_to_word" &&
      hamalAudio.success.correctChoiceId === "word.hamal" &&
      hamalChoices.includes("word.jamal"),
  );
  assert(
    "W3.8 word:hamal.decoding is required",
    w3u3Required.some((ref) => ref.liveKey === "word:hamal.decoding"),
    w3u3Required.map((ref) => ref.liveKey).join(", "),
  );
  const hamalShowSeen = hamalDemo ? activitySeen(hamalDemo) : {};
  const hamalShowMastery = evaluateUnitMastery(wave3Bundle, w3u3, w3u3Exercises, hamalShowSeen);
  assert(
    "W3.8 حَمَل SHOW does not record attempts",
    hamalShowMastery.attempts === 0 && !hamalShowMastery.mastered,
    `attempts=${hamalShowMastery.attempts}`,
  );

  const w3u3Mastered = masterRequired(wave3Bundle, w3u3, w3u3Exercises, w3u2Mastered);
  const w3u3ok = evaluateUnitMastery(wave3Bundle, w3u3, w3u3Exercises, w3u3Mastered);
  assert("W3.9 completing Wave 3 Unit 3 reaches mastery", w3u3ok.mastered, w3u3ok.blockers.join("; "));
  const lessonPlayerSrc = readFileSync(join(root, "src/components/learn/LessonPlayer.tsx"), "utf8");
  assert("W3.9 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-6"));
  assert("W3.9 Waves 10–14 are registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE10_SLUG") && resolveLearnSrcEarly.includes("WAVE11_SLUG") && resolveLearnSrcEarly.includes("WAVE12_SLUG") && resolveLearnSrcEarly.includes("WAVE13_SLUG") && resolveLearnSrcEarly.includes("getWave13Bundle") && resolveLearnSrcEarly.includes("WAVE14_SLUG") && resolveLearnSrcEarly.includes("getWave14Bundle") && resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));

  const hajarWord = wave3Bundle.words.find((row) => row.id === "word.hajar");
  const hamalWord = wave3Bundle.words.find((row) => row.id === "word.hamal");
  assert("word.hajar maps to nature-16", hajarWord?.legacyId === "nature-16");
  assert("word.hajar is Band A", hajarWord?.vocabBand === "A" && hajarWord.lemma === "حجر");
  assert("word.hamal maps to animals-49", hamalWord?.legacyId === "animals-49");
  assert("word.hamal is not Band A", hamalWord?.vocabBand !== "A");
  assert("W3.10 Wave 2 final unit id is unchanged", w2u4.id === WAVE2_FINAL_UNIT_ID);
  assert("W3.10 Wave 1 final unit id is unchanged", unit6.id === WAVE1_FINAL_UNIT_ID);

  const wave4Bundle = asCurriculumBundle(JSON.parse(readFileSync(wave4Path, "utf8")));
  const wave4PathRow = wave4Bundle.paths?.find((row) => row.id === WAVE4_PATH_ID);
  if (!wave4PathRow) throw new Error("Wave 4 path missing");
  const wave4ById = new Map((wave4Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave4Units = wave4PathRow.unitIds.flatMap((id) => {
    const unit = wave4ById.get(id);
    return unit ? [unit] : [];
  });
  const w4u1 = wave4Units[0];
  const w4u2 = wave4Units[1];
  const w4u3 = wave4Units[2];
  if (!w4u1 || !w4u2 || !w4u3) throw new Error("Wave 4 units 1–3 missing");
  assert("Wave 4 declares exactly three units", wave4Units.length === 3);
  assert("Wave 4 Unit 1 prereq is Wave 3 final unit", w4u1.prereqUnitIds?.[0] === WAVE3_FINAL_UNIT_ID);

  const lookupPrereqW4 = (id: string) => {
    const w1 = bundle.units?.find((row) => row.id === id);
    if (w1) return { bundle, unit: w1 };
    const w2 = wave2Bundle.units?.find((row) => row.id === id);
    if (w2) return { bundle: wave2Bundle, unit: w2 };
    const w3 = wave3Bundle.units?.find((row) => row.id === id);
    if (w3) return { bundle: wave3Bundle, unit: w3 };
    const w4 = wave4Bundle.units?.find((row) => row.id === id);
    if (w4) return { bundle: wave4Bundle, unit: w4 };
    return undefined;
  };

  const w4u1Exercises = exercisesForUnit(wave4Bundle, w4u1);
  const w4u2Exercises = exercisesForUnit(wave4Bundle, w4u2);
  const w4u3Exercises = exercisesForUnit(wave4Bundle, w4u3);

  assert(
    "W4.1 Wave 4 locked before Wave 3 final mastery",
    !evaluateUnitUnlock(wave4Bundle, wave4Units, w4u1, w3u2Mastered, lookupPrereqW4).unlocked,
  );
  const throughWave3 = w3u3Mastered;
  const w4u1Unlock = evaluateUnitUnlock(wave4Bundle, wave4Units, w4u1, throughWave3, lookupPrereqW4);
  assert("W4.2 Wave 4 Unit 1 unlocks after Wave 3 mastery", w4u1Unlock.unlocked, w4u1Unlock.blockers.join("; "));
  assert(
    "W4.2 later Wave 4 units stay locked until their own prereqs",
    !evaluateUnitUnlock(wave4Bundle, wave4Units, w4u2, throughWave3, lookupPrereqW4).unlocked,
  );

  const sukunDemo = w4u1Exercises.find((row) => row.id === "exercise.wave4.presentation.sukun");
  const sukunScore = w4u1Exercises.find((row) => row.id === "exercise.wave4.missing_haraka.mim_sukun");
  const sukunDemoIdx = w4u1Exercises.findIndex((row) => row.id === "exercise.wave4.presentation.sukun");
  const sukunScoreIdx = w4u1Exercises.findIndex((row) => row.id === "exercise.wave4.missing_haraka.mim_sukun");
  assert(
    "W4.3 Unit 1 order is SHOW sukun → scored مَ vs مْ",
    sukunDemoIdx === 0 && sukunScoreIdx > sukunDemoIdx && sukunScore?.type === "missing_haraka",
  );
  assert("W4.3 sukun SHOW is presentation with continue success", sukunDemo?.type === "presentation" && sukunDemo.success.type === "continue");
  assert("W4.3 sukun SHOW has no mastery targets", (sukunDemo?.masteryTargets ?? []).length === 0);
  const sukunDemoSeen = sukunDemo ? activitySeen(sukunDemo) : {};
  const sukunDemoMastery = evaluateUnitMastery(wave4Bundle, w4u1, w4u1Exercises, sukunDemoSeen);
  assert(
    "W4.3 presentations do not increment mastery attempts",
    sukunDemoMastery.attempts === 0 && !sukunDemoMastery.mastered,
    `attempts=${sukunDemoMastery.attempts}`,
  );

  const w4u1Required = requiredRefsForUnit(wave4Bundle, w4u1, w4u1Exercises);
  assert(
    "W4.4 Unit 1 required live key is diacritic:mim.sukun.discrimination",
    w4u1Required.some((ref) => ref.liveKey === "diacritic:mim.sukun.discrimination") &&
      !w4u1Required.some((ref) => ref.liveKey === "letter:mim.fatha") &&
      !w4u1Required.some((ref) => ref.liveKey === "diacritic:mim.vowel.discrimination"),
    w4u1Required.map((ref) => ref.liveKey).join(", "),
  );
  const fathaOnly = itemsFrom(
    [getSyllableLiveKey({ letterLegacyId: "mim", vowelSkillId: "skill.short_vowel.fatha" })].map((keyed) => ({
      portableMasteryId: "probe.mim.fatha",
      skillId: "skill.short_vowel.fatha",
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    })),
    [[true, true, true, true, true]],
  );
  assert(
    "W4.4 fatha evidence alone cannot pass Unit 1",
    !evaluateUnitMastery(wave4Bundle, w4u1, w4u1Exercises, fathaOnly).mastered,
  );
  assert(
    "W4.4 sukun presentation alone cannot pass Unit 1",
    !evaluateUnitMastery(wave4Bundle, w4u1, w4u1Exercises, sukunDemoSeen).mastered,
  );
  const sukunTarget = sukunScore?.masteryTargets?.[0];
  const sukunRef = sukunTarget && sukunScore ? liveRefForTarget(wave4Bundle, sukunTarget, sukunScore) : undefined;
  assert("W4.4 scored sukun writes diacritic:mim.sukun.discrimination", sukunRef?.liveKey === "diacritic:mim.sukun.discrimination");
  const sukunOnly = sukunRef ? itemsFrom([sukunRef], [[true]]) : {};
  assert(
    "W4.4 sukun key does not change letter:mim.fatha",
    sukunOnly["diacritic:mim.sukun.discrimination"] !== undefined && sukunOnly["letter:mim.fatha"] === undefined,
  );

  const w4u1Mastered = masterRequired(wave4Bundle, w4u1, w4u1Exercises, throughWave3);
  const w4u1ok = evaluateUnitMastery(wave4Bundle, w4u1, w4u1Exercises, w4u1Mastered);
  assert("W4.4 sukun discrimination reaches Unit 1 mastery", w4u1ok.mastered, w4u1ok.blockers.join("; "));
  assert(
    "W4.5 Unit 2 locked until Unit 1 mastered",
    !evaluateUnitUnlock(wave4Bundle, wave4Units, w4u2, throughWave3, lookupPrereqW4).unlocked &&
      evaluateUnitUnlock(wave4Bundle, wave4Units, w4u2, w4u1Mastered, lookupPrereqW4).unlocked,
  );

  const w4u2Required = requiredRefsForUnit(wave4Bundle, w4u2, w4u2Exercises);
  const ramShowIdx = w4u2Exercises.findIndex((row) => row.id === "exercise.wave4.presentation.ram_closed");
  const ramScoreIdx = w4u2Exercises.findIndex((row) => row.id === "exercise.wave4.syllable_blending.ram_closed");
  const ramlAudioIdx = w4u2Exercises.findIndex((row) => row.id === "exercise.wave4.audio_to_word.raml");
  const ramlPictureIdx = w4u2Exercises.findIndex((row) => row.id === "exercise.wave4.word_to_picture.raml");
  const ramlPicture = w4u2Exercises[ramlPictureIdx];
  const closedKey = getClosedChunkLiveKey({ syllableId: "syllable.ram.closed" }).liveKey;
  assert("W4.6 Unit 2 SHOWs رَمْ before any رَمْل", ramShowIdx === 0 && ramScoreIdx > ramShowIdx && ramlAudioIdx > ramScoreIdx);
  assert("W4.6 first رَمْل evidence is audio_to_word", w4u2Exercises[ramlAudioIdx]?.type === "audio_to_word");
  assert(
    "W4.6 closed-chunk and word:raml.decoding are required",
    w4u2Required.some((ref) => ref.liveKey === closedKey) &&
      w4u2Required.some((ref) => ref.liveKey === "word:raml.decoding") &&
      !w4u2Required.some((ref) => ref.liveKey === "letter:ra.fatha") &&
      !w4u2Required.some((ref) => ref.liveKey === "diacritic:mim.sukun.discrimination"),
    w4u2Required.map((ref) => ref.liveKey).join(", "),
  );
  const pictureOnlyRaml = ramlPicture ? activitySeen(ramlPicture) : {};
  assert(
    "W4.6 picture evidence cannot pass Unit 2",
    !evaluateUnitMastery(wave4Bundle, w4u2, w4u2Exercises, { ...w4u1Mastered, ...pictureOnlyRaml }).mastered,
  );
  const w4u2Mastered = masterRequired(wave4Bundle, w4u2, w4u2Exercises, w4u1Mastered);
  const w4u2ok = evaluateUnitMastery(wave4Bundle, w4u2, w4u2Exercises, w4u2Mastered);
  assert("W4.6 Unit 2 masters with chunk + decoding evidence", w4u2ok.mastered, w4u2ok.blockers.join("; "));
  assert(
    "W4.7 Unit 3 locked until Unit 2 mastered",
    !evaluateUnitUnlock(wave4Bundle, wave4Units, w4u3, w4u1Mastered, lookupPrereqW4).unlocked &&
      evaluateUnitUnlock(wave4Bundle, wave4Units, w4u3, w4u2Mastered, lookupPrereqW4).unlocked,
  );

  const w4u3Required = requiredRefsForUnit(wave4Bundle, w4u3, w4u3Exercises);
  const baFinalIdx = w4u3Exercises.findIndex((row) => row.id === "exercise.wave4.letter_forms.ba_final");
  const qalbAudioIdx = w4u3Exercises.findIndex((row) => row.id === "exercise.wave4.audio_to_word.qalb");
  const qalbAudio = w4u3Exercises[qalbAudioIdx];
  const qalbChoices = (qalbAudio?.choices ?? []).map((choice) => choice.id);
  assert("W4.8 final ب prep occurs before قَلْب", baFinalIdx >= 0 && qalbAudioIdx > baFinalIdx);
  assert(
    "W4.8 first قَلْب evidence contrasts with قَلَم",
    qalbAudio?.type === "audio_to_word" && qalbChoices.includes("word.qalam"),
  );
  assert(
    "W4.8 word:qalb.decoding and letter:ba.form.final are required",
    w4u3Required.some((ref) => ref.liveKey === "word:qalb.decoding") &&
      w4u3Required.some((ref) => ref.liveKey === "letter:ba.form.final"),
    w4u3Required.map((ref) => ref.liveKey).join(", "),
  );
  const w4u3Mastered = masterRequired(wave4Bundle, w4u3, w4u3Exercises, w4u2Mastered);
  const w4u3ok = evaluateUnitMastery(wave4Bundle, w4u3, w4u3Exercises, w4u3Mastered);
  assert("W4.9 completing Wave 4 Unit 3 reaches mastery", w4u3ok.mastered, w4u3ok.blockers.join("; "));
  assert("W4.9 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-6"));
  assert("W4.9 Waves 10–14 are registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE10_SLUG") && resolveLearnSrcEarly.includes("WAVE11_SLUG") && resolveLearnSrcEarly.includes("WAVE12_SLUG") && resolveLearnSrcEarly.includes("WAVE13_SLUG") && resolveLearnSrcEarly.includes("getWave13Bundle") && resolveLearnSrcEarly.includes("WAVE14_SLUG") && resolveLearnSrcEarly.includes("getWave14Bundle") && resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));

  const ramlWord = wave4Bundle.words.find((row) => row.id === "word.raml");
  const qalbWord = wave4Bundle.words.find((row) => row.id === "word.qalb");
  assert("word.raml maps to nature-15", ramlWord?.legacyId === "nature-15");
  assert("word.raml is Band A", ramlWord?.vocabBand === "A" && ramlWord.lemma === "رمل");
  assert("word.qalb maps to body-29", qalbWord?.legacyId === "body-29");
  assert("word.qalb is Band A", qalbWord?.vocabBand === "A" && qalbWord.lemma === "قلب");
  assert("W4.10 Wave 3 final unit id is unchanged", w3u3.id === WAVE3_FINAL_UNIT_ID);
  assert("W4.10 Wave 1–3 mastery still holds after Wave 4 load", w3u3ok.mastered && w3u1ok.mastered);

  const wave5Bundle = asCurriculumBundle(JSON.parse(readFileSync(wave5Path, "utf8")));
  const wave5PathRow = wave5Bundle.paths?.find((row) => row.id === WAVE5_PATH_ID);
  if (!wave5PathRow) throw new Error("Wave 5 path missing");
  const wave5ById = new Map((wave5Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave5Units = wave5PathRow.unitIds.flatMap((id) => {
    const unit = wave5ById.get(id);
    return unit ? [unit] : [];
  });
  const w5u1 = wave5Units[0];
  const w5u2 = wave5Units[1];
  const w5u3 = wave5Units[2];
  if (!w5u1 || !w5u2 || !w5u3) throw new Error("Wave 5 units 1–3 missing");
  assert("Wave 5 declares exactly three units", wave5Units.length === 3);
  assert("Wave 5 Unit 1 prereq is Wave 4 final unit", w5u1.prereqUnitIds?.[0] === "unit.literacy.wave4.qalb");

  const lookupPrereqW5 = (id: string) => {
    const w1 = bundle.units?.find((row) => row.id === id);
    if (w1) return { bundle, unit: w1 };
    const w2 = wave2Bundle.units?.find((row) => row.id === id);
    if (w2) return { bundle: wave2Bundle, unit: w2 };
    const w3 = wave3Bundle.units?.find((row) => row.id === id);
    if (w3) return { bundle: wave3Bundle, unit: w3 };
    const w4 = wave4Bundle.units?.find((row) => row.id === id);
    if (w4) return { bundle: wave4Bundle, unit: w4 };
    const w5 = wave5Bundle.units?.find((row) => row.id === id);
    if (w5) return { bundle: wave5Bundle, unit: w5 };
    return undefined;
  };

  const w5u1Exercises = exercisesForUnit(wave5Bundle, w5u1);
  const w5u2Exercises = exercisesForUnit(wave5Bundle, w5u2);
  const w5u3Exercises = exercisesForUnit(wave5Bundle, w5u3);

  assert(
    "W5.1 Wave 5 locked before Wave 4 final mastery",
    !evaluateUnitUnlock(wave5Bundle, wave5Units, w5u1, w4u2Mastered, lookupPrereqW5).unlocked,
  );
  const throughWave4 = w4u3Mastered;
  const w5u1Unlock = evaluateUnitUnlock(wave5Bundle, wave5Units, w5u1, throughWave4, lookupPrereqW5);
  assert("W5.2 Wave 5 Unit 1 unlocks after Wave 4 mastery", w5u1Unlock.unlocked, w5u1Unlock.blockers.join("; "));
  assert(
    "W5.2 later Wave 5 units stay locked until their own prereqs",
    !evaluateUnitUnlock(wave5Bundle, wave5Units, w5u2, throughWave4, lookupPrereqW5).unlocked &&
      !evaluateUnitUnlock(wave5Bundle, wave5Units, w5u3, throughWave4, lookupPrereqW5).unlocked,
  );

  const kafDemo = w5u1Exercises.find((row) => row.id === "exercise.wave5.presentation.kaf");
  const kafFathaDemo = w5u1Exercises.find((row) => row.id === "exercise.wave5.presentation.kaf_fatha");
  const kafSound = w5u1Exercises.find((row) => row.id === "exercise.wave5.sound_to_letter.kaf");
  const kafFatha = w5u1Exercises.find((row) => row.id === "exercise.wave5.syllable_blending.kaf_fatha");
  const kafTrace = w5u1Exercises.find((row) => row.id === "exercise.wave5.tracing.kaf");
  assert("W5.3 Unit 1 SHOWs ك then كَ before scored beats", w5u1Exercises[0]?.id === "exercise.wave5.presentation.kaf" && w5u1Exercises[1]?.id === "exercise.wave5.presentation.kaf_fatha");
  assert("W5.3 presentations have no mastery targets", (kafDemo?.masteryTargets ?? []).length === 0 && (kafFathaDemo?.masteryTargets ?? []).length === 0);
  const w5u1Required = requiredRefsForUnit(wave5Bundle, w5u1, w5u1Exercises);
  assert(
    "W5.3 Unit 1 requires kaf sound and kaf fatha",
    w5u1Required.some((ref) => ref.liveKey === "letter:kaf.sound") &&
      w5u1Required.some((ref) => ref.liveKey === "letter:kaf.fatha") &&
      !w5u1Required.some((ref) => ref.liveKey === "letter:kaf.tracing") &&
      !w5u1Required.some((ref) => ref.liveKey.includes("intro")),
    w5u1Required.map((ref) => ref.liveKey).join(", "),
  );
  const kafDemosSeen = { ...activitySeen(kafDemo!), ...activitySeen(kafFathaDemo!) };
  assert(
    "W5.3 presentations alone cannot pass Unit 1",
    !evaluateUnitMastery(wave5Bundle, w5u1, w5u1Exercises, kafDemosSeen).mastered,
  );
  const kafTraceOnly = kafTrace ? itemsFrom([liveRefForTarget(wave5Bundle, kafTrace.masteryTargets![0]!, kafTrace)], [[true, true, true]]) : {};
  assert(
    "W5.3 tracing cannot gate Unit 1",
    !evaluateUnitMastery(wave5Bundle, w5u1, w5u1Exercises, { ...throughWave4, ...kafTraceOnly }).mastered,
  );
  const w5u1Mastered = masterRequired(wave5Bundle, w5u1, w5u1Exercises, throughWave4);
  const w5u1ok = evaluateUnitMastery(wave5Bundle, w5u1, w5u1Exercises, w5u1Mastered);
  assert("W5.3 Unit 1 masters with sound + fatha", w5u1ok.mastered, w5u1ok.blockers.join("; "));
  assert(
    "W5.3 presentation attempts remain 0 after Unit 1 mastery seed",
    (w5u1Mastered[getPresentationLiveKey("exercise.wave5.presentation.kaf").liveKey]?.attempts ?? 0) === 0,
  );

  assert(
    "W5.4 Unit 2 locked until Unit 1 mastered",
    !evaluateUnitUnlock(wave5Bundle, wave5Units, w5u2, throughWave4, lookupPrereqW5).unlocked &&
      evaluateUnitUnlock(wave5Bundle, wave5Units, w5u2, w5u1Mastered, lookupPrereqW5).unlocked,
  );

  const w5u2Required = requiredRefsForUnit(wave5Bundle, w5u2, w5u2Exercises);
  const kafFormIdx = w5u2Exercises.findIndex((row) => row.id === "exercise.wave5.letter_forms.kaf_initial");
  const kalbAudioIdx = w5u2Exercises.findIndex((row) => row.id === "exercise.wave5.audio_to_word.kalb");
  const kalbPictureIdx = w5u2Exercises.findIndex((row) => row.id === "exercise.wave5.word_to_picture.kalb");
  const kalbAudio = w5u2Exercises[kalbAudioIdx];
  const kalbPicture = w5u2Exercises[kalbPictureIdx];
  const kalbChoices = (kalbAudio?.choices ?? []).map((choice) => choice.id);
  assert("W5.4 initial كـ occurs before كَلْب", kafFormIdx >= 0 && kalbAudioIdx > kafFormIdx);
  assert("W5.4 first كَلْب evidence is audio_to_word", kalbAudio?.type === "audio_to_word" && kalbChoices.includes("word.kalb") && kalbChoices.includes("word.qalb"));
  assert(
    "W5.4 Unit 2 requires initial kaf and word:kalb.decoding",
    w5u2Required.some((ref) => ref.liveKey === "letter:kaf.form.initial") &&
      w5u2Required.some((ref) => ref.liveKey === "word:kalb.decoding") &&
      !w5u2Required.some((ref) => ref.liveKey === "word:qalb.decoding") &&
      !w5u2Required.some((ref) => ref.liveKey === "letter:ram.closed") &&
      !w5u2Required.some((ref) => ref.liveKey === "diacritic:mim.sukun.discrimination"),
    w5u2Required.map((ref) => ref.liveKey).join(", "),
  );
  const qalbOldOnly = itemsFrom(
    [getWordLiveKey({ wordId: "word.qalb", facet: "decoding" })].map((keyed) => ({
      portableMasteryId: "probe.qalb.decoding",
      skillId: "skill.word_decoding.simple",
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    })),
    [[true, true, true]],
  );
  assert(
    "W5.4 old qalb decoding cannot satisfy kalb",
    !evaluateUnitMastery(wave5Bundle, w5u2, w5u2Exercises, { ...w5u1Mastered, ...qalbOldOnly }).mastered,
  );
  const pictureOnlyKalb = kalbPicture ? activitySeen(kalbPicture) : {};
  assert(
    "W5.4 picture cannot pass Unit 2",
    !evaluateUnitMastery(wave5Bundle, w5u2, w5u2Exercises, { ...w5u1Mastered, ...pictureOnlyKalb }).mastered,
  );
  const w5u2Mastered = masterRequired(wave5Bundle, w5u2, w5u2Exercises, w5u1Mastered);
  const w5u2ok = evaluateUnitMastery(wave5Bundle, w5u2, w5u2Exercises, w5u2Mastered);
  assert("W5.4 Unit 2 masters with form + kalb decoding", w5u2ok.mastered, w5u2ok.blockers.join("; "));

  assert(
    "W5.5 Unit 3 locked until Unit 2 mastered",
    !evaluateUnitUnlock(wave5Bundle, wave5Units, w5u3, w5u1Mastered, lookupPrereqW5).unlocked &&
      evaluateUnitUnlock(wave5Bundle, wave5Units, w5u3, w5u2Mastered, lookupPrereqW5).unlocked,
  );

  const w5u3Required = requiredRefsForUnit(wave5Bundle, w5u3, w5u3Exercises);
  const baInitialIdx = w5u3Exercises.findIndex((row) => row.id === "exercise.wave5.letter_forms.ba_initial");
  const bahrAudioIdx = w5u3Exercises.findIndex((row) => row.id === "exercise.wave5.audio_to_word.bahr");
  const qalbReviewIdx = w5u3Exercises.findIndex((row) => row.id === "exercise.wave5.audio_to_word.qalb_review");
  const bahrPictureIdx = w5u3Exercises.findIndex((row) => row.id === "exercise.wave5.word_to_picture.bahr");
  const bahrPicture = w5u3Exercises[bahrPictureIdx];
  assert("W5.5 initial بـ occurs before بَحْر", baInitialIdx >= 0 && bahrAudioIdx > baInitialIdx);
  assert("W5.5 first بَحْر evidence is audio_to_word", w5u3Exercises[bahrAudioIdx]?.type === "audio_to_word");
  assert("W5.5 compact قَلْب review is present", w5u3Exercises[qalbReviewIdx]?.tags?.includes("review") === true);
  assert(
    "W5.5 Unit 3 requires initial ba, bahr decoding, and qalb review",
    w5u3Required.some((ref) => ref.liveKey === "letter:ba.form.initial") &&
      w5u3Required.some((ref) => ref.liveKey === "word:bahr.decoding") &&
      w5u3Required.some((ref) => ref.liveKey === "word:qalb.review") &&
      !w5u3Required.some((ref) => ref.liveKey === "word:qalb.decoding") &&
      !w5u3Required.some((ref) => ref.liveKey === "letter:kaf.kasra") &&
      !w5u3Required.some((ref) => ref.liveKey === "letter:kaf.damma"),
    w5u3Required.map((ref) => ref.liveKey).join(", "),
  );
  assert(
    "W5.5 old word:qalb.decoding cannot substitute for word:qalb.review",
    !evaluateUnitMastery(wave5Bundle, w5u3, w5u3Exercises, { ...w5u2Mastered, ...qalbOldOnly }).mastered,
  );
  const pictureOnlyBahr = bahrPicture ? activitySeen(bahrPicture) : {};
  assert(
    "W5.5 picture cannot pass Unit 3",
    !evaluateUnitMastery(wave5Bundle, w5u3, w5u3Exercises, { ...w5u2Mastered, ...pictureOnlyBahr }).mastered,
  );
  const w5u3Mastered = masterRequired(wave5Bundle, w5u3, w5u3Exercises, w5u2Mastered);
  const w5u3ok = evaluateUnitMastery(wave5Bundle, w5u3, w5u3Exercises, w5u3Mastered);
  assert("W5.5 completing Wave 5 Unit 3 reaches mastery", w5u3ok.mastered, w5u3ok.blockers.join("; "));
  assert("W5.5 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-6"));
  assert("W5.5 Waves 10–14 are registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE10_SLUG") && resolveLearnSrcEarly.includes("WAVE11_SLUG") && resolveLearnSrcEarly.includes("WAVE12_SLUG") && resolveLearnSrcEarly.includes("WAVE13_SLUG") && resolveLearnSrcEarly.includes("getWave13Bundle") && resolveLearnSrcEarly.includes("WAVE14_SLUG") && resolveLearnSrcEarly.includes("getWave14Bundle") && resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));

  const kalbWord = wave5Bundle.words.find((row) => row.id === "word.kalb");
  const bahrWord = wave5Bundle.words.find((row) => row.id === "word.bahr");
  assert("word.kalb maps to animals-2", kalbWord?.legacyId === "animals-2");
  assert("word.kalb is Band A", kalbWord?.vocabBand === "A" && kalbWord.lemma === "كلب" && kalbWord.diacritized === "كَلْب");
  assert("word.bahr maps to sea-1", bahrWord?.legacyId === "sea-1");
  assert("word.bahr is Band A", bahrWord?.vocabBand === "A" && bahrWord.lemma === "بحر" && bahrWord.diacritized === "بَحْر");
  assert("W5.6 Wave 4 final unit id is unchanged", w4u3.id === "unit.literacy.wave4.qalb");
  assert("W5.6 Wave 1–4 mastery still holds after Wave 5 load", w4u3ok.mastered && w3u3ok.mastered && w3u1ok.mastered);

  const wave6Bundle = asCurriculumBundle(JSON.parse(readFileSync(wave6Path, "utf8")));
  const wave6PathRow = wave6Bundle.paths?.find((row) => row.id === WAVE6_PATH_ID);
  if (!wave6PathRow) throw new Error("Wave 6 path missing");
  const wave6ById = new Map((wave6Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave6Units = wave6PathRow.unitIds.flatMap((id) => {
    const unit = wave6ById.get(id);
    return unit ? [unit] : [];
  });
  const w6u1 = wave6Units[0];
  const w6u2 = wave6Units[1];
  const w6u3 = wave6Units[2];
  if (!w6u1 || !w6u2 || !w6u3) throw new Error("Wave 6 units 1–3 missing");
  assert("Wave 6 declares exactly three units", wave6Units.length === 3);
  assert("Wave 6 Unit 1 prereq is Wave 5 final unit", w6u1.prereqUnitIds?.[0] === "unit.literacy.wave5.bahr");

  const lookupPrereqW6 = (id: string) => {
    const w1 = bundle.units?.find((row) => row.id === id);
    if (w1) return { bundle, unit: w1 };
    const w2 = wave2Bundle.units?.find((row) => row.id === id);
    if (w2) return { bundle: wave2Bundle, unit: w2 };
    const w3 = wave3Bundle.units?.find((row) => row.id === id);
    if (w3) return { bundle: wave3Bundle, unit: w3 };
    const w4 = wave4Bundle.units?.find((row) => row.id === id);
    if (w4) return { bundle: wave4Bundle, unit: w4 };
    const w5 = wave5Bundle.units?.find((row) => row.id === id);
    if (w5) return { bundle: wave5Bundle, unit: w5 };
    const w6 = wave6Bundle.units?.find((row) => row.id === id);
    if (w6) return { bundle: wave6Bundle, unit: w6 };
    return undefined;
  };

  const w6u1Exercises = exercisesForUnit(wave6Bundle, w6u1);
  const w6u2Exercises = exercisesForUnit(wave6Bundle, w6u2);
  const w6u3Exercises = exercisesForUnit(wave6Bundle, w6u3);
  const throughWave5 = w5u3Mastered;

  assert(
    "W6.1 Wave 6 locked before Wave 5 final mastery",
    !evaluateUnitUnlock(wave6Bundle, wave6Units, w6u1, w5u2Mastered, lookupPrereqW6).unlocked,
  );
  const w6u1Unlock = evaluateUnitUnlock(wave6Bundle, wave6Units, w6u1, throughWave5, lookupPrereqW6);
  assert("W6.2 Wave 6 Unit 1 unlocks after Wave 5 mastery", w6u1Unlock.unlocked, w6u1Unlock.blockers.join("; "));
  assert(
    "W6.2 later Wave 6 units stay locked until their own prereqs",
    !evaluateUnitUnlock(wave6Bundle, wave6Units, w6u2, throughWave5, lookupPrereqW6).unlocked &&
      !evaluateUnitUnlock(wave6Bundle, wave6Units, w6u3, throughWave5, lookupPrereqW6).unlocked,
  );

  const taDemo = w6u1Exercises.find((row) => row.id === "exercise.wave6.presentation.ta");
  const taFathaDemo = w6u1Exercises.find((row) => row.id === "exercise.wave6.presentation.ta_fatha");
  const taTrace = w6u1Exercises.find((row) => row.id === "exercise.wave6.tracing.ta");
  assert("W6.3 Unit 1 SHOWs ت then تَ before scored beats", w6u1Exercises[0]?.id === "exercise.wave6.presentation.ta" && w6u1Exercises[1]?.id === "exercise.wave6.presentation.ta_fatha");
  assert("W6.3 presentations have no mastery targets", (taDemo?.masteryTargets ?? []).length === 0 && (taFathaDemo?.masteryTargets ?? []).length === 0);
  const w6u1Required = requiredRefsForUnit(wave6Bundle, w6u1, w6u1Exercises);
  assert(
    "W6.3 Unit 1 requires ta sound and ta fatha",
    w6u1Required.some((ref) => ref.liveKey === "letter:ta.sound") &&
      w6u1Required.some((ref) => ref.liveKey === "letter:ta.fatha") &&
      !w6u1Required.some((ref) => ref.liveKey === "letter:ta.tracing") &&
      !w6u1Required.some((ref) => ref.liveKey.includes("intro")),
    w6u1Required.map((ref) => ref.liveKey).join(", "),
  );
  const taDemosSeen = { ...activitySeen(taDemo!), ...activitySeen(taFathaDemo!) };
  assert(
    "W6.3 presentations alone cannot pass Unit 1",
    !evaluateUnitMastery(wave6Bundle, w6u1, w6u1Exercises, taDemosSeen).mastered,
  );
  const taTraceOnly = taTrace ? itemsFrom([liveRefForTarget(wave6Bundle, taTrace.masteryTargets![0]!, taTrace)], [[true, true, true]]) : {};
  assert(
    "W6.3 tracing cannot gate Unit 1",
    !evaluateUnitMastery(wave6Bundle, w6u1, w6u1Exercises, { ...throughWave5, ...taTraceOnly }).mastered,
  );
  const w6u1Mastered = masterRequired(wave6Bundle, w6u1, w6u1Exercises, throughWave5);
  const w6u1ok = evaluateUnitMastery(wave6Bundle, w6u1, w6u1Exercises, w6u1Mastered);
  assert("W6.3 Unit 1 masters with sound + fatha", w6u1ok.mastered, w6u1ok.blockers.join("; "));
  assert(
    "W6.3 presentation attempts remain 0",
    (w6u1Mastered[getPresentationLiveKey("exercise.wave6.presentation.ta").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W6.3 Unit 2 unlocks only after Unit 1 mastery",
    !evaluateUnitUnlock(wave6Bundle, wave6Units, w6u2, throughWave5, lookupPrereqW6).unlocked &&
      evaluateUnitUnlock(wave6Bundle, wave6Units, w6u2, w6u1Mastered, lookupPrereqW6).unlocked,
  );

  const w6u2Required = requiredRefsForUnit(wave6Bundle, w6u2, w6u2Exercises);
  const taFormIdx = w6u2Exercises.findIndex((row) => row.id === "exercise.wave6.letter_forms.ta_initial");
  const tamrAudioIdx = w6u2Exercises.findIndex((row) => row.id === "exercise.wave6.audio_to_word.tamr");
  const tamrPictureIdx = w6u2Exercises.findIndex((row) => row.id === "exercise.wave6.word_to_picture.tamr");
  const tamrAudio = w6u2Exercises[tamrAudioIdx];
  const tamrPicture = w6u2Exercises[tamrPictureIdx];
  const tamrChoices = (tamrAudio?.choices ?? []).map((choice) => choice.id);
  assert("W6.4 initial تـ occurs before تَمْر", taFormIdx >= 0 && tamrAudioIdx > taFormIdx);
  assert("W6.4 first تَمْر evidence is audio_to_word", tamrAudio?.type === "audio_to_word" && tamrChoices.includes("word.tamr") && tamrChoices.includes("word.qamar"));
  assert(
    "W6.4 Unit 2 requires initial ta and word:tamr.decoding",
    w6u2Required.some((ref) => ref.liveKey === "letter:ta.form.initial") &&
      w6u2Required.some((ref) => ref.liveKey === "word:tamr.decoding") &&
      !w6u2Required.some((ref) => ref.liveKey === "word:qamar.decoding"),
    w6u2Required.map((ref) => ref.liveKey).join(", "),
  );
  const qamarOldOnly = itemsFrom(
    [getWordLiveKey({ wordId: "word.qamar", facet: "decoding" })].map((keyed) => ({
      portableMasteryId: "probe.qamar.decoding",
      skillId: "skill.word_decoding.simple",
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    })),
    [[true, true, true]],
  );
  assert(
    "W6.4 old qamar decoding cannot satisfy tamr",
    !evaluateUnitMastery(wave6Bundle, w6u2, w6u2Exercises, { ...w6u1Mastered, ...qamarOldOnly }).mastered,
  );
  const pictureOnlyTamr = tamrPicture ? activitySeen(tamrPicture) : {};
  assert(
    "W6.4 picture cannot pass Unit 2",
    !evaluateUnitMastery(wave6Bundle, w6u2, w6u2Exercises, { ...w6u1Mastered, ...pictureOnlyTamr }).mastered,
  );
  const w6u2Mastered = masterRequired(wave6Bundle, w6u2, w6u2Exercises, w6u1Mastered);
  const w6u2ok = evaluateUnitMastery(wave6Bundle, w6u2, w6u2Exercises, w6u2Mastered);
  assert("W6.4 Unit 2 masters with form + tamr decoding", w6u2ok.mastered, w6u2ok.blockers.join("; "));
  assert(
    "W6.4 Unit 3 unlocks only after Unit 2 mastery",
    !evaluateUnitUnlock(wave6Bundle, wave6Units, w6u3, w6u1Mastered, lookupPrereqW6).unlocked &&
      evaluateUnitUnlock(wave6Bundle, wave6Units, w6u3, w6u2Mastered, lookupPrereqW6).unlocked,
  );

  const w6u3Required = requiredRefsForUnit(wave6Bundle, w6u3, w6u3Exercises);
  const taMedialIdx = w6u3Exercises.findIndex((row) => row.id === "exercise.wave6.letter_forms.ta_medial");
  const daftarAudioIdx = w6u3Exercises.findIndex((row) => row.id === "exercise.wave6.audio_to_word.daftar");
  const w6QamarReviewIdx = w6u3Exercises.findIndex((row) => row.id === "exercise.wave6.audio_to_word.qamar_review");
  const daftarPictureIdx = w6u3Exercises.findIndex((row) => row.id === "exercise.wave6.word_to_picture.daftar");
  const daftarPicture = w6u3Exercises[daftarPictureIdx];
  assert("W6.5 compact قَمَر review is present", w6u3Exercises[w6QamarReviewIdx]?.tags?.includes("review") === true && w6u3Exercises[w6QamarReviewIdx]?.tags?.includes("review-wave6") === true);
  assert("W6.5 medial ـتـ occurs before دَفْتَر", taMedialIdx >= 0 && daftarAudioIdx > taMedialIdx);
  assert("W6.5 first دَفْتَر evidence is audio_to_word", w6u3Exercises[daftarAudioIdx]?.type === "audio_to_word");
  assert("W6.5 دَفْتَر is the first 4-letter target", (wave6Bundle.words.find((row) => row.id === "word.daftar")?.letterIds ?? []).length === 4);
  assert(
    "W6.5 Unit 3 requires medial ta, daftar decoding, and word:qamar.review.wave6",
    w6u3Required.some((ref) => ref.liveKey === "letter:ta.form.medial") &&
      w6u3Required.some((ref) => ref.liveKey === "word:daftar.decoding") &&
      w6u3Required.some((ref) => ref.liveKey === "word:qamar.review.wave6") &&
      !w6u3Required.some((ref) => ref.liveKey === "word:qamar.review") &&
      !w6u3Required.some((ref) => ref.liveKey === "letter:ta.kasra") &&
      !w6u3Required.some((ref) => ref.liveKey === "letter:ta.damma"),
    w6u3Required.map((ref) => ref.liveKey).join(", "),
  );
  const w6QamarReviewExercise = w6u3Exercises[w6QamarReviewIdx];
  assert(
    "W6.5 Wave 6 review live key is scoped",
    Boolean(w6QamarReviewExercise?.masteryTargets?.[0]) &&
      liveRefForTarget(wave6Bundle, w6QamarReviewExercise!.masteryTargets![0]!, w6QamarReviewExercise).liveKey ===
        "word:qamar.review.wave6",
  );
  assert("W6.5 realistic W1–5 seed already has word:qamar.review", (throughWave5["word:qamar.review"]?.mastery ?? 0) >= 1);
  assert("W6.5 realistic W1–5 seed does not have word:qamar.review.wave6", !throughWave5["word:qamar.review.wave6"]);
  const qamarHistoricalReview = itemsFrom(
    [getWordLiveKey({ wordId: "word.qamar", facet: "review" })].map((keyed) => ({
      portableMasteryId: "probe.qamar.review",
      skillId: "skill.word_decoding.simple",
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    })),
    [[true, true, true]],
  );
  const w6u3WithoutWave6Review = masterRequired(
    wave6Bundle,
    w6u3,
    w6u3Exercises.filter((row) => row.id !== "exercise.wave6.audio_to_word.qamar_review"),
    { ...w6u2Mastered, ...qamarOldOnly, ...qamarHistoricalReview },
  );
  assert(
    "W6.5 prior word:qamar.review does not complete Wave 6 Unit 3",
    !evaluateUnitMastery(wave6Bundle, w6u3, w6u3Exercises, w6u3WithoutWave6Review).mastered,
  );
  assert(
    "W6.5 old word:qamar.decoding and word:qamar.review cannot satisfy word:qamar.review.wave6",
    !evaluateUnitMastery(wave6Bundle, w6u3, w6u3Exercises, { ...w6u2Mastered, ...qamarOldOnly, ...qamarHistoricalReview }).mastered,
  );
  const pictureOnlyDaftar = daftarPicture ? activitySeen(daftarPicture) : {};
  assert(
    "W6.5 picture cannot pass Unit 3",
    !evaluateUnitMastery(wave6Bundle, w6u3, w6u3Exercises, { ...w6u2Mastered, ...pictureOnlyDaftar }).mastered,
  );
  const w6u3Mastered = masterRequired(wave6Bundle, w6u3, w6u3Exercises, w6u2Mastered);
  const w6u3ok = evaluateUnitMastery(wave6Bundle, w6u3, w6u3Exercises, w6u3Mastered);
  assert("W6.5 completing Wave 6 review writes word:qamar.review.wave6", (w6u3Mastered["word:qamar.review.wave6"]?.attempts ?? 0) >= 3);
  assert("W6.5 completing Wave 6 Unit 3 reaches mastery", w6u3ok.mastered, w6u3ok.blockers.join("; "));
  assert("W6.5 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-7"));
  assert("W6.5 Waves 10–14 are registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE10_SLUG") && resolveLearnSrcEarly.includes("WAVE11_SLUG") && resolveLearnSrcEarly.includes("WAVE12_SLUG") && resolveLearnSrcEarly.includes("WAVE13_SLUG") && resolveLearnSrcEarly.includes("getWave13Bundle") && resolveLearnSrcEarly.includes("WAVE14_SLUG") && resolveLearnSrcEarly.includes("getWave14Bundle") && resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));

  const allW6Keys = [...w6u1Required, ...w6u2Required, ...w6u3Required].map((ref) => ref.liveKey);
  assert("W6.5 no new sukun live key", !allW6Keys.some((key) => key.includes("sukun")));
  assert("W6.5 no new closed-chunk live key", !allW6Keys.some((key) => key.includes(".closed") || key.includes("chunk")));

  const tamrWord = wave6Bundle.words.find((row) => row.id === "word.tamr");
  const daftarWord = wave6Bundle.words.find((row) => row.id === "word.daftar");
  assert("word.tamr maps to food-54", tamrWord?.legacyId === "food-54");
  assert("word.tamr is Band A", tamrWord?.vocabBand === "A" && tamrWord.lemma === "تمر" && tamrWord.diacritized === "تَمْر");
  assert("word.daftar maps to school-7", daftarWord?.legacyId === "school-7");
  assert("word.daftar is Band A", daftarWord?.vocabBand === "A" && daftarWord.lemma === "دفتر" && daftarWord.diacritized === "دَفْتَر");
  assert("W6.6 Wave 5 final unit id is unchanged", w5u3.id === "unit.literacy.wave5.bahr");
  assert("W6.6 Wave 1–5 mastery still holds after Wave 6 load", w5u3ok.mastered && w4u3ok.mastered && w3u3ok.mastered);
  const frozenPriorWaves = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("wave-6") && !src.includes("wave6") && !src.includes("path.literacy.wave6");
  });
  assert("W6.6 Waves 1–5 lesson JSON stay free of Wave 6 ids", frozenPriorWaves);

  const w6Report = readFileSync(join(root, "docs/literacy-wave-6-report.md"), "utf8");
  assert("W6 report does not call تَمْر / قَمَر a minimal pair", !/minimal pair/i.test(w6Report));

  const wave7Bundle = asCurriculumBundle(JSON.parse(readFileSync(wave7Path, "utf8")));
  const wave7PathRow = wave7Bundle.paths?.find((row) => row.id === WAVE7_PATH_ID);
  if (!wave7PathRow) throw new Error("Wave 7 path missing");
  const wave7ById = new Map((wave7Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave7Units = wave7PathRow.unitIds.flatMap((id) => {
    const unit = wave7ById.get(id);
    return unit ? [unit] : [];
  });
  const w7u1 = wave7Units[0];
  const w7u2 = wave7Units[1];
  if (!w7u1 || !w7u2) throw new Error("Wave 7 units 1–2 missing");
  assert("Wave 7 declares exactly two units", wave7Units.length === 2);
  assert("Wave 7 Unit 1 prereq is Wave 6 final unit", w7u1.prereqUnitIds?.[0] === "unit.literacy.wave6.daftar");
  assert("Wave 7 has no third unit", wave7Units[2] === undefined);

  const lookupPrereqW7 = (id: string) => {
    const w1 = bundle.units?.find((row) => row.id === id);
    if (w1) return { bundle, unit: w1 };
    const w2 = wave2Bundle.units?.find((row) => row.id === id);
    if (w2) return { bundle: wave2Bundle, unit: w2 };
    const w3 = wave3Bundle.units?.find((row) => row.id === id);
    if (w3) return { bundle: wave3Bundle, unit: w3 };
    const w4 = wave4Bundle.units?.find((row) => row.id === id);
    if (w4) return { bundle: wave4Bundle, unit: w4 };
    const w5 = wave5Bundle.units?.find((row) => row.id === id);
    if (w5) return { bundle: wave5Bundle, unit: w5 };
    const w6 = wave6Bundle.units?.find((row) => row.id === id);
    if (w6) return { bundle: wave6Bundle, unit: w6 };
    const w7 = wave7Bundle.units?.find((row) => row.id === id);
    if (w7) return { bundle: wave7Bundle, unit: w7 };
    return undefined;
  };

  const w7u1Exercises = exercisesForUnit(wave7Bundle, w7u1);
  const w7u2Exercises = exercisesForUnit(wave7Bundle, w7u2);
  const throughWave6 = w6u3Mastered;

  assert(
    "W7.1 Wave 7 locked before Wave 6 final mastery",
    !evaluateUnitUnlock(wave7Bundle, wave7Units, w7u1, w6u2Mastered, lookupPrereqW7).unlocked,
  );
  const w7u1Unlock = evaluateUnitUnlock(wave7Bundle, wave7Units, w7u1, throughWave6, lookupPrereqW7);
  assert("W7.2 Wave 7 Unit 1 unlocks after Wave 6 mastery", w7u1Unlock.unlocked, w7u1Unlock.blockers.join("; "));
  assert(
    "W7.2 Unit 2 stays locked until Unit 1",
    !evaluateUnitUnlock(wave7Bundle, wave7Units, w7u2, throughWave6, lookupPrereqW7).unlocked,
  );

  const sinDemo = w7u1Exercises.find((row) => row.id === "exercise.wave7.presentation.sin");
  const sinFathaDemo = w7u1Exercises.find((row) => row.id === "exercise.wave7.presentation.sin_fatha");
  const sinTrace = w7u1Exercises.find((row) => row.id === "exercise.wave7.tracing.sin");
  assert(
    "W7.3 Unit 1 SHOWs س then سَ before scored beats",
    w7u1Exercises[0]?.id === "exercise.wave7.presentation.sin" &&
      w7u1Exercises[1]?.id === "exercise.wave7.presentation.sin_fatha",
  );
  assert("W7.3 presentations have no mastery targets", (sinDemo?.masteryTargets ?? []).length === 0 && (sinFathaDemo?.masteryTargets ?? []).length === 0);
  const w7u1Required = requiredRefsForUnit(wave7Bundle, w7u1, w7u1Exercises);
  assert(
    "W7.3 Unit 1 requires sin sound and sin fatha",
    w7u1Required.some((ref) => ref.liveKey === "letter:sin.sound") &&
      w7u1Required.some((ref) => ref.liveKey === "letter:sin.fatha") &&
      !w7u1Required.some((ref) => ref.liveKey === "letter:sin.tracing") &&
      !w7u1Required.some((ref) => ref.liveKey.includes("intro")),
    w7u1Required.map((ref) => ref.liveKey).join(", "),
  );
  const sinDemosSeen = { ...activitySeen(sinDemo!), ...activitySeen(sinFathaDemo!) };
  assert(
    "W7.3 presentations alone cannot pass Unit 1",
    !evaluateUnitMastery(wave7Bundle, w7u1, w7u1Exercises, sinDemosSeen).mastered,
  );
  const sinTraceOnly = sinTrace ? itemsFrom([liveRefForTarget(wave7Bundle, sinTrace.masteryTargets![0]!, sinTrace)], [[true, true, true]]) : {};
  assert(
    "W7.3 tracing cannot gate Unit 1",
    !evaluateUnitMastery(wave7Bundle, w7u1, w7u1Exercises, { ...throughWave6, ...sinTraceOnly }).mastered,
  );
  const w7u1Mastered = masterRequired(wave7Bundle, w7u1, w7u1Exercises, throughWave6);
  const w7u1ok = evaluateUnitMastery(wave7Bundle, w7u1, w7u1Exercises, w7u1Mastered);
  assert("W7.3 Unit 1 masters with sound + fatha", w7u1ok.mastered, w7u1ok.blockers.join("; "));
  assert(
    "W7.3 presentation attempts remain 0",
    (w7u1Mastered[getPresentationLiveKey("exercise.wave7.presentation.sin").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W7.3 Unit 2 unlocks only after Unit 1 mastery",
    !evaluateUnitUnlock(wave7Bundle, wave7Units, w7u2, throughWave6, lookupPrereqW7).unlocked &&
      evaluateUnitUnlock(wave7Bundle, wave7Units, w7u2, w7u1Mastered, lookupPrereqW7).unlocked,
  );

  const w7u2Required = requiredRefsForUnit(wave7Bundle, w7u2, w7u2Exercises);
  const sinFormIdx = w7u2Exercises.findIndex((row) => row.id === "exercise.wave7.letter_forms.sin_initial");
  const kafFinalIdx = w7u2Exercises.findIndex((row) => row.id === "exercise.wave7.letter_forms.kaf_final");
  const samakAudioIdx = w7u2Exercises.findIndex((row) => row.id === "exercise.wave7.audio_to_word.samak");
  const samakPictureIdx = w7u2Exercises.findIndex((row) => row.id === "exercise.wave7.word_to_picture.samak");
  const samakAudio = w7u2Exercises[samakAudioIdx];
  const samakPicture = w7u2Exercises[samakPictureIdx];
  const samakChoices = (samakAudio?.choices ?? []).map((choice) => choice.id);
  assert("W7.4 initial سـ occurs before سَمَك", sinFormIdx >= 0 && samakAudioIdx > sinFormIdx);
  assert("W7.4 final ـك occurs before سَمَك", kafFinalIdx >= 0 && samakAudioIdx > kafFinalIdx);
  assert("W7.4 first سَمَك evidence is audio_to_word", samakAudio?.type === "audio_to_word" && samakChoices.includes("word.samak") && samakChoices.includes("word.kalb"));
  assert(
    "W7.4 Unit 2 requires initial sin, final kaf, and word:samak.decoding",
    w7u2Required.some((ref) => ref.liveKey === "letter:sin.form.initial") &&
      w7u2Required.some((ref) => ref.liveKey === "letter:kaf.form.final") &&
      w7u2Required.some((ref) => ref.liveKey === "word:samak.decoding") &&
      !w7u2Required.some((ref) => ref.liveKey === "word:kalb.review") &&
      !w7u2Required.some((ref) => ref.liveKey === "word:kalb.review.wave7") &&
      !w7u2Required.some((ref) => ref.liveKey === "word:kalb.decoding"),
    w7u2Required.map((ref) => ref.liveKey).join(", "),
  );
  const kafInitialOnly = itemsFrom(
    [getLetterFormLiveKey({ letterLegacyId: "kaf", form: "initial" })].map((keyed) => ({
      portableMasteryId: "probe.kaf.form.initial",
      skillId: "skill.letter_forms.positional",
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    })),
    [[true, true, true]],
  );
  const w7u2WithoutFinalKaf = masterRequired(
    wave7Bundle,
    w7u2,
    w7u2Exercises.filter((row) => row.id !== "exercise.wave7.letter_forms.kaf_final"),
    { ...w7u1Mastered, ...kafInitialOnly },
  );
  assert(
    "W7.4 old kaf initial mastery cannot substitute for final-k form evidence",
    !evaluateUnitMastery(wave7Bundle, w7u2, w7u2Exercises, w7u2WithoutFinalKaf).mastered,
  );
  const pictureOnlySamak = samakPicture ? activitySeen(samakPicture) : {};
  assert(
    "W7.4 picture cannot pass Unit 2",
    !evaluateUnitMastery(wave7Bundle, w7u2, w7u2Exercises, { ...w7u1Mastered, ...pictureOnlySamak }).mastered,
  );
  assert("W7.4 no required review exercise", w7u2Exercises.every((row) => !row.tags?.includes("review") && !row.tags?.includes("review-wave7")));
  const w7u2Mastered = masterRequired(wave7Bundle, w7u2, w7u2Exercises, w7u1Mastered);
  const w7u2ok = evaluateUnitMastery(wave7Bundle, w7u2, w7u2Exercises, w7u2Mastered);
  assert("W7.4 Unit 2 masters with forms + samak decoding", w7u2ok.mastered, w7u2ok.blockers.join("; "));
  assert("W7.4 completing Wave 7 does not write a review key", !w7u2Mastered["word:kalb.review"] && !w7u2Mastered["word:kalb.review.wave7"]);

  const allW7Keys = [...w7u1Required, ...w7u2Required].map((ref) => ref.liveKey);
  assert("W7.5 no new sukun live key", !allW7Keys.some((key) => key.includes("sukun")));
  assert("W7.5 no new closed-chunk live key", !allW7Keys.some((key) => key.includes(".closed") || key.includes("chunk")));
  assert("W7.5 no ش mastery/evidence", !allW7Keys.some((key) => key.includes("shin")));
  assert("W7.5 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-9"));
  assert("W7.5 Waves 10–14 are registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE10_SLUG") && resolveLearnSrcEarly.includes("WAVE11_SLUG") && resolveLearnSrcEarly.includes("WAVE12_SLUG") && resolveLearnSrcEarly.includes("WAVE13_SLUG") && resolveLearnSrcEarly.includes("getWave13Bundle") && resolveLearnSrcEarly.includes("WAVE14_SLUG") && resolveLearnSrcEarly.includes("getWave14Bundle") && resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));

  const samakWord = wave7Bundle.words.find((row) => row.id === "word.samak");
  assert("word.samak maps to food-9", samakWord?.legacyId === "food-9");
  assert("word.samak is Band A", samakWord?.vocabBand === "A" && samakWord.subBand === "A1" && samakWord.lemma === "سمك" && samakWord.teachingForm === "سَمَك");
  assert("W7.6 Wave 6 final unit id is unchanged", w6u3.id === "unit.literacy.wave6.daftar");
  assert("W7.6 Wave 1–6 mastery still holds after Wave 7 load", w6u3ok.mastered && w5u3ok.mastered && w4u3ok.mastered);
  const frozenPriorWavesW7 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("wave-7") && !src.includes("wave7") && !src.includes("path.literacy.wave7");
  });
  assert("W7.6 Waves 1–6 lesson JSON stay free of Wave 7 ids", frozenPriorWavesW7);
  assert("W7.6 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));

  const w7Report = readFileSync(join(root, "docs/literacy-wave-7-report.md"), "utf8");
  assert("W7 report exists and postpones Wave 8", /Wave 8 is not implemented/i.test(w7Report));

  const wave8Bundle = asCurriculumBundle(JSON.parse(readFileSync(wave8Path, "utf8")));
  const wave8PathRow = wave8Bundle.paths?.find((row) => row.id === WAVE8_PATH_ID);
  if (!wave8PathRow) throw new Error("Wave 8 path missing");
  const wave8ById = new Map((wave8Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave8Units = wave8PathRow.unitIds.flatMap((id) => {
    const unit = wave8ById.get(id);
    return unit ? [unit] : [];
  });
  const w8u1 = wave8Units[0];
  const w8u2 = wave8Units[1];
  if (!w8u1 || !w8u2) throw new Error("Wave 8 units 1–2 missing");
  assert("Wave 8 declares exactly two units", wave8Units.length === 2);
  assert("Wave 8 Unit 1 prereq is Wave 7 final unit", w8u1.prereqUnitIds?.[0] === "unit.literacy.wave7.samak");
  assert("Wave 8 has no third unit", wave8Units[2] === undefined);

  const lookupPrereqW8 = (id: string) => {
    const w1 = bundle.units?.find((row) => row.id === id);
    if (w1) return { bundle, unit: w1 };
    const w2 = wave2Bundle.units?.find((row) => row.id === id);
    if (w2) return { bundle: wave2Bundle, unit: w2 };
    const w3 = wave3Bundle.units?.find((row) => row.id === id);
    if (w3) return { bundle: wave3Bundle, unit: w3 };
    const w4 = wave4Bundle.units?.find((row) => row.id === id);
    if (w4) return { bundle: wave4Bundle, unit: w4 };
    const w5 = wave5Bundle.units?.find((row) => row.id === id);
    if (w5) return { bundle: wave5Bundle, unit: w5 };
    const w6 = wave6Bundle.units?.find((row) => row.id === id);
    if (w6) return { bundle: wave6Bundle, unit: w6 };
    const w7 = wave7Bundle.units?.find((row) => row.id === id);
    if (w7) return { bundle: wave7Bundle, unit: w7 };
    const w8 = wave8Bundle.units?.find((row) => row.id === id);
    if (w8) return { bundle: wave8Bundle, unit: w8 };
    return undefined;
  };

  const w8u1Exercises = exercisesForUnit(wave8Bundle, w8u1);
  const w8u2Exercises = exercisesForUnit(wave8Bundle, w8u2);
  const throughWave7 = w7u2Mastered;

  assert(
    "W8.1 Wave 8 locked before Wave 7 final mastery",
    !evaluateUnitUnlock(wave8Bundle, wave8Units, w8u1, w7u1Mastered, lookupPrereqW8).unlocked,
  );
  const w8u1Unlock = evaluateUnitUnlock(wave8Bundle, wave8Units, w8u1, throughWave7, lookupPrereqW8);
  assert("W8.2 Wave 8 Unit 1 unlocks after Wave 7 mastery", w8u1Unlock.unlocked, w8u1Unlock.blockers.join("; "));
  assert(
    "W8.2 Unit 2 stays locked until Unit 1",
    !evaluateUnitUnlock(wave8Bundle, wave8Units, w8u2, throughWave7, lookupPrereqW8).unlocked,
  );

  const shinDemo = w8u1Exercises.find((row) => row.id === "exercise.wave8.presentation.shin");
  const shinFathaDemo = w8u1Exercises.find((row) => row.id === "exercise.wave8.presentation.shin_fatha");
  const shinTrace = w8u1Exercises.find((row) => row.id === "exercise.wave8.tracing.shin");
  assert(
    "W8.3 Unit 1 SHOWs ش then شَ before scored beats",
    w8u1Exercises[0]?.id === "exercise.wave8.presentation.shin" &&
      w8u1Exercises[1]?.id === "exercise.wave8.presentation.shin_fatha",
  );
  assert("W8.3 presentations have no mastery targets", (shinDemo?.masteryTargets ?? []).length === 0 && (shinFathaDemo?.masteryTargets ?? []).length === 0);
  const w8u1Required = requiredRefsForUnit(wave8Bundle, w8u1, w8u1Exercises);
  assert(
    "W8.3 Unit 1 requires shin sound and shin fatha",
    w8u1Required.some((ref) => ref.liveKey === "letter:shin.sound") &&
      w8u1Required.some((ref) => ref.liveKey === "letter:shin.fatha") &&
      !w8u1Required.some((ref) => ref.liveKey === "letter:shin.tracing") &&
      !w8u1Required.some((ref) => ref.liveKey.includes("intro")),
    w8u1Required.map((ref) => ref.liveKey).join(", "),
  );
  const shinDemosSeen = { ...activitySeen(shinDemo!), ...activitySeen(shinFathaDemo!) };
  assert(
    "W8.3 presentations alone cannot pass Unit 1",
    !evaluateUnitMastery(wave8Bundle, w8u1, w8u1Exercises, shinDemosSeen).mastered,
  );
  const shinTraceOnly = shinTrace ? itemsFrom([liveRefForTarget(wave8Bundle, shinTrace.masteryTargets![0]!, shinTrace)], [[true, true, true]]) : {};
  assert(
    "W8.3 tracing cannot gate Unit 1",
    !evaluateUnitMastery(wave8Bundle, w8u1, w8u1Exercises, { ...throughWave7, ...shinTraceOnly }).mastered,
  );
  const w8u1Mastered = masterRequired(wave8Bundle, w8u1, w8u1Exercises, throughWave7);
  const w8u1ok = evaluateUnitMastery(wave8Bundle, w8u1, w8u1Exercises, w8u1Mastered);
  assert("W8.3 Unit 1 masters with sound + fatha", w8u1ok.mastered, w8u1ok.blockers.join("; "));
  assert(
    "W8.3 presentation attempts remain 0",
    (w8u1Mastered[getPresentationLiveKey("exercise.wave8.presentation.shin").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W8.3 Unit 2 unlocks only after Unit 1 mastery",
    !evaluateUnitUnlock(wave8Bundle, wave8Units, w8u2, throughWave7, lookupPrereqW8).unlocked &&
      evaluateUnitUnlock(wave8Bundle, wave8Units, w8u2, w8u1Mastered, lookupPrereqW8).unlocked,
  );

  const w8u2Required = requiredRefsForUnit(wave8Bundle, w8u2, w8u2Exercises);
  const shinFormIdx = w8u2Exercises.findIndex((row) => row.id === "exercise.wave8.letter_forms.shin_initial");
  const sinFinalIdx = w8u2Exercises.findIndex((row) => row.id === "exercise.wave8.letter_forms.sin_final");
  const shamsAudioIdx = w8u2Exercises.findIndex((row) => row.id === "exercise.wave8.audio_to_word.shams");
  const shamsPictureIdx = w8u2Exercises.findIndex((row) => row.id === "exercise.wave8.word_to_picture.shams");
  const shamsAudio = w8u2Exercises[shamsAudioIdx];
  const shamsPicture = w8u2Exercises[shamsPictureIdx];
  const shamsChoices = (shamsAudio?.choices ?? []).map((choice) => choice.id);
  assert("W8.4 initial شـ occurs before شَمْس", shinFormIdx >= 0 && shamsAudioIdx > shinFormIdx);
  assert("W8.4 final ـس occurs before شَمْس", sinFinalIdx >= 0 && shamsAudioIdx > sinFinalIdx);
  assert(
    "W8.4 first شَمْس evidence is audio_to_word",
    shamsAudio?.type === "audio_to_word" &&
      shamsChoices.includes("word.shams") &&
      shamsChoices.includes("word.qamar") &&
      shamsChoices.includes("word.samak"),
  );
  assert(
    "W8.4 Unit 2 requires initial shin, final sin, and word:shams.decoding",
    w8u2Required.some((ref) => ref.liveKey === "letter:shin.form.initial") &&
      w8u2Required.some((ref) => ref.liveKey === "letter:sin.form.final") &&
      w8u2Required.some((ref) => ref.liveKey === "word:shams.decoding") &&
      !w8u2Required.some((ref) => ref.liveKey === "word:qamar.review") &&
      !w8u2Required.some((ref) => ref.liveKey === "word:qamar.review.wave8") &&
      !w8u2Required.some((ref) => ref.liveKey === "word:qamar.decoding"),
    w8u2Required.map((ref) => ref.liveKey).join(", "),
  );
  const sinInitialOnly = itemsFrom(
    [getLetterFormLiveKey({ letterLegacyId: "sin", form: "initial" })].map((keyed) => ({
      portableMasteryId: "probe.sin.form.initial",
      skillId: "skill.letter_forms.positional",
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    })),
    [[true, true, true]],
  );
  const w8u2WithoutFinalSin = masterRequired(
    wave8Bundle,
    w8u2,
    w8u2Exercises.filter((row) => row.id !== "exercise.wave8.letter_forms.sin_final"),
    { ...w8u1Mastered, ...sinInitialOnly },
  );
  assert(
    "W8.4 old sin initial mastery cannot substitute for final-s form evidence",
    !evaluateUnitMastery(wave8Bundle, w8u2, w8u2Exercises, w8u2WithoutFinalSin).mastered,
  );
  const pictureOnlyShams = shamsPicture ? activitySeen(shamsPicture) : {};
  assert(
    "W8.4 picture cannot pass Unit 2",
    !evaluateUnitMastery(wave8Bundle, w8u2, w8u2Exercises, { ...w8u1Mastered, ...pictureOnlyShams }).mastered,
  );
  assert("W8.4 no required review exercise", w8u2Exercises.every((row) => !row.tags?.includes("review") && !row.tags?.includes("review-wave8")));
  const w8u2Mastered = masterRequired(wave8Bundle, w8u2, w8u2Exercises, w8u1Mastered);
  const w8u2ok = evaluateUnitMastery(wave8Bundle, w8u2, w8u2Exercises, w8u2Mastered);
  assert("W8.4 Unit 2 masters with forms + shams decoding", w8u2ok.mastered, w8u2ok.blockers.join("; "));
  assert(
    "W8.4 completing Wave 8 does not write a review key",
    !w8u2Mastered["word:qamar.review.wave8"] &&
      w8u2Mastered["word:qamar.review"] === throughWave7["word:qamar.review"],
  );

  const allW8Keys = [...w8u1Required, ...w8u2Required].map((ref) => ref.liveKey);
  assert("W8.5 no new sukun live key", !allW8Keys.some((key) => key.includes("sukun")));
  assert("W8.5 no new closed-chunk live key", !allW8Keys.some((key) => key.includes(".closed") || key.includes("chunk")));
  assert("W8.5 no س/ش discrimination live key", !allW8Keys.some((key) => key.includes("sin_shin") || key.includes("discrimination")));
  assert("W8.5 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-10"));
  assert("W8.5 Waves 10–14 are registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE10_SLUG") && resolveLearnSrcEarly.includes("WAVE11_SLUG") && resolveLearnSrcEarly.includes("WAVE12_SLUG") && resolveLearnSrcEarly.includes("WAVE13_SLUG") && resolveLearnSrcEarly.includes("getWave13Bundle") && resolveLearnSrcEarly.includes("WAVE14_SLUG") && resolveLearnSrcEarly.includes("getWave14Bundle") && resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));

  const shamsWord = wave8Bundle.words.find((row) => row.id === "word.shams");
  assert("word.shams maps to sky-1", shamsWord?.legacyId === "sky-1");
  assert("word.shams is Band A", shamsWord?.vocabBand === "A" && shamsWord.subBand === "A1" && shamsWord.lemma === "شمس" && shamsWord.teachingForm === "شَمْس");
  assert("W8.6 Wave 7 final unit id is unchanged", w7u2.id === "unit.literacy.wave7.samak");
  assert("W8.6 Wave 1–7 mastery still holds after Wave 8 load", w7u2ok.mastered && w6u3ok.mastered && w5u3ok.mastered);
  const frozenPriorWavesW8 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("wave-8") && !src.includes("wave8") && !src.includes("path.literacy.wave8");
  });
  assert("W8.6 Waves 1–7 lesson JSON stay free of Wave 8 ids", frozenPriorWavesW8);
  assert("W8.6 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));

  const w8Report = readFileSync(join(root, "docs/literacy-wave-8-report.md"), "utf8");
  assert("W8 report exists and postpones Wave 9", /Wave 9 is not implemented/i.test(w8Report));

  const wave9Bundle = asCurriculumBundle(JSON.parse(readFileSync(wave9Path, "utf8")));
  const wave9PathRow = wave9Bundle.paths?.find((row) => row.id === WAVE9_PATH_ID);
  if (!wave9PathRow) throw new Error("Wave 9 path missing");
  const wave9ById = new Map((wave9Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave9Units = wave9PathRow.unitIds.flatMap((id) => {
    const unit = wave9ById.get(id);
    return unit ? [unit] : [];
  });
  const w9u1 = wave9Units[0];
  const w9u2 = wave9Units[1];
  if (!w9u1 || !w9u2) throw new Error("Wave 9 units 1–2 missing");
  assert("Wave 9 declares exactly two units", wave9Units.length === 2);
  assert("Wave 9 Unit 1 prereq is Wave 8 final unit", w9u1.prereqUnitIds?.[0] === "unit.literacy.wave8.shams");
  assert("Wave 9 has no third unit", wave9Units[2] === undefined);

  const lookupPrereqW9 = (id: string) => {
    const w1 = bundle.units?.find((row) => row.id === id);
    if (w1) return { bundle, unit: w1 };
    const w2 = wave2Bundle.units?.find((row) => row.id === id);
    if (w2) return { bundle: wave2Bundle, unit: w2 };
    const w3 = wave3Bundle.units?.find((row) => row.id === id);
    if (w3) return { bundle: wave3Bundle, unit: w3 };
    const w4 = wave4Bundle.units?.find((row) => row.id === id);
    if (w4) return { bundle: wave4Bundle, unit: w4 };
    const w5 = wave5Bundle.units?.find((row) => row.id === id);
    if (w5) return { bundle: wave5Bundle, unit: w5 };
    const w6 = wave6Bundle.units?.find((row) => row.id === id);
    if (w6) return { bundle: wave6Bundle, unit: w6 };
    const w7 = wave7Bundle.units?.find((row) => row.id === id);
    if (w7) return { bundle: wave7Bundle, unit: w7 };
    const w8 = wave8Bundle.units?.find((row) => row.id === id);
    if (w8) return { bundle: wave8Bundle, unit: w8 };
    const w9 = wave9Bundle.units?.find((row) => row.id === id);
    if (w9) return { bundle: wave9Bundle, unit: w9 };
    return undefined;
  };

  const w9u1Exercises = exercisesForUnit(wave9Bundle, w9u1);
  const w9u2Exercises = exercisesForUnit(wave9Bundle, w9u2);
  const throughWave8 = w8u2Mastered;

  assert(
    "W9.1 Wave 9 locked before Wave 8 final mastery",
    !evaluateUnitUnlock(wave9Bundle, wave9Units, w9u1, w8u1Mastered, lookupPrereqW9).unlocked,
  );
  const w9u1Unlock = evaluateUnitUnlock(wave9Bundle, wave9Units, w9u1, throughWave8, lookupPrereqW9);
  assert("W9.2 Wave 9 Unit 1 unlocks after Wave 8 mastery", w9u1Unlock.unlocked, w9u1Unlock.blockers.join("; "));
  assert(
    "W9.2 Unit 2 stays locked until Unit 1",
    !evaluateUnitUnlock(wave9Bundle, wave9Units, w9u2, throughWave8, lookupPrereqW9).unlocked,
  );

  const ainDemo = w9u1Exercises.find((row) => row.id === "exercise.wave9.presentation.ain");
  const ainFathaDemo = w9u1Exercises.find((row) => row.id === "exercise.wave9.presentation.ain_fatha");
  const ainTrace = w9u1Exercises.find((row) => row.id === "exercise.wave9.tracing.ain");
  assert(
    "W9.3 Unit 1 SHOWs ع then عَ before scored beats",
    w9u1Exercises[0]?.id === "exercise.wave9.presentation.ain" &&
      w9u1Exercises[1]?.id === "exercise.wave9.presentation.ain_fatha",
  );
  assert("W9.3 presentations have no mastery targets", (ainDemo?.masteryTargets ?? []).length === 0 && (ainFathaDemo?.masteryTargets ?? []).length === 0);
  const w9u1Required = requiredRefsForUnit(wave9Bundle, w9u1, w9u1Exercises);
  assert(
    "W9.3 Unit 1 requires ain sound and ain fatha",
    w9u1Required.some((ref) => ref.liveKey === "letter:ain.sound") &&
      w9u1Required.some((ref) => ref.liveKey === "letter:ain.fatha") &&
      !w9u1Required.some((ref) => ref.liveKey === "letter:ain.tracing") &&
      !w9u1Required.some((ref) => ref.liveKey.includes("intro")),
    w9u1Required.map((ref) => ref.liveKey).join(", "),
  );
  const ainDemosSeen = { ...activitySeen(ainDemo!), ...activitySeen(ainFathaDemo!) };
  assert(
    "W9.3 presentations alone cannot pass Unit 1",
    !evaluateUnitMastery(wave9Bundle, w9u1, w9u1Exercises, ainDemosSeen).mastered,
  );
  const ainTraceOnly = ainTrace ? itemsFrom([liveRefForTarget(wave9Bundle, ainTrace.masteryTargets![0]!, ainTrace)], [[true, true, true]]) : {};
  assert(
    "W9.3 tracing cannot gate Unit 1",
    !evaluateUnitMastery(wave9Bundle, w9u1, w9u1Exercises, { ...throughWave8, ...ainTraceOnly }).mastered,
  );
  const w9u1Mastered = masterRequired(wave9Bundle, w9u1, w9u1Exercises, throughWave8);
  const w9u1ok = evaluateUnitMastery(wave9Bundle, w9u1, w9u1Exercises, w9u1Mastered);
  assert("W9.3 Unit 1 masters with sound + fatha", w9u1ok.mastered, w9u1ok.blockers.join("; "));
  assert(
    "W9.3 presentation attempts remain 0",
    (w9u1Mastered[getPresentationLiveKey("exercise.wave9.presentation.ain").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W9.3 Unit 2 unlocks only after Unit 1 mastery",
    !evaluateUnitUnlock(wave9Bundle, wave9Units, w9u2, throughWave8, lookupPrereqW9).unlocked &&
      evaluateUnitUnlock(wave9Bundle, wave9Units, w9u2, w9u1Mastered, lookupPrereqW9).unlocked,
  );

  const w9u2Required = requiredRefsForUnit(wave9Bundle, w9u2, w9u2Exercises);
  const ainFormIdx = w9u2Exercises.findIndex((row) => row.id === "exercise.wave9.letter_forms.ain_initial");
  const sinMedialIdx = w9u2Exercises.findIndex((row) => row.id === "exercise.wave9.letter_forms.sin_medial");
  const lamFinalIdx = w9u2Exercises.findIndex((row) => row.id === "exercise.wave9.letter_forms.lam_final");
  const asalAudioIdx = w9u2Exercises.findIndex((row) => row.id === "exercise.wave9.audio_to_word.asal");
  const asalPictureIdx = w9u2Exercises.findIndex((row) => row.id === "exercise.wave9.word_to_picture.asal");
  const asalAudio = w9u2Exercises[asalAudioIdx];
  const asalPicture = w9u2Exercises[asalPictureIdx];
  const asalChoices = (asalAudio?.choices ?? []).map((choice) => choice.id);
  assert("W9.4 initial عـ occurs before عَسَل", ainFormIdx >= 0 && asalAudioIdx > ainFormIdx);
  assert("W9.4 medial ـسـ occurs before عَسَل", sinMedialIdx >= 0 && asalAudioIdx > sinMedialIdx);
  assert("W9.4 final ـل occurs before عَسَل because it was never previously scored", lamFinalIdx >= 0 && asalAudioIdx > lamFinalIdx);
  assert(
    "W9.4 first عَسَل evidence is audio_to_word",
    asalAudio?.type === "audio_to_word" &&
      asalChoices.includes("word.asal") &&
      asalChoices.includes("word.samak") &&
      asalChoices.includes("word.jamal"),
  );
  assert(
    "W9.4 Unit 2 requires ain initial, sin medial, lam final, and word:asal.decoding",
    w9u2Required.some((ref) => ref.liveKey === "letter:ain.form.initial") &&
      w9u2Required.some((ref) => ref.liveKey === "letter:sin.form.medial") &&
      w9u2Required.some((ref) => ref.liveKey === "letter:lam.form.final") &&
      w9u2Required.some((ref) => ref.liveKey === "word:asal.decoding") &&
      !w9u2Required.some((ref) => ref.liveKey.includes("review.wave9")) &&
      !w9u2Required.some((ref) => ref.liveKey === "word:jamal.review"),
    w9u2Required.map((ref) => ref.liveKey).join(", "),
  );
  const lamMedialOnly = itemsFrom(
    [getLetterFormLiveKey({ letterLegacyId: "lam", form: "medial" })].map((keyed) => ({
      portableMasteryId: "probe.lam.form.medial",
      skillId: "skill.letter_forms.positional",
      type: keyed.type,
      id: keyed.id,
      liveKey: keyed.liveKey,
    })),
    [[true, true, true]],
  );
  const w9u2WithoutFinalLam = masterRequired(
    wave9Bundle,
    w9u2,
    w9u2Exercises.filter((row) => row.id !== "exercise.wave9.letter_forms.lam_final"),
    { ...w9u1Mastered, ...lamMedialOnly },
  );
  assert(
    "W9.4 historical medial-lam mastery cannot substitute for final-l form evidence",
    !evaluateUnitMastery(wave9Bundle, w9u2, w9u2Exercises, w9u2WithoutFinalLam).mastered,
  );
  const pictureOnlyAsal = asalPicture ? activitySeen(asalPicture) : {};
  assert(
    "W9.4 picture cannot pass Unit 2",
    !evaluateUnitMastery(wave9Bundle, w9u2, w9u2Exercises, { ...w9u1Mastered, ...pictureOnlyAsal }).mastered,
  );
  assert("W9.4 no required review exercise", w9u2Exercises.every((row) => !row.tags?.includes("review") && !row.tags?.includes("review-wave9")));
  const w9u2Mastered = masterRequired(wave9Bundle, w9u2, w9u2Exercises, w9u1Mastered);
  const w9u2ok = evaluateUnitMastery(wave9Bundle, w9u2, w9u2Exercises, w9u2Mastered);
  assert("W9.4 Unit 2 masters with forms + asal decoding", w9u2ok.mastered, w9u2ok.blockers.join("; "));
  assert("W9.4 completing Wave 9 does not write a review key", !w9u2Mastered["word:jamal.review.wave9"] && !Object.keys(w9u2Mastered).some((key) => key.includes("review.wave9")));

  const allW9Keys = [...w9u1Required, ...w9u2Required].map((ref) => ref.liveKey);
  assert("W9.5 no new sukun live key", !allW9Keys.some((key) => key.includes("sukun")));
  assert("W9.5 no new closed-chunk live key", !allW9Keys.some((key) => key.includes(".closed") || key.includes("chunk")));
  assert("W9.5 no new madd live key", !allW9Keys.some((key) => key.includes("madd") || key.includes("long")));
  assert("W9.5 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-10"));
  assert("W9.5 Waves 10–14 are registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE10_SLUG") && resolveLearnSrcEarly.includes("WAVE11_SLUG") && resolveLearnSrcEarly.includes("WAVE12_SLUG") && resolveLearnSrcEarly.includes("WAVE13_SLUG") && resolveLearnSrcEarly.includes("getWave13Bundle") && resolveLearnSrcEarly.includes("WAVE14_SLUG") && resolveLearnSrcEarly.includes("getWave14Bundle") && resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));

  const asalWord = wave9Bundle.words.find((row) => row.id === "word.asal");
  assert("word.asal maps to food-19", asalWord?.legacyId === "food-19");
  assert("word.asal is Band A", asalWord?.vocabBand === "A" && asalWord.subBand === "A1" && asalWord.lemma === "عسل" && asalWord.teachingForm === "عَسَل");
  assert("W9.6 Wave 8 final unit id is unchanged", w8u2.id === "unit.literacy.wave8.shams");
  assert("W9.6 Wave 1–8 mastery still holds after Wave 9 load", w8u2ok.mastered && w7u2ok.mastered && w6u3ok.mastered);
  const frozenPriorWavesW9 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("wave-9") && !src.includes("wave9") && !src.includes("path.literacy.wave9");
  });
  assert("W9.6 Waves 1–8 lesson JSON stay free of Wave 9 ids", frozenPriorWavesW9);
  assert("W9.6 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));

  const w9Report = readFileSync(join(root, "docs/literacy-wave-9-report.md"), "utf8");
  assert("W9 report exists and postpones Wave 10 / madd", /Wave 10 is not implemented/i.test(w9Report) && /madd-alif/i.test(w9Report));

  const wave10Bundle = asCurriculumBundle(JSON.parse(readFileSync(wave10Path, "utf8")));
  const wave10PathRow = wave10Bundle.paths?.find((row) => row.id === WAVE10_PATH_ID);
  if (!wave10PathRow) throw new Error("Wave 10 path missing");
  const wave10ById = new Map((wave10Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave10Units = wave10PathRow.unitIds.flatMap((id) => {
    const unit = wave10ById.get(id);
    return unit ? [unit] : [];
  });
  const w10u1 = wave10Units[0];
  const w10u2 = wave10Units[1];
  if (!w10u1 || !w10u2) throw new Error("Wave 10 units 1–2 missing");
  assert("Wave 10 declares exactly two units", wave10Units.length === 2);
  assert("Wave 10 Unit 1 prereq is Wave 9 final unit", w10u1.prereqUnitIds?.[0] === "unit.literacy.wave9.asal");
  assert("Wave 10 has no third unit", wave10Units[2] === undefined);

  const lookupPrereqW10 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w9 = wave9Bundle.units?.find((row) => row.id === id);
    if (w9) return { bundle: wave9Bundle, unit: w9 };
    const w10 = wave10Bundle.units?.find((row) => row.id === id);
    if (w10) return { bundle: wave10Bundle, unit: w10 };
    return lookupPrereqW9(id);
  };

  const w10u1Exercises = exercisesForUnit(wave10Bundle, w10u1);
  const w10u2Exercises = exercisesForUnit(wave10Bundle, w10u2);
  const throughWave9 = w9u2Mastered;

  assert(
    "W10.1 Wave 10 locked before Wave 9 final mastery",
    !evaluateUnitUnlock(wave10Bundle, wave10Units, w10u1, w9u1Mastered, lookupPrereqW10).unlocked,
  );
  const w10u1Unlock = evaluateUnitUnlock(wave10Bundle, wave10Units, w10u1, throughWave9, lookupPrereqW10);
  assert("W10.2 Wave 10 Unit 1 unlocks after Wave 9 mastery", w10u1Unlock.unlocked, w10u1Unlock.blockers.join("; "));
  assert(
    "W10.2 Unit 2 stays locked until Unit 1",
    !evaluateUnitUnlock(wave10Bundle, wave10Units, w10u2, throughWave9, lookupPrereqW10).unlocked,
  );

  const baShow = w10u1Exercises.find((row) => row.id === "exercise.wave10.presentation.ba_fatha");
  const baaShow = w10u1Exercises.find((row) => row.id === "exercise.wave10.presentation.ba_madd_alif");
  assert(
    "W10.3 Unit 1 SHOWs بَ then بَا before scored beats",
    w10u1Exercises[0]?.id === "exercise.wave10.presentation.ba_fatha" &&
      w10u1Exercises[1]?.id === "exercise.wave10.presentation.ba_madd_alif",
  );
  assert("W10.3 presentations have no mastery targets", (baShow?.masteryTargets ?? []).length === 0 && (baaShow?.masteryTargets ?? []).length === 0);

  const w10u1Required = requiredRefsForUnit(wave10Bundle, w10u1, w10u1Exercises);
  assert(
    "W10.3 Unit 1 requires letter:ba.madd_alif only",
    w10u1Required.length === 1 && w10u1Required[0]?.liveKey === "letter:ba.madd_alif",
    w10u1Required.map((ref) => ref.liveKey).join(", "),
  );
  const maddSyllable = wave10Bundle.syllables?.find((row) => row.id === "syllable.ba.madd_alif");
  assert("W10.3 بَا is CVV", maddSyllable?.pattern === "CVV" && maddSyllable.vowelSkillId === "skill.long_vowel.madd");
  const maddExercise = w10u1Exercises.find((row) => row.id === "exercise.wave10.syllable_blending.ba_madd_alif");
  const maddLive = maddExercise?.masteryTargets?.[0]
    ? liveRefForTarget(wave10Bundle, maddExercise.masteryTargets[0], maddExercise)
    : undefined;
  assert("W10.3 live key is letter:ba.madd_alif", maddLive?.liveKey === "letter:ba.madd_alif");
  assert("W10.3 CVV does not generate a closed-chunk live key", maddLive?.liveKey === "letter:ba.madd_alif" && !maddLive.liveKey.endsWith(".closed"));
  assert(
    "W10.3 getSyllableLiveKey madd facet matches",
    getSyllableLiveKey({ letterLegacyId: "ba", vowelSkillId: "skill.long_vowel.madd" }).liveKey === "letter:ba.madd_alif",
  );

  const baFathaOnly = { ...throughWave9 };
  assert(
    "W10.3 historical letter:ba.fatha cannot pass Unit 1",
    Boolean(baFathaOnly["letter:ba.fatha"]) &&
      !evaluateUnitMastery(wave10Bundle, w10u1, w10u1Exercises, baFathaOnly).mastered,
  );
  const maddDemosSeen = {
    ...throughWave9,
    ...seenItems(w10u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert(
    "W10.3 presentations alone cannot pass Unit 1",
    !evaluateUnitMastery(wave10Bundle, w10u1, w10u1Exercises, maddDemosSeen).mastered,
  );
  const w10u1Mastered = masterRequired(wave10Bundle, w10u1, w10u1Exercises, throughWave9);
  const w10u1ok = evaluateUnitMastery(wave10Bundle, w10u1, w10u1Exercises, w10u1Mastered);
  assert("W10.3 Unit 1 masters with letter:ba.madd_alif", w10u1ok.mastered, w10u1ok.blockers.join("; "));
  assert(
    "W10.3 presentation attempts remain 0",
    (w10u1Mastered[getPresentationLiveKey("exercise.wave10.presentation.ba_fatha").liveKey]?.attempts ?? 0) === 0 &&
      (w10u1Mastered[getPresentationLiveKey("exercise.wave10.presentation.ba_madd_alif").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W10.3 Unit 2 unlocks only after Unit 1 mastery",
    !evaluateUnitUnlock(wave10Bundle, wave10Units, w10u2, throughWave9, lookupPrereqW10).unlocked &&
      evaluateUnitUnlock(wave10Bundle, wave10Units, w10u2, w10u1Mastered, lookupPrereqW10).unlocked,
  );

  const w10u2Required = requiredRefsForUnit(wave10Bundle, w10u2, w10u2Exercises);
  const composeIdx = w10u2Exercises.findIndex((row) => row.id === "exercise.wave10.presentation.bab_compose");
  const babAudioIdx = w10u2Exercises.findIndex((row) => row.id === "exercise.wave10.audio_to_word.bab");
  const babPictureIdx = w10u2Exercises.findIndex((row) => row.id === "exercise.wave10.word_to_picture.bab");
  assert("W10.4 compose chunk occurs before بَاب", composeIdx >= 0 && babAudioIdx > composeIdx);
  assert(
    "W10.4 first بَاب evidence is audio_to_word",
    w10u2Exercises[babAudioIdx]?.type === "audio_to_word" &&
      w10u2Exercises[babAudioIdx]?.success.correctChoiceId === "word.bab",
  );
  assert(
    "W10.4 Unit 2 requires word:bab.decoding only",
    w10u2Required.length === 1 && w10u2Required[0]?.liveKey === "word:bab.decoding",
    w10u2Required.map((ref) => ref.liveKey).join(", "),
  );
  assert("W10.4 no required review key", !w10u2Required.some((ref) => ref.liveKey.includes("review")));
  assert("W10.4 no positional-form evidence required", !w10u2Required.some((ref) => ref.liveKey.includes(".form.")));

  const composeOnly = {
    ...w10u1Mastered,
    ...seenItems(w10u2Exercises.filter((row) => row.id === "exercise.wave10.presentation.bab_compose")),
  };
  assert(
    "W10.4 composition chunk cannot pass Unit 2",
    !evaluateUnitMastery(wave10Bundle, w10u2, w10u2Exercises, composeOnly).mastered,
  );
  const pictureEx = w10u2Exercises.find((row) => row.id === "exercise.wave10.word_to_picture.bab");
  const pictureOnlyBab = pictureEx ? activitySeen(pictureEx) : {};
  assert(
    "W10.4 picture cannot pass Unit 2",
    !evaluateUnitMastery(wave10Bundle, w10u2, w10u2Exercises, { ...w10u1Mastered, ...pictureOnlyBab }).mastered,
  );
  assert("W10.4 no required review exercise", w10u2Exercises.every((row) => !row.tags?.includes("review") && !row.tags?.includes("review-wave10")));
  const w10u2Mastered = masterRequired(wave10Bundle, w10u2, w10u2Exercises, w10u1Mastered);
  const w10u2ok = evaluateUnitMastery(wave10Bundle, w10u2, w10u2Exercises, w10u2Mastered);
  assert("W10.4 Unit 2 masters with word:bab.decoding", w10u2ok.mastered, w10u2ok.blockers.join("; "));

  const allW10Keys = [...w10u1Required, ...w10u2Required].map((ref) => ref.liveKey);
  assert("W10.5 no letter:alif.sound", !allW10Keys.includes("letter:alif.sound") && !Object.keys(w10u2Mastered).includes("letter:alif.sound"));
  assert("W10.5 no hamza key", !allW10Keys.some((key) => key.includes("hamza")) && !Object.keys(w10u2Mastered).some((key) => key.includes("hamza")));
  assert("W10.5 no kasra/damma key", !allW10Keys.some((key) => key.includes("kasra") || key.includes("damma")));
  assert("W10.5 no ū/ī key", !allW10Keys.some((key) => key.includes("madd_waw") || key.includes("madd_ya") || key.includes("long_waw") || key.includes("long_ya")));
  assert("W10.5 no new closed-chunk key", !allW10Keys.some((key) => key.endsWith(".closed")));
  assert("W10.5 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-11"));
  assert("W10.5 Waves 10–14 are registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE10_SLUG") && resolveLearnSrcEarly.includes("WAVE11_SLUG") && resolveLearnSrcEarly.includes("WAVE12_SLUG") && resolveLearnSrcEarly.includes("WAVE13_SLUG") && resolveLearnSrcEarly.includes("getWave13Bundle") && resolveLearnSrcEarly.includes("WAVE14_SLUG") && resolveLearnSrcEarly.includes("getWave14Bundle") && resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));

  const babWord = wave10Bundle.words.find((row) => row.id === "word.bab");
  assert("word.bab maps to home-2", babWord?.legacyId === "home-2");
  assert("word.bab is Band A", babWord?.vocabBand === "A" && babWord.subBand === "A1" && babWord.lemma === "باب" && babWord.teachingForm === "بَاب");
  assert("W10.6 Wave 9 final unit id is unchanged", w9u2.id === "unit.literacy.wave9.asal");
  assert("W10.6 Wave 1–9 mastery still holds after Wave 10 load", w9u2ok.mastered && w8u2ok.mastered && w7u2ok.mastered);
  const frozenPriorWavesW10 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("wave-10") && !src.includes("wave10") && !src.includes("path.literacy.wave10");
  });
  assert("W10.6 Waves 1–9 lesson JSON stay free of Wave 10 ids", frozenPriorWavesW10);
  assert("W10.6 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));

  const w10Report = readFileSync(join(root, "docs/literacy-wave-10-report.md"), "utf8");
  assert("W10 report exists and documents madd-alif", /madd-alif/i.test(w10Report) && w10Report.includes("بَاب"));

  const wave11Raw = JSON.parse(readFileSync(wave11Path, "utf8"));
  const wave11Validation = validateCurriculum(wave11Raw);
  assert("Wave 11 production JSON validates", wave11Validation.ok, wave11Validation.issues.map((issue) => issue.message).join("; "));
  const wave11Bundle = asCurriculumBundle(wave11Raw);
  const wave11PathRow = wave11Bundle.paths?.find((row) => row.id === WAVE11_PATH_ID);
  if (!wave11PathRow) throw new Error("Wave 11 path missing");
  const wave11ById = new Map((wave11Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave11Units = wave11PathRow.unitIds.flatMap((id) => {
    const unit = wave11ById.get(id);
    return unit ? [unit] : [];
  });
  const w11u1 = wave11Units[0];
  const w11u2 = wave11Units[1];
  if (!w11u1 || !w11u2) throw new Error("Wave 11 units 1–2 missing");
  assert("Wave 11 declares exactly two units", wave11Units.length === 2);
  assert("Wave 11 Unit 1 prereq is Wave 10 final unit", w11u1.prereqUnitIds?.[0] === "unit.literacy.wave10.bab");
  assert("Wave 11 has no third unit", wave11Units[2] === undefined);
  assert("Wave 11 child titles avoid الدَّجَاج", w11u1.titleAr === "جَا" && w11u2.titleAr === "دَجَاج" && w11u2.childGoalAr === "دَجَاج");

  const lookupPrereqW11 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w11 = wave11Bundle.units?.find((row) => row.id === id);
    if (w11) return { bundle: wave11Bundle, unit: w11 };
    const w10 = wave10Bundle.units?.find((row) => row.id === id);
    if (w10) return { bundle: wave10Bundle, unit: w10 };
    return lookupPrereqW10(id);
  };

  const w11u1Exercises = exercisesForUnit(wave11Bundle, w11u1);
  const w11u2Exercises = exercisesForUnit(wave11Bundle, w11u2);
  const throughWave10 = w10u2Mastered;

  assert(
    "W11.1 Wave 11 locked before Wave 10 final mastery",
    !evaluateUnitUnlock(wave11Bundle, wave11Units, w11u1, w10u1Mastered, lookupPrereqW11).unlocked,
  );
  const w11u1Unlock = evaluateUnitUnlock(wave11Bundle, wave11Units, w11u1, throughWave10, lookupPrereqW11);
  assert("W11.2 Wave 11 Unit 1 unlocks after Wave 10 mastery", w11u1Unlock.unlocked, w11u1Unlock.blockers.join("; "));
  assert(
    "W11.2 Unit 2 stays locked until Unit 1",
    !evaluateUnitUnlock(wave11Bundle, wave11Units, w11u2, throughWave10, lookupPrereqW11).unlocked,
  );
  assert("W11.2 renderers ready", unitRenderersReady(w11u1Exercises) && unitRenderersReady(w11u2Exercises));

  const w11FormEx = w11u1Exercises.find((row) => row.id === "exercise.wave11.letter_forms.jim_initial");
  const w11JaaShow = w11u1Exercises.find((row) => row.id === "exercise.wave11.presentation.jim_madd_alif");
  const w11JaaScore = w11u1Exercises.find((row) => row.id === "exercise.wave11.syllable_blending.jim_madd_alif");
  assert(
    "W11.3 Unit 1 order is SHOW جَا then form then scored جَا",
    w11u1Exercises[0]?.id === "exercise.wave11.presentation.jim_madd_alif" &&
      w11u1Exercises[1]?.id === "exercise.wave11.letter_forms.jim_initial" &&
      w11u1Exercises[2]?.id === "exercise.wave11.syllable_blending.jim_madd_alif",
  );
  const w11LiveStart = scheduleLesson(wave11Bundle, w11u1, w11u1Exercises, throughWave10);
  assert(
    "W11.3 live first beat is unscored جَا transfer",
    w11u1Exercises[w11LiveStart.index]?.id === "exercise.wave11.presentation.jim_madd_alif",
  );
  const w11AfterDemo = scheduleLesson(
    wave11Bundle,
    w11u1,
    w11u1Exercises,
    { ...throughWave10, ...seenItems(w11u1Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w11LiveStart.index },
  );
  assert(
    "W11.3 live first scored beat is initial جـ",
    w11u1Exercises[w11AfterDemo.index]?.id === "exercise.wave11.letter_forms.jim_initial",
  );
  const w11FormResolved = w11FormEx ? resolveLetterRecognition(wave11Bundle, w11FormEx) : undefined;
  assert("W11.3 scored form prompt is initial جـ", w11FormResolved?.targetForm === "initial" && w11FormResolved.promptGlyph === "جـ");
  assert("W11.3 scored form is not medial ـجـ", w11FormResolved?.promptGlyph !== "ـجـ");
  assert("W11.3 presentations have no mastery targets", (w11JaaShow?.masteryTargets ?? []).length === 0);
  assert(
    "W11.3 SHOW chunk is جَ + ا → جَا",
    w11JaaShow?.config?.["show"] === "chunk" &&
      w11JaaShow.config?.["left"] === "جَ" &&
      w11JaaShow.config?.["right"] === "ا" &&
      w11JaaShow.config?.["result"] === "جَا",
  );

  const w11u1Required = requiredRefsForUnit(wave11Bundle, w11u1, w11u1Exercises);
  const w11u1Keys = w11u1Required.map((ref) => ref.liveKey).sort();
  assert(
    "W11.3 Unit 1 requires letter:jim.form.initial and letter:jim.madd_alif",
    w11u1Keys.join(",") === ["letter:jim.form.initial", "letter:jim.madd_alif"].sort().join(","),
    w11u1Keys.join(", "),
  );
  assert("W11.3 historical letter:ba.madd_alif is not required", !w11u1Keys.includes("letter:ba.madd_alif"));
  assert("W11.3 historical letter:jim.form.medial is not required", !w11u1Keys.includes("letter:jim.form.medial"));
  assert("W11.3 letter:jim.fatha is not required", !w11u1Keys.includes("letter:jim.fatha"));
  assert("W11.3 no final/isolated jim form gate", !w11u1Keys.includes("letter:jim.form.final") && !w11u1Keys.includes("letter:jim.form.isolated"));

  const jimMaddSyllable = wave11Bundle.syllables?.find((row) => row.id === "syllable.jim.madd_alif");
  assert("W11.3 جَا is CVV", jimMaddSyllable?.pattern === "CVV" && jimMaddSyllable.vowelSkillId === "skill.long_vowel.madd" && jimMaddSyllable.text === "جَا");
  const w11MaddLive = w11JaaScore?.masteryTargets?.[0]
    ? liveRefForTarget(wave11Bundle, w11JaaScore.masteryTargets[0], w11JaaScore)
    : undefined;
  assert("W11.3 live key is letter:jim.madd_alif", w11MaddLive?.liveKey === "letter:jim.madd_alif");
  assert("W11.3 CVV does not generate a closed-chunk live key", w11MaddLive?.liveKey === "letter:jim.madd_alif" && !w11MaddLive.liveKey.endsWith(".closed"));
  assert(
    "W11.3 generic getSyllableLiveKey produces letter:jim.madd_alif",
    getSyllableLiveKey({ letterLegacyId: "jim", vowelSkillId: "skill.long_vowel.madd" }).liveKey === "letter:jim.madd_alif",
  );
  assert(
    "W11.3 generic getLetterFormLiveKey produces letter:jim.form.initial",
    getLetterFormLiveKey({ letterLegacyId: "jim", form: "initial" }).liveKey === "letter:jim.form.initial",
  );
  const w11UnitMasterySrc = readFileSync(join(root, "src/lib/curriculum/unitMastery.ts"), "utf8");
  const w11SyllableAdapterSrc = readFileSync(join(root, "src/lib/curriculum/syllableAdapter.ts"), "utf8");
  assert(
    "W11.3 engine has no ba/jim/wave11 special-case",
    !w11UnitMasterySrc.includes('letterLegacyId === "ba"') &&
      !w11UnitMasterySrc.includes('letterLegacyId === "jim"') &&
      !w11UnitMasterySrc.includes("wave11") &&
      !w11UnitMasterySrc.includes("wave-11") &&
      !w11SyllableAdapterSrc.includes("letter.ba") &&
      !w11SyllableAdapterSrc.includes("letter.jim"),
  );

  const w11JaaChoices = (w11JaaScore?.choices ?? []).map((choice) => choice.id);
  assert(
    "W11.3 scored جَا foils are جَ and بَا",
    w11JaaChoices.includes("syllable.jim.madd_alif") &&
      w11JaaChoices.includes("syllable.jim.fatha") &&
      w11JaaChoices.includes("syllable.ba.madd_alif"),
  );

  const w11DemosSeen = {
    ...throughWave10,
    ...seenItems(w11u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert(
    "W11.3 presentations alone cannot pass Unit 1",
    !evaluateUnitMastery(wave11Bundle, w11u1, w11u1Exercises, w11DemosSeen).mastered,
  );
  const w11BaMaddOnly = { ...throughWave10 };
  assert(
    "W11.3 historical letter:ba.madd_alif cannot pass Unit 1",
    Boolean(w11BaMaddOnly["letter:ba.madd_alif"]) &&
      !evaluateUnitMastery(wave11Bundle, w11u1, w11u1Exercises, w11BaMaddOnly).mastered,
  );
  const w11MedialOnly = {
    ...throughWave10,
    ...itemsFrom(
      [{ type: "letter", id: "jim.form.medial", liveKey: "letter:jim.form.medial", portableMasteryId: "x", skillId: "skill.letter_forms.positional" }],
      [[true, true, true]],
    ),
  };
  assert(
    "W11.3 historical letter:jim.form.medial cannot pass Unit 1",
    !evaluateUnitMastery(wave11Bundle, w11u1, w11u1Exercises, w11MedialOnly).mastered,
  );
  const w11FormOnlyRefs = w11u1Required.filter((ref) => ref.liveKey === "letter:jim.form.initial");
  const w11FormOnly = masterRequired(
    { ...wave11Bundle, units: [{ ...w11u1, mastery: { ...w11u1.mastery, requiredSkillIds: ["skill.letter_forms.positional"] } }] },
    { ...w11u1, mastery: { ...w11u1.mastery, requiredSkillIds: ["skill.letter_forms.positional"] } },
    w11u1Exercises,
    throughWave10,
  );
  assert("W11.3 form without madd cannot pass Unit 1", w11FormOnlyRefs.length === 1 && !evaluateUnitMastery(wave11Bundle, w11u1, w11u1Exercises, w11FormOnly).mastered);
  const w11MaddOnly = masterRequired(
    wave11Bundle,
    { ...w11u1, mastery: { ...w11u1.mastery, requiredSkillIds: ["skill.long_vowel.madd"] } },
    w11u1Exercises,
    throughWave10,
  );
  assert("W11.3 madd without form cannot pass Unit 1", !evaluateUnitMastery(wave11Bundle, w11u1, w11u1Exercises, w11MaddOnly).mastered);

  const w11u1Mastered = masterRequired(wave11Bundle, w11u1, w11u1Exercises, throughWave10);
  const w11u1ok = evaluateUnitMastery(wave11Bundle, w11u1, w11u1Exercises, w11u1Mastered);
  assert("W11.3 Unit 1 masters with jim form + jim madd", w11u1ok.mastered, w11u1ok.blockers.join("; "));
  assert(
    "W11.3 presentation attempts remain 0",
    (w11u1Mastered[getPresentationLiveKey("exercise.wave11.presentation.jim_madd_alif").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W11.3 Unit 2 unlocks only after Unit 1 mastery",
    !evaluateUnitUnlock(wave11Bundle, wave11Units, w11u2, throughWave10, lookupPrereqW11).unlocked &&
      evaluateUnitUnlock(wave11Bundle, wave11Units, w11u2, w11u1Mastered, lookupPrereqW11).unlocked,
  );

  const w11u2Required = requiredRefsForUnit(wave11Bundle, w11u2, w11u2Exercises);
  const w11ComposeIdx = w11u2Exercises.findIndex((row) => row.id === "exercise.wave11.presentation.dajaj_compose");
  const dajajAudioIdx = w11u2Exercises.findIndex((row) => row.id === "exercise.wave11.audio_to_word.dajaj");
  const dajajPictureIdx = w11u2Exercises.findIndex((row) => row.id === "exercise.wave11.word_to_picture.dajaj");
  assert("W11.4 compose chunk occurs before دَجَاج", w11ComposeIdx >= 0 && dajajAudioIdx > w11ComposeIdx);
  assert(
    "W11.4 first دَجَاج evidence is audio_to_word",
    w11u2Exercises[dajajAudioIdx]?.type === "audio_to_word" &&
      w11u2Exercises[dajajAudioIdx]?.success.correctChoiceId === "word.dajaj",
  );
  const w11ComposeEx = w11u2Exercises[w11ComposeIdx];
  assert(
    "W11.4 compose is دَ + جَاج → دَجَاج",
    w11ComposeEx?.config?.["left"] === "دَ" && w11ComposeEx.config?.["right"] === "جَاج" && w11ComposeEx.config?.["result"] === "دَجَاج",
  );
  assert(
    "W11.4 Unit 2 requires word:dajaj.decoding only",
    w11u2Required.length === 1 && w11u2Required[0]?.liveKey === "word:dajaj.decoding",
    w11u2Required.map((ref) => ref.liveKey).join(", "),
  );
  assert("W11.4 no required review key", !w11u2Required.some((ref) => ref.liveKey.includes("review")));
  assert("W11.4 no word:laa.decoding", !w11u2Required.some((ref) => ref.liveKey === "word:laa.decoding"));
  const dajajWord = wave11Bundle.words.find((row) => row.id === "word.dajaj");
  const dajajVisual = dajajWord ? prototypeVisualForWord(dajajWord) : undefined;
  assert("word.dajaj maps to food-8", dajajWord?.legacyId === "food-8");
  assert(
    "word.dajaj is Band A دَجَاج",
    dajajWord?.vocabBand === "A" && dajajWord.subBand === "A2" && dajajWord.lemma === "دجاج" && dajajWord.teachingForm === "دَجَاج",
  );
  assert("word.dajaj prototype visual is 🐔", dajajVisual?.kind === "emoji" && dajajVisual.emoji === "🐔");
  const jimForms = (dajajWord?.requiredLetterForms ?? []).filter((row) => row.letterId === "letter.jim").map((row) => row.form);
  assert("W11.4 joining records jim initial + isolated, not medial/final", jimForms.includes("initial") && jimForms.includes("isolated") && !jimForms.includes("medial") && !jimForms.includes("final"));
  assert("W11.4 dal is nonConnecting", wave11Bundle.letters.find((row) => row.id === "letter.dal")?.nonConnecting === true);

  const w11ComposeOnly = {
    ...w11u1Mastered,
    ...seenItems(w11u2Exercises.filter((row) => row.id === "exercise.wave11.presentation.dajaj_compose")),
  };
  assert(
    "W11.4 composition chunk cannot pass Unit 2",
    !evaluateUnitMastery(wave11Bundle, w11u2, w11u2Exercises, w11ComposeOnly).mastered,
  );
  const w11PictureEx = w11u2Exercises.find((row) => row.id === "exercise.wave11.word_to_picture.dajaj");
  const w11PictureOnly = w11PictureEx ? activitySeen(w11PictureEx) : {};
  assert(
    "W11.4 picture cannot pass Unit 2",
    !evaluateUnitMastery(wave11Bundle, w11u2, w11u2Exercises, { ...w11u1Mastered, ...w11PictureOnly }).mastered,
  );
  assert("W11.4 picture is after audio", dajajPictureIdx > dajajAudioIdx);
  assert("W11.4 no required review exercise", w11u2Exercises.every((row) => !row.tags?.includes("review") && !row.tags?.includes("review-wave11")));
  const w11u2Mastered = masterRequired(wave11Bundle, w11u2, w11u2Exercises, w11u1Mastered);
  const w11u2ok = evaluateUnitMastery(wave11Bundle, w11u2, w11u2Exercises, w11u2Mastered);
  assert("W11.4 Unit 2 masters with word:dajaj.decoding", w11u2ok.mastered, w11u2ok.blockers.join("; "));
  assert(
    "W11.4 compose presentation attempts remain 0",
    (w11u2Mastered[getPresentationLiveKey("exercise.wave11.presentation.dajaj_compose").liveKey]?.attempts ?? 0) === 0,
  );

  const allW11Keys = [...w11u1Required, ...w11u2Required].map((ref) => ref.liveKey);
  assert("W11.5 no letter:alif.sound", !allW11Keys.includes("letter:alif.sound"));
  assert("W11.5 no hamza/kasra/damma/ū/ī/closed keys", !allW11Keys.some((key) => key.includes("hamza") || key.includes("kasra") || key.includes("damma") || key.includes("madd_waw") || key.includes("madd_ya") || key.endsWith(".closed")));
  assert("W11.5 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-12"));
  assert("W11.5 Waves 11–14 are registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE11_SLUG") && resolveLearnSrcEarly.includes("getWave11Bundle") && resolveLearnSrcEarly.includes("WAVE12_SLUG") && resolveLearnSrcEarly.includes("getWave12Bundle") && resolveLearnSrcEarly.includes("WAVE13_SLUG") && resolveLearnSrcEarly.includes("getWave13Bundle") && resolveLearnSrcEarly.includes("WAVE14_SLUG") && resolveLearnSrcEarly.includes("getWave14Bundle") && resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));
  assert("W11.5 historical letter:ba.madd_alif remains in Wave 10 progress", Boolean(throughWave10["letter:ba.madd_alif"]));
  assert("W11.6 Wave 10 final unit id is unchanged", w10u2.id === "unit.literacy.wave10.bab");
  assert("W11.6 Wave 1–10 mastery still holds after Wave 11 load", w10u2ok.mastered && w9u2ok.mastered);
  const frozenPriorWavesW11 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path, wave10Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("unit.literacy.wave11") && !src.includes("path.literacy.wave11") && !src.includes("literacy-path.wave-11");
  });
  assert("W11.6 Waves 1–10 lesson JSON stay free of Wave 11 unit/path ids", frozenPriorWavesW11);
  assert("W11.6 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));

  const w11Report = readFileSync(join(root, "docs/literacy-wave-11-report.md"), "utf8");
  assert("W11 report exists and postpones Wave 12", /Wave 12 is not implemented/i.test(w11Report));

  const wave12Raw = JSON.parse(readFileSync(wave12Path, "utf8"));
  const wave12Validation = validateCurriculum(wave12Raw);
  assert("Wave 12 production JSON validates", wave12Validation.ok, wave12Validation.issues.map((issue) => issue.message).join("; "));
  const wave12Bundle = asCurriculumBundle(wave12Raw);
  const wave12PathRow = wave12Bundle.paths?.find((row) => row.id === WAVE12_PATH_ID);
  if (!wave12PathRow) throw new Error("Wave 12 path missing");
  const wave12ById = new Map((wave12Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave12Units = wave12PathRow.unitIds.flatMap((id) => {
    const unit = wave12ById.get(id);
    return unit ? [unit] : [];
  });
  const w12u1 = wave12Units[0];
  const w12u2 = wave12Units[1];
  if (!w12u1 || !w12u2) throw new Error("Wave 12 units 1–2 missing");
  assert("Wave 12 declares exactly two units", wave12Units.length === 2);
  assert("Wave 12 Unit 1 prereq is Wave 11 final unit", w12u1.prereqUnitIds?.[0] === "unit.literacy.wave11.dajaj");
  assert("Wave 12 has no third unit", wave12Units[2] === undefined);
  assert("Wave 12 child titles avoid النار", w12u1.titleAr === "نَ" && w12u2.titleAr === "نَار" && w12u2.childGoalAr === "نَار");

  const lookupPrereqW12 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w12 = wave12Bundle.units?.find((row) => row.id === id);
    if (w12) return { bundle: wave12Bundle, unit: w12 };
    const w11 = wave11Bundle.units?.find((row) => row.id === id);
    if (w11) return { bundle: wave11Bundle, unit: w11 };
    return lookupPrereqW11(id);
  };

  const w12u1Exercises = exercisesForUnit(wave12Bundle, w12u1);
  const w12u2Exercises = exercisesForUnit(wave12Bundle, w12u2);
  const throughWave11 = w11u2Mastered;

  assert(
    "W12.1 Wave 12 locked before Wave 11 final mastery",
    !evaluateUnitUnlock(wave12Bundle, wave12Units, w12u1, w11u1Mastered, lookupPrereqW12).unlocked,
  );
  const w12u1Unlock = evaluateUnitUnlock(wave12Bundle, wave12Units, w12u1, throughWave11, lookupPrereqW12);
  assert("W12.2 Wave 12 Unit 1 unlocks after Wave 11 mastery", w12u1Unlock.unlocked, w12u1Unlock.blockers.join("; "));
  assert(
    "W12.2 Unit 2 stays locked until Unit 1",
    !evaluateUnitUnlock(wave12Bundle, wave12Units, w12u2, throughWave11, lookupPrereqW12).unlocked,
  );
  assert("W12.2 renderers ready", unitRenderersReady(w12u1Exercises) && unitRenderersReady(w12u2Exercises));

  const w12ShowNun = w12u1Exercises.find((row) => row.id === "exercise.wave12.presentation.nun");
  const w12ShowFatha = w12u1Exercises.find((row) => row.id === "exercise.wave12.presentation.nun_fatha");
  const w12SoundEx = w12u1Exercises.find((row) => row.id === "exercise.wave12.sound_to_letter.nun");
  const w12FathaEx = w12u1Exercises.find((row) => row.id === "exercise.wave12.syllable_blending.nun_fatha");
  const w12FormEx = w12u1Exercises.find((row) => row.id === "exercise.wave12.letter_forms.nun_initial");
  const w12TraceEx = w12u1Exercises.find((row) => row.id === "exercise.wave12.tracing.nun");
  assert(
    "W12.3 Unit 1 JSON opens with isolated ن then نَ presentations",
    w12u1Exercises[0]?.id === "exercise.wave12.presentation.nun" &&
      w12u1Exercises[1]?.id === "exercise.wave12.presentation.nun_fatha",
  );
  const w12LiveStart = scheduleLesson(wave12Bundle, w12u1, w12u1Exercises, throughWave11);
  assert(
    "W12.3 live first beat is unscored isolated ن",
    w12u1Exercises[w12LiveStart.index]?.id === "exercise.wave12.presentation.nun",
  );
  const w12AfterDemos = scheduleLesson(
    wave12Bundle,
    w12u1,
    w12u1Exercises,
    { ...throughWave11, ...seenItems(w12u1Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w12LiveStart.index },
  );
  assert(
    "W12.3 live first scored beat is ن sound",
    w12u1Exercises[w12AfterDemos.index]?.id === "exercise.wave12.sound_to_letter.nun",
  );
  assert("W12.3 isolated ن presentation has no mastery targets", (w12ShowNun?.masteryTargets ?? []).length === 0);
  assert("W12.3 نَ presentation has no mastery targets", (w12ShowFatha?.masteryTargets ?? []).length === 0);
  assert("W12.3 tracing is reinforcement and not a gate", Boolean(w12TraceEx?.tags?.includes("reinforcement")));
  const w12FormResolved = w12FormEx ? resolveLetterRecognition(wave12Bundle, w12FormEx) : undefined;
  assert("W12.3 scored form prompt is initial نـ", w12FormResolved?.targetForm === "initial" && w12FormResolved.promptGlyph === "نـ");
  assert("W12.3 scored form is not medial ـنـ", w12FormResolved?.promptGlyph !== "ـنـ");
  assert("W12.3 Unit 1 has no word target", (w12u1.wordIds ?? []).length === 0 && !w12u1Exercises.some((row) => row.type === "audio_to_word"));
  assert("W12.3 Unit 1 has no madd quiz", !w12u1Exercises.some((row) => (row.contentIds ?? []).some((id) => id.includes("madd"))));

  const w12u1Required = requiredRefsForUnit(wave12Bundle, w12u1, w12u1Exercises);
  const w12u1Keys = w12u1Required.map((ref) => ref.liveKey).sort();
  assert(
    "W12.3 Unit 1 requires nun sound, fatha, and initial form",
    w12u1Keys.join(",") === ["letter:nun.sound", "letter:nun.fatha", "letter:nun.form.initial"].sort().join(","),
    w12u1Keys.join(", "),
  );
  assert("W12.3 tracing is not required", !w12u1Keys.includes("letter:nun.tracing"));
  assert("W12.3 madd is not required in Unit 1", !w12u1Keys.includes("letter:nun.madd_alif"));
  assert("W12.3 medial/final nun are not required", !w12u1Keys.includes("letter:nun.form.medial") && !w12u1Keys.includes("letter:nun.form.final"));

  const nunFathaSyllable = wave12Bundle.syllables?.find((row) => row.id === "syllable.nun.fatha");
  const nunMaddSyllable = wave12Bundle.syllables?.find((row) => row.id === "syllable.nun.madd_alif");
  assert("W12.3 نَ is CV fatha", nunFathaSyllable?.pattern === "CV" && nunFathaSyllable.vowelSkillId === "skill.short_vowel.fatha" && nunFathaSyllable.text === "نَ");
  assert("W12.3 نَا is CVV madd", nunMaddSyllable?.pattern === "CVV" && nunMaddSyllable.vowelSkillId === "skill.long_vowel.madd" && nunMaddSyllable.text === "نَا");
  const w12FathaLive = w12FathaEx?.masteryTargets?.[0]
    ? liveRefForTarget(wave12Bundle, w12FathaEx.masteryTargets[0], w12FathaEx)
    : undefined;
  assert("W12.3 live key is letter:nun.fatha", w12FathaLive?.liveKey === "letter:nun.fatha");
  const w12SoundLive = w12SoundEx?.masteryTargets?.[0]
    ? liveRefForTarget(wave12Bundle, w12SoundEx.masteryTargets[0], w12SoundEx)
    : undefined;
  assert("W12.3 live key is letter:nun.sound", w12SoundLive?.liveKey === "letter:nun.sound");
  const w12FormLive = w12FormEx?.masteryTargets?.[0]
    ? liveRefForTarget(wave12Bundle, w12FormEx.masteryTargets[0], w12FormEx)
    : undefined;
  assert("W12.3 live key is letter:nun.form.initial", w12FormLive?.liveKey === "letter:nun.form.initial");
  assert(
    "W12.3 generic getSyllableLiveKey produces letter:nun.fatha",
    getSyllableLiveKey({ letterLegacyId: "nun", vowelSkillId: "skill.short_vowel.fatha" }).liveKey === "letter:nun.fatha",
  );
  assert(
    "W12.3 generic getSyllableLiveKey produces letter:nun.madd_alif",
    getSyllableLiveKey({ letterLegacyId: "nun", vowelSkillId: "skill.long_vowel.madd" }).liveKey === "letter:nun.madd_alif",
  );
  assert(
    "W12.3 generic getLetterFormLiveKey produces letter:nun.form.initial",
    getLetterFormLiveKey({ letterLegacyId: "nun", form: "initial" }).liveKey === "letter:nun.form.initial",
  );
  assert(
    "W12.3 CVV does not produce a closed-chunk key",
    nunMaddSyllable?.pattern === "CVV" &&
      liveRefForTarget(
        wave12Bundle,
        {
          id: "mastery.letter.nun.madd_alif",
          skillId: "skill.long_vowel.madd",
          syllableId: "syllable.nun.madd_alif",
          letterId: "letter.nun",
        },
        { type: "syllable_blending" },
      ).liveKey === "letter:nun.madd_alif" &&
      liveRefForTarget(
        wave12Bundle,
        {
          id: "mastery.letter.nun.madd_alif",
          skillId: "skill.long_vowel.madd",
          syllableId: "syllable.nun.madd_alif",
          letterId: "letter.nun",
        },
        { type: "syllable_blending" },
      ).liveKey.endsWith(".closed") === false,
  );
  const w12UnitMasterySrc = readFileSync(join(root, "src/lib/curriculum/unitMastery.ts"), "utf8");
  const w12SyllableAdapterSrc = readFileSync(join(root, "src/lib/curriculum/syllableAdapter.ts"), "utf8");
  assert(
    "W12.3 engine has no nun/wave12 special-case",
    !w12UnitMasterySrc.includes('letterLegacyId === "nun"') &&
      !w12UnitMasterySrc.includes("wave12") &&
      !w12UnitMasterySrc.includes("wave-12") &&
      !w12SyllableAdapterSrc.includes("letter.nun"),
  );

  const w12DemosSeen = {
    ...throughWave11,
    ...seenItems(w12u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert(
    "W12.3 presentations cannot pass Unit 1",
    !evaluateUnitMastery(wave12Bundle, w12u1, w12u1Exercises, w12DemosSeen).mastered,
  );
  const w12TraceOnly = {
    ...throughWave11,
    ...(w12TraceEx ? activitySeen(w12TraceEx) : {}),
    ...itemsFrom(
      [{ type: "letter", id: "nun.tracing", liveKey: "letter:nun.tracing", portableMasteryId: "x", skillId: "skill.handwriting.isolated" }],
      [[true, true, true]],
    ),
  };
  assert(
    "W12.3 tracing cannot pass Unit 1",
    !evaluateUnitMastery(wave12Bundle, w12u1, w12u1Exercises, w12TraceOnly).mastered,
  );
  const w12SoundOnly = masterRequired(
    wave12Bundle,
    { ...w12u1, mastery: { ...w12u1.mastery, requiredSkillIds: ["skill.letter_sounds.core"] } },
    w12u1Exercises,
    throughWave11,
  );
  assert("W12.3 sound without fatha/form cannot pass Unit 1", !evaluateUnitMastery(wave12Bundle, w12u1, w12u1Exercises, w12SoundOnly).mastered);
  const w12FathaOnly = masterRequired(
    wave12Bundle,
    { ...w12u1, mastery: { ...w12u1.mastery, requiredSkillIds: ["skill.short_vowel.fatha"] } },
    w12u1Exercises,
    throughWave11,
  );
  assert("W12.3 fatha without sound/form cannot pass Unit 1", !evaluateUnitMastery(wave12Bundle, w12u1, w12u1Exercises, w12FathaOnly).mastered);
  const w12FormOnly = masterRequired(
    wave12Bundle,
    { ...w12u1, mastery: { ...w12u1.mastery, requiredSkillIds: ["skill.letter_forms.positional"] } },
    w12u1Exercises,
    throughWave11,
  );
  assert("W12.3 form without sound/fatha cannot pass Unit 1", !evaluateUnitMastery(wave12Bundle, w12u1, w12u1Exercises, w12FormOnly).mastered);

  const w12u1Mastered = masterRequired(wave12Bundle, w12u1, w12u1Exercises, throughWave11);
  const w12u1ok = evaluateUnitMastery(wave12Bundle, w12u1, w12u1Exercises, w12u1Mastered);
  assert("W12.3 Unit 1 masters with nun sound + fatha + initial form", w12u1ok.mastered, w12u1ok.blockers.join("; "));
  assert(
    "W12.3 presentation attempts remain 0",
    (w12u1Mastered[getPresentationLiveKey("exercise.wave12.presentation.nun").liveKey]?.attempts ?? 0) === 0 &&
      (w12u1Mastered[getPresentationLiveKey("exercise.wave12.presentation.nun_fatha").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W12.3 Unit 2 unlocks only after Unit 1 mastery",
    !evaluateUnitUnlock(wave12Bundle, wave12Units, w12u2, throughWave11, lookupPrereqW12).unlocked &&
      evaluateUnitUnlock(wave12Bundle, wave12Units, w12u2, w12u1Mastered, lookupPrereqW12).unlocked,
  );

  const w12u2Required = requiredRefsForUnit(wave12Bundle, w12u2, w12u2Exercises);
  const w12u2Keys = w12u2Required.map((ref) => ref.liveKey).sort();
  const w12MaddShow = w12u2Exercises.find((row) => row.id === "exercise.wave12.presentation.nun_madd_alif");
  const w12MaddScore = w12u2Exercises.find((row) => row.id === "exercise.wave12.syllable_blending.nun_madd_alif");
  const w12ComposeEx = w12u2Exercises.find((row) => row.id === "exercise.wave12.presentation.nar_compose");
  const w12AudioEx = w12u2Exercises.find((row) => row.id === "exercise.wave12.audio_to_word.nar");
  const w12PictureEx = w12u2Exercises.find((row) => row.id === "exercise.wave12.word_to_picture.nar");
  const w12MaddShowIdx = w12u2Exercises.findIndex((row) => row.id === "exercise.wave12.presentation.nun_madd_alif");
  const w12MaddScoreIdx = w12u2Exercises.findIndex((row) => row.id === "exercise.wave12.syllable_blending.nun_madd_alif");
  const w12ComposeIdx = w12u2Exercises.findIndex((row) => row.id === "exercise.wave12.presentation.nar_compose");
  const w12AudioIdx = w12u2Exercises.findIndex((row) => row.id === "exercise.wave12.audio_to_word.nar");
  const w12PictureIdx = w12u2Exercises.findIndex((row) => row.id === "exercise.wave12.word_to_picture.nar");
  assert(
    "W12.4 SHOW نَ + ا → نَا is unscored chunk",
    w12MaddShow?.type === "presentation" &&
      w12MaddShow.config?.["show"] === "chunk" &&
      w12MaddShow.config?.["left"] === "نَ" &&
      w12MaddShow.config?.["right"] === "ا" &&
      w12MaddShow.config?.["result"] === "نَا" &&
      (w12MaddShow.masteryTargets ?? []).length === 0,
  );
  assert("W12.4 scored نَا occurs before نَار decode", w12MaddScoreIdx >= 0 && w12AudioIdx > w12MaddScoreIdx);
  assert("W12.4 unscored نَا SHOW occurs before scored نَا", w12MaddShowIdx >= 0 && w12MaddScoreIdx > w12MaddShowIdx);
  const w12u2AfterDemos = scheduleLesson(
    wave12Bundle,
    w12u2,
    w12u2Exercises,
    { ...w12u1Mastered, ...seenItems(w12u2Exercises.filter((row) => row.type === "presentation")) },
  );
  assert(
    "W12.4 live first scored beat is نَا, not audio",
    w12u2Exercises[w12u2AfterDemos.index]?.id === "exercise.wave12.syllable_blending.nun_madd_alif",
  );
  const w12MaddChoices = (w12MaddScore?.choices ?? []).map((choice) => choice.id);
  assert(
    "W12.4 scored نَا foils are نَ and بَا",
    w12MaddChoices.includes("syllable.nun.madd_alif") &&
      w12MaddChoices.includes("syllable.nun.fatha") &&
      w12MaddChoices.includes("syllable.ba.madd_alif"),
  );
  const w12MaddLive = w12MaddScore?.masteryTargets?.[0]
    ? liveRefForTarget(wave12Bundle, w12MaddScore.masteryTargets[0], w12MaddScore)
    : undefined;
  assert("W12.4 live key is letter:nun.madd_alif", w12MaddLive?.liveKey === "letter:nun.madd_alif");
  assert("W12.4 CVV does not generate a closed-chunk live key", w12MaddLive?.liveKey === "letter:nun.madd_alif" && !w12MaddLive.liveKey.endsWith(".closed"));
  assert(
    "W12.4 Unit 2 requires letter:nun.madd_alif and word:nar.decoding",
    w12u2Keys.join(",") === ["letter:nun.madd_alif", "word:nar.decoding"].sort().join(","),
    w12u2Keys.join(", "),
  );
  assert("W12.4 historical letter:ba.madd_alif is not required", !w12u2Keys.includes("letter:ba.madd_alif"));
  assert("W12.4 historical letter:jim.madd_alif is not required", !w12u2Keys.includes("letter:jim.madd_alif"));
  assert("W12.4 letter:nun.fatha is not required in Unit 2", !w12u2Keys.includes("letter:nun.fatha"));
  assert("W12.4 no required review key", !w12u2Keys.some((key) => key.includes("review")));
  assert("W12.4 no word:laa.decoding", !w12u2Keys.includes("word:laa.decoding"));
  assert("W12.4 no word:naam.decoding", !w12u2Keys.includes("word:naam.decoding"));
  assert(
    "W12.4 compose is نَا + ر → نَار",
    w12ComposeEx?.config?.["left"] === "نَا" && w12ComposeEx?.config?.["right"] === "ر" && w12ComposeEx?.config?.["result"] === "نَار",
  );
  assert("W12.4 compose chunk occurs before نَار audio", w12ComposeIdx >= 0 && w12AudioIdx > w12ComposeIdx);
  assert(
    "W12.4 first نَار evidence is audio_to_word",
    w12u2Exercises[w12AudioIdx]?.type === "audio_to_word" &&
      w12u2Exercises[w12AudioIdx]?.success.correctChoiceId === "word.nar",
  );
  const w12AudioChoices = (w12AudioEx?.choices ?? []).map((choice) => choice.id);
  assert(
    "W12.4 audio foils are بَاب and دَجَاج",
    w12AudioChoices.includes("word.nar") && w12AudioChoices.includes("word.bab") && w12AudioChoices.includes("word.dajaj"),
  );
  const narWord = wave12Bundle.words.find((row) => row.id === "word.nar");
  const narVisual = narWord ? prototypeVisualForWord(narWord) : undefined;
  assert("word.nar maps to nature-32", narWord?.legacyId === "nature-32");
  assert(
    "word.nar is Band A نَار",
    narWord?.vocabBand === "A" && narWord.subBand === "A1" && narWord.lemma === "نار" && narWord.teachingForm === "نَار",
  );
  assert("word.nar prototype visual is 🔥", narVisual?.kind === "emoji" && narVisual.emoji === "🔥");
  const nunForms = (narWord?.requiredLetterForms ?? []).filter((row) => row.letterId === "letter.nun").map((row) => row.form);
  const raForms = (narWord?.requiredLetterForms ?? []).filter((row) => row.letterId === "letter.ra").map((row) => row.form);
  assert("W12.4 joining records nun initial, not medial/final", nunForms.includes("initial") && !nunForms.includes("medial") && !nunForms.includes("final"));
  assert("W12.4 joining records ra isolated, not final", raForms.includes("isolated") && !raForms.includes("final"));
  assert("W12.4 nun is dual-joining", wave12Bundle.letters.find((row) => row.id === "letter.nun")?.nonConnecting !== true);
  assert("W12.4 ra is nonConnecting", wave12Bundle.letters.find((row) => row.id === "letter.ra")?.nonConnecting === true);
  assert("W12.4 alif is nonConnecting", wave12Bundle.letters.find((row) => row.id === "letter.alif")?.nonConnecting === true);

  assert(
    "W12.4 historical ba madd cannot substitute for Unit 2",
    Boolean(throughWave11["letter:ba.madd_alif"]) &&
      !evaluateUnitMastery(wave12Bundle, w12u2, w12u2Exercises, { ...w12u1Mastered }).mastered,
  );
  assert(
    "W12.4 historical jim madd cannot substitute for Unit 2",
    Boolean(throughWave11["letter:jim.madd_alif"]) &&
      !evaluateUnitMastery(wave12Bundle, w12u2, w12u2Exercises, { ...w12u1Mastered }).mastered,
  );
  const w12ComposeOnly = {
    ...w12u1Mastered,
    ...seenItems(w12u2Exercises.filter((row) => row.id === "exercise.wave12.presentation.nar_compose")),
  };
  assert(
    "W12.4 composition chunk cannot pass Unit 2",
    !evaluateUnitMastery(wave12Bundle, w12u2, w12u2Exercises, w12ComposeOnly).mastered,
  );
  const w12PictureOnly = w12PictureEx ? activitySeen(w12PictureEx) : {};
  assert(
    "W12.4 picture cannot pass Unit 2",
    !evaluateUnitMastery(wave12Bundle, w12u2, w12u2Exercises, { ...w12u1Mastered, ...w12PictureOnly }).mastered,
  );
  assert("W12.4 picture is after audio", w12PictureIdx > w12AudioIdx);
  assert("W12.4 picture is reinforcement", Boolean(w12PictureEx?.tags?.includes("reinforcement")));
  assert("W12.4 no required review exercise", w12u2Exercises.every((row) => !row.tags?.includes("review") && !row.tags?.includes("review-wave12")));
  const w12u2Mastered = masterRequired(wave12Bundle, w12u2, w12u2Exercises, w12u1Mastered);
  const w12u2ok = evaluateUnitMastery(wave12Bundle, w12u2, w12u2Exercises, w12u2Mastered);
  assert("W12.4 Unit 2 masters with nun madd + nar decoding", w12u2ok.mastered, w12u2ok.blockers.join("; "));
  assert(
    "W12.4 compose presentation attempts remain 0",
    (w12u2Mastered[getPresentationLiveKey("exercise.wave12.presentation.nar_compose").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W12.4 historical ba/jim madd keys remain in prior progress",
    Boolean(w12u2Mastered["letter:ba.madd_alif"]) && Boolean(w12u2Mastered["letter:jim.madd_alif"]),
  );

  const allW12Keys = [...w12u1Required, ...w12u2Required].map((ref) => ref.liveKey);
  assert("W12.5 no letter:alif.sound", !allW12Keys.includes("letter:alif.sound"));
  assert("W12.5 no hamza/kasra/damma/ū/ī/closed keys", !allW12Keys.some((key) => key.includes("hamza") || key.includes("kasra") || key.includes("damma") || key.includes("madd_waw") || key.includes("madd_ya") || key.endsWith(".closed")));
  assert("W12.5 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-13"));
  assert("W12.5 Wave 13–14 are registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE12_SLUG") && resolveLearnSrcEarly.includes("getWave12Bundle") && resolveLearnSrcEarly.includes("WAVE13_SLUG") && resolveLearnSrcEarly.includes("getWave13Bundle") && resolveLearnSrcEarly.includes("WAVE14_SLUG") && resolveLearnSrcEarly.includes("getWave14Bundle") && resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));
  assert("W12.6 Wave 11 final unit id is unchanged", w11u2.id === "unit.literacy.wave11.dajaj");
  assert("W12.6 Wave 1–11 mastery still holds after Wave 12 load", w11u2ok.mastered && w10u2ok.mastered);
  const frozenPriorWavesW12 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path, wave10Path, wave11Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("unit.literacy.wave12") && !src.includes("path.literacy.wave12") && !src.includes("literacy-path.wave-12");
  });
  assert("W12.6 Waves 1–11 lesson JSON stay free of Wave 12 unit/path ids", frozenPriorWavesW12);
  assert("W12.6 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));

  const w12Report = readFileSync(join(root, "docs/literacy-wave-12-report.md"), "utf8");
  assert("W12 report exists and postpones Wave 13", /Wave 13 is not implemented/i.test(w12Report) && w12Report.includes("نَار"));

  const wave13Raw = JSON.parse(readFileSync(wave13Path, "utf8"));
  const wave13Validation = validateCurriculum(wave13Raw);
  assert("Wave 13 production JSON validates", wave13Validation.ok, wave13Validation.issues.map((issue) => issue.message).join("; "));
  const wave13Bundle = asCurriculumBundle(wave13Raw);
  const wave13PathRow = wave13Bundle.paths?.find((row) => row.id === WAVE13_PATH_ID);
  if (!wave13PathRow) throw new Error("Wave 13 path missing");
  const wave13ById = new Map((wave13Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave13Units = wave13PathRow.unitIds.flatMap((id) => {
    const unit = wave13ById.get(id);
    return unit ? [unit] : [];
  });
  const w13u1 = wave13Units[0];
  const w13u2 = wave13Units[1];
  const w13u3 = wave13Units[2];
  if (!w13u1 || !w13u2 || !w13u3) throw new Error("Wave 13 units 1–3 missing");
  assert("Wave 13 declares exactly three units", wave13Units.length === 3);
  assert("Wave 13 has no fourth unit", wave13Units[3] === undefined);
  assert("Wave 13 Unit 1 prereq is Wave 12 final unit", w13u1.prereqUnitIds?.[0] === "unit.literacy.wave12.nar");
  assert(
    "Wave 13 child titles are كِ / تَا / كِتَاب",
    w13u1.titleAr === "كِ" && w13u2.titleAr === "تَا" && w13u3.titleAr === "كِتَاب" && w13u3.childGoalAr === "كِتَاب",
  );

  const lookupPrereqW13 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w13 = wave13Bundle.units?.find((row) => row.id === id);
    if (w13) return { bundle: wave13Bundle, unit: w13 };
    const w12 = wave12Bundle.units?.find((row) => row.id === id);
    if (w12) return { bundle: wave12Bundle, unit: w12 };
    return lookupPrereqW12(id);
  };

  const w13u1Exercises = exercisesForUnit(wave13Bundle, w13u1);
  const w13u2Exercises = exercisesForUnit(wave13Bundle, w13u2);
  const w13u3Exercises = exercisesForUnit(wave13Bundle, w13u3);
  const throughWave12 = w12u2Mastered;

  assert(
    "W13.1 Wave 13 locked before Wave 12 final mastery",
    !evaluateUnitUnlock(wave13Bundle, wave13Units, w13u1, w12u1Mastered, lookupPrereqW13).unlocked,
  );
  const w13u1Unlock = evaluateUnitUnlock(wave13Bundle, wave13Units, w13u1, throughWave12, lookupPrereqW13);
  assert("W13.2 Wave 13 Unit 1 unlocks after Wave 12 mastery", w13u1Unlock.unlocked, w13u1Unlock.blockers.join("; "));
  assert(
    "W13.2 Units 2–3 stay locked until prior units",
    !evaluateUnitUnlock(wave13Bundle, wave13Units, w13u2, throughWave12, lookupPrereqW13).unlocked &&
      !evaluateUnitUnlock(wave13Bundle, wave13Units, w13u3, throughWave12, lookupPrereqW13).unlocked,
  );
  assert("W13.2 renderers ready", unitRenderersReady(w13u1Exercises) && unitRenderersReady(w13u2Exercises) && unitRenderersReady(w13u3Exercises));

  const w13ShowFatha = w13u1Exercises.find((row) => row.id === "exercise.wave13.presentation.kaf_fatha");
  const w13ShowKasra = w13u1Exercises.find((row) => row.id === "exercise.wave13.presentation.kaf_kasra");
  const w13KasraEx = w13u1Exercises.find((row) => row.id === "exercise.wave13.syllable_blending.kaf_kasra");
  assert(
    "W13.3 Unit 1 JSON opens with كَ then كِ presentations",
    w13u1Exercises[0]?.id === "exercise.wave13.presentation.kaf_fatha" &&
      w13u1Exercises[1]?.id === "exercise.wave13.presentation.kaf_kasra",
  );
  const w13LiveStart = scheduleLesson(wave13Bundle, w13u1, w13u1Exercises, throughWave12);
  assert(
    "W13.3 live first beat is unscored كَ",
    w13u1Exercises[w13LiveStart.index]?.id === "exercise.wave13.presentation.kaf_fatha",
  );
  const w13AfterDemos = scheduleLesson(
    wave13Bundle,
    w13u1,
    w13u1Exercises,
    { ...throughWave12, ...seenItems(w13u1Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w13LiveStart.index },
  );
  assert(
    "W13.3 live first scored beat is كِ",
    w13u1Exercises[w13AfterDemos.index]?.id === "exercise.wave13.syllable_blending.kaf_kasra",
  );
  assert("W13.3 presentations have no mastery targets", (w13ShowFatha?.masteryTargets ?? []).length === 0 && (w13ShowKasra?.masteryTargets ?? []).length === 0);
  assert("W13.3 Unit 1 has no word target", (w13u1.wordIds ?? []).length === 0 && !w13u1Exercises.some((row) => row.type === "audio_to_word"));
  assert("W13.3 Unit 1 has no madd quiz", !w13u1Exercises.some((row) => (row.contentIds ?? []).some((id) => id.includes("madd"))));
  assert("W13.3 Unit 1 has no missing_haraka", !w13u1Exercises.some((row) => row.type === "missing_haraka"));
  assert("W13.3 Unit 1 has no form quiz", !w13u1Exercises.some((row) => row.type === "letter_recognition"));

  const w13u1Required = requiredRefsForUnit(wave13Bundle, w13u1, w13u1Exercises);
  const w13u1Keys = w13u1Required.map((ref) => ref.liveKey);
  assert("W13.3 Unit 1 requires letter:kaf.kasra only", w13u1Keys.length === 1 && w13u1Keys[0] === "letter:kaf.kasra", w13u1Keys.join(", "));
  assert("W13.3 fatha is not required", !w13u1Keys.includes("letter:kaf.fatha"));
  assert("W13.3 mark-discrimination is not required", !w13u1Keys.includes("diacritic:kaf.kasra.discrimination"));

  const kafKasraSyllable = wave13Bundle.syllables?.find((row) => row.id === "syllable.kaf.kasra");
  const taMaddSyllable = wave13Bundle.syllables?.find((row) => row.id === "syllable.ta.madd_alif");
  assert("W13.3 كِ is CV kasra", kafKasraSyllable?.pattern === "CV" && kafKasraSyllable.vowelSkillId === "skill.short_vowel.kasra" && kafKasraSyllable.text === "كِ");
  assert("W13.3 تَا is CVV madd", taMaddSyllable?.pattern === "CVV" && taMaddSyllable.vowelSkillId === "skill.long_vowel.madd" && taMaddSyllable.text === "تَا");
  const w13KasraLive = w13KasraEx?.masteryTargets?.[0]
    ? liveRefForTarget(wave13Bundle, w13KasraEx.masteryTargets[0], w13KasraEx)
    : undefined;
  assert("W13.3 live key is letter:kaf.kasra", w13KasraLive?.liveKey === "letter:kaf.kasra");
  assert(
    "W13.3 generic getSyllableLiveKey produces letter:kaf.kasra",
    getSyllableLiveKey({ letterLegacyId: "kaf", vowelSkillId: "skill.short_vowel.kasra" }).liveKey === "letter:kaf.kasra",
  );
  assert(
    "W13.3 generic getSyllableLiveKey produces letter:ta.madd_alif",
    getSyllableLiveKey({ letterLegacyId: "ta", vowelSkillId: "skill.long_vowel.madd" }).liveKey === "letter:ta.madd_alif",
  );
  const w13UnitMasterySrc = readFileSync(join(root, "src/lib/curriculum/unitMastery.ts"), "utf8");
  const w13SyllableAdapterSrc = readFileSync(join(root, "src/lib/curriculum/syllableAdapter.ts"), "utf8");
  assert(
    "W13.3 engine has no kaf/wave13 special-case",
    !w13UnitMasterySrc.includes('letterLegacyId === "kaf"') &&
      !w13UnitMasterySrc.includes("wave13") &&
      !w13UnitMasterySrc.includes("wave-13") &&
      !w13SyllableAdapterSrc.includes("letter.kaf"),
  );

  const w13DemosSeen = {
    ...throughWave12,
    ...seenItems(w13u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W13.3 presentations cannot pass Unit 1", !evaluateUnitMastery(wave13Bundle, w13u1, w13u1Exercises, w13DemosSeen).mastered);
  const w13FathaOnly = {
    ...throughWave12,
    ...itemsFrom(
      [{ type: "letter", id: "kaf.fatha", liveKey: "letter:kaf.fatha", portableMasteryId: "x", skillId: "skill.short_vowel.fatha" }],
      [[true, true, true]],
    ),
  };
  assert("W13.3 fatha cannot substitute for kasra", !evaluateUnitMastery(wave13Bundle, w13u1, w13u1Exercises, w13FathaOnly).mastered);
  const w13MarkOnly = {
    ...throughWave12,
    ...itemsFrom(
      [getHarakaLiveKey({ letterLegacyId: "kaf", vowelSkillId: "skill.short_vowel.kasra" })].map((keyed) => ({
        type: keyed.type,
        id: keyed.id,
        liveKey: keyed.liveKey,
        portableMasteryId: "x",
        skillId: "skill.short_vowel.kasra",
      })),
      [[true, true, true]],
    ),
  };
  assert("W13.3 mark-only kasra cannot pass Unit 1", !evaluateUnitMastery(wave13Bundle, w13u1, w13u1Exercises, w13MarkOnly).mastered);
  const w13FoilKasra = {
    ...throughWave12,
    ...itemsFrom(
      [getHarakaLiveKey({ letterLegacyId: "mim", vowelSkillId: "skill.short_vowel.kasra" })].map((keyed) => ({
        type: keyed.type,
        id: keyed.id,
        liveKey: keyed.liveKey,
        portableMasteryId: "x",
        skillId: "skill.short_vowel.kasra",
      })),
      [[true, true, true]],
    ),
  };
  assert("W13.3 historical kasra foil exposure cannot pass Unit 1", !evaluateUnitMastery(wave13Bundle, w13u1, w13u1Exercises, w13FoilKasra).mastered);

  const w13u1Mastered = masterRequired(wave13Bundle, w13u1, w13u1Exercises, throughWave12);
  const w13u1ok = evaluateUnitMastery(wave13Bundle, w13u1, w13u1Exercises, w13u1Mastered);
  assert("W13.3 Unit 1 masters with letter:kaf.kasra", w13u1ok.mastered, w13u1ok.blockers.join("; "));
  assert(
    "W13.3 presentation attempts remain 0",
    (w13u1Mastered[getPresentationLiveKey("exercise.wave13.presentation.kaf_fatha").liveKey]?.attempts ?? 0) === 0 &&
      (w13u1Mastered[getPresentationLiveKey("exercise.wave13.presentation.kaf_kasra").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W13.3 Unit 2 unlocks after Unit 1; Unit 3 stays locked",
    evaluateUnitUnlock(wave13Bundle, wave13Units, w13u2, w13u1Mastered, lookupPrereqW13).unlocked &&
      !evaluateUnitUnlock(wave13Bundle, wave13Units, w13u3, w13u1Mastered, lookupPrereqW13).unlocked,
  );

  const w13u2Required = requiredRefsForUnit(wave13Bundle, w13u2, w13u2Exercises);
  const w13MaddShow = w13u2Exercises.find((row) => row.id === "exercise.wave13.presentation.ta_madd_alif");
  const w13MaddScore = w13u2Exercises.find((row) => row.id === "exercise.wave13.syllable_blending.ta_madd_alif");
  assert("W13.4 Unit 2 JSON opens with تَا chunk", w13u2Exercises[0]?.id === "exercise.wave13.presentation.ta_madd_alif");
  assert(
    "W13.4 تَ + ا → تَا uses plain ا",
    w13MaddShow?.config?.["show"] === "chunk" && w13MaddShow.config?.["left"] === "تَ" && w13MaddShow.config?.["right"] === "ا" && w13MaddShow.config?.["result"] === "تَا",
  );
  const w13u2LiveStart = scheduleLesson(wave13Bundle, w13u2, w13u2Exercises, w13u1Mastered);
  assert("W13.4 live first beat is unscored تَا", w13u2Exercises[w13u2LiveStart.index]?.id === "exercise.wave13.presentation.ta_madd_alif");
  const w13u2AfterDemos = scheduleLesson(
    wave13Bundle,
    w13u2,
    w13u2Exercises,
    { ...w13u1Mastered, ...seenItems(w13u2Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w13u2LiveStart.index },
  );
  assert("W13.4 live first scored beat is تَا", w13u2Exercises[w13u2AfterDemos.index]?.id === "exercise.wave13.syllable_blending.ta_madd_alif");
  assert("W13.4 Unit 2 requires letter:ta.madd_alif only", w13u2Required.length === 1 && w13u2Required[0]?.liveKey === "letter:ta.madd_alif", w13u2Required.map((ref) => ref.liveKey).join(", "));
  const w13MaddLive = w13MaddScore?.masteryTargets?.[0]
    ? liveRefForTarget(wave13Bundle, w13MaddScore.masteryTargets[0], w13MaddScore)
    : undefined;
  assert("W13.4 live key is letter:ta.madd_alif", w13MaddLive?.liveKey === "letter:ta.madd_alif");
  assert("W13.4 no ta form gate", !w13u2Required.some((ref) => ref.liveKey.startsWith("letter:ta.form.")));
  assert("W13.4 presentations cannot pass Unit 2", !evaluateUnitMastery(wave13Bundle, w13u2, w13u2Exercises, { ...w13u1Mastered, ...seenItems(w13u2Exercises.filter((row) => row.type === "presentation")) }).mastered);

  const w13TaFathaOnly = {
    ...w13u1Mastered,
    ...itemsFrom(
      [{ type: "letter", id: "ta.fatha", liveKey: "letter:ta.fatha", portableMasteryId: "x", skillId: "skill.short_vowel.fatha" }],
      [[true, true, true]],
    ),
  };
  assert("W13.4 letter:ta.fatha cannot substitute", !evaluateUnitMastery(wave13Bundle, w13u2, w13u2Exercises, w13TaFathaOnly).mastered);
  const w13HistoricalMadd = {
    ...w13u1Mastered,
    ...itemsFrom(
      [
        { type: "letter", id: "ba.madd_alif", liveKey: "letter:ba.madd_alif", portableMasteryId: "x", skillId: "skill.long_vowel.madd" },
        { type: "letter", id: "jim.madd_alif", liveKey: "letter:jim.madd_alif", portableMasteryId: "x", skillId: "skill.long_vowel.madd" },
        { type: "letter", id: "nun.madd_alif", liveKey: "letter:nun.madd_alif", portableMasteryId: "x", skillId: "skill.long_vowel.madd" },
      ],
      [[true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("W13.4 ba/jim/nun madd cannot substitute", !evaluateUnitMastery(wave13Bundle, w13u2, w13u2Exercises, w13HistoricalMadd).mastered);

  const w13u2Mastered = masterRequired(wave13Bundle, w13u2, w13u2Exercises, w13u1Mastered);
  const w13u2ok = evaluateUnitMastery(wave13Bundle, w13u2, w13u2Exercises, w13u2Mastered);
  assert("W13.4 Unit 2 masters with letter:ta.madd_alif", w13u2ok.mastered, w13u2ok.blockers.join("; "));
  assert(
    "W13.4 تَا presentation attempts remain 0",
    (w13u2Mastered[getPresentationLiveKey("exercise.wave13.presentation.ta_madd_alif").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W13.4 Unit 3 unlocks after Unit 2",
    evaluateUnitUnlock(wave13Bundle, wave13Units, w13u3, w13u2Mastered, lookupPrereqW13).unlocked,
  );

  const w13u3Required = requiredRefsForUnit(wave13Bundle, w13u3, w13u3Exercises);
  const w13KitaCompose = w13u3Exercises.find((row) => row.id === "exercise.wave13.presentation.kita_compose");
  const w13KitabCompose = w13u3Exercises.find((row) => row.id === "exercise.wave13.presentation.kitab_compose");
  const w13AudioEx = w13u3Exercises.find((row) => row.id === "exercise.wave13.audio_to_word.kitab");
  const w13PictureEx = w13u3Exercises.find((row) => row.id === "exercise.wave13.word_to_picture.kitab");
  assert(
    "W13.5 Unit 3 JSON opens with both compose presentations",
    w13u3Exercises[0]?.id === "exercise.wave13.presentation.kita_compose" &&
      w13u3Exercises[1]?.id === "exercise.wave13.presentation.kitab_compose",
  );
  assert(
    "W13.5 compose is كِ + تَا then isolated ب",
    w13KitaCompose?.config?.["left"] === "كِ" &&
      w13KitaCompose.config?.["right"] === "تَا" &&
      w13KitabCompose?.config?.["left"] === "كِتَا" &&
      w13KitabCompose.config?.["right"] === "ب" &&
      w13KitabCompose.config?.["result"] === "كِتَاب",
  );
  const w13u3LiveStart = scheduleLesson(wave13Bundle, w13u3, w13u3Exercises, w13u2Mastered);
  assert("W13.5 live first beat is unscored compose", w13u3Exercises[w13u3LiveStart.index]?.type === "presentation");
  const w13u3AfterDemos = scheduleLesson(
    wave13Bundle,
    w13u3,
    w13u3Exercises,
    { ...w13u2Mastered, ...seenItems(w13u3Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w13u3LiveStart.index },
  );
  assert("W13.5 live first scored beat is audio_to_word", w13u3Exercises[w13u3AfterDemos.index]?.id === "exercise.wave13.audio_to_word.kitab");
  assert("W13.5 picture is after audio", (w13u3Exercises.findIndex((row) => row.id === "exercise.wave13.word_to_picture.kitab") > w13u3Exercises.findIndex((row) => row.id === "exercise.wave13.audio_to_word.kitab")));
  assert("W13.5 Unit 3 requires word:kitab.decoding only", w13u3Required.length === 1 && w13u3Required[0]?.liveKey === "word:kitab.decoding", w13u3Required.map((ref) => ref.liveKey).join(", "));
  assert("W13.5 picture is reinforcement", Boolean(w13PictureEx?.tags?.includes("reinforcement")));
  assert("W13.5 no required review", w13u3Exercises.every((row) => !row.tags?.includes("review")));

  const kitabWord = wave13Bundle.words.find((row) => row.id === "word.kitab");
  const kitabVisual = kitabWord ? prototypeVisualForWord(kitabWord) : undefined;
  assert("word.kitab maps to school-6", kitabWord?.legacyId === "school-6");
  assert(
    "word.kitab is Band A كِتَاب",
    kitabWord?.vocabBand === "A" && kitabWord.subBand === "A1" && kitabWord.lemma === "كتاب" && kitabWord.teachingForm === "كِتَاب",
  );
  assert("word.kitab prototype visual is 📕", kitabVisual?.kind === "emoji" && kitabVisual.emoji === "📕");
  const kitabForms = kitabWord?.requiredLetterForms ?? [];
  assert(
    "W13.5 joining records kaf initial, ta medial, ba isolated",
    kitabForms.some((row) => row.letterId === "letter.kaf" && row.form === "initial") &&
      kitabForms.some((row) => row.letterId === "letter.ta" && row.form === "medial") &&
      kitabForms.some((row) => row.letterId === "letter.ba" && row.form === "isolated") &&
      !kitabForms.some((row) => row.letterId === "letter.ba" && row.form === "final"),
  );
  assert("W13.5 kaf is dual-joining", wave13Bundle.letters.find((row) => row.id === "letter.kaf")?.nonConnecting !== true);
  assert("W13.5 ta is dual-joining", wave13Bundle.letters.find((row) => row.id === "letter.ta")?.nonConnecting !== true);
  assert("W13.5 alif is nonConnecting", wave13Bundle.letters.find((row) => row.id === "letter.alif")?.nonConnecting === true);

  const w13ComposeOnly = {
    ...w13u2Mastered,
    ...seenItems(w13u3Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W13.5 compose cannot pass Unit 3", !evaluateUnitMastery(wave13Bundle, w13u3, w13u3Exercises, w13ComposeOnly).mastered);
  const w13PictureOnly = w13PictureEx ? activitySeen(w13PictureEx) : {};
  assert("W13.5 picture cannot pass Unit 3", !evaluateUnitMastery(wave13Bundle, w13u3, w13u3Exercises, { ...w13u2Mastered, ...w13PictureOnly }).mastered);
  const w13HistoricalDecode = {
    ...w13u2Mastered,
    ...itemsFrom(
      [
        { type: "word", id: "nar.decoding", liveKey: "word:nar.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "daftar.decoding", liveKey: "word:daftar.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "kalb.decoding", liveKey: "word:kalb.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
      ],
      [[true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("W13.5 historical decoding keys cannot substitute", !evaluateUnitMastery(wave13Bundle, w13u3, w13u3Exercises, w13HistoricalDecode).mastered);

  const w13u3Mastered = masterRequired(wave13Bundle, w13u3, w13u3Exercises, w13u2Mastered);
  const w13u3ok = evaluateUnitMastery(wave13Bundle, w13u3, w13u3Exercises, w13u3Mastered);
  assert("W13.5 Unit 3 masters with word:kitab.decoding", w13u3ok.mastered, w13u3ok.blockers.join("; "));
  assert(
    "W13.5 compose presentation attempts remain 0",
    (w13u3Mastered[getPresentationLiveKey("exercise.wave13.presentation.kita_compose").liveKey]?.attempts ?? 0) === 0 &&
      (w13u3Mastered[getPresentationLiveKey("exercise.wave13.presentation.kitab_compose").liveKey]?.attempts ?? 0) === 0,
  );

  const allW13Keys = [...w13u1Required, ...w13u2Required, ...w13u3Required].map((ref) => ref.liveKey);
  assert("W13.6 only the three required live keys", allW13Keys.sort().join(",") === ["letter:kaf.kasra", "letter:ta.madd_alif", "word:kitab.decoding"].sort().join(","));
  assert("W13.6 no letter:alif.sound", !allW13Keys.includes("letter:alif.sound"));
  assert("W13.6 no damma/ū/ī/closed/form/discrimination keys", !allW13Keys.some((key) => key.includes("damma") || key.includes("madd_waw") || key.includes("madd_ya") || key.includes("discrimination") || key.includes(".form.") || key.endsWith(".closed")));
  assert("W13.6 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-14"));
  assert("W13.6 Wave 13–14 are registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE13_SLUG") && resolveLearnSrcEarly.includes("getWave13Bundle") && resolveLearnSrcEarly.includes("WAVE14_SLUG") && resolveLearnSrcEarly.includes("getWave14Bundle") && resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));
  assert("W13.6 Wave 12 final unit id is unchanged", w12u2.id === "unit.literacy.wave12.nar");
  assert("W13.6 Wave 1–12 mastery still holds after Wave 13 load", w12u2ok.mastered && w11u2ok.mastered);
  const frozenPriorWavesW13 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path, wave10Path, wave11Path, wave12Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("unit.literacy.wave13") && !src.includes("path.literacy.wave13") && !src.includes("literacy-path.wave-13");
  });
  assert("W13.6 Waves 1–12 lesson JSON stay free of Wave 13 unit/path ids", frozenPriorWavesW13);
  assert("W13.6 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));

  const w13Report = readFileSync(join(root, "docs/literacy-wave-13-report.md"), "utf8");
  assert("W13 report exists and postpones Wave 14", /Wave 14 is not implemented/i.test(w13Report) && w13Report.includes("كِتَاب"));

  const wave14Raw = JSON.parse(readFileSync(wave14Path, "utf8"));
  const wave14Validation = validateCurriculum(wave14Raw);
  assert("Wave 14 production JSON validates", wave14Validation.ok, wave14Validation.issues.map((issue) => issue.message).join("; "));
  const wave14Bundle = asCurriculumBundle(wave14Raw);
  const wave14PathRow = wave14Bundle.paths?.find((row) => row.id === WAVE14_PATH_ID);
  if (!wave14PathRow) throw new Error("Wave 14 path missing");
  const wave14ById = new Map((wave14Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave14Units = wave14PathRow.unitIds.flatMap((id) => {
    const unit = wave14ById.get(id);
    return unit ? [unit] : [];
  });
  const w14u1 = wave14Units[0];
  const w14u2 = wave14Units[1];
  if (!w14u1 || !w14u2) throw new Error("Wave 14 units 1–2 missing");
  assert("Wave 14 declares exactly two units", wave14Units.length === 2);
  assert("Wave 14 has no third unit", wave14Units[2] === undefined);
  assert("Wave 14 Unit 1 prereq is Wave 13 final unit", w14u1.prereqUnitIds?.[0] === "unit.literacy.wave13.kitab");
  assert(
    "Wave 14 child titles are عِ / عِنَب",
    w14u1.titleAr === "عِ" && w14u2.titleAr === "عِنَب" && w14u2.childGoalAr === "عِنَب",
  );

  const lookupPrereqW14 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w14 = wave14Bundle.units?.find((row) => row.id === id);
    if (w14) return { bundle: wave14Bundle, unit: w14 };
    const w13 = wave13Bundle.units?.find((row) => row.id === id);
    if (w13) return { bundle: wave13Bundle, unit: w13 };
    return lookupPrereqW13(id);
  };

  const w14u1Exercises = exercisesForUnit(wave14Bundle, w14u1);
  const w14u2Exercises = exercisesForUnit(wave14Bundle, w14u2);
  const throughWave13 = w13u3Mastered;

  assert(
    "W14.1 Wave 14 locked before Wave 13 final mastery",
    !evaluateUnitUnlock(wave14Bundle, wave14Units, w14u1, w13u2Mastered, lookupPrereqW14).unlocked,
  );
  const w14u1Unlock = evaluateUnitUnlock(wave14Bundle, wave14Units, w14u1, throughWave13, lookupPrereqW14);
  assert("W14.2 Wave 14 Unit 1 unlocks after Wave 13 mastery", w14u1Unlock.unlocked, w14u1Unlock.blockers.join("; "));
  assert(
    "W14.2 Unit 2 stays locked until Unit 1",
    !evaluateUnitUnlock(wave14Bundle, wave14Units, w14u2, throughWave13, lookupPrereqW14).unlocked,
  );
  assert("W14.2 renderers ready", unitRenderersReady(w14u1Exercises) && unitRenderersReady(w14u2Exercises));

  const w14ShowFatha = w14u1Exercises.find((row) => row.id === "exercise.wave14.presentation.ain_fatha");
  const w14ShowKasra = w14u1Exercises.find((row) => row.id === "exercise.wave14.presentation.ain_kasra");
  const w14ShowNun = w14u1Exercises.find((row) => row.id === "exercise.wave14.presentation.nun_medial");
  const w14KasraEx = w14u1Exercises.find((row) => row.id === "exercise.wave14.syllable_blending.ain_kasra");
  const w14FormEx = w14u1Exercises.find((row) => row.id === "exercise.wave14.letter_forms.nun_medial");
  assert(
    "W14.3 Unit 1 JSON opens with عَ then عِ then ـنـ presentations",
    w14u1Exercises[0]?.id === "exercise.wave14.presentation.ain_fatha" &&
      w14u1Exercises[1]?.id === "exercise.wave14.presentation.ain_kasra" &&
      w14u1Exercises[2]?.id === "exercise.wave14.presentation.nun_medial",
  );
  const nunShowResult = String(w14ShowNun?.config?.["result"] ?? "");
  assert(
    "W14.3 medial SHOW result is ـنـ not نـ",
    w14ShowNun?.config?.["show"] === "chunk" && nunShowResult === "ـنـ" && !nunShowResult.startsWith("نـ"),
  );
  const w14LiveStart = scheduleLesson(wave14Bundle, w14u1, w14u1Exercises, throughWave13);
  assert(
    "W14.3 live first beat is unscored عَ",
    w14u1Exercises[w14LiveStart.index]?.id === "exercise.wave14.presentation.ain_fatha",
  );
  const w14AfterDemos = scheduleLesson(
    wave14Bundle,
    w14u1,
    w14u1Exercises,
    { ...throughWave13, ...seenItems(w14u1Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w14LiveStart.index },
  );
  assert(
    "W14.3 live first scored beat is عِ",
    w14u1Exercises[w14AfterDemos.index]?.id === "exercise.wave14.syllable_blending.ain_kasra",
  );
  assert(
    "W14.3 presentations have no mastery targets",
    (w14ShowFatha?.masteryTargets ?? []).length === 0 &&
      (w14ShowKasra?.masteryTargets ?? []).length === 0 &&
      (w14ShowNun?.masteryTargets ?? []).length === 0,
  );
  assert("W14.3 Unit 1 has no word target", (w14u1.wordIds ?? []).length === 0 && !w14u1Exercises.some((row) => row.type === "audio_to_word"));
  assert("W14.3 Unit 1 has no missing_haraka", !w14u1Exercises.some((row) => row.type === "missing_haraka"));

  const w14u1Required = requiredRefsForUnit(wave14Bundle, w14u1, w14u1Exercises);
  const w14u1Keys = w14u1Required.map((ref) => ref.liveKey);
  assert(
    "W14.3 Unit 1 requires letter:ain.kasra and letter:nun.form.medial",
    w14u1Keys.length === 2 && w14u1Keys.includes("letter:ain.kasra") && w14u1Keys.includes("letter:nun.form.medial"),
    w14u1Keys.join(", "),
  );
  assert("W14.3 historical kasra/fatha/initial nun are not required", !w14u1Keys.includes("letter:kaf.kasra") && !w14u1Keys.includes("letter:ain.fatha") && !w14u1Keys.includes("letter:nun.form.initial"));
  assert("W14.3 mark-discrimination is not required", !w14u1Keys.includes("diacritic:ain.kasra.discrimination"));

  const ainKasraSyllable = wave14Bundle.syllables?.find((row) => row.id === "syllable.ain.kasra");
  assert("W14.3 عِ is CV kasra", ainKasraSyllable?.pattern === "CV" && ainKasraSyllable.vowelSkillId === "skill.short_vowel.kasra" && ainKasraSyllable.text === "عِ");
  const w14KasraLive = w14KasraEx?.masteryTargets?.[0]
    ? liveRefForTarget(wave14Bundle, w14KasraEx.masteryTargets[0], w14KasraEx)
    : undefined;
  const w14FormLive = w14FormEx?.masteryTargets?.[0]
    ? liveRefForTarget(wave14Bundle, w14FormEx.masteryTargets[0], w14FormEx)
    : undefined;
  assert("W14.3 live key is letter:ain.kasra", w14KasraLive?.liveKey === "letter:ain.kasra");
  assert("W14.3 live key is letter:nun.form.medial", w14FormLive?.liveKey === "letter:nun.form.medial");
  assert(
    "W14.3 generic getSyllableLiveKey produces letter:ain.kasra",
    getSyllableLiveKey({ letterLegacyId: "ain", vowelSkillId: "skill.short_vowel.kasra" }).liveKey === "letter:ain.kasra",
  );
  assert(
    "W14.3 generic getLetterFormLiveKey produces letter:nun.form.medial",
    getLetterFormLiveKey({ letterLegacyId: "nun", form: "medial" }).liveKey === "letter:nun.form.medial",
  );
  assert(
    "W14.3 generic getWordLiveKey produces word:inab.decoding",
    getWordLiveKey({ wordId: "word.inab" }).liveKey === "word:inab.decoding",
  );
  const w14FormResolved = w14FormEx ? resolveLetterRecognition(wave14Bundle, w14FormEx) : undefined;
  const w14FormPrompt = w14FormResolved?.promptGlyph ?? "";
  assert(
    "W14.3 form prompt is medial ـنـ not نـ",
    w14FormResolved?.targetForm === "medial" && w14FormPrompt === "ـنـ" && !w14FormPrompt.startsWith("نـ"),
  );
  const w14UnitMasterySrc = readFileSync(join(root, "src/lib/curriculum/unitMastery.ts"), "utf8");
  const w14SyllableAdapterSrc = readFileSync(join(root, "src/lib/curriculum/syllableAdapter.ts"), "utf8");
  const w14FormAdapterSrc = readFileSync(join(root, "src/lib/curriculum/letterRecognitionAdapter.ts"), "utf8");
  assert(
    "W14.3 engine has no ain/nun/wave14 special-case",
    !w14UnitMasterySrc.includes('letterLegacyId === "ain"') &&
      !w14UnitMasterySrc.includes('letterLegacyId === "nun"') &&
      !w14UnitMasterySrc.includes("wave14") &&
      !w14UnitMasterySrc.includes("wave-14") &&
      !w14SyllableAdapterSrc.includes("letter.ain") &&
      !w14FormAdapterSrc.includes("wave14") &&
      !w14FormAdapterSrc.includes("letter.nun"),
  );

  const w14DemosSeen = {
    ...throughWave13,
    ...seenItems(w14u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W14.3 presentations cannot pass Unit 1", !evaluateUnitMastery(wave14Bundle, w14u1, w14u1Exercises, w14DemosSeen).mastered);
  const w14KasraOnly = {
    ...throughWave13,
    ...itemsFrom(
      [{ type: "letter", id: "ain.kasra", liveKey: "letter:ain.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" }],
      [[true, true, true]],
    ),
  };
  assert("W14.3 letter:ain.kasra alone cannot pass Unit 1", !evaluateUnitMastery(wave14Bundle, w14u1, w14u1Exercises, w14KasraOnly).mastered);
  const w14NunOnly = {
    ...throughWave13,
    ...itemsFrom(
      [{ type: "letter", id: "nun.form.medial", liveKey: "letter:nun.form.medial", portableMasteryId: "x", skillId: "skill.letter_forms.positional" }],
      [[true, true, true]],
    ),
  };
  assert("W14.3 letter:nun.form.medial alone cannot pass Unit 1", !evaluateUnitMastery(wave14Bundle, w14u1, w14u1Exercises, w14NunOnly).mastered);
  const w14KafKasra = {
    ...throughWave13,
    ...itemsFrom(
      [{ type: "letter", id: "kaf.kasra", liveKey: "letter:kaf.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" }],
      [[true, true, true]],
    ),
  };
  assert("W14.3 letter:kaf.kasra cannot substitute", !evaluateUnitMastery(wave14Bundle, w14u1, w14u1Exercises, w14KafKasra).mastered);
  const w14AinFatha = {
    ...throughWave13,
    ...itemsFrom(
      [{ type: "letter", id: "ain.fatha", liveKey: "letter:ain.fatha", portableMasteryId: "x", skillId: "skill.short_vowel.fatha" }],
      [[true, true, true]],
    ),
  };
  assert("W14.3 letter:ain.fatha cannot substitute", !evaluateUnitMastery(wave14Bundle, w14u1, w14u1Exercises, w14AinFatha).mastered);
  const w14NunInitial = {
    ...throughWave13,
    ...itemsFrom(
      [{ type: "letter", id: "nun.form.initial", liveKey: "letter:nun.form.initial", portableMasteryId: "x", skillId: "skill.letter_forms.positional" }],
      [[true, true, true]],
    ),
  };
  assert("W14.3 letter:nun.form.initial cannot substitute", !evaluateUnitMastery(wave14Bundle, w14u1, w14u1Exercises, w14NunInitial).mastered);
  const w14MarkOnly = {
    ...throughWave13,
    ...itemsFrom(
      [getHarakaLiveKey({ letterLegacyId: "ain", vowelSkillId: "skill.short_vowel.kasra" })].map((keyed) => ({
        type: keyed.type,
        id: keyed.id,
        liveKey: keyed.liveKey,
        portableMasteryId: "x",
        skillId: "skill.short_vowel.kasra",
      })),
      [[true, true, true]],
    ),
  };
  assert("W14.3 mark-only kasra cannot pass Unit 1", !evaluateUnitMastery(wave14Bundle, w14u1, w14u1Exercises, w14MarkOnly).mastered);

  const w14u1Mastered = masterRequired(wave14Bundle, w14u1, w14u1Exercises, throughWave13);
  const w14u1ok = evaluateUnitMastery(wave14Bundle, w14u1, w14u1Exercises, w14u1Mastered);
  assert("W14.3 Unit 1 masters with ain kasra + medial nun", w14u1ok.mastered, w14u1ok.blockers.join("; "));
  assert(
    "W14.3 presentation attempts remain 0",
    (w14u1Mastered[getPresentationLiveKey("exercise.wave14.presentation.ain_fatha").liveKey]?.attempts ?? 0) === 0 &&
      (w14u1Mastered[getPresentationLiveKey("exercise.wave14.presentation.ain_kasra").liveKey]?.attempts ?? 0) === 0 &&
      (w14u1Mastered[getPresentationLiveKey("exercise.wave14.presentation.nun_medial").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W14.3 Unit 2 unlocks after Unit 1",
    evaluateUnitUnlock(wave14Bundle, wave14Units, w14u2, w14u1Mastered, lookupPrereqW14).unlocked,
  );

  const w14u2Required = requiredRefsForUnit(wave14Bundle, w14u2, w14u2Exercises);
  const w14InaCompose = w14u2Exercises.find((row) => row.id === "exercise.wave14.presentation.ina_compose");
  const w14InabCompose = w14u2Exercises.find((row) => row.id === "exercise.wave14.presentation.inab_compose");
  const w14AudioEx = w14u2Exercises.find((row) => row.id === "exercise.wave14.audio_to_word.inab");
  const w14PictureEx = w14u2Exercises.find((row) => row.id === "exercise.wave14.word_to_picture.inab");
  assert(
    "W14.4 Unit 2 JSON opens with both compose presentations",
    w14u2Exercises[0]?.id === "exercise.wave14.presentation.ina_compose" &&
      w14u2Exercises[1]?.id === "exercise.wave14.presentation.inab_compose",
  );
  assert(
    "W14.4 compose is عِ + نَ then isolated ب",
    w14InaCompose?.config?.["left"] === "عِ" &&
      w14InaCompose.config?.["right"] === "نَ" &&
      w14InabCompose?.config?.["left"] === "عِنَ" &&
      w14InabCompose.config?.["right"] === "ب" &&
      w14InabCompose.config?.["result"] === "عِنَب",
  );
  const w14u2LiveStart = scheduleLesson(wave14Bundle, w14u2, w14u2Exercises, w14u1Mastered);
  assert("W14.4 live first beat is unscored compose", w14u2Exercises[w14u2LiveStart.index]?.type === "presentation");
  const w14u2AfterDemos = scheduleLesson(
    wave14Bundle,
    w14u2,
    w14u2Exercises,
    { ...w14u1Mastered, ...seenItems(w14u2Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w14u2LiveStart.index },
  );
  assert("W14.4 live first scored beat is audio_to_word", w14u2Exercises[w14u2AfterDemos.index]?.id === "exercise.wave14.audio_to_word.inab");
  assert("W14.4 picture is after audio", (w14u2Exercises.findIndex((row) => row.id === "exercise.wave14.word_to_picture.inab") > w14u2Exercises.findIndex((row) => row.id === "exercise.wave14.audio_to_word.inab")));
  assert("W14.4 Unit 2 requires word:inab.decoding only", w14u2Required.length === 1 && w14u2Required[0]?.liveKey === "word:inab.decoding", w14u2Required.map((ref) => ref.liveKey).join(", "));
  assert("W14.4 picture is reinforcement", Boolean(w14PictureEx?.tags?.includes("reinforcement")));
  assert("W14.4 no required review", w14u2Exercises.every((row) => !row.tags?.includes("review")));

  const inabWord = wave14Bundle.words.find((row) => row.id === "word.inab");
  const inabVisual = inabWord ? prototypeVisualForWord(inabWord) : undefined;
  assert("word.inab maps to fruits-4", inabWord?.legacyId === "fruits-4");
  assert(
    "word.inab is Band A عِنَب",
    inabWord?.vocabBand === "A" && inabWord.subBand === "A3" && inabWord.lemma === "عنب" && inabWord.teachingForm === "عِنَب",
  );
  assert("word.inab prototype visual is 🍇", inabVisual?.kind === "emoji" && inabVisual.emoji === "🍇");
  const inabForms = inabWord?.requiredLetterForms ?? [];
  assert(
    "W14.4 joining records ain initial, nun medial, ba final",
    inabForms.some((row) => row.letterId === "letter.ain" && row.form === "initial") &&
      inabForms.some((row) => row.letterId === "letter.nun" && row.form === "medial") &&
      inabForms.some((row) => row.letterId === "letter.ba" && row.form === "final") &&
      !inabForms.some((row) => row.letterId === "letter.ba" && row.form === "isolated") &&
      !inabForms.some((row) => row.letterId === "letter.nun" && row.form === "initial"),
  );
  assert("W14.4 ain is dual-joining", wave14Bundle.letters.find((row) => row.id === "letter.ain")?.nonConnecting !== true);
  assert("W14.4 nun is dual-joining", wave14Bundle.letters.find((row) => row.id === "letter.nun")?.nonConnecting !== true);
  assert("W14.4 ba is dual-joining", wave14Bundle.letters.find((row) => row.id === "letter.ba")?.nonConnecting !== true);
  assert("W14.4 no sukun on عِنَب", !(inabWord?.teachingForm ?? "").includes("\u0652") && !(inabWord?.phonicsSkillIds ?? []).includes("skill.sukun.basic"));

  const w14ComposeOnly = {
    ...w14u1Mastered,
    ...seenItems(w14u2Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W14.4 compose cannot pass Unit 2", !evaluateUnitMastery(wave14Bundle, w14u2, w14u2Exercises, w14ComposeOnly).mastered);
  const w14PictureOnly = w14PictureEx ? activitySeen(w14PictureEx) : {};
  assert("W14.4 picture cannot pass Unit 2", !evaluateUnitMastery(wave14Bundle, w14u2, w14u2Exercises, { ...w14u1Mastered, ...w14PictureOnly }).mastered);
  const w14HistoricalDecode = {
    ...w14u1Mastered,
    ...itemsFrom(
      [
        { type: "word", id: "asal.decoding", liveKey: "word:asal.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "kitab.decoding", liveKey: "word:kitab.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "nar.decoding", liveKey: "word:nar.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
      ],
      [[true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("W14.4 historical decoding keys cannot substitute", !evaluateUnitMastery(wave14Bundle, w14u2, w14u2Exercises, w14HistoricalDecode).mastered);

  const w14u2Mastered = masterRequired(wave14Bundle, w14u2, w14u2Exercises, w14u1Mastered);
  const w14u2ok = evaluateUnitMastery(wave14Bundle, w14u2, w14u2Exercises, w14u2Mastered);
  assert("W14.4 Unit 2 masters with word:inab.decoding", w14u2ok.mastered, w14u2ok.blockers.join("; "));
  assert(
    "W14.4 compose presentation attempts remain 0",
    (w14u2Mastered[getPresentationLiveKey("exercise.wave14.presentation.ina_compose").liveKey]?.attempts ?? 0) === 0 &&
      (w14u2Mastered[getPresentationLiveKey("exercise.wave14.presentation.inab_compose").liveKey]?.attempts ?? 0) === 0,
  );

  const allW14Keys = [...w14u1Required, ...w14u2Required].map((ref) => ref.liveKey);
  assert("W14.5 only the three required live keys", allW14Keys.sort().join(",") === ["letter:ain.kasra", "letter:nun.form.medial", "word:inab.decoding"].sort().join(","));
  assert("W14.5 no letter:kaf.kasra gate", !allW14Keys.includes("letter:kaf.kasra"));
  assert("W14.5 no damma/ū/ī/closed/discrimination keys", !allW14Keys.some((key) => key.includes("damma") || key.includes("madd_waw") || key.includes("madd_ya") || key.includes("discrimination") || key.endsWith(".closed")));
  assert("W14.5 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-17"));
  assert("W14.5 Wave 14 is registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE14_SLUG") && resolveLearnSrcEarly.includes("getWave14Bundle") && resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));
  assert("W14.5 Wave 13 final unit id is unchanged", w13u3.id === "unit.literacy.wave13.kitab");
  assert("W14.5 Wave 1–13 mastery still holds after Wave 14 load", w13u3ok.mastered && w12u2ok.mastered);
  const frozenPriorWavesW14 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path, wave10Path, wave11Path, wave12Path, wave13Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("unit.literacy.wave14") && !src.includes("path.literacy.wave14") && !src.includes("literacy-path.wave-14");
  });
  assert("W14.5 Waves 1–13 lesson JSON stay free of Wave 14 unit/path ids", frozenPriorWavesW14);
  assert("W14.5 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));

  const w14Report = readFileSync(join(root, "docs/literacy-wave-14-report.md"), "utf8");
  assert("W14 report exists and postpones Wave 15", /Wave 15 is not implemented/i.test(w14Report) && w14Report.includes("عِنَب"));

  const wave15Raw = JSON.parse(readFileSync(wave15Path, "utf8"));
  const wave15Validation = validateCurriculum(wave15Raw);
  assert("Wave 15 production JSON validates", wave15Validation.ok, wave15Validation.issues.map((issue) => issue.message).join("; "));
  const wave15Bundle = asCurriculumBundle(wave15Raw);
  const wave15PathRow = wave15Bundle.paths?.find((row) => row.id === WAVE15_PATH_ID);
  if (!wave15PathRow) throw new Error("Wave 15 path missing");
  const wave15ById = new Map((wave15Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave15Units = wave15PathRow.unitIds.flatMap((id) => {
    const unit = wave15ById.get(id);
    return unit ? [unit] : [];
  });
  const w15u1 = wave15Units[0];
  const w15u2 = wave15Units[1];
  if (!w15u1 || !w15u2) throw new Error("Wave 15 units 1–2 missing");
  assert("Wave 15 declares exactly two units", wave15Units.length === 2);
  assert("Wave 15 has no third unit", wave15Units[2] === undefined);
  assert("Wave 15 Unit 1 prereq is Wave 14 final unit", w15u1.prereqUnitIds?.[0] === "unit.literacy.wave14.inab");
  assert(
    "Wave 15 child titles are جِ / جِسْم",
    w15u1.titleAr === "جِ" && w15u2.titleAr === "جِسْم" && w15u2.childGoalAr === "جِسْم",
  );

  const lookupPrereqW15 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w15 = wave15Bundle.units?.find((row) => row.id === id);
    if (w15) return { bundle: wave15Bundle, unit: w15 };
    const w14 = wave14Bundle.units?.find((row) => row.id === id);
    if (w14) return { bundle: wave14Bundle, unit: w14 };
    return lookupPrereqW14(id);
  };

  const w15u1Exercises = exercisesForUnit(wave15Bundle, w15u1);
  const w15u2Exercises = exercisesForUnit(wave15Bundle, w15u2);
  const throughWave14 = w14u2Mastered;

  assert(
    "W15.1 Wave 15 locked before Wave 14 final mastery",
    !evaluateUnitUnlock(wave15Bundle, wave15Units, w15u1, w14u1Mastered, lookupPrereqW15).unlocked,
  );
  const w15u1Unlock = evaluateUnitUnlock(wave15Bundle, wave15Units, w15u1, throughWave14, lookupPrereqW15);
  assert("W15.2 Wave 15 Unit 1 unlocks after Wave 14 mastery", w15u1Unlock.unlocked, w15u1Unlock.blockers.join("; "));
  assert(
    "W15.2 Unit 2 stays locked until Unit 1",
    !evaluateUnitUnlock(wave15Bundle, wave15Units, w15u2, throughWave14, lookupPrereqW15).unlocked,
  );
  assert("W15.2 renderers ready", unitRenderersReady(w15u1Exercises) && unitRenderersReady(w15u2Exercises));

  const w15ShowFatha = w15u1Exercises.find((row) => row.id === "exercise.wave15.presentation.jim_fatha");
  const w15ShowKasra = w15u1Exercises.find((row) => row.id === "exercise.wave15.presentation.jim_kasra");
  const w15ShowClosed = w15u1Exercises.find((row) => row.id === "exercise.wave15.presentation.jis_closed");
  const w15KasraEx = w15u1Exercises.find((row) => row.id === "exercise.wave15.syllable_blending.jim_kasra");
  const w15CvcEx = w15u1Exercises.find((row) => row.id === "exercise.wave15.syllable_blending.jis_closed");
  assert(
    "W15.3 Unit 1 JSON opens with جَ then جِ then جِسْ presentations",
    w15u1Exercises[0]?.id === "exercise.wave15.presentation.jim_fatha" &&
      w15u1Exercises[1]?.id === "exercise.wave15.presentation.jim_kasra" &&
      w15u1Exercises[2]?.id === "exercise.wave15.presentation.jis_closed",
  );
  assert(
    "W15.3 closed SHOW is جِ + سْ → جِسْ",
    w15ShowClosed?.config?.["show"] === "chunk" &&
      w15ShowClosed.config?.["left"] === "جِ" &&
      w15ShowClosed.config?.["right"] === "سْ" &&
      w15ShowClosed.config?.["result"] === "جِسْ",
  );
  const w15LiveStart = scheduleLesson(wave15Bundle, w15u1, w15u1Exercises, throughWave14);
  assert(
    "W15.3 live first beat is unscored جَ",
    w15u1Exercises[w15LiveStart.index]?.id === "exercise.wave15.presentation.jim_fatha",
  );
  const w15AfterDemos = scheduleLesson(
    wave15Bundle,
    w15u1,
    w15u1Exercises,
    { ...throughWave14, ...seenItems(w15u1Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w15LiveStart.index },
  );
  assert(
    "W15.3 live first scored beat is جِ",
    w15u1Exercises[w15AfterDemos.index]?.id === "exercise.wave15.syllable_blending.jim_kasra",
  );
  assert(
    "W15.3 presentations have no mastery targets",
    (w15ShowFatha?.masteryTargets ?? []).length === 0 &&
      (w15ShowKasra?.masteryTargets ?? []).length === 0 &&
      (w15ShowClosed?.masteryTargets ?? []).length === 0,
  );
  assert("W15.3 Unit 1 has no word target", (w15u1.wordIds ?? []).length === 0 && !w15u1Exercises.some((row) => row.type === "audio_to_word"));
  assert("W15.3 Unit 1 has no missing_haraka or form quiz", !w15u1Exercises.some((row) => row.type === "missing_haraka" || row.type === "letter_recognition"));

  const w15u1Required = requiredRefsForUnit(wave15Bundle, w15u1, w15u1Exercises);
  const w15u1Keys = w15u1Required.map((ref) => ref.liveKey);
  assert(
    "W15.3 Unit 1 requires letter:jim.kasra and letter:jis.closed",
    w15u1Keys.length === 2 && w15u1Keys.includes("letter:jim.kasra") && w15u1Keys.includes("letter:jis.closed"),
    w15u1Keys.join(", "),
  );
  assert(
    "W15.3 historical kasra/fatha/madd/ram.closed are not required",
    !w15u1Keys.includes("letter:kaf.kasra") &&
      !w15u1Keys.includes("letter:ain.kasra") &&
      !w15u1Keys.includes("letter:jim.fatha") &&
      !w15u1Keys.includes("letter:jim.madd_alif") &&
      !w15u1Keys.includes("letter:ram.closed"),
  );
  assert("W15.3 mark-discrimination is not required", !w15u1Keys.includes("diacritic:jim.kasra.discrimination") && !w15u1Keys.includes("diacritic:mim.sukun.discrimination"));

  const jimKasraSyllable = wave15Bundle.syllables?.find((row) => row.id === "syllable.jim.kasra");
  const jisClosedSyllable = wave15Bundle.syllables?.find((row) => row.id === "syllable.jis.closed");
  assert("W15.3 جِ is CV kasra", jimKasraSyllable?.pattern === "CV" && jimKasraSyllable.vowelSkillId === "skill.short_vowel.kasra" && jimKasraSyllable.text === "جِ");
  assert(
    "W15.3 جِسْ is CVC kasra+sukun",
    jisClosedSyllable?.pattern === "CVC" &&
      jisClosedSyllable.vowelSkillId === "skill.short_vowel.kasra" &&
      jisClosedSyllable.text === "جِسْ" &&
      (jisClosedSyllable.requiredLetterIds ?? []).includes("letter.jim") &&
      (jisClosedSyllable.requiredLetterIds ?? []).includes("letter.sin"),
  );
  const w15KasraLive = w15KasraEx?.masteryTargets?.[0]
    ? liveRefForTarget(wave15Bundle, w15KasraEx.masteryTargets[0], w15KasraEx)
    : undefined;
  const w15CvcLive = w15CvcEx?.masteryTargets?.[0]
    ? liveRefForTarget(wave15Bundle, w15CvcEx.masteryTargets[0], w15CvcEx)
    : undefined;
  assert("W15.3 live key is letter:jim.kasra", w15KasraLive?.liveKey === "letter:jim.kasra");
  assert("W15.3 live key is letter:jis.closed", w15CvcLive?.liveKey === "letter:jis.closed");
  assert(
    "W15.3 generic getSyllableLiveKey produces letter:jim.kasra",
    getSyllableLiveKey({ letterLegacyId: "jim", vowelSkillId: "skill.short_vowel.kasra" }).liveKey === "letter:jim.kasra",
  );
  assert(
    "W15.3 generic getClosedChunkLiveKey produces letter:jis.closed",
    getClosedChunkLiveKey({ syllableId: "syllable.jis.closed" }).liveKey === "letter:jis.closed",
  );
  assert(
    "W15.3 generic getWordLiveKey produces word:jism.decoding",
    getWordLiveKey({ wordId: "word.jism" }).liveKey === "word:jism.decoding",
  );
  const w15UnitMasterySrc = readFileSync(join(root, "src/lib/curriculum/unitMastery.ts"), "utf8");
  const w15SyllableAdapterSrc = readFileSync(join(root, "src/lib/curriculum/syllableAdapter.ts"), "utf8");
  assert(
    "W15.3 engine has no jim/jis/wave15 special-case",
    !w15UnitMasterySrc.includes('letterLegacyId === "jim"') &&
      !w15UnitMasterySrc.includes("wave15") &&
      !w15UnitMasterySrc.includes("wave-15") &&
      !w15SyllableAdapterSrc.includes("letter.jim") &&
      !w15SyllableAdapterSrc.includes("jis.closed"),
  );

  const w15DemosSeen = {
    ...throughWave14,
    ...seenItems(w15u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W15.3 presentations cannot pass Unit 1", !evaluateUnitMastery(wave15Bundle, w15u1, w15u1Exercises, w15DemosSeen).mastered);
  const w15KasraOnly = {
    ...throughWave14,
    ...itemsFrom(
      [{ type: "letter", id: "jim.kasra", liveKey: "letter:jim.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" }],
      [[true, true, true]],
    ),
  };
  assert("W15.3 letter:jim.kasra alone cannot pass Unit 1", !evaluateUnitMastery(wave15Bundle, w15u1, w15u1Exercises, w15KasraOnly).mastered);
  const w15ClosedOnly = {
    ...throughWave14,
    ...itemsFrom(
      [{ type: "letter", id: "jis.closed", liveKey: "letter:jis.closed", portableMasteryId: "x", skillId: "skill.syllable_blending.cvc" }],
      [[true, true, true]],
    ),
  };
  assert("W15.3 letter:jis.closed alone cannot pass Unit 1", !evaluateUnitMastery(wave15Bundle, w15u1, w15u1Exercises, w15ClosedOnly).mastered);
  const w15KafKasra = {
    ...throughWave14,
    ...itemsFrom(
      [{ type: "letter", id: "kaf.kasra", liveKey: "letter:kaf.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" }],
      [[true, true, true]],
    ),
  };
  assert("W15.3 letter:kaf.kasra cannot substitute", !evaluateUnitMastery(wave15Bundle, w15u1, w15u1Exercises, w15KafKasra).mastered);
  const w15AinKasra = {
    ...throughWave14,
    ...itemsFrom(
      [{ type: "letter", id: "ain.kasra", liveKey: "letter:ain.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" }],
      [[true, true, true]],
    ),
  };
  assert("W15.3 letter:ain.kasra cannot substitute", !evaluateUnitMastery(wave15Bundle, w15u1, w15u1Exercises, w15AinKasra).mastered);
  const w15JimFatha = {
    ...throughWave14,
    ...itemsFrom(
      [{ type: "letter", id: "jim.fatha", liveKey: "letter:jim.fatha", portableMasteryId: "x", skillId: "skill.short_vowel.fatha" }],
      [[true, true, true]],
    ),
  };
  assert("W15.3 letter:jim.fatha cannot substitute", !evaluateUnitMastery(wave15Bundle, w15u1, w15u1Exercises, w15JimFatha).mastered);
  const w15JimMadd = {
    ...throughWave14,
    ...itemsFrom(
      [{ type: "letter", id: "jim.madd_alif", liveKey: "letter:jim.madd_alif", portableMasteryId: "x", skillId: "skill.long_vowel.madd" }],
      [[true, true, true]],
    ),
  };
  assert("W15.3 letter:jim.madd_alif cannot substitute", !evaluateUnitMastery(wave15Bundle, w15u1, w15u1Exercises, w15JimMadd).mastered);
  const w15RamClosed = {
    ...throughWave14,
    ...itemsFrom(
      [{ type: "letter", id: "ram.closed", liveKey: "letter:ram.closed", portableMasteryId: "x", skillId: "skill.syllable_blending.cvc" }],
      [[true, true, true]],
    ),
  };
  assert("W15.3 letter:ram.closed cannot substitute", !evaluateUnitMastery(wave15Bundle, w15u1, w15u1Exercises, w15RamClosed).mastered);
  const w15MarkOnly = {
    ...throughWave14,
    ...itemsFrom(
      [getHarakaLiveKey({ letterLegacyId: "jim", vowelSkillId: "skill.short_vowel.kasra" })].map((keyed) => ({
        type: keyed.type,
        id: keyed.id,
        liveKey: keyed.liveKey,
        portableMasteryId: "x",
        skillId: "skill.short_vowel.kasra",
      })),
      [[true, true, true]],
    ),
  };
  assert("W15.3 mark-only kasra cannot pass Unit 1", !evaluateUnitMastery(wave15Bundle, w15u1, w15u1Exercises, w15MarkOnly).mastered);

  const w15u1Mastered = masterRequired(wave15Bundle, w15u1, w15u1Exercises, throughWave14);
  const w15u1ok = evaluateUnitMastery(wave15Bundle, w15u1, w15u1Exercises, w15u1Mastered);
  assert("W15.3 Unit 1 masters with jim kasra + jis closed", w15u1ok.mastered, w15u1ok.blockers.join("; "));
  assert(
    "W15.3 presentation attempts remain 0",
    (w15u1Mastered[getPresentationLiveKey("exercise.wave15.presentation.jim_fatha").liveKey]?.attempts ?? 0) === 0 &&
      (w15u1Mastered[getPresentationLiveKey("exercise.wave15.presentation.jim_kasra").liveKey]?.attempts ?? 0) === 0 &&
      (w15u1Mastered[getPresentationLiveKey("exercise.wave15.presentation.jis_closed").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W15.3 Unit 2 unlocks after Unit 1",
    evaluateUnitUnlock(wave15Bundle, wave15Units, w15u2, w15u1Mastered, lookupPrereqW15).unlocked,
  );

  const w15u2Required = requiredRefsForUnit(wave15Bundle, w15u2, w15u2Exercises);
  const w15Compose = w15u2Exercises.find((row) => row.id === "exercise.wave15.presentation.jism_compose");
  const w15AudioEx = w15u2Exercises.find((row) => row.id === "exercise.wave15.audio_to_word.jism");
  const w15PictureEx = w15u2Exercises.find((row) => row.id === "exercise.wave15.word_to_picture.jism");
  assert("W15.4 Unit 2 JSON opens with compose presentation", w15u2Exercises[0]?.id === "exercise.wave15.presentation.jism_compose");
  assert(
    "W15.4 compose is جِسْ + isolated م → جِسْم",
    w15Compose?.config?.["left"] === "جِسْ" && w15Compose.config?.["right"] === "م" && w15Compose.config?.["result"] === "جِسْم",
  );
  const w15u2LiveStart = scheduleLesson(wave15Bundle, w15u2, w15u2Exercises, w15u1Mastered);
  assert("W15.4 live first beat is unscored compose", w15u2Exercises[w15u2LiveStart.index]?.type === "presentation");
  const w15u2AfterDemos = scheduleLesson(
    wave15Bundle,
    w15u2,
    w15u2Exercises,
    { ...w15u1Mastered, ...seenItems(w15u2Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w15u2LiveStart.index },
  );
  assert("W15.4 live first scored beat is audio_to_word", w15u2Exercises[w15u2AfterDemos.index]?.id === "exercise.wave15.audio_to_word.jism");
  assert("W15.4 picture is after audio", (w15u2Exercises.findIndex((row) => row.id === "exercise.wave15.word_to_picture.jism") > w15u2Exercises.findIndex((row) => row.id === "exercise.wave15.audio_to_word.jism")));
  assert("W15.4 Unit 2 requires word:jism.decoding only", w15u2Required.length === 1 && w15u2Required[0]?.liveKey === "word:jism.decoding", w15u2Required.map((ref) => ref.liveKey).join(", "));
  assert("W15.4 picture is reinforcement", Boolean(w15PictureEx?.tags?.includes("reinforcement")));
  assert("W15.4 no required review", w15u2Exercises.every((row) => !row.tags?.includes("review")));

  const jismWord = wave15Bundle.words.find((row) => row.id === "word.jism");
  const jismVisual = jismWord ? prototypeVisualForWord(jismWord) : undefined;
  assert("word.jism maps to body-40", jismWord?.legacyId === "body-40");
  assert(
    "word.jism is Band A جِسْم",
    jismWord?.vocabBand === "A" && jismWord.subBand === "A3" && jismWord.lemma === "جسم" && jismWord.teachingForm === "جِسْم",
  );
  assert("word.jism prototype visual is 🧍", jismVisual?.kind === "emoji" && jismVisual.emoji === "🧍");
  const jismForms = jismWord?.requiredLetterForms ?? [];
  assert(
    "W15.4 joining records jim initial, sin medial, mim final",
    jismForms.some((row) => row.letterId === "letter.jim" && row.form === "initial") &&
      jismForms.some((row) => row.letterId === "letter.sin" && row.form === "medial") &&
      jismForms.some((row) => row.letterId === "letter.mim" && row.form === "final") &&
      !jismForms.some((row) => row.letterId === "letter.mim" && row.form === "isolated"),
  );
  assert("W15.4 jim is dual-joining", wave15Bundle.letters.find((row) => row.id === "letter.jim")?.nonConnecting !== true);
  assert("W15.4 sin is dual-joining", wave15Bundle.letters.find((row) => row.id === "letter.sin")?.nonConnecting !== true);
  assert("W15.4 jism has sukun", (jismWord?.teachingForm ?? "").includes("\u0652") && (jismWord?.phonicsSkillIds ?? []).includes("skill.sukun.basic"));
  assert("W15.4 jism has no fatha skill", !(jismWord?.phonicsSkillIds ?? []).includes("skill.short_vowel.fatha"));

  const w15ComposeOnly = {
    ...w15u1Mastered,
    ...seenItems(w15u2Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W15.4 compose cannot pass Unit 2", !evaluateUnitMastery(wave15Bundle, w15u2, w15u2Exercises, w15ComposeOnly).mastered);
  const w15PictureOnly = w15PictureEx ? activitySeen(w15PictureEx) : {};
  assert("W15.4 picture cannot pass Unit 2", !evaluateUnitMastery(wave15Bundle, w15u2, w15u2Exercises, { ...w15u1Mastered, ...w15PictureOnly }).mastered);
  const w15HistoricalDecode = {
    ...w15u1Mastered,
    ...itemsFrom(
      [
        { type: "word", id: "jamal.decoding", liveKey: "word:jamal.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "shams.decoding", liveKey: "word:shams.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "inab.decoding", liveKey: "word:inab.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
      ],
      [[true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("W15.4 historical decoding keys cannot substitute", !evaluateUnitMastery(wave15Bundle, w15u2, w15u2Exercises, w15HistoricalDecode).mastered);

  const w15u2Mastered = masterRequired(wave15Bundle, w15u2, w15u2Exercises, w15u1Mastered);
  const w15u2ok = evaluateUnitMastery(wave15Bundle, w15u2, w15u2Exercises, w15u2Mastered);
  assert("W15.4 Unit 2 masters with word:jism.decoding", w15u2ok.mastered, w15u2ok.blockers.join("; "));
  assert(
    "W15.4 compose presentation attempts remain 0",
    (w15u2Mastered[getPresentationLiveKey("exercise.wave15.presentation.jism_compose").liveKey]?.attempts ?? 0) === 0,
  );

  const allW15Keys = [...w15u1Required, ...w15u2Required].map((ref) => ref.liveKey);
  assert("W15.5 only the three required live keys", allW15Keys.sort().join(",") === ["letter:jim.kasra", "letter:jis.closed", "word:jism.decoding"].sort().join(","));
  assert("W15.5 no extra .closed key", allW15Keys.filter((key) => key.endsWith(".closed")).join(",") === "letter:jis.closed");
  assert("W15.5 no damma/ū/ī/discrimination/form keys", !allW15Keys.some((key) => key.includes("damma") || key.includes("madd_waw") || key.includes("madd_ya") || key.includes("discrimination") || key.includes(".form.")));
  assert("W15.5 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-17"));
  assert("W15.5 Wave 15 is registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE15_SLUG") && resolveLearnSrcEarly.includes("getWave15Bundle") && resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));
  assert("W15.5 Wave 14 final unit id is unchanged", w14u2.id === "unit.literacy.wave14.inab");
  assert("W15.5 Wave 1–14 mastery still holds after Wave 15 load", w14u2ok.mastered && w13u3ok.mastered);
  const frozenPriorWavesW15 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path, wave10Path, wave11Path, wave12Path, wave13Path, wave14Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("unit.literacy.wave15") && !src.includes("path.literacy.wave15") && !src.includes("literacy-path.wave-15");
  });
  assert("W15.5 Waves 1–14 lesson JSON stay free of Wave 15 unit/path ids", frozenPriorWavesW15);
  assert("W15.5 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));

  const w15Report = readFileSync(join(root, "docs/literacy-wave-15-report.md"), "utf8");
  assert("W15 report exists and postpones Wave 16", /Wave 16 is not implemented/i.test(w15Report) && w15Report.includes("جِسْم"));

  const wave16Raw = JSON.parse(readFileSync(wave16Path, "utf8"));
  const wave16Validation = validateCurriculum(wave16Raw);
  assert("Wave 16 production JSON validates", wave16Validation.ok, wave16Validation.issues.map((issue) => issue.message).join("; "));
  const wave16Bundle = asCurriculumBundle(wave16Raw);
  const wave16PathRow = wave16Bundle.paths?.find((row) => row.id === WAVE16_PATH_ID);
  if (!wave16PathRow) throw new Error("Wave 16 path missing");
  const wave16ById = new Map((wave16Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave16Units = wave16PathRow.unitIds.flatMap((id) => {
    const unit = wave16ById.get(id);
    return unit ? [unit] : [];
  });
  const w16u1 = wave16Units[0];
  const w16u2 = wave16Units[1];
  if (!w16u1 || !w16u2) throw new Error("Wave 16 units 1–2 missing");
  assert("Wave 16 declares exactly two units", wave16Units.length === 2);
  assert("Wave 16 has no third unit", wave16Units[2] === undefined);
  assert("Wave 16 Unit 1 prereq is Wave 15 final unit", w16u1.prereqUnitIds?.[0] === "unit.literacy.wave15.jism");
  assert(
    "Wave 16 child titles are بِ / بِنْت",
    w16u1.titleAr === "بِ" && w16u2.titleAr === "بِنْت" && w16u2.childGoalAr === "بِنْت",
  );

  const lookupPrereqW16 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w16 = wave16Bundle.units?.find((row) => row.id === id);
    if (w16) return { bundle: wave16Bundle, unit: w16 };
    const w15 = wave15Bundle.units?.find((row) => row.id === id);
    if (w15) return { bundle: wave15Bundle, unit: w15 };
    return lookupPrereqW15(id);
  };

  const w16u1Exercises = exercisesForUnit(wave16Bundle, w16u1);
  const w16u2Exercises = exercisesForUnit(wave16Bundle, w16u2);
  const throughWave15 = w15u2Mastered;

  assert(
    "W16.1 Wave 16 locked before Wave 15 final mastery",
    !evaluateUnitUnlock(wave16Bundle, wave16Units, w16u1, w15u1Mastered, lookupPrereqW16).unlocked,
  );
  const w16u1Unlock = evaluateUnitUnlock(wave16Bundle, wave16Units, w16u1, throughWave15, lookupPrereqW16);
  assert("W16.2 Wave 16 Unit 1 unlocks after Wave 15 mastery", w16u1Unlock.unlocked, w16u1Unlock.blockers.join("; "));
  assert(
    "W16.2 Unit 2 stays locked until Unit 1",
    !evaluateUnitUnlock(wave16Bundle, wave16Units, w16u2, throughWave15, lookupPrereqW16).unlocked,
  );
  assert("W16.2 renderers ready", unitRenderersReady(w16u1Exercises) && unitRenderersReady(w16u2Exercises));

  const w16ShowFatha = w16u1Exercises.find((row) => row.id === "exercise.wave16.presentation.ba_fatha");
  const w16ShowKasra = w16u1Exercises.find((row) => row.id === "exercise.wave16.presentation.ba_kasra");
  const w16ShowFinal = w16u1Exercises.find((row) => row.id === "exercise.wave16.presentation.ta_final");
  const w16KasraEx = w16u1Exercises.find((row) => row.id === "exercise.wave16.syllable_blending.ba_kasra");
  const w16FormEx = w16u1Exercises.find((row) => row.id === "exercise.wave16.letter_forms.ta_final");
  assert(
    "W16.3 Unit 1 JSON opens with بَ then بِ then ـت presentations",
    w16u1Exercises[0]?.id === "exercise.wave16.presentation.ba_fatha" &&
      w16u1Exercises[1]?.id === "exercise.wave16.presentation.ba_kasra" &&
      w16u1Exercises[2]?.id === "exercise.wave16.presentation.ta_final",
  );
  assert(
    "W16.3 final SHOW result is ـت",
    w16ShowFinal?.config?.["show"] === "chunk" && w16ShowFinal.config?.["result"] === "ـت",
  );
  const w16LiveStart = scheduleLesson(wave16Bundle, w16u1, w16u1Exercises, throughWave15);
  assert(
    "W16.3 live first beat is unscored بَ",
    w16u1Exercises[w16LiveStart.index]?.id === "exercise.wave16.presentation.ba_fatha",
  );
  const w16AfterDemos = scheduleLesson(
    wave16Bundle,
    w16u1,
    w16u1Exercises,
    { ...throughWave15, ...seenItems(w16u1Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w16LiveStart.index },
  );
  assert(
    "W16.3 live first scored beat is بِ",
    w16u1Exercises[w16AfterDemos.index]?.id === "exercise.wave16.syllable_blending.ba_kasra",
  );
  assert(
    "W16.3 presentations have no mastery targets",
    (w16ShowFatha?.masteryTargets ?? []).length === 0 &&
      (w16ShowKasra?.masteryTargets ?? []).length === 0 &&
      (w16ShowFinal?.masteryTargets ?? []).length === 0,
  );
  assert("W16.3 Unit 1 has no word target", (w16u1.wordIds ?? []).length === 0 && !w16u1Exercises.some((row) => row.type === "audio_to_word"));
  assert("W16.3 Unit 1 has no بِنْ presentation", !w16u1Exercises.some((row) => row.config?.["result"] === "بِنْ"));
  assert("W16.3 Unit 1 has no missing_haraka", !w16u1Exercises.some((row) => row.type === "missing_haraka"));
  assert("W16.3 no scored CVC / bin.closed", !wave16Bundle.syllables?.some((row) => row.id === "syllable.bin.closed" || row.pattern === "CVC"));

  const w16u1Required = requiredRefsForUnit(wave16Bundle, w16u1, w16u1Exercises);
  const w16u1Keys = w16u1Required.map((ref) => ref.liveKey);
  assert(
    "W16.3 Unit 1 requires letter:ba.kasra and letter:ta.form.final",
    w16u1Keys.length === 2 && w16u1Keys.includes("letter:ba.kasra") && w16u1Keys.includes("letter:ta.form.final"),
    w16u1Keys.join(", "),
  );
  assert(
    "W16.3 historical kasra/fatha/madd/closed/ta medial are not required",
    !w16u1Keys.includes("letter:kaf.kasra") &&
      !w16u1Keys.includes("letter:ain.kasra") &&
      !w16u1Keys.includes("letter:jim.kasra") &&
      !w16u1Keys.includes("letter:ba.fatha") &&
      !w16u1Keys.includes("letter:ba.madd_alif") &&
      !w16u1Keys.includes("letter:jis.closed") &&
      !w16u1Keys.includes("letter:ram.closed") &&
      !w16u1Keys.includes("letter:bin.closed") &&
      !w16u1Keys.includes("letter:ta.form.medial") &&
      !w16u1Keys.includes("letter:ta.form.initial") &&
      !w16u1Keys.includes("letter:nun.form.medial"),
  );
  assert("W16.3 mark-discrimination is not required", !w16u1Keys.includes("diacritic:ba.kasra.discrimination") && !w16u1Keys.includes("diacritic:mim.sukun.discrimination"));

  const baKasraSyllable = wave16Bundle.syllables?.find((row) => row.id === "syllable.ba.kasra");
  assert("W16.3 بِ is CV kasra", baKasraSyllable?.pattern === "CV" && baKasraSyllable.vowelSkillId === "skill.short_vowel.kasra" && baKasraSyllable.text === "بِ");
  const w16KasraLive = w16KasraEx?.masteryTargets?.[0]
    ? liveRefForTarget(wave16Bundle, w16KasraEx.masteryTargets[0], w16KasraEx)
    : undefined;
  const w16FormLive = w16FormEx?.masteryTargets?.[0]
    ? liveRefForTarget(wave16Bundle, w16FormEx.masteryTargets[0], w16FormEx)
    : undefined;
  assert("W16.3 live key is letter:ba.kasra", w16KasraLive?.liveKey === "letter:ba.kasra");
  assert("W16.3 live key is letter:ta.form.final", w16FormLive?.liveKey === "letter:ta.form.final");
  assert(
    "W16.3 generic getSyllableLiveKey produces letter:ba.kasra",
    getSyllableLiveKey({ letterLegacyId: "ba", vowelSkillId: "skill.short_vowel.kasra" }).liveKey === "letter:ba.kasra",
  );
  assert(
    "W16.3 generic getLetterFormLiveKey produces letter:ta.form.final",
    getLetterFormLiveKey({ letterLegacyId: "ta", form: "final" }).liveKey === "letter:ta.form.final",
  );
  assert(
    "W16.3 generic getWordLiveKey produces word:bint.decoding",
    getWordLiveKey({ wordId: "word.bint" }).liveKey === "word:bint.decoding",
  );
  const w16FormResolved = w16FormEx ? resolveLetterRecognition(wave16Bundle, w16FormEx) : undefined;
  assert("W16.3 form prompt glyph is ـت", w16FormResolved?.promptGlyph === "ـت" && w16FormResolved.targetForm === "final");
  const w16UnitMasterySrc = readFileSync(join(root, "src/lib/curriculum/unitMastery.ts"), "utf8");
  const w16SyllableAdapterSrc = readFileSync(join(root, "src/lib/curriculum/syllableAdapter.ts"), "utf8");
  assert(
    "W16.3 engine has no ba/bint/wave16 special-case",
    !w16UnitMasterySrc.includes('letterLegacyId === "ba"') &&
      !w16UnitMasterySrc.includes("wave16") &&
      !w16UnitMasterySrc.includes("wave-16") &&
      !w16SyllableAdapterSrc.includes("letter.ba") &&
      !w16SyllableAdapterSrc.includes("bin.closed"),
  );

  const w16DemosSeen = {
    ...throughWave15,
    ...seenItems(w16u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W16.3 presentations cannot pass Unit 1", !evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16DemosSeen).mastered);
  const w16KasraOnly = {
    ...throughWave15,
    ...itemsFrom(
      [{ type: "letter", id: "ba.kasra", liveKey: "letter:ba.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" }],
      [[true, true, true]],
    ),
  };
  assert("W16.3 letter:ba.kasra alone cannot pass Unit 1", !evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16KasraOnly).mastered);
  const w16FormOnly = {
    ...throughWave15,
    ...itemsFrom(
      [{ type: "letter", id: "ta.form.final", liveKey: "letter:ta.form.final", portableMasteryId: "x", skillId: "skill.letter_forms.positional" }],
      [[true, true, true]],
    ),
  };
  assert("W16.3 letter:ta.form.final alone cannot pass Unit 1", !evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16FormOnly).mastered);
  const w16KafKasra = {
    ...throughWave15,
    ...itemsFrom(
      [{ type: "letter", id: "kaf.kasra", liveKey: "letter:kaf.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" }],
      [[true, true, true]],
    ),
  };
  assert("W16.3 letter:kaf.kasra cannot substitute", !evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16KafKasra).mastered);
  const w16AinKasra = {
    ...throughWave15,
    ...itemsFrom(
      [{ type: "letter", id: "ain.kasra", liveKey: "letter:ain.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" }],
      [[true, true, true]],
    ),
  };
  assert("W16.3 letter:ain.kasra cannot substitute", !evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16AinKasra).mastered);
  const w16JimKasra = {
    ...throughWave15,
    ...itemsFrom(
      [{ type: "letter", id: "jim.kasra", liveKey: "letter:jim.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" }],
      [[true, true, true]],
    ),
  };
  assert("W16.3 letter:jim.kasra cannot substitute", !evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16JimKasra).mastered);
  const w16BaFatha = {
    ...throughWave15,
    ...itemsFrom(
      [{ type: "letter", id: "ba.fatha", liveKey: "letter:ba.fatha", portableMasteryId: "x", skillId: "skill.short_vowel.fatha" }],
      [[true, true, true]],
    ),
  };
  assert("W16.3 letter:ba.fatha cannot substitute", !evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16BaFatha).mastered);
  const w16BaMadd = {
    ...throughWave15,
    ...itemsFrom(
      [{ type: "letter", id: "ba.madd_alif", liveKey: "letter:ba.madd_alif", portableMasteryId: "x", skillId: "skill.long_vowel.madd" }],
      [[true, true, true]],
    ),
  };
  assert("W16.3 letter:ba.madd_alif cannot substitute", !evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16BaMadd).mastered);
  const w16JisClosed = {
    ...throughWave15,
    ...itemsFrom(
      [{ type: "letter", id: "jis.closed", liveKey: "letter:jis.closed", portableMasteryId: "x", skillId: "skill.syllable_blending.cvc" }],
      [[true, true, true]],
    ),
  };
  assert("W16.3 letter:jis.closed cannot substitute", !evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16JisClosed).mastered);
  const w16RamClosed = {
    ...throughWave15,
    ...itemsFrom(
      [{ type: "letter", id: "ram.closed", liveKey: "letter:ram.closed", portableMasteryId: "x", skillId: "skill.syllable_blending.cvc" }],
      [[true, true, true]],
    ),
  };
  assert("W16.3 letter:ram.closed cannot substitute", !evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16RamClosed).mastered);
  const w16TaMedial = {
    ...throughWave15,
    ...itemsFrom(
      [{ type: "letter", id: "ta.form.medial", liveKey: "letter:ta.form.medial", portableMasteryId: "x", skillId: "skill.letter_forms.positional" }],
      [[true, true, true]],
    ),
  };
  assert("W16.3 letter:ta.form.medial cannot substitute", !evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16TaMedial).mastered);
  const w16MarkOnly = {
    ...throughWave15,
    ...itemsFrom(
      [getHarakaLiveKey({ letterLegacyId: "ba", vowelSkillId: "skill.short_vowel.kasra" })].map((keyed) => ({
        type: keyed.type,
        id: keyed.id,
        liveKey: keyed.liveKey,
        portableMasteryId: "x",
        skillId: "skill.short_vowel.kasra",
      })),
      [[true, true, true]],
    ),
  };
  assert("W16.3 mark-only kasra cannot pass Unit 1", !evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16MarkOnly).mastered);

  const w16u1Mastered = masterRequired(wave16Bundle, w16u1, w16u1Exercises, throughWave15);
  const w16u1ok = evaluateUnitMastery(wave16Bundle, w16u1, w16u1Exercises, w16u1Mastered);
  assert("W16.3 Unit 1 masters with ba kasra + ta final", w16u1ok.mastered, w16u1ok.blockers.join("; "));
  assert(
    "W16.3 presentation attempts remain 0",
    (w16u1Mastered[getPresentationLiveKey("exercise.wave16.presentation.ba_fatha").liveKey]?.attempts ?? 0) === 0 &&
      (w16u1Mastered[getPresentationLiveKey("exercise.wave16.presentation.ba_kasra").liveKey]?.attempts ?? 0) === 0 &&
      (w16u1Mastered[getPresentationLiveKey("exercise.wave16.presentation.ta_final").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W16.3 Unit 2 unlocks after Unit 1",
    evaluateUnitUnlock(wave16Bundle, wave16Units, w16u2, w16u1Mastered, lookupPrereqW16).unlocked,
  );

  const w16u2Required = requiredRefsForUnit(wave16Bundle, w16u2, w16u2Exercises);
  const w16BinShow = w16u2Exercises.find((row) => row.id === "exercise.wave16.presentation.bin_rehearsal");
  const w16Compose = w16u2Exercises.find((row) => row.id === "exercise.wave16.presentation.bint_compose");
  const w16AudioEx = w16u2Exercises.find((row) => row.id === "exercise.wave16.audio_to_word.bint");
  const w16PictureEx = w16u2Exercises.find((row) => row.id === "exercise.wave16.word_to_picture.bint");
  assert("W16.4 Unit 2 JSON opens with بِنْ rehearsal", w16u2Exercises[0]?.id === "exercise.wave16.presentation.bin_rehearsal");
  assert(
    "W16.4 rehearsal is بِ + نْ → بِنْ",
    w16BinShow?.config?.["left"] === "بِ" && w16BinShow.config?.["right"] === "نْ" && w16BinShow.config?.["result"] === "بِنْ",
  );
  assert(
    "W16.4 compose is بِنْ + isolated ت → بِنْت",
    w16Compose?.config?.["left"] === "بِنْ" && w16Compose.config?.["right"] === "ت" && w16Compose.config?.["result"] === "بِنْت",
  );
  const w16u2LiveStart = scheduleLesson(wave16Bundle, w16u2, w16u2Exercises, w16u1Mastered);
  assert("W16.4 live first beat is unscored rehearsal", w16u2Exercises[w16u2LiveStart.index]?.type === "presentation");
  const w16u2AfterDemos = scheduleLesson(
    wave16Bundle,
    w16u2,
    w16u2Exercises,
    { ...w16u1Mastered, ...seenItems(w16u2Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w16u2LiveStart.index },
  );
  assert("W16.4 live first scored beat is audio_to_word", w16u2Exercises[w16u2AfterDemos.index]?.id === "exercise.wave16.audio_to_word.bint");
  assert("W16.4 picture is after audio", (w16u2Exercises.findIndex((row) => row.id === "exercise.wave16.word_to_picture.bint") > w16u2Exercises.findIndex((row) => row.id === "exercise.wave16.audio_to_word.bint")));
  assert("W16.4 Unit 2 requires word:bint.decoding only", w16u2Required.length === 1 && w16u2Required[0]?.liveKey === "word:bint.decoding", w16u2Required.map((ref) => ref.liveKey).join(", "));
  assert("W16.4 picture is reinforcement", Boolean(w16PictureEx?.tags?.includes("reinforcement")));
  assert("W16.4 no required review", w16u2Exercises.every((row) => !row.tags?.includes("review")));
  assert("W16.4 no letter:bin.closed required", !w16u2Required.some((ref) => ref.liveKey === "letter:bin.closed"));

  const bintWord = wave16Bundle.words.find((row) => row.id === "word.bint");
  const bintVisual = bintWord ? prototypeVisualForWord(bintWord) : undefined;
  assert("word.bint has no invented legacyId", bintWord?.legacyId === undefined);
  assert(
    "word.bint is Band A family بِنْت",
    bintWord?.vocabBand === "A" && bintWord.subBand === "A2" && bintWord.lemma === "بنت" && bintWord.teachingForm === "بِنْت" && bintWord.category === "family",
  );
  assert("word.bint prototype visual is 👧", bintVisual?.kind === "emoji" && bintVisual.emoji === "👧");
  const bintForms = bintWord?.requiredLetterForms ?? [];
  assert(
    "W16.4 joining records ba initial, nun medial, ta final",
    bintForms.some((row) => row.letterId === "letter.ba" && row.form === "initial") &&
      bintForms.some((row) => row.letterId === "letter.nun" && row.form === "medial") &&
      bintForms.some((row) => row.letterId === "letter.ta" && row.form === "final"),
  );
  assert("W16.4 ba is dual-joining", wave16Bundle.letters.find((row) => row.id === "letter.ba")?.nonConnecting !== true);
  assert("W16.4 nun is dual-joining", wave16Bundle.letters.find((row) => row.id === "letter.nun")?.nonConnecting !== true);
  assert("W16.4 ta is dual-joining", wave16Bundle.letters.find((row) => row.id === "letter.ta")?.nonConnecting !== true);
  assert("W16.4 bint has sukun", (bintWord?.teachingForm ?? "").includes("\u0652") && (bintWord?.phonicsSkillIds ?? []).includes("skill.sukun.basic"));
  assert("W16.4 bint has no fatha skill", !(bintWord?.phonicsSkillIds ?? []).includes("skill.short_vowel.fatha"));

  const w16ComposeOnly = {
    ...w16u1Mastered,
    ...seenItems(w16u2Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W16.4 compose cannot pass Unit 2", !evaluateUnitMastery(wave16Bundle, w16u2, w16u2Exercises, w16ComposeOnly).mastered);
  const w16PictureOnly = w16PictureEx ? activitySeen(w16PictureEx) : {};
  assert("W16.4 picture cannot pass Unit 2", !evaluateUnitMastery(wave16Bundle, w16u2, w16u2Exercises, { ...w16u1Mastered, ...w16PictureOnly }).mastered);
  const w16HistoricalDecode = {
    ...w16u1Mastered,
    ...itemsFrom(
      [
        { type: "word", id: "jism.decoding", liveKey: "word:jism.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "bab.decoding", liveKey: "word:bab.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "inab.decoding", liveKey: "word:inab.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
      ],
      [[true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("W16.4 historical decoding keys cannot substitute", !evaluateUnitMastery(wave16Bundle, w16u2, w16u2Exercises, w16HistoricalDecode).mastered);

  const w16u2Mastered = masterRequired(wave16Bundle, w16u2, w16u2Exercises, w16u1Mastered);
  const w16u2ok = evaluateUnitMastery(wave16Bundle, w16u2, w16u2Exercises, w16u2Mastered);
  assert("W16.4 Unit 2 masters with word:bint.decoding", w16u2ok.mastered, w16u2ok.blockers.join("; "));
  assert(
    "W16.4 compose presentation attempts remain 0",
    (w16u2Mastered[getPresentationLiveKey("exercise.wave16.presentation.bin_rehearsal").liveKey]?.attempts ?? 0) === 0 &&
      (w16u2Mastered[getPresentationLiveKey("exercise.wave16.presentation.bint_compose").liveKey]?.attempts ?? 0) === 0,
  );

  const allW16Keys = [...w16u1Required, ...w16u2Required].map((ref) => ref.liveKey);
  assert("W16.5 only the three required live keys", allW16Keys.sort().join(",") === ["letter:ba.kasra", "letter:ta.form.final", "word:bint.decoding"].sort().join(","));
  assert("W16.5 no closed key", !allW16Keys.some((key) => key.endsWith(".closed")));
  assert("W16.5 no damma/ū/ī/discrimination keys", !allW16Keys.some((key) => key.includes("damma") || key.includes("madd_waw") || key.includes("madd_ya") || key.includes("discrimination")));
  assert("W16.5 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-17"));
  assert("W16.5 Wave 16 is registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE16_SLUG") && resolveLearnSrcEarly.includes("getWave16Bundle") && resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));
  assert("W16.5 Wave 15 final unit id is unchanged", w15u2.id === "unit.literacy.wave15.jism");
  assert("W16.5 Wave 1–15 mastery still holds after Wave 16 load", w15u2ok.mastered && w14u2ok.mastered);
  const frozenPriorWavesW16 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path, wave10Path, wave11Path, wave12Path, wave13Path, wave14Path, wave15Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("unit.literacy.wave16") && !src.includes("path.literacy.wave16") && !src.includes("literacy-path.wave-16");
  });
  assert("W16.5 Waves 1–15 lesson JSON stay free of Wave 16 unit/path ids", frozenPriorWavesW16);
  assert("W16.5 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));

  const w16Report = readFileSync(join(root, "docs/literacy-wave-16-report.md"), "utf8");
  assert("W16 report exists and postpones Wave 17", /Wave 17 is not implemented/i.test(w16Report) && w16Report.includes("بِنْت"));

  const wave17Raw = JSON.parse(readFileSync(wave17Path, "utf8"));
  const wave17Validation = validateCurriculum(wave17Raw);
  assert("Wave 17 production JSON validates", wave17Validation.ok, wave17Validation.issues.map((issue) => issue.message).join("; "));
  const wave17Bundle = asCurriculumBundle(wave17Raw);
  const wave17PathRow = wave17Bundle.paths?.find((row) => row.id === WAVE17_PATH_ID);
  if (!wave17PathRow) throw new Error("Wave 17 path missing");
  const wave17ById = new Map((wave17Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave17Units = wave17PathRow.unitIds.flatMap((id) => {
    const unit = wave17ById.get(id);
    return unit ? [unit] : [];
  });
  const w17u1 = wave17Units[0];
  const w17u2 = wave17Units[1];
  if (!w17u1 || !w17u2) throw new Error("Wave 17 units 1–2 missing");
  assert("Wave 17 declares exactly two units", wave17Units.length === 2);
  assert("Wave 17 has no third unit", wave17Units[2] === undefined);
  assert("Wave 17 Unit 1 prereq is Wave 16 final unit", w17u1.prereqUnitIds?.[0] === "unit.literacy.wave16.bint");
  assert(
    "Wave 17 child titles are نَعَم / وَ",
    w17u1.titleAr === "نَعَم" && w17u2.titleAr === "وَ" && w17u2.childGoalAr === "وَ",
  );
  assert("Wave 17 has no sentence records", (wave17Bundle.sentences?.length ?? 0) === 0);

  const lookupPrereqW17 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w17 = wave17Bundle.units?.find((row) => row.id === id);
    if (w17) return { bundle: wave17Bundle, unit: w17 };
    const w16 = wave16Bundle.units?.find((row) => row.id === id);
    if (w16) return { bundle: wave16Bundle, unit: w16 };
    return lookupPrereqW16(id);
  };

  const w17u1Exercises = exercisesForUnit(wave17Bundle, w17u1);
  const w17u2Exercises = exercisesForUnit(wave17Bundle, w17u2);
  const throughWave16 = w16u2Mastered;

  assert(
    "W17.1 Wave 17 locked before Wave 16 final mastery",
    !evaluateUnitUnlock(wave17Bundle, wave17Units, w17u1, throughWave15, lookupPrereqW17).unlocked,
  );
  const w17u1Unlock = evaluateUnitUnlock(wave17Bundle, wave17Units, w17u1, throughWave16, lookupPrereqW17);
  assert("W17.1 after Wave 16 final: Unit 1 open", w17u1Unlock.unlocked, w17u1Unlock.blockers.join("; "));
  assert(
    "W17.1 after Wave 16 final: Unit 2 locked",
    !evaluateUnitUnlock(wave17Bundle, wave17Units, w17u2, throughWave16, lookupPrereqW17).unlocked,
  );

  assert(
    "W17.1 Unit 1 JSON opens with نَعَم then لَا SHOWs",
    w17u1Exercises[0]?.id === "exercise.wave17.presentation.naam" &&
      w17u1Exercises[1]?.id === "exercise.wave17.presentation.laa",
  );
  const w17u1LiveStart = scheduleLesson(wave17Bundle, w17u1, w17u1Exercises, throughWave16);
  assert(
    "W17.1 live first beat is SHOW نَعَم",
    w17u1Exercises[w17u1LiveStart.index]?.id === "exercise.wave17.presentation.naam",
  );
  const w17u1AfterDemos = scheduleLesson(
    wave17Bundle,
    w17u1,
    w17u1Exercises,
    { ...throughWave16, ...seenItems(w17u1Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w17u1LiveStart.index },
  );
  assert(
    "W17.1 live first scored beat is audio نَعَم",
    w17u1Exercises[w17u1AfterDemos.index]?.id === "exercise.wave17.audio_to_word.naam",
  );

  const w17u1Required = requiredRefsForUnit(wave17Bundle, w17u1, w17u1Exercises);
  assert(
    "W17.1 Unit 1 requires both decoding keys",
    w17u1Required.length === 2 &&
      w17u1Required.some((ref) => ref.liveKey === "word:naam.decoding") &&
      w17u1Required.some((ref) => ref.liveKey === "word:laa.decoding"),
    w17u1Required.map((ref) => ref.liveKey).join(", "),
  );

  const naamWord = wave17Bundle.words.find((row) => row.id === "word.naam");
  const laaWord = wave17Bundle.words.find((row) => row.id === "word.laa");
  const waWord = wave17Bundle.words.find((row) => row.id === "word.wa");
  assert("word.naam is Band A function نَعَم", naamWord?.lemma === "نعم" && naamWord.teachingForm === "نَعَم" && naamWord.pos === "function" && naamWord.legacyId === undefined);
  assert("word.laa is Band A function لَا", laaWord?.lemma === "لا" && laaWord.teachingForm === "لَا" && laaWord.pos === "function" && laaWord.legacyId === undefined);
  assert("word.wa is wave-local function وَ", waWord?.lemma === "و" && waWord.teachingForm === "وَ" && waWord.pos === "function" && waWord.category === "function" && waWord.legacyId === undefined);

  const w17DemosSeen = {
    ...throughWave16,
    ...seenItems(w17u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W17.1 presentations cannot pass Unit 1", !evaluateUnitMastery(wave17Bundle, w17u1, w17u1Exercises, w17DemosSeen).mastered);

  const w17NaamOnly = {
    ...throughWave16,
    ...itemsFrom(
      [{ type: "word", id: "naam.decoding", liveKey: "word:naam.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" }],
      [[true, true, true]],
    ),
  };
  assert("W17.1 word:naam.decoding alone cannot pass Unit 1", !evaluateUnitMastery(wave17Bundle, w17u1, w17u1Exercises, w17NaamOnly).mastered);

  const w17LaaOnly = {
    ...throughWave16,
    ...itemsFrom(
      [{ type: "word", id: "laa.decoding", liveKey: "word:laa.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" }],
      [[true, true, true]],
    ),
  };
  assert("W17.1 word:laa.decoding alone cannot pass Unit 1", !evaluateUnitMastery(wave17Bundle, w17u1, w17u1Exercises, w17LaaOnly).mastered);

  const w17Historical = {
    ...throughWave16,
    ...itemsFrom(
      [
        { type: "letter", id: "waw.fatha", liveKey: "letter:waw.fatha", portableMasteryId: "x", skillId: "skill.short_vowel.fatha" },
        { type: "word", id: "walad.decoding", liveKey: "word:walad.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "bint.decoding", liveKey: "word:bint.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
      ],
      [[true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("W17.1 historical keys cannot pass Unit 1", !evaluateUnitMastery(wave17Bundle, w17u1, w17u1Exercises, w17Historical).mastered);

  const w17u1Mastered = masterRequired(wave17Bundle, w17u1, w17u1Exercises, throughWave16);
  const w17u1ok = evaluateUnitMastery(wave17Bundle, w17u1, w17u1Exercises, w17u1Mastered);
  assert("W17.1 Unit 1 masters with naam + laa", w17u1ok.mastered, w17u1ok.blockers.join("; "));
  assert(
    "W17.1 presentation attempts remain 0",
    (w17u1Mastered[getPresentationLiveKey("exercise.wave17.presentation.naam").liveKey]?.attempts ?? 0) === 0 &&
      (w17u1Mastered[getPresentationLiveKey("exercise.wave17.presentation.laa").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W17.1 Unit 2 unlocks after Unit 1",
    evaluateUnitUnlock(wave17Bundle, wave17Units, w17u2, w17u1Mastered, lookupPrereqW17).unlocked,
  );

  const w17u2Required = requiredRefsForUnit(wave17Bundle, w17u2, w17u2Exercises);
  const w17ShowWa = w17u2Exercises.find((row) => row.id === "exercise.wave17.presentation.wa");
  const w17ShowPhrase = w17u2Exercises.find((row) => row.id === "exercise.wave17.presentation.walad_wa_bint");
  const w17ShowBint = w17u2Exercises.find((row) => row.id === "exercise.wave17.presentation.bint_writing");
  const w17WaAudio = w17u2Exercises.find((row) => row.id === "exercise.wave17.audio_to_word.wa");
  assert(
    "W17.2 Unit 2 JSON is SHOW وَ, phrase, بِنْت, then scored وَ",
    w17u2Exercises[0]?.id === "exercise.wave17.presentation.wa" &&
      w17u2Exercises[1]?.id === "exercise.wave17.presentation.walad_wa_bint" &&
      w17u2Exercises[2]?.id === "exercise.wave17.presentation.bint_writing" &&
      w17u2Exercises[3]?.id === "exercise.wave17.audio_to_word.wa",
  );
  assert("W17.2 وَ SHOW is historical CV", w17ShowWa?.type === "presentation" && w17ShowWa.config?.["show"] === "cv" && w17ShowWa.config?.["syllableId"] === "syllable.waw.fatha");
  assert(
    "W17.2 phrase is وَلَد + بِنْت → وَلَد وَبِنْت",
    w17ShowPhrase?.config?.["left"] === "وَلَد" && w17ShowPhrase.config?.["right"] === "بِنْت" && w17ShowPhrase.config?.["result"] === "وَلَد وَبِنْت",
  );
  assert("W17.2 writing SHOW is citation بِنْت", w17ShowBint?.config?.["show"] === "word" && w17ShowBint.config?.["wordId"] === "word.bint");
  assert("W17.2 scored target is word.wa", w17WaAudio?.success.correctChoiceId === "word.wa");
  assert("W17.2 Unit 2 requires word:wa.decoding only", w17u2Required.length === 1 && w17u2Required[0]?.liveKey === "word:wa.decoding", w17u2Required.map((ref) => ref.liveKey).join(", "));
  assert("W17.2 no letter:waw.fatha required", !w17u2Required.some((ref) => ref.liveKey === "letter:waw.fatha"));
  assert("W17.2 no word:walad.decoding required", !w17u2Required.some((ref) => ref.liveKey === "word:walad.decoding"));
  assert("W17.2 no word:bint.decoding required", !w17u2Required.some((ref) => ref.liveKey === "word:bint.decoding"));

  const w17u2LiveStart = scheduleLesson(wave17Bundle, w17u2, w17u2Exercises, w17u1Mastered);
  assert("W17.2 live first beat is unscored وَ SHOW", w17u2Exercises[w17u2LiveStart.index]?.type === "presentation");
  const w17u2AfterDemos = scheduleLesson(
    wave17Bundle,
    w17u2,
    w17u2Exercises,
    { ...w17u1Mastered, ...seenItems(w17u2Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w17u2LiveStart.index },
  );
  assert("W17.2 live first scored beat is audio وَ", w17u2Exercises[w17u2AfterDemos.index]?.id === "exercise.wave17.audio_to_word.wa");

  const w17u2DemosOnly = {
    ...w17u1Mastered,
    ...seenItems(w17u2Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W17.2 presentations cannot pass Unit 2", !evaluateUnitMastery(wave17Bundle, w17u2, w17u2Exercises, w17u2DemosOnly).mastered);
  assert("W17.2 historical keys cannot pass Unit 2", !evaluateUnitMastery(wave17Bundle, w17u2, w17u2Exercises, { ...w17u1Mastered, ...w17Historical }).mastered);

  const w17WritingOnly = {
    ...w17u1Mastered,
    ...itemsFrom(
      [
        { type: "word", id: "bint.writing", liveKey: "word:bint.writing", portableMasteryId: "x", skillId: "skill.handwriting.isolated" },
        { type: "letter", id: "ba.tracing", liveKey: "letter:ba.tracing", portableMasteryId: "x", skillId: "skill.handwriting.isolated" },
        { type: "letter", id: "nun.tracing", liveKey: "letter:nun.tracing", portableMasteryId: "x", skillId: "skill.handwriting.isolated" },
        { type: "letter", id: "ta.tracing", liveKey: "letter:ta.tracing", portableMasteryId: "x", skillId: "skill.handwriting.isolated" },
      ],
      [[true, true, true], [true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("W17.2 writing keys cannot substitute", !evaluateUnitMastery(wave17Bundle, w17u2, w17u2Exercises, w17WritingOnly).mastered);

  const w17u2Mastered = masterRequired(wave17Bundle, w17u2, w17u2Exercises, w17u1Mastered);
  const w17u2ok = evaluateUnitMastery(wave17Bundle, w17u2, w17u2Exercises, w17u2Mastered);
  assert("W17.2 Unit 2 masters with word:wa.decoding", w17u2ok.mastered, w17u2ok.blockers.join("; "));
  assert(
    "W17.2 presentation attempts remain 0",
    (w17u2Mastered[getPresentationLiveKey("exercise.wave17.presentation.wa").liveKey]?.attempts ?? 0) === 0 &&
      (w17u2Mastered[getPresentationLiveKey("exercise.wave17.presentation.walad_wa_bint").liveKey]?.attempts ?? 0) === 0 &&
      (w17u2Mastered[getPresentationLiveKey("exercise.wave17.presentation.bint_writing").liveKey]?.attempts ?? 0) === 0,
  );

  const allW17Keys = [...w17u1Required, ...w17u2Required].map((ref) => ref.liveKey);
  assert("W17.3 only the three required live keys", allW17Keys.sort().join(",") === ["word:laa.decoding", "word:naam.decoding", "word:wa.decoding"].sort().join(","));
  assert("W17.3 no writing/phrase/language keys", !allW17Keys.some((key) => key.includes("writing") || key.includes("phrase") || key.includes("language") || key.includes("tracing")));
  assert("W17.3 no damma/ū/ī keys", !allW17Keys.some((key) => key.includes("damma") || key.includes("madd_waw") || key.includes("madd_ya")));
  assert("W17.3 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-19"));
  assert("W17.3 Wave 17 is registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE17_SLUG") && resolveLearnSrcEarly.includes("getWave17Bundle") && resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));
  assert("W17.3 Wave 16 final unit id is unchanged", w16u2.id === "unit.literacy.wave16.bint");
  assert("W17.3 Wave 1–16 mastery still holds after Wave 17 load", w16u2ok.mastered && w15u2ok.mastered);
  const frozenPriorWavesW17 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path, wave10Path, wave11Path, wave12Path, wave13Path, wave14Path, wave15Path, wave16Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("unit.literacy.wave17") && !src.includes("path.literacy.wave17") && !src.includes("literacy-path.wave-17");
  });
  assert("W17.3 Waves 1–16 lesson JSON stay free of Wave 17 unit/path ids", frozenPriorWavesW17);
  assert("W17.3 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));
  const w17UnitMasterySrc = readFileSync(join(root, "src/lib/curriculum/unitMastery.ts"), "utf8");
  assert(
    "W17.3 engine has no naam/laa/wa/wave17 special-case",
    !w17UnitMasterySrc.includes("wave17") &&
      !w17UnitMasterySrc.includes("wave-17") &&
      !w17UnitMasterySrc.includes("word.naam") &&
      !w17UnitMasterySrc.includes("word.wa"),
  );

  const w17Report = readFileSync(join(root, "docs/literacy-wave-17-report.md"), "utf8");
  assert("W17 report exists and postpones Wave 18", /WAVE 17 IMPLEMENTED — DO NOT IMPLEMENT WAVE 18/.test(w17Report) && w17Report.includes("نَعَم"));

  const wave18Raw = JSON.parse(readFileSync(wave18Path, "utf8"));
  const wave18Validation = validateCurriculum(wave18Raw);
  assert("Wave 18 production JSON validates", wave18Validation.ok, wave18Validation.issues.map((issue) => issue.message).join("; "));
  const wave18Bundle = asCurriculumBundle(wave18Raw);
  const wave18PathRow = wave18Bundle.paths?.find((row) => row.id === WAVE18_PATH_ID);
  if (!wave18PathRow) throw new Error("Wave 18 path missing");
  const wave18ById = new Map((wave18Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave18Units = wave18PathRow.unitIds.flatMap((id) => {
    const unit = wave18ById.get(id);
    return unit ? [unit] : [];
  });
  const w18u1 = wave18Units[0];
  const w18u2 = wave18Units[1];
  if (!w18u1 || !w18u2) throw new Error("Wave 18 units 1–2 missing");

  assert("Wave 18 declares exactly two units", wave18Units.length === 2);
  assert("Wave 18 has no third unit", wave18Units[2] === undefined);
  assert("Wave 18 Unit 1 prereq is Wave 17 final unit", w18u1.prereqUnitIds?.[0] === "unit.literacy.wave17.wa_bint");
  assert(
    "Wave 18 child titles are بُ / كُ",
    w18u1.titleAr === "بُ" && w18u2.titleAr === "كُ" && w18u1.childGoalAr === "بُ" && w18u2.childGoalAr === "كُ",
  );
  assert("Wave 18 has no sentence records", (wave18Bundle.sentences?.length ?? 0) === 0);
  assert("Wave 18 has no word records", (wave18Bundle.words?.length ?? 0) === 0);

  const lookupPrereqW18 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w18 = wave18Bundle.units?.find((row) => row.id === id);
    if (w18) return { bundle: wave18Bundle, unit: w18 };
    return lookupPrereqW17(id);
  };

  const w18u1Exercises = exercisesForUnit(wave18Bundle, w18u1);
  const w18u2Exercises = exercisesForUnit(wave18Bundle, w18u2);
  const throughWave17 = w17u2Mastered;

  assert(
    "W18.1 Wave 18 locked before Wave 17 final mastery",
    !evaluateUnitUnlock(wave18Bundle, wave18Units, w18u1, throughWave16, lookupPrereqW18).unlocked,
  );
  const w18u1Unlock = evaluateUnitUnlock(wave18Bundle, wave18Units, w18u1, throughWave17, lookupPrereqW18);
  assert("W18.1 Wave 18 Unit 1 unlocks after Wave 17 mastery", w18u1Unlock.unlocked, w18u1Unlock.blockers.join("; "));
  assert(
    "W18.1 Unit 2 stays locked until Unit 1",
    !evaluateUnitUnlock(wave18Bundle, wave18Units, w18u2, throughWave17, lookupPrereqW18).unlocked,
  );
  assert("W18.1 renderers ready", unitRenderersReady(w18u1Exercises) && unitRenderersReady(w18u2Exercises));

  const w18ShowBaFatha = w18u1Exercises.find((row) => row.id === "exercise.wave18.presentation.ba_fatha");
  const w18ShowBaDamma = w18u1Exercises.find((row) => row.id === "exercise.wave18.presentation.ba_damma");
  const w18BaBlend = w18u1Exercises.find((row) => row.id === "exercise.wave18.syllable_blending.ba_damma");
  assert(
    "W18.1 Unit 1 JSON is SHOW بَ, SHOW بُ, then scored بُ",
    w18u1Exercises[0]?.id === "exercise.wave18.presentation.ba_fatha" &&
      w18u1Exercises[1]?.id === "exercise.wave18.presentation.ba_damma" &&
      w18u1Exercises[2]?.id === "exercise.wave18.syllable_blending.ba_damma",
  );
  assert("W18.1 familiar SHOW is بَ", w18ShowBaFatha?.type === "presentation" && w18ShowBaFatha.config?.["show"] === "cv" && w18ShowBaFatha.config?.["syllableId"] === "syllable.ba.fatha");
  assert("W18.1 damma SHOW is بُ", w18ShowBaDamma?.type === "presentation" && w18ShowBaDamma.config?.["show"] === "cv" && w18ShowBaDamma.config?.["syllableId"] === "syllable.ba.damma");
  assert("W18.1 scored target is syllable.ba.damma", w18BaBlend?.success.correctChoiceId === "syllable.ba.damma");
  assert(
    "W18.1 scored choices are بُ / بَ / بِ",
    (w18BaBlend?.choices ?? []).some((row) => row.id === "syllable.ba.damma" && row.label === "بُ") &&
      (w18BaBlend?.choices ?? []).some((row) => row.id === "syllable.ba.fatha" && row.label === "بَ") &&
      (w18BaBlend?.choices ?? []).some((row) => row.id === "syllable.ba.kasra" && row.label === "بِ"),
  );
  assert("W18.1 Unit 1 has no missing_haraka", !w18u1Exercises.some((row) => row.type === "missing_haraka"));
  assert("W18.1 Unit 1 has no word target", (w18u1.wordIds ?? []).length === 0 && !w18u1Exercises.some((row) => row.type === "audio_to_word"));

  const w18u1LiveStart = scheduleLesson(wave18Bundle, w18u1, w18u1Exercises, throughWave17);
  assert("W18.1 live first beat is unscored بَ SHOW", w18u1Exercises[w18u1LiveStart.index]?.id === "exercise.wave18.presentation.ba_fatha");
  const w18u1AfterDemos = scheduleLesson(
    wave18Bundle,
    w18u1,
    w18u1Exercises,
    { ...throughWave17, ...seenItems(w18u1Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w18u1LiveStart.index },
  );
  assert("W18.1 live first scored beat is بُ", w18u1Exercises[w18u1AfterDemos.index]?.id === "exercise.wave18.syllable_blending.ba_damma");

  const w18u1Required = requiredRefsForUnit(wave18Bundle, w18u1, w18u1Exercises);
  assert("W18.1 Unit 1 requires letter:ba.damma only", w18u1Required.length === 1 && w18u1Required[0]?.liveKey === "letter:ba.damma", w18u1Required.map((ref) => ref.liveKey).join(", "));
  assert(
    "W18.1 generic getSyllableLiveKey produces letter:ba.damma",
    getSyllableLiveKey({ letterLegacyId: "ba", vowelSkillId: "skill.short_vowel.damma" }).liveKey === "letter:ba.damma",
  );
  const baDammaSyllable = wave18Bundle.syllables?.find((row) => row.id === "syllable.ba.damma");
  assert("W18.1 بُ is CV damma", baDammaSyllable?.pattern === "CV" && baDammaSyllable.vowelSkillId === "skill.short_vowel.damma" && baDammaSyllable.text === "بُ" && /\u064F/.test(baDammaSyllable.text));

  const w18DemosSeen = {
    ...throughWave17,
    ...seenItems(w18u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W18.1 presentations cannot pass Unit 1", !evaluateUnitMastery(wave18Bundle, w18u1, w18u1Exercises, w18DemosSeen).mastered);

  const w18BaFathaOnly = {
    ...throughWave17,
    ...itemsFrom(
      [{ type: "letter", id: "ba.fatha", liveKey: "letter:ba.fatha", portableMasteryId: "x", skillId: "skill.short_vowel.fatha" }],
      [[true, true, true]],
    ),
  };
  assert("W18.1 letter:ba.fatha cannot pass Unit 1", !evaluateUnitMastery(wave18Bundle, w18u1, w18u1Exercises, w18BaFathaOnly).mastered);

  const w18BaKasraOnly = {
    ...throughWave17,
    ...itemsFrom(
      [{ type: "letter", id: "ba.kasra", liveKey: "letter:ba.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" }],
      [[true, true, true]],
    ),
  };
  assert("W18.1 letter:ba.kasra cannot pass Unit 1", !evaluateUnitMastery(wave18Bundle, w18u1, w18u1Exercises, w18BaKasraOnly).mastered);

  const w18DiscriminationOnly = {
    ...throughWave17,
    ...itemsFrom(
      [
        { type: "letter", id: "ba.damma.discrimination", liveKey: "diacritic:ba.damma.discrimination", portableMasteryId: "x", skillId: "skill.short_vowel.damma" },
        { type: "letter", id: "mim.fatha.discrimination", liveKey: "diacritic:mim.fatha.discrimination", portableMasteryId: "x", skillId: "skill.short_vowel.fatha" },
        { type: "letter", id: "fa.fatha.discrimination", liveKey: "diacritic:fa.fatha.discrimination", portableMasteryId: "x", skillId: "skill.short_vowel.fatha" },
      ],
      [[true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("W18.1 historical discrimination cannot pass Unit 1", !evaluateUnitMastery(wave18Bundle, w18u1, w18u1Exercises, w18DiscriminationOnly).mastered);

  const w18KafDammaOnly = {
    ...throughWave17,
    ...itemsFrom(
      [{ type: "letter", id: "kaf.damma", liveKey: "letter:kaf.damma", portableMasteryId: "x", skillId: "skill.short_vowel.damma" }],
      [[true, true, true]],
    ),
  };
  assert("W18.1 letter:kaf.damma alone cannot pass Unit 1", !evaluateUnitMastery(wave18Bundle, w18u1, w18u1Exercises, w18KafDammaOnly).mastered);

  const w18WordKeys = {
    ...throughWave17,
    ...itemsFrom(
      [
        { type: "word", id: "naam.decoding", liveKey: "word:naam.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "laa.decoding", liveKey: "word:laa.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "wa.decoding", liveKey: "word:wa.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
      ],
      [[true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("W18.1 word keys cannot pass Unit 1", !evaluateUnitMastery(wave18Bundle, w18u1, w18u1Exercises, w18WordKeys).mastered);

  const w18u1Mastered = masterRequired(wave18Bundle, w18u1, w18u1Exercises, throughWave17);
  const w18u1ok = evaluateUnitMastery(wave18Bundle, w18u1, w18u1Exercises, w18u1Mastered);
  assert("W18.1 Unit 1 masters only with letter:ba.damma", w18u1ok.mastered, w18u1ok.blockers.join("; "));
  assert(
    "W18.1 presentation attempts remain 0",
    (w18u1Mastered[getPresentationLiveKey("exercise.wave18.presentation.ba_fatha").liveKey]?.attempts ?? 0) === 0 &&
      (w18u1Mastered[getPresentationLiveKey("exercise.wave18.presentation.ba_damma").liveKey]?.attempts ?? 0) === 0,
  );
  assert(
    "W18.1 Unit 2 unlocks after Unit 1",
    evaluateUnitUnlock(wave18Bundle, wave18Units, w18u2, w18u1Mastered, lookupPrereqW18).unlocked,
  );

  const w18ShowKafFatha = w18u2Exercises.find((row) => row.id === "exercise.wave18.presentation.kaf_fatha");
  const w18ShowKafDamma = w18u2Exercises.find((row) => row.id === "exercise.wave18.presentation.kaf_damma");
  const w18ShowMimDamma = w18u2Exercises.find((row) => row.id === "exercise.wave18.presentation.mim_damma");
  const w18KafBlend = w18u2Exercises.find((row) => row.id === "exercise.wave18.syllable_blending.kaf_damma");
  assert(
    "W18.2 Unit 2 JSON is SHOW كَ, SHOW كُ, SHOW مُ, then scored كُ",
    w18u2Exercises[0]?.id === "exercise.wave18.presentation.kaf_fatha" &&
      w18u2Exercises[1]?.id === "exercise.wave18.presentation.kaf_damma" &&
      w18u2Exercises[2]?.id === "exercise.wave18.presentation.mim_damma" &&
      w18u2Exercises[3]?.id === "exercise.wave18.syllable_blending.kaf_damma",
  );
  assert("W18.2 familiar SHOW is كَ", w18ShowKafFatha?.type === "presentation" && w18ShowKafFatha.config?.["syllableId"] === "syllable.kaf.fatha");
  assert("W18.2 damma SHOW is كُ", w18ShowKafDamma?.type === "presentation" && w18ShowKafDamma.config?.["syllableId"] === "syllable.kaf.damma");
  assert("W18.2 third SHOW is unscored مُ", w18ShowMimDamma?.type === "presentation" && w18ShowMimDamma.config?.["syllableId"] === "syllable.mim.damma" && (w18ShowMimDamma.masteryTargets ?? []).length === 0);
  assert("W18.2 scored target is syllable.kaf.damma", w18KafBlend?.success.correctChoiceId === "syllable.kaf.damma");
  assert(
    "W18.2 scored choices are كُ / كَ / كِ",
    (w18KafBlend?.choices ?? []).some((row) => row.id === "syllable.kaf.damma" && row.label === "كُ") &&
      (w18KafBlend?.choices ?? []).some((row) => row.id === "syllable.kaf.fatha" && row.label === "كَ") &&
      (w18KafBlend?.choices ?? []).some((row) => row.id === "syllable.kaf.kasra" && row.label === "كِ"),
  );

  const w18u2Required = requiredRefsForUnit(wave18Bundle, w18u2, w18u2Exercises);
  assert("W18.2 Unit 2 requires letter:kaf.damma only", w18u2Required.length === 1 && w18u2Required[0]?.liveKey === "letter:kaf.damma", w18u2Required.map((ref) => ref.liveKey).join(", "));
  assert(
    "W18.2 generic getSyllableLiveKey produces letter:kaf.damma",
    getSyllableLiveKey({ letterLegacyId: "kaf", vowelSkillId: "skill.short_vowel.damma" }).liveKey === "letter:kaf.damma",
  );
  const kafDammaSyllable = wave18Bundle.syllables?.find((row) => row.id === "syllable.kaf.damma");
  assert("W18.2 كُ is CV damma", kafDammaSyllable?.pattern === "CV" && kafDammaSyllable.vowelSkillId === "skill.short_vowel.damma" && kafDammaSyllable.text === "كُ" && /\u064F/.test(kafDammaSyllable.text));
  const mimDammaSyllable = wave18Bundle.syllables?.find((row) => row.id === "syllable.mim.damma");
  assert("W18.2 مُ reuses historical CV record", mimDammaSyllable?.id === "syllable.mim.damma" && mimDammaSyllable.text === "مُ" && mimDammaSyllable.audioAssetId === "audio.syllable.mim.damma");

  const w18u2LiveStart = scheduleLesson(wave18Bundle, w18u2, w18u2Exercises, w18u1Mastered);
  assert("W18.2 live first beat is unscored كَ SHOW", w18u2Exercises[w18u2LiveStart.index]?.type === "presentation");
  const w18u2AfterDemos = scheduleLesson(
    wave18Bundle,
    w18u2,
    w18u2Exercises,
    { ...w18u1Mastered, ...seenItems(w18u2Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w18u2LiveStart.index },
  );
  assert("W18.2 live first scored beat is كُ", w18u2Exercises[w18u2AfterDemos.index]?.id === "exercise.wave18.syllable_blending.kaf_damma");

  const w18u2DemosOnly = {
    ...w18u1Mastered,
    ...seenItems(w18u2Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W18.2 presentations cannot pass Unit 2", !evaluateUnitMastery(wave18Bundle, w18u2, w18u2Exercises, w18u2DemosOnly).mastered);
  assert("W18.2 Unit 1 evidence alone cannot pass Unit 2", !evaluateUnitMastery(wave18Bundle, w18u2, w18u2Exercises, w18u1Mastered).mastered);

  const w18KafFatha = {
    ...w18u1Mastered,
    ...itemsFrom(
      [{ type: "letter", id: "kaf.fatha", liveKey: "letter:kaf.fatha", portableMasteryId: "x", skillId: "skill.short_vowel.fatha" }],
      [[true, true, true]],
    ),
  };
  assert("W18.2 letter:kaf.fatha cannot pass Unit 2", !evaluateUnitMastery(wave18Bundle, w18u2, w18u2Exercises, w18KafFatha).mastered);

  const w18KafKasra = {
    ...w18u1Mastered,
    ...itemsFrom(
      [{ type: "letter", id: "kaf.kasra", liveKey: "letter:kaf.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" }],
      [[true, true, true]],
    ),
  };
  assert("W18.2 letter:kaf.kasra cannot pass Unit 2", !evaluateUnitMastery(wave18Bundle, w18u2, w18u2Exercises, w18KafKasra).mastered);

  const w18MimDammaSeeded = {
    ...w18u1Mastered,
    ...itemsFrom(
      [{ type: "letter", id: "mim.damma", liveKey: "letter:mim.damma", portableMasteryId: "x", skillId: "skill.short_vowel.damma" }],
      [[true, true, true]],
    ),
  };
  assert("W18.2 letter:mim.damma cannot pass Unit 2", !evaluateUnitMastery(wave18Bundle, w18u2, w18u2Exercises, w18MimDammaSeeded).mastered);

  const w18OldFoils = {
    ...w18u1Mastered,
    ...itemsFrom(
      [
        { type: "letter", id: "fa.damma", liveKey: "letter:fa.damma", portableMasteryId: "x", skillId: "skill.short_vowel.damma" },
        { type: "letter", id: "mim.fatha", liveKey: "letter:mim.fatha", portableMasteryId: "x", skillId: "skill.short_vowel.fatha" },
        { type: "letter", id: "jim.kasra", liveKey: "letter:jim.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" },
        { type: "letter", id: "ain.kasra", liveKey: "letter:ain.kasra", portableMasteryId: "x", skillId: "skill.short_vowel.kasra" },
      ],
      [[true, true, true], [true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("W18.2 old foil syllable records cannot pass Unit 2", !evaluateUnitMastery(wave18Bundle, w18u2, w18u2Exercises, w18OldFoils).mastered);
  assert("W18.2 word keys cannot pass Unit 2", !evaluateUnitMastery(wave18Bundle, w18u2, w18u2Exercises, { ...w18u1Mastered, ...w18WordKeys }).mastered);

  const w18u2Mastered = masterRequired(wave18Bundle, w18u2, w18u2Exercises, w18u1Mastered);
  const w18u2ok = evaluateUnitMastery(wave18Bundle, w18u2, w18u2Exercises, w18u2Mastered);
  assert("W18.2 Unit 2 masters only with letter:kaf.damma", w18u2ok.mastered, w18u2ok.blockers.join("; "));
  assert(
    "W18.2 presentation attempts remain 0",
    (w18u2Mastered[getPresentationLiveKey("exercise.wave18.presentation.kaf_fatha").liveKey]?.attempts ?? 0) === 0 &&
      (w18u2Mastered[getPresentationLiveKey("exercise.wave18.presentation.kaf_damma").liveKey]?.attempts ?? 0) === 0 &&
      (w18u2Mastered[getPresentationLiveKey("exercise.wave18.presentation.mim_damma").liveKey]?.attempts ?? 0) === 0,
  );

  const allW18Keys = [...w18u1Required, ...w18u2Required].map((ref) => ref.liveKey);
  assert("W18.3 only the two required live keys", allW18Keys.sort().join(",") === ["letter:ba.damma", "letter:kaf.damma"].sort().join(","));
  assert("W18.3 no discrimination/mim/word/closed/writing keys", !allW18Keys.some((key) => key.includes("discrimination") || key.includes("mim") || key.includes("word:") || key.includes(".closed") || key.includes("tracing") || key.includes("writing")));
  assert("W18.3 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-19"));
  assert("W18.3 Wave 18 is registered and Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE18_SLUG") && resolveLearnSrcEarly.includes("getWave18Bundle") && resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));
  assert("W18.3 Wave 17 final unit id is unchanged", w17u2.id === "unit.literacy.wave17.wa_bint");
  assert("W18.3 Wave 1–17 mastery still holds after Wave 18 load", w17u2ok.mastered && w16u2ok.mastered);
  const frozenPriorWavesW18 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path, wave10Path, wave11Path, wave12Path, wave13Path, wave14Path, wave15Path, wave16Path, wave17Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("unit.literacy.wave18") && !src.includes("path.literacy.wave18") && !src.includes("literacy-path.wave-18");
  });
  assert("W18.3 Waves 1–17 lesson JSON stay free of Wave 18 unit/path ids", frozenPriorWavesW18);
  assert("W18.3 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));
  const w18UnitMasterySrc = readFileSync(join(root, "src/lib/curriculum/unitMastery.ts"), "utf8");
  const w18SyllableAdapterSrc = readFileSync(join(root, "src/lib/curriculum/syllableAdapter.ts"), "utf8");
  const w18PresentationSrc = readFileSync(join(root, "src/lib/curriculum/presentationAdapter.ts"), "utf8");
  assert(
    "W18.3 no runtime architecture change",
    !w18UnitMasterySrc.includes("wave18") &&
      !w18UnitMasterySrc.includes("wave-18") &&
      !w18SyllableAdapterSrc.includes("wave18") &&
      !w18SyllableAdapterSrc.includes("wave-18") &&
      !w18PresentationSrc.includes("wave18") &&
      !lessonPlayerSrc.includes("wave-18") &&
      !lessonPlayerSrc.includes("wave18"),
  );
  assert("W18.3 no closed damma authored", !wave18Bundle.syllables?.some((row) => row.pattern === "CVC" || row.id.endsWith(".closed")));
  assert("W18.3 no verb/sentence/article/tanween records", (wave18Bundle.sentences?.length ?? 0) === 0 && (wave18Bundle.words?.length ?? 0) === 0);

  const w18Report = readFileSync(join(root, "docs/literacy-wave-18-report.md"), "utf8");
  assert("W18 report exists and postpones Wave 19", /WAVE 18 IMPLEMENTED — DO NOT IMPLEMENT WAVE 19/.test(w18Report) && w18Report.includes("بُ"));

  const wave19Raw = JSON.parse(readFileSync(wave19Path, "utf8"));
  const wave19Validation = validateCurriculum(wave19Raw);
  assert("Wave 19 production JSON validates", wave19Validation.ok, wave19Validation.issues.map((issue) => issue.message).join("; "));
  const wave19Bundle = asCurriculumBundle(wave19Raw);
  const wave19PathRow = wave19Bundle.paths?.find((row) => row.id === WAVE19_PATH_ID);
  if (!wave19PathRow) throw new Error("Wave 19 path missing");
  const wave19ById = new Map((wave19Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave19Units = wave19PathRow.unitIds.flatMap((id) => {
    const unit = wave19ById.get(id);
    return unit ? [unit] : [];
  });
  const w19u1 = wave19Units[0];
  if (!w19u1) throw new Error("Wave 19 unit missing");

  assert("Wave 19 declares exactly one unit", wave19Units.length === 1);
  assert("Wave 19 has no second unit", wave19Units[1] === undefined);
  assert("Wave 19 Unit 1 prereq is Wave 18 final unit", w19u1.prereqUnitIds?.[0] === "unit.literacy.wave18.kaf_damma");
  assert("Wave 19 child title is بُلْ", w19u1.titleAr === "بُلْ" && w19u1.childGoalAr === "بُلْ");
  assert("Wave 19 has no sentence records", (wave19Bundle.sentences?.length ?? 0) === 0);
  assert("Wave 19 has no word records", (wave19Bundle.words?.length ?? 0) === 0);

  const lookupPrereqW19 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w19 = wave19Bundle.units?.find((row) => row.id === id);
    if (w19) return { bundle: wave19Bundle, unit: w19 };
    return lookupPrereqW18(id);
  };

  const w19u1Exercises = exercisesForUnit(wave19Bundle, w19u1);
  const throughWave18 = w18u2Mastered;

  assert(
    "W19.1 Wave 19 locked before Wave 18 final mastery",
    !evaluateUnitUnlock(wave19Bundle, wave19Units, w19u1, throughWave17, lookupPrereqW19).unlocked,
  );
  assert(
    "W19.1 Wave 19 stays locked after Wave 18 Unit 1 only",
    !evaluateUnitUnlock(wave19Bundle, wave19Units, w19u1, w18u1Mastered, lookupPrereqW19).unlocked,
  );
  const w19u1Unlock = evaluateUnitUnlock(wave19Bundle, wave19Units, w19u1, throughWave18, lookupPrereqW19);
  assert("W19.1 Wave 19 unit opens after Wave 18 final", w19u1Unlock.unlocked, w19u1Unlock.blockers.join("; "));
  assert("W19.1 renderers ready", unitRenderersReady(w19u1Exercises));

  const w19ShowBa = w19u1Exercises.find((row) => row.id === "exercise.wave19.presentation.ba_damma");
  const w19ShowBul = w19u1Exercises.find((row) => row.id === "exercise.wave19.presentation.bul_closed");
  const w19BulBlend = w19u1Exercises.find((row) => row.id === "exercise.wave19.syllable_blending.bul_closed");
  assert(
    "W19.1 Unit JSON is SHOW بُ, SHOW بُ + لْ → بُلْ, then scored بُلْ",
    w19u1Exercises[0]?.id === "exercise.wave19.presentation.ba_damma" &&
      w19u1Exercises[1]?.id === "exercise.wave19.presentation.bul_closed" &&
      w19u1Exercises[2]?.id === "exercise.wave19.syllable_blending.bul_closed",
  );
  assert("W19.1 familiar SHOW is بُ", w19ShowBa?.type === "presentation" && w19ShowBa.config?.["show"] === "cv" && w19ShowBa.config?.["syllableId"] === "syllable.ba.damma");
  assert(
    "W19.1 closed SHOW is بُ + لْ → بُلْ",
    w19ShowBul?.type === "presentation" &&
      w19ShowBul.config?.["show"] === "chunk" &&
      w19ShowBul.config?.["left"] === "بُ" &&
      w19ShowBul.config?.["right"] === "لْ" &&
      w19ShowBul.config?.["result"] === "بُلْ",
  );
  assert("W19.1 scored target is syllable.bul.closed", w19BulBlend?.success.correctChoiceId === "syllable.bul.closed");
  assert(
    "W19.1 scored choices are بُلْ / بُ / رَمْ",
    (w19BulBlend?.choices ?? []).some((row) => row.id === "syllable.bul.closed" && row.label === "بُلْ") &&
      (w19BulBlend?.choices ?? []).some((row) => row.id === "syllable.ba.damma" && row.label === "بُ") &&
      (w19BulBlend?.choices ?? []).some((row) => row.id === "syllable.ram.closed" && row.label === "رَمْ"),
  );
  assert("W19.1 no missing_haraka", !w19u1Exercises.some((row) => row.type === "missing_haraka"));
  assert("W19.1 no word target", (w19u1.wordIds ?? []).length === 0 && !w19u1Exercises.some((row) => row.type === "audio_to_word" || row.type === "picture_to_word" || row.type === "word_to_picture"));
  assert("W19.1 no tracing", !w19u1Exercises.some((row) => row.type === "tracing"));

  const w19u1LiveStart = scheduleLesson(wave19Bundle, w19u1, w19u1Exercises, throughWave18);
  assert("W19.1 live first beat is unscored بُ SHOW", w19u1Exercises[w19u1LiveStart.index]?.id === "exercise.wave19.presentation.ba_damma");
  const w19u1AfterDemos = scheduleLesson(
    wave19Bundle,
    w19u1,
    w19u1Exercises,
    { ...throughWave18, ...seenItems(w19u1Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w19u1LiveStart.index },
  );
  assert("W19.1 live first scored beat is بُلْ", w19u1Exercises[w19u1AfterDemos.index]?.id === "exercise.wave19.syllable_blending.bul_closed");

  const w19u1Required = requiredRefsForUnit(wave19Bundle, w19u1, w19u1Exercises);
  assert("W19.1 required live key is letter:bul.closed only", w19u1Required.length === 1 && w19u1Required[0]?.liveKey === "letter:bul.closed", w19u1Required.map((ref) => ref.liveKey).join(", "));
  assert(
    "W19.1 generic getClosedChunkLiveKey produces letter:bul.closed",
    getClosedChunkLiveKey({ syllableId: "syllable.bul.closed" }).liveKey === "letter:bul.closed",
  );
  const bulClosedSyllable = wave19Bundle.syllables?.find((row) => row.id === "syllable.bul.closed");
  assert(
    "W19.1 بُلْ is CVC damma+sukun",
    bulClosedSyllable?.pattern === "CVC" &&
      bulClosedSyllable.vowelSkillId === "skill.short_vowel.damma" &&
      bulClosedSyllable.text === "بُلْ" &&
      /\u064F/.test(bulClosedSyllable.text) &&
      /\u0652/.test(bulClosedSyllable.text) &&
      (bulClosedSyllable.requiredLetterIds ?? []).includes("letter.ba") &&
      (bulClosedSyllable.requiredLetterIds ?? []).includes("letter.lam"),
  );

  const w19DemosSeen = {
    ...throughWave18,
    ...seenItems(w19u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W19.1 presentations cannot pass the unit", !evaluateUnitMastery(wave19Bundle, w19u1, w19u1Exercises, w19DemosSeen).mastered);
  assert("W19.1 Wave 18 open-damma keys cannot pass Wave 19", !evaluateUnitMastery(wave19Bundle, w19u1, w19u1Exercises, throughWave18).mastered);

  const w19BaDammaOnly = {
    ...throughWave17,
    ...itemsFrom(
      [{ type: "letter", id: "ba.damma", liveKey: "letter:ba.damma", portableMasteryId: "x", skillId: "skill.short_vowel.damma" }],
      [[true, true, true]],
    ),
  };
  assert("W19.1 letter:ba.damma cannot pass Wave 19", !evaluateUnitMastery(wave19Bundle, w19u1, w19u1Exercises, w19BaDammaOnly).mastered);

  const w19KafDammaOnly = {
    ...throughWave17,
    ...itemsFrom(
      [{ type: "letter", id: "kaf.damma", liveKey: "letter:kaf.damma", portableMasteryId: "x", skillId: "skill.short_vowel.damma" }],
      [[true, true, true]],
    ),
  };
  assert("W19.1 letter:kaf.damma cannot pass Wave 19", !evaluateUnitMastery(wave19Bundle, w19u1, w19u1Exercises, w19KafDammaOnly).mastered);

  const w19RamClosedOnly = {
    ...throughWave18,
    ...itemsFrom(
      [{ type: "letter", id: "ram.closed", liveKey: "letter:ram.closed", portableMasteryId: "x", skillId: "skill.syllable_blending.cvc" }],
      [[true, true, true]],
    ),
  };
  assert("W19.1 letter:ram.closed cannot pass Wave 19", !evaluateUnitMastery(wave19Bundle, w19u1, w19u1Exercises, w19RamClosedOnly).mastered);

  const w19JisClosedOnly = {
    ...throughWave18,
    ...itemsFrom(
      [{ type: "letter", id: "jis.closed", liveKey: "letter:jis.closed", portableMasteryId: "x", skillId: "skill.syllable_blending.cvc" }],
      [[true, true, true]],
    ),
  };
  assert("W19.1 letter:jis.closed cannot pass Wave 19", !evaluateUnitMastery(wave19Bundle, w19u1, w19u1Exercises, w19JisClosedOnly).mastered);

  const w19SukunOnly = {
    ...throughWave18,
    ...itemsFrom(
      [{ type: "letter", id: "mim.sukun.discrimination", liveKey: "diacritic:mim.sukun.discrimination", portableMasteryId: "x", skillId: "skill.sukun.basic" }],
      [[true, true, true]],
    ),
  };
  assert("W19.1 diacritic:mim.sukun.discrimination cannot pass Wave 19", !evaluateUnitMastery(wave19Bundle, w19u1, w19u1Exercises, w19SukunOnly).mastered);

  const w19WordKeys = {
    ...throughWave18,
    ...itemsFrom(
      [
        { type: "word", id: "naam.decoding", liveKey: "word:naam.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "laa.decoding", liveKey: "word:laa.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "wa.decoding", liveKey: "word:wa.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
      ],
      [[true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("W19.1 word keys cannot pass Wave 19", !evaluateUnitMastery(wave19Bundle, w19u1, w19u1Exercises, w19WordKeys).mastered);

  const w19u1Mastered = masterRequired(wave19Bundle, w19u1, w19u1Exercises, throughWave18);
  const w19u1ok = evaluateUnitMastery(wave19Bundle, w19u1, w19u1Exercises, w19u1Mastered);
  assert("W19.1 unit masters only with letter:bul.closed", w19u1ok.mastered, w19u1ok.blockers.join("; "));
  assert(
    "W19.1 presentation attempts remain 0",
    (w19u1Mastered[getPresentationLiveKey("exercise.wave19.presentation.ba_damma").liveKey]?.attempts ?? 0) === 0 &&
      (w19u1Mastered[getPresentationLiveKey("exercise.wave19.presentation.bul_closed").liveKey]?.attempts ?? 0) === 0,
  );

  assert("W19.3 only the one required live key", w19u1Required.map((ref) => ref.liveKey).join(",") === "letter:bul.closed");
  assert(
    "W19.3 no open-damma/discrimination/word/writing keys",
    !w19u1Required.some((ref) =>
      ref.liveKey === "letter:ba.damma" ||
      ref.liveKey === "letter:kaf.damma" ||
      ref.liveKey.includes("discrimination") ||
      ref.liveKey.startsWith("word:") ||
      ref.liveKey.includes("tracing") ||
      ref.liveKey.includes("writing"),
    ),
  );
  assert("W19.3 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-19") && !lessonPlayerSrc.includes("wave-20"));
  assert("W19.3 Wave 19 is registered and Wave 20 is not", resolveLearnSrcEarly.includes("WAVE19_SLUG") && resolveLearnSrcEarly.includes("getWave19Bundle") && resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));
  assert("W19.3 Wave 18 final unit id is unchanged", w18u2.id === "unit.literacy.wave18.kaf_damma");
  assert("W19.3 Wave 1–18 mastery still holds after Wave 19 load", w18u2ok.mastered && w17u2ok.mastered);
  const frozenPriorWavesW19 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path, wave10Path, wave11Path, wave12Path, wave13Path, wave14Path, wave15Path, wave16Path, wave17Path, wave18Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("unit.literacy.wave19") && !src.includes("path.literacy.wave19") && !src.includes("literacy-path.wave-19");
  });
  assert("W19.3 Waves 1–18 lesson JSON stay free of Wave 19 unit/path ids", frozenPriorWavesW19);
  assert("W19.3 no Wave 20 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));
  const w19UnitMasterySrc = readFileSync(join(root, "src/lib/curriculum/unitMastery.ts"), "utf8");
  const w19SyllableAdapterSrc = readFileSync(join(root, "src/lib/curriculum/syllableAdapter.ts"), "utf8");
  const w19PresentationSrc = readFileSync(join(root, "src/lib/curriculum/presentationAdapter.ts"), "utf8");
  assert(
    "W19.3 no runtime architecture change",
    !w19UnitMasterySrc.includes("wave19") &&
      !w19UnitMasterySrc.includes("wave-19") &&
      !w19SyllableAdapterSrc.includes("wave19") &&
      !w19SyllableAdapterSrc.includes("wave-19") &&
      !w19PresentationSrc.includes("wave19") &&
      !lessonPlayerSrc.includes("wave-19") &&
      !lessonPlayerSrc.includes("wave19"),
  );
  assert("W19.3 no verb/sentence/article/tanween/word records", (wave19Bundle.sentences?.length ?? 0) === 0 && (wave19Bundle.words?.length ?? 0) === 0);
  assert("W19.3 no second closed-damma chunk", (wave19Bundle.syllables ?? []).filter((row) => row.pattern === "CVC" && row.id !== "syllable.ram.closed").map((row) => row.id).join(",") === "syllable.bul.closed");

  const w19Report = readFileSync(join(root, "docs/literacy-wave-19-report.md"), "utf8");
  assert("W19 report exists and postpones Wave 20", /WAVE 19 IMPLEMENTED — DO NOT IMPLEMENT WAVE 20/.test(w19Report) && w19Report.includes("بُلْ"));

  const wave20Raw = JSON.parse(readFileSync(wave20Path, "utf8"));
  const wave20Validation = validateCurriculum(wave20Raw);
  assert("Wave 20 production JSON validates", wave20Validation.ok, wave20Validation.issues.map((issue) => issue.message).join("; "));
  const wave20Bundle = asCurriculumBundle(wave20Raw);
  const wave20PathRow = wave20Bundle.paths?.find((row) => row.id === WAVE20_PATH_ID);
  if (!wave20PathRow) throw new Error("Wave 20 path missing");
  const wave20ById = new Map((wave20Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave20Units = wave20PathRow.unitIds.flatMap((id) => {
    const unit = wave20ById.get(id);
    return unit ? [unit] : [];
  });
  const w20u1 = wave20Units[0];
  if (!w20u1) throw new Error("Wave 20 unit missing");

  assert("Wave 20 declares exactly one unit", wave20Units.length === 1);
  assert("Wave 20 has no second unit", wave20Units[1] === undefined);
  assert("Wave 20 Unit 1 prereq is Wave 19 final unit", w20u1.prereqUnitIds?.[0] === "unit.literacy.wave19.bul_closed");
  assert("Wave 20 child title is يَلْعَبُ", w20u1.titleAr === "يَلْعَبُ" && w20u1.childGoalAr === "يَلْعَبُ");
  assert("Wave 20 has no sentence records", (wave20Bundle.sentences?.length ?? 0) === 0);
  assert("Wave 20 copies word.yalab", (wave20Bundle.words ?? []).some((row) => row.id === "word.yalab" && row.diacritized === "يَلْعَبُ"));

  const lookupPrereqW20 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w20 = wave20Bundle.units?.find((row) => row.id === id);
    if (w20) return { bundle: wave20Bundle, unit: w20 };
    return lookupPrereqW19(id);
  };

  const w20u1Exercises = exercisesForUnit(wave20Bundle, w20u1);
  const throughWave19 = w19u1Mastered;

  assert(
    "W20.1 Wave 20 locked before Wave 19 final mastery",
    !evaluateUnitUnlock(wave20Bundle, wave20Units, w20u1, throughWave18, lookupPrereqW20).unlocked,
  );
  const w20u1Unlock = evaluateUnitUnlock(wave20Bundle, wave20Units, w20u1, throughWave19, lookupPrereqW20);
  assert("W20.1 Wave 20 unit opens after Wave 19 final", w20u1Unlock.unlocked, w20u1Unlock.blockers.join("; "));
  assert("W20.1 renderers ready", unitRenderersReady(w20u1Exercises));

  const w20ShowYal = w20u1Exercises.find((row) => row.id === "exercise.wave20.presentation.yal");
  const w20ShowYala = w20u1Exercises.find((row) => row.id === "exercise.wave20.presentation.yala");
  const w20ShowYalab = w20u1Exercises.find((row) => row.id === "exercise.wave20.presentation.yalab");
  const w20Score = w20u1Exercises.find((row) => row.id === "exercise.wave20.audio_to_word.yalab");
  assert(
    "W20.1 Unit JSON is three binary SHOWs then scored يَلْعَبُ",
    w20u1Exercises[0]?.id === "exercise.wave20.presentation.yal" &&
      w20u1Exercises[1]?.id === "exercise.wave20.presentation.yala" &&
      w20u1Exercises[2]?.id === "exercise.wave20.presentation.yalab" &&
      w20u1Exercises[3]?.id === "exercise.wave20.audio_to_word.yalab",
  );
  assert(
    "W20.1 first SHOW is يَ + لْ → يَلْ",
    w20ShowYal?.type === "presentation" &&
      w20ShowYal.config?.["show"] === "chunk" &&
      w20ShowYal.config?.["left"] === "يَ" &&
      w20ShowYal.config?.["right"] === "لْ" &&
      w20ShowYal.config?.["result"] === "يَلْ",
  );
  assert(
    "W20.1 second SHOW is يَلْ + عَ → يَلْعَ",
    w20ShowYala?.type === "presentation" &&
      w20ShowYala.config?.["show"] === "chunk" &&
      w20ShowYala.config?.["left"] === "يَلْ" &&
      w20ShowYala.config?.["right"] === "عَ" &&
      w20ShowYala.config?.["result"] === "يَلْعَ",
  );
  assert(
    "W20.1 third SHOW is يَلْعَ + بُ → يَلْعَبُ",
    w20ShowYalab?.type === "presentation" &&
      w20ShowYalab.config?.["show"] === "chunk" &&
      w20ShowYalab.config?.["left"] === "يَلْعَ" &&
      w20ShowYalab.config?.["right"] === "بُ" &&
      w20ShowYalab.config?.["result"] === "يَلْعَبُ",
  );
  assert("W20.1 scored target is word.yalab", w20Score?.type === "audio_to_word" && w20Score.success.correctChoiceId === "word.yalab");
  assert(
    "W20.1 scored choices are يَلْعَبُ / جِسْم / بِنْت",
    (w20Score?.choices ?? []).some((row) => row.id === "word.yalab" && row.label === "يَلْعَبُ") &&
      (w20Score?.choices ?? []).some((row) => row.id === "word.jism" && row.label === "جِسْم") &&
      (w20Score?.choices ?? []).some((row) => row.id === "word.bint" && row.label === "بِنْت"),
  );
  assert("W20.1 no picture gate", !w20u1Exercises.some((row) => row.type === "picture_to_word" || row.type === "word_to_picture"));
  assert("W20.1 no syllable_blending / missing_haraka / tracing", !w20u1Exercises.some((row) => row.type === "syllable_blending" || row.type === "missing_haraka" || row.type === "tracing"));

  const w20u1LiveStart = scheduleLesson(wave20Bundle, w20u1, w20u1Exercises, throughWave19);
  assert("W20.1 live first beat is unscored يَ + لْ SHOW", w20u1Exercises[w20u1LiveStart.index]?.id === "exercise.wave20.presentation.yal");
  const w20u1AfterDemos = scheduleLesson(
    wave20Bundle,
    w20u1,
    w20u1Exercises,
    { ...throughWave19, ...seenItems(w20u1Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w20u1LiveStart.index },
  );
  assert("W20.1 live first scored beat is audio_to_word يَلْعَبُ", w20u1Exercises[w20u1AfterDemos.index]?.id === "exercise.wave20.audio_to_word.yalab");

  const w20u1Required = requiredRefsForUnit(wave20Bundle, w20u1, w20u1Exercises);
  assert("W20.1 required live key is word:yalab.decoding only", w20u1Required.length === 1 && w20u1Required[0]?.liveKey === "word:yalab.decoding", w20u1Required.map((ref) => ref.liveKey).join(", "));
  assert(
    "W20.1 generic getWordLiveKey produces word:yalab.decoding",
    getWordLiveKey({ wordId: "word.yalab" }).liveKey === "word:yalab.decoding",
  );

  const w20DemosSeen = {
    ...throughWave19,
    ...seenItems(w20u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W20.1 presentations cannot pass the unit", !evaluateUnitMastery(wave20Bundle, w20u1, w20u1Exercises, w20DemosSeen).mastered);
  assert("W20.1 Wave 19 closed key cannot pass Wave 20", !evaluateUnitMastery(wave20Bundle, w20u1, w20u1Exercises, throughWave19).mastered);

  const w20BaDammaOnly = {
    ...throughWave18,
    ...itemsFrom(
      [{ type: "letter", id: "ba.damma", liveKey: "letter:ba.damma", portableMasteryId: "x", skillId: "skill.short_vowel.damma" }],
      [[true, true, true]],
    ),
  };
  assert("W20.1 letter:ba.damma cannot pass Wave 20", !evaluateUnitMastery(wave20Bundle, w20u1, w20u1Exercises, w20BaDammaOnly).mastered);

  const w20KafDammaOnly = {
    ...throughWave18,
    ...itemsFrom(
      [{ type: "letter", id: "kaf.damma", liveKey: "letter:kaf.damma", portableMasteryId: "x", skillId: "skill.short_vowel.damma" }],
      [[true, true, true]],
    ),
  };
  assert("W20.1 letter:kaf.damma cannot pass Wave 20", !evaluateUnitMastery(wave20Bundle, w20u1, w20u1Exercises, w20KafDammaOnly).mastered);

  const w20BulClosedOnly = {
    ...throughWave18,
    ...itemsFrom(
      [{ type: "letter", id: "bul.closed", liveKey: "letter:bul.closed", portableMasteryId: "x", skillId: "skill.syllable_blending.cvc" }],
      [[true, true, true]],
    ),
  };
  assert("W20.1 letter:bul.closed cannot pass Wave 20", !evaluateUnitMastery(wave20Bundle, w20u1, w20u1Exercises, w20BulClosedOnly).mastered);

  const w20RamClosedOnly = {
    ...throughWave19,
    ...itemsFrom(
      [{ type: "letter", id: "ram.closed", liveKey: "letter:ram.closed", portableMasteryId: "x", skillId: "skill.syllable_blending.cvc" }],
      [[true, true, true]],
    ),
  };
  assert("W20.1 letter:ram.closed cannot pass Wave 20", !evaluateUnitMastery(wave20Bundle, w20u1, w20u1Exercises, w20RamClosedOnly).mastered);

  const w20JisClosedOnly = {
    ...throughWave19,
    ...itemsFrom(
      [{ type: "letter", id: "jis.closed", liveKey: "letter:jis.closed", portableMasteryId: "x", skillId: "skill.syllable_blending.cvc" }],
      [[true, true, true]],
    ),
  };
  assert("W20.1 letter:jis.closed cannot pass Wave 20", !evaluateUnitMastery(wave20Bundle, w20u1, w20u1Exercises, w20JisClosedOnly).mastered);

  const w20SukunOnly = {
    ...throughWave19,
    ...itemsFrom(
      [{ type: "letter", id: "mim.sukun.discrimination", liveKey: "diacritic:mim.sukun.discrimination", portableMasteryId: "x", skillId: "skill.sukun.basic" }],
      [[true, true, true]],
    ),
  };
  assert("W20.1 diacritic:mim.sukun.discrimination cannot pass Wave 20", !evaluateUnitMastery(wave20Bundle, w20u1, w20u1Exercises, w20SukunOnly).mastered);

  const w20OtherWords = {
    ...throughWave19,
    ...itemsFrom(
      [
        { type: "word", id: "jism.decoding", liveKey: "word:jism.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "bint.decoding", liveKey: "word:bint.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
      ],
      [[true, true, true], [true, true, true]],
    ),
  };
  assert("W20.1 word:jism.decoding / word:bint.decoding cannot pass Wave 20", !evaluateUnitMastery(wave20Bundle, w20u1, w20u1Exercises, w20OtherWords).mastered);

  const w20u1Mastered = masterRequired(wave20Bundle, w20u1, w20u1Exercises, throughWave19);
  const w20u1ok = evaluateUnitMastery(wave20Bundle, w20u1, w20u1Exercises, w20u1Mastered);
  assert("W20.1 unit masters only with word:yalab.decoding", w20u1ok.mastered, w20u1ok.blockers.join("; "));
  assert(
    "W20.1 presentation attempts remain 0",
    (w20u1Mastered[getPresentationLiveKey("exercise.wave20.presentation.yal").liveKey]?.attempts ?? 0) === 0 &&
      (w20u1Mastered[getPresentationLiveKey("exercise.wave20.presentation.yala").liveKey]?.attempts ?? 0) === 0 &&
      (w20u1Mastered[getPresentationLiveKey("exercise.wave20.presentation.yalab").liveKey]?.attempts ?? 0) === 0,
  );

  assert("W20.3 only the one required live key", w20u1Required.map((ref) => ref.liveKey).join(",") === "word:yalab.decoding");
  assert(
    "W20.3 no closed/damma/discrimination/writing keys",
    !w20u1Required.some((ref) =>
      ref.liveKey === "letter:ba.damma" ||
      ref.liveKey === "letter:kaf.damma" ||
      ref.liveKey === "letter:bul.closed" ||
      ref.liveKey === "letter:yal.closed" ||
      ref.liveKey.includes("discrimination") ||
      ref.liveKey.includes("partial") ||
      ref.liveKey.includes("tracing") ||
      ref.liveKey.includes("writing"),
    ),
  );
  assert("W20.3 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-20") && !lessonPlayerSrc.includes("wave-21"));
  assert("W20.3 Wave 20 is registered and Wave 21 is not", resolveLearnSrcEarly.includes("WAVE20_SLUG") && resolveLearnSrcEarly.includes("getWave20Bundle") && resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));
  assert("W20.3 Wave 19 final unit id is unchanged", w19u1.id === "unit.literacy.wave19.bul_closed");
  assert("W20.3 Wave 1–19 mastery still holds after Wave 20 load", w19u1ok.mastered && w18u2ok.mastered);
  const frozenPriorWavesW20 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path, wave10Path, wave11Path, wave12Path, wave13Path, wave14Path, wave15Path, wave16Path, wave17Path, wave18Path, wave19Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("unit.literacy.wave20") && !src.includes("path.literacy.wave20") && !src.includes("literacy-path.wave-20");
  });
  assert("W20.3 Waves 1–19 lesson JSON stay free of Wave 20 unit/path ids", frozenPriorWavesW20);
  assert("W20.3 no Wave 21 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));
  const w20UnitMasterySrc = readFileSync(join(root, "src/lib/curriculum/unitMastery.ts"), "utf8");
  const w20WordAdapterSrc = readFileSync(join(root, "src/lib/curriculum/wordAdapter.ts"), "utf8");
  const w20PresentationSrc = readFileSync(join(root, "src/lib/curriculum/presentationAdapter.ts"), "utf8");
  assert(
    "W20.3 no runtime architecture change",
    !w20UnitMasterySrc.includes("wave20") &&
      !w20UnitMasterySrc.includes("wave-20") &&
      !w20WordAdapterSrc.includes("wave20") &&
      !w20WordAdapterSrc.includes("wave-20") &&
      !w20PresentationSrc.includes("wave20") &&
      !lessonPlayerSrc.includes("wave-20") &&
      !lessonPlayerSrc.includes("wave20"),
  );
  assert("W20.3 no sentence/article/pronoun records", (wave20Bundle.sentences?.length ?? 0) === 0);
  assert("W20.3 no closed syllable record", !(wave20Bundle.syllables ?? []).some((row) => row.pattern === "CVC" || row.id.endsWith(".closed")));
  assert("W20.3 reused عَ and بُ", (wave20Bundle.syllables ?? []).some((row) => row.id === "syllable.ain.fatha" && row.text === "عَ") && (wave20Bundle.syllables ?? []).some((row) => row.id === "syllable.ba.damma" && row.text === "بُ"));

  const w20Report = readFileSync(join(root, "docs/literacy-wave-20-report.md"), "utf8");
  assert("W20 report exists and postpones Wave 21", /WAVE 20 IMPLEMENTED — DO NOT IMPLEMENT WAVE 21/.test(w20Report) && w20Report.includes("يَلْعَبُ"));

  const wave21Raw = JSON.parse(readFileSync(wave21Path, "utf8"));
  const wave21Validation = validateCurriculum(wave21Raw);
  assert("Wave 21 production JSON validates", wave21Validation.ok, wave21Validation.issues.map((issue) => issue.message).join("; "));
  const wave21Bundle = asCurriculumBundle(wave21Raw);
  const wave21PathRow = wave21Bundle.paths?.find((row) => row.id === WAVE21_PATH_ID);
  if (!wave21PathRow) throw new Error("Wave 21 path missing");
  const wave21ById = new Map((wave21Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave21Units = wave21PathRow.unitIds.flatMap((id) => {
    const unit = wave21ById.get(id);
    return unit ? [unit] : [];
  });
  const w21u1 = wave21Units[0];
  if (!w21u1) throw new Error("Wave 21 unit missing");

  assert("Wave 21 declares exactly one unit", wave21Units.length === 1);
  assert("Wave 21 has no second unit", wave21Units[1] === undefined);
  assert("Wave 21 Unit 1 prereq is Wave 20 final unit", w21u1.prereqUnitIds?.[0] === "unit.literacy.wave20.yalab");
  assert("Wave 21 child title is الْوَلَدُ يَلْعَبُ", w21u1.titleAr === "الْوَلَدُ يَلْعَبُ" && w21u1.childGoalAr === "الْوَلَدُ يَلْعَبُ");
  assert("Wave 21 has exactly one sentence", (wave21Bundle.sentences?.length ?? 0) === 1);
  assert(
    "Wave 21 sentence is الْوَلَدُ يَلْعَبُ",
    wave21Bundle.sentences?.[0]?.id === "sentence.wave21.alwaladu_yalabu" &&
      wave21Bundle.sentences?.[0]?.diacritized === "الْوَلَدُ يَلْعَبُ" &&
      wave21Bundle.sentences?.[0]?.audioAssetId === "audio.sentence.wave21.alwaladu_yalabu",
  );
  assert(
    "Wave 21 keeps citation وَلَد",
    (wave21Bundle.words ?? []).some((row) => row.id === "word.walad" && row.teachingForm === "وَلَد" && row.diacritized === "وَلَد"),
  );
  assert(
    "Wave 21 keeps يَلْعَبُ",
    (wave21Bundle.words ?? []).some((row) => row.id === "word.yalab" && row.diacritized === "يَلْعَبُ"),
  );

  const lookupPrereqW21 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w21 = wave21Bundle.units?.find((row) => row.id === id);
    if (w21) return { bundle: wave21Bundle, unit: w21 };
    return lookupPrereqW20(id);
  };

  const w21u1Exercises = exercisesForUnit(wave21Bundle, w21u1);
  const throughWave20 = w20u1Mastered;

  assert(
    "W21.1 Wave 21 locked before Wave 20 final mastery",
    !evaluateUnitUnlock(wave21Bundle, wave21Units, w21u1, throughWave19, lookupPrereqW21).unlocked,
  );
  const w21u1Unlock = evaluateUnitUnlock(wave21Bundle, wave21Units, w21u1, throughWave20, lookupPrereqW21);
  assert("W21.1 Wave 21 unit opens after Wave 20 final", w21u1Unlock.unlocked, w21u1Unlock.blockers.join("; "));
  assert("W21.1 renderers ready", unitRenderersReady(w21u1Exercises));

  const w21ShowAl = w21u1Exercises.find((row) => row.id === "exercise.wave21.presentation.al");
  const w21ShowNoun = w21u1Exercises.find((row) => row.id === "exercise.wave21.presentation.alwaladu");
  const w21ShowSentence = w21u1Exercises.find((row) => row.id === "exercise.wave21.presentation.alwaladu_yalabu");
  const w21Score = w21u1Exercises.find((row) => row.id === "exercise.wave21.audio_to_sentence.alwaladu_yalabu");
  assert(
    "W21.1 Unit JSON is three SHOWs then scored sentence",
    w21u1Exercises[0]?.id === "exercise.wave21.presentation.al" &&
      w21u1Exercises[1]?.id === "exercise.wave21.presentation.alwaladu" &&
      w21u1Exercises[2]?.id === "exercise.wave21.presentation.alwaladu_yalabu" &&
      w21u1Exercises[3]?.id === "exercise.wave21.audio_to_sentence.alwaladu_yalabu",
  );
  assert(
    "W21.1 first SHOW is ا + لْ → الْ",
    w21ShowAl?.type === "presentation" &&
      w21ShowAl.config?.["show"] === "chunk" &&
      w21ShowAl.config?.["left"] === "ا" &&
      w21ShowAl.config?.["right"] === "لْ" &&
      w21ShowAl.config?.["result"] === "الْ",
  );
  assert(
    "W21.1 second SHOW is الْ + وَلَد → الْوَلَدُ",
    w21ShowNoun?.type === "presentation" &&
      w21ShowNoun.config?.["show"] === "chunk" &&
      w21ShowNoun.config?.["left"] === "الْ" &&
      w21ShowNoun.config?.["right"] === "وَلَد" &&
      w21ShowNoun.config?.["result"] === "الْوَلَدُ",
  );
  assert(
    "W21.1 third SHOW is الْوَلَدُ + يَلْعَبُ → الْوَلَدُ يَلْعَبُ",
    w21ShowSentence?.type === "presentation" &&
      w21ShowSentence.config?.["show"] === "chunk" &&
      w21ShowSentence.config?.["left"] === "الْوَلَدُ" &&
      w21ShowSentence.config?.["right"] === "يَلْعَبُ" &&
      w21ShowSentence.config?.["result"] === "الْوَلَدُ يَلْعَبُ",
  );
  assert("W21.1 scored target is the canonical sentence", w21Score?.type === "audio_to_sentence" && w21Score.success.correctChoiceId === "sentence.wave21.alwaladu_yalabu");
  assert(
    "W21.1 scored choices are sentence plus citation foils",
    (w21Score?.choices ?? []).some((row) => row.id === "sentence.wave21.alwaladu_yalabu" && row.label === "الْوَلَدُ يَلْعَبُ") &&
      (w21Score?.choices ?? []).some((row) => row.id === "word.yalab" && row.label === "يَلْعَبُ") &&
      (w21Score?.choices ?? []).some((row) => row.id === "word.walad" && row.label === "وَلَد"),
  );
  assert("W21.1 no picture gate", !w21u1Exercises.some((row) => row.type === "picture_to_word" || row.type === "word_to_picture"));
  assert("W21.1 no writing / tracing / dictation", !w21u1Exercises.some((row) => row.type === "tracing" || row.type === "dictation"));

  const w21Resolved = w21Score ? resolveAudioToSentence(wave21Bundle, w21Score) : undefined;
  assert(
    "W21.1 audio_to_sentence resolves mixed sentence/word choices",
    Boolean(w21Resolved) &&
      w21Resolved?.target.id === "sentence.wave21.alwaladu_yalabu" &&
      w21Resolved?.target.displayText === "الْوَلَدُ يَلْعَبُ" &&
      w21Resolved?.promptAssetId === "audio.sentence.wave21.alwaladu_yalabu" &&
      (w21Resolved?.choices.length ?? 0) === 3,
  );

  const w21u1LiveStart = scheduleLesson(wave21Bundle, w21u1, w21u1Exercises, throughWave20);
  assert("W21.1 live first beat is unscored article SHOW", w21u1Exercises[w21u1LiveStart.index]?.id === "exercise.wave21.presentation.al");
  const w21u1AfterDemos = scheduleLesson(
    wave21Bundle,
    w21u1,
    w21u1Exercises,
    { ...throughWave20, ...seenItems(w21u1Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w21u1LiveStart.index },
  );
  assert("W21.1 live first scored beat is audio_to_sentence", w21u1Exercises[w21u1AfterDemos.index]?.id === "exercise.wave21.audio_to_sentence.alwaladu_yalabu");

  const w21u1Required = requiredRefsForUnit(wave21Bundle, w21u1, w21u1Exercises);
  assert(
    "W21.1 required live key is sentence:wave21.alwaladu_yalabu.reading only",
    w21u1Required.length === 1 && w21u1Required[0]?.liveKey === "sentence:wave21.alwaladu_yalabu.reading",
    w21u1Required.map((ref) => ref.liveKey).join(", "),
  );
  assert(
    "W21.1 generic getSentenceLiveKey produces sentence:wave21.alwaladu_yalabu.reading",
    getSentenceLiveKey({ sentenceId: "sentence.wave21.alwaladu_yalabu" }).liveKey === "sentence:wave21.alwaladu_yalabu.reading",
  );
  assert(
    "W21.1 getSentenceLiveKey is not wave-specific",
    getSentenceLiveKey({ sentenceId: "sentence.l4.001" }).liveKey === "sentence:l4.001.reading",
  );

  const w21DemosSeen = {
    ...throughWave20,
    ...seenItems(w21u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W21.1 presentations cannot pass the unit", !evaluateUnitMastery(wave21Bundle, w21u1, w21u1Exercises, w21DemosSeen).mastered);
  assert("W21.1 Wave 20 word key cannot pass Wave 21", !evaluateUnitMastery(wave21Bundle, w21u1, w21u1Exercises, throughWave20).mastered);

  const w21YalabOnly = {
    ...throughWave19,
    ...itemsFrom(
      [{ type: "word", id: "yalab.decoding", liveKey: "word:yalab.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" }],
      [[true, true, true]],
    ),
  };
  assert("W21.1 word:yalab.decoding cannot pass Wave 21", !evaluateUnitMastery(wave21Bundle, w21u1, w21u1Exercises, w21YalabOnly).mastered);

  const w21WaladOnly = {
    ...throughWave20,
    ...itemsFrom(
      [{ type: "word", id: "walad.decoding", liveKey: "word:walad.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" }],
      [[true, true, true]],
    ),
  };
  assert("W21.1 word:walad.decoding cannot pass Wave 21", !evaluateUnitMastery(wave21Bundle, w21u1, w21u1Exercises, w21WaladOnly).mastered);

  const w21u1Mastered = masterRequired(wave21Bundle, w21u1, w21u1Exercises, throughWave20);
  const w21u1ok = evaluateUnitMastery(wave21Bundle, w21u1, w21u1Exercises, w21u1Mastered);
  assert("W21.1 unit masters only with sentence reading key", w21u1ok.mastered, w21u1ok.blockers.join("; "));
  assert(
    "W21.1 presentation attempts remain 0",
    (w21u1Mastered[getPresentationLiveKey("exercise.wave21.presentation.al").liveKey]?.attempts ?? 0) === 0 &&
      (w21u1Mastered[getPresentationLiveKey("exercise.wave21.presentation.alwaladu").liveKey]?.attempts ?? 0) === 0 &&
      (w21u1Mastered[getPresentationLiveKey("exercise.wave21.presentation.alwaladu_yalabu").liveKey]?.attempts ?? 0) === 0,
  );

  assert("W21.3 only the one required live key", w21u1Required.map((ref) => ref.liveKey).join(",") === "sentence:wave21.alwaladu_yalabu.reading");
  assert(
    "W21.3 no article/writing/tanween/pronoun keys",
    !w21u1Required.some((ref) =>
      ref.liveKey.includes("article") ||
      ref.liveKey.includes("writing") ||
      ref.liveKey.includes("tanween") ||
      ref.liveKey.includes("huwa") ||
      ref.liveKey.includes("hadha") ||
      ref.liveKey.includes("tracing"),
    ),
  );
  assert("W21.3 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-21") && !lessonPlayerSrc.includes("wave-22"));
  assert("W21.3 Wave 21 and Wave 22 are registered and Wave 23 is not", resolveLearnSrcEarly.includes("WAVE21_SLUG") && resolveLearnSrcEarly.includes("getWave21Bundle") && resolveLearnSrcEarly.includes("WAVE22_SLUG") && resolveLearnSrcEarly.includes("getWave22Bundle") && !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));
  assert("W21.3 Wave 23 is not registered", !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23"));
  assert("W21.3 Wave 20 final unit id is unchanged", w20u1.id === "unit.literacy.wave20.yalab");
  assert("W21.3 Wave 1–20 mastery still holds after Wave 21 load", w20u1ok.mastered && w19u1ok.mastered);
  const frozenPriorWavesW21 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path, wave10Path, wave11Path, wave12Path, wave13Path, wave14Path, wave15Path, wave16Path, wave17Path, wave18Path, wave19Path, wave20Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("unit.literacy.wave21") && !src.includes("path.literacy.wave21") && !src.includes("literacy-path.wave-21");
  });
  assert("W21.3 Waves 1–20 lesson JSON stay free of Wave 21 unit/path ids", frozenPriorWavesW21);
  assert("W21.3 no Wave 23 content file", !resolveLearnSrcEarly.includes("wave23Bundle") && !resolveLearnSrcEarly.includes("getWave23Bundle"));
  const w21UnitMasterySrc = readFileSync(join(root, "src/lib/curriculum/unitMastery.ts"), "utf8");
  const w21SentenceAdapterSrc = readFileSync(join(root, "src/lib/curriculum/sentenceAdapter.ts"), "utf8");
  const w21PresentationSrc = readFileSync(join(root, "src/lib/curriculum/presentationAdapter.ts"), "utf8");
  assert(
    "W21.3 no wave-named runtime architecture",
    !w21UnitMasterySrc.includes("wave21") &&
      !w21UnitMasterySrc.includes("wave-21") &&
      !w21SentenceAdapterSrc.includes("wave21") &&
      !w21SentenceAdapterSrc.includes("wave-21") &&
      !w21PresentationSrc.includes("wave21") &&
      !lessonPlayerSrc.includes("wave-21") &&
      !lessonPlayerSrc.includes("wave21"),
  );
  const w21Blob = JSON.stringify(wave21Raw);
  assert("W21.3 Policy A: no وَلَد يَلْعَبُ", !w21Blob.includes("وَلَد يَلْعَبُ"));
  assert(
    "W21.3 no tanween / pronoun / demonstrative in Wave 21 teaching strings",
    wave21Bundle.sentences?.[0]?.diacritized === "الْوَلَدُ يَلْعَبُ" &&
      !/[ًٌٍ]/.test(wave21Bundle.sentences?.[0]?.diacritized ?? "") &&
      !/[ًٌٍ]/.test((wave21Bundle.words ?? []).map((row) => `${row.diacritized}${row.teachingForm}`).join("")) &&
      !w21Blob.includes("هُوَ") &&
      !w21Blob.includes("هِيَ") &&
      !w21Blob.includes("هَذَا") &&
      !w21Blob.includes("هَذِهِ"),
  );

  const w21Report = readFileSync(join(root, "docs/literacy-wave-21-report.md"), "utf8");
  assert("W21 report exists and hands off Wave 22", /WAVE 21 IMPLEMENTED — READY FOR WAVE 22/.test(w21Report) && w21Report.includes("الْوَلَدُ يَلْعَبُ"));

  const wave22Raw = JSON.parse(readFileSync(wave22Path, "utf8"));
  const wave22Validation = validateCurriculum(wave22Raw);
  assert("Wave 22 production JSON validates", wave22Validation.ok, wave22Validation.issues.map((issue) => issue.message).join("; "));
  const wave22Bundle = asCurriculumBundle(wave22Raw);
  const wave22PathRow = wave22Bundle.paths?.find((row) => row.id === WAVE22_PATH_ID);
  if (!wave22PathRow) throw new Error("Wave 22 path missing");
  const wave22ById = new Map((wave22Bundle.units ?? []).map((unit) => [unit.id, unit]));
  const wave22Units = wave22PathRow.unitIds.flatMap((id) => {
    const unit = wave22ById.get(id);
    return unit ? [unit] : [];
  });
  const w22u1 = wave22Units[0];
  if (!w22u1) throw new Error("Wave 22 unit missing");

  assert("Wave 22 declares exactly one unit", wave22Units.length === 1);
  assert("Wave 22 has no second unit", wave22Units[1] === undefined);
  assert("Wave 22 Unit 1 id is unit.literacy.wave22.handoff", w22u1.id === "unit.literacy.wave22.handoff");
  assert("Wave 22 Unit 1 prereq is Wave 21 final unit", w22u1.prereqUnitIds?.[0] === "unit.literacy.wave21.alwaladu_yalabu");
  assert("Wave 22 child title is الْوَلَدُ يَلْعَبُ", w22u1.titleAr === "الْوَلَدُ يَلْعَبُ" && w22u1.childGoalAr === "الْوَلَدُ يَلْعَبُ");
  assert("Wave 22 has no local sentence record", (wave22Bundle.sentences?.length ?? 0) === 0);
  assert(
    "Wave 22 keeps citation وَلَد / يَلْعَبُ / بِنْت",
    (wave22Bundle.words ?? []).some((row) => row.id === "word.walad" && row.teachingForm === "وَلَد") &&
      (wave22Bundle.words ?? []).some((row) => row.id === "word.yalab" && row.diacritized === "يَلْعَبُ") &&
      (wave22Bundle.words ?? []).some((row) => row.id === "word.bint" && row.diacritized === "بِنْت"),
  );

  const lookupPrereqW22 = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const w22 = wave22Bundle.units?.find((row) => row.id === id);
    if (w22) return { bundle: wave22Bundle, unit: w22 };
    return lookupPrereqW21(id);
  };

  const w22u1Exercises = exercisesForUnit(wave22Bundle, w22u1);
  const throughWave21 = w21u1Mastered;

  assert(
    "W22.1 Wave 22 locked before Wave 21 final mastery",
    !evaluateUnitUnlock(wave22Bundle, wave22Units, w22u1, throughWave20, lookupPrereqW22).unlocked,
  );
  const w22u1Unlock = evaluateUnitUnlock(wave22Bundle, wave22Units, w22u1, throughWave21, lookupPrereqW22);
  assert("W22.1 Wave 22 unit opens after Wave 21 final", w22u1Unlock.unlocked, w22u1Unlock.blockers.join("; "));
  assert("W22.1 renderers ready", unitRenderersReady(w22u1Exercises));

  const w22ShowWord = w22u1Exercises.find((row) => row.id === "exercise.wave22.presentation.yalab");
  const w22ShowNoun = w22u1Exercises.find((row) => row.id === "exercise.wave22.presentation.alwaladu");
  const w22ShowSentence = w22u1Exercises.find((row) => row.id === "exercise.wave22.presentation.alwaladu_yalabu");
  const w22Score = w22u1Exercises.find((row) => row.id === "exercise.wave22.audio_to_word.yalab_review");
  assert(
    "W22.1 Unit JSON is three SHOWs then scored review",
    w22u1Exercises[0]?.id === "exercise.wave22.presentation.yalab" &&
      w22u1Exercises[1]?.id === "exercise.wave22.presentation.alwaladu" &&
      w22u1Exercises[2]?.id === "exercise.wave22.presentation.alwaladu_yalabu" &&
      w22u1Exercises[3]?.id === "exercise.wave22.audio_to_word.yalab_review",
  );
  const w22ResolvedWordShow = w22ShowWord ? resolvePresentation(wave22Bundle, w22ShowWord) : undefined;
  assert(
    "W22.1 first SHOW is يَلْعَبُ",
    w22ShowWord?.type === "presentation" &&
      w22ShowWord.config?.["show"] === "word" &&
      w22ResolvedWordShow?.glyph === "يَلْعَبُ",
  );
  assert(
    "W22.1 second SHOW is الْ + وَلَد → الْوَلَدُ",
    w22ShowNoun?.type === "presentation" &&
      w22ShowNoun.config?.["show"] === "chunk" &&
      w22ShowNoun.config?.["left"] === "الْ" &&
      w22ShowNoun.config?.["right"] === "وَلَد" &&
      w22ShowNoun.config?.["result"] === "الْوَلَدُ",
  );
  assert(
    "W22.1 third SHOW is الْوَلَدُ + يَلْعَبُ → الْوَلَدُ يَلْعَبُ",
    w22ShowSentence?.type === "presentation" &&
      w22ShowSentence.config?.["show"] === "chunk" &&
      w22ShowSentence.config?.["left"] === "الْوَلَدُ" &&
      w22ShowSentence.config?.["right"] === "يَلْعَبُ" &&
      w22ShowSentence.config?.["result"] === "الْوَلَدُ يَلْعَبُ",
  );
  assert("W22.1 scored type is audio_to_word", w22Score?.type === "audio_to_word" && w22Score.success.correctChoiceId === "word.yalab");
  assert("W22.1 scored exercise uses generic review tag", Boolean(w22Score && isReviewExercise(w22Score)));
  assert(
    "W22.1 scored choices are يَلْعَبُ / وَلَد / بِنْت",
    (w22Score?.choices ?? []).some((row) => row.id === "word.yalab" && row.label === "يَلْعَبُ") &&
      (w22Score?.choices ?? []).some((row) => row.id === "word.walad" && row.label === "وَلَد") &&
      (w22Score?.choices ?? []).some((row) => row.id === "word.bint" && row.label === "بِنْت") &&
      (w22Score?.choices ?? []).length === 3,
  );
  assert("W22.1 no picture gate", !w22u1Exercises.some((row) => row.type === "picture_to_word" || row.type === "word_to_picture"));
  assert("W22.1 no writing / tracing / dictation", !w22u1Exercises.some((row) => row.type === "tracing" || row.type === "dictation"));
  assert("W22.1 no sentence score", !w22u1Exercises.some((row) => row.type === "audio_to_sentence"));

  const w22Resolved = w22Score ? resolveAudioToWord(wave22Bundle, w22Score) : undefined;
  assert(
    "W22.1 audio_to_word resolves review choices",
    Boolean(w22Resolved) &&
      w22Resolved?.target.id === "word.yalab" &&
      w22Resolved?.target.displayText === "يَلْعَبُ" &&
      w22Resolved?.promptAssetId === "audio.word.yalab" &&
      (w22Resolved?.choices.length ?? 0) === 3,
  );

  const w22u1LiveStart = scheduleLesson(wave22Bundle, w22u1, w22u1Exercises, throughWave21);
  assert("W22.1 live first beat is unscored word SHOW", w22u1Exercises[w22u1LiveStart.index]?.id === "exercise.wave22.presentation.yalab");
  const w22u1AfterDemos = scheduleLesson(
    wave22Bundle,
    w22u1,
    w22u1Exercises,
    { ...throughWave21, ...seenItems(w22u1Exercises.filter((row) => row.type === "presentation")) },
    { fromIndex: w22u1LiveStart.index },
  );
  assert("W22.1 live first scored beat is audio_to_word review", w22u1Exercises[w22u1AfterDemos.index]?.id === "exercise.wave22.audio_to_word.yalab_review");

  const w22u1Required = requiredRefsForUnit(wave22Bundle, w22u1, w22u1Exercises);
  assert(
    "W22.1 required live key is word:yalab.review only",
    w22u1Required.length === 1 && w22u1Required[0]?.liveKey === "word:yalab.review",
    w22u1Required.map((ref) => ref.liveKey).join(", "),
  );
  assert(
    "W22.1 generic getWordLiveKey review facet produces word:yalab.review",
    getWordLiveKey({ wordId: "word.yalab", facet: "review" }).liveKey === "word:yalab.review",
  );
  assert(
    "W22.1 decoding facet stays distinct",
    getWordLiveKey({ wordId: "word.yalab", facet: "decoding" }).liveKey === "word:yalab.decoding",
  );

  const w22DemosSeen = {
    ...throughWave21,
    ...seenItems(w22u1Exercises.filter((row) => row.type === "presentation")),
  };
  assert("W22.1 presentations cannot pass the unit", !evaluateUnitMastery(wave22Bundle, w22u1, w22u1Exercises, w22DemosSeen).mastered);
  assert("W22.1 Wave 21 evidence cannot pass Wave 22", !evaluateUnitMastery(wave22Bundle, w22u1, w22u1Exercises, throughWave21).mastered);

  const historicalNoiseRefs: LiveMasteryRef[] = [
    { type: "word", id: "yalab.decoding", liveKey: "word:yalab.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
    { type: "word", id: "walad.decoding", liveKey: "word:walad.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
    { type: "word", id: "walad.review", liveKey: "word:walad.review", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
    { type: "word", id: "bint.decoding", liveKey: "word:bint.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
    { type: "sentence", id: "wave21.alwaladu_yalabu.reading", liveKey: "sentence:wave21.alwaladu_yalabu.reading", portableMasteryId: "x", skillId: "skill.sentence_reading.two_word" },
    { type: "letter", id: "bul.closed", liveKey: "letter:bul.closed", portableMasteryId: "x", skillId: "skill.syllable_blending.cvc" },
    { type: "letter", id: "ba.damma", liveKey: "letter:ba.damma", portableMasteryId: "x", skillId: "skill.short_vowel.damma" },
    { type: "letter", id: "kaf.damma", liveKey: "letter:kaf.damma", portableMasteryId: "x", skillId: "skill.short_vowel.damma" },
    { type: "letter", id: "ram.closed", liveKey: "letter:ram.closed", portableMasteryId: "x", skillId: "skill.syllable_blending.cvc" },
    { type: "letter", id: "jis.closed", liveKey: "letter:jis.closed", portableMasteryId: "x", skillId: "skill.syllable_blending.cvc" },
    { type: "diacritic", id: "mim.fatha.discrimination", liveKey: "diacritic:mim.fatha.discrimination", portableMasteryId: "x", skillId: "skill.short_vowel.fatha" },
    { type: "diacritic", id: "ba.sukun.discrimination", liveKey: "diacritic:ba.sukun.discrimination", portableMasteryId: "x", skillId: "skill.sukun.basic" },
    { type: "diacritic", id: "ya.madd_alif.discrimination", liveKey: "diacritic:ya.madd_alif.discrimination", portableMasteryId: "x", skillId: "skill.long_vowel.madd" },
  ];
  const w22HistoricalOnly = {
    ...throughWave21,
    ...w22DemosSeen,
    ...itemsFrom(historicalNoiseRefs, historicalNoiseRefs.map(() => [true, true, true])),
  };
  assert(
    "W22.1 historical keys cannot pass Wave 22",
    !evaluateUnitMastery(wave22Bundle, w22u1, w22u1Exercises, w22HistoricalOnly).mastered,
  );

  const w22u1Mastered = masterRequired(wave22Bundle, w22u1, w22u1Exercises, throughWave21);
  const w22u1ok = evaluateUnitMastery(wave22Bundle, w22u1, w22u1Exercises, w22u1Mastered);
  assert("W22.1 unit masters only with word:yalab.review", w22u1ok.mastered, w22u1ok.blockers.join("; "));
  assert(
    "W22.1 presentation attempts remain 0",
    (w22u1Mastered[getPresentationLiveKey("exercise.wave22.presentation.yalab").liveKey]?.attempts ?? 0) === 0 &&
      (w22u1Mastered[getPresentationLiveKey("exercise.wave22.presentation.alwaladu").liveKey]?.attempts ?? 0) === 0 &&
      (w22u1Mastered[getPresentationLiveKey("exercise.wave22.presentation.alwaladu_yalabu").liveKey]?.attempts ?? 0) === 0,
  );
  assert("W22.1 decoding key is not the Wave 22 gate", !w22u1Required.some((ref) => ref.liveKey === "word:yalab.decoding"));
  assert("W22.1 no wave22.complete key", !w22u1Required.some((ref) => ref.liveKey.includes("wave22.complete")));

  const w22Status = unitPathStatus(true, w22u1ok);
  assert("W22.6 mastered unit shows أَتْقَنْتَ", w22Status === "mastered" && unitPathCtaAr(w22Status) === "أَتْقَنْتَ");
  assert("W22.6 finish kind is mastered", lessonFinishKind(w22u1ok) === "mastered");
  assert("W22.6 LessonPlayer finish CTA still returns to /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("wave-22") && !lessonPlayerSrc.includes("wave-23"));
  assert(
    "W22.5 Wave 22 is the final registered wave",
    resolveLearnSrcEarly.includes("WAVE22_SLUG") &&
      resolveLearnSrcEarly.includes("getWave22Bundle") &&
      resolveLearnSrcEarly.includes('WAVE22_SLUG = "wave-22"') &&
      /WAVE22_SLUG\] as const/.test(resolveLearnSrcEarly),
  );
  assert("W22.5 Wave 23 is not registered", !resolveLearnSrcEarly.includes("WAVE23") && !resolveLearnSrcEarly.includes("wave-23") && !resolveLearnSrcEarly.includes("getWave23Bundle"));
  assert(
    "W22.5 no Wave 23 content file",
    !existsSync(join(root, "src/content/curriculum/data/production/literacy-path.wave-23.json")) &&
      !existsSync(join(root, "src/lib/curriculum/wave23Bundle.ts")),
  );

  const frozenPriorWavesW22 = [wave1Path, wave2Path, wave3Path, wave4Path, wave5Path, wave6Path, wave7Path, wave8Path, wave9Path, wave10Path, wave11Path, wave12Path, wave13Path, wave14Path, wave15Path, wave16Path, wave17Path, wave18Path, wave19Path, wave20Path, wave21Path].every((path) => {
    const src = readFileSync(path, "utf8");
    return !src.includes("unit.literacy.wave22") && !src.includes("path.literacy.wave22") && !src.includes("literacy-path.wave-22");
  });
  assert("W22.3 Waves 1–21 lesson JSON stay free of Wave 22 unit/path ids", frozenPriorWavesW22);
  const w22UnitMasterySrc = readFileSync(join(root, "src/lib/curriculum/unitMastery.ts"), "utf8");
  const w22WordAdapterSrc = readFileSync(join(root, "src/lib/curriculum/wordAdapter.ts"), "utf8");
  const w22PresentationSrc = readFileSync(join(root, "src/lib/curriculum/presentationAdapter.ts"), "utf8");
  assert(
    "W22.3 no wave-named runtime architecture",
    !w22UnitMasterySrc.includes("wave22") &&
      !w22UnitMasterySrc.includes("wave-22") &&
      !w22WordAdapterSrc.includes("wave22") &&
      !w22WordAdapterSrc.includes("wave-22") &&
      !w22PresentationSrc.includes("wave22") &&
      !lessonPlayerSrc.includes("wave-22") &&
      !lessonPlayerSrc.includes("wave22"),
  );
  const w22Blob = JSON.stringify(wave22Raw);
  assert("W22.3 no second sentence", !w22Blob.includes("sentence.wave22") && !w22Blob.includes("الْبِنْتُ يَلْعَبُ") && !w22Blob.includes("وَلَد يَلْعَبُ"));
  assert(
    "W22.3 no tanween / pronoun / demonstrative / writing in Wave 22 teaching strings",
    !/[ًٌٍ]/.test((wave22Bundle.words ?? []).map((row) => `${row.diacritized}${row.teachingForm}`).join("")) &&
      !w22Blob.includes("هُوَ") &&
      !w22Blob.includes("هِيَ") &&
      !w22Blob.includes("هَذَا") &&
      !w22Blob.includes("هَذِهِ") &&
      !w22Blob.includes("tracing") &&
      !w22Blob.includes("wave22.complete"),
  );

  const learnIndexSrc = readFileSync(join(root, "src/routes/learn/index.tsx"), "utf8");
  const moduleRouteSrc = readFileSync(join(root, "src/routes/learn/modules/$moduleId.$unitId.tsx"), "utf8");
  const waveRouteSrc = readFileSync(join(root, "src/routes/learn/$waveId.$unitId.tsx"), "utf8");
  const rfRaw = JSON.parse(readFileSync(readingFoundationsPath, "utf8"));
  const rfValidation = validateCurriculum(rfRaw);
  assert("Reading foundations production JSON validates", rfValidation.ok, rfValidation.issues.map((issue) => issue.message).join("; "));
  const rfBundle = asCurriculumBundle(rfRaw);
  const rfPathRow = rfBundle.paths?.find((row) => row.id === READING_FOUNDATIONS_PATH_ID);
  if (!rfPathRow) throw new Error("Reading foundations path missing");
  const rfById = new Map((rfBundle.units ?? []).map((unit) => [unit.id, unit]));
  const rfUnits = rfPathRow.unitIds.flatMap((id) => {
    const unit = rfById.get(id);
    return unit ? [unit] : [];
  });
  const [rfU1, rfU2, rfU3, rfU4, rfU5] = rfUnits;
  if (!rfU1 || !rfU2 || !rfU3 || !rfU4 || !rfU5) throw new Error("Reading foundations units missing");

  function moduleUnitSlug(unitId: string): string {
    const stem = unitId.split(".").pop() ?? unitId;
    return stem.replaceAll("_", "-");
  }

  const lookupPrereqRf = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const local = rfBundle.units?.find((row) => row.id === id);
    if (local) return { bundle: rfBundle, unit: local };
    return lookupPrereqW22(id);
  };

  const rfU1Exercises = exercisesForUnit(rfBundle, rfU1);
  const rfU2Exercises = exercisesForUnit(rfBundle, rfU2);
  const rfU3Exercises = exercisesForUnit(rfBundle, rfU3);
  const rfU4Exercises = exercisesForUnit(rfBundle, rfU4);
  const rfU5Exercises = exercisesForUnit(rfBundle, rfU5);

  assert(
    "M1 LEARN_WAVE_SLUGS still ends at wave-22",
    /WAVE22_SLUG\] as const/.test(resolveLearnSrcEarly) &&
      resolveLearnSrcEarly.includes('WAVE22_SLUG = "wave-22"') &&
      resolveLearnSrcEarly.includes("LEARN_MODULE_SLUGS") &&
      resolveLearnSrcEarly.includes('READING_FOUNDATIONS_SLUG = "reading-foundations"'),
  );
  const waveSlugLine = resolveLearnSrcEarly.match(/export const LEARN_WAVE_SLUGS = \[[^\]]+\] as const/)?.[0] ?? "";
  assert(
    "M1 module slugs are not appended to LEARN_WAVE_SLUGS",
    waveSlugLine.includes("WAVE22_SLUG") &&
      !waveSlugLine.includes("READING_FOUNDATIONS") &&
      !waveSlugLine.includes("reading-foundations"),
  );
  assert(
    "M1 wave-23 does not resolve",
    !resolveLearnSrcEarly.includes("WAVE23") &&
      !resolveLearnSrcEarly.includes("wave-23") &&
      !resolveLearnSrcEarly.includes("getWave23Bundle") &&
      !existsSync(join(root, "src/content/curriculum/data/production/literacy-path.wave-23.json")) &&
      !existsSync(join(root, "src/lib/curriculum/wave23Bundle.ts")) &&
      !waveRouteSrc.includes("reading-foundations") &&
      moduleRouteSrc.includes('createFileRoute("/learn/modules/$moduleId/$unitId")'),
  );
  assert("M1 declares exactly five units", rfUnits.length === 5 && rfPathRow.unitIds.join(",") === READING_FOUNDATIONS_UNIT_IDS.join(","));
  assert("M1 Unit 1 id/slug", rfU1.id === "unit.literacy.reading_foundations.madd_yaa" && moduleUnitSlug(rfU1.id) === "madd-yaa");
  assert("M1 Unit 2 id/slug", rfU2.id === "unit.literacy.reading_foundations.madd_waw" && moduleUnitSlug(rfU2.id) === "madd-waw");
  assert("M1 Unit 3 id/slug", rfU3.id === "unit.literacy.reading_foundations.madd_transfer" && moduleUnitSlug(rfU3.id) === "madd-transfer");
  assert("M1 Unit 4 id/slug", rfU4.id === "unit.literacy.reading_foundations.tanween_damm" && moduleUnitSlug(rfU4.id) === "tanween-damm");
  assert("M1 Unit 5 id/slug", rfU5.id === "unit.literacy.reading_foundations.sentence_transfer" && moduleUnitSlug(rfU5.id) === "sentence-transfer" && rfU5.id === READING_FOUNDATIONS_FINAL_UNIT_ID);
  assert("M1 Unit 1 prereq is Wave 22 handoff", rfU1.prereqUnitIds?.[0] === WAVE22_FINAL_UNIT_ID);
  assert("M1 Units 2–5 chain on the previous Module unit", rfU2.prereqUnitIds?.[0] === rfU1.id && rfU3.prereqUnitIds?.[0] === rfU2.id && rfU4.prereqUnitIds?.[0] === rfU3.id && rfU5.prereqUnitIds?.[0] === rfU4.id);

  assert(
    "M1 Unit 1 locked before Wave 22 mastery",
    !evaluateUnitUnlock(rfBundle, rfUnits, rfU1, throughWave21, lookupPrereqRf).unlocked,
  );
  const rfU1Unlock = evaluateUnitUnlock(rfBundle, rfUnits, rfU1, w22u1Mastered, lookupPrereqRf);
  assert("M1 Unit 1 opens after Wave 22", rfU1Unlock.unlocked, rfU1Unlock.blockers.join("; "));
  assert("M1 Unit 1 renderers ready", unitRenderersReady(rfU1Exercises));

  const rfU1Required = requiredRefsForUnit(rfBundle, rfU1, rfU1Exercises);
  assert(
    "M1 Unit 1 requires BOTH word:fi.decoding and word:fil.decoding",
    rfU1Required.length === 2 &&
      rfU1Required.some((ref) => ref.liveKey === "word:fi.decoding") &&
      rfU1Required.some((ref) => ref.liveKey === "word:fil.decoding"),
    rfU1Required.map((ref) => ref.liveKey).join(", "),
  );
  const rfHistoricalOnly = {
    ...w22u1Mastered,
    ...seenItems(rfU1Exercises.filter((row) => row.type === "presentation")),
    ...itemsFrom(historicalNoiseRefs, historicalNoiseRefs.map(() => [true, true, true])),
    ...itemsFrom(
      [
        { type: "letter", id: "ya.madd_alif", liveKey: "letter:ya.madd_alif", portableMasteryId: "x", skillId: "skill.long_vowel.madd" },
        { type: "letter", id: "ba.madd_alif", liveKey: "letter:ba.madd_alif", portableMasteryId: "x", skillId: "skill.long_vowel.madd" },
        { type: "word", id: "kitab.decoding", liveKey: "word:kitab.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
        { type: "word", id: "yalab.review.wave6", liveKey: "word:yalab.review.wave6", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
      ],
      [[true, true, true], [true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("M1 historical Wave evidence does not master Unit 1", !evaluateUnitMastery(rfBundle, rfU1, rfU1Exercises, rfHistoricalOnly).mastered);
  assert("M1 presentations do not master Unit 1", !evaluateUnitMastery(rfBundle, rfU1, rfU1Exercises, { ...w22u1Mastered, ...seenItems(rfU1Exercises.filter((row) => row.type === "presentation")) }).mastered);

  const rfFiOnly = masterRequired(rfBundle, { ...rfU1, mastery: { ...rfU1.mastery, requiredSkillIds: ["skill.long_vowel.madd_yaa"] } }, rfU1Exercises.filter((row) => row.id === "exercise.reading_foundations.audio_to_word.fi"), w22u1Mastered);
  const rfFilOnly = masterRequired(rfBundle, { ...rfU1, mastery: { ...rfU1.mastery, requiredSkillIds: ["skill.long_vowel.madd_yaa"] } }, rfU1Exercises.filter((row) => row.id === "exercise.reading_foundations.audio_to_word.fil"), w22u1Mastered);
  assert("M1 Unit 1 fails with only word:fi.decoding", !evaluateUnitMastery(rfBundle, rfU1, rfU1Exercises, rfFiOnly).mastered);
  assert("M1 Unit 1 fails with only word:fil.decoding", !evaluateUnitMastery(rfBundle, rfU1, rfU1Exercises, rfFilOnly).mastered);
  const rfU1Mastered = masterRequired(rfBundle, rfU1, rfU1Exercises, w22u1Mastered);
  assert("M1 Unit 1 masters with both madd-yaa word keys", evaluateUnitMastery(rfBundle, rfU1, rfU1Exercises, rfU1Mastered).mastered);
  assert(
    "M1 Unit 1 presentation attempts remain 0",
    rfU1Exercises.filter((row) => row.type === "presentation").every((row) => (rfU1Mastered[getPresentationLiveKey(row.id).liveKey]?.attempts ?? 0) === 0),
  );

  assert(
    "M1 Unit 2 locked before Unit 1",
    !evaluateUnitUnlock(rfBundle, rfUnits, rfU2, w22u1Mastered, lookupPrereqRf).unlocked,
  );
  const rfU2Unlock = evaluateUnitUnlock(rfBundle, rfUnits, rfU2, rfU1Mastered, lookupPrereqRf);
  assert("M1 Unit 2 opens after Unit 1", rfU2Unlock.unlocked, rfU2Unlock.blockers.join("; "));
  const rfU2Required = requiredRefsForUnit(rfBundle, rfU2, rfU2Exercises);
  assert(
    "M1 Unit 2 requires BOTH word:kub.decoding and word:yaqul.decoding",
    rfU2Required.length === 2 &&
      rfU2Required.some((ref) => ref.liveKey === "word:kub.decoding") &&
      rfU2Required.some((ref) => ref.liveKey === "word:yaqul.decoding"),
    rfU2Required.map((ref) => ref.liveKey).join(", "),
  );
  const rfU2Mastered = masterRequired(rfBundle, rfU2, rfU2Exercises, rfU1Mastered);
  assert("M1 Unit 2 masters with both madd-waw word keys", evaluateUnitMastery(rfBundle, rfU2, rfU2Exercises, rfU2Mastered).mastered);

  const rfU3Required = requiredRefsForUnit(rfBundle, rfU3, rfU3Exercises);
  assert("M1 Unit 3 requires word:kabir.decoding", rfU3Required.length === 1 && rfU3Required[0]?.liveKey === "word:kabir.decoding", rfU3Required.map((ref) => ref.liveKey).join(", "));
  assert("M1 Unit 3 locked before Unit 2", !evaluateUnitUnlock(rfBundle, rfUnits, rfU3, rfU1Mastered, lookupPrereqRf).unlocked);
  const rfU3Mastered = masterRequired(rfBundle, rfU3, rfU3Exercises, rfU2Mastered);
  assert("M1 Unit 3 masters with word:kabir.decoding", evaluateUnitMastery(rfBundle, rfU3, rfU3Exercises, rfU3Mastered).mastered);

  const rfU4Required = requiredRefsForUnit(rfBundle, rfU4, rfU4Exercises);
  assert(
    "M1 Unit 4 requires sentence:reading_foundations.kitabun.reading",
    rfU4Required.length === 1 && rfU4Required[0]?.liveKey === "sentence:reading_foundations.kitabun.reading",
    rfU4Required.map((ref) => ref.liveKey).join(", "),
  );
  const rfU4Score = rfU4Exercises.find((row) => row.type === "audio_to_sentence");
  const rfU4Resolved = rfU4Score ? resolveAudioToSentence(rfBundle, rfU4Score) : undefined;
  assert(
    "M1 Unit 4 scored surface is authored كِتَابٌ",
    rfU4Score?.type === "audio_to_sentence" &&
      rfU4Score.success.correctChoiceId === "sentence.reading_foundations.kitabun" &&
      rfU4Resolved?.target.displayText === "كِتَابٌ" &&
      rfU4Resolved.promptAssetId === "audio.sentence.reading_foundations.kitabun",
  );
  assert("M1 Unit 4 does not mutate word.kitab", (rfBundle.words ?? []).some((row) => row.id === "word.kitab" && row.teachingForm === "كِتَاب"));
  assert("M1 Unit 4 has no illegal الْكِتَابٌ", !JSON.stringify(rfRaw).includes("الْكِتَابٌ") && !JSON.stringify(rfRaw).includes("الْوَلَدٌ"));
  const rfU4Mastered = masterRequired(rfBundle, rfU4, rfU4Exercises, rfU3Mastered);
  assert("M1 Unit 4 masters with the kitabun sentence key", evaluateUnitMastery(rfBundle, rfU4, rfU4Exercises, rfU4Mastered).mastered);

  assert("M1 Unit 5 locked before Unit 4", !evaluateUnitUnlock(rfBundle, rfUnits, rfU5, rfU3Mastered, lookupPrereqRf).unlocked);
  const rfU5Unlock = evaluateUnitUnlock(rfBundle, rfUnits, rfU5, rfU4Mastered, lookupPrereqRf);
  assert("M1 Unit 5 opens after Unit 4", rfU5Unlock.unlocked, rfU5Unlock.blockers.join("; "));
  const rfU5Required = requiredRefsForUnit(rfBundle, rfU5, rfU5Exercises);
  assert(
    "M1 Unit 5 requires BOTH new sentence keys",
    rfU5Required.length === 2 &&
      rfU5Required.some((ref) => ref.liveKey === "sentence:reading_foundations.waladun_yalabu.reading") &&
      rfU5Required.some((ref) => ref.liveKey === "sentence:reading_foundations.alkitabu_kabirun.reading"),
    rfU5Required.map((ref) => ref.liveKey).join(", "),
  );
  const rfWave21SentenceOnly = {
    ...rfU4Mastered,
    ...itemsFrom(
      [{ type: "sentence", id: "wave21.alwaladu_yalabu.reading", liveKey: "sentence:wave21.alwaladu_yalabu.reading", portableMasteryId: "x", skillId: "skill.sentence_reading.two_word" }],
      [[true, true, true]],
    ),
  };
  assert("M1 Wave 21 sentence key does not master Unit 5", !evaluateUnitMastery(rfBundle, rfU5, rfU5Exercises, rfWave21SentenceOnly).mastered);
  assert("M1 presentations do not master Unit 5", !evaluateUnitMastery(rfBundle, rfU5, rfU5Exercises, { ...rfU4Mastered, ...seenItems(rfU5Exercises.filter((row) => row.type === "presentation")) }).mastered);
  const rfU5Mastered = masterRequired(rfBundle, rfU5, rfU5Exercises, rfU4Mastered);
  assert("M1 final Unit 5 mastery completes Module 1", evaluateUnitMastery(rfBundle, rfU5, rfU5Exercises, rfU5Mastered).mastered);
  assert("M1 mastered unit still shows أَتْقَنْتَ", unitPathStatus(true, evaluateUnitMastery(rfBundle, rfU5, rfU5Exercises, rfU5Mastered)) === "mastered" && unitPathCtaAr("mastered") === "أَتْقَنْتَ");

  const allRfRequired = [...rfU1Required, ...rfU2Required, ...rfU3Required, ...rfU4Required, ...rfU5Required].map((ref) => ref.liveKey).sort();
  assert(
    "M1 exact eight required live keys",
    allRfRequired.join(",") === [...READING_FOUNDATIONS_REQUIRED_LIVE_KEYS].slice().sort().join(","),
    allRfRequired.join(", "),
  );
  const rfBlob = JSON.stringify(rfRaw);
  assert(
    "M1 no module-complete key",
    !rfBlob.includes("module1.complete") &&
      !rfBlob.includes("module:reading_foundations.complete") &&
      !rfBlob.includes("waves.complete") &&
      !allRfRequired.some((key) => key.includes("complete")),
  );
  assert("M1 child-facing title is أُسُسُ الْقِرَاءَة", rfPathRow.titleAr === "أُسُسُ الْقِرَاءَة");
  assert(
    "M1 /learn modules handoff exists beside Waves",
    learnIndexSrc.includes("listLearnModules") &&
      learnIndexSrc.includes('to="/learn/modules/$moduleId/$unitId"') &&
      learnIndexSrc.includes("ModuleSection") &&
      learnIndexSrc.includes("أَتْقَنْتَ"),
  );
  assert("M1 LessonPlayer finish still returns /learn", lessonPlayerSrc.includes('to="/learn"') && !lessonPlayerSrc.includes("ModuleLessonPlayer"));
  assert("M1 no writing / tracing / dictation", !rfU1Exercises.concat(rfU2Exercises, rfU3Exercises, rfU4Exercises, rfU5Exercises).some((row) => row.type === "tracing" || row.type === "dictation"));
  assert("M1 madd-yaa is not madd_alif evidence", !rfU1Required.some((ref) => ref.liveKey.includes("madd_alif")) && !rfU2Required.some((ref) => ref.liveKey.includes("madd_alif")));

  const ofRaw = JSON.parse(readFileSync(orthographicFoundationsPath, "utf8"));
  const ofValidation = validateCurriculum(ofRaw);
  assert("Orthographic foundations production JSON validates", ofValidation.ok, ofValidation.issues.map((issue) => issue.message).join("; "));
  const ofBundle = asCurriculumBundle(ofRaw);
  const ofPathRow = ofBundle.paths?.find((row) => row.id === ORTHOGRAPHIC_FOUNDATIONS_PATH_ID);
  if (!ofPathRow) throw new Error("Orthographic foundations path missing");
  const ofById = new Map((ofBundle.units ?? []).map((unit) => [unit.id, unit]));
  const ofUnits = ofPathRow.unitIds.flatMap((id) => {
    const unit = ofById.get(id);
    return unit ? [unit] : [];
  });
  const [ofU1, ofU2, ofU3, ofU4, ofU5, ofU6, ofU7, ofU8, ofU9] = ofUnits;
  if (!ofU1 || !ofU2 || !ofU3 || !ofU4 || !ofU5 || !ofU6 || !ofU7 || !ofU8 || !ofU9) throw new Error("Orthographic foundations units missing");

  const lookupPrereqOf = (id: string): { bundle: ReturnType<typeof asCurriculumBundle>; unit: LearningUnitDefinition } | undefined => {
    const local = ofBundle.units?.find((row) => row.id === id);
    if (local) return { bundle: ofBundle, unit: local };
    return lookupPrereqRf(id);
  };

  const ofExercises = ofUnits.map((unit) => exercisesForUnit(ofBundle, unit));
  const [ofU1Ex, ofU2Ex, ofU3Ex, ofU4Ex, ofU5Ex, ofU6Ex, ofU7Ex, ofU8Ex, ofU9Ex] = ofExercises;
  if (!ofU1Ex || !ofU2Ex || !ofU3Ex || !ofU4Ex || !ofU5Ex || !ofU6Ex || !ofU7Ex || !ofU8Ex || !ofU9Ex) throw new Error("Orthographic foundations exercises missing");

  assert(
    "M2 LEARN_WAVE_SLUGS still ends at wave-22",
    /WAVE22_SLUG\] as const/.test(resolveLearnSrcEarly) &&
      resolveLearnSrcEarly.includes('ORTHOGRAPHIC_FOUNDATIONS_SLUG = "orthographic-foundations"') &&
      resolveLearnSrcEarly.includes("LEARN_MODULE_SLUGS"),
  );
  assert(
    "M2 is not appended to LEARN_WAVE_SLUGS",
    waveSlugLine.includes("WAVE22_SLUG") &&
      !waveSlugLine.includes("ORTHOGRAPHIC") &&
      !waveSlugLine.includes("orthographic-foundations"),
  );
  assert(
    "M2 no Wave 23 / no Module 3 slug",
    !resolveLearnSrcEarly.includes("WAVE23") &&
      !resolveLearnSrcEarly.includes("wave-23") &&
      !existsSync(join(root, "src/content/curriculum/data/production/literacy-path.wave-23.json")) &&
      !existsSync(join(root, "src/lib/curriculum/wave23Bundle.ts")) &&
      !resolveLearnSrcEarly.includes("functional-language") &&
      !ofPathRow.unitIds.some((id) => id.includes("functional")),
  );
  assert("M2 declares exactly nine units", ofUnits.length === 9 && ofPathRow.unitIds.join(",") === ORTHOGRAPHIC_FOUNDATIONS_UNIT_IDS.join(","));
  assert("M2 Unit 1 id/slug", ofU1.id === "unit.literacy.orthographic_foundations.haa" && moduleUnitSlug(ofU1.id) === "haa");
  assert("M2 Unit 2 id/slug", ofU2.id === "unit.literacy.orthographic_foundations.thal_zay" && moduleUnitSlug(ofU2.id) === "thal-zay");
  assert("M2 Unit 3 id/slug", ofU3.id === "unit.literacy.orthographic_foundations.kha_tha" && moduleUnitSlug(ofU3.id) === "kha-tha");
  assert("M2 Unit 4 id/slug", ofU4.id === "unit.literacy.orthographic_foundations.sad_dad" && moduleUnitSlug(ofU4.id) === "sad-dad");
  assert("M2 Unit 5 id/slug", ofU5.id === "unit.literacy.orthographic_foundations.ghain" && moduleUnitSlug(ofU5.id) === "ghain");
  assert("M2 Unit 6 id/slug", ofU6.id === "unit.literacy.orthographic_foundations.tah_zah" && moduleUnitSlug(ofU6.id) === "tah-zah");
  assert("M2 Unit 7 id/slug", ofU7.id === "unit.literacy.orthographic_foundations.shadda" && moduleUnitSlug(ofU7.id) === "shadda");
  assert("M2 Unit 8 id/slug", ofU8.id === "unit.literacy.orthographic_foundations.hamza" && moduleUnitSlug(ofU8.id) === "hamza");
  assert("M2 Unit 9 id/slug", ofU9.id === "unit.literacy.orthographic_foundations.taa_maqsura" && moduleUnitSlug(ofU9.id) === "taa-maqsura" && ofU9.id === ORTHOGRAPHIC_FOUNDATIONS_FINAL_UNIT_ID);
  assert("M2 Unit 1 prereq is Module 1 final", ofU1.prereqUnitIds?.[0] === READING_FOUNDATIONS_FINAL_UNIT_ID);
  assert(
    "M2 units 2–9 chain",
    ofU2.prereqUnitIds?.[0] === ofU1.id &&
      ofU3.prereqUnitIds?.[0] === ofU2.id &&
      ofU4.prereqUnitIds?.[0] === ofU3.id &&
      ofU5.prereqUnitIds?.[0] === ofU4.id &&
      ofU6.prereqUnitIds?.[0] === ofU5.id &&
      ofU7.prereqUnitIds?.[0] === ofU6.id &&
      ofU8.prereqUnitIds?.[0] === ofU7.id &&
      ofU9.prereqUnitIds?.[0] === ofU8.id,
  );
  assert("M2 child-facing title", ofPathRow.titleAr === "الْحُرُوفُ وَالْعَلَامَات");
  assert("M2 uses letter.thal not letter.dhal", (ofBundle.letters ?? []).some((row) => row.id === "letter.thal") && JSON.stringify(ofRaw).includes("letter.thal") && !JSON.stringify(ofRaw).includes("letter.dhal"));
  assert("M2 letter.haa is ه and letter.ha is ح", (ofBundle.letters ?? []).some((row) => row.id === "letter.haa" && row.char === "ه" && row.legacyId === "haa") && (ofBundle.letters ?? []).some((row) => row.id === "letter.ha" && row.char === "ح"));
  assert("M2 local words ثَلْج and ظَهْر exist", (ofBundle.words ?? []).some((row) => row.id === "word.thalj" && row.teachingForm === "ثَلْج") && (ofBundle.words ?? []).some((row) => row.id === "word.zahr" && row.teachingForm === "ظَهْر"));
  assert(
    "M2 locked before Module 1 final",
    !evaluateUnitUnlock(ofBundle, ofUnits, ofU1, w22u1Mastered, lookupPrereqOf).unlocked &&
      !evaluateUnitUnlock(ofBundle, ofUnits, ofU1, rfU4Mastered, lookupPrereqOf).unlocked,
  );
  const ofU1Unlock = evaluateUnitUnlock(ofBundle, ofUnits, ofU1, rfU5Mastered, lookupPrereqOf);
  assert("M2 Unit 1 opens after Module 1 final", ofU1Unlock.unlocked, ofU1Unlock.blockers.join("; "));
  assert("M2 Unit 1 renderers ready", unitRenderersReady(ofU1Ex));

  const ofU1Required = requiredRefsForUnit(ofBundle, ofU1, ofU1Ex);
  assert(
    "M2 Unit 1 requires letter:haa.sound and word:nahr.decoding",
    ofU1Required.length === 2 &&
      ofU1Required.some((ref) => ref.liveKey === "letter:haa.sound") &&
      ofU1Required.some((ref) => ref.liveKey === "word:nahr.decoding"),
    ofU1Required.map((ref) => ref.liveKey).join(", "),
  );
  const ofHaOnly = {
    ...rfU5Mastered,
    ...itemsFrom(
      [{ type: "letter", id: "ha.sound", liveKey: "letter:ha.sound", portableMasteryId: "x", skillId: "skill.letter_sounds.core" }],
      [[true, true, true]],
    ),
  };
  assert("M2 letter:ha.sound does not satisfy letter:haa.sound", !evaluateUnitMastery(ofBundle, ofU1, ofU1Ex, ofHaOnly).mastered);
  const ofM1KeysOnly = {
    ...rfU5Mastered,
    ...seenItems(ofU1Ex.filter((row) => row.type === "presentation")),
    ...itemsFrom(historicalNoiseRefs, historicalNoiseRefs.map(() => [true, true, true])),
  };
  assert("M2 Waves + Module 1 keys do not master Unit 1", !evaluateUnitMastery(ofBundle, ofU1, ofU1Ex, ofM1KeysOnly).mastered);
  const ofU1Mastered = masterRequired(ofBundle, ofU1, ofU1Ex, rfU5Mastered);
  assert("M2 Unit 1 masters with haa sound + نَهْر", evaluateUnitMastery(ofBundle, ofU1, ofU1Ex, ofU1Mastered).mastered);
  assert(
    "M2 Unit 1 presentation attempts remain 0",
    ofU1Ex.filter((row) => row.type === "presentation").every((row) => (ofU1Mastered[getPresentationLiveKey(row.id).liveKey]?.attempts ?? 0) === 0),
  );
  const ofU1Foil = ofU1Ex.find((row) => row.type === "sound_to_letter");
  assert("M2 Unit 1 sound foil includes ح", Boolean(ofU1Foil?.choices?.some((choice) => choice.id === "letter.ha")));

  assert("M2 Unit 2 locked before Unit 1", !evaluateUnitUnlock(ofBundle, ofUnits, ofU2, rfU5Mastered, lookupPrereqOf).unlocked);
  const ofU2Unlock = evaluateUnitUnlock(ofBundle, ofUnits, ofU2, ofU1Mastered, lookupPrereqOf);
  assert("M2 Unit 2 opens after Unit 1", ofU2Unlock.unlocked, ofU2Unlock.blockers.join("; "));
  const ofU2Required = requiredRefsForUnit(ofBundle, ofU2, ofU2Ex);
  assert(
    "M2 Unit 2 requires ذ/ز sound + لَذِيذ/مَوْز",
    ofU2Required.length === 4 &&
      ofU2Required.some((ref) => ref.liveKey === "letter:thal.sound") &&
      ofU2Required.some((ref) => ref.liveKey === "letter:zay.sound") &&
      ofU2Required.some((ref) => ref.liveKey === "word:ladhidh.decoding") &&
      ofU2Required.some((ref) => ref.liveKey === "word:mawz.decoding"),
    ofU2Required.map((ref) => ref.liveKey).join(", "),
  );
  const ofU2Mastered = masterRequired(ofBundle, ofU2, ofU2Ex, ofU1Mastered);
  assert("M2 Unit 2 masters", evaluateUnitMastery(ofBundle, ofU2, ofU2Ex, ofU2Mastered).mastered);

  const ofU3Required = requiredRefsForUnit(ofBundle, ofU3, ofU3Ex);
  assert(
    "M2 Unit 3 requires خ/ث sound + خُبْز/ثَلْج",
    ofU3Required.some((ref) => ref.liveKey === "letter:kha.sound") &&
      ofU3Required.some((ref) => ref.liveKey === "letter:tha.sound") &&
      ofU3Required.some((ref) => ref.liveKey === "word:khubz.decoding") &&
      ofU3Required.some((ref) => ref.liveKey === "word:thalj.decoding"),
    ofU3Required.map((ref) => ref.liveKey).join(", "),
  );
  const ofU3Mastered = masterRequired(ofBundle, ofU3, ofU3Ex, ofU2Mastered);
  assert("M2 Unit 3 masters", evaluateUnitMastery(ofBundle, ofU3, ofU3Ex, ofU3Mastered).mastered);

  const ofU4Required = requiredRefsForUnit(ofBundle, ofU4, ofU4Ex);
  assert(
    "M2 Unit 4 requires ص/ض sound + حِصَان/بَيْض",
    ofU4Required.some((ref) => ref.liveKey === "letter:sad.sound") &&
      ofU4Required.some((ref) => ref.liveKey === "letter:dad.sound") &&
      ofU4Required.some((ref) => ref.liveKey === "word:hisan.decoding") &&
      ofU4Required.some((ref) => ref.liveKey === "word:bayd.decoding"),
    ofU4Required.map((ref) => ref.liveKey).join(", "),
  );
  const ofU4Mastered = masterRequired(ofBundle, ofU4, ofU4Ex, ofU3Mastered);
  assert("M2 Unit 4 masters", evaluateUnitMastery(ofBundle, ofU4, ofU4Ex, ofU4Mastered).mastered);

  const ofU5Required = requiredRefsForUnit(ofBundle, ofU5, ofU5Ex);
  assert(
    "M2 Unit 5 requires غ sound + صَغِير",
    ofU5Required.length === 2 &&
      ofU5Required.some((ref) => ref.liveKey === "letter:ghain.sound") &&
      ofU5Required.some((ref) => ref.liveKey === "word:saghir.decoding"),
    ofU5Required.map((ref) => ref.liveKey).join(", "),
  );
  const ofU5Mastered = masterRequired(ofBundle, ofU5, ofU5Ex, ofU4Mastered);
  assert("M2 Unit 5 masters", evaluateUnitMastery(ofBundle, ofU5, ofU5Ex, ofU5Mastered).mastered);

  const ofU6Required = requiredRefsForUnit(ofBundle, ofU6, ofU6Ex);
  assert(
    "M2 Unit 6 requires ط/ظ sound + مَطَر/ظَهْر",
    ofU6Required.some((ref) => ref.liveKey === "letter:tah.sound") &&
      ofU6Required.some((ref) => ref.liveKey === "letter:zah.sound") &&
      ofU6Required.some((ref) => ref.liveKey === "word:matar.decoding") &&
      ofU6Required.some((ref) => ref.liveKey === "word:zahr.decoding"),
    ofU6Required.map((ref) => ref.liveKey).join(", "),
  );
  const ofU6Mastered = masterRequired(ofBundle, ofU6, ofU6Ex, ofU5Mastered);
  assert("M2 Unit 6 masters", evaluateUnitMastery(ofBundle, ofU6, ofU6Ex, ofU6Mastered).mastered);

  const ofU7Required = requiredRefsForUnit(ofBundle, ofU7, ofU7Ex);
  assert("M2 Unit 7 requires only word:sinn.decoding", ofU7Required.length === 1 && ofU7Required[0]?.liveKey === "word:sinn.decoding", ofU7Required.map((ref) => ref.liveKey).join(", "));
  const ofSinOnly = {
    ...ofU6Mastered,
    ...itemsFrom(
      [{ type: "letter", id: "sin.sound", liveKey: "letter:sin.sound", portableMasteryId: "x", skillId: "skill.letter_sounds.core" }],
      [[true, true, true]],
    ),
  };
  assert("M2 letter:sin.sound does not satisfy shadda", !evaluateUnitMastery(ofBundle, ofU7, ofU7Ex, ofSinOnly).mastered);
  assert("M2 Unit 7 has no sun-assimilation key", !ofU7Required.some((ref) => ref.liveKey.includes("sun") || ref.liveKey.includes("article")));
  assert("M2 Unit 7 does not require قِطّ", !ofU7Required.some((ref) => ref.liveKey === "word:qitt.decoding"));
  const ofU7Mastered = masterRequired(ofBundle, ofU7, ofU7Ex, ofU6Mastered);
  assert("M2 Unit 7 masters with سِنّ", evaluateUnitMastery(ofBundle, ofU7, ofU7Ex, ofU7Mastered).mastered);

  const ofU8Required = requiredRefsForUnit(ofBundle, ofU8, ofU8Ex);
  assert("M2 Unit 8 requires word:ab.decoding", ofU8Required.length === 1 && ofU8Required[0]?.liveKey === "word:ab.decoding", ofU8Required.map((ref) => ref.liveKey).join(", "));
  const ofAlifOnly = {
    ...ofU7Mastered,
    ...itemsFrom(
      [
        { type: "letter", id: "alif.sound", liveKey: "letter:alif.sound", portableMasteryId: "x", skillId: "skill.letter_sounds.core" },
        { type: "letter", id: "alif.madd_alif", liveKey: "letter:alif.madd_alif", portableMasteryId: "x", skillId: "skill.long_vowel.madd" },
      ],
      [[true, true, true], [true, true, true]],
    ),
  };
  assert("M2 old alif evidence does not satisfy hamza", !evaluateUnitMastery(ofBundle, ofU8, ofU8Ex, ofAlifOnly).mastered);
  const ofU8Mastered = masterRequired(ofBundle, ofU8, ofU8Ex, ofU7Mastered);
  assert("M2 Unit 8 masters with أَب", evaluateUnitMastery(ofBundle, ofU8, ofU8Ex, ofU8Mastered).mastered);

  const ofU9Required = requiredRefsForUnit(ofBundle, ofU9, ofU9Ex);
  assert(
    "M2 Unit 9 requires كُرَة / مَدْرَسَة / يَرَى",
    ofU9Required.length === 3 &&
      ofU9Required.some((ref) => ref.liveKey === "word:kura.decoding") &&
      ofU9Required.some((ref) => ref.liveKey === "word:madrasa.decoding") &&
      ofU9Required.some((ref) => ref.liveKey === "word:yara.decoding") &&
      !ofU9Required.some((ref) => ref.liveKey === "word:ala.decoding"),
    ofU9Required.map((ref) => ref.liveKey).join(", "),
  );
  const ofTaYaOnly = {
    ...ofU8Mastered,
    ...itemsFrom(
      [
        { type: "letter", id: "ta.form.final", liveKey: "letter:ta.form.final", portableMasteryId: "x", skillId: "skill.letter_forms.positional" },
        { type: "letter", id: "ya.sound", liveKey: "letter:ya.sound", portableMasteryId: "x", skillId: "skill.letter_sounds.core" },
        { type: "word", id: "fi.decoding", liveKey: "word:fi.decoding", portableMasteryId: "x", skillId: "skill.word_decoding.simple" },
      ],
      [[true, true, true], [true, true, true], [true, true, true]],
    ),
  };
  assert("M2 old ta/yaa evidence does not satisfy Unit 9", !evaluateUnitMastery(ofBundle, ofU9, ofU9Ex, ofTaYaOnly).mastered);
  assert("M2 Unit 8 does not unlock Unit 9 completion", !evaluateUnitMastery(ofBundle, ofU9, ofU9Ex, ofU8Mastered).mastered);
  const ofU9Mastered = masterRequired(ofBundle, ofU9, ofU9Ex, ofU8Mastered);
  assert("M2 final Unit 9 mastery is Module 2 handoff", evaluateUnitMastery(ofBundle, ofU9, ofU9Ex, ofU9Mastered).mastered);
  assert("M2 mastered unit still shows أَتْقَنْتَ", unitPathStatus(true, evaluateUnitMastery(ofBundle, ofU9, ofU9Ex, ofU9Mastered)) === "mastered" && unitPathCtaAr("mastered") === "أَتْقَنْتَ");

  const allOfRequired = ofUnits.flatMap((unit, i) => requiredRefsForUnit(ofBundle, unit, ofExercises[i]!).map((ref) => ref.liveKey)).sort();
  assert(
    "M2 exact 25 required live keys",
    allOfRequired.join(",") === [...ORTHOGRAPHIC_FOUNDATIONS_REQUIRED_LIVE_KEYS].slice().sort().join(","),
    allOfRequired.join(", "),
  );
  const ofBlob = JSON.stringify(ofRaw);
  assert(
    "M2 no module-complete / writing / Module 3 keys",
    !ofBlob.includes("module2.complete") &&
      !ofBlob.includes("orthography.complete") &&
      !ofBlob.includes("alphabet.complete") &&
      !allOfRequired.some((key) => key.includes("complete") || key.includes("tracing") || key.includes("sun_assimilation")) &&
      !ofU1Ex.concat(ofU2Ex, ofU3Ex, ofU4Ex, ofU5Ex, ofU6Ex, ofU7Ex, ofU8Ex, ofU9Ex).some((row) => row.type === "tracing" || row.type === "dictation"),
  );
  assert("M2 عَلَى is SHOW-only", ofU9Ex.some((row) => row.type === "presentation" && row.contentIds.includes("word.ala")) && !ofU9Required.some((ref) => ref.liveKey === "word:ala.decoding"));
  assert("M2 /learn lists modules beside Waves", learnIndexSrc.includes("listLearnModules") && learnIndexSrc.includes("أَتْقَنْتَ"));

  if (failed) {
    console.error(`\n${failed} unit-mastery check(s) failed.`);
    process.exit(1);
  }
  console.log("\nunit-mastery checks passed.");
}

main();
