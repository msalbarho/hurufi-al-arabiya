/**
 * Deterministic Wave 3 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 3 production bundle.
 * Does not mutate Band A. word.hamal is a literacy-slice lemma with 720 legacyId animals-49.
 * Wave 3 teaches ح only. Sukun, خ, and ن are deferred.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";
import { WAVE1_LETTER_IDS, WAVE1_WORD_IDS } from "./validateLiteracyWave1.ts";
import {
  WAVE2_FINAL_UNIT_ID,
  WAVE2_LETTER_IDS,
  WAVE2_WORD_IDS,
} from "./validateLiteracyWave2.ts";

export const LITERACY_WAVE3_META_ID = "hurufi.production.literacy.wave3";

export const WAVE3_LETTER_IDS = ["letter.ha"] as const;

export const WAVE3_WORD_IDS = ["word.hajar", "word.hamal"] as const;

export const WAVE3_BAND_A_WORD_IDS = ["word.hajar"] as const;

export const WAVE3_PATH_ID = "path.literacy.wave3";

export const WAVE3_UNIT_IDS = [
  "unit.literacy.wave3.ha",
  "unit.literacy.wave3.hajar",
  "unit.literacy.wave3.hamal",
] as const;

export const WAVE3_FINAL_UNIT_ID = "unit.literacy.wave3.hamal";

export const WAVE3_EXTERNAL_PREREQ_UNIT_IDS = [WAVE2_FINAL_UNIT_ID] as const;

const DEFERRED_SKILL_PREFIXES = [
  "skill.sukun.",
  "skill.shadda.",
  "skill.tanween.",
  "skill.hamza.",
  "skill.long_vowel.",
  "skill.taa_marbuta.",
  "skill.alif_maqsura.",
] as const;

const FORBIDDEN_LETTERS = ["letter.kha", "letter.nun"] as const;

const PRIOR_LETTER_IDS = [...WAVE1_LETTER_IDS, ...WAVE2_LETTER_IDS] as const;

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

function jsonText(value: unknown): string {
  return JSON.stringify(value);
}

export function isLiteracyWave3Bundle(data: unknown): boolean {
  if (!isRecord(data) || !isRecord(data["meta"])) return false;
  return data["meta"]["id"] === LITERACY_WAVE3_META_ID;
}

export function validateLiteracyWave3Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  if (!isRecord(data)) return;
  const meta = data["meta"];
  if (isRecord(meta)) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE3_META",
        path: "meta.kind",
        message: "Literacy Wave 3 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE3_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 3 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-4") || blob.includes("wave4") || blob.includes("path.literacy.wave4")) {
    emit({
      code: "WAVE3_SCOPE",
      path: "$",
      message: "Wave 3 must not declare a Wave 4 path, route, or CTA.",
      severity: "error",
    });
  }

  const newLetters = stringSet(WAVE3_LETTER_IDS);
  const recycledLetters = stringSet(PRIOR_LETTER_IDS);
  const letters = Array.isArray(data["letters"]) ? data["letters"] : [];
  const foundNew = new Set<string>();
  letters.forEach((row, i) => {
    if (!isRecord(row) || typeof row["id"] !== "string") return;
    const id = row["id"];
    if ((FORBIDDEN_LETTERS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE3_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 3 must not teach "${id}".`,
        severity: "error",
      });
    }
    if (newLetters.has(id)) {
      foundNew.add(id);
      if (row["wave"] !== 3) {
        emit({
          code: "WAVE3_LETTER",
          path: `letters[${i}].wave`,
          message: `Wave 3 letter "${id}" must set wave: 3.`,
          severity: "error",
        });
      }
    } else if (recycledLetters.has(id)) {
      const expectedWave = (WAVE1_LETTER_IDS as readonly string[]).includes(id) ? 1 : 2;
      if (row["wave"] !== expectedWave) {
        emit({
          code: "WAVE3_LETTER",
          path: `letters[${i}].wave`,
          message: `Recycled letter "${id}" must keep wave: ${expectedWave}.`,
          severity: "error",
        });
      }
    } else {
      emit({
        code: "WAVE3_LETTER",
        path: `letters[${i}].id`,
        message: `Unexpected letter "${id}" in Wave 3.`,
        severity: "error",
      });
    }
    if (typeof row["legacyId"] !== "string" || row["legacyId"].length === 0) {
      emit({
        code: "WAVE3_LETTER",
        path: `letters[${i}].legacyId`,
        message: `Wave 3 letter "${id}" must bridge to a prototype legacyId.`,
        severity: "error",
      });
    }
  });
  for (const id of WAVE3_LETTER_IDS) {
    if (!foundNew.has(id)) {
      emit({
        code: "WAVE3_LETTER",
        path: "letters",
        message: `Wave 3 is missing required new letter "${id}".`,
        severity: "error",
      });
    }
  }
  const ha = letters.find((item) => isRecord(item) && item["id"] === "letter.ha");
  if (isRecord(ha) && ha["teachOrder"] !== 1) {
    emit({
      code: "WAVE3_LETTER",
      path: "letters",
      message: "Wave 3 teachOrder for ح must be 1.",
      severity: "error",
    });
  }

  const allowedWords = new Set<string>([...WAVE1_WORD_IDS, ...WAVE2_WORD_IDS, ...WAVE3_WORD_IDS]);
  const words = Array.isArray(data["words"]) ? data["words"] : [];
  const foundWords = new Set<string>();
  words.forEach((row, i) => {
    if (!isRecord(row) || typeof row["id"] !== "string") return;
    foundWords.add(row["id"]);
    if (!allowedWords.has(row["id"])) {
      emit({
        code: "WAVE3_WORD",
        path: `words[${i}].id`,
        message: `Unexpected word "${row["id"]}" in Wave 3.`,
        severity: "error",
      });
    }
    if (row["id"] === "word.hamal") {
      if (row["vocabBand"] === "A") {
        emit({
          code: "WAVE3_BAND_A",
          path: `words[${i}].vocabBand`,
          message: "word.hamal must not be marked Band A; Band A v1 stays closed.",
          severity: "error",
        });
      }
      if (row["legacyId"] !== "animals-49") {
        emit({
          code: "WAVE3_HAMAL",
          path: `words[${i}].legacyId`,
          message: "word.hamal must map to 720 catalog id animals-49.",
          severity: "error",
        });
      }
    }
  });
  for (const id of WAVE3_WORD_IDS) {
    if (!foundWords.has(id)) {
      emit({
        code: "WAVE3_WORD",
        path: "words",
        message: `Wave 3 is missing required word "${id}".`,
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
        code: "WAVE3_PHONICS",
        path: `skills[${i}].id`,
        message: `Wave 3 must not teach deferred phonics skill "${skillId}".`,
        severity: "error",
      });
    }
  });

  const syllables = Array.isArray(data["syllables"]) ? data["syllables"] : [];
  syllables.forEach((row, i) => {
    if (!isRecord(row)) return;
    if (row["pattern"] !== "CV") {
      emit({
        code: "WAVE3_SYLLABLE",
        path: `syllables[${i}].pattern`,
        message: "Wave 3 syllables must be CV (sukun / CVC is deferred).",
        severity: "error",
      });
    }
  });

  const units = Array.isArray(data["units"]) ? data["units"] : [];
  if (units.length !== 3) {
    emit({
      code: "WAVE3_UNIT",
      path: "units",
      message: `Wave 3 must declare exactly three units (found ${units.length}).`,
      severity: "error",
    });
  }

  const paths = Array.isArray(data["paths"]) ? data["paths"] : [];
  if (paths.length !== 1) {
    emit({
      code: "WAVE3_PATH",
      path: "paths",
      message: `Wave 3 must contain exactly one learning path (found ${paths.length}).`,
      severity: "error",
    });
  } else if (isRecord(paths[0])) {
    if (paths[0]["id"] !== WAVE3_PATH_ID) {
      emit({
        code: "WAVE3_PATH",
        path: "paths[0].id",
        message: `Wave 3 path id must be "${WAVE3_PATH_ID}".`,
        severity: "error",
      });
    }
    const unitIds = asStringArray(paths[0]["unitIds"]);
    if (unitIds.join(",") !== WAVE3_UNIT_IDS.join(",")) {
      emit({
        code: "WAVE3_PATH",
        path: "paths[0].unitIds",
        message: "Wave 3 path unit order must be ha → hajar → hamal.",
        severity: "error",
      });
    }
  }

  const exercises = Array.isArray(data["exercises"]) ? data["exercises"] : [];
  exercises.forEach((row, i) => {
    if (!isRecord(row)) return;
    if (typeof row["learningObjectiveAr"] !== "string" || row["learningObjectiveAr"].length === 0) {
      emit({
        code: "WAVE3_OBJECTIVE",
        path: `exercises[${i}].learningObjectiveAr`,
        message: "Every Wave 3 exercise must declare a learning objective.",
        severity: "error",
      });
    }
    if (row["type"] === "similar_letter_discrimination") {
      emit({
        code: "WAVE3_EXERCISE",
        path: `exercises[${i}].type`,
        message: "Wave 3 must not use similar_letter_discrimination (not READY).",
        severity: "error",
      });
    }
  });

  validateWave3TeachingContract(data, emit);
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

function validateWave3TeachingContract(
  data: Record<string, unknown>,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const exercises = recordById(Array.isArray(data["exercises"]) ? data["exercises"] : []);
  const units = recordById(Array.isArray(data["units"]) ? data["units"] : []);
  const words = recordById(Array.isArray(data["words"]) ? data["words"] : []);
  const syllables = recordById(Array.isArray(data["syllables"]) ? data["syllables"] : []);
  const paths = Array.isArray(data["paths"]) ? data["paths"] : [];
  const path = paths.find((row) => isRecord(row) && row["id"] === WAVE3_PATH_ID);
  if (!isRecord(path)) return;

  const introduced = new Set<string>(PRIOR_LETTER_IDS);
  const scoredSound = new Set<string>();
  const audioDecoded = new Set<string>();
  const presented = new Set<string>();
  const blended = new Set<string>();
  const forms = new Set<string>();
  const presentationLiveKeys = new Set<string>();

  const unit1 = units.get("unit.literacy.wave3.ha");
  if (unit1) {
    const prereqs = asStringArray(unit1["prereqUnitIds"]);
    if (!prereqs.includes(WAVE2_FINAL_UNIT_ID)) {
      emit({
        code: "WAVE3_PREREQ",
        path: "units[id=unit.literacy.wave3.ha].prereqUnitIds",
        message: `Wave 3 Unit 1 must require "${WAVE2_FINAL_UNIT_ID}".`,
        severity: "error",
      });
    }
    const titleAr = typeof unit1["titleAr"] === "string" ? unit1["titleAr"] : "";
    if (titleAr !== "تَعَلَّمْ حَرْفَ ح") {
      emit({
        code: "WAVE3_CHILD_LANGUAGE",
        path: "units[id=unit.literacy.wave3.ha].titleAr",
        message: "Unit 1 title must be تَعَلَّمْ حَرْفَ ح.",
        severity: "error",
      });
    }
    const required = asStringArray(isRecord(unit1["mastery"]) ? unit1["mastery"]["requiredSkillIds"] : []);
    if (required.includes("skill.word_decoding.simple") || required.includes("skill.handwriting.isolated")) {
      emit({
        code: "WAVE3_UNIT1",
        path: "units[id=unit.literacy.wave3.ha].mastery.requiredSkillIds",
        message: "Unit 1 must not require word decoding or tracing mastery.",
        severity: "error",
      });
    }
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE3_HARAKA_SCOPE",
        path: "units[id=unit.literacy.wave3.ha].mastery.requiredSkillIds",
        message: "Wave 3 must not require kasra/damma mastery.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit1["exerciseIds"]);
    const haDemoIdx = ids.indexOf("exercise.wave3.presentation.ha");
    const haFathaDemoIdx = ids.indexOf("exercise.wave3.presentation.ha_fatha");
    const soundIdx = ids.indexOf("exercise.wave3.sound_to_letter.ha");
    const blendIdx = ids.indexOf("exercise.wave3.syllable_blending.ha_fatha");
    if (!(haDemoIdx === 0 && haFathaDemoIdx === 1 && soundIdx > haFathaDemoIdx && blendIdx > soundIdx)) {
      emit({
        code: "WAVE3_UNIT1",
        path: "units[id=unit.literacy.wave3.ha].exerciseIds",
        message: "Unit 1 order must be ح presentation → حَ presentation → scored ح → scored حَ.",
        severity: "error",
      });
    }
    if (asStringArray(unit1["wordIds"]).length > 0) {
      emit({
        code: "WAVE3_UNIT1",
        path: "units[id=unit.literacy.wave3.ha].wordIds",
        message: "Unit 1 must not introduce a word target.",
        severity: "error",
      });
    }
    for (const [exerciseIndex, exerciseId] of ids.entries()) {
      const exercise = exercises.get(exerciseId);
      if (!exercise) continue;
      if (wordIdsMentioned(exercise).length > 0) {
        emit({
          code: "WAVE3_UNIT1",
          path: `units[id=unit.literacy.wave3.ha].exerciseIds[${exerciseIndex}]`,
          message: `Unit 1 must not include a word ("${exerciseId}").`,
          severity: "error",
        });
      }
    }
  }

  const unit2 = units.get("unit.literacy.wave3.hajar");
  if (unit2) {
    const titleAr = typeof unit2["titleAr"] === "string" ? unit2["titleAr"] : "";
    if (titleAr !== "نَقْرَأُ مَعًا" || titleAr.includes("حَجَر")) {
      emit({
        code: "WAVE3_CHILD_LANGUAGE",
        path: "units[id=unit.literacy.wave3.hajar].titleAr",
        message: "Unit 2 title must be نَقْرَأُ مَعًا and must not reveal حَجَر.",
        severity: "error",
      });
    }
    const required = asStringArray(isRecord(unit2["mastery"]) ? unit2["mastery"]["requiredSkillIds"] : []);
    if (!required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE3_UNIT2",
        path: "units[id=unit.literacy.wave3.hajar].mastery.requiredSkillIds",
        message: "Unit 2 must require simple word decoding for حَجَر.",
        severity: "error",
      });
    }
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE3_HARAKA_SCOPE",
        path: "units[id=unit.literacy.wave3.hajar].mastery.requiredSkillIds",
        message: "Wave 3 must not require kasra/damma mastery.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit2["exerciseIds"]);
    const haFormIdx = ids.indexOf("exercise.wave3.letter_forms.ha_initial");
    const jimFormIdx = ids.indexOf("exercise.wave3.letter_forms.jim_medial");
    const hajarAudioIdx = ids.indexOf("exercise.wave3.audio_to_word.hajar");
    const hajarPictureIdx = ids.findIndex((id) => {
      const row = exercises.get(id);
      return Boolean(row && (row["type"] === "picture_to_word" || row["type"] === "word_to_picture"));
    });
    if (!(haFormIdx >= 0 && jimFormIdx > haFormIdx && hajarAudioIdx > jimFormIdx)) {
      emit({
        code: "WAVE3_UNIT2",
        path: "units[id=unit.literacy.wave3.hajar].exerciseIds",
        message: "Unit 2 must practice initial حـ and medial ـجـ before scored حَجَر decoding.",
        severity: "error",
      });
    }
    if (hajarPictureIdx >= 0 && !(hajarPictureIdx > hajarAudioIdx && hajarAudioIdx >= 0)) {
      emit({
        code: "WAVE3_DECODING_EVIDENCE",
        path: "units[id=unit.literacy.wave3.hajar].exerciseIds",
        message: "حَجَر picture reinforcement must come after scored audio decoding.",
        severity: "error",
      });
    }
  }

  const unit3 = units.get("unit.literacy.wave3.hamal");
  if (unit3) {
    const titleAr = typeof unit3["titleAr"] === "string" ? unit3["titleAr"] : "";
    if (titleAr !== "اِقْرَأْ كَلِمَاتِي") {
      emit({
        code: "WAVE3_CHILD_LANGUAGE",
        path: "units[id=unit.literacy.wave3.hamal].titleAr",
        message: "Unit 3 title must be اِقْرَأْ كَلِمَاتِي.",
        severity: "error",
      });
    }
    const required = asStringArray(isRecord(unit3["mastery"]) ? unit3["mastery"]["requiredSkillIds"] : []);
    if (!required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE3_UNIT3",
        path: "units[id=unit.literacy.wave3.hamal].mastery.requiredSkillIds",
        message: "Unit 3 must require simple word decoding for حَمَل.",
        severity: "error",
      });
    }
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE3_HARAKA_SCOPE",
        path: "units[id=unit.literacy.wave3.hamal].mastery.requiredSkillIds",
        message: "Wave 3 must not require kasra/damma mastery.",
        severity: "error",
      });
    }
    const hamalAudio = exercises.get("exercise.wave3.audio_to_word.hamal");
    if (hamalAudio) {
      const choiceIds = Array.isArray(hamalAudio["choices"])
        ? hamalAudio["choices"].flatMap((choice) =>
            isRecord(choice) && typeof choice["id"] === "string" ? [choice["id"]] : [],
          )
        : [];
      if (!choiceIds.includes("word.jamal")) {
        emit({
          code: "WAVE3_UNIT3",
          path: "exercises[id=exercise.wave3.audio_to_word.hamal].choices",
          message: "حَمَل scored decoding must contrast with readable جَمَل.",
          severity: "error",
        });
      }
    }
    const unit3Ids = asStringArray(unit3["exerciseIds"]);
    const demoIdx = unit3Ids.indexOf("exercise.wave3.presentation.hamal");
    const audioIdx = unit3Ids.indexOf("exercise.wave3.audio_to_word.hamal");
    if (!(demoIdx === 0 && audioIdx > demoIdx)) {
      emit({
        code: "WAVE3_UNIT3",
        path: "units[id=unit.literacy.wave3.hamal].exerciseIds",
        message: "Unit 3 must SHOW حَمَل before scored decoding.",
        severity: "error",
      });
    }
  }

  for (const unitId of asStringArray(path["unitIds"])) {
    const unit = units.get(unitId);
    if (!unit) continue;
    if (isRecord(unit["mastery"]) && unit["mastery"]["minSessions"] === 2) {
      emit({
        code: "WAVE3_MASTERY",
        path: `units[id=${unitId}].mastery.minSessions`,
        message: "Wave 3 units must not require a second calendar day.",
        severity: "error",
      });
    }
    const required = asStringArray(isRecord(unit["mastery"]) ? unit["mastery"]["requiredSkillIds"] : []);
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE3_HARAKA_SCOPE",
        path: `units[id=${unitId}].mastery.requiredSkillIds`,
        message: "Wave 3 must not require kasra/damma mastery.",
        severity: "error",
      });
    }
    if (required.some((id) => id.startsWith("skill.sukun."))) {
      emit({
        code: "WAVE3_SUKUN",
        path: `units[id=${unitId}].mastery.requiredSkillIds`,
        message: "Wave 3 must not require sukun mastery.",
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
            code: "WAVE3_DEMO",
            path: pathRef,
            message: `Presentation "${exerciseId}" must not declare mastery targets.`,
            severity: "error",
          });
        }
        const successType = isRecord(exercise["success"]) ? exercise["success"]["type"] : undefined;
        if (successType !== "continue") {
          emit({
            code: "WAVE3_DEMO",
            path: pathRef,
            message: `Presentation "${exerciseId}" must use success type "continue".`,
            severity: "error",
          });
        }
        const slug = exerciseId.replace(/^exercise\./, "").replace(/\./g, "_");
        const liveKey = `letter:intro.${slug}`;
        if (presentationLiveKeys.has(liveKey)) {
          emit({
            code: "WAVE3_LIVE_KEY",
            path: pathRef,
            message: `Presentation live key "${liveKey}" collides with another demo.`,
            severity: "error",
          });
        }
        presentationLiveKeys.add(liveKey);
      }

      for (const letterId of letterIdsMentioned(exercise)) {
        if ((FORBIDDEN_LETTERS as readonly string[]).includes(letterId)) {
          emit({
            code: "WAVE3_FOIL",
            path: pathRef,
            message: `Exercise "${exerciseId}" must not use forbidden letter "${letterId}".`,
            severity: "error",
          });
        }
      }

      const teaching = teachingLetterIds(exercise, syllables);
      for (const letterId of letterIdsMentioned(exercise)) {
        if (teaching.includes(letterId)) continue;
        if (!introduced.has(letterId)) {
          emit({
            code: "WAVE3_TEACH_ORDER",
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
              code: "WAVE3_TEACH_ORDER",
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
          code: "WAVE3_DECODING_EVIDENCE",
          path: pathRef,
          message: `Picture exercise "${exerciseId}" cannot be the first decoding evidence for "${decodingWord}".`,
          severity: "error",
        });
      }

      const decoded = scoredDecodingWord(exercise);
      if (decoded === "word.hajar" && !forms.has("letter.ha:initial")) {
        emit({
          code: "WAVE3_FORM",
          path: pathRef,
          message: "Initial حـ must be practiced before scored حَجَر decoding.",
          severity: "error",
        });
      }
      if (decoded === "word.hajar" && !forms.has("letter.jim:medial")) {
        emit({
          code: "WAVE3_FORM",
          path: pathRef,
          message: "Medial ـجـ must be practiced before scored حَجَر decoding.",
          severity: "error",
        });
      }
      if (decoded === "word.hajar" && !blended.has("letter.ha")) {
        emit({
          code: "WAVE3_TEACH_ORDER",
          path: pathRef,
          message: "حَ must be practiced before scored حَجَر decoding.",
          severity: "error",
        });
      }
      if (decoded === "word.hamal" && !scoredSound.has("letter.ha")) {
        emit({
          code: "WAVE3_TEACH_ORDER",
          path: pathRef,
          message: "ح must be identified before scored حَمَل decoding.",
          severity: "error",
        });
      }
      if (decoded === "word.hamal" && !blended.has("letter.ha")) {
        emit({
          code: "WAVE3_TEACH_ORDER",
          path: pathRef,
          message: "حَ must be practiced before scored حَمَل decoding.",
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

  for (const letterId of WAVE3_LETTER_IDS) {
    if (!scoredSound.has(letterId)) {
      emit({
        code: "WAVE3_LETTER_TARGET",
        path: "exercises",
        message: `Wave 3 letter "${letterId}" has no scored hear/identify exercise.`,
        severity: "error",
      });
    }
    if (!presented.has(letterId)) {
      emit({
        code: "WAVE3_LETTER_TARGET",
        path: "exercises",
        message: `Wave 3 letter "${letterId}" has no presentation.`,
        severity: "error",
      });
    }
  }

  for (const wordId of WAVE3_WORD_IDS) {
    if (!audioDecoded.has(wordId)) {
      emit({
        code: "WAVE3_WORD_TARGET",
        path: "exercises",
        message: `Wave 3 word "${wordId}" has no scored audio_to_word decoding evidence.`,
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

/** Band A identity for hajar only. hamal must stay out of Band A. */
export function validateWave3WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  if (!isRecord(literacy) || !isRecord(bandA)) return;
  const literacyWords = recordById(Array.isArray(literacy["words"]) ? literacy["words"] : []);
  const bandAWords = recordById(Array.isArray(bandA["words"]) ? bandA["words"] : []);

  if (bandAWords.has("word.hamal")) {
    emit({
      code: "WAVE3_BAND_A",
      path: "band-a.json",
      message: "Band A v1 must not gain word.hamal.",
      severity: "error",
    });
  }

  const hamal = literacyWords.get("word.hamal");
  if (hamal && bandAWords.has("word.hamal")) {
    emit({
      code: "WAVE3_HAMAL",
      path: "words[id=word.hamal]",
      message: "word.hamal must not duplicate a Band A lemma.",
      severity: "error",
    });
  }

  for (const id of WAVE3_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE3_BAND_A_REF",
        path: "words",
        message: `Wave 3 word "${id}" is not in production Band A.`,
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
          code: "WAVE3_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 3 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE3_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 3 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== source["legacyId"]) {
      emit({
        code: "WAVE3_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `Wave 3 "${id}" legacyId must match Band A.`,
        severity: "error",
      });
    }
  }
}
