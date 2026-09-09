/**
 * Deterministic Wave 22 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 22 production bundle.
 * Waves 1–21 stay frozen. Final wave: foundation consolidation + handoff.
 * One-unit review of يَلْعَبُ. Reused Wave 21 sentence is exposure only.
 * No tanween, pronoun, demonstrative, writing, new phonics, or Wave 23.
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
import { WAVE17_LETTER_IDS, WAVE17_WORD_IDS } from "./validateLiteracyWave17.ts";
import { WAVE18_LETTER_IDS, WAVE18_WORD_IDS } from "./validateLiteracyWave18.ts";
import { WAVE19_LETTER_IDS, WAVE19_WORD_IDS } from "./validateLiteracyWave19.ts";
import { WAVE20_LETTER_IDS, WAVE20_WORD_IDS } from "./validateLiteracyWave20.ts";
import {
  WAVE21_FINAL_UNIT_ID,
  WAVE21_LETTER_IDS,
  WAVE21_SENTENCE_AUDIO_ID,
  WAVE21_SENTENCE_ID,
  WAVE21_WORD_IDS,
} from "./validateLiteracyWave21.ts";

export const LITERACY_WAVE22_META_ID = "hurufi.production.literacy.wave22";

export const WAVE22_LETTER_IDS = [] as const;

export const WAVE22_WORD_IDS = [] as const;

export const WAVE22_BAND_A_WORD_IDS = ["word.yalab", "word.walad", "word.bint"] as const;

export const WAVE22_PATH_ID = "path.literacy.wave22";

export const WAVE22_UNIT_IDS = ["unit.literacy.wave22.handoff"] as const;

export const WAVE22_FIRST_UNIT_ID = "unit.literacy.wave22.handoff";
export const WAVE22_FINAL_UNIT_ID = "unit.literacy.wave22.handoff";

export const WAVE22_REQUIRED_LIVE_KEY = "word:yalab.review";

export const WAVE22_EXTERNAL_PREREQ_UNIT_IDS = [WAVE21_FINAL_UNIT_ID] as const;

const CARRIER_LETTER_IDS = ["letter.alif"] as const;

const REQUIRED_LETTERS = [
  "letter.alif",
  "letter.lam",
  "letter.waw",
  "letter.dal",
  "letter.ya",
  "letter.ain",
  "letter.ba",
  "letter.nun",
  "letter.ta",
] as const;

const ALLOWED_SKILLS = [
  "skill.letter_recognition.core",
  "skill.short_vowel.fatha",
  "skill.short_vowel.kasra",
  "skill.short_vowel.damma",
  "skill.sukun.basic",
  "skill.syllable_blending.cv",
  "skill.word_decoding.simple",
] as const;

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
  "skill.sentence_reading.",
  "language.article",
  "language.pronoun",
  "letter:al.article",
  "article:al.complete",
  "wave22.complete",
  "wave22.article",
] as const;

const FORBIDDEN_WORDS = [
  "word.yalabu",
  "word.huwa",
  "word.hiya",
  "word.hadha",
  "word.hadhihi",
  "word.waladun",
] as const;

const FORBIDDEN_TARGET_STRINGS = [
  "وَلَد يَلْعَبُ",
  "وَلَدٌ يَلْعَبُ",
  "الْبِنْتُ يَلْعَبُ",
  "الْجَمَلُ يَلْعَبُ",
  "هُوَ",
  "هِيَ",
  "هَذَا",
  "هَذِهِ",
  "letter:al.article",
  "article:al.complete",
  "word:yalab.decoding",
  "word:yalab.writing",
  "word:walad.writing",
  "sentence:wave21.alwaladu_yalabu.reading",
  "sentence:wave22",
  "wave22.complete",
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
  ...WAVE18_LETTER_IDS,
  ...WAVE19_LETTER_IDS,
  ...WAVE20_LETTER_IDS,
  ...WAVE21_LETTER_IDS,
  ...CARRIER_LETTER_IDS,
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
  ...WAVE18_WORD_IDS,
  ...WAVE19_WORD_IDS,
  ...WAVE20_WORD_IDS,
  ...WAVE21_WORD_IDS,
] as const;

const HAMZA_SEATS = /[أإآ]/u;
const SHADDA = /\u0651/u;
const TANWEEN = /[\u064B\u064C\u064D]/u;
const TAA_MARBUTA = /ة/u;
const ALIF_MAQSURA = /ى/u;
const MADD_YAA = /ِي(?!\u0652)/u;
const MADD_WAW = /ُو(?!\u0652)/u;
const PRONOUN_HUWA = /هُوَ/u;
const PRONOUN_HIYA = /هِيَ/u;
const DEMONSTRATIVE = /هَذَا|هَذِهِ/u;

const CANONICAL_SENTENCE = "الْوَلَدُ يَلْعَبُ";
const CANONICAL_WALAD = "وَلَد";
const CANONICAL_YALAB = "يَلْعَبُ";
const CANONICAL_BINT = "بِنْت";
const CANONICAL_DEFINITE_WALAD = "الْوَلَدُ";
const CANONICAL_ARTICLE = "الْ";

const UNIT_FLOW = [
  "exercise.wave22.presentation.yalab",
  "exercise.wave22.presentation.alwaladu",
  "exercise.wave22.presentation.alwaladu_yalabu",
  "exercise.wave22.audio_to_word.yalab_review",
] as const;

const LETTER_PRIOR_WAVE: Record<string, number> = {
  "letter.lam": 1,
  "letter.waw": 1,
  "letter.dal": 1,
  "letter.ya": 1,
  "letter.ba": 2,
  "letter.ta": 6,
  "letter.ain": 9,
  "letter.nun": 12,
};

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

function sorted(values: string[]): string[] {
  return values.slice().sort();
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

function sentenceIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((row) => {
    const rec = asRecord(row);
    return rec && typeof rec["sentenceId"] === "string" ? [rec["sentenceId"]] : [];
  });
}

function syllableIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((row) => {
    const rec = asRecord(row);
    return rec && typeof rec["syllableId"] === "string" ? [rec["syllableId"]] : [];
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

export function isLiteracyWave22Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE22_META_ID;
}

export function validateLiteracyWave22Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE22_META",
        path: "meta.kind",
        message: "Literacy Wave 22 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE22_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 22 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
    if (meta["id"] !== LITERACY_WAVE22_META_ID) {
      emit({
        code: "WAVE22_META",
        path: "meta.id",
        message: "Wave 22 is the final registered literacy wave.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (
    blob.includes("wave-23") ||
    blob.includes("wave23") ||
    blob.includes("path.literacy.wave23") ||
    blob.includes("unit.literacy.wave23")
  ) {
    emit({
      code: "WAVE22_SCOPE",
      path: "$",
      message: "Wave 22 is the final wave. Do not declare Wave 23.",
      severity: "error",
    });
  }
  if (
    blob.includes("path.module") ||
    blob.includes("unit.module") ||
    blob.includes("hurufi.production.module") ||
    blob.includes("\"modules\"")
  ) {
    emit({
      code: "WAVE22_SCOPE",
      path: "$",
      message: "Wave 22 must not implement Modules.",
      severity: "error",
    });
  }
  if (blob.includes("path.literacy.wave21") || blob.includes("unit.literacy.wave20") || blob.includes("path.literacy.wave1\"")) {
    emit({
      code: "WAVE22_SCOPE",
      path: "$",
      message: "Wave 22 must not rewrite frozen Waves 1–21 path or unit records.",
      severity: "error",
    });
  }
  for (const id of FORBIDDEN_WORDS) {
    if (blob.includes(`"${id}"`) || blob.includes(id.replace("word.", "word:"))) {
      emit({
        code: "WAVE22_SCOPE",
        path: "$",
        message: `Wave 22 must not include forbidden word ${id}.`,
        severity: "error",
      });
    }
  }
  for (const text of FORBIDDEN_TARGET_STRINGS) {
    if (blob.includes(text)) {
      emit({
        code: "WAVE22_SCOPE",
        path: "$",
        message: `Wave 22 must not include forbidden target "${text}".`,
        severity: "error",
      });
    }
  }
  if (FORBIDDEN_LETTERS.some((id) => blob.includes(`"${id}"`))) {
    emit({
      code: "WAVE22_LETTER",
      path: "$",
      message: "Wave 22 must not teach a new consonant.",
      severity: "error",
    });
  }
  for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
    if (blob.includes(`"${prefix}`) || blob.includes(prefix)) {
      emit({
        code: "WAVE22_PHONICS",
        path: "$",
        message: `Wave 22 must not introduce forbidden skill or key ${prefix}.`,
        severity: "error",
      });
      break;
    }
  }
  if (blob.includes("diacritic:") || blob.includes("missing_haraka")) {
    emit({
      code: "WAVE22_LIVE_KEY",
      path: "$",
      message: "Wave 22 must not require mark-discrimination or missing_haraka.",
      severity: "error",
    });
  }
  if (blob.includes("skill.handwriting") || blob.includes("\"tracing\"") || blob.includes(".writing")) {
    emit({
      code: "WAVE22_WRITING",
      path: "$",
      message: "Wave 22 must not invent a writing/tracing mastery key.",
      severity: "error",
    });
  }
  if (
    blob.includes("picture_to_word") ||
    blob.includes("word_to_picture") ||
    blob.includes("sentence_to_picture") ||
    blob.includes("audio_to_sentence") ||
    blob.includes('"type": "syllable_blending"')
  ) {
    emit({
      code: "WAVE22_FLOW",
      path: "$",
      message: "Wave 22 must score audio_to_word review only. No picture gate, sentence score, or syllable_blending.",
      severity: "error",
    });
  }
  if (blob.includes("sentence.wave22")) {
    emit({
      code: "WAVE22_SENTENCE",
      path: "$",
      message: "Wave 22 must not create sentence.wave22.*. Semantic sentence ownership stays Wave 21.",
      severity: "error",
    });
  }

  const sentences = Array.isArray(rec["sentences"]) ? rec["sentences"] : [];
  if (sentences.length !== 0) {
    emit({
      code: "WAVE22_SENTENCE",
      path: "sentences",
      message: `Wave 22 must not duplicate ${WAVE21_SENTENCE_ID}. Reuse the Wave 21 sentence as authored SHOW text only.`,
      severity: "error",
    });
  }

  const skills = Array.isArray(rec["skills"]) ? rec["skills"] : [];
  const skillRows = recordById(skills);
  if (!skillRows.has("skill.word_decoding.simple")) {
    emit({
      code: "WAVE22_PHONICS",
      path: "skills",
      message: "Wave 22 must reuse canonical skill.word_decoding.simple.",
      severity: "error",
    });
  }
  for (const row of skills) {
    const id = asRecord(row)?.["id"];
    if (typeof id !== "string") continue;
    if (!(ALLOWED_SKILLS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE22_PHONICS",
        path: `skills[id=${id}]`,
        message: "Wave 22 may only reuse historical skills. No new phonics.",
        severity: "error",
      });
    }
  }

  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  const allowedLetters = new Set<string>([...PRIOR_LETTER_IDS, ...WAVE22_LETTER_IDS]);
  for (const row of letters) {
    const letter = asRecord(row);
    const id = letter?.["id"];
    if (typeof id !== "string") continue;
    if (!allowedLetters.has(id)) {
      emit({
        code: "WAVE22_LETTER",
        path: `letters[id=${id}]`,
        message: `Wave 22 letter "${id}" was not previously taught.`,
        severity: "error",
      });
    }
    if ((WAVE22_LETTER_IDS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE22_LETTER",
        path: `letters[id=${id}]`,
        message: "Wave 22 must not introduce a new consonant.",
        severity: "error",
      });
    }
    const prior = LETTER_PRIOR_WAVE[id];
    if (prior !== undefined && letter?.["wave"] !== prior) {
      emit({
        code: "WAVE22_LETTER",
        path: `letters[id=${id}].wave`,
        message: `Recycled letter "${id}" must keep historical wave ${prior}.`,
        severity: "error",
      });
    }
  }
  for (const id of REQUIRED_LETTERS) {
    if (!letters.some((row) => asRecord(row)?.["id"] === id)) {
      emit({
        code: "WAVE22_LETTER",
        path: "letters",
        message: `Wave 22 must recycle previously taught letter ${id}.`,
        severity: "error",
      });
    }
  }

  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const wordRows = recordById(words);
  const yalab = wordRows.get("word.yalab");
  const walad = wordRows.get("word.walad");
  const bint = wordRows.get("word.bint");
  if (!yalab) {
    emit({
      code: "WAVE22_WORD",
      path: "words",
      message: "Wave 22 must copy canonical word.yalab.",
      severity: "error",
    });
  } else if (yalab["diacritized"] !== CANONICAL_YALAB || yalab["teachingForm"] !== CANONICAL_YALAB) {
    emit({
      code: "WAVE22_WORD",
      path: "words[id=word.yalab]",
      message: "word.yalab must remain يَلْعَبُ.",
      severity: "error",
    });
  }
  if (!walad) {
    emit({
      code: "WAVE22_WORD",
      path: "words",
      message: "Wave 22 must copy canonical word.walad.",
      severity: "error",
    });
  } else if (
    walad["lemma"] !== "ولد" ||
    walad["diacritized"] !== CANONICAL_WALAD ||
    walad["teachingForm"] !== CANONICAL_WALAD
  ) {
    emit({
      code: "WAVE22_WORD",
      path: "words[id=word.walad]",
      message: "word.walad citation form must remain وَلَد. Do not mutate it into الْوَلَدُ.",
      severity: "error",
    });
  }
  if (!bint) {
    emit({
      code: "WAVE22_WORD",
      path: "words",
      message: "Wave 22 must copy canonical word.bint.",
      severity: "error",
    });
  } else if (bint["diacritized"] !== CANONICAL_BINT || bint["teachingForm"] !== CANONICAL_BINT) {
    emit({
      code: "WAVE22_WORD",
      path: "words[id=word.bint]",
      message: "word.bint must remain بِنْت.",
      severity: "error",
    });
  }
  const wordIds = words.flatMap((row) => {
    const id = asRecord(row)?.["id"];
    return typeof id === "string" ? [id] : [];
  });
  for (const id of wordIds) {
    if (!(PRIOR_WORD_IDS as readonly string[]).includes(id) && !(WAVE22_WORD_IDS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE22_WORD",
        path: `words[id=${id}]`,
        message: `Wave 22 must not invent word "${id}".`,
        severity: "error",
      });
    }
  }
  if (sorted(wordIds).join(",") !== sorted([...WAVE22_BAND_A_WORD_IDS]).join(",")) {
    emit({
      code: "WAVE22_WORD",
      path: "words",
      message: "Wave 22 words must be exactly recycled word.yalab, word.walad, and word.bint.",
      severity: "error",
    });
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  if (syllables.length > 0) {
    emit({
      code: "WAVE22_SYLLABLE",
      path: "syllables",
      message: "Wave 22 presentations are authored strings. Do not author syllables.",
      severity: "error",
    });
  }

  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 1) {
    emit({
      code: "WAVE22_UNITS",
      path: "units",
      message: "Wave 22 must declare exactly one unit.",
      severity: "error",
    });
  }
  const unit1 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE22_FIRST_UNIT_ID));
  if (!unit1) {
    emit({
      code: "WAVE22_UNITS",
      path: "units",
      message: "Wave 22 unit id must be exactly unit.literacy.wave22.handoff.",
      severity: "error",
    });
  }

  for (const text of childTitleStrings(data)) {
    if (HAMZA_SEATS.test(text) || SHADDA.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text)) {
      emit({
        code: "WAVE22_TITLE",
        path: "childTitle",
        message: `Wave 22 child titles must not contain hamza, shadda, ة, or ى: "${text}".`,
        severity: "error",
      });
    }
    if (TANWEEN.test(text) || MADD_YAA.test(text) || MADD_WAW.test(text)) {
      emit({
        code: "WAVE22_PHONICS",
        path: "childTitle",
        message: `Wave 22 titles must not contain tanween or madd-yaa/madd-waw: "${text}".`,
        severity: "error",
      });
    }
    if (PRONOUN_HUWA.test(text) || PRONOUN_HIYA.test(text) || DEMONSTRATIVE.test(text)) {
      emit({
        code: "WAVE22_PRONOUN",
        path: "childTitle",
        message: `Wave 22 must not introduce a pronoun or demonstrative: "${text}".`,
        severity: "error",
      });
    }
  }
  if (unit1 && unit1["titleAr"] !== CANONICAL_SENTENCE) {
    emit({
      code: "WAVE22_TITLE",
      path: `units[id=${WAVE22_FIRST_UNIT_ID}].titleAr`,
      message: `Unit child title must be exactly ${CANONICAL_SENTENCE}.`,
      severity: "error",
    });
  }

  if (unit1 && asStringArray(unit1["prereqUnitIds"]).join(",") !== WAVE21_FINAL_UNIT_ID) {
    emit({
      code: "WAVE22_PREREQ",
      path: `units[id=${WAVE22_FIRST_UNIT_ID}].prereqUnitIds`,
      message: "Wave 22 prerequisite must be exactly unit.literacy.wave21.alwaladu_yalabu.",
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = asRecord(paths.find((row) => asRecord(row)?.["id"] === WAVE22_PATH_ID));
  if (!path) {
    emit({
      code: "WAVE22_PATH",
      path: "paths",
      message: "Wave 22 must include path.literacy.wave22.",
      severity: "error",
    });
  } else if (asStringArray(path["unitIds"]).join(",") !== WAVE22_UNIT_IDS.join(",")) {
    emit({
      code: "WAVE22_PATH",
      path: "paths[id=path.literacy.wave22].unitIds",
      message: "path.literacy.wave22 must list exactly unit.literacy.wave22.handoff.",
      severity: "error",
    });
  }
  if (paths.length !== 1) {
    emit({
      code: "WAVE22_PATH",
      path: "paths",
      message: "Wave 22 must not include any other path.",
      severity: "error",
    });
  }

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const u1Exercises = unit1 ? asStringArray(unit1["exerciseIds"]) : [];
  if (u1Exercises.join(",") !== UNIT_FLOW.join(",")) {
    emit({
      code: "WAVE22_FLOW",
      path: `units[id=${WAVE22_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit must be word SHOW, definite-noun SHOW, sentence SHOW, then scored review.",
      severity: "error",
    });
  }

  const showWord = exercises.get("exercise.wave22.presentation.yalab");
  const showNoun = exercises.get("exercise.wave22.presentation.alwaladu");
  const showSentence = exercises.get("exercise.wave22.presentation.alwaladu_yalabu");
  const scoreReview = exercises.get("exercise.wave22.audio_to_word.yalab_review");
  const showWordConfig = asRecord(showWord?.["config"]);
  const showNounConfig = asRecord(showNoun?.["config"]);
  const showSentenceConfig = asRecord(showSentence?.["config"]);

  if (
    showWord?.["type"] !== "presentation" ||
    showWordConfig?.["show"] !== "word" ||
    showWordConfig?.["wordId"] !== "word.yalab"
  ) {
    emit({
      code: "WAVE22_FLOW",
      path: "exercises[id=exercise.wave22.presentation.yalab]",
      message: "First SHOW must be the known word يَلْعَبُ.",
      severity: "error",
    });
  }
  if (showWord?.["promptAssetId"] !== "audio.word.yalab") {
    emit({
      code: "WAVE22_AUDIO",
      path: "exercises[id=exercise.wave22.presentation.yalab].promptAssetId",
      message: "Word SHOW must reuse audio.word.yalab.",
      severity: "error",
    });
  }
  if (
    showNoun?.["type"] !== "presentation" ||
    showNounConfig?.["show"] !== "chunk" ||
    showNounConfig?.["left"] !== CANONICAL_ARTICLE ||
    showNounConfig?.["right"] !== CANONICAL_WALAD ||
    showNounConfig?.["result"] !== CANONICAL_DEFINITE_WALAD
  ) {
    emit({
      code: "WAVE22_FLOW",
      path: "exercises[id=exercise.wave22.presentation.alwaladu]",
      message: "Second SHOW must be authored chunk الْ + وَلَد → الْوَلَدُ.",
      severity: "error",
    });
  }
  if (
    showSentence?.["type"] !== "presentation" ||
    showSentenceConfig?.["show"] !== "chunk" ||
    showSentenceConfig?.["left"] !== CANONICAL_DEFINITE_WALAD ||
    showSentenceConfig?.["right"] !== CANONICAL_YALAB ||
    showSentenceConfig?.["result"] !== CANONICAL_SENTENCE
  ) {
    emit({
      code: "WAVE22_FLOW",
      path: "exercises[id=exercise.wave22.presentation.alwaladu_yalabu]",
      message: `Third SHOW must reuse authored ${CANONICAL_SENTENCE}. No runtime morphology.`,
      severity: "error",
    });
  }
  if (showSentence?.["promptAssetId"] !== WAVE21_SENTENCE_AUDIO_ID) {
    emit({
      code: "WAVE22_AUDIO",
      path: "exercises[id=exercise.wave22.presentation.alwaladu_yalabu].promptAssetId",
      message: "Sentence SHOW must play the Wave 21 sentence audio asset, not concatenated word audio.",
      severity: "error",
    });
  }

  const presentationCount = [...exercises.values()].filter((row) => row["type"] === "presentation").length;
  if (presentationCount !== 3) {
    emit({
      code: "WAVE22_FLOW",
      path: "exercises",
      message: "Wave 22 must have exactly three presentations.",
      severity: "error",
    });
  }

  const firstScored = u1Exercises.find((id) => exercises.get(id)?.["type"] !== "presentation");
  if (firstScored !== "exercise.wave22.audio_to_word.yalab_review") {
    emit({
      code: "WAVE22_FLOW",
      path: `units[id=${WAVE22_FIRST_UNIT_ID}].exerciseIds`,
      message: "All presentations must occur before scored review.",
      severity: "error",
    });
  }

  if (scoreReview?.["type"] !== "audio_to_word") {
    emit({
      code: "WAVE22_FLOW",
      path: "exercises[id=exercise.wave22.audio_to_word.yalab_review]",
      message: "Scored item must be audio_to_word for يَلْعَبُ.",
      severity: "error",
    });
  } else {
    const ids = choiceIds(scoreReview);
    const labels = choiceLabels(scoreReview);
    const tags = asStringArray(scoreReview["tags"]);
    if (!tags.includes("review") || tags.includes("review-wave6")) {
      emit({
        code: "WAVE22_LIVE_KEY",
        path: "exercises[id=exercise.wave22.audio_to_word.yalab_review].tags",
        message: "Scored exercise must use the generic review facet tag exactly: review.",
        severity: "error",
      });
    }
    if (
      asRecord(scoreReview["success"])?.["correctChoiceId"] !== "word.yalab" ||
      ids.join(",") !== "word.yalab,word.walad,word.bint" ||
      labels.join(",") !== `${CANONICAL_YALAB},${CANONICAL_WALAD},${CANONICAL_BINT}`
    ) {
      emit({
        code: "WAVE22_FLOW",
        path: "exercises[id=exercise.wave22.audio_to_word.yalab_review].choices",
        message: "Scored choices must be exactly يَلْعَبُ / وَلَد / بِنْت.",
        severity: "error",
      });
    }
    if (scoreReview["promptAssetId"] !== "audio.word.yalab") {
      emit({
        code: "WAVE22_AUDIO",
        path: "exercises[id=exercise.wave22.audio_to_word.yalab_review].promptAssetId",
        message: "Scored item must reuse audio.word.yalab.",
        severity: "error",
      });
    }
    const targetIds = (Array.isArray(scoreReview["masteryTargets"]) ? scoreReview["masteryTargets"] : []).flatMap((row) => {
      const item = asRecord(row);
      return item && typeof item["id"] === "string" ? [item["id"]] : [];
    });
    if (
      skillIdsOnTargets(scoreReview).join(",") !== "skill.word_decoding.simple" ||
      wordIdsOnTargets(scoreReview).join(",") !== "word.yalab" ||
      sentenceIdsOnTargets(scoreReview).length > 0 ||
      letterIdsOnTargets(scoreReview).length > 0 ||
      syllableIdsOnTargets(scoreReview).length > 0 ||
      targetIds.some((id) => id.includes("decoding") || id.includes("wave21") || id.includes("complete"))
    ) {
      emit({
        code: "WAVE22_LIVE_KEY",
        path: "exercises[id=exercise.wave22.audio_to_word.yalab_review].masteryTargets",
        message: `Required live evidence must be the review facet on word.yalab (${WAVE22_REQUIRED_LIVE_KEY}). Do not gate on word:yalab.decoding or duplicate Wave 21 sentence reading.`,
        severity: "error",
      });
    }
  }

  const u1Required = unit1 ? asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]) : [];
  if (u1Required.join(",") !== "skill.word_decoding.simple") {
    emit({
      code: "WAVE22_MASTERY",
      path: `units[id=${WAVE22_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit must require skill.word_decoding.simple only, via the review facet.",
      severity: "error",
    });
  }

  if (unit1) {
    const required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
    const mapped = new Set<string>();
    for (const exerciseId of asStringArray(unit1["exerciseIds"])) {
      const exercise = exercises.get(exerciseId);
      if (!exercise || asStringArray(exercise["tags"]).includes("reinforcement")) continue;
      if (exercise["type"] === "presentation") continue;
      for (const skillId of skillIdsOnTargets(exercise)) mapped.add(skillId);
    }
    for (const skillId of required) {
      if (!mapped.has(skillId)) {
        emit({
          code: "WAVE22_LIVE_KEY",
          path: `units[id=${WAVE22_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }

  const assets = Array.isArray(rec["assets"]) ? rec["assets"] : [];
  const assetIds = new Set(
    assets.flatMap((row) => {
      const id = asRecord(row)?.["id"];
      return typeof id === "string" ? [id] : [];
    }),
  );
  for (const id of ["audio.word.yalab", "audio.word.walad", "audio.word.bint", WAVE21_SENTENCE_AUDIO_ID]) {
    if (!assetIds.has(id)) {
      emit({
        code: "WAVE22_AUDIO",
        path: "assets",
        message: `Wave 22 must reuse audio asset ${id}.`,
        severity: "error",
      });
    }
  }

  for (const exercise of exercises.values()) {
    if (exercise["type"] === "presentation" && Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
      emit({
        code: "WAVE22_MASTERY",
        path: `exercises[id=${exercise["id"]}].masteryTargets`,
        message: "Presentations must have attempts 0 / no mastery targets.",
        severity: "error",
      });
    }
    if (exercise["type"] !== "presentation" && exercise["type"] !== "audio_to_word") {
      emit({
        code: "WAVE22_RUNTIME",
        path: `exercises[id=${exercise["id"]}].type`,
        message: "Wave 22 must reuse presentation + audio_to_word only.",
        severity: "error",
      });
    }
    const config = asRecord(exercise["config"]);
    if (config && (config["generate"] === true || config["morphology"] === true || config["runtimeForm"] === true)) {
      emit({
        code: "WAVE22_RUNTIME",
        path: `exercises[id=${exercise["id"]}].config`,
        message: "الْوَلَدُ and الْوَلَدُ يَلْعَبُ remain authored strings. No runtime morphology.",
        severity: "error",
      });
    }
    for (const label of choiceLabels(exercise)) {
      if (TANWEEN.test(label) || TAA_MARBUTA.test(label) || ALIF_MAQSURA.test(label) || HAMZA_SEATS.test(label) || SHADDA.test(label)) {
        emit({
          code: "WAVE22_PHONICS",
          path: `exercises[id=${exercise["id"]}].choices`,
          message: `Choice label must not introduce tanween, hamza, shadda, ة, or ى: "${label}".`,
          severity: "error",
        });
      }
      if (PRONOUN_HUWA.test(label) || PRONOUN_HIYA.test(label) || DEMONSTRATIVE.test(label)) {
        emit({
          code: "WAVE22_PRONOUN",
          path: `exercises[id=${exercise["id"]}].choices`,
          message: `Choice label must not introduce a pronoun or demonstrative: "${label}".`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave22WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE22_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE22_BAND_A_REF",
        path: "words",
        message: `Wave 22 word "${id}" is not in production Band A.`,
        severity: "error",
      });
      continue;
    }
    if (!slice) continue;
    const fields: Array<[string, unknown, unknown]> = [
      ["lemma", slice["lemma"], source["lemma"]],
      ["diacritized", slice["diacritized"], source["diacritized"]],
      ["teachingForm", slice["teachingForm"], source["teachingForm"]],
      ["pos", slice["pos"], source["pos"]],
      ["vocabBand", slice["vocabBand"], source["vocabBand"]],
      ["subBand", slice["subBand"], source["subBand"]],
      ["category", slice["category"], source["category"]],
    ];
    for (const [field, left, right] of fields) {
      if (left !== right) {
        emit({
          code: "WAVE22_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 22 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE22_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 22 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
  }
}
