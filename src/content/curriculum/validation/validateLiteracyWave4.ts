/**
 * Deterministic Wave 4 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 4 production bundle.
 * Waves 1–3 stay frozen. Sukun is the only new phonics rule.
 * رَمْ is a non-lexical closed chunk. رَمْل / قَلْب are Band A pause/citation words.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";
import { WAVE1_LETTER_IDS, WAVE1_WORD_IDS } from "./validateLiteracyWave1.ts";
import { WAVE2_LETTER_IDS, WAVE2_WORD_IDS } from "./validateLiteracyWave2.ts";
import {
  WAVE3_FINAL_UNIT_ID,
  WAVE3_LETTER_IDS,
  WAVE3_WORD_IDS,
} from "./validateLiteracyWave3.ts";

export const LITERACY_WAVE4_META_ID = "hurufi.production.literacy.wave4";

export const WAVE4_LETTER_IDS = [] as const;

export const WAVE4_WORD_IDS = ["word.raml", "word.qalb"] as const;

export const WAVE4_BAND_A_WORD_IDS = ["word.raml", "word.qalb"] as const;

export const WAVE4_PATH_ID = "path.literacy.wave4";

export const WAVE4_UNIT_IDS = [
  "unit.literacy.wave4.sukun",
  "unit.literacy.wave4.raml",
  "unit.literacy.wave4.qalb",
] as const;

export const WAVE4_FIRST_UNIT_ID = "unit.literacy.wave4.sukun";
export const WAVE4_FINAL_UNIT_ID = "unit.literacy.wave4.qalb";

export const WAVE4_EXTERNAL_PREREQ_UNIT_IDS = [WAVE3_FINAL_UNIT_ID] as const;

const FORBIDDEN_LETTERS = ["letter.kha", "letter.nun"] as const;

const FORBIDDEN_SKILL_PREFIXES = [
  "skill.shadda.",
  "skill.tanween.",
  "skill.hamza.",
  "skill.long_vowel.",
  "skill.taa_marbuta.",
  "skill.alif_maqsura.",
] as const;

const PRIOR_LETTER_IDS = [...WAVE1_LETTER_IDS, ...WAVE2_LETTER_IDS, ...WAVE3_LETTER_IDS] as const;
const PRIOR_WORD_IDS = [...WAVE1_WORD_IDS, ...WAVE2_WORD_IDS, ...WAVE3_WORD_IDS] as const;

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

function exerciseMentions(exercise: Record<string, unknown>, id: string): boolean {
  if (jsonText(exercise).includes(`"${id}"`)) return true;
  return asStringArray(exercise["contentIds"]).includes(id);
}

export function isLiteracyWave4Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE4_META_ID;
}

export function validateLiteracyWave4Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE4_META",
        path: "meta.kind",
        message: "Literacy Wave 4 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE4_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 4 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-5") || blob.includes("wave5") || blob.includes("path.literacy.wave5")) {
    emit({
      code: "WAVE4_SCOPE",
      path: "$",
      message: "Wave 4 must not declare a Wave 5 path, route, or CTA.",
      severity: "error",
    });
  }

  const recycledLetters = stringSet(PRIOR_LETTER_IDS);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  letters.forEach((row, i) => {
    const letter = asRecord(row);
    if (!letter || typeof letter["id"] !== "string") return;
    const id = letter["id"];
    if ((FORBIDDEN_LETTERS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE4_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 4 must not teach "${id}".`,
        severity: "error",
      });
    }
    if (!recycledLetters.has(id)) {
      emit({
        code: "WAVE4_LETTER",
        path: `letters[${i}].id`,
        message: `Unexpected letter "${id}" in Wave 4. No new letters.`,
        severity: "error",
      });
    }
  });

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE4_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  words.forEach((row, i) => {
    const word = asRecord(row);
    if (!word || typeof word["id"] !== "string") return;
    const id = word["id"];
    if (!allowedWords.has(id)) {
      emit({
        code: "WAVE4_WORD",
        path: `words[${i}].id`,
        message: `Unexpected word "${id}" in Wave 4.`,
        severity: "error",
      });
    }
    if ((WAVE4_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
  });
  for (const id of WAVE4_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE4_WORD",
        path: "words",
        message: `Wave 4 must include Band A word "${id}".`,
        severity: "error",
      });
    }
  }

  const skills = Array.isArray(rec["skills"]) ? rec["skills"] : [];
  let sawSukun = false;
  skills.forEach((row, i) => {
    const skill = asRecord(row);
    if (!skill || typeof skill["id"] !== "string") return;
    const skillId = skill["id"];
    if (skillId === "skill.sukun.basic") sawSukun = true;
    if (FORBIDDEN_SKILL_PREFIXES.some((prefix) => skillId.startsWith(prefix))) {
      emit({
        code: "WAVE4_PHONICS",
        path: `skills[${i}].id`,
        message: `Wave 4 must not teach deferred phonics skill "${skillId}".`,
        severity: "error",
      });
    }
  });
  if (!sawSukun) {
    emit({
      code: "WAVE4_PHONICS",
      path: "skills",
      message: "Wave 4 must include skill.sukun.basic.",
      severity: "error",
    });
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  const syllableById = recordById(syllables);
  const ram = syllableById.get("syllable.ram.closed");
  if (!ram) {
    emit({
      code: "WAVE4_CHUNK",
      path: "syllables",
      message: "Wave 4 must define non-lexical closed chunk syllable.ram.closed.",
      severity: "error",
    });
  } else {
    if (ram["pattern"] !== "CVC") {
      emit({
        code: "WAVE4_CHUNK",
        path: "syllables[id=syllable.ram.closed].pattern",
        message: "Closed chunk رَمْ must use pattern CVC.",
        severity: "error",
      });
    }
    if (ram["text"] !== "رَمْ") {
      emit({
        code: "WAVE4_CHUNK",
        path: "syllables[id=syllable.ram.closed].text",
        message: "Closed chunk text must be رَمْ.",
        severity: "error",
      });
    }
    const reqLetters = asStringArray(ram["requiredLetterIds"]);
    if (!reqLetters.includes("letter.ra") || !reqLetters.includes("letter.mim")) {
      emit({
        code: "WAVE4_CHUNK",
        path: "syllables[id=syllable.ram.closed].requiredLetterIds",
        message: "Closed chunk must list letter.ra and letter.mim.",
        severity: "error",
      });
    }
  }

  const mimSukun = syllableById.get("syllable.mim.sukun");
  if (!mimSukun || mimSukun["vowelSkillId"] !== "skill.sukun.basic" || mimSukun["text"] !== "مْ") {
    emit({
      code: "WAVE4_SUKUN",
      path: "syllables[id=syllable.mim.sukun]",
      message: "Wave 4 must define syllable.mim.sukun as مْ with skill.sukun.basic.",
      severity: "error",
    });
  }

  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 3) {
    emit({
      code: "WAVE4_UNIT",
      path: "units",
      message: `Wave 4 must declare exactly three units (found ${units.length}).`,
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  if (paths.length !== 1) {
    emit({
      code: "WAVE4_PATH",
      path: "paths",
      message: `Wave 4 must contain exactly one learning path (found ${paths.length}).`,
      severity: "error",
    });
  } else {
    const path = asRecord(paths[0]);
    if (path) {
      if (path["id"] !== WAVE4_PATH_ID) {
        emit({
          code: "WAVE4_PATH",
          path: "paths[0].id",
          message: `Wave 4 path id must be "${WAVE4_PATH_ID}".`,
          severity: "error",
        });
      }
      const unitIds = asStringArray(path["unitIds"]);
      if (unitIds.join(",") !== WAVE4_UNIT_IDS.join(",")) {
        emit({
          code: "WAVE4_PATH",
          path: "paths[0].unitIds",
          message: "Wave 4 path unit order must be sukun → raml → qalb.",
          severity: "error",
        });
      }
    }
  }

  const exercises = Array.isArray(rec["exercises"]) ? rec["exercises"] : [];
  exercises.forEach((row, i) => {
    const exercise = asRecord(row);
    if (!exercise) return;
    if (typeof exercise["learningObjectiveAr"] !== "string" || exercise["learningObjectiveAr"].length === 0) {
      emit({
        code: "WAVE4_OBJECTIVE",
        path: `exercises[${i}].learningObjectiveAr`,
        message: "Every Wave 4 exercise must declare a learning objective.",
        severity: "error",
      });
    }
    const forbiddenTypes = new Set(["dictation", "word_order", "sentence_order", "comprehension", "story_sequence"]);
    if (typeof exercise["type"] === "string" && forbiddenTypes.has(exercise["type"])) {
      emit({
        code: "WAVE4_EXERCISE",
        path: `exercises[${i}].type`,
        message: `Wave 4 must not use "${exercise["type"]}".`,
        severity: "error",
      });
    }
  });

  validateWave4TeachingContract(rec, emit);
}

function validateWave4TeachingContract(
  data: Record<string, unknown>,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const units = recordById(Array.isArray(data["units"]) ? data["units"] : []);
  const exercises = recordById(Array.isArray(data["exercises"]) ? data["exercises"] : []);

  for (const unitId of WAVE4_UNIT_IDS) {
    const unit = units.get(unitId);
    if (!unit) continue;
    const required = asStringArray(asRecord(unit["mastery"])?.["requiredSkillIds"]);
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE4_HARAKA_SCOPE",
        path: `units[id=${unitId}].mastery.requiredSkillIds`,
        message: "Wave 4 must not require kasra/damma mastery.",
        severity: "error",
      });
    }
    if (asRecord(unit["mastery"])?.["minSessions"] === 2) {
      emit({
        code: "WAVE4_MASTERY",
        path: `units[id=${unitId}].mastery.minSessions`,
        message: "Wave 4 units must not require a second calendar day.",
        severity: "error",
      });
    }
  }

  const unit1 = units.get(WAVE4_FIRST_UNIT_ID);
  if (unit1) {
    const prereqs = asStringArray(unit1["prereqUnitIds"]);
    if (prereqs[0] !== WAVE3_FINAL_UNIT_ID) {
      emit({
        code: "WAVE4_PREREQ",
        path: `units[id=${WAVE4_FIRST_UNIT_ID}].prereqUnitIds`,
        message: `Wave 4 Unit 1 prerequisite must be "${WAVE3_FINAL_UNIT_ID}".`,
        severity: "error",
      });
    }
    if (unit1["titleAr"] !== "تَعَلَّمْ السُّكُون") {
      emit({
        code: "WAVE4_CHILD_LANGUAGE",
        path: `units[id=${WAVE4_FIRST_UNIT_ID}].titleAr`,
        message: "Wave 4 Unit 1 title must be تَعَلَّمْ السُّكُون.",
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
    if (!required.includes("skill.sukun.basic")) {
      emit({
        code: "WAVE4_UNIT1",
        path: `units[id=${WAVE4_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Wave 4 Unit 1 must require skill.sukun.basic.",
        severity: "error",
      });
    }
    if ((asStringArray(unit1["wordIds"])).length > 0) {
      emit({
        code: "WAVE4_UNIT1",
        path: `units[id=${WAVE4_FIRST_UNIT_ID}].wordIds`,
        message: "Wave 4 Unit 1 must not introduce a word.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit1["exerciseIds"]);
    const showIdx = ids.findIndex((id) => id.includes("presentation") && id.includes("sukun"));
    const scoredIdx = ids.findIndex((id) => id.includes("missing_haraka") && id.includes("mim"));
    if (showIdx < 0 || scoredIdx < 0 || showIdx > scoredIdx) {
      emit({
        code: "WAVE4_TEACH_ORDER",
        path: `units[id=${WAVE4_FIRST_UNIT_ID}].exerciseIds`,
        message: "SHOW sukun must occur before scored مَ vs مْ discrimination.",
        severity: "error",
      });
    }
    if (ids.some((id) => id.includes("syllable_blending") || id.includes("audio_to_word") || id.includes("tracing"))) {
      emit({
        code: "WAVE4_UNIT1",
        path: `units[id=${WAVE4_FIRST_UNIT_ID}].exerciseIds`,
        message: "Wave 4 Unit 1 must not include a closed chunk, word, or tracing gate.",
        severity: "error",
      });
    }
    const scored = exercises.get(ids[scoredIdx] ?? "");
    if (scored) {
      const targets = Array.isArray(scored["masteryTargets"]) ? scored["masteryTargets"] : [];
      const skillIds = targets.flatMap((target) => {
        const row = asRecord(target);
        return row && typeof row["skillId"] === "string" ? [row["skillId"]] : [];
      });
      if (!skillIds.includes("skill.sukun.basic") || skillIds.includes("skill.short_vowel.fatha")) {
        emit({
          code: "WAVE4_LIVE_KEY",
          path: `exercises[id=${scored["id"]}].masteryTargets`,
          message: "Scored sukun must write skill.sukun.basic, not fatha.",
          severity: "error",
        });
      }
      const choiceIds = (Array.isArray(scored["choices"]) ? scored["choices"] : []).flatMap((choice) => {
        const row = asRecord(choice);
        return row && typeof row["id"] === "string" ? [row["id"]] : [];
      });
      if (!choiceIds.includes("syllable.mim.fatha") || !choiceIds.includes("syllable.mim.sukun")) {
        emit({
          code: "WAVE4_UNIT1",
          path: `exercises[id=${scored["id"]}].choices`,
          message: "Scored sukun discrimination must contrast مَ vs مْ.",
          severity: "error",
        });
      }
    }
  }

  const unit2 = units.get("unit.literacy.wave4.raml");
  if (unit2) {
    if (unit2["titleAr"] !== "نَقْرَأُ مَعًا") {
      emit({
        code: "WAVE4_CHILD_LANGUAGE",
        path: "units[id=unit.literacy.wave4.raml].titleAr",
        message: "Wave 4 Unit 2 title must be نَقْرَأُ مَعًا.",
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
    if (!required.includes("skill.syllable_blending.cvc") || !required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE4_UNIT2",
        path: "units[id=unit.literacy.wave4.raml].mastery.requiredSkillIds",
        message: "Wave 4 Unit 2 must require closed-chunk blending and word decoding.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit2["exerciseIds"]);
    const chunkShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["show"] === "chunk";
    });
    const chunkScore = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return exercise?.["type"] === "syllable_blending" && exerciseMentions(exercise, "syllable.ram.closed");
    });
    const ramlAudio = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return (
        exercise?.["type"] === "audio_to_word" &&
        asRecord(exercise["success"])?.["correctChoiceId"] === "word.raml"
      );
    });
    const ramlShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["wordId"] === "word.raml";
    });
    const ramlPicture = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return (
        (exercise?.["type"] === "word_to_picture" || exercise?.["type"] === "picture_to_word") &&
        asRecord(exercise["success"])?.["correctChoiceId"] === "word.raml"
      );
    });
    if (ramlShow >= 0) {
      emit({
        code: "WAVE4_TEACH_ORDER",
        path: "units[id=unit.literacy.wave4.raml].exerciseIds",
        message: "Do not SHOW رَمْل before the closed chunk. LessonPlayer drains presentations first.",
        severity: "error",
      });
    }
    if (chunkShow < 0 || chunkScore < 0 || chunkScore < chunkShow) {
      emit({
        code: "WAVE4_TEACH_ORDER",
        path: "units[id=unit.literacy.wave4.raml].exerciseIds",
        message: "Closed-chunk SHOW must occur before scored رَمْ.",
        severity: "error",
      });
    }
    if (ramlAudio < 0 || (chunkScore >= 0 && ramlAudio < chunkScore)) {
      emit({
        code: "WAVE4_TEACH_ORDER",
        path: "units[id=unit.literacy.wave4.raml].exerciseIds",
        message: "Closed chunk must occur before first رَمْل decode.",
        severity: "error",
      });
    }
    const ramlExercise = exercises.get(ids[ramlAudio] ?? "");
    if (!ramlExercise || ramlExercise["type"] !== "audio_to_word") {
      emit({
        code: "WAVE4_DECODING_EVIDENCE",
        path: "units[id=unit.literacy.wave4.raml].exerciseIds",
        message: "First رَمْل evidence must be audio_to_word, not picture.",
        severity: "error",
      });
    }
    if (ramlPicture >= 0 && ramlAudio >= 0 && ramlPicture < ramlAudio) {
      emit({
        code: "WAVE4_DECODING_EVIDENCE",
        path: "units[id=unit.literacy.wave4.raml].exerciseIds",
        message: "رَمْل picture may appear only after decoding.",
        severity: "error",
      });
    }
    if (ramlPicture >= 0) {
      const picture = exercises.get(ids[ramlPicture] ?? "");
      if (picture && !asStringArray(picture["tags"]).includes("reinforcement")) {
        emit({
          code: "WAVE4_DECODING_EVIDENCE",
          path: `exercises[id=${picture["id"]}].tags`,
          message: "رَمْل picture must be tagged reinforcement.",
          severity: "error",
        });
      }
    }
  }

  const unit3 = units.get(WAVE4_FINAL_UNIT_ID);
  if (unit3) {
    if (unit3["titleAr"] !== "اِقْرَأْ كَلِمَاتِي") {
      emit({
        code: "WAVE4_CHILD_LANGUAGE",
        path: `units[id=${WAVE4_FINAL_UNIT_ID}].titleAr`,
        message: "Wave 4 Unit 3 title must be اِقْرَأْ كَلِمَاتِي.",
        severity: "error",
      });
    }
    const required = asStringArray(asRecord(unit3["mastery"])?.["requiredSkillIds"]);
    if (!required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE4_UNIT3",
        path: `units[id=${WAVE4_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
        message: "Wave 4 Unit 3 must require word:qalb decoding.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit3["exerciseIds"]);
    const baFinal = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      const targets = Array.isArray(exercise?.["masteryTargets"]) ? exercise["masteryTargets"] : [];
      const scoresFinal = targets.some((target) => {
        const row = asRecord(target);
        return row?.["letterId"] === "letter.ba" && row?.["letterForm"] === "final";
      });
      return (
        exercise?.["type"] === "letter_recognition" &&
        (config?.["targetForm"] === "final" || scoresFinal)
      );
    });
    const qalbShow = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      const config = asRecord(exercise?.["config"]);
      return exercise?.["type"] === "presentation" && config?.["wordId"] === "word.qalb";
    });
    const qalbAudio = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return (
        exercise?.["type"] === "audio_to_word" &&
        asRecord(exercise["success"])?.["correctChoiceId"] === "word.qalb"
      );
    });
    const qalbPicture = ids.findIndex((id) => {
      const exercise = exercises.get(id);
      return (
        (exercise?.["type"] === "word_to_picture" || exercise?.["type"] === "picture_to_word") &&
        asRecord(exercise["success"])?.["correctChoiceId"] === "word.qalb"
      );
    });
    if (baFinal < 0) {
      emit({
        code: "WAVE4_FORM",
        path: `units[id=${WAVE4_FINAL_UNIT_ID}].exerciseIds`,
        message: "Final ب is not established in prior production. Add a scored final-ب beat before قَلْب.",
        severity: "error",
      });
    }
    if (qalbShow >= 0) {
      emit({
        code: "WAVE4_TEACH_ORDER",
        path: `units[id=${WAVE4_FINAL_UNIT_ID}].exerciseIds`,
        message: "Do not SHOW قَلْب in the same unit as final-ب prep. LessonPlayer drains presentations first.",
        severity: "error",
      });
    }
    if (baFinal >= 0 && qalbAudio >= 0 && qalbAudio < baFinal) {
      emit({
        code: "WAVE4_TEACH_ORDER",
        path: `units[id=${WAVE4_FINAL_UNIT_ID}].exerciseIds`,
        message: "Final-ب prep must occur before any scored قَلْب activity.",
        severity: "error",
      });
    }
    const qalbExercise = exercises.get(ids[qalbAudio] ?? "");
    if (!qalbExercise || qalbExercise["type"] !== "audio_to_word") {
      emit({
        code: "WAVE4_DECODING_EVIDENCE",
        path: `units[id=${WAVE4_FINAL_UNIT_ID}].exerciseIds`,
        message: "First قَلْب evidence must be audio/print decoding.",
        severity: "error",
      });
    } else {
      const choiceIds = (Array.isArray(qalbExercise["choices"]) ? qalbExercise["choices"] : []).flatMap((choice) => {
        const row = asRecord(choice);
        return row && typeof row["id"] === "string" ? [row["id"]] : [];
      });
      if (!choiceIds.includes("word.qalam")) {
        emit({
          code: "WAVE4_FOIL",
          path: `exercises[id=${qalbExercise["id"]}].choices`,
          message: "قَلْب decode must contrast with قَلَم.",
          severity: "error",
        });
      }
    }
    if (qalbPicture >= 0 && qalbAudio >= 0 && qalbPicture < qalbAudio) {
      emit({
        code: "WAVE4_DECODING_EVIDENCE",
        path: `units[id=${WAVE4_FINAL_UNIT_ID}].exerciseIds`,
        message: "قَلْب picture may appear only after decoding.",
        severity: "error",
      });
    }
    if (qalbPicture >= 0) {
      const picture = exercises.get(ids[qalbPicture] ?? "");
      if (picture && !asStringArray(picture["tags"]).includes("reinforcement")) {
        emit({
          code: "WAVE4_DECODING_EVIDENCE",
          path: `exercises[id=${picture["id"]}].tags`,
          message: "قَلْب picture must be tagged reinforcement.",
          severity: "error",
        });
      }
    }
  }

  for (const [exerciseId, exercise] of exercises) {
    if (exercise["type"] !== "presentation") continue;
    if (Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
      emit({
        code: "WAVE4_DEMO",
        path: `exercises[id=${exerciseId}].masteryTargets`,
        message: `Presentation "${exerciseId}" must remain unscored.`,
        severity: "error",
      });
    }
    if (asRecord(exercise["success"])?.["type"] !== "continue") {
      emit({
        code: "WAVE4_DEMO",
        path: `exercises[id=${exerciseId}].success`,
        message: `Presentation "${exerciseId}" must use success type "continue".`,
        severity: "error",
      });
    }
  }
}

export function validateWave4WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE4_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE4_BAND_A_REF",
        path: "words",
        message: `Wave 4 word "${id}" is not in production Band A.`,
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
          code: "WAVE4_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 4 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE4_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 4 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== source["legacyId"]) {
      emit({
        code: "WAVE4_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `Wave 4 "${id}" legacyId must match Band A.`,
        severity: "error",
      });
    }
  }
}
