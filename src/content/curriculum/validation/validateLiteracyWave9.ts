/**
 * Deterministic Wave 9 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 9 production bundle.
 * Waves 1–8 stay frozen. ع is the only new letter. Fatha only.
 * عَسَل is the single Band A target. Compact two-unit wave.
 * Final ل is newly scored because Waves 1–8 never scored letter:lam.form.final.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";
import { WAVE1_LETTER_IDS, WAVE1_WORD_IDS } from "./validateLiteracyWave1.ts";
import { WAVE2_LETTER_IDS, WAVE2_WORD_IDS } from "./validateLiteracyWave2.ts";
import { WAVE3_LETTER_IDS, WAVE3_WORD_IDS } from "./validateLiteracyWave3.ts";
import { WAVE4_LETTER_IDS, WAVE4_WORD_IDS } from "./validateLiteracyWave4.ts";
import { WAVE5_LETTER_IDS, WAVE5_WORD_IDS } from "./validateLiteracyWave5.ts";
import { WAVE6_LETTER_IDS, WAVE6_WORD_IDS } from "./validateLiteracyWave6.ts";
import { WAVE7_LETTER_IDS, WAVE7_WORD_IDS } from "./validateLiteracyWave7.ts";
import {
  WAVE8_FINAL_UNIT_ID,
  WAVE8_LETTER_IDS,
  WAVE8_WORD_IDS,
} from "./validateLiteracyWave8.ts";

export const LITERACY_WAVE9_META_ID = "hurufi.production.literacy.wave9";

export const WAVE9_LETTER_IDS = ["letter.ain"] as const;

export const WAVE9_WORD_IDS = ["word.asal"] as const;

export const WAVE9_BAND_A_WORD_IDS = ["word.asal"] as const;

export const WAVE9_PATH_ID = "path.literacy.wave9";

export const WAVE9_UNIT_IDS = [
  "unit.literacy.wave9.ain",
  "unit.literacy.wave9.asal",
] as const;

export const WAVE9_FIRST_UNIT_ID = "unit.literacy.wave9.ain";
export const WAVE9_FINAL_UNIT_ID = "unit.literacy.wave9.asal";

export const WAVE9_EXTERNAL_PREREQ_UNIT_IDS = [WAVE8_FINAL_UNIT_ID] as const;

/** Resolved contract: Waves 1–8 never scored final ل, so Wave 9 must. */
export const WAVE9_REQUIRES_LAM_FINAL = true;

const FORBIDDEN_LETTERS = [
  "letter.ghain",
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
  "skill.articulation.",
] as const;

const SAFE_FOIL_WORDS = ["word.samak", "word.jamal", "word.qalam"] as const;

const PRIOR_LETTER_IDS = [
  ...WAVE1_LETTER_IDS,
  ...WAVE2_LETTER_IDS,
  ...WAVE3_LETTER_IDS,
  ...WAVE4_LETTER_IDS,
  ...WAVE5_LETTER_IDS,
  ...WAVE6_LETTER_IDS,
  ...WAVE7_LETTER_IDS,
  ...WAVE8_LETTER_IDS,
] as const;
const PRIOR_WORD_IDS = [
  ...WAVE1_WORD_IDS,
  ...WAVE2_WORD_IDS,
  ...WAVE3_WORD_IDS,
  ...WAVE4_WORD_IDS,
  ...WAVE5_WORD_IDS,
  ...WAVE6_WORD_IDS,
  ...WAVE7_WORD_IDS,
  ...WAVE8_WORD_IDS,
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
  if ((WAVE8_LETTER_IDS as readonly string[]).includes(id)) return 8;
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
  return /[ًٌٍُِّْءأإآةى]/.test(text) || /[َ][وي]ْ/.test(text);
}

function scoresForm(exercise: Record<string, unknown> | undefined, letterId: string, form: string): boolean {
  if (!exercise) return false;
  const config = asRecord(exercise["config"]);
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  const scored = targets.some((target) => {
    const row = asRecord(target);
    return row?.["letterId"] === letterId && row?.["letterForm"] === form;
  });
  return exercise["type"] === "letter_recognition" && (config?.["targetForm"] === form || scored) && scored;
}

export function isLiteracyWave9Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE9_META_ID;
}

