/**
 * Deterministic Wave 15 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 15 production bundle.
 * Waves 1–14 stay frozen. Kasra+sukun transfer: جِ then جِسْ then جِسْم.
 * Compact two-unit wave. No new phonics rule, no new consonant, Wave 16.
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
import {
  WAVE14_FINAL_UNIT_ID,
  WAVE14_LETTER_IDS,
  WAVE14_WORD_IDS,
} from "./validateLiteracyWave14.ts";

export const LITERACY_WAVE15_META_ID = "hurufi.production.literacy.wave15";

export const WAVE15_LETTER_IDS = [] as const;

export const WAVE15_WORD_IDS = ["word.jism"] as const;

export const WAVE15_BAND_A_WORD_IDS = ["word.jism"] as const;

export const WAVE15_PATH_ID = "path.literacy.wave15";

export const WAVE15_UNIT_IDS = [
  "unit.literacy.wave15.jim_kasra_jis_closed",
  "unit.literacy.wave15.jism",
] as const;

export const WAVE15_FIRST_UNIT_ID = "unit.literacy.wave15.jim_kasra_jis_closed";
export const WAVE15_FINAL_UNIT_ID = "unit.literacy.wave15.jism";

export const WAVE15_EXTERNAL_PREREQ_UNIT_IDS = [WAVE14_FINAL_UNIT_ID] as const;

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
  "word.bint",
  "word.masjid",
  "word.miftah",
  "word.sinn",
  "word.barid",
  "word.laa",
  "word.naam",
  "word.shay",
] as const;

const SAFE_KASRA_FOILS = ["syllable.jim.fatha", "syllable.ain.kasra"] as const;
const SAFE_CVC_FOILS = ["syllable.jim.kasra", "syllable.ram.closed"] as const;
const SAFE_FOIL_WORDS = ["word.jamal", "word.shams", "word.inab", "word.kitab"] as const;

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

export function isLiteracyWave15Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE15_META_ID;
}

export function validateLiteracyWave15Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE15_META",
        path: "meta.kind",
        message: "Literacy Wave 15 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE15_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 15 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-16") || blob.includes("wave16") || blob.includes("path.literacy.wave16")) {
    emit({
      code: "WAVE15_SCOPE",
      path: "$",
      message: "Wave 15 must not declare a Wave 16 path, route, or CTA.",
      severity: "error",
    });
  }
  for (const id of FORBIDDEN_WORDS) {
    if (blob.includes(id) || blob.includes(id.replace("word.", "word:"))) {
      emit({
        code: "WAVE15_SCOPE",
        path: "$",
        message: `Wave 15 must not include forbidden word ${id}.`,
        severity: "error",
      });
    }
  }
  if (blob.includes("missing_haraka") || blob.includes("diacritic:jim.kasra")) {
    emit({
      code: "WAVE15_MASTERY",
      path: "$",
      message: "Wave 15 must not require mark-only kasra discrimination.",
      severity: "error",
    });
  }
  if (blob.includes("diacritic:mim.sukun") || blob.includes("syllable.mim.sukun")) {
    emit({
      code: "WAVE15_MASTERY",
      path: "$",
      message: "Wave 15 must not reteach sukun mark discrimination.",
      severity: "error",
    });
  }
  if (blob.includes("letter:jim.closed") || blob.includes("syllable.jim.closed")) {
    emit({
      code: "WAVE15_CHUNK",
      path: "$",
      message: "Wave 15 must not use syllable.jim.closed / letter:jim.closed.",
      severity: "error",
    });
  }
  if (blob.includes("letter:mim.form.final") || blob.includes("mastery.letter.mim.form.final")) {
    emit({
      code: "WAVE15_FORM",
      path: "$",
      message: "Wave 15 must not require letter:mim.form.final as mastery.",
      severity: "error",
    });
  }
  if (FORBIDDEN_LETTERS.some((id) => blob.includes(`"${id}"`))) {
    emit({
      code: "WAVE15_LETTER",
      path: "$",
      message: "Wave 15 must not teach a new consonant.",
      severity: "error",
    });
  }
  if (
    blob.includes("review-wave15") ||
    blob.includes("review.wave15") ||
    blob.includes("word:jism.review") ||
    blob.includes("skill.articulation")
  ) {
    emit({
      code: "WAVE15_REVIEW",
      path: "$",
      message: "Wave 15 must not require a review key or a new articulation skill.",
      severity: "error",
    });
  }

  for (const text of childTitleStrings(data)) {
    if (HAMZA_SEATS.test(text) || SHADDA.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text)) {
      emit({
        code: "WAVE15_TITLE",
        path: "childTitle",
        message: `Wave 15 child titles must not contain hamza, shadda, ة, or ى: "${text}".`,
        severity: "error",
      });
    }
  }
  for (const text of childVisibleStrings(data)) {
    if (HAMZA_SEATS.test(text)) {
      emit({
        code: "WAVE15_HAMZA",
        path: "childVisible",
        message: `Wave 15 child-visible copy must not contain أ / إ / آ: "${text}".`,
        severity: "error",
      });
    }
  }

  const phonicsVisible: string[] = [...childTitleStrings(data)];
  const recForPhonics = asRecord(data);
  if (recForPhonics) {
    for (const row of Array.isArray(recForPhonics["exercises"]) ? recForPhonics["exercises"] : []) {
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
    for (const row of Array.isArray(recForPhonics["syllables"]) ? recForPhonics["syllables"] : []) {
      const text = asRecord(row)?.["text"];
      if (typeof text === "string") phonicsVisible.push(text);
    }
    for (const row of Array.isArray(recForPhonics["words"]) ? recForPhonics["words"] : []) {
      const word = asRecord(row);
      if (!word) continue;
      if (typeof word["teachingForm"] === "string") phonicsVisible.push(word["teachingForm"]);
      if (typeof word["diacritized"] === "string") phonicsVisible.push(word["diacritized"]);
    }
  }
  for (const text of phonicsVisible) {
    if (DAMMA.test(text) || TANWEEN.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text) || DIPHTHONG.test(text) || MADD_YAA.test(text) || MADD_WAW.test(text)) {
      emit({
        code: "WAVE15_PHONICS",
        path: "childVisible",
        message: `Wave 15 glyphs/titles must not contain damma, madd-yaa/waw, tanween, ة, ى, or a diphthong: "${text}".`,
        severity: "error",
      });
    }
  }

  const priorLetters = stringSet(PRIOR_LETTER_IDS);
  const allowedLetters = new Set<string>([...PRIOR_LETTER_IDS, ...WAVE15_LETTER_IDS]);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  let foundJim = false;
  let foundSin = false;
  let foundMim = false;
  for (let i = 0; i < letters.length; i++) {
    const letter = asRecord(letters[i]);
    if (!letter) continue;
    const id = typeof letter["id"] === "string" ? letter["id"] : "";
    if (id && !allowedLetters.has(id)) {
      emit({
        code: "WAVE15_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 15 must not introduce untaught letter "${id}".`,
        severity: "error",
      });
    }
    if (id === "letter.jim") {
      foundJim = true;
      if (letter["nonConnecting"] === true) {
        emit({
          code: "WAVE15_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.jim must remain dual-joining so جِسْم begins with initial جـ.",
          severity: "error",
        });
      }
    }
    if (id === "letter.sin") {
      foundSin = true;
      const forms = asRecord(letter["forms"]);
      if (forms?.["medial"] !== "ـسـ") {
        emit({
          code: "WAVE15_FORM",
          path: `letters[${i}].forms.medial`,
          message: "letter.sin medial form must be ـسـ.",
          severity: "error",
        });
      }
      if (letter["nonConnecting"] === true) {
        emit({
          code: "WAVE15_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.sin must remain dual-joining so س in جِسْم is medial ـسـ.",
          severity: "error",
        });
      }
    }
    if (id === "letter.mim") {
      foundMim = true;
      const forms = asRecord(letter["forms"]);
      if (forms?.["final"] !== "ـم") {
        emit({
          code: "WAVE15_FORM",
          path: `letters[${i}].forms.final`,
          message: "letter.mim final form must be ـم.",
          severity: "error",
        });
      }
    }
    const wave = expectedPriorWave(id);
    if (wave !== undefined && priorLetters.has(id)) {
      const tags = asStringArray(letter["tags"]);
      if (!tags.includes("recycled")) {
        emit({
          code: "WAVE15_LETTER",
          path: `letters[${i}].tags`,
          message: `Recycled letter "${id}" must be tagged recycled.`,
          severity: "error",
        });
      }
    }
  }
  if (!foundJim) {
    emit({
      code: "WAVE15_LETTER",
      path: "letters",
      message: "Wave 15 must include recycled letter.jim as the kasra carrier.",
      severity: "error",
    });
  }
  if (!foundSin) {
    emit({
      code: "WAVE15_LETTER",
      path: "letters",
      message: "Wave 15 must include recycled letter.sin for the closed coda.",
      severity: "error",
    });
  }
  if (!foundMim) {
    emit({
      code: "WAVE15_LETTER",
      path: "letters",
      message: "Wave 15 must include recycled letter.mim for final ـم in جِسْم.",
      severity: "error",
    });
  }

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE15_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  for (let i = 0; i < words.length; i++) {
    const word = asRecord(words[i]);
    if (!word) continue;
    const id = typeof word["id"] === "string" ? word["id"] : "";
    if (id && !allowedWords.has(id)) {
      emit({
        code: "WAVE15_WORD",
        path: `words[${i}].id`,
        message: `Wave 15 must not introduce untaught word "${id}".`,
        severity: "error",
      });
    }
    if ((WAVE15_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
    if (id === "word.jism") {
      if (word["teachingForm"] !== "جِسْم" || word["diacritized"] !== "جِسْم") {
        emit({
          code: "WAVE15_WORD",
          path: `words[${i}].teachingForm`,
          message: "word.jism teachingForm must be جِسْم.",
          severity: "error",
        });
      }
      if (word["lemma"] !== "جسم") {
        emit({
          code: "WAVE15_WORD",
          path: `words[${i}].lemma`,
          message: "word.jism lemma must be جسم.",
          severity: "error",
        });
      }
      const form = typeof word["teachingForm"] === "string" ? word["teachingForm"] : "";
      if (!KASRA.test(form) || !SUKUN.test(form)) {
        emit({
          code: "WAVE15_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "جِسْم phonics must be kasra + sukun.",
          severity: "error",
        });
      }
      if (FATHA.test(form)) {
        emit({
          code: "WAVE15_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "جِسْم must not use fatha as a target vowel.",
          severity: "error",
        });
      }
      if (DAMMA.test(form) || TAA_MARBUTA.test(form) || ALIF_MAQSURA.test(form) || SHADDA.test(form) || TANWEEN.test(form)) {
        emit({
          code: "WAVE15_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "جِسْم must not contain damma, shadda, tanween, ة, or ى.",
          severity: "error",
        });
      }
      const phonics = asStringArray(word["phonicsSkillIds"]);
      const required = asStringArray(word["requiredSkillIds"]);
      if (!phonics.includes("skill.short_vowel.kasra") || !required.includes("skill.short_vowel.kasra")) {
        emit({
          code: "WAVE15_PHONICS",
          path: `words[${i}]`,
          message: "word.jism must require skill.short_vowel.kasra.",
          severity: "error",
        });
      }
      if (!phonics.includes("skill.sukun.basic") || !required.includes("skill.sukun.basic")) {
        emit({
          code: "WAVE15_PHONICS",
          path: `words[${i}]`,
          message: "word.jism must require skill.sukun.basic.",
          severity: "error",
        });
      }
      if (phonics.includes("skill.short_vowel.fatha") || required.includes("skill.short_vowel.fatha")) {
        emit({
          code: "WAVE15_PHONICS",
          path: `words[${i}]`,
          message: "word.jism must not require fatha as a target skill.",
          severity: "error",
        });
      }
      if (phonics.includes("skill.long_vowel.madd") || required.includes("skill.long_vowel.madd")) {
        emit({
          code: "WAVE15_PHONICS",
          path: `words[${i}]`,
          message: "word.jism must not require madd.",
          severity: "error",
        });
      }
      for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
        if (
          phonics.some((skillId) => skillId.startsWith(prefix) || skillId === prefix) ||
          required.some((skillId) => skillId.startsWith(prefix) || skillId === prefix)
        ) {
          emit({
            code: "WAVE15_PHONICS",
            path: `words[${i}]`,
            message: `word.jism must not require forbidden skill prefix ${prefix}.`,
            severity: "error",
          });
        }
      }
      if (word["legacyId"] !== "body-40") {
        emit({
          code: "WAVE15_WORD",
          path: `words[${i}].legacyId`,
          message: "word.jism must remain Band A body-40.",
          severity: "error",
        });
      }
      if (word["vocabBand"] !== "A" || word["subBand"] !== "A3") {
        emit({
          code: "WAVE15_WORD",
          path: `words[${i}].subBand`,
          message: "word.jism must remain Band A / A3.",
          severity: "error",
        });
      }
      if (word["category"] !== "body") {
        emit({
          code: "WAVE15_WORD",
          path: `words[${i}].category`,
          message: "word.jism category must be body.",
          severity: "error",
        });
      }
      const forms = letterFormsOnWord(word);
      const jimForms = forms.filter((row) => row.letterId === "letter.jim").map((row) => row.form);
      const sinForms = forms.filter((row) => row.letterId === "letter.sin").map((row) => row.form);
      const mimForms = forms.filter((row) => row.letterId === "letter.mim").map((row) => row.form);
      if (!jimForms.includes("initial") || jimForms.includes("medial") || jimForms.includes("final")) {
        emit({
          code: "WAVE15_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "ج must be recorded as initial جـ, not medial or final.",
          severity: "error",
        });
      }
      if (!sinForms.includes("medial") || sinForms.includes("initial") || sinForms.includes("final")) {
        emit({
          code: "WAVE15_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "س in جِسْم must be recorded as medial ـسـ.",
          severity: "error",
        });
      }
      if (!mimForms.includes("final") || mimForms.includes("isolated") || mimForms.includes("initial")) {
        emit({
          code: "WAVE15_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "م in جِسْم must be recorded as final ـم.",
          severity: "error",
        });
      }
    }
  }
  for (const id of WAVE15_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE15_WORD",
        path: "words",
        message: `Wave 15 must include ${id}.`,
        severity: "error",
      });
    }
  }
  if (foundNewWords.size !== WAVE15_WORD_IDS.length) {
    emit({
      code: "WAVE15_WORD",
      path: "words",
      message: "Wave 15 must add exactly word.jism.",
      severity: "error",
    });
  }

  const skills = Array.isArray(rec["skills"]) ? rec["skills"] : [];
  let foundKasraSkill = false;
  let foundSukunSkill = false;
  let foundCvcSkill = false;
  let foundNewPhonics = false;
  for (let i = 0; i < skills.length; i++) {
    const skill = asRecord(skills[i]);
    const skillId = typeof skill?.["id"] === "string" ? skill["id"] : "";
    if (skillId === "skill.short_vowel.kasra") foundKasraSkill = true;
    if (skillId === "skill.sukun.basic") foundSukunSkill = true;
    if (skillId === "skill.syllable_blending.cvc") foundCvcSkill = true;
    if (skillId === "skill.short_vowel.damma" || skillId.startsWith("skill.long_vowel.madd_")) {
      foundNewPhonics = true;
    }
    for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
      if (skillId.startsWith(prefix) || skillId === prefix) {
        emit({
          code: "WAVE15_PHONICS",
          path: `skills[${i}].id`,
          message: `Wave 15 must not add forbidden skill "${skillId}".`,
          severity: "error",
        });
      }
    }
  }
  if (!foundKasraSkill || !foundSukunSkill || !foundCvcSkill) {
    emit({
      code: "WAVE15_PHONICS",
      path: "skills",
      message: "Wave 15 must recycle kasra, sukun, and CVC blending; it does not introduce a new phonics rule.",
      severity: "error",
    });
  }
  if (foundNewPhonics) {
    emit({
      code: "WAVE15_PHONICS",
      path: "skills",
      message: "Wave 15 must not introduce a new phonics rule (damma / madd-yaa / madd-waw).",
      severity: "error",
    });
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  let foundJimKasra = false;
  let foundJimFatha = false;
  let foundJisClosed = false;
  for (let i = 0; i < syllables.length; i++) {
    const syllable = asRecord(syllables[i]);
    if (!syllable) continue;
    const sid = typeof syllable["id"] === "string" ? syllable["id"] : "";
    if (sid === "syllable.jim.kasra") {
      foundJimKasra = true;
      if (
        syllable["pattern"] !== "CV" ||
        syllable["text"] !== "جِ" ||
        syllable["vowelSkillId"] !== "skill.short_vowel.kasra" ||
        syllable["letterId"] !== "letter.jim"
      ) {
        emit({
          code: "WAVE15_CV",
          path: `syllables[${i}]`,
          message: "syllable.jim.kasra must be CV جِ with skill.short_vowel.kasra.",
          severity: "error",
        });
      }
    }
    if (sid === "syllable.jim.fatha") {
      foundJimFatha = true;
      if (syllable["pattern"] !== "CV" || syllable["text"] !== "جَ" || syllable["vowelSkillId"] !== "skill.short_vowel.fatha") {
        emit({
          code: "WAVE15_CV",
          path: `syllables[${i}]`,
          message: "syllable.jim.fatha must be CV جَ with skill.short_vowel.fatha.",
          severity: "error",
        });
      }
    }
    if (sid === "syllable.jis.closed") {
      foundJisClosed = true;
      const requiredLetters = asStringArray(syllable["requiredLetterIds"]);
      const requiredSkills = asStringArray(syllable["requiredSkillIds"]);
      if (
        syllable["pattern"] !== "CVC" ||
        syllable["text"] !== "جِسْ" ||
        syllable["vowelSkillId"] !== "skill.short_vowel.kasra" ||
        syllable["letterId"] !== "letter.jim"
      ) {
        emit({
          code: "WAVE15_CHUNK",
          path: `syllables[${i}]`,
          message: "syllable.jis.closed must be CVC جِسْ with kasra on letter.jim.",
          severity: "error",
        });
      }
      if (!requiredLetters.includes("letter.jim") || !requiredLetters.includes("letter.sin") || requiredLetters.length !== 2) {
        emit({
          code: "WAVE15_CHUNK",
          path: `syllables[${i}].requiredLetterIds`,
          message: "syllable.jis.closed required letters must be jim + sin.",
          severity: "error",
        });
      }
      if (!requiredSkills.includes("skill.short_vowel.kasra") || !requiredSkills.includes("skill.sukun.basic")) {
        emit({
          code: "WAVE15_CHUNK",
          path: `syllables[${i}].requiredSkillIds`,
          message: "syllable.jis.closed required skills must be kasra + sukun.",
          severity: "error",
        });
      }
    }
    if (syllable["pattern"] === "CVC" && sid !== "syllable.jis.closed" && sid !== "syllable.ram.closed") {
      emit({
        code: "WAVE15_CHUNK",
        path: `syllables[${i}].id`,
        message: `Wave 15 must not add extra CVC syllable "${sid}".`,
        severity: "error",
      });
    }
  }
  if (!foundJimKasra) {
    emit({
      code: "WAVE15_CV",
      path: "syllables",
      message: "Wave 15 must include syllable.jim.kasra.",
      severity: "error",
    });
  }
  if (!foundJimFatha) {
    emit({
      code: "WAVE15_CV",
      path: "syllables",
      message: "Wave 15 must include familiar syllable.jim.fatha.",
      severity: "error",
    });
  }
  if (!foundJisClosed) {
    emit({
      code: "WAVE15_CHUNK",
      path: "syllables",
      message: "Wave 15 must include syllable.jis.closed.",
      severity: "error",
    });
  }

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 2) {
    emit({
      code: "WAVE15_UNITS",
      path: "units",
      message: "Wave 15 must declare exactly two units.",
      severity: "error",
    });
  }

  const unit1 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE15_FIRST_UNIT_ID));
  const unit2 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE15_FINAL_UNIT_ID));
  if (!unit1 || !unit2) {
    emit({
      code: "WAVE15_UNITS",
      path: "units",
      message: "Wave 15 must include jim_kasra_jis_closed and jism units.",
      severity: "error",
    });
    return;
  }

  if (unit1["titleAr"] !== "جِ" || unit2["titleAr"] !== "جِسْم") {
    emit({
      code: "WAVE15_TITLE",
      path: "units",
      message: "Wave 15 child titles must be جِ, جِسْم.",
      severity: "error",
    });
  }

  if (asStringArray(unit1["prereqUnitIds"])[0] !== WAVE14_FINAL_UNIT_ID) {
    emit({
      code: "WAVE15_PREREQ",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].prereqUnitIds`,
      message: "Wave 15 Unit 1 prerequisite must be unit.literacy.wave14.inab.",
      severity: "error",
    });
  }
  if (asStringArray(unit2["prereqUnitIds"])[0] !== WAVE15_FIRST_UNIT_ID) {
    emit({
      code: "WAVE15_PREREQ",
      path: `units[id=${WAVE15_FINAL_UNIT_ID}].prereqUnitIds`,
      message: "Unit 2 must unlock after Unit 1.",
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = asRecord(paths.find((row) => asRecord(row)?.["id"] === WAVE15_PATH_ID));
  if (!path) {
    emit({
      code: "WAVE15_PATH",
      path: "paths",
      message: "Wave 15 must include path.literacy.wave15.",
      severity: "error",
    });
  } else if (asStringArray(path["unitIds"]).join(",") !== WAVE15_UNIT_IDS.join(",")) {
    emit({
      code: "WAVE15_PATH",
      path: "paths[id=path.literacy.wave15].unitIds",
      message: "Wave 15 path must list exactly the two Wave 15 units in order.",
      severity: "error",
    });
  }

  const u1Exercises = asStringArray(unit1["exerciseIds"]);
  const u2Exercises = asStringArray(unit2["exerciseIds"]);
  if (asStringArray(unit1["wordIds"]).length > 0) {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}]`,
      message: "Unit 1 must have no word target.",
      severity: "error",
    });
  }

  const u1Presentations = u1Exercises.filter((id) => exercises.get(id)?.["type"] === "presentation");
  const firstScoredU1 = u1Exercises.find((id) => exercises.get(id)?.["type"] !== "presentation");
  if (u1Presentations.length < 3 || u1Exercises.slice(0, u1Presentations.length).some((id) => exercises.get(id)?.["type"] !== "presentation")) {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must place ALL presentations at the front.",
      severity: "error",
    });
  }
  const showFatha = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["syllableId"] === "syllable.jim.fatha");
  const showKasra = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["syllableId"] === "syllable.jim.kasra");
  const showClosed = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["result"] === "جِسْ");
  const showFathaEx = showFatha ? exercises.get(showFatha) : undefined;
  const showKasraEx = showKasra ? exercises.get(showKasra) : undefined;
  const showClosedEx = showClosed ? exercises.get(showClosed) : undefined;
  if (showFathaEx?.["type"] !== "presentation" || asRecord(showFathaEx["config"])?.["show"] !== "cv") {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must start with familiar جَ SHOW (show: cv).",
      severity: "error",
    });
  }
  if (showKasraEx?.["type"] !== "presentation" || asRecord(showKasraEx["config"])?.["show"] !== "cv") {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must SHOW ج + ِ → جِ before scoring.",
      severity: "error",
    });
  }
  const closedConfig = asRecord(showClosedEx?.["config"]);
  if (
    showClosedEx?.["type"] !== "presentation" ||
    closedConfig?.["show"] !== "chunk" ||
    closedConfig?.["left"] !== "جِ" ||
    closedConfig?.["right"] !== "سْ" ||
    closedConfig?.["result"] !== "جِسْ"
  ) {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must SHOW جِ + سْ → جِسْ before scored CVC.",
      severity: "error",
    });
  }
  if (showFatha && showKasra && u1Exercises.indexOf(showFatha) > u1Exercises.indexOf(showKasra)) {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].exerciseIds`,
      message: "Familiar جَ SHOW must occur before جِ SHOW.",
      severity: "error",
    });
  }
  if (showKasra && showClosed && u1Exercises.indexOf(showKasra) > u1Exercises.indexOf(showClosed)) {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].exerciseIds`,
      message: "جِ SHOW must occur before جِسْ SHOW.",
      severity: "error",
    });
  }
  if (firstScoredU1 && showClosed && u1Exercises.indexOf(showClosed) > u1Exercises.indexOf(firstScoredU1)) {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unscored جِسْ must occur before scored evidence.",
      severity: "error",
    });
  }

  const kasraScoreEx = firstScoredU1 ? exercises.get(firstScoredU1) : undefined;
  if (kasraScoreEx?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].exerciseIds`,
      message: "First scored Unit 1 evidence must be syllable_blending for جِ.",
      severity: "error",
    });
  } else {
    const choices = asStringArray(
      (Array.isArray(kasraScoreEx["choices"]) ? kasraScoreEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    if (
      asRecord(kasraScoreEx["success"])?.["correctChoiceId"] !== "syllable.jim.kasra" ||
      !choices.includes("syllable.jim.kasra") ||
      SAFE_KASRA_FOILS.some((id) => !choices.includes(id))
    ) {
      emit({
        code: "WAVE15_FLOW",
        path: `exercises[id=${firstScoredU1}].choices`,
        message: "Scored kasra activity must target جِ with foils جَ and عِ.",
        severity: "error",
      });
    }
    const targetSkills = skillIdsOnTargets(kasraScoreEx);
    if (targetSkills.includes("skill.short_vowel.fatha") || targetSkills.some((id) => id.includes("discrimination"))) {
      emit({
        code: "WAVE15_LIVE_KEY",
        path: `exercises[id=${firstScoredU1}].masteryTargets`,
        message: "Unit 1 must not gate letter:jim.fatha or mark-discrimination.",
        severity: "error",
      });
    }
    const targets = Array.isArray(kasraScoreEx["masteryTargets"]) ? kasraScoreEx["masteryTargets"] : [];
    if (targets.some((row) => asRecord(row)?.["letterId"] === "letter.kaf" || asRecord(row)?.["letterId"] === "letter.ain")) {
      emit({
        code: "WAVE15_LIVE_KEY",
        path: `exercises[id=${firstScoredU1}].masteryTargets`,
        message: "Historical kaf/ain kasra must not be a Wave 15 mastery target.",
        severity: "error",
      });
    }
    if (targets.some((row) => asRecord(row)?.["syllableId"] === "syllable.jis.closed")) {
      emit({
        code: "WAVE15_LIVE_KEY",
        path: `exercises[id=${firstScoredU1}].masteryTargets`,
        message: "First scored item must write letter:jim.kasra, not the closed chunk.",
        severity: "error",
      });
    }
  }

  const cvcScoreId = u1Exercises.find((id) => {
    const exercise = exercises.get(id);
    return exercise?.["type"] === "syllable_blending" && asRecord(exercise["success"])?.["correctChoiceId"] === "syllable.jis.closed";
  });
  const cvcScoreEx = cvcScoreId ? exercises.get(cvcScoreId) : undefined;
  if (cvcScoreEx?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE15_CHUNK",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must include scored CVC blending for جِسْ.",
      severity: "error",
    });
  } else {
    const choices = asStringArray(
      (Array.isArray(cvcScoreEx["choices"]) ? cvcScoreEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    if (SAFE_CVC_FOILS.some((id) => !choices.includes(id))) {
      emit({
        code: "WAVE15_CHUNK",
        path: `exercises[id=${cvcScoreId}].choices`,
        message: "Scored CVC foils must include جِ and رَمْ.",
        severity: "error",
      });
    }
    const targets = Array.isArray(cvcScoreEx["masteryTargets"]) ? cvcScoreEx["masteryTargets"] : [];
    if (
      targets.some((row) => asRecord(row)?.["syllableId"] === "syllable.ram.closed") ||
      targets.some((row) => asRecord(row)?.["skillId"] === "skill.sukun.basic")
    ) {
      emit({
        code: "WAVE15_LIVE_KEY",
        path: `exercises[id=${cvcScoreId}].masteryTargets`,
        message: "Historical letter:ram.closed and sukun-mark must not be Wave 15 mastery targets.",
        severity: "error",
      });
    }
    if (!targets.some((row) => asRecord(row)?.["syllableId"] === "syllable.jis.closed" && asRecord(row)?.["skillId"] === "skill.syllable_blending.cvc")) {
      emit({
        code: "WAVE15_LIVE_KEY",
        path: `exercises[id=${cvcScoreId}].masteryTargets`,
        message: "Scored CVC must target syllable.jis.closed with skill.syllable_blending.cvc.",
        severity: "error",
      });
    }
  }
  if (cvcScoreId && firstScoredU1 && u1Exercises.indexOf(cvcScoreId) < u1Exercises.indexOf(firstScoredU1)) {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].exerciseIds`,
      message: "Scored جِ must occur before scored جِسْ.",
      severity: "error",
    });
  }
  if (u1Exercises.some((id) => exercises.get(id)?.["type"] === "audio_to_word" || exercises.get(id)?.["type"] === "letter_recognition")) {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must not include a word target or form quiz.",
      severity: "error",
    });
  }

  const u2Presentations = u2Exercises.filter((id) => exercises.get(id)?.["type"] === "presentation");
  if (u2Exercises.slice(0, u2Presentations.length).some((id) => exercises.get(id)?.["type"] !== "presentation")) {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must place ALL presentations at the front.",
      severity: "error",
    });
  }
  const jismComposeId = u2Exercises.find((id) => {
    const config = asRecord(exercises.get(id)?.["config"]);
    return exercises.get(id)?.["type"] === "presentation" && config?.["result"] === "جِسْم";
  });
  const audioId = u2Exercises.find((id) => exercises.get(id)?.["type"] === "audio_to_word");
  const pictureId = u2Exercises.find((id) => exercises.get(id)?.["type"] === "word_to_picture");
  const jismComposeEx = jismComposeId ? exercises.get(jismComposeId) : undefined;
  const audioEx = audioId ? exercises.get(audioId) : undefined;
  const pictureEx = pictureId ? exercises.get(pictureId) : undefined;
  const jismConfig = asRecord(jismComposeEx?.["config"]);
  if (
    jismComposeEx?.["type"] !== "presentation" ||
    jismConfig?.["show"] !== "chunk" ||
    jismConfig?.["left"] !== "جِسْ" ||
    jismConfig?.["right"] !== "م" ||
    jismConfig?.["result"] !== "جِسْم"
  ) {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must include unscored جِسْ + isolated م → جِسْم.",
      severity: "error",
    });
  }
  if (jismConfig?.["right"] === "ـم") {
    emit({
      code: "WAVE15_JOINING",
      path: `exercises[id=${jismComposeId}].config.right`,
      message: "Compose operand may be isolated م; the joined result must shape final ـم.",
      severity: "error",
    });
  }
  if (audioEx?.["type"] !== "audio_to_word") {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FINAL_UNIT_ID}].exerciseIds`,
      message: "First scored جِسْم evidence must be audio_to_word.",
      severity: "error",
    });
  } else {
    const choiceIds = asStringArray(
      (Array.isArray(audioEx["choices"]) ? audioEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    const choiceLabels = asStringArray(
      (Array.isArray(audioEx["choices"]) ? audioEx["choices"] : []).map((choice) => asRecord(choice)?.["label"]),
    );
    if (asRecord(audioEx["success"])?.["correctChoiceId"] !== "word.jism" || !choiceIds.includes("word.jism")) {
      emit({
        code: "WAVE15_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "audio_to_word choices must include جِسْم.",
        severity: "error",
      });
    }
    if (!choiceLabels.includes("جِسْم")) {
      emit({
        code: "WAVE15_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "audio_to_word target label must be جِسْم.",
        severity: "error",
      });
    }
    const foils = choiceIds.filter((id) => id !== "word.jism");
    if (foils.some((id) => !(SAFE_FOIL_WORDS as readonly string[]).includes(id))) {
      emit({
        code: "WAVE15_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "جِسْم foils must already be decoded (جَمَل / شَمْس, or عِنَب / كِتَاب).",
        severity: "error",
      });
    }
  }
  if (pictureId && audioId && u2Exercises.indexOf(pictureId) < u2Exercises.indexOf(audioId)) {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FINAL_UNIT_ID}].exerciseIds`,
      message: "Picture must not be first جِسْم evidence.",
      severity: "error",
    });
  }
  if (jismComposeId && audioId && u2Exercises.indexOf(jismComposeId) > u2Exercises.indexOf(audioId)) {
    emit({
      code: "WAVE15_FLOW",
      path: `units[id=${WAVE15_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unscored جِسْم compose must occur before audio_to_word.",
      severity: "error",
    });
  }
  if (pictureEx && !asStringArray(pictureEx["tags"]).includes("reinforcement")) {
    emit({
      code: "WAVE15_FLOW",
      path: `exercises[id=${pictureId}].tags`,
      message: "جِسْم picture must be reinforcement only.",
      severity: "error",
    });
  }

  for (const exercise of exercises.values()) {
    if (asStringArray(exercise["tags"]).includes("review")) {
      emit({
        code: "WAVE15_REVIEW",
        path: `exercises[id=${exercise["id"]}].tags`,
        message: "Wave 15 must not include a required review exercise.",
        severity: "error",
      });
    }
    if (exercise["type"] === "presentation" && (exercise["masteryTargets"] as unknown[] | undefined)?.length) {
      emit({
        code: "WAVE15_PRESENTATION",
        path: `exercises[id=${exercise["id"]}].`,
        message: "Wave 15 presentations must remain unscored (attempts 0).",
        severity: "error",
      });
    }
    if (exercise["type"] === "sound_to_letter" || exercise["type"] === "letter_recognition") {
      emit({
        code: "WAVE15_FORM",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 15 must not add a letter-sound or form quiz.",
        severity: "error",
      });
    }
    if (exercise["type"] === "missing_haraka") {
      emit({
        code: "WAVE15_MASTERY",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 15 must not use missing_haraka as kasra or sukun mastery.",
        severity: "error",
      });
    }
  }

  const u1Required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
  const u2Required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
  if (
    !u1Required.includes("skill.short_vowel.kasra") ||
    !u1Required.includes("skill.syllable_blending.cvc") ||
    u1Required.includes("skill.sukun.basic") ||
    u1Required.includes("skill.letter_forms.positional") ||
    u1Required.includes("skill.word_decoding.simple")
  ) {
    emit({
      code: "WAVE15_MASTERY",
      path: `units[id=${WAVE15_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 1 must require skill.short_vowel.kasra and skill.syllable_blending.cvc only.",
      severity: "error",
    });
  }
  if (u2Required.join(",") !== "skill.word_decoding.simple") {
    emit({
      code: "WAVE15_MASTERY",
      path: `units[id=${WAVE15_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 2 must require skill.word_decoding.simple only.",
      severity: "error",
    });
  }

  for (const [unitId, unit] of [
    [WAVE15_FIRST_UNIT_ID, unit1],
    [WAVE15_FINAL_UNIT_ID, unit2],
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
          code: "WAVE15_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave15WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE15_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE15_BAND_A_REF",
        path: "words",
        message: `Wave 15 word "${id}" is not in production Band A.`,
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
          code: "WAVE15_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 15 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE15_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 15 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== source["legacyId"]) {
      emit({
        code: "WAVE15_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `Wave 15 "${id}" legacyId must match Band A.`,
        severity: "error",
      });
    }
    if (source["legacyId"] !== "body-40") {
      emit({
        code: "WAVE15_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: "word.jism must remain Band A body-40.",
        severity: "error",
      });
    }
  }
}
