/**
 * Deterministic Wave 10 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 10 production bundle.
 * Waves 1–9 stay frozen. Madd-alif is the only new phonics rule.
 * بَاب is the single Band A target. Compact two-unit wave.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";
import { WAVE1_LETTER_IDS, WAVE1_WORD_IDS } from "./validateLiteracyWave1.ts";
import { WAVE2_LETTER_IDS, WAVE2_WORD_IDS } from "./validateLiteracyWave2.ts";
import { WAVE3_LETTER_IDS, WAVE3_WORD_IDS } from "./validateLiteracyWave3.ts";
import { WAVE4_LETTER_IDS, WAVE4_WORD_IDS } from "./validateLiteracyWave4.ts";
import { WAVE5_LETTER_IDS, WAVE5_WORD_IDS } from "./validateLiteracyWave5.ts";
import { WAVE6_LETTER_IDS, WAVE6_WORD_IDS } from "./validateLiteracyWave6.ts";
import { WAVE7_LETTER_IDS, WAVE7_WORD_IDS } from "./validateLiteracyWave7.ts";
import { WAVE8_LETTER_IDS, WAVE8_WORD_IDS } from "./validateLiteracyWave8.ts";
import {
  WAVE9_FINAL_UNIT_ID,
  WAVE9_LETTER_IDS,
  WAVE9_WORD_IDS,
} from "./validateLiteracyWave9.ts";

export const LITERACY_WAVE10_META_ID = "hurufi.production.literacy.wave10";

/** No new consonant. ا is a madd carrier, not a taught letter-sound. */
export const WAVE10_LETTER_IDS = [] as const;

export const WAVE10_WORD_IDS = ["word.bab"] as const;

export const WAVE10_BAND_A_WORD_IDS = ["word.bab"] as const;

export const WAVE10_PATH_ID = "path.literacy.wave10";

export const WAVE10_UNIT_IDS = [
  "unit.literacy.wave10.madd_alif",
  "unit.literacy.wave10.bab",
] as const;

export const WAVE10_FIRST_UNIT_ID = "unit.literacy.wave10.madd_alif";
export const WAVE10_FINAL_UNIT_ID = "unit.literacy.wave10.bab";

export const WAVE10_EXTERNAL_PREREQ_UNIT_IDS = [WAVE9_FINAL_UNIT_ID] as const;

const CARRIER_LETTER_IDS = ["letter.alif"] as const;

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
  "skill.taa_marbuta.",
  "skill.alif_maqsura.",
  "skill.articulation.",
] as const;

const SAFE_FOIL_WORDS = ["word.qalam", "word.jamal"] as const;

const PRIOR_LETTER_IDS = [
  ...WAVE1_LETTER_IDS,
  ...WAVE2_LETTER_IDS,
  ...WAVE3_LETTER_IDS,
  ...WAVE4_LETTER_IDS,
  ...WAVE5_LETTER_IDS,
  ...WAVE6_LETTER_IDS,
  ...WAVE7_LETTER_IDS,
  ...WAVE8_LETTER_IDS,
  ...WAVE9_LETTER_IDS,
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
  ...WAVE9_WORD_IDS,
] as const;

const HAMZA_SEATS = /[أإآ]/u;

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
  if ((WAVE5_LETTER_IDS as readonly string[]).includes(id)) return 5;
  if ((WAVE6_LETTER_IDS as readonly string[]).includes(id)) return 6;
  if ((WAVE7_LETTER_IDS as readonly string[]).includes(id)) return 7;
  if ((WAVE8_LETTER_IDS as readonly string[]).includes(id)) return 8;
  if ((WAVE9_LETTER_IDS as readonly string[]).includes(id)) return 9;
  return undefined;
}

function skillIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((row) => {
    const rec = asRecord(row);
    return rec && typeof rec["skillId"] === "string" ? [rec["skillId"]] : [];
  });
}

