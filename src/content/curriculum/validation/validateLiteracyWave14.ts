/**
 * Deterministic Wave 14 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 14 production bundle.
 * Waves 1–13 stay frozen. Kasra transfers from historical kaf onto ain.
 * Medial nun is prepared, then عِنَب. Compact two-unit wave.
 * No new phonics rule, no new consonant, no sukun, Wave 15.
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
import {
  WAVE13_FINAL_UNIT_ID,
  WAVE13_LETTER_IDS,
  WAVE13_WORD_IDS,
} from "./validateLiteracyWave13.ts";

export const LITERACY_WAVE14_META_ID = "hurufi.production.literacy.wave14";

export const WAVE14_LETTER_IDS = [] as const;

export const WAVE14_WORD_IDS = ["word.inab"] as const;

export const WAVE14_BAND_A_WORD_IDS = ["word.inab"] as const;

export const WAVE14_PATH_ID = "path.literacy.wave14";

export const WAVE14_UNIT_IDS = [
  "unit.literacy.wave14.ain_kasra_nun_medial",
  "unit.literacy.wave14.inab",
] as const;

export const WAVE14_FIRST_UNIT_ID = "unit.literacy.wave14.ain_kasra_nun_medial";
export const WAVE14_FINAL_UNIT_ID = "unit.literacy.wave14.inab";

export const WAVE14_EXTERNAL_PREREQ_UNIT_IDS = [WAVE13_FINAL_UNIT_ID] as const;

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
  "word.jism",
  "word.bint",
  "word.masjid",
  "word.miftah",
  "word.barid",
  "word.laa",
  "word.naam",
  "word.shay",
] as const;

const SAFE_KASRA_FOILS = ["syllable.ain.fatha", "syllable.kaf.kasra"] as const;
const SAFE_FORM_FOILS = ["letter.mim", "letter.ta"] as const;
const SAFE_FOIL_WORDS = ["word.asal", "word.kitab", "word.nar"] as const;

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
const MEDIAL_NUN = "ـنـ";
const INITIAL_NUN = "نـ";

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

export function isLiteracyWave14Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE14_META_ID;
}

export function validateLiteracyWave14Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE14_META",
        path: "meta.kind",
        message: "Literacy Wave 14 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE14_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 14 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-15") || blob.includes("wave15") || blob.includes("path.literacy.wave15")) {
    emit({
      code: "WAVE14_SCOPE",
      path: "$",
      message: "Wave 14 must not declare a Wave 15 path, route, or CTA.",
      severity: "error",
    });
  }
  for (const id of FORBIDDEN_WORDS) {
    if (blob.includes(id) || blob.includes(id.replace("word.", "word:"))) {
      emit({
        code: "WAVE14_SCOPE",
        path: "$",
        message: `Wave 14 must not include forbidden word ${id}.`,
        severity: "error",
      });
    }
  }
  if (blob.includes("العنب") || blob.includes("الْعِنَب") || blob.includes("الْعِنَبِ")) {
    emit({
      code: "WAVE14_TITLE",
      path: "$",
      message: "Wave 14 must not use child title العنب / definite عِنَب.",
      severity: "error",
    });
  }
  if (blob.includes("missing_haraka") || blob.includes("diacritic:ain.kasra")) {
    emit({
      code: "WAVE14_MASTERY",
      path: "$",
      message: "Wave 14 must not require mark-only kasra discrimination.",
      severity: "error",
    });
  }
  if (blob.includes(".closed") || blob.includes("letter:ain.closed") || blob.includes("letter:nun.closed")) {
    emit({
      code: "WAVE14_CHUNK",
      path: "$",
      message: "Wave 14 must not add a new .closed live key.",
      severity: "error",
    });
  }
  if (FORBIDDEN_LETTERS.some((id) => blob.includes(`"${id}"`))) {
    emit({
      code: "WAVE14_LETTER",
      path: "$",
      message: "Wave 14 must not teach a new consonant.",
      severity: "error",
    });
  }
  if (
    blob.includes("review-wave14") ||
    blob.includes("review.wave14") ||
    blob.includes("word:inab.review") ||
    blob.includes("skill.articulation")
  ) {
    emit({
      code: "WAVE14_REVIEW",
      path: "$",
      message: "Wave 14 must not require a review key or a new articulation skill.",
      severity: "error",
    });
  }

  for (const text of childTitleStrings(data)) {
    if (HAMZA_SEATS.test(text) || SHADDA.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text)) {
      emit({
        code: "WAVE14_TITLE",
        path: "childTitle",
        message: `Wave 14 child titles must not contain hamza, shadda, ة, or ى: "${text}".`,
        severity: "error",
      });
    }
  }
  for (const text of childVisibleStrings(data)) {
    if (HAMZA_SEATS.test(text)) {
      emit({
        code: "WAVE14_HAMZA",
        path: "childVisible",
        message: `Wave 14 child-visible copy must not contain أ / إ / آ: "${text}".`,
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
    if (DAMMA.test(text) || TANWEEN.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text) || DIPHTHONG.test(text)) {
      emit({
        code: "WAVE14_PHONICS",
        path: "childVisible",
        message: `Wave 14 glyphs/titles must not contain damma, tanween, ة, ى, or a diphthong: "${text}".`,
        severity: "error",
      });
    }
  }

  const priorLetters = stringSet(PRIOR_LETTER_IDS);
  const allowedLetters = new Set<string>([...PRIOR_LETTER_IDS, ...WAVE14_LETTER_IDS, ...CARRIER_LETTER_IDS]);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  let foundAin = false;
  let foundNun = false;
  let foundBa = false;
  for (let i = 0; i < letters.length; i++) {
    const letter = asRecord(letters[i]);
    if (!letter) continue;
    const id = typeof letter["id"] === "string" ? letter["id"] : "";
    if (id && !allowedLetters.has(id)) {
      emit({
        code: "WAVE14_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 14 must not introduce untaught letter "${id}".`,
        severity: "error",
      });
    }
    if (id === "letter.ain") {
      foundAin = true;
      if (letter["nonConnecting"] === true) {
        emit({
          code: "WAVE14_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.ain must remain dual-joining so عِنَب begins with initial عـ.",
          severity: "error",
        });
      }
    }
    if (id === "letter.nun") {
      foundNun = true;
      const forms = asRecord(letter["forms"]);
      if (forms?.["medial"] !== MEDIAL_NUN) {
        emit({
          code: "WAVE14_FORM",
          path: `letters[${i}].forms.medial`,
          message: "letter.nun medial form must be ـنـ.",
          severity: "error",
        });
      }
      if (letter["nonConnecting"] === true) {
        emit({
          code: "WAVE14_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.nun must remain dual-joining so ن in عِنَب is medial ـنـ.",
          severity: "error",
        });
      }
    }
    if (id === "letter.ba") {
      foundBa = true;
      if (letter["nonConnecting"] === true) {
        emit({
          code: "WAVE14_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.ba must remain dual-joining so ب in عِنَب is final ـب.",
          severity: "error",
        });
      }
    }
    const wave = expectedPriorWave(id);
    if (wave !== undefined && priorLetters.has(id)) {
      const tags = asStringArray(letter["tags"]);
      if (!tags.includes("recycled")) {
        emit({
          code: "WAVE14_LETTER",
          path: `letters[${i}].tags`,
          message: `Recycled letter "${id}" must be tagged recycled.`,
          severity: "error",
        });
      }
    }
  }
  if (!foundAin) {
    emit({
      code: "WAVE14_LETTER",
      path: "letters",
      message: "Wave 14 must include recycled letter.ain as the kasra carrier.",
      severity: "error",
    });
  }
  if (!foundNun) {
    emit({
      code: "WAVE14_LETTER",
      path: "letters",
      message: "Wave 14 must include recycled letter.nun for medial form prep.",
      severity: "error",
    });
  }
  if (!foundBa) {
    emit({
      code: "WAVE14_LETTER",
      path: "letters",
      message: "Wave 14 must include recycled letter.ba for final ـب in عِنَب.",
      severity: "error",
    });
  }

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE14_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  for (let i = 0; i < words.length; i++) {
    const word = asRecord(words[i]);
    if (!word) continue;
    const id = typeof word["id"] === "string" ? word["id"] : "";
    if (id && !allowedWords.has(id)) {
      emit({
        code: "WAVE14_WORD",
        path: `words[${i}].id`,
        message: `Wave 14 must not introduce untaught word "${id}".`,
        severity: "error",
      });
    }
    if ((WAVE14_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
    if (id === "word.inab") {
      if (word["teachingForm"] !== "عِنَب" || word["diacritized"] !== "عِنَب") {
        emit({
          code: "WAVE14_WORD",
          path: `words[${i}].teachingForm`,
          message: "word.inab teachingForm must be عِنَب.",
          severity: "error",
        });
      }
      if (word["lemma"] !== "عنب") {
        emit({
          code: "WAVE14_WORD",
          path: `words[${i}].lemma`,
          message: "word.inab lemma must be عنب.",
          severity: "error",
        });
      }
      const form = typeof word["teachingForm"] === "string" ? word["teachingForm"] : "";
      if (SUKUN.test(form)) {
        emit({
          code: "WAVE14_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "عِنَب contains no sukun.",
          severity: "error",
        });
      }
      if (!KASRA.test(form) || !FATHA.test(form)) {
        emit({
          code: "WAVE14_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "عِنَب phonics must be kasra + fatha.",
          severity: "error",
        });
      }
      if (DAMMA.test(form) || TAA_MARBUTA.test(form) || ALIF_MAQSURA.test(form) || SHADDA.test(form) || TANWEEN.test(form)) {
        emit({
          code: "WAVE14_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "عِنَب must not contain damma, shadda, tanween, ة, or ى.",
          severity: "error",
        });
      }
      if (form.includes("عِنْ") || form === "عِنْب") {
        emit({
          code: "WAVE14_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "عِنَب must decompose as عِ + نَ + ب, not عِنْ.",
          severity: "error",
        });
      }
      const phonics = asStringArray(word["phonicsSkillIds"]);
      const required = asStringArray(word["requiredSkillIds"]);
      if (!phonics.includes("skill.short_vowel.kasra") || !required.includes("skill.short_vowel.kasra")) {
        emit({
          code: "WAVE14_PHONICS",
          path: `words[${i}]`,
          message: "word.inab must require skill.short_vowel.kasra.",
          severity: "error",
        });
      }
      if (!phonics.includes("skill.short_vowel.fatha") || !required.includes("skill.short_vowel.fatha")) {
        emit({
          code: "WAVE14_PHONICS",
          path: `words[${i}]`,
          message: "word.inab must require skill.short_vowel.fatha.",
          severity: "error",
        });
      }
      if (phonics.includes("skill.sukun.basic") || required.includes("skill.sukun.basic")) {
        emit({
          code: "WAVE14_PHONICS",
          path: `words[${i}]`,
          message: "word.inab must not require sukun.",
          severity: "error",
        });
      }
      if (phonics.includes("skill.long_vowel.madd") || required.includes("skill.long_vowel.madd")) {
        emit({
          code: "WAVE14_PHONICS",
          path: `words[${i}]`,
          message: "word.inab must not require madd.",
          severity: "error",
        });
      }
      for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
        if (
          phonics.some((skillId) => skillId.startsWith(prefix) || skillId === prefix) ||
          required.some((skillId) => skillId.startsWith(prefix) || skillId === prefix)
        ) {
          emit({
            code: "WAVE14_PHONICS",
            path: `words[${i}]`,
            message: `word.inab must not require forbidden skill prefix ${prefix}.`,
            severity: "error",
          });
        }
      }
      if (word["legacyId"] !== "fruits-4") {
        emit({
          code: "WAVE14_WORD",
          path: `words[${i}].legacyId`,
          message: "word.inab must remain Band A fruits-4.",
          severity: "error",
        });
      }
      if (word["vocabBand"] !== "A" || word["subBand"] !== "A3") {
        emit({
          code: "WAVE14_WORD",
          path: `words[${i}].subBand`,
          message: "word.inab must remain Band A / A3.",
          severity: "error",
        });
      }
      const forms = letterFormsOnWord(word);
      const ainForms = forms.filter((row) => row.letterId === "letter.ain").map((row) => row.form);
      const nunForms = forms.filter((row) => row.letterId === "letter.nun").map((row) => row.form);
      const baForms = forms.filter((row) => row.letterId === "letter.ba").map((row) => row.form);
      if (!ainForms.includes("initial") || ainForms.includes("medial") || ainForms.includes("final")) {
        emit({
          code: "WAVE14_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "ع must be recorded as initial عـ, not medial or final.",
          severity: "error",
        });
      }
      if (!nunForms.includes("medial") || nunForms.includes("initial") || nunForms.includes("final")) {
        emit({
          code: "WAVE14_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "ن in عِنَب must be recorded as medial ـنـ.",
          severity: "error",
        });
      }
      if (!baForms.includes("final") || baForms.includes("isolated") || baForms.includes("initial")) {
        emit({
          code: "WAVE14_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "ب in عِنَب must be recorded as final ـب.",
          severity: "error",
        });
      }
    }
  }
  for (const id of WAVE14_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE14_WORD",
        path: "words",
        message: `Wave 14 must include ${id}.`,
        severity: "error",
      });
    }
  }
  if (foundNewWords.size !== WAVE14_WORD_IDS.length) {
    emit({
      code: "WAVE14_WORD",
      path: "words",
      message: "Wave 14 must add exactly word.inab.",
      severity: "error",
    });
  }

  const skills = Array.isArray(rec["skills"]) ? rec["skills"] : [];
  let foundKasraSkill = false;
  let foundNewPhonics = false;
  for (let i = 0; i < skills.length; i++) {
    const skill = asRecord(skills[i]);
    const skillId = typeof skill?.["id"] === "string" ? skill["id"] : "";
    if (skillId === "skill.short_vowel.kasra") foundKasraSkill = true;
    if (skillId === "skill.short_vowel.damma" || skillId.startsWith("skill.long_vowel.madd_")) {
      foundNewPhonics = true;
    }
    for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
      if (skillId.startsWith(prefix) || skillId === prefix) {
        emit({
          code: "WAVE14_PHONICS",
          path: `skills[${i}].id`,
          message: `Wave 14 must not add forbidden skill "${skillId}".`,
          severity: "error",
        });
      }
    }
  }
  if (!foundKasraSkill) {
    emit({
      code: "WAVE14_PHONICS",
      path: "skills",
      message: "Wave 14 must recycle skill.short_vowel.kasra; it does not introduce a new phonics rule.",
      severity: "error",
    });
  }
  if (foundNewPhonics) {
    emit({
      code: "WAVE14_PHONICS",
      path: "skills",
      message: "Wave 14 must not introduce a new phonics rule (damma / madd-yaa / madd-waw).",
      severity: "error",
    });
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  let foundAinKasra = false;
  let foundAinFatha = false;
  for (let i = 0; i < syllables.length; i++) {
    const syllable = asRecord(syllables[i]);
    if (!syllable) continue;
    if (syllable["id"] === "syllable.ain.kasra") {
      foundAinKasra = true;
      if (
        syllable["pattern"] !== "CV" ||
        syllable["text"] !== "عِ" ||
        syllable["vowelSkillId"] !== "skill.short_vowel.kasra" ||
        syllable["letterId"] !== "letter.ain"
      ) {
        emit({
          code: "WAVE14_CV",
          path: `syllables[${i}]`,
          message: "syllable.ain.kasra must be CV عِ with skill.short_vowel.kasra.",
          severity: "error",
        });
      }
    }
    if (syllable["id"] === "syllable.ain.fatha") {
      foundAinFatha = true;
      if (syllable["pattern"] !== "CV" || syllable["text"] !== "عَ" || syllable["vowelSkillId"] !== "skill.short_vowel.fatha") {
        emit({
          code: "WAVE14_CV",
          path: `syllables[${i}]`,
          message: "syllable.ain.fatha must be CV عَ with skill.short_vowel.fatha.",
          severity: "error",
        });
      }
    }
    if (syllable["pattern"] === "CVC") {
      emit({
        code: "WAVE14_CHUNK",
        path: `syllables[${i}].pattern`,
        message: "Wave 14 must not add a new CVC syllable.",
        severity: "error",
      });
    }
    const text = typeof syllable["text"] === "string" ? syllable["text"] : "";
    if (SUKUN.test(text)) {
      emit({
        code: "WAVE14_PHONICS",
        path: `syllables[${i}].text`,
        message: "Wave 14 syllables must not contain sukun.",
        severity: "error",
      });
    }
  }
  if (!foundAinKasra) {
    emit({
      code: "WAVE14_CV",
      path: "syllables",
      message: "Wave 14 must include syllable.ain.kasra.",
      severity: "error",
    });
  }
  if (!foundAinFatha) {
    emit({
      code: "WAVE14_CV",
      path: "syllables",
      message: "Wave 14 must include familiar syllable.ain.fatha.",
      severity: "error",
    });
  }

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 2) {
    emit({
      code: "WAVE14_UNITS",
      path: "units",
      message: "Wave 14 must declare exactly two units.",
      severity: "error",
    });
  }

  const unit1 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE14_FIRST_UNIT_ID));
  const unit2 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE14_FINAL_UNIT_ID));
  if (!unit1 || !unit2) {
    emit({
      code: "WAVE14_UNITS",
      path: "units",
      message: "Wave 14 must include ain_kasra_nun_medial and inab units.",
      severity: "error",
    });
    return;
  }

  if (unit1["titleAr"] !== "عِ" || unit2["titleAr"] !== "عِنَب") {
    emit({
      code: "WAVE14_TITLE",
      path: "units",
      message: "Wave 14 child titles must be عِ, عِنَب.",
      severity: "error",
    });
  }

  if (asStringArray(unit1["prereqUnitIds"])[0] !== WAVE13_FINAL_UNIT_ID) {
    emit({
      code: "WAVE14_PREREQ",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].prereqUnitIds`,
      message: "Wave 14 Unit 1 prerequisite must be unit.literacy.wave13.kitab.",
      severity: "error",
    });
  }
  if (asStringArray(unit2["prereqUnitIds"])[0] !== WAVE14_FIRST_UNIT_ID) {
    emit({
      code: "WAVE14_PREREQ",
      path: `units[id=${WAVE14_FINAL_UNIT_ID}].prereqUnitIds`,
      message: "Unit 2 must unlock after Unit 1.",
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = asRecord(paths.find((row) => asRecord(row)?.["id"] === WAVE14_PATH_ID));
  if (!path) {
    emit({
      code: "WAVE14_PATH",
      path: "paths",
      message: "Wave 14 must include path.literacy.wave14.",
      severity: "error",
    });
  } else if (asStringArray(path["unitIds"]).join(",") !== WAVE14_UNIT_IDS.join(",")) {
    emit({
      code: "WAVE14_PATH",
      path: "paths[id=path.literacy.wave14].unitIds",
      message: "Wave 14 path must list exactly the two Wave 14 units in order.",
      severity: "error",
    });
  }

  const u1Exercises = asStringArray(unit1["exerciseIds"]);
  const u2Exercises = asStringArray(unit2["exerciseIds"]);
  if (asStringArray(unit1["wordIds"]).length > 0) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}]`,
      message: "Unit 1 must have no word target.",
      severity: "error",
    });
  }

  const u1Presentations = u1Exercises.filter((id) => exercises.get(id)?.["type"] === "presentation");
  const firstScoredU1 = u1Exercises.find((id) => exercises.get(id)?.["type"] !== "presentation");
  if (u1Presentations.length < 3 || u1Exercises.slice(0, u1Presentations.length).some((id) => exercises.get(id)?.["type"] !== "presentation")) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must place ALL presentations at the front.",
      severity: "error",
    });
  }
  const showFatha = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["syllableId"] === "syllable.ain.fatha");
  const showKasra = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["syllableId"] === "syllable.ain.kasra");
  const showNun = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["result"] === MEDIAL_NUN);
  const showFathaEx = showFatha ? exercises.get(showFatha) : undefined;
  const showKasraEx = showKasra ? exercises.get(showKasra) : undefined;
  const showNunEx = showNun ? exercises.get(showNun) : undefined;
  if (showFathaEx?.["type"] !== "presentation" || asRecord(showFathaEx["config"])?.["show"] !== "cv") {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must start with familiar عَ SHOW (show: cv).",
      severity: "error",
    });
  }
  if (showKasraEx?.["type"] !== "presentation" || asRecord(showKasraEx["config"])?.["show"] !== "cv") {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must SHOW ع + ِ → عِ before scoring.",
      severity: "error",
    });
  }
  const nunConfig = asRecord(showNunEx?.["config"]);
  if (
    showNunEx?.["type"] !== "presentation" ||
    nunConfig?.["show"] !== "chunk" ||
    nunConfig?.["result"] !== MEDIAL_NUN
  ) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must SHOW medial ـنـ before scored form.",
      severity: "error",
    });
  }
  if (nunConfig?.["result"] === INITIAL_NUN || nunConfig?.["left"] === INITIAL_NUN) {
    emit({
      code: "WAVE14_FORM",
      path: `exercises[id=${showNun}].config`,
      message: "Medial nun SHOW must be ـنـ, not initial نـ.",
      severity: "error",
    });
  }
  if (showFatha && showKasra && u1Exercises.indexOf(showFatha) > u1Exercises.indexOf(showKasra)) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].exerciseIds`,
      message: "Familiar عَ SHOW must occur before عِ SHOW.",
      severity: "error",
    });
  }
  if (showKasra && showNun && u1Exercises.indexOf(showKasra) > u1Exercises.indexOf(showNun)) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].exerciseIds`,
      message: "عِ SHOW must occur before medial ـنـ SHOW.",
      severity: "error",
    });
  }
  if (firstScoredU1 && showNun && u1Exercises.indexOf(showNun) > u1Exercises.indexOf(firstScoredU1)) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unscored medial ـنـ must occur before scored evidence.",
      severity: "error",
    });
  }

  const kasraScoreEx = firstScoredU1 ? exercises.get(firstScoredU1) : undefined;
  if (kasraScoreEx?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].exerciseIds`,
      message: "First scored Unit 1 evidence must be syllable_blending for عِ.",
      severity: "error",
    });
  } else {
    const choices = asStringArray(
      (Array.isArray(kasraScoreEx["choices"]) ? kasraScoreEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    if (
      asRecord(kasraScoreEx["success"])?.["correctChoiceId"] !== "syllable.ain.kasra" ||
      !choices.includes("syllable.ain.kasra") ||
      SAFE_KASRA_FOILS.some((id) => !choices.includes(id))
    ) {
      emit({
        code: "WAVE14_FLOW",
        path: `exercises[id=${firstScoredU1}].choices`,
        message: "Scored kasra activity must target عِ with foils عَ and كِ.",
        severity: "error",
      });
    }
    const targetSkills = skillIdsOnTargets(kasraScoreEx);
    if (targetSkills.includes("skill.short_vowel.fatha") || targetSkills.some((id) => id.includes("discrimination"))) {
      emit({
        code: "WAVE14_LIVE_KEY",
        path: `exercises[id=${firstScoredU1}].masteryTargets`,
        message: "Unit 1 must not gate letter:ain.fatha or mark-discrimination.",
        severity: "error",
      });
    }
    const targets = Array.isArray(kasraScoreEx["masteryTargets"]) ? kasraScoreEx["masteryTargets"] : [];
    if (targets.some((row) => asRecord(row)?.["letterId"] === "letter.kaf")) {
      emit({
        code: "WAVE14_LIVE_KEY",
        path: `exercises[id=${firstScoredU1}].masteryTargets`,
        message: "Historical letter:kaf.kasra must not be a Wave 14 mastery target.",
        severity: "error",
      });
    }
  }

  const formScoreId = u1Exercises.find((id) => exercises.get(id)?.["type"] === "letter_recognition");
  const formScoreEx = formScoreId ? exercises.get(formScoreId) : undefined;
  const formConfig = asRecord(formScoreEx?.["config"]);
  if (formScoreEx?.["type"] !== "letter_recognition" || formConfig?.["targetForm"] !== "medial") {
    emit({
      code: "WAVE14_FORM",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must include scored medial nun form identification.",
      severity: "error",
    });
  } else {
    if (formConfig?.["letterId"] !== "letter.nun") {
      emit({
        code: "WAVE14_FORM",
        path: `exercises[id=${formScoreId}].config.letterId`,
        message: "Scored form prompt must target letter.nun.",
        severity: "error",
      });
    }
    const formTargets = Array.isArray(formScoreEx["masteryTargets"]) ? formScoreEx["masteryTargets"] : [];
    if (
      formTargets.some(
        (row) =>
          asRecord(row)?.["letterForm"] === "initial" ||
          asRecord(row)?.["letterForm"] === "final" ||
          asRecord(row)?.["letterForm"] === "isolated",
      )
    ) {
      emit({
        code: "WAVE14_FORM",
        path: `exercises[id=${formScoreId}].masteryTargets`,
        message: "Wave 14 must not quiz initial, final, or isolated nun.",
        severity: "error",
      });
    }
    if (formTargets.some((row) => asRecord(row)?.["letterId"] === "letter.ain" && asRecord(row)?.["letterForm"])) {
      emit({
        code: "WAVE14_FORM",
        path: `exercises[id=${formScoreId}].masteryTargets`,
        message: "Historical ain initial must not be re-gated.",
        severity: "error",
      });
    }
    const formChoices = asStringArray(
      (Array.isArray(formScoreEx["choices"]) ? formScoreEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    if (SAFE_FORM_FOILS.some((id) => !formChoices.includes(id))) {
      emit({
        code: "WAVE14_FORM",
        path: `exercises[id=${formScoreId}].choices`,
        message: "Form foils must be known letters only (م / ت).",
        severity: "error",
      });
    }
  }
  if (formScoreId && firstScoredU1 && u1Exercises.indexOf(formScoreId) < u1Exercises.indexOf(firstScoredU1)) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].exerciseIds`,
      message: "Scored عِ must occur before scored ـنـ.",
      severity: "error",
    });
  }
  if (showNun && formScoreId && u1Exercises.indexOf(showNun) > u1Exercises.indexOf(formScoreId)) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unscored medial ـنـ must occur before scored form.",
      severity: "error",
    });
  }
  if (u1Exercises.some((id) => exercises.get(id)?.["type"] === "audio_to_word")) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must not include a word target.",
      severity: "error",
    });
  }

  const u2Presentations = u2Exercises.filter((id) => exercises.get(id)?.["type"] === "presentation");
  if (u2Exercises.slice(0, u2Presentations.length).some((id) => exercises.get(id)?.["type"] !== "presentation")) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must place ALL presentations at the front.",
      severity: "error",
    });
  }
  const inaComposeId = u2Exercises.find((id) => {
    const config = asRecord(exercises.get(id)?.["config"]);
    return exercises.get(id)?.["type"] === "presentation" && config?.["result"] === "عِنَ";
  });
  const inabComposeId = u2Exercises.find((id) => {
    const config = asRecord(exercises.get(id)?.["config"]);
    return exercises.get(id)?.["type"] === "presentation" && config?.["result"] === "عِنَب";
  });
  const audioId = u2Exercises.find((id) => exercises.get(id)?.["type"] === "audio_to_word");
  const pictureId = u2Exercises.find((id) => exercises.get(id)?.["type"] === "word_to_picture");
  const inaComposeEx = inaComposeId ? exercises.get(inaComposeId) : undefined;
  const inabComposeEx = inabComposeId ? exercises.get(inabComposeId) : undefined;
  const audioEx = audioId ? exercises.get(audioId) : undefined;
  const pictureEx = pictureId ? exercises.get(pictureId) : undefined;
  const inaConfig = asRecord(inaComposeEx?.["config"]);
  const inabConfig = asRecord(inabComposeEx?.["config"]);
  if (
    inaComposeEx?.["type"] !== "presentation" ||
    inaConfig?.["show"] !== "chunk" ||
    inaConfig?.["left"] !== "عِ" ||
    inaConfig?.["right"] !== "نَ"
  ) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must include unscored عِ + نَ → عِنَ (show: chunk).",
      severity: "error",
    });
  }
  if (
    inabComposeEx?.["type"] !== "presentation" ||
    inabConfig?.["show"] !== "chunk" ||
    inabConfig?.["left"] !== "عِنَ" ||
    inabConfig?.["right"] !== "ب" ||
    inabConfig?.["result"] !== "عِنَب"
  ) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must include unscored عِنَ + isolated ب → عِنَب.",
      severity: "error",
    });
  }
  if (inabConfig?.["right"] === "ـب") {
    emit({
      code: "WAVE14_JOINING",
      path: `exercises[id=${inabComposeId}].config.right`,
      message: "Compose operand may be isolated ب; the joined result must shape final ـب.",
      severity: "error",
    });
  }
  if (audioEx?.["type"] !== "audio_to_word") {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FINAL_UNIT_ID}].exerciseIds`,
      message: "First scored عِنَب evidence must be audio_to_word.",
      severity: "error",
    });
  } else {
    const choiceIds = asStringArray(
      (Array.isArray(audioEx["choices"]) ? audioEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    const choiceLabels = asStringArray(
      (Array.isArray(audioEx["choices"]) ? audioEx["choices"] : []).map((choice) => asRecord(choice)?.["label"]),
    );
    if (asRecord(audioEx["success"])?.["correctChoiceId"] !== "word.inab" || !choiceIds.includes("word.inab")) {
      emit({
        code: "WAVE14_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "audio_to_word choices must include عِنَب.",
        severity: "error",
      });
    }
    if (!choiceLabels.includes("عِنَب")) {
      emit({
        code: "WAVE14_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "audio_to_word target label must be عِنَب.",
        severity: "error",
      });
    }
    const foils = choiceIds.filter((id) => id !== "word.inab");
    if (foils.some((id) => !(SAFE_FOIL_WORDS as readonly string[]).includes(id))) {
      emit({
        code: "WAVE14_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "عِنَب foils must already be decoded (عَسَل / كِتَاب, or نَار).",
        severity: "error",
      });
    }
  }
  if (pictureId && audioId && u2Exercises.indexOf(pictureId) < u2Exercises.indexOf(audioId)) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FINAL_UNIT_ID}].exerciseIds`,
      message: "Picture must not be first عِنَب evidence.",
      severity: "error",
    });
  }
  if (inabComposeId && audioId && u2Exercises.indexOf(inabComposeId) > u2Exercises.indexOf(audioId)) {
    emit({
      code: "WAVE14_FLOW",
      path: `units[id=${WAVE14_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unscored عِنَب compose must occur before audio_to_word.",
      severity: "error",
    });
  }
  if (pictureEx && !asStringArray(pictureEx["tags"]).includes("reinforcement")) {
    emit({
      code: "WAVE14_FLOW",
      path: `exercises[id=${pictureId}].tags`,
      message: "عِنَب picture must be reinforcement only.",
      severity: "error",
    });
  }

  for (const exercise of exercises.values()) {
    if (asStringArray(exercise["tags"]).includes("review")) {
      emit({
        code: "WAVE14_REVIEW",
        path: `exercises[id=${exercise["id"]}].tags`,
        message: "Wave 14 must not include a required review exercise.",
        severity: "error",
      });
    }
    if (exercise["type"] === "presentation" && (exercise["masteryTargets"] as unknown[] | undefined)?.length) {
      emit({
        code: "WAVE14_PRESENTATION",
        path: `exercises[id=${exercise["id"]}].`,
        message: "Wave 14 presentations must remain unscored (attempts 0).",
        severity: "error",
      });
    }
    if (exercise["type"] === "sound_to_letter") {
      emit({
        code: "WAVE14_LETTER",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 14 must not reteach a letter sound.",
        severity: "error",
      });
    }
    if (exercise["type"] === "missing_haraka") {
      emit({
        code: "WAVE14_MASTERY",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 14 must not use missing_haraka as kasra mastery.",
        severity: "error",
      });
    }
  }

  const u1Required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
  const u2Required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
  if (
    !u1Required.includes("skill.short_vowel.kasra") ||
    !u1Required.includes("skill.letter_forms.positional") ||
    u1Required.includes("skill.short_vowel.fatha") ||
    u1Required.includes("skill.word_decoding.simple")
  ) {
    emit({
      code: "WAVE14_MASTERY",
      path: `units[id=${WAVE14_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 1 must require skill.short_vowel.kasra and skill.letter_forms.positional only.",
      severity: "error",
    });
  }
  if (u2Required.join(",") !== "skill.word_decoding.simple") {
    emit({
      code: "WAVE14_MASTERY",
      path: `units[id=${WAVE14_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 2 must require skill.word_decoding.simple only.",
      severity: "error",
    });
  }

  for (const [unitId, unit] of [
    [WAVE14_FIRST_UNIT_ID, unit1],
    [WAVE14_FINAL_UNIT_ID, unit2],
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
          code: "WAVE14_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave14WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE14_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE14_BAND_A_REF",
        path: "words",
        message: `Wave 14 word "${id}" is not in production Band A.`,
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
          code: "WAVE14_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 14 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE14_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 14 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== source["legacyId"]) {
      emit({
        code: "WAVE14_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `Wave 14 "${id}" legacyId must match Band A.`,
        severity: "error",
      });
    }
    if (source["legacyId"] !== "fruits-4") {
      emit({
        code: "WAVE14_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: "word.inab must remain Band A fruits-4.",
        severity: "error",
      });
    }
  }
}
