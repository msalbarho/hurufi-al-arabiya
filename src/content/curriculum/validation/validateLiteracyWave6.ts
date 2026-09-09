/**
 * Deterministic Wave 6 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 6 production bundle.
 * Waves 1–5 stay frozen. ت is the only new letter. No new phonics rule.
 * تَمْر is Band A pause/citation CVCC. دَفْتَر is the first 4-letter decode (length only).
 * تَمْر vs قَمَر is a useful contrast, not a strict phonological pair.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";
import { WAVE1_LETTER_IDS, WAVE1_WORD_IDS } from "./validateLiteracyWave1.ts";
import { WAVE2_LETTER_IDS, WAVE2_WORD_IDS } from "./validateLiteracyWave2.ts";
import { WAVE3_LETTER_IDS, WAVE3_WORD_IDS } from "./validateLiteracyWave3.ts";
import { WAVE4_LETTER_IDS, WAVE4_WORD_IDS } from "./validateLiteracyWave4.ts";
import {
  WAVE5_FINAL_UNIT_ID,
  WAVE5_LETTER_IDS,
  WAVE5_WORD_IDS,
} from "./validateLiteracyWave5.ts";

export const LITERACY_WAVE6_META_ID = "hurufi.production.literacy.wave6";

export const WAVE6_LETTER_IDS = ["letter.ta"] as const;

export const WAVE6_WORD_IDS = ["word.tamr", "word.daftar"] as const;

export const WAVE6_BAND_A_WORD_IDS = ["word.tamr", "word.daftar"] as const;

export const WAVE6_PATH_ID = "path.literacy.wave6";

export const WAVE6_UNIT_IDS = [
  "unit.literacy.wave6.ta",
  "unit.literacy.wave6.tamr",
  "unit.literacy.wave6.daftar",
] as const;

export const WAVE6_FIRST_UNIT_ID = "unit.literacy.wave6.ta";
export const WAVE6_FINAL_UNIT_ID = "unit.literacy.wave6.daftar";

export const WAVE6_EXTERNAL_PREREQ_UNIT_IDS = [WAVE5_FINAL_UNIT_ID] as const;

const FORBIDDEN_LETTERS = [
  "letter.sin",
  "letter.nun",
  "letter.kha",
  "letter.ain",
  "letter.haa",
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
] as const;
const PRIOR_WORD_IDS = [
  ...WAVE1_WORD_IDS,
  ...WAVE2_WORD_IDS,
  ...WAVE3_WORD_IDS,
  ...WAVE4_WORD_IDS,
  ...WAVE5_WORD_IDS,
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
  if ((WAVE5_LETTER_IDS as readonly string[]).includes(id)) return 5;
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

export function isLiteracyWave6Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE6_META_ID;
}

export function validateLiteracyWave6Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE6_META",
        path: "meta.kind",
        message: "Literacy Wave 6 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE6_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 6 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-7") || blob.includes("wave7") || blob.includes("path.literacy.wave7")) {
    emit({
      code: "WAVE6_SCOPE",
      path: "$",
      message: "Wave 6 must not declare a Wave 7 path, route, or CTA.",
      severity: "error",
    });
  }
  if (/minimal pair/i.test(blob)) {
    emit({
      code: "WAVE6_CONTRAST",
      path: "$",
      message: "Do not label تَمْر / قَمَر as a strict minimal pair. Call it a useful contrast.",
      severity: "error",
    });
  }
  if (/word:qamar\.review(?!\.wave6)/.test(blob)) {
    emit({
      code: "WAVE6_REVIEW",
      path: "$",
      message: "Wave 6 must not use generic word:qamar.review as required review evidence. Use word:qamar.review.wave6.",
      severity: "error",
    });
  }
  if (blob.includes("word.bayt") || blob.includes("بَيْت")) {
    emit({
      code: "WAVE6_DIPHTHONG",
      path: "$",
      message: "Wave 6 must not include بَيْت.",
      severity: "error",
    });
  }
  if (
    blob.includes("letter.sin") ||
    blob.includes("letter.nun") ||
    blob.includes("letter.kha") ||
    blob.includes("letter.ain") ||
    blob.includes("letter.haa")
  ) {
    emit({
      code: "WAVE6_LETTER",
      path: "$",
      message: "Wave 6 must not teach س, ن, خ, ع, or ه.",
      severity: "error",
    });
  }

  const recycledLetters = stringSet(PRIOR_LETTER_IDS);
  const newLetters = stringSet(WAVE6_LETTER_IDS);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  const foundNew = new Set<string>();
  letters.forEach((row, i) => {
    const letter = asRecord(row);
    if (!letter || typeof letter["id"] !== "string") return;
    const id = letter["id"];
    if ((FORBIDDEN_LETTERS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE6_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 6 must not teach "${id}".`,
        severity: "error",
      });
    }
    if (newLetters.has(id)) {
      foundNew.add(id);
      if (letter["wave"] !== 6) {
        emit({
          code: "WAVE6_LETTER",
          path: `letters[${i}].wave`,
          message: `Wave 6 letter "${id}" must set wave: 6.`,
          severity: "error",
        });
      }
      if (letter["teachOrder"] !== 1) {
        emit({
          code: "WAVE6_LETTER",
          path: `letters[${i}].teachOrder`,
          message: "Wave 6 teachOrder for ت must be 1.",
          severity: "error",
        });
      }
    } else if (recycledLetters.has(id)) {
      const expected = expectedPriorWave(id);
      if (expected !== undefined && letter["wave"] !== expected) {
        emit({
          code: "WAVE6_LETTER",
          path: `letters[${i}].wave`,
          message: `Recycled letter "${id}" must keep wave: ${expected}.`,
          severity: "error",
        });
      }
    } else {
      emit({
        code: "WAVE6_LETTER",
        path: `letters[${i}].id`,
        message: `Unexpected letter "${id}" in Wave 6. Only new letter is ت.`,
        severity: "error",
      });
    }
    if (typeof letter["legacyId"] !== "string" || letter["legacyId"].length === 0) {
      emit({
        code: "WAVE6_LETTER",
        path: `letters[${i}].legacyId`,
        message: `Wave 6 letter "${id}" must bridge to a prototype legacyId.`,
        severity: "error",
      });
    }
  });
  for (const id of WAVE6_LETTER_IDS) {
    if (!foundNew.has(id)) {
      emit({
        code: "WAVE6_LETTER",
        path: "letters",
        message: `Wave 6 is missing required new letter "${id}".`,
        severity: "error",
      });
    }
  }

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE6_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  words.forEach((row, i) => {
    const word = asRecord(row);
    if (!word || typeof word["id"] !== "string") return;
    const id = word["id"];
    if (!allowedWords.has(id)) {
      emit({
        code: "WAVE6_WORD",
        path: `words[${i}].id`,
        message: `Unexpected word "${id}" in Wave 6.`,
        severity: "error",
      });
    }
    if ((WAVE6_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
    const phonics = asStringArray(word["phonicsSkillIds"]);
    const required = asStringArray(word["requiredSkillIds"]);
    const banned = [...phonics, ...required].filter(
      (skillId) =>
        skillId === "skill.short_vowel.kasra" ||
        skillId === "skill.short_vowel.damma" ||
        FORBIDDEN_SKILL_PREFIXES.some((prefix) => skillId.startsWith(prefix)),
    );
    if ((WAVE6_WORD_IDS as readonly string[]).includes(id) && banned.length > 0) {
      emit({
        code: "WAVE6_PHONICS",
        path: `words[${i}].requiredSkillIds`,
        message: `Wave 6 target "${id}" must not require a new phonics rule (${banned.join(", ")}).`,
        severity: "error",
      });
    }
    const vocalized = typeof word["diacritized"] === "string" ? word["diacritized"] : "";
    if ((WAVE6_WORD_IDS as readonly string[]).includes(id) && /[َ][وي]ْ/.test(vocalized)) {
      emit({
        code: "WAVE6_DIPHTHONG",
        path: `words[${i}].diacritized`,
        message: `Wave 6 target "${id}" must not be a diphthong.`,
        severity: "error",
      });
    }
    if (id === "word.daftar" && asStringArray(word["letterIds"]).length !== 4) {
      emit({
        code: "WAVE6_FOUR_LETTER",
        path: `words[${i}].letterIds`,
        message: "دَفْتَر must remain the first 4-letter target (four consonants; length only).",
        severity: "error",
      });
    }
  });
  for (const id of WAVE6_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE6_WORD",
        path: "words",
        message: `Wave 6 must include Band A word "${id}".`,
        severity: "error",
      });
    }
  }

  const skills = Array.isArray(rec["skills"]) ? rec["skills"] : [];
  skills.forEach((row, i) => {
    const skill = asRecord(row);
    if (!skill || typeof skill["id"] !== "string") return;
    const skillId = skill["id"];
    if (FORBIDDEN_SKILL_PREFIXES.some((prefix) => skillId.startsWith(prefix))) {
      emit({
        code: "WAVE6_PHONICS",
        path: `skills[${i}].id`,
        message: `Wave 6 must not teach deferred phonics skill "${skillId}".`,
        severity: "error",
      });
    }
    if (skillId === "skill.syllable_blending.cvc") {
      emit({
        code: "WAVE6_CHUNK",
        path: `skills[${i}].id`,
        message: "Wave 6 must not add a new closed-chunk skill.",
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
        code: "WAVE6_CHUNK",
        path: `syllables[${i}].pattern`,
        message: "Wave 6 must not add a new closed-chunk syllable.",
        severity: "error",
      });
    }
    if (syllable["vowelSkillId"] === "skill.sukun.basic") {
      emit({
        code: "WAVE6_SUKUN",
        path: `syllables[${i}].vowelSkillId`,
        message: "Wave 6 must not add a new sukun-discrimination syllable.",
        severity: "error",
      });
    }
  });

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const units = recordById(Array.isArray(rec["units"]) ? rec["units"] : []);
  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = paths.map(asRecord).find((row) => row?.["id"] === WAVE6_PATH_ID);
  if (!path) {
    emit({
      code: "WAVE6_PATH",
      path: "paths",
      message: `Wave 6 must declare path "${WAVE6_PATH_ID}".`,
      severity: "error",
    });
  } else {
    const unitIds = asStringArray(path["unitIds"]);
    if (unitIds.length !== 3 || WAVE6_UNIT_IDS.some((id, i) => unitIds[i] !== id)) {
      emit({
        code: "WAVE6_UNITS",
        path: `paths[id=${WAVE6_PATH_ID}].unitIds`,
        message: "Wave 6 must have exactly three units in order: ta → tamr → daftar.",
        severity: "error",
      });
    }
  }

  for (const [exerciseId, exercise] of exercises) {
    if (exercise["type"] === "missing_haraka" || skillIdsOnTargets(exercise).includes("skill.sukun.basic")) {
      emit({
        code: "WAVE6_SUKUN",
        path: `exercises[id=${exerciseId}]`,
        message: "Wave 6 must not add a new sukun-discrimination activity.",
        severity: "error",
      });
    }
    if (exercise["type"] === "syllable_blending" && jsonText(exercise).includes("CVC")) {
      emit({
        code: "WAVE6_CHUNK",
        path: `exercises[id=${exerciseId}]`,
        message: "Wave 6 must not add a new closed-chunk activity.",
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
        code: "WAVE6_PHONICS",
        path: `exercises[id=${exerciseId}].masteryTargets`,
        message: `Wave 6 must not score "${bannedSkills.join(", ")}".`,
        severity: "error",
      });
    }
    if (exercise["type"] === "presentation") {
      if (Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
        emit({
          code: "WAVE6_DEMO",
          path: `exercises[id=${exerciseId}].masteryTargets`,
          message: `Presentation "${exerciseId}" must remain unscored.`,
          severity: "error",
        });
      }
      if (asRecord(exercise["success"])?.["type"] !== "continue") {
        emit({
          code: "WAVE6_DEMO",
          path: `exercises[id=${exerciseId}].success`,
          message: `Presentation "${exerciseId}" must use success type "continue".`,
          severity: "error",
        });
      }
      const config = asRecord(exercise["config"]);
      if (config?.["wordId"] === "word.tamr" || config?.["wordId"] === "word.daftar") {
        emit({
          code: "WAVE6_TEACH_ORDER",
          path: `exercises[id=${exerciseId}].config`,
          message: "Do not SHOW تَمْر or دَفْتَر. LessonPlayer drains presentations first.",
          severity: "error",
        });
      }
      if (config?.["show"] === "chunk") {
        emit({
          code: "WAVE6_CHUNK",
          path: `exercises[id=${exerciseId}].config`,
          message: "Wave 6 must not add a closed-chunk presentation.",
          severity: "error",
        });
      }
    }
  }

  const unit1 = units.get(WAVE6_FIRST_UNIT_ID);
  if (unit1) {
    if (unit1["titleAr"] !== "تَعَلَّمْ حَرْفَ ت") {
      emit({
        code: "WAVE6_CHILD_LANGUAGE",
        path: `units[id=${WAVE6_FIRST_UNIT_ID}].titleAr`,
        message: "Wave 6 Unit 1 title must be تَعَلَّمْ حَرْفَ ت.",
        severity: "error",
      });
    }
    const prereqs = asStringArray(unit1["prereqUnitIds"]);
    if (prereqs[0] !== WAVE5_FINAL_UNIT_ID) {
      emit({
        code: "WAVE6_PREREQ",
        path: `units[id=${WAVE6_FIRST_UNIT_ID}].prereqUnitIds`,
        message: `Wave 6 Unit 1 prerequisite must be "${WAVE5_FINAL_UNIT_ID}".`,
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
    if (!required.includes("skill.letter_sounds.core") || !required.includes("skill.syllable_blending.cv")) {
      emit({
        code: "WAVE6_UNIT1",
        path: `units[id=${WAVE6_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 1 must require ت sound and تَ blending.",
        severity: "error",
      });
    }
    if (
      required.includes("skill.handwriting.isolated") ||
      required.includes("skill.word_decoding.simple") ||
      required.includes("skill.sukun.basic")
    ) {
      emit({
        code: "WAVE6_UNIT1",
        path: `units[id=${WAVE6_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 1 must not require tracing, a word, or new sukun mastery.",
        severity: "error",
      });
    }
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE6_HARAKA_SCOPE",
        path: `units[id=${WAVE6_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Wave 6 must not require kasra/damma mastery.",
        severity: "error",
      });
    }
    if (asStringArray(unit1["wordIds"]).length > 0) {
      emit({
        code: "WAVE6_UNIT1",
        path: `units[id=${WAVE6_FIRST_UNIT_ID}].wordIds`,
        message: "Unit 1 must not introduce a word target.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit1["exerciseIds"]);
    const taShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["show"] === "letter" && config?.["letterId"] === "letter.ta";
    });
    const taFathaShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["show"] === "cv" && config?.["syllableId"] === "syllable.ta.fatha";
    });
    const soundIdx = ids.findIndex((id) => exercises.get(id)?.["type"] === "sound_to_letter");
    const blendIdx = ids.findIndex((id) => exercises.get(id)?.["type"] === "syllable_blending");
    if (!(taShow === 0 && taFathaShow === 1 && soundIdx > taFathaShow && blendIdx > soundIdx)) {
      emit({
        code: "WAVE6_TEACH_ORDER",
        path: `units[id=${WAVE6_FIRST_UNIT_ID}].exerciseIds`,
        message: "Unit 1 order must be ت presentation → تَ presentation → scored ت → scored تَ.",
        severity: "error",
      });
    }
    const soundExercise = exercises.get(ids[soundIdx] ?? "");
    if (soundExercise && !choiceIdsOf(soundExercise).includes("letter.ba")) {
      emit({
        code: "WAVE6_FOIL",
        path: `exercises[id=${soundExercise["id"]}].choices`,
        message: "ت sound choices must include ب as a visual-family foil.",
        severity: "error",
      });
    }
    for (const [index, exerciseId] of ids.entries()) {
      const exercise = exercises.get(exerciseId);
      if (!exercise) continue;
      if (exercise["type"] === "audio_to_word" || exercise["type"] === "word_to_picture" || exercise["type"] === "picture_to_word") {
        emit({
          code: "WAVE6_UNIT1",
          path: `units[id=${WAVE6_FIRST_UNIT_ID}].exerciseIds[${index}]`,
          message: `Unit 1 must not include a word ("${exerciseId}").`,
          severity: "error",
        });
      }
    }
  }

  const unit2 = units.get("unit.literacy.wave6.tamr");
  if (unit2) {
    if (unit2["titleAr"] !== "نَقْرَأُ مَعًا") {
      emit({
        code: "WAVE6_CHILD_LANGUAGE",
        path: "units[id=unit.literacy.wave6.tamr].titleAr",
        message: "Wave 6 Unit 2 title must be نَقْرَأُ مَعًا.",
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
    if (!required.includes("skill.letter_forms.positional") || !required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE6_UNIT2",
        path: "units[id=unit.literacy.wave6.tamr].mastery.requiredSkillIds",
        message: "Unit 2 must require initial تـ and تَمْر decoding.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit2["exerciseIds"]);
    const taInitial = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      const targets = Array.isArray(exercise?.["masteryTargets"]) ? exercise["masteryTargets"] : [];
      const scoresInitial = targets.some((target) => {
        const row = asRecord(target);
        return row?.["letterId"] === "letter.ta" && row?.["letterForm"] === "initial";
      });
      return exercise?.["type"] === "letter_recognition" && (config?.["targetForm"] === "initial" || scoresInitial);
    });
    const tamrShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["wordId"] === "word.tamr";
    });
    const tamrAudio = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return exercise?.["type"] === "audio_to_word" && asRecord(exercise["success"])?.["correctChoiceId"] === "word.tamr";
    });
    const tamrPicture = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return (
        (exercise?.["type"] === "word_to_picture" || exercise?.["type"] === "picture_to_word") &&
        asRecord(exercise["success"])?.["correctChoiceId"] === "word.tamr"
      );
    });
    if (tamrShow >= 0) {
      emit({
        code: "WAVE6_TEACH_ORDER",
        path: "units[id=unit.literacy.wave6.tamr].exerciseIds",
        message: "Do not SHOW تَمْر. LessonPlayer drains presentations first.",
        severity: "error",
      });
    }
    if (taInitial < 0 || tamrAudio < 0 || tamrAudio < taInitial) {
      emit({
        code: "WAVE6_TEACH_ORDER",
        path: "units[id=unit.literacy.wave6.tamr].exerciseIds",
        message: "Initial تـ evidence must occur before any scored تَمْر.",
        severity: "error",
      });
    }
    const tamrExercise = exercises.get(ids[tamrAudio] ?? "");
    if (!tamrExercise || tamrExercise["type"] !== "audio_to_word") {
      emit({
        code: "WAVE6_DECODING_EVIDENCE",
        path: "units[id=unit.literacy.wave6.tamr].exerciseIds",
        message: "First تَمْر evidence must be audio_to_word, not picture.",
        severity: "error",
      });
    } else {
      const choiceIds = choiceIdsOf(tamrExercise);
      if (!choiceIds.includes("word.tamr") || !choiceIds.includes("word.qamar")) {
        emit({
          code: "WAVE6_FOIL",
          path: `exercises[id=${tamrExercise["id"]}].choices`,
          message: "تَمْر decode must include تَمْر and قَمَر as a useful contrast.",
          severity: "error",
        });
      }
    }
    if (tamrPicture >= 0 && tamrAudio >= 0 && tamrPicture < tamrAudio) {
      emit({
        code: "WAVE6_DECODING_EVIDENCE",
        path: "units[id=unit.literacy.wave6.tamr].exerciseIds",
        message: "تَمْر picture may appear only after decoding.",
        severity: "error",
      });
    }
    if (tamrPicture >= 0) {
      const picture = exercises.get(ids[tamrPicture] ?? "");
      if (picture && !asStringArray(picture["tags"]).includes("reinforcement")) {
        emit({
          code: "WAVE6_DECODING_EVIDENCE",
          path: `exercises[id=${picture["id"]}].tags`,
          message: "تَمْر picture must be tagged reinforcement.",
          severity: "error",
        });
      }
    }
  }

  const unit3 = units.get(WAVE6_FINAL_UNIT_ID);
  if (unit3) {
    if (unit3["titleAr"] !== "اِقْرَأْ كَلِمَاتِي") {
      emit({
        code: "WAVE6_CHILD_LANGUAGE",
        path: `units[id=${WAVE6_FINAL_UNIT_ID}].titleAr`,
        message: "Wave 6 Unit 3 title must be اِقْرَأْ كَلِمَاتِي.",
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit3["mastery"])?.["requiredSkillIds"]);
    if (!required.includes("skill.letter_forms.positional") || !required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE6_UNIT3",
        path: `units[id=${WAVE6_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 3 must require medial ـتـ, دَفْتَر decoding, and قَمَر review.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit3["exerciseIds"]);
    const taMedial = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      const targets = Array.isArray(exercise?.["masteryTargets"]) ? exercise["masteryTargets"] : [];
      const scoresMedial = targets.some((target) => {
        const row = asRecord(target);
        return row?.["letterId"] === "letter.ta" && row?.["letterForm"] === "medial";
      });
      return exercise?.["type"] === "letter_recognition" && (config?.["targetForm"] === "medial" || scoresMedial);
    });
    const daftarShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["wordId"] === "word.daftar";
    });
    const daftarAudio = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return exercise?.["type"] === "audio_to_word" && asRecord(exercise["success"])?.["correctChoiceId"] === "word.daftar";
    });
    const qamarReview = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return (
        exercise?.["type"] === "audio_to_word" &&
        asRecord(exercise["success"])?.["correctChoiceId"] === "word.qamar" &&
        asStringArray(exercise["tags"]).includes("review")
      );
    });
    const qamarReviewExercise = exercises.get(ids[qamarReview] ?? "");
    const qamarReviewTags = qamarReviewExercise ? asStringArray(qamarReviewExercise["tags"]) : [];
    if (qamarReview >= 0 && !qamarReviewTags.includes("review-wave6")) {
      emit({
        code: "WAVE6_REVIEW",
        path: `exercises[id=${qamarReviewExercise?.["id"]}].tags`,
        message: "Wave 6 compact قَمَر review must use scoped evidence word:qamar.review.wave6 (tag review-wave6), not generic word:qamar.review.",
        severity: "error",
      });
    }
    const daftarPicture = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return (
        (exercise?.["type"] === "word_to_picture" || exercise?.["type"] === "picture_to_word") &&
        asRecord(exercise["success"])?.["correctChoiceId"] === "word.daftar"
      );
    });
    if (daftarShow >= 0) {
      emit({
        code: "WAVE6_TEACH_ORDER",
        path: `units[id=${WAVE6_FINAL_UNIT_ID}].exerciseIds`,
        message: "Do not SHOW دَفْتَر. LessonPlayer drains presentations first.",
        severity: "error",
      });
    }
    if (taMedial < 0 || daftarAudio < 0 || daftarAudio < taMedial) {
      emit({
        code: "WAVE6_TEACH_ORDER",
        path: `units[id=${WAVE6_FINAL_UNIT_ID}].exerciseIds`,
        message: "Medial ـتـ evidence must occur before any scored دَفْتَر.",
        severity: "error",
      });
    }
    const daftarExercise = exercises.get(ids[daftarAudio] ?? "");
    if (!daftarExercise || daftarExercise["type"] !== "audio_to_word") {
      emit({
        code: "WAVE6_DECODING_EVIDENCE",
        path: `units[id=${WAVE6_FINAL_UNIT_ID}].exerciseIds`,
        message: "First دَفْتَر evidence must be audio_to_word, not picture.",
        severity: "error",
      });
    } else {
      const choiceIds = choiceIdsOf(daftarExercise);
      if (!choiceIds.includes("word.daftar") || !choiceIds.includes("word.qalam")) {
        emit({
          code: "WAVE6_FOIL",
          path: `exercises[id=${daftarExercise["id"]}].choices`,
          message: "دَفْتَر decode must include دَفْتَر and قَلَم.",
          severity: "error",
        });
      }
    }
    if (qamarReview < 0) {
      emit({
        code: "WAVE6_REVIEW",
        path: `units[id=${WAVE6_FINAL_UNIT_ID}].exerciseIds`,
        message: "Unit 3 must include compact قَمَر review tagged review + review-wave6 (word:qamar.review.wave6).",
        severity: "error",
      });
    }
    if (daftarPicture >= 0 && daftarAudio >= 0 && daftarPicture < daftarAudio) {
      emit({
        code: "WAVE6_DECODING_EVIDENCE",
        path: `units[id=${WAVE6_FINAL_UNIT_ID}].exerciseIds`,
        message: "دَفْتَر picture may appear only after decoding.",
        severity: "error",
      });
    }
    if (daftarPicture >= 0) {
      const picture = exercises.get(ids[daftarPicture] ?? "");
      if (picture && !asStringArray(picture["tags"]).includes("reinforcement")) {
        emit({
          code: "WAVE6_DECODING_EVIDENCE",
          path: `exercises[id=${picture["id"]}].tags`,
          message: "دَفْتَر picture must be tagged reinforcement.",
          severity: "error",
        });
      }
    }
  }

  for (const unitId of WAVE6_UNIT_IDS) {
    const unit = units.get(unitId);
    if (!unit) {
      emit({
        code: "WAVE6_UNITS",
        path: "units",
        message: `Wave 6 is missing unit "${unitId}".`,
        severity: "error",
      });
      continue;
    }
    const required = asStringArray(asRecord(unit["mastery"])?.["requiredSkillIds"]);
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE6_HARAKA_SCOPE",
        path: `units[id=${unitId}].mastery.requiredSkillIds`,
        message: "Wave 6 must not require kasra/damma mastery.",
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
          code: "WAVE6_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave6WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE6_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE6_BAND_A_REF",
        path: "words",
        message: `Wave 6 word "${id}" is not in production Band A.`,
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
          code: "WAVE6_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 6 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE6_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 6 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== source["legacyId"]) {
      emit({
        code: "WAVE6_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `Wave 6 "${id}" legacyId must match Band A.`,
        severity: "error",
      });
    }
  }
}