function childVisibleStrings(data: unknown): string[] {
  const rec = asRecord(data);
  if (!rec) return [];
  const out: string[] = [];
  const push = (value: unknown) => {
    if (typeof value === "string" && value.length > 0) out.push(value);
  };
  for (const row of Array.isArray(rec["exercises"]) ? rec["exercises"] : []) {
    const exercise = asRecord(row);
    if (!exercise) continue;
    push(exercise["promptText"]);
    push(exercise["learningObjectiveAr"]);
    const config = asRecord(exercise["config"]);
    if (config) {
      push(config["left"]);
      push(config["right"]);
      push(config["result"]);
    }
    for (const choice of Array.isArray(exercise["choices"]) ? exercise["choices"] : []) {
      push(asRecord(choice)?.["label"]);
    }
  }
  for (const row of Array.isArray(rec["units"]) ? rec["units"] : []) {
    const unit = asRecord(row);
    if (!unit) continue;
    push(unit["titleAr"]);
    push(unit["childGoalAr"]);
  }
  for (const row of Array.isArray(rec["paths"]) ? rec["paths"] : []) {
    const path = asRecord(row);
    if (!path) continue;
    push(path["titleAr"]);
    push(path["descriptionAr"]);
  }
  for (const row of Array.isArray(rec["syllables"]) ? rec["syllables"] : []) {
    push(asRecord(row)?.["text"]);
  }
  for (const row of Array.isArray(rec["words"]) ? rec["words"] : []) {
    const word = asRecord(row);
    if (!word) continue;
    push(word["teachingForm"]);
    push(word["diacritized"]);
  }
  return out;
}

export function isLiteracyWave10Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE10_META_ID;
}

