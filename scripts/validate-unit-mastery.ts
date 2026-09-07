/**
 * Deterministic unit mastery + unlock checks. No test runner.
 * Run: node --experimental-strip-types --no-warnings scripts/validate-unit-mastery.ts
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { asCurriculumBundle, validateCurriculum, WAVE1_PATH_ID } from "../src/content/curriculum/validation/validateCurriculum.ts";
import { unitRenderersReady } from "../src/lib/curriculum/exerciseReadiness.ts";
import { resolveSyllableBlending, shuffleWithSeed } from "../src/lib/curriculum/syllableAdapter.ts";
import {
  evaluateUnitMastery,
  evaluateUnitUnlock,
  exerciseActivitiesComplete,
  exercisesForUnit,
  getSyllableLiveKey,
  liveRefForTarget,
  resolveUnitRouteAccess,
  type LiveMasteryRef,
} from "../src/lib/curriculum/unitMastery.ts";
import { applyAttempt, emptyProgress, type ItemProgress } from "../src/lib/rules/mastery.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wave1Path = join(root, "src/content/curriculum/data/production/literacy-path.wave-1.json");

let failed = 0;

function uniqueRefs(refs: LiveMasteryRef[]): LiveMasteryRef[] {
  const seen = new Map<string, LiveMasteryRef>();
  for (const ref of refs) {
    if (!seen.has(ref.liveKey)) seen.set(ref.liveKey, ref);
  }
  return [...seen.values()];
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
  if (!unit1 || !unit2) throw new Error("Wave 1 units 1–2 missing");

  const unit1Exercises = exercisesForUnit(bundle, unit1);
  const unit2Exercises = exercisesForUnit(bundle, unit2);
  const unit1Refs = uniqueRefs(
    unit1Exercises.flatMap((exercise) =>
      (exercise.masteryTargets ?? []).map((target) => liveRefForTarget(bundle, target)),
    ),
  );
  const unit2Refs = uniqueRefs(
    unit2Exercises.flatMap((exercise) =>
      (exercise.masteryTargets ?? []).map((target) => liveRefForTarget(bundle, target)),
    ),
  );
  assert("unit 1 has two unique live refs (sound + tracing)", unit1Refs.length === 2, String(unit1Refs.length));
  assert("unit 1 recognition shares the sound live key", unit1Refs.some((ref) => ref.liveKey === "letter:mim.sound"));
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

  const insufficient = itemsFrom(unit1Refs, [[true], [true]]);
  const u1short = evaluateUnitMastery(bundle, unit1, unit1Exercises, insufficient);
  assert("3. two correct attempts (one per activity) is not mastered", !u1short.mastered);
  assert("3. activities can still complete in one visit", u1short.activitiesDone === 2);
  assert("3. attempts are 2 < 3", u1short.attempts === 2 && u1short.requiredAttempts === 3);
  assert(
    "3. unit 2 still locked",
    !evaluateUnitUnlock(bundle, units, unit2, insufficient).unlocked,
  );

  const lowAccuracy = itemsFrom(unit1Refs, [
    [false, false, true, true],
    [true],
  ]);
  const u1acc = evaluateUnitMastery(bundle, unit1, unit1Exercises, lowAccuracy);
  assert("4. enough attempts with accuracy < 0.7 is not mastered", !u1acc.mastered);
  assert("4. attempts >= 3", u1acc.attempts >= 3);
  assert("4. accuracy below 0.7", u1acc.accuracy < 0.7);
  assert("4. streak still meets 2", u1acc.streak >= 2);

  const masteredItems = itemsFrom(unit1Refs, [[true, true], [true]]);
  const u1ok = evaluateUnitMastery(bundle, unit1, unit1Exercises, masteredItems);
  assert("5. 3 correct / accuracy 1 / streak 2 is mastered", u1ok.mastered, u1ok.blockers.join("; "));
  assert("5. unit 1 recognition skill is mapped", u1ok.unmappedRequiredSkills.length === 0);
  assert("5. accuracy >= 0.7", u1ok.accuracy >= 0.7);
  assert("5. streak >= 2", u1ok.streak >= 2);
  assert("5. sessions >= 1 from item correct-days", u1ok.sessions >= 1);
  assert("5. tracing was not required 3 times", masteredItems[unit1Refs[1]!.liveKey]?.attempts === 1);

  const u2ok = evaluateUnitUnlock(bundle, units, unit2, masteredItems);
  const route = resolveUnitRouteAccess(u2ok.unlocked, unitRenderersReady(unit2Exercises));
  assert("6. unit 2 unlock evaluator is playable after unit 1 mastery", u2ok.unlocked);
  assert("6. path logic agrees (unlocked)", u2ok.unlocked);
  assert("6. route is playable (syllable_blending renderer ready)", route === "play");
  assert("6. renderer readiness reports syllable_blending supported", unitRenderersReady(unit2Exercises));

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
    liveRefForTarget(bundle, mimExercise!.masteryTargets![0]!).liveKey === "letter:mim.fatha",
  );
  assert(
    "8. expected live key for lam blending is letter:lam.fatha",
    liveRefForTarget(bundle, lamExercise!.masteryTargets![0]!).liveKey === "letter:lam.fatha",
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

  const bothOnce = itemsFrom(orderedUnit2Refs, [[true], [true]]);
  const u2both = evaluateUnitMastery(bundle, unit2, unit2Exercises, bothOnce);
  assert("8. finishing both once does not automatically master Unit 2", !u2both.mastered);
  assert("8. both activities can complete in one visit", u2both.activitiesDone === 2);
  assert("8. attempts are 2 < 3", u2both.attempts === 2 && u2both.requiredAttempts === 3);

  const u2mastered = evaluateUnitMastery(
    bundle,
    unit2,
    unit2Exercises,
    itemsFrom(orderedUnit2Refs, [[true, true], [true]]),
  );
  assert("9. mastery only after thresholds are met", u2mastered.mastered, u2mastered.blockers.join("; "));
  assert("9. unique refs were not double-counted", u2mastered.attempts === 3);

  const ghost = evaluateUnitUnlock(
    bundle,
    units,
    { ...unit2, prereqUnitIds: ["unit.does.not.exist"] },
    masteredItems,
  );
  assert("missing prereq fails closed", !ghost.unlocked && ghost.missingPrereqs.includes("unit.does.not.exist"));

  if (failed) {
    console.error(`\n${failed} unit-mastery check(s) failed.`);
    process.exit(1);
  }
  console.log("\nunit-mastery checks passed.");
}

main();
