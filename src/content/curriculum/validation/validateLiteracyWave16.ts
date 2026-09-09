/**
 * Deterministic Wave 16 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 16 production bundle.
 * Waves 1–15 stay frozen. Kasra-closed CLASS transfer: بِ then ـت then بِنْت.
 * Compact two-unit wave. No scored bin.closed, no new phonics rule, Wave 17.
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
import {
  WAVE15_FINAL_UNIT_ID,
  WAVE15_LETTER_IDS,
  WAVE15_WORD_IDS,
} from "./validateLiteracyWave15.ts";

export const LITERACY_WAVE16_META_ID = "hurufi.production.literacy.wave16";

export const WAVE16_LETTER_IDS = [] as const;

export const WAVE16_WORD_IDS = ["word.bint"] as const;

export const WAVE16_BAND_A_WORD_IDS = ["word.bint"] as const;

export const WAVE16_PATH_ID = "path.literacy.wave16";

export const WAVE16_UNIT_IDS = [
  "unit.literacy.wave16.ba_kasra_ta_final",
  "unit.literacy.wave16.bint",
] as const;

export const WAVE16_FIRST_UNIT_ID = "unit.literacy.wave16.ba_kasra_ta_final";
export const WAVE16_FINAL_UNIT_ID = "unit.literacy.wave16.bint";

export const WAVE16_EXTERNAL_PREREQ_UNIT_IDS = [WAVE15_FINAL_UNIT_ID] as const;

const FOIL_LETTER_IDS = ["letter.alif"] as const;

const FORBIDDEN_LETTERS = [
  "letter.ghain",
  "letter.haa",
  "letter.kha",
  "letter.tah",
  "letter.tha",
] as const;

const FORBIDDEN_SKILL_PREFIXES = [
  "skill.shadda.",
  "skill.tanween.",
  "skill.hamza.",
  "skill.taa_marbuta.",
  "skill.alif_maqsura.",
  "skill.articulation.",
  "skill.short_vowel.damma",
] as const;

const FORBIDDEN_WORDS = [
  "word.fil",
  "word.halib",
  "word.masjid",
  "word.miftah",
  "word.sinn",
  "word.barid",
  "word.laa",
  "word.naam",
  "word.shay",
] as const;

const SAFE_FOIL_WORDS = ["word.jism", "word.bab", "word.inab", "word.kitab"] as const;
const FINAL_TA = "ـت";

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
] as const;

const HAMZA_SEATS = /[أإآ]/u;
const SHADDA = /\u0651/u;
const DAMMA = /\u064F/u;
const TANWEEN = /[\u064B\u064C\u064D]/u;
const TAA_MARBUTA = /ة/u;
const ALIF_MAQSURA = /ى/u;
const DIPHTHONG = /[َُِ][وي]ْ/u;
const SUKUN = /\u0652/u;
const KASRA = /\u0650/u;
const FATHA = /\u064E/u;
const MADD_YAA = /ِي(?!\u0652)/u;
const MADD_WAW = /ُو(?!\u0652)/u;

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
  if ((WAVE12_LETTER_IDS as readonly string[]).includes(id)) return 12;
  return undefined;
}

function skillIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((row) => {
    const rec = asRecord(row);
    return rec && typeof rec["skillId"] === "string" ? [rec["skillId"]] : [];
  });
}

function childTitleStrings(data: unknown): string[] {
  const rec = asRecord(data);
  if (!rec) return [];
  const out: string[] = [];
  const push = (value: unknown) => {
    if (typeof value === "string" && value.length > 0) out.push(value);
  };
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
  return out;
}

function childVisibleStrings(data: unknown): string[] {
  const rec = asRecord(data);
  if (!rec) return [];
  const out: string[] = [...childTitleStrings(data)];
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

function letterFormsOnWord(word: Record<string, unknown>): Array<{ letterId: string; form: string }> {
  const rows = Array.isArray(word["requiredLetterForms"]) ? word["requiredLetterForms"] : [];
  return rows.flatMap((row) => {
    const rec = asRecord(row);
    const letterId = rec?.["letterId"];
    const form = rec?.["form"];
    if (typeof letterId !== "string" || typeof form !== "string") return [];
    return [{ letterId, form }];
  });
}

export function isLiteracyWave16Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE16_META_ID;
}

export function validateLiteracyWave16Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE16_META",
        path: "meta.kind",
        message: "Literacy Wave 16 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE16_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 16 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-17") || blob.includes("wave17") || blob.includes("path.literacy.wave17")) {
    emit({
      code: "WAVE16_SCOPE",
      path: "$",
      message: "Wave 16 must not declare a Wave 17 path, route, or CTA.",
      severity: "error",
    });
  }
  for (const id of FORBIDDEN_WORDS) {
    if (blob.includes(id) || blob.includes(id.replace("word.", "word:"))) {
      emit({
        code: "WAVE16_SCOPE",
        path: "$",
        message: `Wave 16 must not include forbidden word ${id}.`,
        severity: "error",
      });
    }
  }
  if (blob.includes("missing_haraka") || blob.includes("diacritic:ba.kasra")) {
    emit({
      code: "WAVE16_MASTERY",
      path: "$",
      message: "Wave 16 must not require mark-only kasra discrimination.",
      severity: "error",
    });
  }
  if (blob.includes("diacritic:mim.sukun") || blob.includes("syllable.mim.sukun")) {
    emit({
      code: "WAVE16_MASTERY",
      path: "$",
      message: "Wave 16 must not reteach sukun mark discrimination.",
      severity: "error",
    });
  }
  if (
    blob.includes("syllable.bin.closed") ||
    blob.includes("letter:bin.closed") ||
    blob.includes("mastery.letter.bin.closed")
  ) {
    emit({
      code: "WAVE16_CHUNK",
      path: "$",
      message: "Wave 16 must not author scored syllable.bin.closed / letter:bin.closed.",
      severity: "error",
    });
  }
  if (blob.includes("letter:ta.form.medial") || blob.includes("mastery.letter.ta.form.medial")) {
    emit({
      code: "WAVE16_FORM",
      path: "$",
      message: "Wave 16 must not require letter:ta.form.medial as mastery.",
      severity: "error",
    });
  }
  if (blob.includes("letter:ta.form.initial") || blob.includes("mastery.letter.ta.form.initial")) {
    emit({
      code: "WAVE16_FORM",
      path: "$",
      message: "Wave 16 must not re-quiz letter:ta.form.initial.",
      severity: "error",
    });
  }
  if (FORBIDDEN_LETTERS.some((id) => blob.includes(`"${id}"`))) {
    emit({
      code: "WAVE16_LETTER",
      path: "$",
      message: "Wave 16 must not teach a new consonant.",
      severity: "error",
    });
  }
  if (
    blob.includes("review-wave16") ||
    blob.includes("review.wave16") ||
    blob.includes("word:bint.review") ||
    blob.includes("skill.articulation")
  ) {
    emit({
      code: "WAVE16_REVIEW",
      path: "$",
      message: "Wave 16 must not require a review key or a new articulation skill.",
      severity: "error",
    });
  }
  for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
    if (blob.includes(`"${prefix}`) || blob.includes(prefix)) {
      emit({
        code: "WAVE16_PHONICS",
        path: "$",
        message: `Wave 16 must not introduce forbidden skill ${prefix}.`,
        severity: "error",
      });
      break;
    }
  }

  for (const text of childTitleStrings(data)) {
    if (HAMZA_SEATS.test(text) || SHADDA.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text)) {
      emit({
        code: "WAVE16_TITLE",
        path: "childTitle",
        message: `Wave 16 child titles must not contain hamza, shadda, ة, or ى: "${text}".`,
        severity: "error",
      });
    }
  }
  for (const text of childVisibleStrings(data)) {
    if (HAMZA_SEATS.test(text)) {
      emit({
        code: "WAVE16_HAMZA",
        path: "childVisible",
        message: `Wave 16 child-visible copy must not contain أ / إ / آ: "${text}".`,
        severity: "error",
      });
    }
  }

  const phonicsVisible: string[] = [...childTitleStrings(data)];
  if (rec) {
    for (const row of Array.isArray(rec["exercises"]) ? rec["exercises"] : []) {
      const exercise = asRecord(row);
      if (!exercise) continue;
      const config = asRecord(exercise["config"]);
      if (config) {
        for (const key of ["left", "right", "result"] as const) {
          if (typeof config[key] === "string") phonicsVisible.push(config[key]);
        }
      }
      for (const choice of Array.isArray(exercise["choices"]) ? exercise["choices"] : []) {
        const label = asRecord(choice)?.["label"];
        if (typeof label === "string") phonicsVisible.push(label);
      }
    }
    for (const row of Array.isArray(rec["syllables"]) ? rec["syllables"] : []) {
      const text = asRecord(row)?.["text"];
      if (typeof text === "string") phonicsVisible.push(text);
    }
    for (const row of Array.isArray(rec["words"]) ? rec["words"] : []) {
      const word = asRecord(row);
      if (!word) continue;
      if (typeof word["teachingForm"] === "string") phonicsVisible.push(word["teachingForm"]);
      if (typeof word["diacritized"] === "string") phonicsVisible.push(word["diacritized"]);
    }
  }
  for (const text of phonicsVisible) {
    if (DAMMA.test(text) || TANWEEN.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text) || DIPHTHONG.test(text) || MADD_YAA.test(text) || MADD_WAW.test(text)) {
      emit({
        code: "WAVE16_PHONICS",
        path: "childVisible",
        message: `Wave 16 glyphs/titles must not contain damma, madd-yaa/waw, tanween, ة, ى, or a diphthong: "${text}".`,
        severity: "error",
      });
    }
  }

  const priorLetters = stringSet(PRIOR_LETTER_IDS);
  const allowedLetters = new Set<string>([...PRIOR_LETTER_IDS, ...WAVE16_LETTER_IDS, ...FOIL_LETTER_IDS]);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  let foundBa = false;
  let foundNun = false;
  let foundTa = false;
  for (let i = 0; i < letters.length; i++) {
    const letter = asRecord(letters[i]);
    if (!letter) continue;
    const id = typeof letter["id"] === "string" ? letter["id"] : "";
    if (id && !allowedLetters.has(id)) {
      emit({
        code: "WAVE16_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 16 must not introduce untaught letter "${id}".`,
        severity: "error",
      });
    }
    if (id === "letter.ba") {
      foundBa = true;
      if (letter["nonConnecting"] === true) {
        emit({
          code: "WAVE16_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.ba must remain dual-joining so بِنْت begins with initial بـ.",
          severity: "error",
        });
      }
    }
    if (id === "letter.nun") {
      foundNun = true;
      const forms = asRecord(letter["forms"]);
      if (forms?.["medial"] !== "ـنـ") {
        emit({
          code: "WAVE16_FORM",
          path: `letters[${i}].forms.medial`,
          message: "letter.nun medial form must be ـنـ.",
          severity: "error",
        });
      }
      if (letter["nonConnecting"] === true) {
        emit({
          code: "WAVE16_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.nun must remain dual-joining so ن in بِنْت is medial ـنـ.",
          severity: "error",
        });
      }
    }
    if (id === "letter.ta") {
      foundTa = true;
      const forms = asRecord(letter["forms"]);
      if (forms?.["final"] !== FINAL_TA) {
        emit({
          code: "WAVE16_FORM",
          path: `letters[${i}].forms.final`,
          message: "letter.ta final form must be ـت.",
          severity: "error",
        });
      }
      if (letter["nonConnecting"] === true) {
        emit({
          code: "WAVE16_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.ta must remain dual-joining so ت in بِنْت is final ـت.",
          severity: "error",
        });
      }
    }
    const wave = expectedPriorWave(id);
    if (wave !== undefined && priorLetters.has(id)) {
      const tags = asStringArray(letter["tags"]);
      if (!tags.includes("recycled")) {
        emit({
          code: "WAVE16_LETTER",
          path: `letters[${i}].tags`,
          message: `Recycled letter "${id}" must be tagged recycled.`,
          severity: "error",
        });
      }
    }
  }
  if (!foundBa) {
    emit({
      code: "WAVE16_LETTER",
      path: "letters",
      message: "Wave 16 must include recycled letter.ba as the kasra carrier.",
      severity: "error",
    });
  }
  if (!foundNun) {
    emit({
      code: "WAVE16_LETTER",
      path: "letters",
      message: "Wave 16 must include recycled letter.nun for medial ـنـ in بِنْت.",
      severity: "error",
    });
  }
  if (!foundTa) {
    emit({
      code: "WAVE16_LETTER",
      path: "letters",
      message: "Wave 16 must include recycled letter.ta for final ـت.",
      severity: "error",
    });
  }

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE16_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  for (let i = 0; i < words.length; i++) {
    const word = asRecord(words[i]);
    if (!word) continue;
    const id = typeof word["id"] === "string" ? word["id"] : "";
    if (id && !allowedWords.has(id)) {
      emit({
        code: "WAVE16_WORD",
        path: `words[${i}].id`,
        message: `Wave 16 must not introduce untaught word "${id}".`,
        severity: "error",
      });
    }
    if ((WAVE16_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
    if (id === "word.bint") {
      if (word["teachingForm"] !== "بِنْت" || word["diacritized"] !== "بِنْت") {
        emit({
          code: "WAVE16_WORD",
          path: `words[${i}].teachingForm`,
          message: "word.bint teachingForm must be بِنْت.",
          severity: "error",
        });
      }
      if (word["lemma"] !== "بنت") {
        emit({
          code: "WAVE16_WORD",
          path: `words[${i}].lemma`,
          message: "word.bint lemma must be بنت.",
          severity: "error",
        });
      }
      if (word["category"] !== "family") {
        emit({
          code: "WAVE16_WORD",
          path: `words[${i}].category`,
          message: "word.bint category must be family.",
          severity: "error",
        });
      }
      if (word["subBand"] !== "A2" || word["vocabBand"] !== "A") {
        emit({
          code: "WAVE16_WORD",
          path: `words[${i}].subBand`,
          message: "word.bint Band must be A / A2.",
          severity: "error",
        });
      }
      if (word["legacyId"] !== undefined) {
        emit({
          code: "WAVE16_WORD",
          path: `words[${i}].legacyId`,
          message: "word.bint must not invent a 720 legacyId.",
          severity: "error",
        });
      }
      if (word["highFrequency"] !== true || word["frequencyBand"] !== "core") {
        emit({
          code: "WAVE16_WORD",
          path: `words[${i}].highFrequency`,
          message: "word.bint must remain highFrequency core.",
          severity: "error",
        });
      }
      const form = typeof word["teachingForm"] === "string" ? word["teachingForm"] : "";
      if (!KASRA.test(form) || !SUKUN.test(form) || TANWEEN.test(form)) {
        emit({
          code: "WAVE16_WORD",
          path: `words[${i}].teachingForm`,
          message: "بِنْت must keep kasra + sukun and must not use tanween.",
          severity: "error",
        });
      }
      if (FATHA.test(form)) {
        emit({
          code: "WAVE16_WORD",
          path: `words[${i}].teachingForm`,
          message: "word.bint teachingForm must not use fatha as a target vowel.",
          severity: "error",
        });
      }
      const phonics = asStringArray(word["phonicsSkillIds"]);
      if (
        phonics.join(",") !== "skill.short_vowel.kasra,skill.sukun.basic" &&
        phonics.join(",") !== "skill.sukun.basic,skill.short_vowel.kasra"
      ) {
        emit({
          code: "WAVE16_WORD",
          path: `words[${i}].phonicsSkillIds`,
          message: "word.bint phonics must be kasra + sukun only.",
          severity: "error",
        });
      }
      const forms = letterFormsOnWord(word);
      if (
        !forms.some((row) => row.letterId === "letter.ba" && row.form === "initial") ||
        !forms.some((row) => row.letterId === "letter.nun" && row.form === "medial") ||
        !forms.some((row) => row.letterId === "letter.ta" && row.form === "final")
      ) {
        emit({
          code: "WAVE16_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "word.bint must annotate initial ba, medial nun, and final ta.",
          severity: "error",
        });
      }
    }
    if ((id === "word.jism" || id === "word.bab") && letterFormsOnWord(word).length > 0) {
      emit({
        code: "WAVE16_WORD",
        path: `words[${i}].requiredLetterForms`,
        message: `Foil "${id}" must not carry requiredLetterForms (PREMATURE_WORD).`,
        severity: "error",
      });
    }
  }
  for (const id of WAVE16_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE16_WORD",
        path: "words",
        message: `Wave 16 must include target word ${id}.`,
        severity: "error",
      });
    }
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  for (let i = 0; i < syllables.length; i++) {
    const syllable = asRecord(syllables[i]);
    if (!syllable) continue;
    if (syllable["pattern"] === "CVC") {
      emit({
        code: "WAVE16_CHUNK",
        path: `syllables[${i}].pattern`,
        message: "Wave 16 must not author a CVC syllable record (no scored closed chunk).",
        severity: "error",
      });
    }
    if (syllable["id"] === "syllable.bin.closed") {
      emit({
        code: "WAVE16_CHUNK",
        path: `syllables[${i}].id`,
        message: "Wave 16 must not include syllable.bin.closed.",
        severity: "error",
      });
    }
  }

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 2) {
    emit({
      code: "WAVE16_UNITS",
      path: "units",
      message: "Wave 16 must declare exactly two units.",
      severity: "error",
    });
  }
  const unit1 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE16_FIRST_UNIT_ID));
  const unit2 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE16_FINAL_UNIT_ID));
  if (!unit1 || !unit2) {
    emit({
      code: "WAVE16_UNITS",
      path: "units",
      message: "Wave 16 must include ba_kasra_ta_final and bint units.",
      severity: "error",
    });
    return;
  }

  if (unit1["titleAr"] !== "بِ" || unit2["titleAr"] !== "بِنْت") {
    emit({
      code: "WAVE16_TITLE",
      path: "units",
      message: "Wave 16 child titles must be بِ, بِنْت.",
      severity: "error",
    });
  }

  if (asStringArray(unit1["prereqUnitIds"])[0] !== WAVE15_FINAL_UNIT_ID) {
    emit({
      code: "WAVE16_PREREQ",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}].prereqUnitIds`,
      message: "Wave 16 Unit 1 prerequisite must be unit.literacy.wave15.jism.",
      severity: "error",
    });
  }
  if (asStringArray(unit2["prereqUnitIds"])[0] !== WAVE16_FIRST_UNIT_ID) {
    emit({
      code: "WAVE16_PREREQ",
      path: `units[id=${WAVE16_FINAL_UNIT_ID}].prereqUnitIds`,
      message: "Unit 2 must unlock after Unit 1.",
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = asRecord(paths.find((row) => asRecord(row)?.["id"] === WAVE16_PATH_ID));
  if (!path) {
    emit({
      code: "WAVE16_PATH",
      path: "paths",
      message: "Wave 16 must include path.literacy.wave16.",
      severity: "error",
    });
  } else if (asStringArray(path["unitIds"]).join(",") !== WAVE16_UNIT_IDS.join(",")) {
    emit({
      code: "WAVE16_PATH",
      path: "paths[id=path.literacy.wave16].unitIds",
      message: "Wave 16 path must list exactly the two Wave 16 units in order.",
      severity: "error",
    });
  }

  const u1Exercises = asStringArray(unit1["exerciseIds"]);
  const u2Exercises = asStringArray(unit2["exerciseIds"]);
  if (asStringArray(unit1["wordIds"]).length > 0) {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}]`,
      message: "Unit 1 must have no word target.",
      severity: "error",
    });
  }

  const u1Presentations = u1Exercises.filter((id) => exercises.get(id)?.["type"] === "presentation");
  const firstScoredU1 = u1Exercises.find((id) => exercises.get(id)?.["type"] !== "presentation");
  if (u1Presentations.length < 3 || u1Exercises.slice(0, u1Presentations.length).some((id) => exercises.get(id)?.["type"] !== "presentation")) {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must place ALL presentations at the front.",
      severity: "error",
    });
  }
  for (const id of u1Exercises) {
    const config = asRecord(exercises.get(id)?.["config"]);
    if (config?.["result"] === "بِنْ" || config?.["left"] === "بِنْ") {
      emit({
        code: "WAVE16_FLOW",
        path: `exercises[id=${id}]`,
        message: "Unit 1 must not present بِنْ. Closed rehearsal belongs in Unit 2.",
        severity: "error",
      });
    }
  }

  const showFatha = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["syllableId"] === "syllable.ba.fatha");
  const showKasra = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["syllableId"] === "syllable.ba.kasra");
  const showFinal = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["result"] === FINAL_TA);
  const showFathaEx = showFatha ? exercises.get(showFatha) : undefined;
  const showKasraEx = showKasra ? exercises.get(showKasra) : undefined;
  const showFinalEx = showFinal ? exercises.get(showFinal) : undefined;
  if (showFathaEx?.["type"] !== "presentation" || asRecord(showFathaEx["config"])?.["show"] !== "cv") {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must start with familiar بَ SHOW (show: cv).",
      severity: "error",
    });
  }
  if (showKasraEx?.["type"] !== "presentation" || asRecord(showKasraEx["config"])?.["show"] !== "cv") {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must SHOW ب + ِ → بِ before scoring.",
      severity: "error",
    });
  }
  const finalConfig = asRecord(showFinalEx?.["config"]);
  if (
    showFinalEx?.["type"] !== "presentation" ||
    finalConfig?.["show"] !== "chunk" ||
    finalConfig?.["result"] !== FINAL_TA
  ) {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must SHOW final ـت before scored form identification.",
      severity: "error",
    });
  }
  if (showFatha && showKasra && u1Exercises.indexOf(showFatha) > u1Exercises.indexOf(showKasra)) {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}].exerciseIds`,
      message: "Familiar بَ SHOW must occur before بِ SHOW.",
      severity: "error",
    });
  }
  if (showKasra && showFinal && u1Exercises.indexOf(showKasra) > u1Exercises.indexOf(showFinal)) {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}].exerciseIds`,
      message: "بِ SHOW must occur before ـت SHOW.",
      severity: "error",
    });
  }
  if (firstScoredU1 && showFinal && u1Exercises.indexOf(showFinal) > u1Exercises.indexOf(firstScoredU1)) {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unscored ـت must occur before scored evidence.",
      severity: "error",
    });
  }

  const kasraScoreEx = firstScoredU1 ? exercises.get(firstScoredU1) : undefined;
  if (kasraScoreEx?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}].exerciseIds`,
      message: "First scored Unit 1 evidence must be syllable_blending for بِ.",
      severity: "error",
    });
  } else {
    const choices = asStringArray(
      (Array.isArray(kasraScoreEx["choices"]) ? kasraScoreEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    const hasJimOrAin = choices.includes("syllable.jim.kasra") || choices.includes("syllable.ain.kasra");
    if (
      asRecord(kasraScoreEx["success"])?.["correctChoiceId"] !== "syllable.ba.kasra" ||
      !choices.includes("syllable.ba.kasra") ||
      !choices.includes("syllable.ba.fatha") ||
      !hasJimOrAin
    ) {
      emit({
        code: "WAVE16_FLOW",
        path: `exercises[id=${firstScoredU1}].choices`,
        message: "Scored kasra activity must target بِ with foils بَ and جِ (or عِ).",
        severity: "error",
      });
    }
    const targetSkills = skillIdsOnTargets(kasraScoreEx);
    if (targetSkills.includes("skill.short_vowel.fatha") || targetSkills.some((id) => id.includes("discrimination"))) {
      emit({
        code: "WAVE16_LIVE_KEY",
        path: `exercises[id=${firstScoredU1}].masteryTargets`,
        message: "Unit 1 must not gate letter:ba.fatha or mark-discrimination.",
        severity: "error",
      });
    }
    const targets = Array.isArray(kasraScoreEx["masteryTargets"]) ? kasraScoreEx["masteryTargets"] : [];
    if (targets.some((row) => ["letter.kaf", "letter.ain", "letter.jim"].includes(String(asRecord(row)?.["letterId"] ?? "")))) {
      emit({
        code: "WAVE16_LIVE_KEY",
        path: `exercises[id=${firstScoredU1}].masteryTargets`,
        message: "Historical kaf/ain/jim kasra must not be a Wave 16 mastery target.",
        severity: "error",
      });
    }
  }

  const formScoreId = u1Exercises.find((id) => exercises.get(id)?.["type"] === "letter_recognition");
  const formScoreEx = formScoreId ? exercises.get(formScoreId) : undefined;
  if (formScoreEx?.["type"] !== "letter_recognition") {
    emit({
      code: "WAVE16_FORM",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must include scored final-ta form identification.",
      severity: "error",
    });
  } else {
    const config = asRecord(formScoreEx["config"]);
    if (config?.["targetForm"] !== "final" || config?.["letterId"] !== "letter.ta") {
      emit({
        code: "WAVE16_FORM",
        path: `exercises[id=${formScoreId}].config`,
        message: "Form quiz must target letter.ta final ـت.",
        severity: "error",
      });
    }
    const targets = Array.isArray(formScoreEx["masteryTargets"]) ? formScoreEx["masteryTargets"] : [];
    if (targets.some((row) => asRecord(row)?.["letterForm"] === "medial" || asRecord(row)?.["letterForm"] === "initial")) {
      emit({
        code: "WAVE16_FORM",
        path: `exercises[id=${formScoreId}].masteryTargets`,
        message: "Historical ta medial/initial must not substitute for final ta.",
        severity: "error",
      });
    }
    if (targets.some((row) => asRecord(row)?.["letterId"] !== "letter.ta")) {
      emit({
        code: "WAVE16_FORM",
        path: `exercises[id=${formScoreId}].masteryTargets`,
        message: "Form quiz must not require extra letter-form keys.",
        severity: "error",
      });
    }
  }

  const extraFormQuizzes = u1Exercises.filter((id) => {
    const exercise = exercises.get(id);
    return exercise?.["type"] === "letter_recognition" && id !== formScoreId;
  });
  if (extraFormQuizzes.length > 0) {
    emit({
      code: "WAVE16_FORM",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}].exerciseIds`,
      message: "Wave 16 must not add extra form quizzes beyond final ـت.",
      severity: "error",
    });
  }

  const u1Required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
  if (
    !u1Required.includes("skill.short_vowel.kasra") ||
    !u1Required.includes("skill.letter_forms.positional") ||
    u1Required.length !== 2
  ) {
    emit({
      code: "WAVE16_MASTERY",
      path: `units[id=${WAVE16_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 1 must require kasra and positional forms only.",
      severity: "error",
    });
  }

  const u2Presentations = u2Exercises.filter((id) => exercises.get(id)?.["type"] === "presentation");
  if (u2Exercises.slice(0, u2Presentations.length).some((id) => exercises.get(id)?.["type"] !== "presentation")) {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must place ALL presentations at the front.",
      severity: "error",
    });
  }
  const binShow = u2Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["result"] === "بِنْ");
  const bintShow = u2Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["result"] === "بِنْت");
  const binConfig = asRecord(binShow ? exercises.get(binShow)?.["config"] : undefined);
  const bintConfig = asRecord(bintShow ? exercises.get(bintShow)?.["config"] : undefined);
  if (
    !binShow ||
    binConfig?.["show"] !== "chunk" ||
    binConfig?.["left"] !== "بِ" ||
    binConfig?.["right"] !== "نْ" ||
    binConfig?.["result"] !== "بِنْ"
  ) {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must include unscored بِ + نْ → بِنْ rehearsal.",
      severity: "error",
    });
  }
  if (binShow && (exercises.get(binShow)?.["masteryTargets"] as unknown[] | undefined)?.length) {
    emit({
      code: "WAVE16_CHUNK",
      path: `exercises[id=${binShow}].masteryTargets`,
      message: "بِنْ rehearsal must remain unscored and must not write letter:bin.closed.",
      severity: "error",
    });
  }
  if (
    !bintShow ||
    bintConfig?.["show"] !== "chunk" ||
    bintConfig?.["left"] !== "بِنْ" ||
    bintConfig?.["result"] !== "بِنْت"
  ) {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must include unscored بِنْ + ت → بِنْت compose.",
      severity: "error",
    });
  }
  if (binShow && bintShow && u2Exercises.indexOf(binShow) > u2Exercises.indexOf(bintShow)) {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FINAL_UNIT_ID}].exerciseIds`,
      message: "بِنْ rehearsal must occur before بِنْت compose.",
      severity: "error",
    });
  }

  const firstScoredU2 = u2Exercises.find((id) => exercises.get(id)?.["type"] !== "presentation");
  const audioEx = firstScoredU2 ? exercises.get(firstScoredU2) : undefined;
  if (audioEx?.["type"] !== "audio_to_word") {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FINAL_UNIT_ID}].exerciseIds`,
      message: "First scored Unit 2 evidence must be audio_to_word.",
      severity: "error",
    });
  } else {
    const choices = asStringArray(
      (Array.isArray(audioEx["choices"]) ? audioEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    const labels = asStringArray(
      (Array.isArray(audioEx["choices"]) ? audioEx["choices"] : []).map((choice) => asRecord(choice)?.["label"]),
    );
    if (asRecord(audioEx["success"])?.["correctChoiceId"] !== "word.bint" || !choices.includes("word.bint") || !labels.includes("بِنْت")) {
      emit({
        code: "WAVE16_FLOW",
        path: `exercises[id=${firstScoredU2}].choices`,
        message: "audio_to_word must target بِنْت.",
        severity: "error",
      });
    }
    const foils = choices.filter((id) => id !== "word.bint");
    if (foils.some((id) => !SAFE_FOIL_WORDS.includes(id as (typeof SAFE_FOIL_WORDS)[number]) && !(PRIOR_WORD_IDS as readonly string[]).includes(id))) {
      emit({
        code: "WAVE16_FLOW",
        path: `exercises[id=${firstScoredU2}].choices`,
        message: "Foils must be already-decoded print words.",
        severity: "error",
      });
    }
  }

  const pictureIdx = u2Exercises.findIndex((id) => exercises.get(id)?.["type"] === "word_to_picture");
  const audioIdx = u2Exercises.findIndex((id) => exercises.get(id)?.["type"] === "audio_to_word");
  if (pictureIdx >= 0 && audioIdx >= 0 && pictureIdx < audioIdx) {
    emit({
      code: "WAVE16_FLOW",
      path: `units[id=${WAVE16_FINAL_UNIT_ID}].exerciseIds`,
      message: "Picture must come after audio_to_word.",
      severity: "error",
    });
  }
  if (pictureIdx >= 0) {
    const picture = exercises.get(u2Exercises[pictureIdx] ?? "");
    if (!asStringArray(picture?.["tags"]).includes("reinforcement")) {
      emit({
        code: "WAVE16_FLOW",
        path: `exercises[id=${u2Exercises[pictureIdx]}].tags`,
        message: "Picture must be reinforcement only.",
        severity: "error",
      });
    }
  }

  const u2Required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
  if (u2Required.join(",") !== "skill.word_decoding.simple") {
    emit({
      code: "WAVE16_MASTERY",
      path: `units[id=${WAVE16_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 2 must require skill.word_decoding.simple only.",
      severity: "error",
    });
  }

  const unit2Forms = Array.isArray(unit2["letterForms"]) ? unit2["letterForms"] : [];
  const formKeys = unit2Forms.flatMap((row) => {
    const recForm = asRecord(row);
    return recForm && typeof recForm["letterId"] === "string" && typeof recForm["form"] === "string"
      ? [`${recForm["letterId"]}:${recForm["form"]}`]
      : [];
  });
  if (
    !formKeys.includes("letter.ba:initial") ||
    !formKeys.includes("letter.nun:medial") ||
    !formKeys.includes("letter.ta:final")
  ) {
    emit({
      code: "WAVE16_JOINING",
      path: `units[id=${WAVE16_FINAL_UNIT_ID}].letterForms`,
      message: "Unit 2 must list initial ba, medial nun, and final ta.",
      severity: "error",
    });
  }

  for (const exercise of exercises.values()) {
    if (exercise["type"] === "presentation" && Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
      emit({
        code: "WAVE16_MASTERY",
        path: `exercises[id=${exercise["id"]}].masteryTargets`,
        message: "Presentations must have attempts 0 / no mastery targets.",
        severity: "error",
      });
    }
    if (asStringArray(exercise["tags"]).includes("review")) {
      emit({
        code: "WAVE16_REVIEW",
        path: `exercises[id=${exercise["id"]}].tags`,
        message: "Wave 16 must not require a review exercise.",
        severity: "error",
      });
    }
  }

  for (const [unitId, unit] of [
    [WAVE16_FIRST_UNIT_ID, unit1],
    [WAVE16_FINAL_UNIT_ID, unit2],
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
          code: "WAVE16_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave16WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE16_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE16_BAND_A_REF",
        path: "words",
        message: `Wave 16 word "${id}" is not in production Band A.`,
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
      ["category", slice["category"], source["category"]],
    ];
    for (const [field, left, right] of fields) {
      if (left !== right) {
        emit({
          code: "WAVE16_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 16 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE16_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 16 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== undefined || source["legacyId"] !== undefined) {
      emit({
        code: "WAVE16_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: "word.bint must not invent or copy a fake 720 legacyId.",
        severity: "error",
      });
    }
    if (slice["highFrequency"] !== source["highFrequency"] || slice["frequencyBand"] !== source["frequencyBand"]) {
      emit({
        code: "WAVE16_BAND_A_REF",
        path: `words[id=${id}].highFrequency`,
        message: "word.bint highFrequency/core must match Band A.",
        severity: "error",
      });
    }
  }
}
