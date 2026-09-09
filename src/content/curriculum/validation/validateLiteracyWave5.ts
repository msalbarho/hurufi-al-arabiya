/**
 * Deterministic Wave 5 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 5 production bundle.
 * Waves 1–4 stay frozen. ك is the only new letter. No new phonics rule.
 * كَلْب / بَحْر are Band A pause/citation CVCC words. Sukun is reused, not re-taught.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";
import { WAVE1_LETTER_IDS, WAVE1_WORD_IDS } from "./validateLiteracyWave1.ts";
import { WAVE2_LETTER_IDS, WAVE2_WORD_IDS } from "./validateLiteracyWave2.ts";
import { WAVE3_LETTER_IDS, WAVE3_WORD_IDS } from "./validateLiteracyWave3.ts";
import {
  WAVE4_FINAL_UNIT_ID,
  WAVE4_WORD_IDS,
} from "./validateLiteracyWave4.ts";

export const LITERACY_WAVE5_META_ID = "hurufi.production.literacy.wave5";

export const WAVE5_LETTER_IDS = ["letter.kaf"] as const;

export const WAVE5_WORD_IDS = ["word.kalb", "word.bahr"] as const;

export const WAVE5_BAND_A_WORD_IDS = ["word.kalb", "word.bahr"] as const;

export const WAVE5_PATH_ID = "path.literacy.wave5";

export const WAVE5_UNIT_IDS = [
  "unit.literacy.wave5.kaf",
  "unit.literacy.wave5.kalb",
  "unit.literacy.wave5.bahr",
] as const;

export const WAVE5_FIRST_UNIT_ID = "unit.literacy.wave5.kaf";
export const WAVE5_FINAL_UNIT_ID = "unit.literacy.wave5.bahr";

export const WAVE5_EXTERNAL_PREREQ_UNIT_IDS = [WAVE4_FINAL_UNIT_ID] as const;

const FORBIDDEN_LETTERS = ["letter.nun", "letter.kha"] as const;

const FORBIDDEN_SKILL_PREFIXES = [
  "skill.shadda.",
  "skill.tanween.",
  "skill.hamza.",
  "skill.long_vowel.",
  "skill.taa_marbuta.",
  "skill.alif_maqsura.",
] as const;

const PRIOR_LETTER_IDS = [...WAVE1_LETTER_IDS, ...WAVE2_LETTER_IDS, ...WAVE3_LETTER_IDS] as const;
const PRIOR_WORD_IDS = [...WAVE1_WORD_IDS, ...WAVE2_WORD_IDS, ...WAVE3_WORD_IDS, ...WAVE4_WORD_IDS] as const;

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

export function isLiteracyWave5Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE5_META_ID;
}

export function validateLiteracyWave5Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE5_META",
        path: "meta.kind",
        message: "Literacy Wave 5 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE5_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 5 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-6") || blob.includes("wave6") || blob.includes("path.literacy.wave6")) {
    emit({
      code: "WAVE5_SCOPE",
      path: "$",
      message: "Wave 5 must not declare a Wave 6 path, route, or CTA.",
      severity: "error",
    });
  }
  if (blob.includes("letter.nun") || blob.includes("letter.kha")) {
    emit({
      code: "WAVE5_LETTER",
      path: "$",
      message: "Wave 5 must not teach ن or خ.",
      severity: "error",
    });
  }

  const recycledLetters = stringSet(PRIOR_LETTER_IDS);
  const newLetters = stringSet(WAVE5_LETTER_IDS);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  const foundNew = new Set<string>();
  letters.forEach((row, i) => {
    const letter = asRecord(row);
    if (!letter || typeof letter["id"] !== "string") return;
    const id = letter["id"];
    if ((FORBIDDEN_LETTERS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE5_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 5 must not teach "${id}".`,
        severity: "error",
      });
    }
    if (newLetters.has(id)) {
      foundNew.add(id);
      if (letter["wave"] !== 5) {
        emit({
          code: "WAVE5_LETTER",
          path: `letters[${i}].wave`,
          message: `Wave 5 letter "${id}" must set wave: 5.`,
          severity: "error",
        });
      }
      if (letter["teachOrder"] !== 1) {
        emit({
          code: "WAVE5_LETTER",
          path: `letters[${i}].teachOrder`,
          message: "Wave 5 teachOrder for ك must be 1.",
          severity: "error",
        });
      }
    } else if (recycledLetters.has(id)) {
      const expected = expectedPriorWave(id);
      if (expected !== undefined && letter["wave"] !== expected) {
        emit({
          code: "WAVE5_LETTER",
          path: `letters[${i}].wave`,
          message: `Recycled letter "${id}" must keep wave: ${expected}.`,
          severity: "error",
        });
      }
    } else {
      emit({
        code: "WAVE5_LETTER",
        path: `letters[${i}].id`,
        message: `Unexpected letter "${id}" in Wave 5. Only new letter is ك.`,
        severity: "error",
      });
    }
    if (typeof letter["legacyId"] !== "string" || letter["legacyId"].length === 0) {
      emit({
        code: "WAVE5_LETTER",
        path: `letters[${i}].legacyId`,
        message: `Wave 5 letter "${id}" must bridge to a prototype legacyId.`,
        severity: "error",
      });
    }
  });
  for (const id of WAVE5_LETTER_IDS) {
    if (!foundNew.has(id)) {
      emit({
        code: "WAVE5_LETTER",
        path: "letters",
        message: `Wave 5 is missing required new letter "${id}".`,
        severity: "error",
      });
    }
  }

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE5_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  words.forEach((row, i) => {
    const word = asRecord(row);
    if (!word || typeof word["id"] !== "string") return;
    const id = word["id"];
    if (!allowedWords.has(id)) {
      emit({
        code: "WAVE5_WORD",
        path: `words[${i}].id`,
        message: `Unexpected word "${id}" in Wave 5.`,
        severity: "error",
      });
    }
    if ((WAVE5_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
    const phonics = asStringArray(word["phonicsSkillIds"]);
    const required = asStringArray(word["requiredSkillIds"]);
    const banned = [...phonics, ...required].filter(
      (skillId) =>
        skillId === "skill.short_vowel.kasra" ||
        skillId === "skill.short_vowel.damma" ||
        FORBIDDEN_SKILL_PREFIXES.some((prefix) => skillId.startsWith(prefix)),
    );
    if ((WAVE5_WORD_IDS as readonly string[]).includes(id) && banned.length > 0) {
      emit({
        code: "WAVE5_PHONICS",
        path: `words[${i}].requiredSkillIds`,
        message: `Wave 5 target "${id}" must not require a new phonics rule (${banned.join(", ")}).`,
        severity: "error",
      });
    }
  });
  for (const id of WAVE5_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE5_WORD",
        path: "words",
        message: `Wave 5 must include Band A word "${id}".`,
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
        code: "WAVE5_PHONICS",
        path: `skills[${i}].id`,
        message: `Wave 5 must not teach deferred phonics skill "${skillId}".`,
        severity: "error",
      });
    }
    if (skillId === "skill.syllable_blending.cvc") {
      emit({
        code: "WAVE5_CHUNK",
        path: `skills[${i}].id`,
        message: "Wave 5 must not add a new closed-chunk skill.",
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
        code: "WAVE5_CHUNK",
        path: `syllables[${i}].pattern`,
        message: "Wave 5 must not add a new closed-chunk syllable.",
        severity: "error",
      });
    }
    if (syllable["vowelSkillId"] === "skill.sukun.basic") {
      emit({
        code: "WAVE5_SUKUN",
        path: `syllables[${i}].vowelSkillId`,
        message: "Wave 5 must not add a new sukun-discrimination syllable.",
        severity: "error",
      });
    }
  });

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const units = recordById(Array.isArray(rec["units"]) ? rec["units"] : []);
  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = paths.map(asRecord).find((row) => row?.["id"] === WAVE5_PATH_ID);
  if (!path) {
    emit({
      code: "WAVE5_PATH",
      path: "paths",
      message: `Wave 5 must declare path "${WAVE5_PATH_ID}".`,
      severity: "error",
    });
  } else {
    const unitIds = asStringArray(path["unitIds"]);
    if (unitIds.length !== 3 || WAVE5_UNIT_IDS.some((id, i) => unitIds[i] !== id)) {
      emit({
        code: "WAVE5_UNITS",
        path: `paths[id=${WAVE5_PATH_ID}].unitIds`,
        message: "Wave 5 must have exactly three units in order: kaf → kalb → bahr.",
        severity: "error",
      });
    }
  }

  for (const [exerciseId, exercise] of exercises) {
    if (exercise["type"] === "missing_haraka" || skillIdsOnTargets(exercise).includes("skill.sukun.basic")) {
      emit({
        code: "WAVE5_SUKUN",
        path: `exercises[id=${exerciseId}]`,
        message: "Wave 5 must not add a new sukun-discrimination activity.",
        severity: "error",
      });
    }
    if (exercise["type"] === "syllable_blending" && jsonText(exercise).includes("CVC")) {
      emit({
        code: "WAVE5_CHUNK",
        path: `exercises[id=${exerciseId}]`,
        message: "Wave 5 must not add a new closed-chunk activity.",
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
        code: "WAVE5_PHONICS",
        path: `exercises[id=${exerciseId}].masteryTargets`,
        message: `Wave 5 must not score "${bannedSkills.join(", ")}".`,
        severity: "error",
      });
    }
    if (exercise["type"] === "presentation") {
      if (Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
        emit({
          code: "WAVE5_DEMO",
          path: `exercises[id=${exerciseId}].masteryTargets`,
          message: `Presentation "${exerciseId}" must remain unscored.`,
          severity: "error",
        });
      }
      if (asRecord(exercise["success"])?.["type"] !== "continue") {
        emit({
          code: "WAVE5_DEMO",
          path: `exercises[id=${exerciseId}].success`,
          message: `Presentation "${exerciseId}" must use success type "continue".`,
          severity: "error",
        });
      }
      const config = asRecord(exercise["config"]);
      if (config?.["wordId"] === "word.kalb" || config?.["wordId"] === "word.bahr") {
        emit({
          code: "WAVE5_TEACH_ORDER",
          path: `exercises[id=${exerciseId}].config`,
          message: "Do not SHOW كَلْب or بَحْر. LessonPlayer drains presentations first.",
          severity: "error",
        });
      }
      if (config?.["show"] === "chunk") {
        emit({
          code: "WAVE5_CHUNK",
          path: `exercises[id=${exerciseId}].config`,
          message: "Wave 5 must not add a closed-chunk presentation.",
          severity: "error",
        });
      }
    }
  }

  const unit1 = units.get(WAVE5_FIRST_UNIT_ID);
  if (unit1) {
    if (unit1["titleAr"] !== "تَعَلَّمْ حَرْفَ ك") {
      emit({
        code: "WAVE5_CHILD_LANGUAGE",
        path: `units[id=${WAVE5_FIRST_UNIT_ID}].titleAr`,
        message: "Wave 5 Unit 1 title must be تَعَلَّمْ حَرْفَ ك.",
        severity: "error",
      });
    }
    const prereqs = asStringArray(unit1["prereqUnitIds"]);
    if (prereqs[0] !== WAVE4_FINAL_UNIT_ID) {
      emit({
        code: "WAVE5_PREREQ",
        path: `units[id=${WAVE5_FIRST_UNIT_ID}].prereqUnitIds`,
        message: `Wave 5 Unit 1 prerequisite must be "${WAVE4_FINAL_UNIT_ID}".`,
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
    if (
      !required.includes("skill.letter_sounds.core") ||
      !required.includes("skill.syllable_blending.cv")
    ) {
      emit({
        code: "WAVE5_UNIT1",
        path: `units[id=${WAVE5_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 1 must require ك sound and كَ blending.",
        severity: "error",
      });
    }
    if (
      required.includes("skill.handwriting.isolated") ||
      required.includes("skill.word_decoding.simple") ||
      required.includes("skill.sukun.basic")
    ) {
      emit({
        code: "WAVE5_UNIT1",
        path: `units[id=${WAVE5_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 1 must not require tracing, a word, or new sukun mastery.",
        severity: "error",
      });
    }
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE5_HARAKA_SCOPE",
        path: `units[id=${WAVE5_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Wave 5 must not require kasra/damma mastery.",
        severity: "error",
      });
    }
    if (asStringArray(unit1["wordIds"]).length > 0) {
      emit({
        code: "WAVE5_UNIT1",
        path: `units[id=${WAVE5_FIRST_UNIT_ID}].wordIds`,
        message: "Unit 1 must not introduce a word target.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit1["exerciseIds"]);
    const kafShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["show"] === "letter" && config?.["letterId"] === "letter.kaf";
    });
    const kafFathaShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["show"] === "cv" && config?.["syllableId"] === "syllable.kaf.fatha";
    });
    const soundIdx = ids.findIndex((id) => exercises.get(id)?.["type"] === "sound_to_letter");
    const blendIdx = ids.findIndex((id) => exercises.get(id)?.["type"] === "syllable_blending");
    if (!(kafShow === 0 && kafFathaShow === 1 && soundIdx > kafFathaShow && blendIdx > soundIdx)) {
      emit({
        code: "WAVE5_TEACH_ORDER",
        path: `units[id=${WAVE5_FIRST_UNIT_ID}].exerciseIds`,
        message: "Unit 1 order must be ك presentation → كَ presentation → scored ك → scored كَ.",
        severity: "error",
      });
    }
    for (const [index, exerciseId] of ids.entries()) {
      const exercise = exercises.get(exerciseId);
      if (!exercise) continue;
      if (exercise["type"] === "audio_to_word" || exercise["type"] === "word_to_picture" || exercise["type"] === "picture_to_word") {
        emit({
          code: "WAVE5_UNIT1",
          path: `units[id=${WAVE5_FIRST_UNIT_ID}].exerciseIds[${index}]`,
          message: `Unit 1 must not include a word ("${exerciseId}").`,
          severity: "error",
        });
      }
    }
  }

  const unit2 = units.get("unit.literacy.wave5.kalb");
  if (unit2) {
    if (unit2["titleAr"] !== "نَقْرَأُ مَعًا") {
      emit({
        code: "WAVE5_CHILD_LANGUAGE",
        path: "units[id=unit.literacy.wave5.kalb].titleAr",
        message: "Wave 5 Unit 2 title must be نَقْرَأُ مَعًا.",
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
    if (!required.includes("skill.letter_forms.positional") || !required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE5_UNIT2",
        path: "units[id=unit.literacy.wave5.kalb].mastery.requiredSkillIds",
        message: "Unit 2 must require initial كـ and كَلْب decoding.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit2["exerciseIds"]);
    const kafInitial = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      const targets = Array.isArray(exercise?.["masteryTargets"]) ? exercise["masteryTargets"] : [];
      const scoresInitial = targets.some((target) => {
        const row = asRecord(target);
        return row?.["letterId"] === "letter.kaf" && row?.["letterForm"] === "initial";
      });
      return exercise?.["type"] === "letter_recognition" && (config?.["targetForm"] === "initial" || scoresInitial);
    });
    const kalbShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["wordId"] === "word.kalb";
    });
    const kalbAudio = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return exercise?.["type"] === "audio_to_word" && asRecord(exercise["success"])?.["correctChoiceId"] === "word.kalb";
    });
    const kalbPicture = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return (
        (exercise?.["type"] === "word_to_picture" || exercise?.["type"] === "picture_to_word") &&
        asRecord(exercise["success"])?.["correctChoiceId"] === "word.kalb"
      );
    });
    if (kalbShow >= 0) {
      emit({
        code: "WAVE5_TEACH_ORDER",
        path: "units[id=unit.literacy.wave5.kalb].exerciseIds",
        message: "Do not SHOW كَلْب. LessonPlayer drains presentations first.",
        severity: "error",
      });
    }
    if (kafInitial < 0 || kalbAudio < 0 || kalbAudio < kafInitial) {
      emit({
        code: "WAVE5_TEACH_ORDER",
        path: "units[id=unit.literacy.wave5.kalb].exerciseIds",
        message: "Initial كـ evidence must occur before any scored كَلْب.",
        severity: "error",
      });
    }
    const kalbExercise = exercises.get(ids[kalbAudio] ?? "");
    if (!kalbExercise || kalbExercise["type"] !== "audio_to_word") {
      emit({
        code: "WAVE5_DECODING_EVIDENCE",
        path: "units[id=unit.literacy.wave5.kalb].exerciseIds",
        message: "First كَلْب evidence must be audio_to_word, not picture.",
        severity: "error",
      });
    } else {
      const choiceIds = choiceIdsOf(kalbExercise);
      if (!choiceIds.includes("word.kalb") || !choiceIds.includes("word.qalb")) {
        emit({
          code: "WAVE5_FOIL",
          path: `exercises[id=${kalbExercise["id"]}].choices`,
          message: "كَلْب decode must include كَلْب and قَلْب.",
          severity: "error",
        });
      }
    }
    if (kalbPicture >= 0 && kalbAudio >= 0 && kalbPicture < kalbAudio) {
      emit({
        code: "WAVE5_DECODING_EVIDENCE",
        path: "units[id=unit.literacy.wave5.kalb].exerciseIds",
        message: "كَلْب picture may appear only after decoding.",
        severity: "error",
      });
    }
    if (kalbPicture >= 0) {
      const picture = exercises.get(ids[kalbPicture] ?? "");
      if (picture && !asStringArray(picture["tags"]).includes("reinforcement")) {
        emit({
          code: "WAVE5_DECODING_EVIDENCE",
          path: `exercises[id=${picture["id"]}].tags`,
          message: "كَلْب picture must be tagged reinforcement.",
          severity: "error",
        });
      }
    }
  }

  const unit3 = units.get(WAVE5_FINAL_UNIT_ID);
  if (unit3) {
    if (unit3["titleAr"] !== "اِقْرَأْ كَلِمَاتِي") {
      emit({
        code: "WAVE5_CHILD_LANGUAGE",
        path: `units[id=${WAVE5_FINAL_UNIT_ID}].titleAr`,
        message: "Wave 5 Unit 3 title must be اِقْرَأْ كَلِمَاتِي.",
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit3["mastery"])?.["requiredSkillIds"]);
    if (!required.includes("skill.letter_forms.positional") || !required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE5_UNIT3",
        path: `units[id=${WAVE5_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Unit 3 must require initial بـ, بَحْر decoding, and قَلْب review.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit3["exerciseIds"]);
    const baInitial = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      const targets = Array.isArray(exercise?.["masteryTargets"]) ? exercise["masteryTargets"] : [];
      const scoresInitial = targets.some((target) => {
        const row = asRecord(target);
        return row?.["letterId"] === "letter.ba" && row?.["letterForm"] === "initial";
      });
      return exercise?.["type"] === "letter_recognition" && (config?.["targetForm"] === "initial" || scoresInitial);
    });
    const bahrShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["wordId"] === "word.bahr";
    });
    const bahrAudio = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return exercise?.["type"] === "audio_to_word" && asRecord(exercise["success"])?.["correctChoiceId"] === "word.bahr";
    });
    const qalbReview = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return (
        exercise?.["type"] === "audio_to_word" &&
        asRecord(exercise["success"])?.["correctChoiceId"] === "word.qalb" &&
        asStringArray(exercise["tags"]).includes("review")
      );
    });
    const bahrPicture = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return (
        (exercise?.["type"] === "word_to_picture" || exercise?.["type"] === "picture_to_word") &&
        asRecord(exercise["success"])?.["correctChoiceId"] === "word.bahr"
      );
    });
    if (bahrShow >= 0) {
      emit({
        code: "WAVE5_TEACH_ORDER",
        path: `units[id=${WAVE5_FINAL_UNIT_ID}].exerciseIds`,
        message: "Do not SHOW بَحْر. LessonPlayer drains presentations first.",
        severity: "error",
      });
    }
    if (baInitial < 0 || bahrAudio < 0 || bahrAudio < baInitial) {
      emit({
        code: "WAVE5_TEACH_ORDER",
        path: `units[id=${WAVE5_FINAL_UNIT_ID}].exerciseIds`,
        message: "Initial بـ evidence must occur before any scored بَحْر.",
        severity: "error",
      });
    }
    const bahrExercise = exercises.get(ids[bahrAudio] ?? "");
    if (!bahrExercise || bahrExercise["type"] !== "audio_to_word") {
      emit({
        code: "WAVE5_DECODING_EVIDENCE",
        path: `units[id=${WAVE5_FINAL_UNIT_ID}].exerciseIds`,
        message: "First بَحْر evidence must be audio_to_word, not picture.",
        severity: "error",
      });
    }
    if (qalbReview < 0) {
      emit({
        code: "WAVE5_REVIEW",
        path: `units[id=${WAVE5_FINAL_UNIT_ID}].exerciseIds`,
        message: "Unit 3 must include compact قَلْب review tagged review (word:qalb.review).",
        severity: "error",
      });
    }
    if (bahrPicture >= 0 && bahrAudio >= 0 && bahrPicture < bahrAudio) {
      emit({
        code: "WAVE5_DECODING_EVIDENCE",
        path: `units[id=${WAVE5_FINAL_UNIT_ID}].exerciseIds`,
        message: "بَحْر picture may appear only after decoding.",
        severity: "error",
      });
    }
    if (bahrPicture >= 0) {
      const picture = exercises.get(ids[bahrPicture] ?? "");
      if (picture && !asStringArray(picture["tags"]).includes("reinforcement")) {
        emit({
          code: "WAVE5_DECODING_EVIDENCE",
          path: `exercises[id=${picture["id"]}].tags`,
          message: "بَحْر picture must be tagged reinforcement.",
          severity: "error",
        });
      }
    }
  }

  for (const unitId of WAVE5_UNIT_IDS) {
    const unit = units.get(unitId);
    if (!unit) {
      emit({
        code: "WAVE5_UNITS",
        path: "units",
        message: `Wave 5 is missing unit "${unitId}".`,
        severity: "error",
      });
      continue;
    }
    const required = asStringArray(asRecord(unit["mastery"])?.["requiredSkillIds"]);
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE5_HARAKA_SCOPE",
        path: `units[id=${unitId}].mastery.requiredSkillIds`,
        message: "Wave 5 must not require kasra/damma mastery.",
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
          code: "WAVE5_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave5WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE5_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE5_BAND_A_REF",
        path: "words",
        message: `Wave 5 word "${id}" is not in production Band A.`,
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
          code: "WAVE5_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 5 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE5_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 5 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== source["legacyId"]) {
      emit({
        code: "WAVE5_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `Wave 5 "${id}" legacyId must match Band A.`,
        severity: "error",
      });
    }
  }
}
