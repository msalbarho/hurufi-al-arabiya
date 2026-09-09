/**
 * Deterministic Wave 2 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 2 production bundle.
 * Does not mutate Band A. word.jabal is a literacy-slice lemma with 720 legacyId nature-11.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";
import { WAVE1_FINAL_UNIT_ID, WAVE1_LETTER_IDS, WAVE1_WORD_IDS } from "./validateLiteracyWave1.ts";

export const LITERACY_WAVE2_META_ID = "hurufi.production.literacy.wave2";

export const WAVE2_LETTER_IDS = ["letter.ra", "letter.ba", "letter.fa"] as const;

export const WAVE2_WORD_IDS = ["word.qamar", "word.jabal", "word.fam"] as const;

export const WAVE2_BAND_A_WORD_IDS = ["word.qamar", "word.fam"] as const;

export const WAVE2_PATH_ID = "path.literacy.wave2";

export const WAVE2_UNIT_IDS = [
  "unit.literacy.wave2.ra_qamar",
  "unit.literacy.wave2.ba",
  "unit.literacy.wave2.jabal",
  "unit.literacy.wave2.fa_fam",
] as const;

export const WAVE2_FINAL_UNIT_ID = "unit.literacy.wave2.fa_fam";

export const WAVE2_EXTERNAL_PREREQ_UNIT_IDS = [WAVE1_FINAL_UNIT_ID] as const;

const DEFERRED_SKILL_PREFIXES = [
  "skill.sukun.",
  "skill.shadda.",
  "skill.tanween.",
  "skill.hamza.",
  "skill.long_vowel.",
  "skill.taa_marbuta.",
  "skill.alif_maqsura.",
] as const;

const FORBIDDEN_FOIL_LETTERS = ["letter.zay", "letter.ta", "letter.tha"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringSet(ids: readonly string[]): Set<string> {
  return new Set(ids);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

export function isLiteracyWave2Bundle(data: unknown): boolean {
  if (!isRecord(data) || !isRecord(data["meta"])) return false;
  return data["meta"]["id"] === LITERACY_WAVE2_META_ID;
}

export function validateLiteracyWave2Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  if (!isRecord(data)) return;
  const meta = data["meta"];
  if (isRecord(meta)) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE2_META",
        path: "meta.kind",
        message: "Literacy Wave 2 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE2_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 2 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const newLetters = stringSet(WAVE2_LETTER_IDS);
  const recycledLetters = stringSet(WAVE1_LETTER_IDS);
  const letters = Array.isArray(data["letters"]) ? data["letters"] : [];
  const foundNew = new Set<string>();
  letters.forEach((row, i) => {
    if (!isRecord(row) || typeof row["id"] !== "string") return;
    const id = row["id"];
    if (newLetters.has(id)) {
      foundNew.add(id);
      if (row["wave"] !== 2) {
        emit({
          code: "WAVE2_LETTER",
          path: `letters[${i}].wave`,
          message: `Wave 2 letter "${id}" must set wave: 2.`,
          severity: "error",
        });
      }
    } else if (recycledLetters.has(id)) {
      if (row["wave"] !== 1) {
        emit({
          code: "WAVE2_LETTER",
          path: `letters[${i}].wave`,
          message: `Recycled Wave 1 letter "${id}" must keep wave: 1.`,
          severity: "error",
        });
      }
    } else {
      emit({
        code: "WAVE2_LETTER",
        path: `letters[${i}].id`,
        message: `Unexpected letter "${id}" in Wave 2.`,
        severity: "error",
      });
    }
    if (typeof row["legacyId"] !== "string" || row["legacyId"].length === 0) {
      emit({
        code: "WAVE2_LETTER",
        path: `letters[${i}].legacyId`,
        message: `Wave 2 letter "${id}" must bridge to a prototype legacyId.`,
        severity: "error",
      });
    }
  });
  for (const id of WAVE2_LETTER_IDS) {
    if (!foundNew.has(id)) {
      emit({
        code: "WAVE2_LETTER",
        path: "letters",
        message: `Wave 2 is missing required new letter "${id}".`,
        severity: "error",
      });
    }
  }
  const teachOrder = WAVE2_LETTER_IDS.map((id) => {
    const row = letters.find((item) => isRecord(item) && item["id"] === id);
    return isRecord(row) ? row["teachOrder"] : undefined;
  });
  if (teachOrder[0] !== 1 || teachOrder[1] !== 2 || teachOrder[2] !== 3) {
    emit({
      code: "WAVE2_LETTER",
      path: "letters",
      message: "Wave 2 teachOrder must be ر → ب → ف (1, 2, 3).",
      severity: "error",
    });
  }

  const allowedWords = new Set<string>([...WAVE1_WORD_IDS, ...WAVE2_WORD_IDS]);
  const words = Array.isArray(data["words"]) ? data["words"] : [];
  const foundWords = new Set<string>();
  words.forEach((row, i) => {
    if (!isRecord(row) || typeof row["id"] !== "string") return;
    foundWords.add(row["id"]);
    if (!allowedWords.has(row["id"])) {
      emit({
        code: "WAVE2_WORD",
        path: `words[${i}].id`,
        message: `Unexpected word "${row["id"]}" in Wave 2.`,
        severity: "error",
      });
    }
    if (row["id"] === "word.jabal") {
      if (row["vocabBand"] === "A") {
        emit({
          code: "WAVE2_BAND_A",
          path: `words[${i}].vocabBand`,
          message: "word.jabal must not be marked Band A; Band A v1 stays closed.",
          severity: "error",
        });
      }
      if (row["legacyId"] !== "nature-11") {
        emit({
          code: "WAVE2_JABAL",
          path: `words[${i}].legacyId`,
          message: "word.jabal must map to 720 catalog id nature-11.",
          severity: "error",
        });
      }
    }
  });
  for (const id of WAVE2_WORD_IDS) {
    if (!foundWords.has(id)) {
      emit({
        code: "WAVE2_WORD",
        path: "words",
        message: `Wave 2 is missing required word "${id}".`,
        severity: "error",
      });
    }
  }

  const skills = Array.isArray(data["skills"]) ? data["skills"] : [];
  skills.forEach((row, i) => {
    if (!isRecord(row)) return;
    const skillId = row["id"];
    if (typeof skillId !== "string") return;
    if (DEFERRED_SKILL_PREFIXES.some((prefix) => skillId.startsWith(prefix))) {
      emit({
        code: "WAVE2_PHONICS",
        path: `skills[${i}].id`,
        message: `Wave 2 must not teach deferred phonics skill "${skillId}".`,
        severity: "error",
      });
    }
  });

  const syllables = Array.isArray(data["syllables"]) ? data["syllables"] : [];
  syllables.forEach((row, i) => {
    if (!isRecord(row)) return;
    if (row["pattern"] !== "CV") {
      emit({
        code: "WAVE2_SYLLABLE",
        path: `syllables[${i}].pattern`,
        message: "Wave 2 syllables must be CV (sukun / CVC is deferred).",
        severity: "error",
      });
    }
  });

  const units = Array.isArray(data["units"]) ? data["units"] : [];
  if (units.length !== 4) {
    emit({
      code: "WAVE2_UNIT",
      path: "units",
      message: `Wave 2 must declare exactly four units (found ${units.length}).`,
      severity: "error",
    });
  }

  const paths = Array.isArray(data["paths"]) ? data["paths"] : [];
  if (paths.length !== 1) {
    emit({
      code: "WAVE2_PATH",
      path: "paths",
      message: `Wave 2 must contain exactly one learning path (found ${paths.length}).`,
      severity: "error",
    });
  } else if (isRecord(paths[0])) {
    if (paths[0]["id"] !== WAVE2_PATH_ID) {
      emit({
        code: "WAVE2_PATH",
        path: "paths[0].id",
        message: `Wave 2 path id must be "${WAVE2_PATH_ID}".`,
        severity: "error",
      });
    }
    const unitIds = asStringArray(paths[0]["unitIds"]);
    if (unitIds.join(",") !== WAVE2_UNIT_IDS.join(",")) {
      emit({
        code: "WAVE2_PATH",
        path: "paths[0].unitIds",
        message: "Wave 2 path unit order must be ra_qamar → ba → jabal → fa_fam.",
        severity: "error",
      });
    }
  }

  const exercises = Array.isArray(data["exercises"]) ? data["exercises"] : [];
  exercises.forEach((row, i) => {
    if (!isRecord(row)) return;
    if (typeof row["learningObjectiveAr"] !== "string" || row["learningObjectiveAr"].length === 0) {
      emit({
        code: "WAVE2_OBJECTIVE",
        path: `exercises[${i}].learningObjectiveAr`,
        message: "Every Wave 2 exercise must declare a learning objective.",
        severity: "error",
      });
    }
  });

  validateWave2TeachingContract(data, emit);
}

function configString(row: Record<string, unknown>, key: string): string | undefined {
  if (!isRecord(row["config"])) return undefined;
  const value = row["config"][key];
  return typeof value === "string" ? value : undefined;
}

function isReinforcementRow(row: Record<string, unknown>): boolean {
  return asStringArray(row["tags"]).includes("reinforcement") || configString(row, "role") === "reinforcement";
}

function letterIdsMentioned(row: Record<string, unknown>): string[] {
  const ids = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === "string" && value.startsWith("letter.")) ids.add(value);
  };
  asStringArray(row["contentIds"]).forEach(add);
  if (isRecord(row["success"])) add(row["success"]["correctChoiceId"]);
  if (isRecord(row["config"])) add(row["config"]["letterId"]);
  if (Array.isArray(row["choices"])) {
    for (const choice of row["choices"]) {
      if (isRecord(choice)) add(choice["id"]);
    }
  }
  if (Array.isArray(row["masteryTargets"])) {
    for (const target of row["masteryTargets"]) {
      if (isRecord(target)) add(target["letterId"]);
    }
  }
  return [...ids];
}

function wordIdsMentioned(row: Record<string, unknown>): string[] {
  const ids = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === "string" && value.startsWith("word.")) ids.add(value);
  };
  asStringArray(row["contentIds"]).forEach(add);
  if (isRecord(row["success"])) add(row["success"]["correctChoiceId"]);
  if (isRecord(row["config"])) add(row["config"]["wordId"]);
  if (Array.isArray(row["choices"])) {
    for (const choice of row["choices"]) {
      if (isRecord(choice)) add(choice["id"]);
    }
  }
  if (Array.isArray(row["masteryTargets"])) {
    for (const target of row["masteryTargets"]) {
      if (isRecord(target)) add(target["wordId"]);
    }
  }
  return [...ids];
}

function teachingLetterIds(
  row: Record<string, unknown>,
  syllables: Map<string, Record<string, unknown>>,
): string[] {
  const type = row["type"];
  if (type === "presentation") {
    const show = configString(row, "show") ?? "letter";
    if (show === "word") return [];
    if (show === "cv") {
      const syllableId =
        configString(row, "syllableId") ?? asStringArray(row["contentIds"]).find((id) => id.startsWith("syllable."));
      const syllable = syllableId ? syllables.get(syllableId) : undefined;
      return typeof syllable?.["letterId"] === "string" ? [syllable["letterId"]] : [];
    }
    const letterId =
      configString(row, "letterId") ?? asStringArray(row["contentIds"]).find((id) => id.startsWith("letter."));
    return letterId ? [letterId] : [];
  }
  if (type === "sound_to_letter") {
    const id = isRecord(row["success"]) ? row["success"]["correctChoiceId"] : undefined;
    return typeof id === "string" && id.startsWith("letter.") ? [id] : [];
  }
  if (type === "letter_recognition") {
    const form = configString(row, "targetForm") ?? "isolated";
    if (form !== "isolated") return [];
    const id =
      configString(row, "letterId") ??
      (isRecord(row["success"]) && typeof row["success"]["correctChoiceId"] === "string"
        ? row["success"]["correctChoiceId"]
        : undefined);
    return typeof id === "string" && id.startsWith("letter.") ? [id] : [];
  }
  return [];
}

function scoredSoundLetter(row: Record<string, unknown>): string | undefined {
  if (row["type"] !== "sound_to_letter" || isReinforcementRow(row)) return undefined;
  const id = isRecord(row["success"]) ? row["success"]["correctChoiceId"] : undefined;
  return typeof id === "string" && id.startsWith("letter.") ? id : undefined;
}

function scoredDecodingWord(row: Record<string, unknown>): string | undefined {
  if (row["type"] !== "audio_to_word" || isReinforcementRow(row)) return undefined;
  const hasDecoding = Array.isArray(row["masteryTargets"])
    ? row["masteryTargets"].some(
        (target) => isRecord(target) && target["skillId"] === "skill.word_decoding.simple",
      )
    : false;
  if (!hasDecoding) return undefined;
  const id = isRecord(row["success"]) ? row["success"]["correctChoiceId"] : undefined;
  return typeof id === "string" && id.startsWith("word.") ? id : undefined;
}

function scoredCvLetter(
  row: Record<string, unknown>,
  syllables: Map<string, Record<string, unknown>>,
): string | undefined {
  if (row["type"] !== "syllable_blending" || isReinforcementRow(row)) return undefined;
  const id = isRecord(row["success"]) ? row["success"]["correctChoiceId"] : undefined;
  if (typeof id !== "string") return undefined;
  const syllable = syllables.get(id);
  return typeof syllable?.["letterId"] === "string" ? syllable["letterId"] : undefined;
}

function scoredForm(row: Record<string, unknown>): { letterId: string; form: string } | undefined {
  if (row["type"] !== "letter_recognition" || isReinforcementRow(row)) return undefined;
  const letterId = configString(row, "letterId");
  const form = configString(row, "targetForm");
  if (!letterId || !form) return undefined;
  return { letterId, form };
}

function validateWave2TeachingContract(
  data: Record<string, unknown>,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const exercises = recordById(Array.isArray(data["exercises"]) ? data["exercises"] : []);
  const units = recordById(Array.isArray(data["units"]) ? data["units"] : []);
  const words = recordById(Array.isArray(data["words"]) ? data["words"] : []);
  const syllables = recordById(Array.isArray(data["syllables"]) ? data["syllables"] : []);
  const paths = Array.isArray(data["paths"]) ? data["paths"] : [];
  const path = paths.find((row) => isRecord(row) && row["id"] === WAVE2_PATH_ID);
  if (!isRecord(path)) return;

  const introduced = new Set<string>(WAVE1_LETTER_IDS);
  const scoredSound = new Set<string>();
  const audioDecoded = new Set<string>();
  const presented = new Set<string>();
  const blended = new Set<string>();
  const forms = new Set<string>();
  const presentationLiveKeys = new Set<string>();

  const unit1 = units.get("unit.literacy.wave2.ra_qamar");
  if (unit1) {
    const prereqs = asStringArray(unit1["prereqUnitIds"]);
    if (!prereqs.includes(WAVE1_FINAL_UNIT_ID)) {
      emit({
        code: "WAVE2_PREREQ",
        path: "units[id=unit.literacy.wave2.ra_qamar].prereqUnitIds",
        message: `Wave 2 Unit 1 must require "${WAVE1_FINAL_UNIT_ID}".`,
        severity: "error",
      });
    }
    const titleAr = typeof unit1["titleAr"] === "string" ? unit1["titleAr"] : "";
    if (titleAr.includes("قَمَر")) {
      emit({
        code: "WAVE2_CHILD_LANGUAGE",
        path: "units[id=unit.literacy.wave2.ra_qamar].titleAr",
        message: "Unit 1 title must not reveal the scored word.",
        severity: "error",
      });
    }
  }

  const unit2 = units.get("unit.literacy.wave2.ba");
  if (unit2) {
    const required = asStringArray(isRecord(unit2["mastery"]) ? unit2["mastery"]["requiredSkillIds"] : []);
    if (required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE2_UNIT2",
        path: "units[id=unit.literacy.wave2.ba].mastery.requiredSkillIds",
        message: "Unit 2 must teach ب without requiring جَبَل decoding.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit2["exerciseIds"]);
    if (ids.some((id) => scoredDecodingWord(exercises.get(id) ?? {}) === "word.jabal")) {
      emit({
        code: "WAVE2_UNIT2",
        path: "units[id=unit.literacy.wave2.ba].exerciseIds",
        message: "Unit 2 must not score جَبَل decoding.",
        severity: "error",
      });
    }
    if (ids.includes("exercise.wave2.presentation.jabal") || asStringArray(unit2["wordIds"]).includes("word.jabal")) {
      emit({
        code: "WAVE2_UNIT2",
        path: "units[id=unit.literacy.wave2.ba].exerciseIds",
        message: "Unit 2 must not show جَبَل. Teach/practice ب fully first; the word belongs in Unit 3.",
        severity: "error",
      });
    }
    for (const [exerciseIndex, exerciseId] of ids.entries()) {
      const exercise = exercises.get(exerciseId);
      if (!exercise) continue;
      if (wordIdsMentioned(exercise).includes("word.jabal") || exerciseId.includes("jabal")) {
        emit({
          code: "WAVE2_UNIT2",
          path: `units[id=unit.literacy.wave2.ba].exerciseIds[${exerciseIndex}]`,
          message: `Unit 2 must not include جَبَل content ("${exerciseId}").`,
          severity: "error",
        });
      }
    }
  }

  const unit3 = units.get("unit.literacy.wave2.jabal");
  if (unit3) {
    const titleAr = typeof unit3["titleAr"] === "string" ? unit3["titleAr"] : "";
    if (titleAr.includes("جَبَل")) {
      emit({
        code: "WAVE2_CHILD_LANGUAGE",
        path: "units[id=unit.literacy.wave2.jabal].titleAr",
        message: "Unit 3 title must not reveal the scored word.",
        severity: "error",
      });
    }
    const required = asStringArray(isRecord(unit3["mastery"]) ? unit3["mastery"]["requiredSkillIds"] : []);
    if (!required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE2_UNIT3",
        path: "units[id=unit.literacy.wave2.jabal].mastery.requiredSkillIds",
        message: "Unit 3 must require simple word decoding for جَبَل.",
        severity: "error",
      });
    }
    const unit3Ids = asStringArray(unit3["exerciseIds"]);
    const jabalDemoId = "exercise.wave2.presentation.jabal";
    const jabalAudioId = "exercise.wave2.audio_to_word.jabal";
    const demoIdx = unit3Ids.indexOf(jabalDemoId);
    const audioIdx = unit3Ids.indexOf(jabalAudioId);
    if (demoIdx !== 0) {
      emit({
        code: "WAVE2_UNIT3",
        path: "units[id=unit.literacy.wave2.jabal].exerciseIds",
        message: "Unit 3 must begin with an unscored جَبَل presentation before scored decoding.",
        severity: "error",
      });
    }
    const jabalDemo = exercises.get(jabalDemoId);
    if (jabalDemo) {
      if (jabalDemo["type"] !== "presentation") {
        emit({
          code: "WAVE2_UNIT3",
          path: `exercises[id=${jabalDemoId}].type`,
          message: "جَبَل SHOW must be a presentation exercise.",
          severity: "error",
        });
      }
      if (Array.isArray(jabalDemo["masteryTargets"]) && jabalDemo["masteryTargets"].length > 0) {
        emit({
          code: "WAVE2_UNIT3",
          path: `exercises[id=${jabalDemoId}].masteryTargets`,
          message: "جَبَل SHOW must have no mastery target.",
          severity: "error",
        });
      }
      const successType = isRecord(jabalDemo["success"]) ? jabalDemo["success"]["type"] : undefined;
      if (successType !== "continue") {
        emit({
          code: "WAVE2_UNIT3",
          path: `exercises[id=${jabalDemoId}].success.type`,
          message: "جَبَل SHOW must use success type \"continue\".",
          severity: "error",
        });
      }
      if (isReinforcementRow(jabalDemo)) {
        emit({
          code: "WAVE2_UNIT3",
          path: `exercises[id=${jabalDemoId}].tags`,
          message: "جَبَل SHOW must be a required presentation, not skipped picture-style reinforcement.",
          severity: "error",
        });
      }
    }
    if (!(audioIdx > demoIdx && demoIdx >= 0)) {
      emit({
        code: "WAVE2_UNIT3",
        path: "units[id=unit.literacy.wave2.jabal].exerciseIds",
        message: "Scored جَبَل decoding must come after the unscored جَبَل presentation.",
        severity: "error",
      });
    }
  }

  const unit4 = units.get("unit.literacy.wave2.fa_fam");
  if (unit4) {
    const titleAr = typeof unit4["titleAr"] === "string" ? unit4["titleAr"] : "";
    const childGoalAr = typeof unit4["childGoalAr"] === "string" ? unit4["childGoalAr"] : "";
    if (titleAr.includes("فَم") || titleAr.includes("الْحَرَكَات")) {
      emit({
        code: "WAVE2_CHILD_LANGUAGE",
        path: "units[id=unit.literacy.wave2.fa_fam].titleAr",
        message: "Unit 4 title must not leak فَم or claim الحركات.",
        severity: "error",
      });
    }
    if (childGoalAr.includes("فَم")) {
      emit({
        code: "WAVE2_CHILD_LANGUAGE",
        path: "units[id=unit.literacy.wave2.fa_fam].childGoalAr",
        message: "Unit 4 child goal must not leak فَم.",
        severity: "error",
      });
    }
    const required = asStringArray(isRecord(unit4["mastery"]) ? unit4["mastery"]["requiredSkillIds"] : []);
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE2_HARAKA_SCOPE",
        path: "units[id=unit.literacy.wave2.fa_fam].mastery.requiredSkillIds",
        message: "Wave 2 must not require kasra/damma mastery.",
        severity: "error",
      });
    }
    if (typeof unit4["mastery"] === "object" && unit4["mastery"] && (unit4["mastery"] as Record<string, unknown>)["minSessions"] === 2) {
      emit({
        code: "WAVE2_MASTERY",
        path: "units[id=unit.literacy.wave2.fa_fam].mastery.minSessions",
        message: "Wave 2 must remain completable the same day (no two-session gate).",
        severity: "error",
      });
    }
    const unit4Ids = asStringArray(unit4["exerciseIds"]);
    const famIdx = unit4Ids.indexOf("exercise.wave2.audio_to_word.fam");
    const qamarReviewIdx = unit4Ids.indexOf("exercise.wave2.audio_to_word.qamar_review");
    const jabalReviewIdx = unit4Ids.indexOf("exercise.wave2.audio_to_word.jabal_review");
    const waladReviewIdx = unit4Ids.indexOf("exercise.wave2.audio_to_word.walad_review");
    if (!(famIdx >= 0 && qamarReviewIdx > famIdx && jabalReviewIdx > qamarReviewIdx && waladReviewIdx > jabalReviewIdx)) {
      emit({
        code: "WAVE2_UNIT4",
        path: "units[id=unit.literacy.wave2.fa_fam].exerciseIds",
        message: "Unit 4 must review قَمَر then جَبَل then وَلَد after scored فَم decoding.",
        severity: "error",
      });
    }
    for (const reviewId of [
      "exercise.wave2.audio_to_word.qamar_review",
      "exercise.wave2.audio_to_word.jabal_review",
      "exercise.wave2.audio_to_word.walad_review",
    ]) {
      const review = exercises.get(reviewId);
      if (review && isReinforcementRow(review)) {
        emit({
          code: "WAVE2_UNIT4",
          path: `exercises[id=${reviewId}].tags`,
          message: `Mixed review "${reviewId}" must be scored practice, not picture-style reinforcement.`,
          severity: "error",
        });
      }
    }
  }

  for (const unitId of asStringArray(path["unitIds"])) {
    const unit = units.get(unitId);
    if (!unit) continue;
    if (isRecord(unit["mastery"]) && unit["mastery"]["minSessions"] === 2) {
      emit({
        code: "WAVE2_MASTERY",
        path: `units[id=${unitId}].mastery.minSessions`,
        message: "Wave 2 units must not require a second calendar day.",
        severity: "error",
      });
    }

    for (const [exerciseIndex, exerciseId] of asStringArray(unit["exerciseIds"]).entries()) {
      const exercise = exercises.get(exerciseId);
      if (!exercise) continue;
      const pathRef = `units[id=${unitId}].exerciseIds[${exerciseIndex}]`;

      if (exercise["type"] === "presentation") {
        if (Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
          emit({
            code: "WAVE2_DEMO",
            path: pathRef,
            message: `Presentation "${exerciseId}" must not declare mastery targets.`,
            severity: "error",
          });
        }
        const successType = isRecord(exercise["success"]) ? exercise["success"]["type"] : undefined;
        if (successType !== "continue") {
          emit({
            code: "WAVE2_DEMO",
            path: pathRef,
            message: `Presentation "${exerciseId}" must use success type "continue".`,
            severity: "error",
          });
        }
        const slug = exerciseId.replace(/^exercise\./, "").replace(/\./g, "_");
        const liveKey = `letter:intro.${slug}`;
        if (presentationLiveKeys.has(liveKey)) {
          emit({
            code: "WAVE2_LIVE_KEY",
            path: pathRef,
            message: `Presentation live key "${liveKey}" collides with another demo.`,
            severity: "error",
          });
        }
        presentationLiveKeys.add(liveKey);
      }

      for (const letterId of letterIdsMentioned(exercise)) {
        if ((FORBIDDEN_FOIL_LETTERS as readonly string[]).includes(letterId)) {
          emit({
            code: "WAVE2_FOIL",
            path: pathRef,
            message: `Exercise "${exerciseId}" must not use premature foil "${letterId}".`,
            severity: "error",
          });
        }
      }

      const teaching = teachingLetterIds(exercise, syllables);
      for (const letterId of letterIdsMentioned(exercise)) {
        if (teaching.includes(letterId)) continue;
        if (!introduced.has(letterId)) {
          emit({
            code: "WAVE2_TEACH_ORDER",
            path: pathRef,
            message: `Exercise "${exerciseId}" uses letter "${letterId}" before it is taught as a target.`,
            severity: "error",
          });
        }
      }

      for (const wordId of wordIdsMentioned(exercise)) {
        const word = words.get(wordId);
        const needed = asStringArray(word?.["letterIds"]);
        for (const letterId of needed) {
          if (!introduced.has(letterId) && !teaching.includes(letterId)) {
            emit({
              code: "WAVE2_TEACH_ORDER",
              path: pathRef,
              message: `Word "${wordId}" in "${exerciseId}" needs letter "${letterId}" before that letter is taught.`,
              severity: "error",
            });
          }
        }
      }

      const pictureType = exercise["type"] === "picture_to_word" || exercise["type"] === "word_to_picture";
      const decodingWord =
        scoredDecodingWord(exercise) ??
        (pictureType && isRecord(exercise["success"]) && typeof exercise["success"]["correctChoiceId"] === "string"
          ? String(exercise["success"]["correctChoiceId"])
          : undefined);
      if (pictureType && decodingWord?.startsWith("word.") && !audioDecoded.has(decodingWord)) {
        emit({
          code: "WAVE2_DECODING_EVIDENCE",
          path: pathRef,
          message: `Picture exercise "${exerciseId}" cannot be the first decoding evidence for "${decodingWord}".`,
          severity: "error",
        });
      }

      const decoded = scoredDecodingWord(exercise);
      if (decoded === "word.qamar" && !forms.has("letter.ra:final")) {
        emit({
          code: "WAVE2_FORM",
          path: pathRef,
          message: "Final ـر must be practiced before scored قَمَر decoding.",
          severity: "error",
        });
      }
      if (decoded === "word.jabal" && !forms.has("letter.ba:medial")) {
        emit({
          code: "WAVE2_FORM",
          path: pathRef,
          message: "Medial ـبـ must be practiced before scored جَبَل decoding.",
          severity: "error",
        });
      }
      if (decoded === "word.fam" && !forms.has("letter.fa:initial")) {
        emit({
          code: "WAVE2_FORM",
          path: pathRef,
          message: "Initial فـ must be practiced before scored فَم decoding.",
          severity: "error",
        });
      }
      if (decoded === "word.fam" && !presented.has("letter.fa")) {
        emit({
          code: "WAVE2_TEACH_ORDER",
          path: pathRef,
          message: "ف must be presented before scored فَم decoding.",
          severity: "error",
        });
      }
      if (decoded === "word.qamar" && !blended.has("letter.ra")) {
        emit({
          code: "WAVE2_TEACH_ORDER",
          path: pathRef,
          message: "رَ must be practiced before scored قَمَر decoding.",
          severity: "error",
        });
      }
      if (decoded === "word.jabal" && !blended.has("letter.ba")) {
        emit({
          code: "WAVE2_TEACH_ORDER",
          path: pathRef,
          message: "بَ must be practiced before scored جَبَل decoding.",
          severity: "error",
        });
      }
      if (decoded === "word.fam" && !blended.has("letter.fa")) {
        emit({
          code: "WAVE2_TEACH_ORDER",
          path: pathRef,
          message: "فَ must be practiced before scored فَم decoding.",
          severity: "error",
        });
      }

      for (const letterId of teaching) {
        introduced.add(letterId);
        if (exercise["type"] === "presentation") presented.add(letterId);
      }
      const soundLetter = scoredSoundLetter(exercise);
      if (soundLetter) scoredSound.add(soundLetter);
      const cvLetter = scoredCvLetter(exercise, syllables);
      if (cvLetter) blended.add(cvLetter);
      const form = scoredForm(exercise);
      if (form) forms.add(`${form.letterId}:${form.form}`);
      if (decoded) audioDecoded.add(decoded);
    }
  }

  for (const letterId of WAVE2_LETTER_IDS) {
    if (!scoredSound.has(letterId)) {
      emit({
        code: "WAVE2_LETTER_TARGET",
        path: "exercises",
        message: `Wave 2 letter "${letterId}" has no scored hear/identify exercise.`,
        severity: "error",
      });
    }
    if (!presented.has(letterId)) {
      emit({
        code: "WAVE2_LETTER_TARGET",
        path: "exercises",
        message: `Wave 2 letter "${letterId}" has no presentation.`,
        severity: "error",
      });
    }
  }

  for (const wordId of WAVE2_WORD_IDS) {
    if (!audioDecoded.has(wordId)) {
      emit({
        code: "WAVE2_WORD_TARGET",
        path: "exercises",
        message: `Wave 2 word "${wordId}" has no scored audio_to_word decoding evidence.`,
        severity: "error",
      });
    }
  }
}

function recordById(rows: unknown[]): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    if (isRecord(row) && typeof row["id"] === "string") map.set(row["id"], row);
  }
  return map;
}

function sorted(ids: string[]): string[] {
  return [...ids].sort();
}

/** Band A identity for qamar/fam only. jabal must stay out of Band A. */
export function validateWave2WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  if (!isRecord(literacy) || !isRecord(bandA)) return;
  const literacyWords = recordById(Array.isArray(literacy["words"]) ? literacy["words"] : []);
  const bandAWords = recordById(Array.isArray(bandA["words"]) ? bandA["words"] : []);

  if (bandAWords.has("word.jabal")) {
    emit({
      code: "WAVE2_BAND_A",
      path: "band-a.json",
      message: "Band A v1 must not gain word.jabal.",
      severity: "error",
    });
  }

  const jabal = literacyWords.get("word.jabal");
  if (jabal && bandAWords.has("word.jabal")) {
    emit({
      code: "WAVE2_JABAL",
      path: "words[id=word.jabal]",
      message: "word.jabal must not duplicate a Band A lemma.",
      severity: "error",
    });
  }

  for (const id of WAVE2_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE2_BAND_A_REF",
        path: "words",
        message: `Wave 2 word "${id}" is not in production Band A.`,
        severity: "error",
      });
      continue;
    }
    if (!slice) continue;
    const fields: Array<[string, unknown, unknown]> = [
      ["lemma", slice["lemma"], source["lemma"]],
      ["diacritized", slice["diacritized"], source["diacritized"]],
      ["teachingForm", slice["teachingForm"], source["teachingForm"]],
      ["vocabBand", slice["vocabBand"], source["vocabBand"]],
      ["subBand", slice["subBand"], source["subBand"]],
    ];
    for (const [field, left, right] of fields) {
      if (left !== right) {
        emit({
          code: "WAVE2_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 2 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE2_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 2 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
  }
}
