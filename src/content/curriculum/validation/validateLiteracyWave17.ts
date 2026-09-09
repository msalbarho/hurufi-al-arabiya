/**
 * Deterministic Wave 17 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 17 production bundle.
 * Waves 1–16 stay frozen. Language spark + writing look: نَعَم / لَا / وَ.
 * Compact two-unit wave. No damma, no sentence, no Wave 18.
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
import {
  WAVE16_FINAL_UNIT_ID,
  WAVE16_LETTER_IDS,
  WAVE16_WORD_IDS,
} from "./validateLiteracyWave16.ts";

export const LITERACY_WAVE17_META_ID = "hurufi.production.literacy.wave17";

export const WAVE17_LETTER_IDS = [] as const;

export const WAVE17_WORD_IDS = ["word.naam", "word.laa", "word.wa"] as const;

export const WAVE17_BAND_A_WORD_IDS = ["word.naam", "word.laa"] as const;

export const WAVE17_PATH_ID = "path.literacy.wave17";

export const WAVE17_UNIT_IDS = [
  "unit.literacy.wave17.naam_laa",
  "unit.literacy.wave17.wa_bint",
] as const;

export const WAVE17_FIRST_UNIT_ID = "unit.literacy.wave17.naam_laa";
export const WAVE17_FINAL_UNIT_ID = "unit.literacy.wave17.wa_bint";

export const WAVE17_EXTERNAL_PREREQ_UNIT_IDS = [WAVE16_FINAL_UNIT_ID] as const;

const CARRIER_LETTER_IDS = ["letter.alif"] as const;

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
  "word.shay",
  "word.yalabu",
  "word.huwa",
  "word.huna",
  "word.umm",
] as const;

const FORBIDDEN_TARGET_STRINGS = ["هَلْ", "هَذَا", "هَذِهِ", "يَلْعَبُ", "هُوَ", "هُنَا", "أُمّ"] as const;

const PHRASE = "وَلَد وَبِنْت";

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
] as const;

const HAMZA_SEATS = /[أإآ]/u;
const SHADDA = /\u0651/u;
const DAMMA = /\u064F/u;
const TANWEEN = /[\u064B\u064C\u064D]/u;
const TAA_MARBUTA = /ة/u;
const ALIF_MAQSURA = /ى/u;
const DIPHTHONG = /[َُِ][وي]ْ/u;
const FATHA = /\u064E/u;
const MADD_YAA = /ِي(?!\u0652)/u;
const MADD_WAW = /ُو(?!\u0652)/u;
const DEFINITE_ARTICLE = /الْ|ال(?=[\u0621-\u064A])/u;

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

function wordIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((row) => {
    const rec = asRecord(row);
    return rec && typeof rec["wordId"] === "string" ? [rec["wordId"]] : [];
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

export function isLiteracyWave17Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE17_META_ID;
}

export function validateLiteracyWave17Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE17_META",
        path: "meta.kind",
        message: "Literacy Wave 17 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE17_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 17 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-18") || blob.includes("wave18") || blob.includes("path.literacy.wave18")) {
    emit({
      code: "WAVE17_SCOPE",
      path: "$",
      message: "Wave 17 must not declare a Wave 18 path, route, or CTA.",
      severity: "error",
    });
  }
  for (const id of FORBIDDEN_WORDS) {
    if (blob.includes(id) || blob.includes(id.replace("word.", "word:"))) {
      emit({
        code: "WAVE17_SCOPE",
        path: "$",
        message: `Wave 17 must not include forbidden word ${id}.`,
        severity: "error",
      });
    }
  }
  if (FORBIDDEN_LETTERS.some((id) => blob.includes(`"${id}"`))) {
    emit({
      code: "WAVE17_LETTER",
      path: "$",
      message: "Wave 17 must not teach a new consonant.",
      severity: "error",
    });
  }
  for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
    if (blob.includes(`"${prefix}`) || blob.includes(prefix)) {
      emit({
        code: "WAVE17_PHONICS",
        path: "$",
        message: `Wave 17 must not introduce forbidden skill ${prefix}.`,
        severity: "error",
      });
      break;
    }
  }
  if (
    blob.includes("word:bint.writing") ||
    blob.includes("word:naam.writing") ||
    blob.includes("word:laa.writing") ||
    blob.includes("word:wa.writing") ||
    blob.includes("skill.handwriting")
  ) {
    emit({
      code: "WAVE17_WRITING",
      path: "$",
      message: "Wave 17 must not invent a word-writing mastery key.",
      severity: "error",
    });
  }
  if (
    blob.includes("letter:waw.fatha") ||
    blob.includes("mastery.letter.waw.fatha") ||
    blob.includes('"letter.waw.fatha"')
  ) {
    emit({
      code: "WAVE17_LIVE_KEY",
      path: "$",
      message: "Wave 17 must not require letter:waw.fatha as a live gate.",
      severity: "error",
    });
  }
  if (
    blob.includes("phrase:walad_wa_bint") ||
    blob.includes("language.response.naam") ||
    blob.includes("language.response.laa") ||
    blob.includes("language.conjunction.wa")
  ) {
    emit({
      code: "WAVE17_LIVE_KEY",
      path: "$",
      message: "Wave 17 must not invent phrase or language.* live mastery keys.",
      severity: "error",
    });
  }
  if (blob.includes("picture_to_word") || blob.includes("word_to_picture")) {
    emit({
      code: "WAVE17_FLOW",
      path: "$",
      message: "Wave 17 must not use picture_to_word or word_to_picture.",
      severity: "error",
    });
  }
  if (blob.includes("\"tracing\"") || blob.includes("letter:ba.tracing") || blob.includes("letter:nun.tracing") || blob.includes("letter:ta.tracing")) {
    emit({
      code: "WAVE17_WRITING",
      path: "$",
      message: "Wave 17 must not reuse isolated-letter tracing as a word-writing gate.",
      severity: "error",
    });
  }

  const sentences = Array.isArray(rec["sentences"]) ? rec["sentences"] : [];
  if (sentences.length > 0) {
    emit({
      code: "WAVE17_SENTENCE",
      path: "sentences",
      message: "Wave 17 must not create a sentence record. وَلَد وَبِنْت is a coordinated phrase.",
      severity: "error",
    });
  }

  for (const text of childTitleStrings(data)) {
    if (HAMZA_SEATS.test(text) || SHADDA.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text)) {
      emit({
        code: "WAVE17_TITLE",
        path: "childTitle",
        message: `Wave 17 child titles must not contain hamza, shadda, ة, or ى: "${text}".`,
        severity: "error",
      });
    }
  }
  for (const text of childVisibleStrings(data)) {
    if (HAMZA_SEATS.test(text)) {
      emit({
        code: "WAVE17_HAMZA",
        path: "childVisible",
        message: `Wave 17 child-visible copy must not contain أ / إ / آ: "${text}".`,
        severity: "error",
      });
    }
    for (const forbidden of FORBIDDEN_TARGET_STRINGS) {
      if (text === forbidden || text.includes(forbidden)) {
        emit({
          code: "WAVE17_SCOPE",
          path: "childVisible",
          message: `Wave 17 must not display unread target "${forbidden}".`,
          severity: "error",
        });
      }
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
    if (
      DAMMA.test(text) ||
      TANWEEN.test(text) ||
      TAA_MARBUTA.test(text) ||
      ALIF_MAQSURA.test(text) ||
      DIPHTHONG.test(text) ||
      MADD_YAA.test(text) ||
      MADD_WAW.test(text) ||
      DEFINITE_ARTICLE.test(text)
    ) {
      emit({
        code: "WAVE17_PHONICS",
        path: "childVisible",
        message: `Wave 17 glyphs/titles must not contain damma, madd-yaa/waw, tanween, ة, ى, ال, or a diphthong: "${text}".`,
        severity: "error",
      });
    }
  }

  const priorLetters = stringSet(PRIOR_LETTER_IDS);
  const allowedLetters = new Set<string>([...PRIOR_LETTER_IDS, ...WAVE17_LETTER_IDS, ...CARRIER_LETTER_IDS]);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  for (let i = 0; i < letters.length; i++) {
    const letter = asRecord(letters[i]);
    if (!letter) continue;
    const id = typeof letter["id"] === "string" ? letter["id"] : "";
    if (id && !allowedLetters.has(id)) {
      emit({
        code: "WAVE17_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 17 must not introduce untaught letter "${id}".`,
        severity: "error",
      });
    }
    const wave = expectedPriorWave(id);
    if (wave !== undefined && priorLetters.has(id)) {
      const tags = asStringArray(letter["tags"]);
      if (!tags.includes("recycled")) {
        emit({
          code: "WAVE17_LETTER",
          path: `letters[${i}].tags`,
          message: `Recycled letter "${id}" must be tagged recycled.`,
          severity: "error",
        });
      }
    }
  }

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE17_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  for (let i = 0; i < words.length; i++) {
    const word = asRecord(words[i]);
    if (!word) continue;
    const id = typeof word["id"] === "string" ? word["id"] : "";
    if (id && !allowedWords.has(id)) {
      emit({
        code: "WAVE17_WORD",
        path: `words[${i}].id`,
        message: `Wave 17 must not introduce untaught word "${id}".`,
        severity: "error",
      });
    }
    if ((WAVE17_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
    if (id === "word.naam") {
      if (word["teachingForm"] !== "نَعَم" || word["diacritized"] !== "نَعَم" || word["lemma"] !== "نعم") {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].teachingForm`,
          message: "word.naam must stay canonical نَعَم / نعم.",
          severity: "error",
        });
      }
      if (word["pos"] !== "function" || word["category"] !== "function") {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].pos`,
          message: "word.naam pos/category must remain function.",
          severity: "error",
        });
      }
      if (word["legacyId"] !== undefined) {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].legacyId`,
          message: "word.naam must not invent a legacyId.",
          severity: "error",
        });
      }
      const phonics = asStringArray(word["phonicsSkillIds"]);
      if (phonics.join(",") !== "skill.short_vowel.fatha") {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].phonicsSkillIds`,
          message: "word.naam phonics must be fatha only.",
          severity: "error",
        });
      }
    }
    if (id === "word.laa") {
      if (word["teachingForm"] !== "لَا" || word["diacritized"] !== "لَا" || word["lemma"] !== "لا") {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].teachingForm`,
          message: "word.laa must stay canonical لَا / لا.",
          severity: "error",
        });
      }
      if (word["pos"] !== "function" || word["category"] !== "function") {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].pos`,
          message: "word.laa pos/category must remain function.",
          severity: "error",
        });
      }
      if (word["legacyId"] !== undefined) {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].legacyId`,
          message: "word.laa must not invent a legacyId.",
          severity: "error",
        });
      }
      const phonics = asStringArray(word["phonicsSkillIds"]);
      if (
        phonics.join(",") !== "skill.short_vowel.fatha,skill.long_vowel.madd" &&
        phonics.join(",") !== "skill.long_vowel.madd,skill.short_vowel.fatha"
      ) {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].phonicsSkillIds`,
          message: "word.laa phonics must reuse fatha + existing madd-alif only.",
          severity: "error",
        });
      }
    }
    if (id === "word.wa") {
      if (word["teachingForm"] !== "وَ" || word["diacritized"] !== "وَ" || word["lemma"] !== "و") {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].teachingForm`,
          message: "word.wa must be canonical وَ / و.",
          severity: "error",
        });
      }
      if (word["pos"] !== "function" || word["category"] !== "function") {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].pos`,
          message: "word.wa pos/category must be function.",
          severity: "error",
        });
      }
      if (word["legacyId"] !== undefined) {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].legacyId`,
          message: "word.wa must not invent a legacyId.",
          severity: "error",
        });
      }
      const lettersOnWord = asStringArray(word["letterIds"]);
      if (lettersOnWord.join(",") !== "letter.waw") {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].letterIds`,
          message: "word.wa letters must be letter.waw only.",
          severity: "error",
        });
      }
      const phonics = asStringArray(word["phonicsSkillIds"]);
      if (phonics.join(",") !== "skill.short_vowel.fatha") {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].phonicsSkillIds`,
          message: "word.wa phonics must be fatha only. This is not a new phonics class.",
          severity: "error",
        });
      }
      const form = typeof word["teachingForm"] === "string" ? word["teachingForm"] : "";
      if (!FATHA.test(form) || DAMMA.test(form) || TANWEEN.test(form)) {
        emit({
          code: "WAVE17_WORD",
          path: `words[${i}].teachingForm`,
          message: "word.wa must keep fatha and must not use damma or tanween.",
          severity: "error",
        });
      }
    }
  }
  for (const id of WAVE17_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE17_WORD",
        path: "words",
        message: `Wave 17 must include target word ${id}.`,
        severity: "error",
      });
    }
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  const wawFatha = asRecord(syllables.find((row) => asRecord(row)?.["id"] === "syllable.waw.fatha"));
  if (!wawFatha || wawFatha["text"] !== "وَ") {
    emit({
      code: "WAVE17_WORD",
      path: "syllables",
      message: "Wave 17 must recycle historical syllable.waw.fatha (وَ) for the SHOW only.",
      severity: "error",
    });
  }

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 2) {
    emit({
      code: "WAVE17_UNITS",
      path: "units",
      message: "Wave 17 must declare exactly two units.",
      severity: "error",
    });
  }
  const unit1 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE17_FIRST_UNIT_ID));
  const unit2 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE17_FINAL_UNIT_ID));
  if (!unit1 || !unit2) {
    emit({
      code: "WAVE17_UNITS",
      path: "units",
      message: "Wave 17 must include naam_laa and wa_bint units.",
      severity: "error",
    });
    return;
  }

  if (unit1["titleAr"] !== "نَعَم" || unit2["titleAr"] !== "وَ") {
    emit({
      code: "WAVE17_TITLE",
      path: "units",
      message: "Wave 17 child titles must be نَعَم, وَ.",
      severity: "error",
    });
  }

  if (asStringArray(unit1["prereqUnitIds"])[0] !== WAVE16_FINAL_UNIT_ID) {
    emit({
      code: "WAVE17_PREREQ",
      path: `units[id=${WAVE17_FIRST_UNIT_ID}].prereqUnitIds`,
      message: "Wave 17 Unit 1 prerequisite must be unit.literacy.wave16.bint.",
      severity: "error",
    });
  }
  if (asStringArray(unit2["prereqUnitIds"])[0] !== WAVE17_FIRST_UNIT_ID) {
    emit({
      code: "WAVE17_PREREQ",
      path: `units[id=${WAVE17_FINAL_UNIT_ID}].prereqUnitIds`,
      message: "Unit 2 must unlock after Unit 1.",
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = asRecord(paths.find((row) => asRecord(row)?.["id"] === WAVE17_PATH_ID));
  if (!path) {
    emit({
      code: "WAVE17_PATH",
      path: "paths",
      message: "Wave 17 must include path.literacy.wave17.",
      severity: "error",
    });
  } else if (asStringArray(path["unitIds"]).join(",") !== WAVE17_UNIT_IDS.join(",")) {
    emit({
      code: "WAVE17_PATH",
      path: "paths[id=path.literacy.wave17].unitIds",
      message: "Wave 17 path must list exactly the two Wave 17 units in order.",
      severity: "error",
    });
  }

  const u1Exercises = asStringArray(unit1["exerciseIds"]);
  const u2Exercises = asStringArray(unit2["exerciseIds"]);
  const u1Presentations = u1Exercises.filter((id) => exercises.get(id)?.["type"] === "presentation");
  const u2Presentations = u2Exercises.filter((id) => exercises.get(id)?.["type"] === "presentation");
  if (
    u1Presentations.length < 2 ||
    u1Exercises.slice(0, u1Presentations.length).some((id) => exercises.get(id)?.["type"] !== "presentation")
  ) {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must place ALL presentations at the front.",
      severity: "error",
    });
  }
  if (u2Exercises.slice(0, u2Presentations.length).some((id) => exercises.get(id)?.["type"] !== "presentation")) {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must place ALL presentations at the front.",
      severity: "error",
    });
  }

  const showNaam = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["wordId"] === "word.naam");
  const showLaa = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["wordId"] === "word.laa");
  if (!showNaam || asRecord(exercises.get(showNaam)?.["config"])?.["show"] !== "word") {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must SHOW نَعَم before scoring.",
      severity: "error",
    });
  }
  if (!showLaa || asRecord(exercises.get(showLaa)?.["config"])?.["show"] !== "word") {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must SHOW لَا before scoring.",
      severity: "error",
    });
  }
  if (showNaam && showLaa && u1Exercises.indexOf(showNaam) > u1Exercises.indexOf(showLaa)) {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FIRST_UNIT_ID}].exerciseIds`,
      message: "SHOW نَعَم must occur before SHOW لَا.",
      severity: "error",
    });
  }

  const firstScoredU1 = u1Exercises.find((id) => exercises.get(id)?.["type"] !== "presentation");
  if (firstScoredU1 && showLaa && u1Exercises.indexOf(showLaa) > u1Exercises.indexOf(firstScoredU1)) {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FIRST_UNIT_ID}].exerciseIds`,
      message: "All Unit 1 presentations must occur before scored evidence.",
      severity: "error",
    });
  }

  const naamScore = u1Exercises.find((id) => wordIdsOnTargets(exercises.get(id) ?? {}).includes("word.naam"));
  const laaScore = u1Exercises.find((id) => wordIdsOnTargets(exercises.get(id) ?? {}).includes("word.laa"));
  const naamEx = naamScore ? exercises.get(naamScore) : undefined;
  const laaEx = laaScore ? exercises.get(laaScore) : undefined;
  if (naamEx?.["type"] !== "audio_to_word" || asRecord(naamEx["success"])?.["correctChoiceId"] !== "word.naam") {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must include scored audio_to_word for نَعَم.",
      severity: "error",
    });
  }
  if (laaEx?.["type"] !== "audio_to_word" || asRecord(laaEx["success"])?.["correctChoiceId"] !== "word.laa") {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must include scored audio_to_word for لَا.",
      severity: "error",
    });
  }

  const showWa = u2Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["syllableId"] === "syllable.waw.fatha");
  const showPhrase = u2Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["result"] === PHRASE);
  const showBint = u2Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["wordId"] === "word.bint");
  const waConfig = asRecord(showWa ? exercises.get(showWa)?.["config"] : undefined);
  const phraseConfig = asRecord(showPhrase ? exercises.get(showPhrase)?.["config"] : undefined);
  const bintConfig = asRecord(showBint ? exercises.get(showBint)?.["config"] : undefined);
  if (!showWa || waConfig?.["show"] !== "cv") {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must SHOW وَ (historical CV) before scoring.",
      severity: "error",
    });
  }
  if (
    !showPhrase ||
    phraseConfig?.["show"] !== "chunk" ||
    phraseConfig?.["left"] !== "وَلَد" ||
    phraseConfig?.["right"] !== "بِنْت" ||
    phraseConfig?.["result"] !== PHRASE
  ) {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must SHOW coordinated phrase وَلَد وَبِنْت as an unscored chunk.",
      severity: "error",
    });
  }
  if (showPhrase && (exercises.get(showPhrase)?.["masteryTargets"] as unknown[] | undefined)?.length) {
    emit({
      code: "WAVE17_SENTENCE",
      path: `exercises[id=${showPhrase}].masteryTargets`,
      message: "The coordinated phrase must remain an unscored presentation.",
      severity: "error",
    });
  }
  if (!showBint || bintConfig?.["show"] !== "word") {
    emit({
      code: "WAVE17_WRITING",
      path: `units[id=${WAVE17_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must SHOW citation بِنْت as writing look / exposure.",
      severity: "error",
    });
  }
  if (showWa && showPhrase && u2Exercises.indexOf(showWa) > u2Exercises.indexOf(showPhrase)) {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FINAL_UNIT_ID}].exerciseIds`,
      message: "SHOW وَ must occur before the coordinated phrase.",
      severity: "error",
    });
  }
  if (showPhrase && showBint && u2Exercises.indexOf(showPhrase) > u2Exercises.indexOf(showBint)) {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FINAL_UNIT_ID}].exerciseIds`,
      message: "The coordinated phrase must occur before citation بِنْت.",
      severity: "error",
    });
  }

  const firstScoredU2 = u2Exercises.find((id) => exercises.get(id)?.["type"] !== "presentation");
  const waScoreEx = firstScoredU2 ? exercises.get(firstScoredU2) : undefined;
  if (waScoreEx?.["type"] !== "audio_to_word" || asRecord(waScoreEx["success"])?.["correctChoiceId"] !== "word.wa") {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FINAL_UNIT_ID}].exerciseIds`,
      message: "First scored Unit 2 evidence must be audio_to_word for وَ.",
      severity: "error",
    });
  }
  if (firstScoredU2 && showBint && u2Exercises.indexOf(showBint) > u2Exercises.indexOf(firstScoredU2)) {
    emit({
      code: "WAVE17_FLOW",
      path: `units[id=${WAVE17_FINAL_UNIT_ID}].exerciseIds`,
      message: "All Unit 2 presentations must occur before scored وَ.",
      severity: "error",
    });
  }
  if (waScoreEx && wordIdsOnTargets(waScoreEx).includes("word.walad")) {
    emit({
      code: "WAVE17_LIVE_KEY",
      path: `exercises[id=${firstScoredU2}].masteryTargets`,
      message: "Unit 2 must not require word:walad.decoding.",
      severity: "error",
    });
  }
  if (waScoreEx && wordIdsOnTargets(waScoreEx).includes("word.bint")) {
    emit({
      code: "WAVE17_LIVE_KEY",
      path: `exercises[id=${firstScoredU2}].masteryTargets`,
      message: "Unit 2 must not require word:bint.decoding.",
      severity: "error",
    });
  }

  const u1Required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
  if (u1Required.join(",") !== "skill.word_decoding.simple") {
    emit({
      code: "WAVE17_MASTERY",
      path: `units[id=${WAVE17_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 1 must require skill.word_decoding.simple only.",
      severity: "error",
    });
  }
  const u2Required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
  if (u2Required.join(",") !== "skill.word_decoding.simple") {
    emit({
      code: "WAVE17_MASTERY",
      path: `units[id=${WAVE17_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 2 must require skill.word_decoding.simple only.",
      severity: "error",
    });
  }

  for (const exercise of exercises.values()) {
    if (exercise["type"] === "presentation" && Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
      emit({
        code: "WAVE17_MASTERY",
        path: `exercises[id=${exercise["id"]}].masteryTargets`,
        message: "Presentations must have attempts 0 / no mastery targets.",
        severity: "error",
      });
    }
  }

  const requiredWordIds = new Set<string>();
  for (const [unitId, unit] of [
    [WAVE17_FIRST_UNIT_ID, unit1],
    [WAVE17_FINAL_UNIT_ID, unit2],
  ] as const) {
    const required = asStringArray(asRecord(unit["mastery"])?.["requiredSkillIds"]);
    const mapped = new Set<string>();
    for (const exerciseId of asStringArray(unit["exerciseIds"])) {
      const exercise = exercises.get(exerciseId);
      if (!exercise || asStringArray(exercise["tags"]).includes("reinforcement")) continue;
      if (exercise["type"] === "presentation") continue;
      for (const skillId of skillIdsOnTargets(exercise)) mapped.add(skillId);
      for (const wordId of wordIdsOnTargets(exercise)) requiredWordIds.add(wordId);
    }
    for (const skillId of required) {
      if (!mapped.has(skillId)) {
        emit({
          code: "WAVE17_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
  const expectedWords = ["word.naam", "word.laa", "word.wa"].sort().join(",");
  if ([...requiredWordIds].sort().join(",") !== expectedWords) {
    emit({
      code: "WAVE17_LIVE_KEY",
      path: "units.mastery",
      message: `Wave 17 required live keys must be exactly word:naam.decoding, word:laa.decoding, word:wa.decoding (found ${[...requiredWordIds].join(", ")}).`,
      severity: "error",
    });
  }
}

export function validateWave17WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  const wa = literacyWords.get("word.wa");
  if (wa?.["legacyId"] !== undefined) {
    emit({
      code: "WAVE17_WORD",
      path: "words[id=word.wa].legacyId",
      message: "word.wa must not invent a legacyId.",
      severity: "error",
    });
  }

  for (const id of WAVE17_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE17_BAND_A_REF",
        path: "words",
        message: `Wave 17 word "${id}" is not in production Band A.`,
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
      ["category", slice["category"], source["category"]],
      ["vocabBand", slice["vocabBand"], source["vocabBand"]],
      ["subBand", slice["subBand"], source["subBand"]],
    ];
    for (const [field, left, right] of fields) {
      if (left !== right) {
        emit({
          code: "WAVE17_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 17 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE17_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 17 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== undefined || source["legacyId"] !== undefined) {
      emit({
        code: "WAVE17_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `${id} must not invent or copy a fake 720 legacyId.`,
        severity: "error",
      });
    }
    if (slice["highFrequency"] !== source["highFrequency"] || slice["frequencyBand"] !== source["frequencyBand"]) {
      emit({
        code: "WAVE17_BAND_A_REF",
        path: `words[id=${id}].highFrequency`,
        message: `${id} highFrequency/core must match Band A.`,
        severity: "error",
      });
    }
  }
}
