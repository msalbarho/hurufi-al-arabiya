/**
 * Deterministic Wave 18 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 18 production bundle.
 * Waves 1–17 stay frozen. Productive OPEN DAMMA class: بُ then كُ, unscored مُ.
 * Compact two-unit wave. No closed damma, no verb, no sentence, no Wave 19.
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
import { WAVE9_LETTER_IDS, WAVE9_WORD_IDS } from "./validateLiteracyWave9.ts";
import { WAVE10_LETTER_IDS, WAVE10_WORD_IDS } from "./validateLiteracyWave10.ts";
import { WAVE11_LETTER_IDS, WAVE11_WORD_IDS } from "./validateLiteracyWave11.ts";
import { WAVE12_LETTER_IDS, WAVE12_WORD_IDS } from "./validateLiteracyWave12.ts";
import { WAVE13_LETTER_IDS, WAVE13_WORD_IDS } from "./validateLiteracyWave13.ts";
import { WAVE14_LETTER_IDS, WAVE14_WORD_IDS } from "./validateLiteracyWave14.ts";
import { WAVE15_LETTER_IDS, WAVE15_WORD_IDS } from "./validateLiteracyWave15.ts";
import { WAVE16_LETTER_IDS, WAVE16_WORD_IDS } from "./validateLiteracyWave16.ts";
import {
  WAVE17_FINAL_UNIT_ID,
  WAVE17_LETTER_IDS,
  WAVE17_WORD_IDS,
} from "./validateLiteracyWave17.ts";

export const LITERACY_WAVE18_META_ID = "hurufi.production.literacy.wave18";

export const WAVE18_LETTER_IDS = [] as const;

export const WAVE18_WORD_IDS = [] as const;

export const WAVE18_PATH_ID = "path.literacy.wave18";

export const WAVE18_UNIT_IDS = [
  "unit.literacy.wave18.ba_damma",
  "unit.literacy.wave18.kaf_damma",
] as const;

export const WAVE18_FIRST_UNIT_ID = "unit.literacy.wave18.ba_damma";
export const WAVE18_FINAL_UNIT_ID = "unit.literacy.wave18.kaf_damma";

export const WAVE18_EXTERNAL_PREREQ_UNIT_IDS = [WAVE17_FINAL_UNIT_ID] as const;

const TAUGHT_CARRIERS = ["letter.ba", "letter.kaf"] as const;
const THIRD_LOOK_LETTER = "letter.mim";

const FORBIDDEN_LETTERS = [
  "letter.haa",
  "letter.dhal",
  "letter.zay",
  "letter.kha",
  "letter.tha",
  "letter.sad",
  "letter.ghain",
  "letter.tah",
  "letter.dad",
  "letter.zah",
] as const;

const FORBIDDEN_SKILL_PREFIXES = [
  "skill.shadda.",
  "skill.tanween.",
  "skill.hamza.",
  "skill.taa_marbuta.",
  "skill.alif_maqsura.",
  "skill.articulation.",
  "skill.definite_article",
  "skill.long_vowel.madd_yaa",
  "skill.long_vowel.madd_waw",
] as const;

const FORBIDDEN_WORDS = [
  "word.yalabu",
  "word.yashrabu",
  "word.yalbasu",
  "word.fil",
  "word.halib",
  "word.naam",
  "word.laa",
  "word.wa",
] as const;

const FORBIDDEN_TARGET_STRINGS = [
  "يَلْعَبُ",
  "يَشْرَبُ",
  "يَلْبَسُ",
  "الْوَلَدُ يَلْعَبُ",
  "مُنْ",
  "بُلْ",
  "قُمْ",
] as const;

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
  ...WAVE10_LETTER_IDS,
  ...WAVE11_LETTER_IDS,
  ...WAVE12_LETTER_IDS,
  ...WAVE13_LETTER_IDS,
  ...WAVE14_LETTER_IDS,
  ...WAVE15_LETTER_IDS,
  ...WAVE16_LETTER_IDS,
  ...WAVE17_LETTER_IDS,
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
  ...WAVE10_WORD_IDS,
  ...WAVE11_WORD_IDS,
  ...WAVE12_WORD_IDS,
  ...WAVE13_WORD_IDS,
  ...WAVE14_WORD_IDS,
  ...WAVE15_WORD_IDS,
  ...WAVE16_WORD_IDS,
  ...WAVE17_WORD_IDS,
] as const;

const HAMZA_SEATS = /[أإآ]/u;
const SHADDA = /\u0651/u;
const DAMMA = /\u064F/u;
const TANWEEN = /[\u064B\u064C\u064D]/u;
const TAA_MARBUTA = /ة/u;
const ALIF_MAQSURA = /ى/u;
const MADD_YAA = /ِي(?!\u0652)/u;
const MADD_WAW = /ُو(?!\u0652)/u;
const DEFINITE_ARTICLE = /الْ|ال(?=[\u0621-\u064A])/u;

const UNIT1_FLOW = [
  "exercise.wave18.presentation.ba_fatha",
  "exercise.wave18.presentation.ba_damma",
  "exercise.wave18.syllable_blending.ba_damma",
] as const;
const UNIT2_FLOW = [
  "exercise.wave18.presentation.kaf_fatha",
  "exercise.wave18.presentation.kaf_damma",
  "exercise.wave18.presentation.mim_damma",
  "exercise.wave18.syllable_blending.kaf_damma",
] as const;

function isRecord(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? (value as Record<string, unknown>) : undefined;
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

function childTitleStrings(data: unknown): string[] {
  const rec = asRecord(data);
  const units = Array.isArray(rec?.["units"]) ? rec["units"] : [];
  const paths = Array.isArray(rec?.["paths"]) ? rec["paths"] : [];
  const out: string[] = [];
  for (const row of [...units, ...paths]) {
    const item = asRecord(row);
    if (!item) continue;
    for (const key of ["titleAr", "childGoalAr", "descriptionAr"] as const) {
      if (typeof item[key] === "string") out.push(item[key] as string);
    }
  }
  return out;
}

function skillIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((row) => {
    const rec = asRecord(row);
    return rec && typeof rec["skillId"] === "string" ? [rec["skillId"]] : [];
  });
}

function letterIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((row) => {
    const rec = asRecord(row);
    return rec && typeof rec["letterId"] === "string" ? [rec["letterId"]] : [];
  });
}

function wordIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((row) => {
    const rec = asRecord(row);
    return rec && typeof rec["wordId"] === "string" ? [rec["wordId"]] : [];
  });
}

function choiceIds(exercise: Record<string, unknown>): string[] {
  return asStringArray(
    (Array.isArray(exercise["choices"]) ? exercise["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
  );
}

function choiceLabels(exercise: Record<string, unknown>): string[] {
  return (Array.isArray(exercise["choices"]) ? exercise["choices"] : []).flatMap((choice) => {
    const rec = asRecord(choice);
    return rec && typeof rec["label"] === "string" ? [rec["label"]] : [];
  });
}

function expectedPriorWave(id: string): number | undefined {
  if ((WAVE1_LETTER_IDS as readonly string[]).includes(id)) return 1;
  if ((WAVE2_LETTER_IDS as readonly string[]).includes(id)) return 2;
  if ((WAVE5_LETTER_IDS as readonly string[]).includes(id)) return 5;
  return undefined;
}

export function isLiteracyWave18Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE18_META_ID;
}

export function validateLiteracyWave18Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE18_META",
        path: "meta.kind",
        message: "Literacy Wave 18 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE18_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 18 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-19") || blob.includes("wave19") || blob.includes("path.literacy.wave19")) {
    emit({
      code: "WAVE18_SCOPE",
      path: "$",
      message: "Wave 18 must not declare a Wave 19 path, route, or CTA.",
      severity: "error",
    });
  }
  if (
    blob.includes("path.literacy.wave17") ||
    blob.includes("unit.literacy.wave16") ||
    blob.includes("path.literacy.wave1\"")
  ) {
    emit({
      code: "WAVE18_SCOPE",
      path: "$",
      message: "Wave 18 must not rewrite frozen Waves 1–17 path or unit records.",
      severity: "error",
    });
  }
  for (const id of FORBIDDEN_WORDS) {
    if (blob.includes(`"${id}"`) || blob.includes(id.replace("word.", "word:"))) {
      emit({
        code: "WAVE18_SCOPE",
        path: "$",
        message: `Wave 18 must not include forbidden word ${id}.`,
        severity: "error",
      });
    }
  }
  for (const text of FORBIDDEN_TARGET_STRINGS) {
    if (blob.includes(text)) {
      emit({
        code: "WAVE18_SCOPE",
        path: "$",
        message: `Wave 18 must not include forbidden target "${text}".`,
        severity: "error",
      });
    }
  }
  if (FORBIDDEN_LETTERS.some((id) => blob.includes(`"${id}"`))) {
    emit({
      code: "WAVE18_LETTER",
      path: "$",
      message: "Wave 18 must not teach a new consonant.",
      severity: "error",
    });
  }
  for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
    if (blob.includes(`"${prefix}`) || blob.includes(prefix)) {
      emit({
        code: "WAVE18_PHONICS",
        path: "$",
        message: `Wave 18 must not introduce forbidden skill ${prefix}.`,
        severity: "error",
      });
      break;
    }
  }
  if (
    blob.includes("diacritic:ba.damma.discrimination") ||
    blob.includes("diacritic:kaf.damma.discrimination") ||
    blob.includes("missing_haraka")
  ) {
    emit({
      code: "WAVE18_LIVE_KEY",
      path: "$",
      message: "Wave 18 must not require mark-discrimination or missing_haraka.",
      severity: "error",
    });
  }
  if (
    blob.includes("letter:mim.damma") ||
    blob.includes("mastery.letter.mim.damma") ||
    blob.includes('"letter.mim.damma"')
  ) {
    emit({
      code: "WAVE18_LIVE_KEY",
      path: "$",
      message: "Wave 18 must not require letter:mim.damma.",
      severity: "error",
    });
  }
  if (
    blob.includes("letter:ba.damma.tracing") ||
    blob.includes("letter:kaf.damma.tracing") ||
    blob.includes("skill.handwriting") ||
    blob.includes("\"tracing\"")
  ) {
    emit({
      code: "WAVE18_WRITING",
      path: "$",
      message: "Wave 18 must not invent a writing/tracing mastery key.",
      severity: "error",
    });
  }
  if (blob.includes("audio_to_word") || blob.includes("picture_to_word") || blob.includes("word_to_picture")) {
    emit({
      code: "WAVE18_FLOW",
      path: "$",
      message: "Wave 18 must not use word engines. Open-CV blending only.",
      severity: "error",
    });
  }
  if (blob.includes(".closed") || blob.includes("\"CVC\"")) {
    emit({
      code: "WAVE18_CLOSED",
      path: "$",
      message: "Wave 18 must not author or score a closed-damma class.",
      severity: "error",
    });
  }

  const sentences = Array.isArray(rec["sentences"]) ? rec["sentences"] : [];
  if (sentences.length > 0) {
    emit({
      code: "WAVE18_SENTENCE",
      path: "sentences",
      message: "Wave 18 sentences must remain empty.",
      severity: "error",
    });
  }

  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  if (words.length > 0) {
    emit({
      code: "WAVE18_WORD",
      path: "words",
      message: "Wave 18 must not introduce a damma word.",
      severity: "error",
    });
  }

  const skills = Array.isArray(rec["skills"]) ? rec["skills"] : [];
  const skillRows = recordById(skills);
  const dammaSkill = skillRows.get("skill.short_vowel.damma");
  if (!dammaSkill) {
    emit({
      code: "WAVE18_PHONICS",
      path: "skills",
      message: "Wave 18 must reuse canonical skill.short_vowel.damma.",
      severity: "error",
    });
  } else if (dammaSkill["nameEn"] !== "Damma" || dammaSkill["domain"] !== "short_vowels") {
    emit({
      code: "WAVE18_PHONICS",
      path: "skills[id=skill.short_vowel.damma]",
      message: "Wave 18 must not create a second damma skill.",
      severity: "error",
    });
  }
  const dammaSkillCount = skills.filter((row) => asRecord(row)?.["id"] === "skill.short_vowel.damma").length;
  if (dammaSkillCount !== 1) {
    emit({
      code: "WAVE18_PHONICS",
      path: "skills",
      message: "Wave 18 must include exactly one skill.short_vowel.damma record.",
      severity: "error",
    });
  }
  const newPhonics = skills.filter((row) => {
    const id = asRecord(row)?.["id"];
    return typeof id === "string" && id.startsWith("skill.") && !skillRows.has(id);
  });
  void newPhonics;
  for (const row of skills) {
    const id = asRecord(row)?.["id"];
    if (typeof id !== "string") continue;
    if (
      id !== "skill.letter_recognition.core" &&
      id !== "skill.short_vowel.fatha" &&
      id !== "skill.short_vowel.kasra" &&
      id !== "skill.short_vowel.damma" &&
      id !== "skill.syllable_blending.cv"
    ) {
      emit({
        code: "WAVE18_PHONICS",
        path: `skills[id=${id}]`,
        message: "Damma is the only newly productive Wave 18 phonics class. Do not add other phonics skills.",
        severity: "error",
      });
    }
  }

  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  const allowedLetters = new Set<string>([...PRIOR_LETTER_IDS, ...WAVE18_LETTER_IDS]);
  for (const row of letters) {
    const letter = asRecord(row);
    const id = letter?.["id"];
    if (typeof id !== "string") continue;
    if (!allowedLetters.has(id)) {
      emit({
        code: "WAVE18_LETTER",
        path: `letters[id=${id}]`,
        message: `Wave 18 letter "${id}" was not previously taught.`,
        severity: "error",
      });
    }
    if ((WAVE18_LETTER_IDS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE18_LETTER",
        path: `letters[id=${id}]`,
        message: "Wave 18 must not introduce a new consonant.",
        severity: "error",
      });
    }
    const prior = expectedPriorWave(id);
    if (prior !== undefined && letter?.["wave"] !== prior) {
      emit({
        code: "WAVE18_LETTER",
        path: `letters[id=${id}].wave`,
        message: `Recycled letter "${id}" must keep historical wave ${prior}.`,
        severity: "error",
      });
    }
  }
  for (const id of TAUGHT_CARRIERS) {
    if (!letters.some((row) => asRecord(row)?.["id"] === id)) {
      emit({
        code: "WAVE18_LETTER",
        path: "letters",
        message: `Wave 18 must recycle previously taught carrier ${id}.`,
        severity: "error",
      });
    }
  }
  if (!letters.some((row) => asRecord(row)?.["id"] === THIRD_LOOK_LETTER)) {
    emit({
      code: "WAVE18_LETTER",
      path: "letters",
      message: "Wave 18 must recycle letter.mim for the unscored مُ look.",
      severity: "error",
    });
  }

  const wordIds = words.flatMap((row) => {
    const id = asRecord(row)?.["id"];
    return typeof id === "string" ? [id] : [];
  });
  for (const id of wordIds) {
    if (!(PRIOR_WORD_IDS as readonly string[]).includes(id) && !(WAVE18_WORD_IDS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE18_WORD",
        path: `words[id=${id}]`,
        message: `Wave 18 must not invent word "${id}".`,
        severity: "error",
      });
    }
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  const syllableRows = recordById(syllables);
  const baDamma = syllableRows.get("syllable.ba.damma");
  const kafDamma = syllableRows.get("syllable.kaf.damma");
  const mimDamma = syllableRows.get("syllable.mim.damma");
  if (!baDamma || baDamma["text"] !== "بُ" || baDamma["pattern"] !== "CV" || baDamma["letterId"] !== "letter.ba" || baDamma["vowelSkillId"] !== "skill.short_vowel.damma") {
    emit({
      code: "WAVE18_SYLLABLE",
      path: "syllables[id=syllable.ba.damma]",
      message: "New syllable must be exactly بُ (CV, letter.ba, skill.short_vowel.damma).",
      severity: "error",
    });
  } else if (typeof baDamma["text"] === "string" && !DAMMA.test(baDamma["text"])) {
    emit({
      code: "WAVE18_SYLLABLE",
      path: "syllables[id=syllable.ba.damma].text",
      message: "بُ must contain canonical U+064F ARABIC DAMMA.",
      severity: "error",
    });
  } else if (baDamma["audioAssetId"] !== "audio.syllable.ba.damma") {
    emit({
      code: "WAVE18_AUDIO",
      path: "syllables[id=syllable.ba.damma].audioAssetId",
      message: "بُ must use logical audio.syllable.ba.damma.",
      severity: "error",
    });
  }
  if (!kafDamma || kafDamma["text"] !== "كُ" || kafDamma["pattern"] !== "CV" || kafDamma["letterId"] !== "letter.kaf" || kafDamma["vowelSkillId"] !== "skill.short_vowel.damma") {
    emit({
      code: "WAVE18_SYLLABLE",
      path: "syllables[id=syllable.kaf.damma]",
      message: "New syllable must be exactly كُ (CV, letter.kaf, skill.short_vowel.damma).",
      severity: "error",
    });
  } else if (typeof kafDamma["text"] === "string" && !DAMMA.test(kafDamma["text"])) {
    emit({
      code: "WAVE18_SYLLABLE",
      path: "syllables[id=syllable.kaf.damma].text",
      message: "كُ must contain canonical U+064F ARABIC DAMMA.",
      severity: "error",
    });
  } else if (kafDamma["audioAssetId"] !== "audio.syllable.kaf.damma") {
    emit({
      code: "WAVE18_AUDIO",
      path: "syllables[id=syllable.kaf.damma].audioAssetId",
      message: "كُ must use logical audio.syllable.kaf.damma.",
      severity: "error",
    });
  }
  if (!mimDamma || mimDamma["text"] !== "مُ" || mimDamma["pattern"] !== "CV" || mimDamma["letterId"] !== "letter.mim") {
    emit({
      code: "WAVE18_SYLLABLE",
      path: "syllables[id=syllable.mim.damma]",
      message: "Required third SHOW must reuse historical syllable.mim.damma as مُ.",
      severity: "error",
    });
  } else if (mimDamma["audioAssetId"] !== "audio.syllable.mim.damma") {
    emit({
      code: "WAVE18_AUDIO",
      path: "syllables[id=syllable.mim.damma].audioAssetId",
      message: "SHOW مُ must reuse existing audio.syllable.mim.damma.",
      severity: "error",
    });
  }
  for (const [id, row] of syllableRows) {
    if (row["pattern"] === "CVC" || id.endsWith(".closed")) {
      emit({
        code: "WAVE18_CLOSED",
        path: `syllables[id=${id}]`,
        message: "Wave 18 must not author a closed syllable.",
        severity: "error",
      });
    }
  }

  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 2) {
    emit({
      code: "WAVE18_UNITS",
      path: "units",
      message: "Wave 18 must declare exactly two units.",
      severity: "error",
    });
  }
  const unit1 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE18_FIRST_UNIT_ID));
  const unit2 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE18_FINAL_UNIT_ID));
  if (!unit1 || !unit2) {
    emit({
      code: "WAVE18_UNITS",
      path: "units",
      message: "Wave 18 unit IDs must be exactly unit.literacy.wave18.ba_damma and unit.literacy.wave18.kaf_damma.",
      severity: "error",
    });
  }

  for (const text of childTitleStrings(data)) {
    if (HAMZA_SEATS.test(text) || SHADDA.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text)) {
      emit({
        code: "WAVE18_TITLE",
        path: "childTitle",
        message: `Wave 18 child titles must not contain hamza, shadda, ة, or ى: "${text}".`,
        severity: "error",
      });
    }
    if (TANWEEN.test(text) || MADD_YAA.test(text) || MADD_WAW.test(text)) {
      emit({
        code: "WAVE18_PHONICS",
        path: "childTitle",
        message: `Wave 18 titles must not contain tanween or madd-yaa/madd-waw: "${text}".`,
        severity: "error",
      });
    }
    if (DEFINITE_ARTICLE.test(text)) {
      emit({
        code: "WAVE18_ARTICLE",
        path: "childTitle",
        message: `Wave 18 must not introduce ال: "${text}".`,
        severity: "error",
      });
    }
  }
  if (unit1 && unit1["titleAr"] !== "بُ") {
    emit({
      code: "WAVE18_TITLE",
      path: `units[id=${WAVE18_FIRST_UNIT_ID}].titleAr`,
      message: "Unit 1 child title must be exactly بُ.",
      severity: "error",
    });
  }
  if (unit2 && unit2["titleAr"] !== "كُ") {
    emit({
      code: "WAVE18_TITLE",
      path: `units[id=${WAVE18_FINAL_UNIT_ID}].titleAr`,
      message: "Unit 2 child title must be exactly كُ.",
      severity: "error",
    });
  }

  if (unit1 && asStringArray(unit1["prereqUnitIds"]).join(",") !== WAVE17_FINAL_UNIT_ID) {
    emit({
      code: "WAVE18_PREREQ",
      path: `units[id=${WAVE18_FIRST_UNIT_ID}].prereqUnitIds`,
      message: "Wave 18 prerequisite must be exactly unit.literacy.wave17.wa_bint.",
      severity: "error",
    });
  }
  if (unit2 && asStringArray(unit2["prereqUnitIds"])[0] !== WAVE18_FIRST_UNIT_ID) {
    emit({
      code: "WAVE18_PREREQ",
      path: `units[id=${WAVE18_FINAL_UNIT_ID}].prereqUnitIds`,
      message: "Unit 2 must require Unit 1.",
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = asRecord(paths.find((row) => asRecord(row)?.["id"] === WAVE18_PATH_ID));
  if (!path) {
    emit({
      code: "WAVE18_PATH",
      path: "paths",
      message: "Wave 18 must include path.literacy.wave18.",
      severity: "error",
    });
  } else if (asStringArray(path["unitIds"]).join(",") !== WAVE18_UNIT_IDS.join(",")) {
    emit({
      code: "WAVE18_PATH",
      path: "paths[id=path.literacy.wave18].unitIds",
      message: "path.literacy.wave18 must list the two Wave 18 units in order.",
      severity: "error",
    });
  }
  if (paths.length !== 1) {
    emit({
      code: "WAVE18_PATH",
      path: "paths",
      message: "Wave 18 must not include any other path.",
      severity: "error",
    });
  }

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const u1Exercises = unit1 ? asStringArray(unit1["exerciseIds"]) : [];
  const u2Exercises = unit2 ? asStringArray(unit2["exerciseIds"]) : [];
  if (u1Exercises.join(",") !== UNIT1_FLOW.join(",")) {
    emit({
      code: "WAVE18_FLOW",
      path: `units[id=${WAVE18_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must be SHOW بَ, SHOW بُ, then scored بُ.",
      severity: "error",
    });
  }
  if (u2Exercises.join(",") !== UNIT2_FLOW.join(",")) {
    emit({
      code: "WAVE18_FLOW",
      path: `units[id=${WAVE18_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must be SHOW كَ, SHOW كُ, SHOW مُ, then scored كُ.",
      severity: "error",
    });
  }

  const showBaFatha = exercises.get("exercise.wave18.presentation.ba_fatha");
  const showBaDamma = exercises.get("exercise.wave18.presentation.ba_damma");
  const scoreBa = exercises.get("exercise.wave18.syllable_blending.ba_damma");
  const showKafFatha = exercises.get("exercise.wave18.presentation.kaf_fatha");
  const showKafDamma = exercises.get("exercise.wave18.presentation.kaf_damma");
  const showMimDamma = exercises.get("exercise.wave18.presentation.mim_damma");
  const scoreKaf = exercises.get("exercise.wave18.syllable_blending.kaf_damma");

  if (asRecord(showBaFatha?.["config"])?.["syllableId"] !== "syllable.ba.fatha" || asRecord(showBaFatha?.["config"])?.["show"] !== "cv") {
    emit({
      code: "WAVE18_FLOW",
      path: "exercises[id=exercise.wave18.presentation.ba_fatha]",
      message: "First SHOW must be familiar بَ via syllable.ba.fatha.",
      severity: "error",
    });
  }
  if (asRecord(showBaDamma?.["config"])?.["syllableId"] !== "syllable.ba.damma" || asRecord(showBaDamma?.["config"])?.["show"] !== "cv") {
    emit({
      code: "WAVE18_FLOW",
      path: "exercises[id=exercise.wave18.presentation.ba_damma]",
      message: "Second SHOW must be ب + ُ → بُ via syllable.ba.damma.",
      severity: "error",
    });
  }
  if (asRecord(showKafFatha?.["config"])?.["syllableId"] !== "syllable.kaf.fatha") {
    emit({
      code: "WAVE18_FLOW",
      path: "exercises[id=exercise.wave18.presentation.kaf_fatha]",
      message: "Unit 2 first SHOW must be familiar كَ.",
      severity: "error",
    });
  }
  if (asRecord(showKafDamma?.["config"])?.["syllableId"] !== "syllable.kaf.damma") {
    emit({
      code: "WAVE18_FLOW",
      path: "exercises[id=exercise.wave18.presentation.kaf_damma]",
      message: "Unit 2 second SHOW must be ك + ُ → كُ.",
      severity: "error",
    });
  }
  if (!showMimDamma || asRecord(showMimDamma["config"])?.["syllableId"] !== "syllable.mim.damma" || showMimDamma["type"] !== "presentation") {
    emit({
      code: "WAVE18_FLOW",
      path: "exercises[id=exercise.wave18.presentation.mim_damma]",
      message: "Required third SHOW must be unscored مُ via historical syllable.mim.damma.",
      severity: "error",
    });
  }

  const firstScoredU1 = u1Exercises.find((id) => exercises.get(id)?.["type"] !== "presentation");
  const firstScoredU2 = u2Exercises.find((id) => exercises.get(id)?.["type"] !== "presentation");
  if (firstScoredU1 !== "exercise.wave18.syllable_blending.ba_damma") {
    emit({
      code: "WAVE18_FLOW",
      path: `units[id=${WAVE18_FIRST_UNIT_ID}].exerciseIds`,
      message: "All Unit 1 presentations must occur before scored بُ.",
      severity: "error",
    });
  }
  if (firstScoredU2 !== "exercise.wave18.syllable_blending.kaf_damma") {
    emit({
      code: "WAVE18_FLOW",
      path: `units[id=${WAVE18_FINAL_UNIT_ID}].exerciseIds`,
      message: "All Unit 2 presentations must occur before scored كُ.",
      severity: "error",
    });
  }

  if (scoreBa?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE18_FLOW",
      path: "exercises[id=exercise.wave18.syllable_blending.ba_damma]",
      message: "Unit 1 scored item must be syllable_blending for بُ.",
      severity: "error",
    });
  } else {
    const ids = choiceIds(scoreBa);
    const labels = choiceLabels(scoreBa);
    if (
      asRecord(scoreBa["success"])?.["correctChoiceId"] !== "syllable.ba.damma" ||
      !ids.includes("syllable.ba.damma") ||
      !ids.includes("syllable.ba.fatha") ||
      !ids.includes("syllable.ba.kasra") ||
      !labels.includes("بُ") ||
      !labels.includes("بَ") ||
      !labels.includes("بِ")
    ) {
      emit({
        code: "WAVE18_FLOW",
        path: "exercises[id=exercise.wave18.syllable_blending.ba_damma].choices",
        message: "Scored بُ choices must include بُ / بَ / بِ.",
        severity: "error",
      });
    }
    if (letterIdsOnTargets(scoreBa).join(",") !== "letter.ba" || skillIdsOnTargets(scoreBa).join(",") !== "skill.short_vowel.damma") {
      emit({
        code: "WAVE18_LIVE_KEY",
        path: "exercises[id=exercise.wave18.syllable_blending.ba_damma].masteryTargets",
        message: "Unit 1 required live evidence must be exactly letter:ba.damma.",
        severity: "error",
      });
    }
    if (
      skillIdsOnTargets(scoreBa).includes("skill.short_vowel.fatha") ||
      skillIdsOnTargets(scoreBa).includes("skill.short_vowel.kasra") ||
      wordIdsOnTargets(scoreBa).length > 0
    ) {
      emit({
        code: "WAVE18_LIVE_KEY",
        path: "exercises[id=exercise.wave18.syllable_blending.ba_damma].masteryTargets",
        message: "Historical fatha/kasra or word keys must not satisfy Unit 1.",
        severity: "error",
      });
    }
  }

  if (scoreKaf?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE18_FLOW",
      path: "exercises[id=exercise.wave18.syllable_blending.kaf_damma]",
      message: "Unit 2 scored item must be syllable_blending for كُ.",
      severity: "error",
    });
  } else {
    const ids = choiceIds(scoreKaf);
    const labels = choiceLabels(scoreKaf);
    if (
      asRecord(scoreKaf["success"])?.["correctChoiceId"] !== "syllable.kaf.damma" ||
      !ids.includes("syllable.kaf.damma") ||
      !ids.includes("syllable.kaf.fatha") ||
      !ids.includes("syllable.kaf.kasra") ||
      !labels.includes("كُ") ||
      !labels.includes("كَ") ||
      !labels.includes("كِ")
    ) {
      emit({
        code: "WAVE18_FLOW",
        path: "exercises[id=exercise.wave18.syllable_blending.kaf_damma].choices",
        message: "Scored كُ choices must include كُ / كَ / كِ.",
        severity: "error",
      });
    }
    if (letterIdsOnTargets(scoreKaf).join(",") !== "letter.kaf" || skillIdsOnTargets(scoreKaf).join(",") !== "skill.short_vowel.damma") {
      emit({
        code: "WAVE18_LIVE_KEY",
        path: "exercises[id=exercise.wave18.syllable_blending.kaf_damma].masteryTargets",
        message: "Unit 2 required live evidence must be exactly letter:kaf.damma.",
        severity: "error",
      });
    }
    if (letterIdsOnTargets(scoreKaf).includes("letter.mim") || wordIdsOnTargets(scoreKaf).length > 0) {
      emit({
        code: "WAVE18_LIVE_KEY",
        path: "exercises[id=exercise.wave18.syllable_blending.kaf_damma].masteryTargets",
        message: "letter:mim.damma or word keys must not satisfy Unit 2.",
        severity: "error",
      });
    }
  }

  const u1Required = unit1 ? asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]) : [];
  const u2Required = unit2 ? asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]) : [];
  if (u1Required.join(",") !== "skill.short_vowel.damma") {
    emit({
      code: "WAVE18_MASTERY",
      path: `units[id=${WAVE18_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 1 must require skill.short_vowel.damma only.",
      severity: "error",
    });
  }
  if (u2Required.join(",") !== "skill.short_vowel.damma") {
    emit({
      code: "WAVE18_MASTERY",
      path: `units[id=${WAVE18_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 2 must require skill.short_vowel.damma only.",
      severity: "error",
    });
  }

  const requiredLetterIds = new Set<string>();
  for (const [unitId, unit] of [
    [WAVE18_FIRST_UNIT_ID, unit1],
    [WAVE18_FINAL_UNIT_ID, unit2],
  ] as const) {
    if (!unit) continue;
    const required = asStringArray(asRecord(unit["mastery"])?.["requiredSkillIds"]);
    const mapped = new Set<string>();
    for (const exerciseId of asStringArray(unit["exerciseIds"])) {
      const exercise = exercises.get(exerciseId);
      if (!exercise || asStringArray(exercise["tags"]).includes("reinforcement")) continue;
      if (exercise["type"] === "presentation") continue;
      for (const skillId of skillIdsOnTargets(exercise)) mapped.add(skillId);
      for (const letterId of letterIdsOnTargets(exercise)) requiredLetterIds.add(letterId);
    }
    for (const skillId of required) {
      if (!mapped.has(skillId)) {
        emit({
          code: "WAVE18_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
  const expectedLetters = ["letter.ba", "letter.kaf"].sort().join(",");
  if ([...requiredLetterIds].sort().join(",") !== expectedLetters) {
    emit({
      code: "WAVE18_LIVE_KEY",
      path: "units.mastery",
      message: `Wave 18 required live keys must be exactly letter:ba.damma and letter:kaf.damma (found ${[...requiredLetterIds].join(", ")}).`,
      severity: "error",
    });
  }

  for (const exercise of exercises.values()) {
    if (exercise["type"] === "presentation" && Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
      emit({
        code: "WAVE18_MASTERY",
        path: `exercises[id=${exercise["id"]}].masteryTargets`,
        message: "Presentations must have attempts 0 / no mastery targets.",
        severity: "error",
      });
    }
    if (exercise["type"] !== "presentation" && exercise["type"] !== "syllable_blending") {
      emit({
        code: "WAVE18_RUNTIME",
        path: `exercises[id=${exercise["id"]}].type`,
        message: "Wave 18 must reuse existing presentation + syllable_blending engines only.",
        severity: "error",
      });
    }
    for (const label of choiceLabels(exercise)) {
      if (TANWEEN.test(label) || TAA_MARBUTA.test(label) || ALIF_MAQSURA.test(label) || HAMZA_SEATS.test(label) || SHADDA.test(label)) {
        emit({
          code: "WAVE18_PHONICS",
          path: `exercises[id=${exercise["id"]}].choices`,
          message: `Choice label must not introduce tanween, hamza, shadda, ة, or ى: "${label}".`,
          severity: "error",
        });
      }
    }
  }
}
