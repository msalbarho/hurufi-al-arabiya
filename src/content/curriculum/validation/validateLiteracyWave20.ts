/**
 * Deterministic Wave 20 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 20 production bundle.
 * Waves 1–19 stay frozen. One-unit WORD DECODING: يَلْعَبُ.
 * No sentence, no article, no pronoun, no tanween, no Wave 21.
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
import {
  WAVE19_FINAL_UNIT_ID,
  WAVE19_LETTER_IDS,
  WAVE19_WORD_IDS,
} from "./validateLiteracyWave19.ts";

export const LITERACY_WAVE20_META_ID = "hurufi.production.literacy.wave20";

export const WAVE20_LETTER_IDS = [] as const;

export const WAVE20_WORD_IDS = ["word.yalab"] as const;

export const WAVE20_BAND_A_WORD_IDS = ["word.yalab", "word.jism", "word.bint"] as const;

export const WAVE20_PATH_ID = "path.literacy.wave20";

export const WAVE20_UNIT_IDS = ["unit.literacy.wave20.yalab"] as const;

export const WAVE20_FIRST_UNIT_ID = "unit.literacy.wave20.yalab";
export const WAVE20_FINAL_UNIT_ID = "unit.literacy.wave20.yalab";

export const WAVE20_EXTERNAL_PREREQ_UNIT_IDS = [WAVE19_FINAL_UNIT_ID] as const;

const REQUIRED_LETTERS = [
  "letter.ya",
  "letter.lam",
  "letter.ain",
  "letter.ba",
  "letter.jim",
  "letter.sin",
  "letter.mim",
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
  "language.article",
  "language.pronoun",
] as const;

const FORBIDDEN_WORDS = [
  "word.yalabu",
  "word.walad",
  "word.bul",
  "word.yashrabu",
  "word.yalbasu",
] as const;

const FORBIDDEN_TARGET_STRINGS = [
  "الْوَلَدُ يَلْعَبُ",
  "وَلَد يَلْعَبُ",
  "بُلْ",
  "هُوَ",
  "syllable.yal.closed",
  "letter:yal.closed",
  "word:yalab.partial",
  "word:yalab.writing",
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
] as const;

const HAMZA_SEATS = /[أإآ]/u;
const SHADDA = /\u0651/u;
const FATHA = /\u064E/u;
const DAMMA = /\u064F/u;
const SUKUN = /\u0652/u;
const TANWEEN = /[\u064B\u064C\u064D]/u;
const TAA_MARBUTA = /ة/u;
const ALIF_MAQSURA = /ى/u;
const MADD_YAA = /ِي(?!\u0652)/u;
const MADD_WAW = /ُو(?!\u0652)/u;
const DEFINITE_ARTICLE = /الْ|ال(?=[\u0621-\u064A])/u;
const PRONOUN_HUWA = /هُوَ/u;

const CANONICAL_YALAB = "يَلْعَبُ";

const UNIT_FLOW = [
  "exercise.wave20.presentation.yal",
  "exercise.wave20.presentation.yala",
  "exercise.wave20.presentation.yalab",
  "exercise.wave20.audio_to_word.yalab",
] as const;

const LETTER_PRIOR_WAVE: Record<string, number> = {
  "letter.ya": 1,
  "letter.lam": 1,
  "letter.mim": 1,
  "letter.jim": 1,
  "letter.ba": 2,
  "letter.ta": 6,
  "letter.sin": 7,
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

export function isLiteracyWave20Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE20_META_ID;
}

export function validateLiteracyWave20Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE20_META",
        path: "meta.kind",
        message: "Literacy Wave 20 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE20_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 20 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-21") || blob.includes("wave21") || blob.includes("path.literacy.wave21")) {
    emit({
      code: "WAVE20_SCOPE",
      path: "$",
      message: "Wave 20 must not declare a Wave 21 path, route, or CTA.",
      severity: "error",
    });
  }
  if (
    blob.includes("path.literacy.wave19") ||
    blob.includes("unit.literacy.wave18") ||
    blob.includes("path.literacy.wave1\"")
  ) {
    emit({
      code: "WAVE20_SCOPE",
      path: "$",
      message: "Wave 20 must not rewrite frozen Waves 1–19 path or unit records.",
      severity: "error",
    });
  }
  for (const id of FORBIDDEN_WORDS) {
    if (blob.includes(`"${id}"`) || blob.includes(id.replace("word.", "word:"))) {
      emit({
        code: "WAVE20_SCOPE",
        path: "$",
        message: `Wave 20 must not include forbidden word ${id}.`,
        severity: "error",
      });
    }
  }
  for (const text of FORBIDDEN_TARGET_STRINGS) {
    if (blob.includes(text)) {
      emit({
        code: "WAVE20_SCOPE",
        path: "$",
        message: `Wave 20 must not include forbidden target "${text}".`,
        severity: "error",
      });
    }
  }
  if (FORBIDDEN_LETTERS.some((id) => blob.includes(`"${id}"`))) {
    emit({
      code: "WAVE20_LETTER",
      path: "$",
      message: "Wave 20 must not teach a new consonant.",
      severity: "error",
    });
  }
  for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
    if (blob.includes(`"${prefix}`) || blob.includes(prefix)) {
      emit({
        code: "WAVE20_PHONICS",
        path: "$",
        message: `Wave 20 must not introduce forbidden skill ${prefix}.`,
        severity: "error",
      });
      break;
    }
  }
  if (
    blob.includes("diacritic:") ||
    blob.includes("missing_haraka") ||
    blob.includes("damma.discrimination") ||
    blob.includes("sukun.discrimination")
  ) {
    emit({
      code: "WAVE20_LIVE_KEY",
      path: "$",
      message: "Wave 20 must not require mark-discrimination or missing_haraka.",
      severity: "error",
    });
  }
  if (
    blob.includes("letter:ba.damma") ||
    blob.includes("letter:kaf.damma") ||
    blob.includes("letter:bul.closed") ||
    blob.includes("mastery.letter.ba.damma") ||
    blob.includes("mastery.letter.bul.closed")
  ) {
    emit({
      code: "WAVE20_LIVE_KEY",
      path: "$",
      message: "Wave 20 must not re-gate letter:ba.damma, letter:kaf.damma, or letter:bul.closed.",
      severity: "error",
    });
  }
  if (
    blob.includes("skill.handwriting") ||
    blob.includes("\"tracing\"") ||
    blob.includes("word:yalab.writing")
  ) {
    emit({
      code: "WAVE20_WRITING",
      path: "$",
      message: "Wave 20 must not invent a writing/tracing mastery key.",
      severity: "error",
    });
  }
  if (
    blob.includes("picture_to_word") ||
    blob.includes("word_to_picture") ||
    blob.includes('"type": "syllable_blending"')
  ) {
    emit({
      code: "WAVE20_FLOW",
      path: "$",
      message: "Wave 20 must score audio_to_word only. No picture gate and no syllable_blending.",
      severity: "error",
    });
  }
  if (blob.includes("syllable.yal.closed") || blob.includes("syllable.bin.closed") || blob.includes("syllable.bul.closed")) {
    emit({
      code: "WAVE20_CLOSED",
      path: "$",
      message: "Wave 20 must not author syllable.yal.closed or reuse بُلْ as word content.",
      severity: "error",
    });
  }

  const sentences = Array.isArray(rec["sentences"]) ? rec["sentences"] : [];
  if (sentences.length > 0) {
    emit({
      code: "WAVE20_SENTENCE",
      path: "sentences",
      message: "Wave 20 sentences must remain empty.",
      severity: "error",
    });
  }

  const skills = Array.isArray(rec["skills"]) ? rec["skills"] : [];
  const skillRows = recordById(skills);
  if (!skillRows.has("skill.word_decoding.simple")) {
    emit({
      code: "WAVE20_PHONICS",
      path: "skills",
      message: "Wave 20 must reuse canonical skill.word_decoding.simple.",
      severity: "error",
    });
  }
  for (const row of skills) {
    const id = asRecord(row)?.["id"];
    if (typeof id !== "string") continue;
    if (!(ALLOWED_SKILLS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE20_PHONICS",
        path: `skills[id=${id}]`,
        message: "Wave 20 may only reuse historical skills needed to decode يَلْعَبُ.",
        severity: "error",
      });
    }
  }

  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  const allowedLetters = new Set<string>([...PRIOR_LETTER_IDS, ...WAVE20_LETTER_IDS]);
  for (const row of letters) {
    const letter = asRecord(row);
    const id = letter?.["id"];
    if (typeof id !== "string") continue;
    if (!allowedLetters.has(id)) {
      emit({
        code: "WAVE20_LETTER",
        path: `letters[id=${id}]`,
        message: `Wave 20 letter "${id}" was not previously taught.`,
        severity: "error",
      });
    }
    if ((WAVE20_LETTER_IDS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE20_LETTER",
        path: `letters[id=${id}]`,
        message: "Wave 20 must not introduce a new consonant.",
        severity: "error",
      });
    }
    const prior = LETTER_PRIOR_WAVE[id];
    if (prior !== undefined && letter?.["wave"] !== prior) {
      emit({
        code: "WAVE20_LETTER",
        path: `letters[id=${id}].wave`,
        message: `Recycled letter "${id}" must keep historical wave ${prior}.`,
        severity: "error",
      });
    }
  }
  for (const id of REQUIRED_LETTERS) {
    if (!letters.some((row) => asRecord(row)?.["id"] === id)) {
      emit({
        code: "WAVE20_LETTER",
        path: "letters",
        message: `Wave 20 must recycle previously taught letter ${id}.`,
        severity: "error",
      });
    }
  }

  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const wordRows = recordById(words);
  const yalab = wordRows.get("word.yalab");
  if (!yalab) {
    emit({
      code: "WAVE20_WORD",
      path: "words",
      message: "Wave 20 must copy canonical word.yalab.",
      severity: "error",
    });
  } else {
    if (
      yalab["lemma"] !== "يلعب" ||
      yalab["diacritized"] !== CANONICAL_YALAB ||
      yalab["teachingForm"] !== CANONICAL_YALAB ||
      yalab["pos"] !== "verb" ||
      yalab["category"] !== "verbs" ||
      yalab["vocabBand"] !== "A" ||
      yalab["subBand"] !== "A2"
    ) {
      emit({
        code: "WAVE20_WORD",
        path: "words[id=word.yalab]",
        message: "word.yalab must keep Band A lemma يلعب and child form يَلْعَبُ.",
        severity: "error",
      });
    }
    const text = typeof yalab["diacritized"] === "string" ? yalab["diacritized"] : "";
    if (!FATHA.test(text) || !SUKUN.test(text) || !DAMMA.test(text) || TANWEEN.test(text)) {
      emit({
        code: "WAVE20_WORD",
        path: "words[id=word.yalab].diacritized",
        message: "يَلْعَبُ must keep fatha, sukun, and final damma, with no tanween.",
        severity: "error",
      });
    }
    if (sorted(asStringArray(yalab["letterIds"])).join(",") !== ["letter.ain", "letter.ba", "letter.lam", "letter.ya"].join(",")) {
      emit({
        code: "WAVE20_WORD",
        path: "words[id=word.yalab].letterIds",
        message: "word.yalab letters must be exactly ي ل ع ب.",
        severity: "error",
      });
    }
    if (yalab["audioAssetIds"] && asRecord(yalab["audioAssetIds"])?.["citation"] !== "audio.word.yalab") {
      emit({
        code: "WAVE20_AUDIO",
        path: "words[id=word.yalab].audioAssetIds",
        message: "word.yalab must reuse audio.word.yalab.",
        severity: "error",
      });
    }
    if (yalab["imageAssetId"] !== "image.word.yalab") {
      emit({
        code: "WAVE20_WORD",
        path: "words[id=word.yalab].imageAssetId",
        message: "word.yalab must keep logical image.word.yalab.",
        severity: "error",
      });
    }
  }
  if (!wordRows.has("word.jism") || wordRows.get("word.jism")?.["diacritized"] !== "جِسْم") {
    emit({
      code: "WAVE20_WORD",
      path: "words[id=word.jism]",
      message: "Foil must reuse canonical word.jism as جِسْم.",
      severity: "error",
    });
  }
  if (!wordRows.has("word.bint") || wordRows.get("word.bint")?.["diacritized"] !== "بِنْت") {
    emit({
      code: "WAVE20_WORD",
      path: "words[id=word.bint]",
      message: "Foil must reuse canonical word.bint as بِنْت.",
      severity: "error",
    });
  }
  const wordIds = words.flatMap((row) => {
    const id = asRecord(row)?.["id"];
    return typeof id === "string" ? [id] : [];
  });
  for (const id of wordIds) {
    if (!(PRIOR_WORD_IDS as readonly string[]).includes(id) && !(WAVE20_WORD_IDS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE20_WORD",
        path: `words[id=${id}]`,
        message: `Wave 20 must not invent word "${id}".`,
        severity: "error",
      });
    }
  }
  if (sorted(wordIds).join(",") !== ["word.bint", "word.jism", "word.yalab"].join(",")) {
    emit({
      code: "WAVE20_WORD",
      path: "words",
      message: "Wave 20 words must be exactly word.yalab plus foils word.jism and word.bint.",
      severity: "error",
    });
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  const syllableRows = recordById(syllables);
  const yaFatha = syllableRows.get("syllable.ya.fatha");
  const ainFatha = syllableRows.get("syllable.ain.fatha");
  const baDamma = syllableRows.get("syllable.ba.damma");
  if (!yaFatha || yaFatha["text"] !== "يَ" || yaFatha["pattern"] !== "CV") {
    emit({
      code: "WAVE20_SYLLABLE",
      path: "syllables[id=syllable.ya.fatha]",
      message: "Wave 20 must reuse historical syllable.ya.fatha as يَ.",
      severity: "error",
    });
  }
  if (!ainFatha || ainFatha["text"] !== "عَ" || ainFatha["pattern"] !== "CV" || ainFatha["letterId"] !== "letter.ain") {
    emit({
      code: "WAVE20_SYLLABLE",
      path: "syllables[id=syllable.ain.fatha]",
      message: "Wave 20 must reuse historical syllable.ain.fatha as عَ.",
      severity: "error",
    });
  }
  if (!baDamma || baDamma["text"] !== "بُ" || baDamma["pattern"] !== "CV" || baDamma["letterId"] !== "letter.ba") {
    emit({
      code: "WAVE20_SYLLABLE",
      path: "syllables[id=syllable.ba.damma]",
      message: "Wave 20 must reuse historical syllable.ba.damma as بُ.",
      severity: "error",
    });
  }
  const closedIds = [...syllableRows.entries()]
    .filter(([id, row]) => row["pattern"] === "CVC" || id.endsWith(".closed"))
    .map(([id]) => id);
  if (closedIds.length > 0) {
    emit({
      code: "WAVE20_CLOSED",
      path: "syllables",
      message: "Wave 20 must not author a closed-chunk syllable. يَلْ is presentation-only.",
      severity: "error",
    });
  }

  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 1) {
    emit({
      code: "WAVE20_UNITS",
      path: "units",
      message: "Wave 20 must declare exactly one unit.",
      severity: "error",
    });
  }
  const unit1 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE20_FIRST_UNIT_ID));
  if (!unit1) {
    emit({
      code: "WAVE20_UNITS",
      path: "units",
      message: "Wave 20 unit id must be exactly unit.literacy.wave20.yalab.",
      severity: "error",
    });
  }

  for (const text of childTitleStrings(data)) {
    if (HAMZA_SEATS.test(text) || SHADDA.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text)) {
      emit({
        code: "WAVE20_TITLE",
        path: "childTitle",
        message: `Wave 20 child titles must not contain hamza, shadda, ة, or ى: "${text}".`,
        severity: "error",
      });
    }
    if (TANWEEN.test(text) || MADD_YAA.test(text) || MADD_WAW.test(text)) {
      emit({
        code: "WAVE20_PHONICS",
        path: "childTitle",
        message: `Wave 20 titles must not contain tanween or madd-yaa/madd-waw: "${text}".`,
        severity: "error",
      });
    }
    if (DEFINITE_ARTICLE.test(text)) {
      emit({
        code: "WAVE20_ARTICLE",
        path: "childTitle",
        message: `Wave 20 must not introduce ال: "${text}".`,
        severity: "error",
      });
    }
    if (PRONOUN_HUWA.test(text)) {
      emit({
        code: "WAVE20_PRONOUN",
        path: "childTitle",
        message: `Wave 20 must not introduce هُوَ: "${text}".`,
        severity: "error",
      });
    }
  }
  if (unit1 && unit1["titleAr"] !== CANONICAL_YALAB) {
    emit({
      code: "WAVE20_TITLE",
      path: `units[id=${WAVE20_FIRST_UNIT_ID}].titleAr`,
      message: "Unit 1 child title must be exactly يَلْعَبُ.",
      severity: "error",
    });
  }

  if (unit1 && asStringArray(unit1["prereqUnitIds"]).join(",") !== WAVE19_FINAL_UNIT_ID) {
    emit({
      code: "WAVE20_PREREQ",
      path: `units[id=${WAVE20_FIRST_UNIT_ID}].prereqUnitIds`,
      message: "Wave 20 prerequisite must be exactly unit.literacy.wave19.bul_closed.",
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = asRecord(paths.find((row) => asRecord(row)?.["id"] === WAVE20_PATH_ID));
  if (!path) {
    emit({
      code: "WAVE20_PATH",
      path: "paths",
      message: "Wave 20 must include path.literacy.wave20.",
      severity: "error",
    });
  } else if (asStringArray(path["unitIds"]).join(",") !== WAVE20_UNIT_IDS.join(",")) {
    emit({
      code: "WAVE20_PATH",
      path: "paths[id=path.literacy.wave20].unitIds",
      message: "path.literacy.wave20 must list exactly unit.literacy.wave20.yalab.",
      severity: "error",
    });
  }
  if (paths.length !== 1) {
    emit({
      code: "WAVE20_PATH",
      path: "paths",
      message: "Wave 20 must not include any other path.",
      severity: "error",
    });
  }

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const u1Exercises = unit1 ? asStringArray(unit1["exerciseIds"]) : [];
  if (u1Exercises.join(",") !== UNIT_FLOW.join(",")) {
    emit({
      code: "WAVE20_FLOW",
      path: `units[id=${WAVE20_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must be three binary SHOWs then scored يَلْعَبُ.",
      severity: "error",
    });
  }

  const showYal = exercises.get("exercise.wave20.presentation.yal");
  const showYala = exercises.get("exercise.wave20.presentation.yala");
  const showYalab = exercises.get("exercise.wave20.presentation.yalab");
  const scoreYalab = exercises.get("exercise.wave20.audio_to_word.yalab");
  const showYalConfig = asRecord(showYal?.["config"]);
  const showYalaConfig = asRecord(showYala?.["config"]);
  const showYalabConfig = asRecord(showYalab?.["config"]);

  if (
    showYal?.["type"] !== "presentation" ||
    showYalConfig?.["show"] !== "chunk" ||
    showYalConfig?.["left"] !== "يَ" ||
    showYalConfig?.["right"] !== "لْ" ||
    showYalConfig?.["result"] !== "يَلْ"
  ) {
    emit({
      code: "WAVE20_FLOW",
      path: "exercises[id=exercise.wave20.presentation.yal]",
      message: "First SHOW must be chunk يَ + لْ → يَلْ.",
      severity: "error",
    });
  }
  if (
    showYala?.["type"] !== "presentation" ||
    showYalaConfig?.["show"] !== "chunk" ||
    showYalaConfig?.["left"] !== "يَلْ" ||
    showYalaConfig?.["right"] !== "عَ" ||
    showYalaConfig?.["result"] !== "يَلْعَ"
  ) {
    emit({
      code: "WAVE20_FLOW",
      path: "exercises[id=exercise.wave20.presentation.yala]",
      message: "Second SHOW must be chunk يَلْ + عَ → يَلْعَ.",
      severity: "error",
    });
  }
  if (
    showYalab?.["type"] !== "presentation" ||
    showYalabConfig?.["show"] !== "chunk" ||
    showYalabConfig?.["left"] !== "يَلْعَ" ||
    showYalabConfig?.["right"] !== "بُ" ||
    showYalabConfig?.["result"] !== CANONICAL_YALAB
  ) {
    emit({
      code: "WAVE20_FLOW",
      path: "exercises[id=exercise.wave20.presentation.yalab]",
      message: "Third SHOW must be chunk يَلْعَ + بُ → يَلْعَبُ.",
      severity: "error",
    });
  }

  const presentationCount = [...exercises.values()].filter((row) => row["type"] === "presentation").length;
  if (presentationCount !== 3) {
    emit({
      code: "WAVE20_FLOW",
      path: "exercises",
      message: "Wave 20 must have exactly three presentations.",
      severity: "error",
    });
  }

  const firstScored = u1Exercises.find((id) => exercises.get(id)?.["type"] !== "presentation");
  if (firstScored !== "exercise.wave20.audio_to_word.yalab") {
    emit({
      code: "WAVE20_FLOW",
      path: `units[id=${WAVE20_FIRST_UNIT_ID}].exerciseIds`,
      message: "All presentations must occur before scored يَلْعَبُ.",
      severity: "error",
    });
  }

  if (scoreYalab?.["type"] !== "audio_to_word") {
    emit({
      code: "WAVE20_FLOW",
      path: "exercises[id=exercise.wave20.audio_to_word.yalab]",
      message: "Scored item must be audio_to_word for يَلْعَبُ.",
      severity: "error",
    });
  } else {
    const ids = choiceIds(scoreYalab);
    const labels = choiceLabels(scoreYalab);
    if (
      asRecord(scoreYalab["success"])?.["correctChoiceId"] !== "word.yalab" ||
      ids.join(",") !== "word.yalab,word.jism,word.bint" ||
      !labels.includes(CANONICAL_YALAB) ||
      !labels.includes("جِسْم") ||
      !labels.includes("بِنْت")
    ) {
      emit({
        code: "WAVE20_FLOW",
        path: "exercises[id=exercise.wave20.audio_to_word.yalab].choices",
        message: "Scored يَلْعَبُ choices must be exactly يَلْعَبُ / جِسْم / بِنْت.",
        severity: "error",
      });
    }
    if (
      skillIdsOnTargets(scoreYalab).join(",") !== "skill.word_decoding.simple" ||
      wordIdsOnTargets(scoreYalab).join(",") !== "word.yalab" ||
      letterIdsOnTargets(scoreYalab).length > 0 ||
      syllableIdsOnTargets(scoreYalab).length > 0
    ) {
      emit({
        code: "WAVE20_LIVE_KEY",
        path: "exercises[id=exercise.wave20.audio_to_word.yalab].masteryTargets",
        message: "Required live evidence must be exactly word:yalab.decoding from word.yalab.",
        severity: "error",
      });
    }
  }

  const u1Required = unit1 ? asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]) : [];
  if (u1Required.join(",") !== "skill.word_decoding.simple") {
    emit({
      code: "WAVE20_MASTERY",
      path: `units[id=${WAVE20_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 1 must require skill.word_decoding.simple only.",
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
          code: "WAVE20_LIVE_KEY",
          path: `units[id=${WAVE20_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }

  for (const exercise of exercises.values()) {
    if (exercise["type"] === "presentation" && Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
      emit({
        code: "WAVE20_MASTERY",
        path: `exercises[id=${exercise["id"]}].masteryTargets`,
        message: "Presentations must have attempts 0 / no mastery targets.",
        severity: "error",
      });
    }
    if (exercise["type"] !== "presentation" && exercise["type"] !== "audio_to_word") {
      emit({
        code: "WAVE20_RUNTIME",
        path: `exercises[id=${exercise["id"]}].type`,
        message: "Wave 20 must reuse existing presentation + audio_to_word engines only.",
        severity: "error",
      });
    }
    for (const label of choiceLabels(exercise)) {
      if (TANWEEN.test(label) || TAA_MARBUTA.test(label) || ALIF_MAQSURA.test(label) || HAMZA_SEATS.test(label) || SHADDA.test(label)) {
        emit({
          code: "WAVE20_PHONICS",
          path: `exercises[id=${exercise["id"]}].choices`,
          message: `Choice label must not introduce tanween, hamza, shadda, ة, or ى: "${label}".`,
          severity: "error",
        });
      }
      if (DEFINITE_ARTICLE.test(label) || PRONOUN_HUWA.test(label)) {
        emit({
          code: "WAVE20_ARTICLE",
          path: `exercises[id=${exercise["id"]}].choices`,
          message: `Choice label must not introduce ال or هُوَ: "${label}".`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave20WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE20_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE20_BAND_A_REF",
        path: "words",
        message: `Wave 20 word "${id}" is not in production Band A.`,
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
          code: "WAVE20_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 20 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE20_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 20 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
  }
}