export function validateLiteracyWave10Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE10_META",
        path: "meta.kind",
        message: "Literacy Wave 10 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE10_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 10 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-11") || blob.includes("wave11") || blob.includes("path.literacy.wave11")) {
    emit({
      code: "WAVE10_SCOPE",
      path: "$",
      message: "Wave 10 must not declare a Wave 11 path, route, or CTA.",
      severity: "error",
    });
  }
  if (blob.includes("word.laa") || blob.includes("word.dajaj") || blob.includes("دَجَاج")) {
    emit({
      code: "WAVE10_SCOPE",
      path: "$",
      message: "Wave 10 must not include word.laa or word.dajaj.",
      severity: "error",
    });
  }
  if (blob.includes("word.arnab") || blob.includes("أَرْنَب")) {
    emit({
      code: "WAVE10_HAMZA",
      path: "$",
      message: "Wave 10 must not use أَرْنَب or word.arnab.",
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
      code: "WAVE10_LETTER",
      path: "$",
      message: "Wave 10 must not teach غ, ن, ه, خ, or ط.",
      severity: "error",
    });
  }
  if (blob.includes("review-wave10") || blob.includes("review.wave10") || blob.includes("skill.articulation")) {
    emit({
      code: "WAVE10_REVIEW",
      path: "$",
      message: "Wave 10 must not require a review key or a new articulation skill.",
      severity: "error",
    });
  }

  for (const text of childVisibleStrings(data)) {
    if (HAMZA_SEATS.test(text)) {
      emit({
        code: "WAVE10_HAMZA",
        path: "childVisible",
        message: `Wave 10 child-visible copy must not contain أ / إ / آ: "${text}".`,
        severity: "error",
      });
    }
  }

  const recycledLetters = stringSet(PRIOR_LETTER_IDS);
  const carrierLetters = stringSet(CARRIER_LETTER_IDS);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  let foundAlif = false;
  letters.forEach((row, i) => {
    const letter = asRecord(row);
    if (!letter || typeof letter["id"] !== "string") return;
    const id = letter["id"];
    if ((FORBIDDEN_LETTERS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE10_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 10 must not teach "${id}".`,
        severity: "error",
      });
    }
    if (carrierLetters.has(id)) {
      foundAlif = true;
      if (letter["nonConnecting"] !== true) {
        emit({
          code: "WAVE10_ALIF",
          path: `letters[${i}].nonConnecting`,
          message: "letter.alif must remain nonConnecting.",
          severity: "error",
        });
      }
      if (letter["char"] !== "ا") {
        emit({
          code: "WAVE10_ALIF",
          path: `letters[${i}].char`,
          message: "letter.alif must use plain ا.",
          severity: "error",
        });
      }
    } else if (recycledLetters.has(id)) {
      const expected = expectedPriorWave(id);
      if (expected !== undefined && letter["wave"] !== expected) {
        emit({
          code: "WAVE10_LETTER",
          path: `letters[${i}].wave`,
          message: `Recycled letter "${id}" must keep wave: ${expected}.`,
          severity: "error",
        });
      }
    } else {
      emit({
        code: "WAVE10_LETTER",
        path: `letters[${i}].id`,
        message: `Unexpected letter "${id}" in Wave 10. No new consonant is allowed.`,
        severity: "error",
      });
    }
    if (typeof letter["legacyId"] !== "string" || letter["legacyId"].length === 0) {
      emit({
        code: "WAVE10_LETTER",
        path: `letters[${i}].legacyId`,
        message: `Wave 10 letter "${id}" must bridge to a prototype legacyId.`,
        severity: "error",
      });
    }
  });
  if (!foundAlif) {
    emit({
      code: "WAVE10_ALIF",
      path: "letters",
      message: "Wave 10 must include letter.alif as a non-connecting madd carrier.",
      severity: "error",
    });
  }

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE10_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  words.forEach((row, i) => {
    const word = asRecord(row);
    if (!word || typeof word["id"] !== "string") return;
    const id = word["id"];
    if (!allowedWords.has(id)) {
      emit({
        code: "WAVE10_WORD",
        path: `words[${i}].id`,
        message: `Unexpected word "${id}" in Wave 10.`,
        severity: "error",
      });
    }
    if ((WAVE10_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
    if (word["teachingForm"] === "لَا" || word["diacritized"] === "لَا") {
      emit({
        code: "WAVE10_SCOPE",
        path: `words[${i}].teachingForm`,
        message: "Wave 10 must not teach the function word لَا.",
        severity: "error",
      });
    }
    const phonics = asStringArray(word["phonicsSkillIds"]);
    const required = asStringArray(word["requiredSkillIds"]);
    if (id === "word.bab") {
      if (word["teachingForm"] !== "بَاب" || word["diacritized"] !== "بَاب") {
        emit({
          code: "WAVE10_WORD",
          path: `words[${i}].teachingForm`,
          message: "بَاب teachingForm / diacritized must be بَاب.",
          severity: "error",
        });
      }
      if (!phonics.includes("skill.long_vowel.madd") || !required.includes("skill.long_vowel.madd")) {
        emit({
          code: "WAVE10_PHONICS",
          path: `words[${i}].phonicsSkillIds`,
          message: "word.bab must require skill.long_vowel.madd.",
          severity: "error",
        });
      }
      if (phonics.includes("skill.sukun.basic") || required.includes("skill.sukun.basic")) {
        emit({
          code: "WAVE10_SUKUN",
          path: `words[${i}].requiredSkillIds`,
          message: "بَاب must not require sukun.",
          severity: "error",
        });
      }
      const banned = [...phonics, ...required].filter(
        (skillId) =>
          skillId === "skill.short_vowel.kasra" ||
          skillId === "skill.short_vowel.damma" ||
          FORBIDDEN_SKILL_PREFIXES.some((prefix) => skillId.startsWith(prefix)),
      );
      if (banned.length > 0) {
        emit({
          code: "WAVE10_PHONICS",
          path: `words[${i}].requiredSkillIds`,
          message: `word.bab must not require forbidden phonics (${banned.join(", ")}).`,
          severity: "error",
        });
      }
      const letterIds = sorted(asStringArray(word["letterIds"]));
      if (letterIds.join(",") !== "letter.alif,letter.ba") {
        emit({
          code: "WAVE10_WORD",
          path: `words[${i}].letterIds`,
          message: "بَاب letters must be ب and ا only.",
          severity: "error",
        });
      }
    }
  });
  for (const id of WAVE10_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE10_WORD",
        path: "words",
        message: `Wave 10 must include Band A word "${id}".`,
        severity: "error",
      });
    }
  }
  if (foundNewWords.size !== WAVE10_WORD_IDS.length) {
    emit({
      code: "WAVE10_WORD",
      path: "words",
      message: "Wave 10 must introduce exactly one new word: بَاب.",
      severity: "error",
    });
  }

  const skills = Array.isArray(rec["skills"]) ? rec["skills"] : [];
  let foundMaddSkill = false;
  skills.forEach((row, i) => {
    const skill = asRecord(row);
    if (!skill || typeof skill["id"] !== "string") return;
    const skillId = skill["id"];
    if (skillId === "skill.long_vowel.madd") foundMaddSkill = true;
    if (FORBIDDEN_SKILL_PREFIXES.some((prefix) => skillId.startsWith(prefix))) {
      emit({
        code: "WAVE10_PHONICS",
        path: `skills[${i}].id`,
        message: `Wave 10 must not teach deferred phonics skill "${skillId}".`,
        severity: "error",
      });
    }
    if (skillId === "skill.syllable_blending.cvc") {
      emit({
        code: "WAVE10_CHUNK",
        path: `skills[${i}].id`,
        message: "Wave 10 must not add a new closed-chunk skill.",
        severity: "error",
      });
    }
  });
  if (!foundMaddSkill) {
    emit({
      code: "WAVE10_PHONICS",
      path: "skills",
      message: "Wave 10 must include skill.long_vowel.madd.",
      severity: "error",
    });
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  let foundMaddSyllable = false;
  syllables.forEach((row, i) => {
    const syllable = asRecord(row);
    if (!syllable) return;
    if (syllable["id"] === "syllable.ba.madd_alif") {
      foundMaddSyllable = true;
      if (syllable["pattern"] !== "CVV") {
        emit({
          code: "WAVE10_CVV",
          path: `syllables[${i}].pattern`,
          message: "syllable.ba.madd_alif must use pattern CVV, not CV or CVC.",
          severity: "error",
        });
      }
      if (syllable["text"] !== "بَا") {
        emit({
          code: "WAVE10_CVV",
          path: `syllables[${i}].text`,
          message: "syllable.ba.madd_alif text must be بَا.",
          severity: "error",
        });
      }
      if (syllable["vowelSkillId"] !== "skill.long_vowel.madd") {
        emit({
          code: "WAVE10_CVV",
          path: `syllables[${i}].vowelSkillId`,
          message: "syllable.ba.madd_alif must use skill.long_vowel.madd.",
          severity: "error",
        });
      }
    }
    if (syllable["pattern"] === "CVC") {
      emit({
        code: "WAVE10_CHUNK",
        path: `syllables[${i}].pattern`,
        message: "Wave 10 must not add a closed-chunk syllable.",
        severity: "error",
      });
    }
    if (syllable["id"] === "syllable.ba.madd_alif" && (syllable["pattern"] === "CV" || syllable["pattern"] === "CVC")) {
      emit({
        code: "WAVE10_CVV",
        path: `syllables[${i}].pattern`,
        message: "بَا must not be tagged CV or CVC.",
        severity: "error",
      });
    }
    if (syllable["vowelSkillId"] === "skill.sukun.basic") {
      emit({
        code: "WAVE10_SUKUN",
        path: `syllables[${i}].vowelSkillId`,
        message: "Wave 10 must not add a new sukun syllable.",
        severity: "error",
      });
    }
  });
  if (!foundMaddSyllable) {
    emit({
      code: "WAVE10_CVV",
      path: "syllables",
      message: "Wave 10 must include syllable.ba.madd_alif.",
      severity: "error",
    });
  }

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 2) {
    emit({
      code: "WAVE10_UNITS",
      path: "units",
      message: "Wave 10 must declare exactly two units.",
      severity: "error",
    });
  }

  const unit1 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE10_FIRST_UNIT_ID));
  const unit2 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE10_FINAL_UNIT_ID));
  if (!unit1 || !unit2) {
    emit({
      code: "WAVE10_UNITS",
      path: "units",
      message: "Wave 10 must include unit.literacy.wave10.madd_alif and unit.literacy.wave10.bab.",
      severity: "error",
    });
    return;
  }

  const unit1Prereqs = asStringArray(unit1["prereqUnitIds"]);
  if (unit1Prereqs[0] !== WAVE9_FINAL_UNIT_ID) {
    emit({
      code: "WAVE10_PREREQ",
      path: `units[id=${WAVE10_FIRST_UNIT_ID}].prereqUnitIds`,
      message: "Wave 10 Unit 1 prerequisite must be unit.literacy.wave9.asal.",
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = asRecord(paths.find((row) => asRecord(row)?.["id"] === WAVE10_PATH_ID));
  if (!path) {
    emit({
      code: "WAVE10_PATH",
      path: "paths",
      message: "Wave 10 must include path.literacy.wave10.",
      severity: "error",
    });
  } else if (asStringArray(path["unitIds"]).join(",") !== WAVE10_UNIT_IDS.join(",")) {
    emit({
      code: "WAVE10_PATH",
      path: "paths[id=path.literacy.wave10].unitIds",
      message: "Wave 10 path must list exactly the two Wave 10 units in order.",
      severity: "error",
    });
  }

  const u1Exercises = asStringArray(unit1["exerciseIds"]);
  const u2Exercises = asStringArray(unit2["exerciseIds"]);
  if (asStringArray(unit1["wordIds"]).length > 0) {
    emit({
      code: "WAVE10_FLOW",
      path: `units[id=${WAVE10_FIRST_UNIT_ID}].wordIds`,
      message: "Wave 10 Unit 1 must have no word target.",
      severity: "error",
    });
  }

  const showBa = u1Exercises[0];
  const showBaa = u1Exercises[1];
  const scoredMadd = u1Exercises[2];
  const showBaEx = showBa ? exercises.get(showBa) : undefined;
  const showBaaEx = showBaa ? exercises.get(showBaa) : undefined;
  const scoredMaddEx = scoredMadd ? exercises.get(scoredMadd) : undefined;
  if (showBaEx?.["type"] !== "presentation" || asRecord(showBaEx["config"])?.["show"] !== "cv") {
    emit({
      code: "WAVE10_FLOW",
      path: `units[id=${WAVE10_FIRST_UNIT_ID}].exerciseIds[0]`,
      message: "Unit 1 must start with an unscored SHOW بَ (show: cv).",
      severity: "error",
    });
  }
  const maddConfig = asRecord(showBaaEx?.["config"]);
  if (
    showBaaEx?.["type"] !== "presentation" ||
    maddConfig?.["show"] !== "chunk" ||
    maddConfig?.["left"] !== "بَ" ||
    maddConfig?.["right"] !== "ا" ||
    maddConfig?.["result"] !== "بَا"
  ) {
    emit({
      code: "WAVE10_FLOW",
      path: `units[id=${WAVE10_FIRST_UNIT_ID}].exerciseIds[1]`,
      message: "Unit 1 second beat must be unscored بَ + ا → بَا (show: chunk).",
      severity: "error",
    });
  }
  if ((showBaEx?.["masteryTargets"] as unknown[] | undefined)?.length) {
    emit({
      code: "WAVE10_PRESENTATION",
      path: `exercises[id=${showBa}]`,
      message: "SHOW بَ must remain unscored.",
      severity: "error",
    });
  }
  if ((showBaaEx?.["masteryTargets"] as unknown[] | undefined)?.length) {
    emit({
      code: "WAVE10_PRESENTATION",
      path: `exercises[id=${showBaa}]`,
      message: "SHOW بَا must remain unscored.",
      severity: "error",
    });
  }
  if (scoredMaddEx?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE10_FLOW",
      path: `units[id=${WAVE10_FIRST_UNIT_ID}].exerciseIds[2]`,
      message: "Unit 1 scored madd evidence must be syllable_blending.",
      severity: "error",
    });
  } else {
    const choices = asStringArray(
      (Array.isArray(scoredMaddEx["choices"]) ? scoredMaddEx["choices"] : []).map(
        (choice) => asRecord(choice)?.["id"],
      ),
    );
    if (
      asRecord(scoredMaddEx["success"])?.["correctChoiceId"] !== "syllable.ba.madd_alif" ||
      !choices.includes("syllable.ba.madd_alif") ||
      !choices.includes("syllable.ba.fatha") ||
      !choices.includes("syllable.mim.fatha")
    ) {
      emit({
        code: "WAVE10_FLOW",
        path: `exercises[id=${scoredMadd}].choices`,
        message: "Scored madd activity must target بَا with foils بَ and مَ.",
        severity: "error",
      });
    }
    const prompt = typeof scoredMaddEx["promptText"] === "string" ? scoredMaddEx["promptText"] : "";
    if (prompt.includes("بَا")) {
      emit({
        code: "WAVE10_FLOW",
        path: `exercises[id=${scoredMadd}].promptText`,
        message: "Scored madd prompt must not leak بَا.",
        severity: "error",
      });
    }
    const targets = Array.isArray(scoredMaddEx["masteryTargets"]) ? scoredMaddEx["masteryTargets"] : [];
    const maddTarget = targets
      .map((row) => asRecord(row))
      .find((row) => row?.["skillId"] === "skill.long_vowel.madd");
    if (!maddTarget || maddTarget["syllableId"] !== "syllable.ba.madd_alif") {
      emit({
        code: "WAVE10_LIVE_KEY",
        path: `exercises[id=${scoredMadd}].masteryTargets`,
        message: "Scored madd evidence must target skill.long_vowel.madd on syllable.ba.madd_alif (letter:ba.madd_alif).",
        severity: "error",
      });
    }
    if (targets.some((row) => asRecord(row)?.["skillId"] === "skill.short_vowel.fatha")) {
      emit({
        code: "WAVE10_LIVE_KEY",
        path: `exercises[id=${scoredMadd}].masteryTargets`,
        message: "Madd evidence must not collide with letter:ba.fatha.",
        severity: "error",
      });
    }
  }

  for (const exercise of exercises.values()) {
    const type = exercise["type"];
    if (type === "sound_to_letter" && asStringArray(exercise["contentIds"]).includes("letter.alif")) {
      emit({
        code: "WAVE10_ALIF",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 10 must not score letter:alif.sound.",
        severity: "error",
      });
    }
    if (type === "letter_recognition") {
      const formTargets = (Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [])
        .map((row) => asRecord(row))
        .filter((row) => row && typeof row["letterForm"] === "string");
      if (formTargets.some((row) => row?.["letterId"] === "letter.alif")) {
        emit({
          code: "WAVE10_FORM",
          path: `exercises[id=${exercise["id"]}]`,
          message: "Wave 10 must not quiz alif positional forms.",
          severity: "error",
        });
      }
      if (formTargets.some((row) => row?.["letterId"] === "letter.ba")) {
        emit({
          code: "WAVE10_FORM",
          path: `exercises[id=${exercise["id"]}]`,
          message: "Wave 10 must not add a new ب positional-form quiz.",
          severity: "error",
        });
      }
    }
    if (type === "missing_haraka") {
      emit({
        code: "WAVE10_SUKUN",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 10 must not add a sukun/haraka discrimination lesson.",
        severity: "error",
      });
    }
  }

  const composeId = u2Exercises[0];
  const audioId = u2Exercises[1];
  const pictureId = u2Exercises.find((id) => exercises.get(id)?.["type"] === "word_to_picture");
  const composeEx = composeId ? exercises.get(composeId) : undefined;
  const audioEx = audioId ? exercises.get(audioId) : undefined;
  const pictureEx = pictureId ? exercises.get(pictureId) : undefined;
  const composeConfig = asRecord(composeEx?.["config"]);
  if (
    composeEx?.["type"] !== "presentation" ||
    composeConfig?.["show"] !== "chunk" ||
    composeConfig?.["left"] !== "بَا" ||
    composeConfig?.["right"] !== "ب" ||
    composeConfig?.["result"] !== "بَاب"
  ) {
    emit({
      code: "WAVE10_FLOW",
      path: `units[id=${WAVE10_FINAL_UNIT_ID}].exerciseIds[0]`,
      message: "Unit 2 must open with unscored بَا + ب → بَاب (show: chunk).",
      severity: "error",
    });
  }
  if ((composeEx?.["masteryTargets"] as unknown[] | undefined)?.length) {
    emit({
      code: "WAVE10_PRESENTATION",
      path: `exercises[id=${composeId}]`,
      message: "بَاب composition chunk must remain unscored.",
      severity: "error",
    });
  }
  if (composeConfig?.["show"] === "word") {
    emit({
      code: "WAVE10_FLOW",
      path: `exercises[id=${composeId}].config.show`,
      message: "First بَاب beat must not be a word presentation.",
      severity: "error",
    });
  }
  if (audioEx?.["type"] !== "audio_to_word") {
    emit({
      code: "WAVE10_FLOW",
      path: `units[id=${WAVE10_FINAL_UNIT_ID}].exerciseIds[1]`,
      message: "First scored بَاب evidence must be audio_to_word.",
      severity: "error",
    });
  } else {
    const success = asRecord(audioEx["success"]);
    const choiceIds = asStringArray(
      (Array.isArray(audioEx["choices"]) ? audioEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    if (success?.["correctChoiceId"] !== "word.bab" || !choiceIds.includes("word.bab")) {
      emit({
        code: "WAVE10_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "audio_to_word choices must include بَاب.",
        severity: "error",
      });
    }
    const foils = choiceIds.filter((id) => id !== "word.bab");
    if (foils.some((id) => !(SAFE_FOIL_WORDS as readonly string[]).includes(id))) {
      emit({
        code: "WAVE10_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "بَاب foils must already be decoded (قَلَم / جَمَل).",
        severity: "error",
      });
    }
  }
  if (pictureId && u2Exercises.indexOf(pictureId) < u2Exercises.indexOf(audioId ?? "")) {
    emit({
      code: "WAVE10_FLOW",
      path: `units[id=${WAVE10_FINAL_UNIT_ID}].exerciseIds`,
      message: "Picture must not be first بَاب evidence.",
      severity: "error",
    });
  }
  if (pictureEx && !asStringArray(pictureEx["tags"]).includes("reinforcement")) {
    emit({
      code: "WAVE10_FLOW",
      path: `exercises[id=${pictureId}].tags`,
      message: "بَاب picture must be reinforcement only.",
      severity: "error",
    });
  }

  const u1Required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
  const u2Required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
  if (u1Required.join(",") !== "skill.long_vowel.madd") {
    emit({
      code: "WAVE10_MASTERY",
      path: `units[id=${WAVE10_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 1 must require exactly skill.long_vowel.madd.",
      severity: "error",
    });
  }
  if (u2Required.join(",") !== "skill.word_decoding.simple") {
    emit({
      code: "WAVE10_MASTERY",
      path: `units[id=${WAVE10_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 2 must require exactly skill.word_decoding.simple.",
      severity: "error",
    });
  }
  if (u1Required.includes("skill.short_vowel.fatha")) {
    emit({
      code: "WAVE10_LIVE_KEY",
      path: `units[id=${WAVE10_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Historical letter:ba.fatha must not satisfy Wave 10 Unit 1.",
      severity: "error",
    });
  }

  for (const [unitId, unit] of [
    [WAVE10_FIRST_UNIT_ID, unit1],
    [WAVE10_FINAL_UNIT_ID, unit2],
  ] as const) {
    const required = asStringArray(asRecord(unit["mastery"])?.["requiredSkillIds"]);
    const mapped = new Set<string>();
    for (const exerciseId of asStringArray(unit["exerciseIds"])) {
      const exercise = exercises.get(exerciseId);
      if (!exercise || asStringArray(exercise["tags"]).includes("reinforcement")) continue;
      if (exercise["type"] === "presentation") continue;
      for (const skillId of skillIdsOnTargets(exercise)) mapped.add(skillId);
    }
    for (const skillId of required) {
      if (!mapped.has(skillId)) {
        emit({
          code: "WAVE10_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave10WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE10_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE10_BAND_A_REF",
        path: "words",
        message: `Wave 10 word "${id}" is not in production Band A.`,
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
          code: "WAVE10_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 10 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE10_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 10 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== source["legacyId"]) {
      emit({
        code: "WAVE10_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `Wave 10 "${id}" legacyId must match Band A.`,
        severity: "error",
      });
    }
    if (source["legacyId"] !== "home-2") {
      emit({
        code: "WAVE10_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: "word.bab must remain Band A home-2.",
        severity: "error",
      });
    }
  }
}
