/**
 * Deterministic Wave 8 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 8 production bundle.
 * Waves 1–7 stay frozen. ش is the only new letter. No new phonics rule.
 * شَمْس is the single Band A target. Compact two-unit wave. No required review key.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";
import { WAVE1_LETTER_IDS, WAVE1_WORD_IDS } from "./validateLiteracyWave1.ts";
import { WAVE2_LETTER_IDS, WAVE2_WORD_IDS } from "./validateLiteracyWave2.ts";
import { WAVE3_LETTER_IDS, WAVE3_WORD_IDS } from "./validateLiteracyWave3.ts";
import { WAVE4_LETTER_IDS, WAVE4_WORD_IDS } from "./validateLiteracyWave4.ts";
import { WAVE5_LETTER_IDS, WAVE5_WORD_IDS } from "./validateLiteracyWave5.ts";
import { WAVE6_LETTER_IDS, WAVE6_WORD_IDS } from "./validateLiteracyWave6.ts";
import {
  WAVE7_FINAL_UNIT_ID,
  WAVE7_LETTER_IDS,
  WAVE7_WORD_IDS,
} from "./validateLiteracyWave7.ts";

export const LITERACY_WAVE8_META_ID = "hurufi.production.literacy.wave8";

export const WAVE8_LETTER_IDS = ["letter.shin"] as const;

export const WAVE8_WORD_IDS = ["word.shams"] as const;

export const WAVE8_BAND_A_WORD_IDS = ["word.shams"] as const;

export const WAVE8_PATH_ID = "path.literacy.wave8";

export const WAVE8_UNIT_IDS = [
  "unit.literacy.wave8.shin",
  "unit.literacy.wave8.shams",
] as const;

export const WAVE8_FIRST_UNIT_ID = "unit.literacy.wave8.shin";
export const WAVE8_FINAL_UNIT_ID = "unit.literacy.wave8.shams";

export const WAVE8_EXTERNAL_PREREQ_UNIT_IDS = [WAVE7_FINAL_UNIT_ID] as const;

const FORBIDDEN_LETTERS = [
  "letter.ain",
  "letter.nun",
  "letter.haa",
  "letter.kha",
  "letter.tah",
] as const;

const FORBIDDEN_SKILL_PREFIXES = [
  "skill.shadda.",
  "skill.tanween.",
  "skill.hamza.",
  "skill.long_vowel.",
  "skill.taa_marbuta.",
  "skill.alif_maqsura.",
] as const;

const PRIOR_LETTER_IDS = [
  ...WAVE1_LETTER_IDS,
  ...WAVE2_LETTER_IDS,
  ...WAVE3_LETTER_IDS,
  ...WAVE4_LETTER_IDS,
  ...WAVE5_LETTER_IDS,
  ...WAVE6_LETTER_IDS,
  ...WAVE7_LETTER_IDS,
] as const;
const PRIOR_WORD_IDS = [
  ...WAVE1_WORD_IDS,
  ...WAVE2_WORD_IDS,
  ...WAVE3_WORD_IDS,
  ...WAVE4_WORD_IDS,
  ...WAVE5_WORD_IDS,
  ...WAVE6_WORD_IDS,
  ...WAVE7_WORD_IDS,
] as const;

function isRecord(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? (value as Record<string, unknown>) : undefined;
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

function recordById(rows: unknown[]): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    const rec = asRecord(row);
    if (rec && typeof rec["id"] === "string") map.set(rec["id"], rec);
  }
  return map;
}

function sorted(ids: string[]): string[] {
  return [...ids].sort();
}

function expectedPriorWave(id: string): number | undefined {
  if ((WAVE1_LETTER_IDS as readonly string[]).includes(id)) return 1;
  if ((WAVE2_LETTER_IDS as readonly string[]).includes(id)) return 2;
  if ((WAVE3_LETTER_IDS as readonly string[]).includes(id)) return 3;
  if ((WAVE4_LETTER_IDS as readonly string[]).includes(id)) return 4;
  if ((WAVE5_LETTER_IDS as readonly string[]).includes(id)) return 5;
  if ((WAVE6_LETTER_IDS as readonly string[]).includes(id)) return 6;
  if ((WAVE7_LETTER_IDS as readonly string[]).includes(id)) return 7;
  return undefined;
}

function choiceIdsOf(exercise: Record<string, unknown>): string[] {
  return (Array.isArray(exercise["choices"]) ? exercise["choices"] : []).flatMap((choice) => {
    const row = asRecord(choice);
    return row && typeof row["id"] === "string" ? [row["id"]] : [];
  });
}

function skillIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((target) => {
    const row = asRecord(target);
    return row && typeof row["skillId"] === "string" ? [row["skillId"]] : [];
  });
}

function teachingFormHasForbiddenMark(text: string): boolean {
  return /[ًٌٍُِّءأإآةى]/.test(text) || /[َ][وي]ْ/.test(text);
}

export function isLiteracyWave8Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE8_META_ID;
}

export function validateLiteracyWave8Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE8_META",
        path: "meta.kind",
        message: "Literacy Wave 8 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE8_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 8 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-9") || blob.includes("wave9") || blob.includes("path.literacy.wave9")) {
    emit({
      code: "WAVE8_SCOPE",
      path: "$",
      message: "Wave 8 must not declare a Wave 9 path, route, or CTA.",
      severity: "error",
    });
  }
  if (blob.includes("word.bayt") || blob.includes("بَيْت")) {
    emit({
      code: "WAVE8_DIPHTHONG",
      path: "$",
      message: "Wave 8 must not include بَيْت.",
      severity: "error",
    });
  }
  if (
    blob.includes("letter.ain") ||
    blob.includes("letter.nun") ||
    blob.includes("letter.haa") ||
    blob.includes("letter.kha") ||
    blob.includes("letter.tah")
  ) {
    emit({
      code: "WAVE8_LETTER",
      path: "$",
      message: "Wave 8 must not teach ع, ن, ه, خ, or ط.",
      severity: "error",
    });
  }
  if (
    blob.includes("word:qamar.review.wave8") ||
    blob.includes("review-wave8") ||
    blob.includes("review.wave8") ||
    blob.includes("skill.sin_shin")
  ) {
    emit({
      code: "WAVE8_REVIEW",
      path: "$",
      message: "Wave 8 must not require a review key or a س/ش discrimination skill.",
      severity: "error",
    });
  }

  const recycledLetters = stringSet(PRIOR_LETTER_IDS);
  const newLetters = stringSet(WAVE8_LETTER_IDS);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  const foundNew = new Set<string>();
  letters.forEach((row, i) => {
    const letter = asRecord(row);
    if (!letter || typeof letter["id"] !== "string") return;
    const id = letter["id"];
    if ((FORBIDDEN_LETTERS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE8_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 8 must not teach "${id}".`,
        severity: "error",
      });
    }
    if (newLetters.has(id)) {
      foundNew.add(id);
      if (letter["wave"] !== 8) {
        emit({
          code: "WAVE8_LETTER",
          path: `letters[${i}].wave`,
          message: `Wave 8 letter "${id}" must set wave: 8.`,
          severity: "error",
        });
      }
      if (letter["teachOrder"] !== 1) {
        emit({
          code: "WAVE8_LETTER",
          path: `letters[${i}].teachOrder`,
          message: "Wave 8 teachOrder for ش must be 1.",
          severity: "error",
        });
      }
    } else if (recycledLetters.has(id)) {
      const expected = expectedPriorWave(id);
      if (expected !== undefined && letter["wave"] !== expected) {
        emit({
          code: "WAVE8_LETTER",
          path: `letters[${i}].wave`,
          message: `Recycled letter "${id}" must keep wave: ${expected}.`,
          severity: "error",
        });
      }
    } else {
      emit({
        code: "WAVE8_LETTER",
        path: `letters[${i}].id`,
        message: `Unexpected letter "${id}" in Wave 8. Only new letter is ش.`,
        severity: "error",
      });
    }
    if (typeof letter["legacyId"] !== "string" || letter["legacyId"].length === 0) {
      emit({
        code: "WAVE8_LETTER",
        path: `letters[${i}].legacyId`,
        message: `Wave 8 letter "${id}" must bridge to a prototype legacyId.`,
        severity: "error",
      });
    }
  });
  for (const id of WAVE8_LETTER_IDS) {
    if (!foundNew.has(id)) {
      emit({
        code: "WAVE8_LETTER",
        path: "letters",
        message: `Wave 8 is missing required new letter "${id}".`,
        severity: "error",
      });
    }
  }

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE8_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  words.forEach((row, i) => {
    const word = asRecord(row);
    if (!word || typeof word["id"] !== "string") return;
    const id = word["id"];
    if (!allowedWords.has(id)) {
      emit({
        code: "WAVE8_WORD",
        path: `words[${i}].id`,
        message: `Unexpected word "${id}" in Wave 8.`,
        severity: "error",
      });
    }
    if ((WAVE8_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
    const phonics = asStringArray(word["phonicsSkillIds"]);
    const required = asStringArray(word["requiredSkillIds"]);
    const banned = [...phonics, ...required].filter(
      (skillId) =>
        skillId === "skill.short_vowel.kasra" ||
        skillId === "skill.short_vowel.damma" ||
        FORBIDDEN_SKILL_PREFIXES.some((prefix) => skillId.startsWith(prefix)),
    );
    if (id === "word.shams" && banned.length > 0) {
      emit({
        code: "WAVE8_PHONICS",
        path: `words[${i}].requiredSkillIds`,
        message: `Wave 8 target "${id}" must not require a new phonics rule (${banned.join(", ")}).`,
        severity: "error",
      });
    }
    if (id === "word.shams") {
      if (word["teachingForm"] !== "شَمْس" || word["diacritized"] !== "شَمْس") {
        emit({
          code: "WAVE8_WORD",
          path: `words[${i}].teachingForm`,
          message: "شَمْس teachingForm / diacritized must be شَمْس.",
          severity: "error",
        });
      }
      const form = typeof word["teachingForm"] === "string" ? word["teachingForm"] : "";
      if (teachingFormHasForbiddenMark(form)) {
        emit({
          code: "WAVE8_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "شَمْس may reuse fatha + established sukun only: no kasra, damma, madd, shadda, tanween, hamza, ة, or ى.",
          severity: "error",
        });
      }
      if (!phonics.includes("skill.sukun.basic") || !required.includes("skill.sukun.basic")) {
        emit({
          code: "WAVE8_PHONICS",
          path: `words[${i}].phonicsSkillIds`,
          message: "شَمْس metadata must reuse established sukun inside the word. Do not add a sukun lesson.",
          severity: "error",
        });
      }
      const letterIds = sorted(asStringArray(word["letterIds"]));
      if (letterIds.join(",") !== "letter.mim,letter.shin,letter.sin") {
        emit({
          code: "WAVE8_WORD",
          path: `words[${i}].letterIds`,
          message: "شَمْس letters must be ش م س only.",
          severity: "error",
        });
      }
    }
  });
  for (const id of WAVE8_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE8_WORD",
        path: "words",
        message: `Wave 8 must include Band A word "${id}".`,
        severity: "error",
      });
    }
  }
  if (foundNewWords.size !== WAVE8_WORD_IDS.length) {
    emit({
      code: "WAVE8_WORD",
      path: "words",
      message: "Wave 8 must introduce exactly one new word: شَمْس.",
      severity: "error",
    });
  }

  const skills = Array.isArray(rec["skills"]) ? rec["skills"] : [];
  skills.forEach((row, i) => {
    const skill = asRecord(row);
    if (!skill || typeof skill["id"] !== "string") return;
    const skillId = skill["id"];
    if (FORBIDDEN_SKILL_PREFIXES.some((prefix) => skillId.startsWith(prefix))) {
      emit({
        code: "WAVE8_PHONICS",
        path: `skills[${i}].id`,
        message: `Wave 8 must not teach deferred phonics skill "${skillId}".`,
        severity: "error",
      });
    }
    if (skillId === "skill.syllable_blending.cvc" || skillId === "skill.sin_shin.discrimination") {
      emit({
        code: "WAVE8_CHUNK",
        path: `skills[${i}].id`,
        message: "Wave 8 must not add a closed-chunk or س/ش discrimination skill.",
        severity: "error",
      });
    }
  });

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  syllables.forEach((row, i) => {
    const syllable = asRecord(row);
    if (!syllable) return;
    if (syllable["pattern"] === "CVC") {
      emit({
        code: "WAVE8_CHUNK",
        path: `syllables[${i}].pattern`,
        message: "Wave 8 must not add a new closed-chunk syllable.",
        severity: "error",
      });
    }
    if (syllable["vowelSkillId"] === "skill.sukun.basic") {
      emit({
        code: "WAVE8_SUKUN",
        path: `syllables[${i}].vowelSkillId`,
        message: "Wave 8 must not add a new sukun-discrimination syllable.",
        severity: "error",
      });
    }
  });

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const units = recordById(Array.isArray(rec["units"]) ? rec["units"] : []);
  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = paths.map(asRecord).find((row) => row?.["id"] === WAVE8_PATH_ID);
  if (!path) {
    emit({
      code: "WAVE8_PATH",
      path: "paths",
      message: `Wave 8 must declare path "${WAVE8_PATH_ID}".`,
      severity: "error",
    });
  } else {
    const unitIds = asStringArray(path["unitIds"]);
    if (unitIds.length !== 2 || WAVE8_UNIT_IDS.some((id, i) => unitIds[i] !== id)) {
      emit({
        code: "WAVE8_UNITS",
        path: `paths[id=${WAVE8_PATH_ID}].unitIds`,
        message: "Wave 8 must have exactly two units in order: shin → shams.",
        severity: "error",
      });
    }
  }

  for (const [exerciseId, exercise] of exercises) {
    const tags = asStringArray(exercise["tags"]);
    if (tags.includes("review") || tags.includes("review-wave8")) {
      emit({
        code: "WAVE8_REVIEW",
        path: `exercises[id=${exerciseId}].tags`,
        message: "Wave 8 must not include a required or optional review activity.",
        severity: "error",
      });
    }
    if (exercise["type"] === "missing_haraka" || skillIdsOnTargets(exercise).includes("skill.sukun.basic")) {
      emit({
        code: "WAVE8_SUKUN",
        path: `exercises[id=${exerciseId}]`,
        message: "Wave 8 must not add a new sukun-discrimination activity.",
        severity: "error",
      });
    }
    if (exercise["type"] === "syllable_blending" && jsonText(exercise).includes("CVC")) {
      emit({
        code: "WAVE8_CHUNK",
        path: `exercises[id=${exerciseId}]`,
        message: "Wave 8 must not add a new closed-chunk activity.",
        severity: "error",
      });
    }
    const bannedSkills = skillIdsOnTargets(exercise).filter(
      (skillId) =>
        skillId === "skill.short_vowel.kasra" ||
        skillId === "skill.short_vowel.damma" ||
        FORBIDDEN_SKILL_PREFIXES.some((prefix) => skillId.startsWith(prefix)),
    );
    if (bannedSkills.length > 0) {
      emit({
        code: "WAVE8_PHONICS",
        path: `exercises[id=${exerciseId}].masteryTargets`,
        message: `Wave 8 must not score "${bannedSkills.join(", ")}".`,
        severity: "error",
      });
    }
    if (choiceIdsOf(exercise).includes("letter.ain")) {
      emit({
        code: "WAVE8_LETTER",
        path: `exercises[id=${exerciseId}].choices`,
        message: "Wave 8 must not use ع as a foil or teaching target.",
        severity: "error",
      });
    }
    if (exercise["type"] === "presentation") {
      if (Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
        emit({
          code: "WAVE8_DEMO",
          path: `exercises[id=${exerciseId}].masteryTargets`,
          message: `Presentation "${exerciseId}" must remain unscored.`,
          severity: "error",
        });
      }
      if (asRecord(exercise["success"])?.["type"] !== "continue") {
        emit({
          code: "WAVE8_DEMO",
          path: `exercises[id=${exerciseId}].success`,
          message: `Presentation "${exerciseId}" must use success type "continue".`,
          severity: "error",
        });
      }
      const config = asRecord(exercise["config"]);
      if (config?.["wordId"] === "word.shams" || config?.["show"] === "word") {
        emit({
          code: "WAVE8_TEACH_ORDER",
          path: `exercises[id=${exerciseId}].config`,
          message: "Do not SHOW شَمْس. LessonPlayer drains presentations first.",
          severity: "error",
        });
      }
      if (config?.["show"] === "chunk") {
        emit({
          code: "WAVE8_CHUNK",
          path: `exercises[id=${exerciseId}].config`,
          message: "Wave 8 must not add a closed-chunk presentation.",
          severity: "error",
        });
      }
    }
  }

  const unit1 = units.get(WAVE8_FIRST_UNIT_ID);
  if (unit1) {
    if (unit1["titleAr"] !== "تَعَلَّمْ حَرْفَ ش") {
      emit({
        code: "WAVE8_CHILD_LANGUAGE",
        path: `units[id=${WAVE8_FIRST_UNIT_ID}].titleAr`,
        message: "Wave 8 Unit 1 title must be تَعَلَّمْ حَرْفَ ش.",
        severity: "error",
      });
    }
    const prereqs = asStringArray(unit1["prereqUnitIds"]);
    if (prereqs[0] !== WAVE7_FINAL_UNIT_ID) {
      emit({
        code: "WAVE8_PREREQ",
        path: `units[id=${WAVE8_FIRST_UNIT_ID}].prereqUnitIds`,
        message: `Wave 8 Unit 1 prerequisite must be "${WAVE7_FINAL_UNIT_ID}".`,
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
    if (!required.includes("skill.letter_sounds.core") || !required.includes("skill.syllable_blending.cv")) {
      emit({
        code: "WAVE8_UNIT1",
        path: `units[id=${WAVE8_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 1 must require ش sound and شَ blending.",
        severity: "error",
      });
    }
    if (
      required.includes("skill.handwriting.isolated") ||
      required.includes("skill.word_decoding.simple") ||
      required.includes("skill.sukun.basic") ||
      required.includes("skill.letter_forms.positional")
    ) {
      emit({
        code: "WAVE8_UNIT1",
        path: `units[id=${WAVE8_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 1 must not require tracing, a word, a form quiz, or sukun mastery.",
        severity: "error",
      });
    }
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE8_HARAKA_SCOPE",
        path: `units[id=${WAVE8_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Wave 8 must not require kasra/damma mastery.",
        severity: "error",
      });
    }
    if (asStringArray(unit1["wordIds"]).length > 0) {
      emit({
        code: "WAVE8_UNIT1",
        path: `units[id=${WAVE8_FIRST_UNIT_ID}].wordIds`,
        message: "Unit 1 must not introduce a word target.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit1["exerciseIds"]);
    const shinShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["show"] === "letter" && config?.["letterId"] === "letter.shin";
    });
    const shinFathaShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["show"] === "cv" && config?.["syllableId"] === "syllable.shin.fatha";
    });
    const soundIdx = ids.findIndex((id) => exercises.get(id)?.["type"] === "sound_to_letter");
    const blendIdx = ids.findIndex((id) => exercises.get(id)?.["type"] === "syllable_blending");
    if (!(shinShow === 0 && shinFathaShow === 1 && soundIdx > shinFathaShow && blendIdx > soundIdx)) {
      emit({
        code: "WAVE8_TEACH_ORDER",
        path: `units[id=${WAVE8_FIRST_UNIT_ID}].exerciseIds`,
        message: "Unit 1 order must be ش presentation → شَ presentation → scored ش → scored شَ.",
        severity: "error",
      });
    }
    const soundExercise = exercises.get(ids[soundIdx] ?? "");
    if (soundExercise) {
      const choiceIds = choiceIdsOf(soundExercise);
      if (!choiceIds.includes("letter.sin") || !choiceIds.includes("letter.mim") || !choiceIds.includes("letter.ta")) {
        emit({
          code: "WAVE8_FOIL",
          path: `exercises[id=${soundExercise["id"]}].choices`,
          message: "ش sound choices must use known-letter foils س م ت.",
          severity: "error",
        });
      }
    }
    const blendExercise = exercises.get(ids[blendIdx] ?? "");
    if (blendExercise) {
      const choiceIds = choiceIdsOf(blendExercise);
      if (!choiceIds.includes("syllable.sin.fatha") || !choiceIds.includes("syllable.mim.fatha")) {
        emit({
          code: "WAVE8_FOIL",
          path: `exercises[id=${blendExercise["id"]}].choices`,
          message: "شَ choices must include known CV foils سَ and مَ.",
          severity: "error",
        });
      }
    }
    for (const [index, exerciseId] of ids.entries()) {
      const exercise = exercises.get(exerciseId);
      if (!exercise) continue;
      if (exercise["type"] === "audio_to_word" || exercise["type"] === "word_to_picture" || exercise["type"] === "picture_to_word") {
        emit({
          code: "WAVE8_UNIT1",
          path: `units[id=${WAVE8_FIRST_UNIT_ID}].exerciseIds[${index}]`,
          message: `Unit 1 must not include a word ("${exerciseId}").`,
          severity: "error",
        });
      }
    }
  }

  const unit2 = units.get(WAVE8_FINAL_UNIT_ID);
  if (unit2) {
    if (unit2["titleAr"] !== "نَقْرَأُ مَعًا") {
      emit({
        code: "WAVE8_CHILD_LANGUAGE",
        path: `units[id=${WAVE8_FINAL_UNIT_ID}].titleAr`,
        message: "Wave 8 Unit 2 title must be نَقْرَأُ مَعًا.",
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
    if (!required.includes("skill.letter_forms.positional") || !required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE8_UNIT2",
        path: `units[id=${WAVE8_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 2 must require initial شـ, final ـس, and شَمْس decoding.",
        severity: "error",
      });
    }
    if (required.includes("skill.sukun.basic") || required.includes("skill.handwriting.isolated")) {
      emit({
        code: "WAVE8_UNIT2",
        path: `units[id=${WAVE8_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 2 must not require tracing or sukun mastery.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit2["exerciseIds"]);
    const shinInitial = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      const targets = Array.isArray(exercise?.["masteryTargets"]) ? exercise["masteryTargets"] : [];
      const scoresInitial = targets.some((target) => {
        const row = asRecord(target);
        return row?.["letterId"] === "letter.shin" && row?.["letterForm"] === "initial";
      });
      return exercise?.["type"] === "letter_recognition" && (config?.["targetForm"] === "initial" || scoresInitial);
    });
    const sinFinal = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      const targets = Array.isArray(exercise?.["masteryTargets"]) ? exercise["masteryTargets"] : [];
      const scoresFinal = targets.some((target) => {
        const row = asRecord(target);
        return row?.["letterId"] === "letter.sin" && row?.["letterForm"] === "final";
      });
      return exercise?.["type"] === "letter_recognition" && (config?.["targetForm"] === "final" || scoresFinal);
    });
    const shamsShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["wordId"] === "word.shams";
    });
    const shamsAudio = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return exercise?.["type"] === "audio_to_word" && asRecord(exercise["success"])?.["correctChoiceId"] === "word.shams";
    });
    const shamsPicture = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return (
        (exercise?.["type"] === "word_to_picture" || exercise?.["type"] === "picture_to_word") &&
        asRecord(exercise["success"])?.["correctChoiceId"] === "word.shams"
      );
    });
    if (shamsShow >= 0) {
      emit({
        code: "WAVE8_TEACH_ORDER",
        path: `units[id=${WAVE8_FINAL_UNIT_ID}].exerciseIds`,
        message: "Do not SHOW شَمْس. LessonPlayer drains presentations first.",
        severity: "error",
      });
    }
    if (shinInitial < 0 || sinFinal < 0 || shamsAudio < 0 || !(shinInitial < sinFinal && sinFinal < shamsAudio)) {
      emit({
        code: "WAVE8_TEACH_ORDER",
        path: `units[id=${WAVE8_FINAL_UNIT_ID}].exerciseIds`,
        message: "Initial شـ and final ـس evidence must occur before any scored شَمْس.",
        severity: "error",
      });
    }
    const unusedForm = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const targets = Array.isArray(exercise?.["masteryTargets"]) ? exercise["masteryTargets"] : [];
      return targets.some((target) => {
        const row = asRecord(target);
        return (
          (row?.["letterId"] === "letter.shin" && (row?.["letterForm"] === "isolated" || row?.["letterForm"] === "medial" || row?.["letterForm"] === "final")) ||
          (row?.["letterId"] === "letter.sin" && (row?.["letterForm"] === "isolated" || row?.["letterForm"] === "initial" || row?.["letterForm"] === "medial")) ||
          (row?.["letterId"] === "letter.mim" && row?.["skillId"] === "skill.letter_forms.positional")
        );
      });
    });
    if (unusedForm >= 0) {
      emit({
        code: "WAVE8_FORMS",
        path: `units[id=${WAVE8_FINAL_UNIT_ID}].exerciseIds`,
        message: "Do not quiz isolated/medial/final ش, unused س forms, or extra م forms. Only شـ and ـس.",
        severity: "error",
      });
    }
    const shamsExercise = exercises.get(ids[shamsAudio] ?? "");
    if (!shamsExercise || shamsExercise["type"] !== "audio_to_word") {
      emit({
        code: "WAVE8_DECODING_EVIDENCE",
        path: `units[id=${WAVE8_FINAL_UNIT_ID}].exerciseIds`,
        message: "First شَمْس evidence must be audio_to_word, not picture.",
        severity: "error",
      });
    } else {
      const choiceIds = choiceIdsOf(shamsExercise);
      if (!choiceIds.includes("word.shams") || !choiceIds.includes("word.qamar") || !choiceIds.includes("word.samak")) {
        emit({
          code: "WAVE8_FOIL",
          path: `exercises[id=${shamsExercise["id"]}].choices`,
          message: "شَمْس decode must include شَمْس, قَمَر, and سَمَك.",
          severity: "error",
        });
      }
    }
    if (shamsPicture >= 0 && shamsAudio >= 0 && shamsPicture < shamsAudio) {
      emit({
        code: "WAVE8_DECODING_EVIDENCE",
        path: `units[id=${WAVE8_FINAL_UNIT_ID}].exerciseIds`,
        message: "شَمْس picture may appear only after decoding.",
        severity: "error",
      });
    }
    if (shamsPicture >= 0) {
      const picture = exercises.get(ids[shamsPicture] ?? "");
      if (picture && !asStringArray(picture["tags"]).includes("reinforcement")) {
        emit({
          code: "WAVE8_DECODING_EVIDENCE",
          path: `exercises[id=${picture["id"]}].tags`,
          message: "شَمْس picture must be tagged reinforcement.",
          severity: "error",
        });
      }
    } else {
      emit({
        code: "WAVE8_DECODING_EVIDENCE",
        path: `units[id=${WAVE8_FINAL_UNIT_ID}].exerciseIds`,
        message: "Optional شَمْس picture reinforcement is expected after decoding.",
        severity: "warning",
      });
    }
  }

  for (const unitId of WAVE8_UNIT_IDS) {
    const unit = units.get(unitId);
    if (!unit) {
      emit({
        code: "WAVE8_UNITS",
        path: "units",
        message: `Wave 8 is missing unit "${unitId}".`,
        severity: "error",
      });
      continue;
    }
    const required = asStringArray(asRecord(unit["mastery"])?.["requiredSkillIds"]);
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE8_HARAKA_SCOPE",
        path: `units[id=${unitId}].mastery.requiredSkillIds`,
        message: "Wave 8 must not require kasra/damma mastery.",
        severity: "error",
      });
    }
    const mapped = new Set<string>();
    for (const exerciseId of asStringArray(unit["exerciseIds"])) {
      const exercise = exercises.get(exerciseId);
      if (!exercise) continue;
      for (const skillId of skillIdsOnTargets(exercise)) mapped.add(skillId);
    }
    for (const skillId of required) {
      if (!mapped.has(skillId)) {
        emit({
          code: "WAVE8_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave8WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE8_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE8_BAND_A_REF",
        path: "words",
        message: `Wave 8 word "${id}" is not in production Band A.`,
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
          code: "WAVE8_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 8 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE8_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 8 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== source["legacyId"]) {
      emit({
        code: "WAVE8_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `Wave 8 "${id}" legacyId must match Band A.`,
        severity: "error",
      });
    }
    if (source["legacyId"] !== "sky-1") {
      emit({
        code: "WAVE8_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: "word.shams must remain Band A sky-1.",
        severity: "error",
      });
    }
  }
}