export function validateLiteracyWave9Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE9_META",
        path: "meta.kind",
        message: "Literacy Wave 9 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE9_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 9 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-10") || blob.includes("wave10") || blob.includes("path.literacy.wave10")) {
    emit({
      code: "WAVE9_SCOPE",
      path: "$",
      message: "Wave 9 must not declare a Wave 10 path, route, or CTA.",
      severity: "error",
    });
  }
  if (blob.includes("word.bayt") || blob.includes("بَيْت") || blob.includes("بَاب") || blob.includes("word.bab")) {
    emit({
      code: "WAVE9_MADD",
      path: "$",
      message: "Wave 9 must not include madd-alif vocabulary.",
      severity: "error",
    });
  }
  if (
    blob.includes("letter.ghain") ||
    blob.includes("letter.nun") ||
    blob.includes("letter.haa") ||
    blob.includes("letter.kha") ||
    blob.includes("letter.tah")
  ) {
    emit({
      code: "WAVE9_LETTER",
      path: "$",
      message: "Wave 9 must not teach غ, ن, ه, خ, or ط.",
      severity: "error",
    });
  }
  if (
    blob.includes("review-wave9") ||
    blob.includes("review.wave9") ||
    blob.includes("skill.ain_ha") ||
    blob.includes("skill.articulation")
  ) {
    emit({
      code: "WAVE9_REVIEW",
      path: "$",
      message: "Wave 9 must not require a review key or a new articulation/discrimination skill.",
      severity: "error",
    });
  }

  const recycledLetters = stringSet(PRIOR_LETTER_IDS);
  const newLetters = stringSet(WAVE9_LETTER_IDS);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  const foundNew = new Set<string>();
  letters.forEach((row, i) => {
    const letter = asRecord(row);
    if (!letter || typeof letter["id"] !== "string") return;
    const id = letter["id"];
    if ((FORBIDDEN_LETTERS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE9_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 9 must not teach "${id}".`,
        severity: "error",
      });
    }
    if (newLetters.has(id)) {
      foundNew.add(id);
      if (letter["wave"] !== 9) {
        emit({
          code: "WAVE9_LETTER",
          path: `letters[${i}].wave`,
          message: `Wave 9 letter "${id}" must set wave: 9.`,
          severity: "error",
        });
      }
      if (letter["teachOrder"] !== 1) {
        emit({
          code: "WAVE9_LETTER",
          path: `letters[${i}].teachOrder`,
          message: "Wave 9 teachOrder for ع must be 1.",
          severity: "error",
        });
      }
    } else if (recycledLetters.has(id)) {
      const expected = expectedPriorWave(id);
      if (expected !== undefined && letter["wave"] !== expected) {
        emit({
          code: "WAVE9_LETTER",
          path: `letters[${i}].wave`,
          message: `Recycled letter "${id}" must keep wave: ${expected}.`,
          severity: "error",
        });
      }
    } else {
      emit({
        code: "WAVE9_LETTER",
        path: `letters[${i}].id`,
        message: `Unexpected letter "${id}" in Wave 9. Only new letter is ع.`,
        severity: "error",
      });
    }
    if (typeof letter["legacyId"] !== "string" || letter["legacyId"].length === 0) {
      emit({
        code: "WAVE9_LETTER",
        path: `letters[${i}].legacyId`,
        message: `Wave 9 letter "${id}" must bridge to a prototype legacyId.`,
        severity: "error",
      });
    }
  });
  for (const id of WAVE9_LETTER_IDS) {
    if (!foundNew.has(id)) {
      emit({
        code: "WAVE9_LETTER",
        path: "letters",
        message: `Wave 9 is missing required new letter "${id}".`,
        severity: "error",
      });
    }
  }

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE9_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  words.forEach((row, i) => {
    const word = asRecord(row);
    if (!word || typeof word["id"] !== "string") return;
    const id = word["id"];
    if (!allowedWords.has(id)) {
      emit({
        code: "WAVE9_WORD",
        path: `words[${i}].id`,
        message: `Unexpected word "${id}" in Wave 9.`,
        severity: "error",
      });
    }
    if ((WAVE9_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
    const phonics = asStringArray(word["phonicsSkillIds"]);
    const required = asStringArray(word["requiredSkillIds"]);
    const banned = [...phonics, ...required].filter(
      (skillId) =>
        skillId === "skill.short_vowel.kasra" ||
        skillId === "skill.short_vowel.damma" ||
        skillId === "skill.sukun.basic" ||
        FORBIDDEN_SKILL_PREFIXES.some((prefix) => skillId.startsWith(prefix)),
    );
    if (id === "word.asal" && banned.length > 0) {
      emit({
        code: "WAVE9_PHONICS",
        path: `words[${i}].requiredSkillIds`,
        message: `Wave 9 target "${id}" must not require a new phonics rule (${banned.join(", ")}).`,
        severity: "error",
      });
    }
    if (id === "word.asal") {
      if (word["teachingForm"] !== "عَسَل" || word["diacritized"] !== "عَسَل") {
        emit({
          code: "WAVE9_WORD",
          path: `words[${i}].teachingForm`,
          message: "عَسَل teachingForm / diacritized must be عَسَل.",
          severity: "error",
        });
      }
      const form = typeof word["teachingForm"] === "string" ? word["teachingForm"] : "";
      if (teachingFormHasForbiddenMark(form)) {
        emit({
          code: "WAVE9_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "عَسَل must be fatha only: no kasra, damma, sukun, madd, shadda, tanween, hamza, ة, or ى.",
          severity: "error",
        });
      }
      const letterIds = sorted(asStringArray(word["letterIds"]));
      if (letterIds.join(",") !== "letter.ain,letter.lam,letter.sin") {
        emit({
          code: "WAVE9_WORD",
          path: `words[${i}].letterIds`,
          message: "عَسَل letters must be ع س ل only.",
          severity: "error",
        });
      }
    }
  });
  for (const id of WAVE9_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE9_WORD",
        path: "words",
        message: `Wave 9 must include Band A word "${id}".`,
        severity: "error",
      });
    }
  }
  if (foundNewWords.size !== WAVE9_WORD_IDS.length) {
    emit({
      code: "WAVE9_WORD",
      path: "words",
      message: "Wave 9 must introduce exactly one new word: عَسَل.",
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
        code: "WAVE9_PHONICS",
        path: `skills[${i}].id`,
        message: `Wave 9 must not teach deferred phonics skill "${skillId}".`,
        severity: "error",
      });
    }
    if (skillId === "skill.syllable_blending.cvc") {
      emit({
        code: "WAVE9_CHUNK",
        path: `skills[${i}].id`,
        message: "Wave 9 must not add a new closed-chunk skill.",
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
        code: "WAVE9_CHUNK",
        path: `syllables[${i}].pattern`,
        message: "Wave 9 must not add a new closed-chunk syllable.",
        severity: "error",
      });
    }
    if (syllable["vowelSkillId"] === "skill.sukun.basic") {
      emit({
        code: "WAVE9_SUKUN",
        path: `syllables[${i}].vowelSkillId`,
        message: "Wave 9 must not add a new sukun-discrimination syllable.",
        severity: "error",
      });
    }
  });

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const units = recordById(Array.isArray(rec["units"]) ? rec["units"] : []);
  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = paths.map(asRecord).find((row) => row?.["id"] === WAVE9_PATH_ID);
  if (!path) {
    emit({
      code: "WAVE9_PATH",
      path: "paths",
      message: `Wave 9 must declare path "${WAVE9_PATH_ID}".`,
      severity: "error",
    });
  } else {
    const unitIds = asStringArray(path["unitIds"]);
    if (unitIds.length !== 2 || WAVE9_UNIT_IDS.some((id, i) => unitIds[i] !== id)) {
      emit({
        code: "WAVE9_UNITS",
        path: `paths[id=${WAVE9_PATH_ID}].unitIds`,
        message: "Wave 9 must have exactly two units in order: ain → asal.",
        severity: "error",
      });
    }
  }

  for (const [exerciseId, exercise] of exercises) {
    const tags = asStringArray(exercise["tags"]);
    if (tags.includes("review") || tags.includes("review-wave9")) {
      emit({
        code: "WAVE9_REVIEW",
        path: `exercises[id=${exerciseId}].tags`,
        message: "Wave 9 must not include a required or optional review activity.",
        severity: "error",
      });
    }
    if (exercise["type"] === "missing_haraka" || skillIdsOnTargets(exercise).includes("skill.sukun.basic")) {
      emit({
        code: "WAVE9_SUKUN",
        path: `exercises[id=${exerciseId}]`,
        message: "Wave 9 must not add a new sukun-discrimination activity.",
        severity: "error",
      });
    }
    if (exercise["type"] === "syllable_blending" && jsonText(exercise).includes("CVC")) {
      emit({
        code: "WAVE9_CHUNK",
        path: `exercises[id=${exerciseId}]`,
        message: "Wave 9 must not add a new closed-chunk activity.",
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
        code: "WAVE9_PHONICS",
        path: `exercises[id=${exerciseId}].masteryTargets`,
        message: `Wave 9 must not score "${bannedSkills.join(", ")}".`,
        severity: "error",
      });
    }
    if (choiceIdsOf(exercise).includes("letter.ghain")) {
      emit({
        code: "WAVE9_LETTER",
        path: `exercises[id=${exerciseId}].choices`,
        message: "Wave 9 must not use غ as a foil or teaching target.",
        severity: "error",
      });
    }
    if (exercise["type"] === "presentation") {
      if (Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
        emit({
          code: "WAVE9_DEMO",
          path: `exercises[id=${exerciseId}].masteryTargets`,
          message: `Presentation "${exerciseId}" must remain unscored.`,
          severity: "error",
        });
      }
      if (asRecord(exercise["success"])?.["type"] !== "continue") {
        emit({
          code: "WAVE9_DEMO",
          path: `exercises[id=${exerciseId}].success`,
          message: `Presentation "${exerciseId}" must use success type "continue".`,
          severity: "error",
        });
      }
      const config = asRecord(exercise["config"]);
      if (config?.["wordId"] === "word.asal" || config?.["show"] === "word") {
        emit({
          code: "WAVE9_TEACH_ORDER",
          path: `exercises[id=${exerciseId}].config`,
          message: "Do not SHOW عَسَل. LessonPlayer drains presentations first.",
          severity: "error",
        });
      }
      if (config?.["show"] === "chunk") {
        emit({
          code: "WAVE9_CHUNK",
          path: `exercises[id=${exerciseId}].config`,
          message: "Wave 9 must not add a closed-chunk presentation.",
          severity: "error",
        });
      }
    }
  }

  const unit1 = units.get(WAVE9_FIRST_UNIT_ID);
  if (unit1) {
    if (unit1["titleAr"] !== "تَعَلَّمْ حَرْفَ ع") {
      emit({
        code: "WAVE9_CHILD_LANGUAGE",
        path: `units[id=${WAVE9_FIRST_UNIT_ID}].titleAr`,
        message: "Wave 9 Unit 1 title must be تَعَلَّمْ حَرْفَ ع.",
        severity: "error",
      });
    }
    const prereqs = asStringArray(unit1["prereqUnitIds"]);
    if (prereqs[0] !== WAVE8_FINAL_UNIT_ID) {
      emit({
        code: "WAVE9_PREREQ",
        path: `units[id=${WAVE9_FIRST_UNIT_ID}].prereqUnitIds`,
        message: `Wave 9 Unit 1 prerequisite must be "${WAVE8_FINAL_UNIT_ID}".`,
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
    if (!required.includes("skill.letter_sounds.core") || !required.includes("skill.syllable_blending.cv")) {
      emit({
        code: "WAVE9_UNIT1",
        path: `units[id=${WAVE9_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 1 must require ع sound and عَ blending.",
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
        code: "WAVE9_UNIT1",
        path: `units[id=${WAVE9_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 1 must not require tracing, a word, a form quiz, or sukun mastery.",
        severity: "error",
      });
    }
    if (asStringArray(unit1["wordIds"]).length > 0) {
      emit({
        code: "WAVE9_UNIT1",
        path: `units[id=${WAVE9_FIRST_UNIT_ID}].wordIds`,
        message: "Unit 1 must not introduce a word target.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit1["exerciseIds"]);
    const ainShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["show"] === "letter" && config?.["letterId"] === "letter.ain";
    });
    const ainFathaShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["show"] === "cv" && config?.["syllableId"] === "syllable.ain.fatha";
    });
    const soundIdx = ids.findIndex((id) => exercises.get(id)?.["type"] === "sound_to_letter");
    const blendIdx = ids.findIndex((id) => exercises.get(id)?.["type"] === "syllable_blending");
    if (!(ainShow === 0 && ainFathaShow === 1 && soundIdx > ainFathaShow && blendIdx > soundIdx)) {
      emit({
        code: "WAVE9_TEACH_ORDER",
        path: `units[id=${WAVE9_FIRST_UNIT_ID}].exerciseIds`,
        message: "Unit 1 order must be ع presentation → عَ presentation → scored ع → scored عَ.",
        severity: "error",
      });
    }
    const soundExercise = exercises.get(ids[soundIdx] ?? "");
    if (soundExercise) {
      const choiceIds = choiceIdsOf(soundExercise);
      if (!choiceIds.includes("letter.ha") || !choiceIds.includes("letter.mim") || !choiceIds.includes("letter.sin")) {
        emit({
          code: "WAVE9_FOIL",
          path: `exercises[id=${soundExercise["id"]}].choices`,
          message: "ع sound choices must use known-letter foils ح م س.",
          severity: "error",
        });
      }
    }
    for (const [index, exerciseId] of ids.entries()) {
      const exercise = exercises.get(exerciseId);
      if (!exercise) continue;
      if (exercise["type"] === "audio_to_word" || exercise["type"] === "word_to_picture" || exercise["type"] === "picture_to_word") {
        emit({
          code: "WAVE9_UNIT1",
          path: `units[id=${WAVE9_FIRST_UNIT_ID}].exerciseIds[${index}]`,
          message: `Unit 1 must not include a word ("${exerciseId}").`,
          severity: "error",
        });
      }
    }
  }

  const unit2 = units.get(WAVE9_FINAL_UNIT_ID);
  if (unit2) {
    if (unit2["titleAr"] !== "نَقْرَأُ مَعًا") {
      emit({
        code: "WAVE9_CHILD_LANGUAGE",
        path: `units[id=${WAVE9_FINAL_UNIT_ID}].titleAr`,
        message: "Wave 9 Unit 2 title must be نَقْرَأُ مَعًا.",
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
    if (!required.includes("skill.letter_forms.positional") || !required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE9_UNIT2",
        path: `units[id=${WAVE9_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 2 must require initial عـ, medial ـسـ, final ـل, and عَسَل decoding.",
        severity: "error",
      });
    }
    if (required.includes("skill.sukun.basic") || required.includes("skill.handwriting.isolated")) {
      emit({
        code: "WAVE9_UNIT2",
        path: `units[id=${WAVE9_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 2 must not require tracing or sukun mastery.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit2["exerciseIds"]);
    const ainInitial = ids.findIndex((id) => scoresForm(exercises.get(id), "letter.ain", "initial"));
    const sinMedial = ids.findIndex((id) => scoresForm(exercises.get(id), "letter.sin", "medial"));
    const lamFinal = ids.findIndex((id) => scoresForm(exercises.get(id), "letter.lam", "final"));
    const asalShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["wordId"] === "word.asal";
    });
    const asalAudio = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return exercise?.["type"] === "audio_to_word" && asRecord(exercise["success"])?.["correctChoiceId"] === "word.asal";
    });
    const asalPicture = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return (
        (exercise?.["type"] === "word_to_picture" || exercise?.["type"] === "picture_to_word") &&
        asRecord(exercise["success"])?.["correctChoiceId"] === "word.asal"
      );
    });
    if (asalShow >= 0) {
      emit({
        code: "WAVE9_TEACH_ORDER",
        path: `units[id=${WAVE9_FINAL_UNIT_ID}].exerciseIds`,
        message: "Do not SHOW عَسَل. LessonPlayer drains presentations first.",
        severity: "error",
      });
    }
    if (WAVE9_REQUIRES_LAM_FINAL) {
      if (ainInitial < 0 || sinMedial < 0 || lamFinal < 0 || asalAudio < 0 || !(ainInitial < sinMedial && sinMedial < lamFinal && lamFinal < asalAudio)) {
        emit({
          code: "WAVE9_TEACH_ORDER",
          path: `units[id=${WAVE9_FINAL_UNIT_ID}].exerciseIds`,
          message: "Initial عـ, medial ـسـ, and final ـل evidence must occur before any scored عَسَل.",
          severity: "error",
        });
      }
    }
    const unusedForm = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const targets = Array.isArray(exercise?.["masteryTargets"]) ? exercise["masteryTargets"] : [];
      return targets.some((target) => {
        const row = asRecord(target);
        return (
          (row?.["letterId"] === "letter.ain" && (row?.["letterForm"] === "isolated" || row?.["letterForm"] === "medial" || row?.["letterForm"] === "final")) ||
          (row?.["letterId"] === "letter.sin" && (row?.["letterForm"] === "isolated" || row?.["letterForm"] === "initial" || row?.["letterForm"] === "final")) ||
          (row?.["letterId"] === "letter.lam" && (row?.["letterForm"] === "isolated" || row?.["letterForm"] === "initial" || row?.["letterForm"] === "medial"))
        );
      });
    });
    if (unusedForm >= 0) {
      emit({
        code: "WAVE9_FORMS",
        path: `units[id=${WAVE9_FINAL_UNIT_ID}].exerciseIds`,
        message: "Do not quiz unused ع / س / ل forms. Only عـ, ـسـ, and ـل.",
        severity: "error",
      });
    }
    const asalExercise = exercises.get(ids[asalAudio] ?? "");
    if (!asalExercise || asalExercise["type"] !== "audio_to_word") {
      emit({
        code: "WAVE9_DECODING_EVIDENCE",
        path: `units[id=${WAVE9_FINAL_UNIT_ID}].exerciseIds`,
        message: "First عَسَل evidence must be audio_to_word, not picture.",
        severity: "error",
      });
    } else {
      const choiceIds = choiceIdsOf(asalExercise);
      const foils = choiceIds.filter((id) => id !== "word.asal");
      if (!choiceIds.includes("word.asal")) {
        emit({
          code: "WAVE9_FOIL",
          path: `exercises[id=${asalExercise["id"]}].choices`,
          message: "عَسَل decode must include عَسَل.",
          severity: "error",
        });
      }
      if (foils.length < 2 || foils.some((id) => !(SAFE_FOIL_WORDS as readonly string[]).includes(id))) {
        emit({
          code: "WAVE9_FOIL",
          path: `exercises[id=${asalExercise["id"]}].choices`,
          message: "عَسَل foils must be two already-decoded words from سَمَك / جَمَل / قَلَم.",
          severity: "error",
        });
      }
    }
    if (asalPicture >= 0 && asalAudio >= 0 && asalPicture < asalAudio) {
      emit({
        code: "WAVE9_DECODING_EVIDENCE",
        path: `units[id=${WAVE9_FINAL_UNIT_ID}].exerciseIds`,
        message: "عَسَل picture may appear only after decoding.",
        severity: "error",
      });
    }
    if (asalPicture >= 0) {
      const picture = exercises.get(ids[asalPicture] ?? "");
      if (picture && !asStringArray(picture["tags"]).includes("reinforcement")) {
        emit({
          code: "WAVE9_DECODING_EVIDENCE",
          path: `exercises[id=${picture["id"]}].tags`,
          message: "عَسَل picture must be tagged reinforcement.",
          severity: "error",
        });
      }
    } else {
      emit({
        code: "WAVE9_DECODING_EVIDENCE",
        path: `units[id=${WAVE9_FINAL_UNIT_ID}].exerciseIds`,
        message: "Optional عَسَل picture reinforcement is expected after decoding.",
        severity: "warning",
      });
    }
  }

  for (const unitId of WAVE9_UNIT_IDS) {
    const unit = units.get(unitId);
    if (!unit) {
      emit({
        code: "WAVE9_UNITS",
        path: "units",
        message: `Wave 9 is missing unit "${unitId}".`,
        severity: "error",
      });
      continue;
    }
    const required = asStringArray(asRecord(unit["mastery"])?.["requiredSkillIds"]);
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE9_HARAKA_SCOPE",
        path: `units[id=${unitId}].mastery.requiredSkillIds`,
        message: "Wave 9 must not require kasra/damma mastery.",
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
          code: "WAVE9_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave9WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE9_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE9_BAND_A_REF",
        path: "words",
        message: `Wave 9 word "${id}" is not in production Band A.`,
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
          code: "WAVE9_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 9 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE9_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 9 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== source["legacyId"]) {
      emit({
        code: "WAVE9_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `Wave 9 "${id}" legacyId must match Band A.`,
        severity: "error",
      });
    }
    if (source["legacyId"] !== "food-19") {
      emit({
        code: "WAVE9_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: "word.asal must remain Band A food-19.",
        severity: "error",
      });
    }
  }
}
