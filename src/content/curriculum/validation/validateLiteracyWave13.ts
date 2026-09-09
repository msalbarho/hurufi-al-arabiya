/**
 * Deterministic Wave 13 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 13 production bundle.
 * Waves 1–12 stay frozen. Kasra is the only new phonics rule, on ك.
 * Madd-alif transfers onto تَا, then كِتَاب. Compact three-unit wave.
 * No new consonant, damma, madd-yaa, Wave 14.
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
import {
  WAVE12_FINAL_UNIT_ID,
  WAVE12_LETTER_IDS,
  WAVE12_WORD_IDS,
} from "./validateLiteracyWave12.ts";

export const LITERACY_WAVE13_META_ID = "hurufi.production.literacy.wave13";

export const WAVE13_LETTER_IDS = [] as const;

export const WAVE13_WORD_IDS = ["word.kitab"] as const;

export const WAVE13_BAND_A_WORD_IDS = ["word.kitab"] as const;

export const WAVE13_PATH_ID = "path.literacy.wave13";

export const WAVE13_UNIT_IDS = [
  "unit.literacy.wave13.kaf_kasra",
  "unit.literacy.wave13.ta_madd_alif",
  "unit.literacy.wave13.kitab",
] as const;

export const WAVE13_FIRST_UNIT_ID = "unit.literacy.wave13.kaf_kasra";
export const WAVE13_FINAL_UNIT_ID = "unit.literacy.wave13.kitab";

export const WAVE13_EXTERNAL_PREREQ_UNIT_IDS = [WAVE12_FINAL_UNIT_ID] as const;

const CARRIER_LETTER_IDS = ["letter.alif"] as const;

const FORBIDDEN_LETTERS = [
  "letter.ghain",
  "letter.haa",
  "letter.kha",
  "letter.tah",
  "letter.tha",
  "letter.nun",
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
  "word.inab",
  "word.jism",
  "word.bint",
  "word.masjid",
  "word.miftah",
  "word.barid",
  "word.laa",
  "word.naam",
  "word.shay",
] as const;

const SAFE_KASRA_FOILS = ["syllable.kaf.fatha", "syllable.mim.kasra"] as const;
const SAFE_TAA_FOILS = ["syllable.ta.fatha", "syllable.ba.madd_alif"] as const;
const SAFE_FOIL_WORDS = ["word.daftar", "word.kalb"] as const;

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
] as const;

const HAMZA_SEATS = /[أإآ]/u;
const SHADDA = /\u0651/u;
const DAMMA = /\u064F/u;
const TANWEEN = /[\u064B\u064C\u064D]/u;
const TAA_MARBUTA = /ة/u;
const ALIF_MAQSURA = /ى/u;
const DIPHTHONG = /[َُِ][وي]ْ/u;

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

export function isLiteracyWave13Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE13_META_ID;
}

export function validateLiteracyWave13Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE13_META",
        path: "meta.kind",
        message: "Literacy Wave 13 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE13_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 13 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-14") || blob.includes("wave14") || blob.includes("path.literacy.wave14")) {
    emit({
      code: "WAVE13_SCOPE",
      path: "$",
      message: "Wave 13 must not declare a Wave 14 path, route, or CTA.",
      severity: "error",
    });
  }
  for (const id of FORBIDDEN_WORDS) {
    if (blob.includes(id) || blob.includes(id.replace("word.", "word:"))) {
      emit({
        code: "WAVE13_SCOPE",
        path: "$",
        message: `Wave 13 must not include forbidden word ${id}.`,
        severity: "error",
      });
    }
  }
  if (
    blob.includes("الْكِتَاب") ||
    blob.includes("الكتاب") ||
    blob.includes("الكتابة") ||
    blob.includes("كِتَابَة")
  ) {
    emit({
      code: "WAVE13_TITLE",
      path: "$",
      message: "Wave 13 must not use child title الكتاب / الكتابة / definite كِتَاب.",
      severity: "error",
    });
  }
  if (blob.includes("missing_haraka") || blob.includes("diacritic:kaf.kasra")) {
    emit({
      code: "WAVE13_MASTERY",
      path: "$",
      message: "Wave 13 must not require mark-only kasra discrimination.",
      severity: "error",
    });
  }
  if (FORBIDDEN_LETTERS.some((id) => blob.includes(`"${id}"`))) {
    emit({
      code: "WAVE13_LETTER",
      path: "$",
      message: "Wave 13 must not teach a new consonant or recycle ن in this slice.",
      severity: "error",
    });
  }
  if (
    blob.includes("review-wave13") ||
    blob.includes("review.wave13") ||
    blob.includes("word:kitab.review") ||
    blob.includes("skill.articulation")
  ) {
    emit({
      code: "WAVE13_REVIEW",
      path: "$",
      message: "Wave 13 must not require a review key or a new articulation skill.",
      severity: "error",
    });
  }

  for (const text of childTitleStrings(data)) {
    if (HAMZA_SEATS.test(text) || SHADDA.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text)) {
      emit({
        code: "WAVE13_TITLE",
        path: "childTitle",
        message: `Wave 13 child titles must not contain hamza, shadda, ة, or ى: "${text}".`,
        severity: "error",
      });
    }
  }
  for (const text of childVisibleStrings(data)) {
    if (HAMZA_SEATS.test(text)) {
      emit({
        code: "WAVE13_HAMZA",
        path: "childVisible",
        message: `Wave 13 child-visible copy must not contain أ / إ / آ: "${text}".`,
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
        code: "WAVE13_PHONICS",
        path: "childVisible",
        message: `Wave 13 glyphs/titles must not contain damma, tanween, ة, ى, or a diphthong: "${text}".`,
        severity: "error",
      });
    }
  }

  const priorLetters = stringSet(PRIOR_LETTER_IDS);
  const allowedLetters = new Set<string>([...PRIOR_LETTER_IDS, ...WAVE13_LETTER_IDS, ...CARRIER_LETTER_IDS]);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  let foundAlif = false;
  let foundKaf = false;
  let foundTa = false;
  for (let i = 0; i < letters.length; i++) {
    const letter = asRecord(letters[i]);
    if (!letter) continue;
    const id = typeof letter["id"] === "string" ? letter["id"] : "";
    if (id && !allowedLetters.has(id)) {
      emit({
        code: "WAVE13_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 13 must not introduce untaught letter "${id}".`,
        severity: "error",
      });
    }
    if (id === "letter.kaf") {
      foundKaf = true;
      if (letter["nonConnecting"] === true) {
        emit({
          code: "WAVE13_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.kaf must remain dual-joining so كِتَاب begins with initial كـ.",
          severity: "error",
        });
      }
    }
    if (id === "letter.ta") {
      foundTa = true;
      if (letter["nonConnecting"] === true) {
        emit({
          code: "WAVE13_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.ta must remain dual-joining so ت in كِتَاب is medial ـتـ.",
          severity: "error",
        });
      }
    }
    if (id === "letter.ba" && letter["nonConnecting"] === true) {
      emit({
        code: "WAVE13_JOINING",
        path: `letters[${i}].nonConnecting`,
        message: "letter.ba must remain dual-joining; after alif it is isolated, not a new form lesson.",
        severity: "error",
      });
    }
    if (id === "letter.alif") {
      foundAlif = true;
      if (letter["nonConnecting"] !== true) {
        emit({
          code: "WAVE13_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.alif must remain nonConnecting so it breaks forward after تَا.",
          severity: "error",
        });
      }
      if (typeof letter["phoneme"] === "string" && letter["phoneme"].length > 0) {
        emit({
          code: "WAVE13_ALIF",
          path: `letters[${i}].phoneme`,
          message: "Wave 13 must not teach isolated alif as a letter-sound.",
          severity: "error",
        });
      }
    }
    const wave = expectedPriorWave(id);
    if (wave !== undefined && priorLetters.has(id)) {
      const tags = asStringArray(letter["tags"]);
      if (!tags.includes("recycled")) {
        emit({
          code: "WAVE13_LETTER",
          path: `letters[${i}].tags`,
          message: `Recycled letter "${id}" must be tagged recycled.`,
          severity: "error",
        });
      }
    }
  }
  if (!foundKaf) {
    emit({
      code: "WAVE13_LETTER",
      path: "letters",
      message: "Wave 13 must include recycled letter.kaf as the kasra carrier.",
      severity: "error",
    });
  }
  if (!foundTa) {
    emit({
      code: "WAVE13_LETTER",
      path: "letters",
      message: "Wave 13 must include recycled letter.ta for madd transfer.",
      severity: "error",
    });
  }
  if (!foundAlif) {
    emit({
      code: "WAVE13_ALIF",
      path: "letters",
      message: "Wave 13 must include letter.alif as a madd carrier.",
      severity: "error",
    });
  }

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE13_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  for (let i = 0; i < words.length; i++) {
    const word = asRecord(words[i]);
    if (!word) continue;
    const id = typeof word["id"] === "string" ? word["id"] : "";
    if (id && !allowedWords.has(id)) {
      emit({
        code: "WAVE13_WORD",
        path: `words[${i}].id`,
        message: `Wave 13 must not introduce untaught word "${id}".`,
        severity: "error",
      });
    }
    if ((WAVE13_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
    if (id === "word.kitab") {
      if (word["teachingForm"] !== "كِتَاب" || word["diacritized"] !== "كِتَاب") {
        emit({
          code: "WAVE13_WORD",
          path: `words[${i}].teachingForm`,
          message: "word.kitab teachingForm must be كِتَاب.",
          severity: "error",
        });
      }
      const form = typeof word["teachingForm"] === "string" ? word["teachingForm"] : "";
      if (DAMMA.test(form) || TAA_MARBUTA.test(form) || ALIF_MAQSURA.test(form) || SHADDA.test(form) || TANWEEN.test(form)) {
        emit({
          code: "WAVE13_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "كِتَاب must not contain damma, shadda, tanween, ة, or ى.",
          severity: "error",
        });
      }
      if (!form.includes("كِ") || !form.includes("تَا") || !form.endsWith("ب")) {
        emit({
          code: "WAVE13_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "كِتَاب must decompose as كِ + تَا + ب, not كِ + تَ + ا + ب.",
          severity: "error",
        });
      }
      const phonics = asStringArray(word["phonicsSkillIds"]);
      const required = asStringArray(word["requiredSkillIds"]);
      if (!phonics.includes("skill.short_vowel.kasra") || !required.includes("skill.short_vowel.kasra")) {
        emit({
          code: "WAVE13_PHONICS",
          path: `words[${i}]`,
          message: "word.kitab must require skill.short_vowel.kasra.",
          severity: "error",
        });
      }
      if (!phonics.includes("skill.long_vowel.madd") || !required.includes("skill.long_vowel.madd")) {
        emit({
          code: "WAVE13_PHONICS",
          path: `words[${i}]`,
          message: "word.kitab must require skill.long_vowel.madd (تَا).",
          severity: "error",
        });
      }
      if (phonics.includes("skill.sukun.basic") || required.includes("skill.sukun.basic")) {
        emit({
          code: "WAVE13_PHONICS",
          path: `words[${i}]`,
          message: "word.kitab must not require sukun.",
          severity: "error",
        });
      }
      for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
        if (
          phonics.some((skillId) => skillId.startsWith(prefix) || skillId === prefix) ||
          required.some((skillId) => skillId.startsWith(prefix) || skillId === prefix)
        ) {
          emit({
            code: "WAVE13_PHONICS",
            path: `words[${i}]`,
            message: `word.kitab must not require forbidden skill prefix ${prefix}.`,
            severity: "error",
          });
        }
      }
      if (word["legacyId"] !== "school-6") {
        emit({
          code: "WAVE13_WORD",
          path: `words[${i}].legacyId`,
          message: "word.kitab must remain Band A school-6.",
          severity: "error",
        });
      }
      if (word["vocabBand"] !== "A" || word["subBand"] !== "A1") {
        emit({
          code: "WAVE13_WORD",
          path: `words[${i}].subBand`,
          message: "word.kitab must remain Band A / A1.",
          severity: "error",
        });
      }
      const forms = letterFormsOnWord(word);
      const kafForms = forms.filter((row) => row.letterId === "letter.kaf").map((row) => row.form);
      const taForms = forms.filter((row) => row.letterId === "letter.ta").map((row) => row.form);
      const baForms = forms.filter((row) => row.letterId === "letter.ba").map((row) => row.form);
      if (!kafForms.includes("initial") || kafForms.includes("medial") || kafForms.includes("final")) {
        emit({
          code: "WAVE13_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "ك must be recorded as initial كـ, not medial or final.",
          severity: "error",
        });
      }
      if (!taForms.includes("medial") || taForms.includes("initial") || taForms.includes("final")) {
        emit({
          code: "WAVE13_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "ت in كِتَاب must be recorded as medial ـتـ.",
          severity: "error",
        });
      }
      if (baForms.includes("final")) {
        emit({
          code: "WAVE13_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "ب after alif must not be recorded as final ـب.",
          severity: "error",
        });
      }
      if (!baForms.includes("isolated")) {
        emit({
          code: "WAVE13_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "ب after ا must be recorded as isolated ب.",
          severity: "error",
        });
      }
    }
  }
  for (const id of WAVE13_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE13_WORD",
        path: "words",
        message: `Wave 13 must include ${id}.`,
        severity: "error",
      });
    }
  }
  if (foundNewWords.size !== WAVE13_WORD_IDS.length) {
    emit({
      code: "WAVE13_WORD",
      path: "words",
      message: "Wave 13 must add exactly word.kitab.",
      severity: "error",
    });
  }

  const skills = Array.isArray(rec["skills"]) ? rec["skills"] : [];
  let foundKasraSkill = false;
  let foundMaddSkill = false;
  for (let i = 0; i < skills.length; i++) {
    const skill = asRecord(skills[i]);
    const skillId = typeof skill?.["id"] === "string" ? skill["id"] : "";
    if (skillId === "skill.short_vowel.kasra") foundKasraSkill = true;
    if (skillId === "skill.long_vowel.madd") foundMaddSkill = true;
    for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
      if (skillId.startsWith(prefix) || skillId === prefix) {
        emit({
          code: "WAVE13_PHONICS",
          path: `skills[${i}].id`,
          message: `Wave 13 must not add forbidden skill "${skillId}".`,
          severity: "error",
        });
      }
    }
  }
  if (!foundKasraSkill) {
    emit({
      code: "WAVE13_PHONICS",
      path: "skills",
      message: "Wave 13 must include skill.short_vowel.kasra as the only new phonics rule.",
      severity: "error",
    });
  }
  if (!foundMaddSkill) {
    emit({
      code: "WAVE13_PHONICS",
      path: "skills",
      message: "Wave 13 must recycle skill.long_vowel.madd for تَا.",
      severity: "error",
    });
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  let foundKafKasra = false;
  let foundKafFatha = false;
  let foundTaMadd = false;
  for (let i = 0; i < syllables.length; i++) {
    const syllable = asRecord(syllables[i]);
    if (!syllable) continue;
    if (syllable["id"] === "syllable.kaf.kasra") {
      foundKafKasra = true;
      if (
        syllable["pattern"] !== "CV" ||
        syllable["text"] !== "كِ" ||
        syllable["vowelSkillId"] !== "skill.short_vowel.kasra" ||
        syllable["letterId"] !== "letter.kaf"
      ) {
        emit({
          code: "WAVE13_CV",
          path: `syllables[${i}]`,
          message: "syllable.kaf.kasra must be CV كِ with skill.short_vowel.kasra.",
          severity: "error",
        });
      }
    }
    if (syllable["id"] === "syllable.kaf.fatha") {
      foundKafFatha = true;
      if (syllable["pattern"] !== "CV" || syllable["text"] !== "كَ" || syllable["vowelSkillId"] !== "skill.short_vowel.fatha") {
        emit({
          code: "WAVE13_CV",
          path: `syllables[${i}]`,
          message: "syllable.kaf.fatha must be CV كَ with skill.short_vowel.fatha.",
          severity: "error",
        });
      }
    }
    if (syllable["id"] === "syllable.ta.madd_alif") {
      foundTaMadd = true;
      if (syllable["pattern"] !== "CVV") {
        emit({
          code: "WAVE13_CVV",
          path: `syllables[${i}].pattern`,
          message: "syllable.ta.madd_alif must use pattern CVV.",
          severity: "error",
        });
      }
      if (syllable["text"] !== "تَا") {
        emit({
          code: "WAVE13_CVV",
          path: `syllables[${i}].text`,
          message: "syllable.ta.madd_alif text must be تَا.",
          severity: "error",
        });
      }
      if (syllable["vowelSkillId"] !== "skill.long_vowel.madd") {
        emit({
          code: "WAVE13_CVV",
          path: `syllables[${i}].vowelSkillId`,
          message: "syllable.ta.madd_alif must use skill.long_vowel.madd.",
          severity: "error",
        });
      }
      if (syllable["letterId"] !== "letter.ta") {
        emit({
          code: "WAVE13_CVV",
          path: `syllables[${i}].letterId`,
          message: "syllable.ta.madd_alif must use letter.ta.",
          severity: "error",
        });
      }
      const requiredLetters = asStringArray(syllable["requiredLetterIds"]);
      if (!requiredLetters.includes("letter.ta") || !requiredLetters.includes("letter.alif")) {
        emit({
          code: "WAVE13_CVV",
          path: `syllables[${i}].requiredLetterIds`,
          message: "syllable.ta.madd_alif must require letter.ta and letter.alif.",
          severity: "error",
        });
      }
    }
    if (syllable["pattern"] === "CVC") {
      emit({
        code: "WAVE13_CHUNK",
        path: `syllables[${i}].pattern`,
        message: "Wave 13 must not add a new CVC syllable.",
        severity: "error",
      });
    }
  }
  if (!foundKafKasra) {
    emit({
      code: "WAVE13_CV",
      path: "syllables",
      message: "Wave 13 must include syllable.kaf.kasra.",
      severity: "error",
    });
  }
  if (!foundKafFatha) {
    emit({
      code: "WAVE13_CV",
      path: "syllables",
      message: "Wave 13 must include familiar syllable.kaf.fatha.",
      severity: "error",
    });
  }
  if (!foundTaMadd) {
    emit({
      code: "WAVE13_CVV",
      path: "syllables",
      message: "Wave 13 must include syllable.ta.madd_alif.",
      severity: "error",
    });
  }

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 3) {
    emit({
      code: "WAVE13_UNITS",
      path: "units",
      message: "Wave 13 must declare exactly three units.",
      severity: "error",
    });
  }

  const unit1 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE13_FIRST_UNIT_ID));
  const unit2 = asRecord(units.find((row) => asRecord(row)?.["id"] === "unit.literacy.wave13.ta_madd_alif"));
  const unit3 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE13_FINAL_UNIT_ID));
  if (!unit1 || !unit2 || !unit3) {
    emit({
      code: "WAVE13_UNITS",
      path: "units",
      message: "Wave 13 must include kaf_kasra, ta_madd_alif, and kitab units.",
      severity: "error",
    });
    return;
  }

  if (unit1["titleAr"] !== "كِ" || unit2["titleAr"] !== "تَا" || unit3["titleAr"] !== "كِتَاب") {
    emit({
      code: "WAVE13_TITLE",
      path: "units",
      message: "Wave 13 child titles must be كِ, تَا, كِتَاب.",
      severity: "error",
    });
  }

  if (asStringArray(unit1["prereqUnitIds"])[0] !== WAVE12_FINAL_UNIT_ID) {
    emit({
      code: "WAVE13_PREREQ",
      path: `units[id=${WAVE13_FIRST_UNIT_ID}].prereqUnitIds`,
      message: "Wave 13 Unit 1 prerequisite must be unit.literacy.wave12.nar.",
      severity: "error",
    });
  }
  if (asStringArray(unit2["prereqUnitIds"])[0] !== WAVE13_FIRST_UNIT_ID) {
    emit({
      code: "WAVE13_PREREQ",
      path: "units[id=unit.literacy.wave13.ta_madd_alif].prereqUnitIds",
      message: "Unit 2 must unlock after Unit 1.",
      severity: "error",
    });
  }
  if (asStringArray(unit3["prereqUnitIds"])[0] !== "unit.literacy.wave13.ta_madd_alif") {
    emit({
      code: "WAVE13_PREREQ",
      path: `units[id=${WAVE13_FINAL_UNIT_ID}].prereqUnitIds`,
      message: "Unit 3 must unlock after تَا transfer, not directly after kasra.",
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = asRecord(paths.find((row) => asRecord(row)?.["id"] === WAVE13_PATH_ID));
  if (!path) {
    emit({
      code: "WAVE13_PATH",
      path: "paths",
      message: "Wave 13 must include path.literacy.wave13.",
      severity: "error",
    });
  } else if (asStringArray(path["unitIds"]).join(",") !== WAVE13_UNIT_IDS.join(",")) {
    emit({
      code: "WAVE13_PATH",
      path: "paths[id=path.literacy.wave13].unitIds",
      message: "Wave 13 path must list exactly the three Wave 13 units in order.",
      severity: "error",
    });
  }

  const u1Exercises = asStringArray(unit1["exerciseIds"]);
  const u2Exercises = asStringArray(unit2["exerciseIds"]);
  const u3Exercises = asStringArray(unit3["exerciseIds"]);
  if (asStringArray(unit1["wordIds"]).length > 0 || asStringArray(unit2["wordIds"]).length > 0) {
    emit({
      code: "WAVE13_FLOW",
      path: "units",
      message: "Units 1–2 must have no word target.",
      severity: "error",
    });
  }

  const u1Presentations = u1Exercises.filter((id) => exercises.get(id)?.["type"] === "presentation");
  const firstScoredU1 = u1Exercises.find((id) => exercises.get(id)?.["type"] !== "presentation");
  if (u1Presentations.length < 2 || u1Exercises.slice(0, u1Presentations.length).some((id) => exercises.get(id)?.["type"] !== "presentation")) {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must place ALL presentations at the front.",
      severity: "error",
    });
  }
  const showFatha = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["syllableId"] === "syllable.kaf.fatha");
  const showKasra = u1Presentations.find((id) => asRecord(exercises.get(id)?.["config"])?.["syllableId"] === "syllable.kaf.kasra");
  const showFathaEx = showFatha ? exercises.get(showFatha) : undefined;
  const showKasraEx = showKasra ? exercises.get(showKasra) : undefined;
  if (showFathaEx?.["type"] !== "presentation" || asRecord(showFathaEx["config"])?.["show"] !== "cv") {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must start with familiar كَ SHOW (show: cv).",
      severity: "error",
    });
  }
  if (showKasraEx?.["type"] !== "presentation" || asRecord(showKasraEx["config"])?.["show"] !== "cv") {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must SHOW ك + ِ → كِ before scoring.",
      severity: "error",
    });
  }
  if (showFatha && showKasra && u1Exercises.indexOf(showFatha) > u1Exercises.indexOf(showKasra)) {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FIRST_UNIT_ID}].exerciseIds`,
      message: "Familiar كَ SHOW must occur before كِ SHOW.",
      severity: "error",
    });
  }
  if (firstScoredU1 && showKasra && u1Exercises.indexOf(showKasra) > u1Exercises.indexOf(firstScoredU1)) {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unscored كِ must occur before scored kasra.",
      severity: "error",
    });
  }

  const kasraScoreEx = firstScoredU1 ? exercises.get(firstScoredU1) : undefined;
  if (kasraScoreEx?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FIRST_UNIT_ID}].exerciseIds`,
      message: "First scored Unit 1 evidence must be syllable_blending for كِ.",
      severity: "error",
    });
  } else {
    const choices = asStringArray(
      (Array.isArray(kasraScoreEx["choices"]) ? kasraScoreEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    if (
      asRecord(kasraScoreEx["success"])?.["correctChoiceId"] !== "syllable.kaf.kasra" ||
      !choices.includes("syllable.kaf.kasra") ||
      SAFE_KASRA_FOILS.some((id) => !choices.includes(id))
    ) {
      emit({
        code: "WAVE13_FLOW",
        path: `exercises[id=${firstScoredU1}].choices`,
        message: "Scored kasra activity must target كِ with foils كَ and مِ.",
        severity: "error",
      });
    }
    const targetSkills = skillIdsOnTargets(kasraScoreEx);
    if (targetSkills.includes("skill.short_vowel.fatha") || targetSkills.some((id) => id.includes("discrimination"))) {
      emit({
        code: "WAVE13_LIVE_KEY",
        path: `exercises[id=${firstScoredU1}].masteryTargets`,
        message: "Unit 1 must not gate letter:kaf.fatha or mark-discrimination.",
        severity: "error",
      });
    }
  }

  if (u1Exercises.some((id) => asStringArray(exercises.get(id)?.["contentIds"]).some((cid) => cid.includes("madd")))) {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must not include a madd quiz.",
      severity: "error",
    });
  }
  if (u1Exercises.some((id) => exercises.get(id)?.["type"] === "audio_to_word" || exercises.get(id)?.["type"] === "letter_recognition")) {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must not include a word target or a form quiz.",
      severity: "error",
    });
  }

  const u2Presentations = u2Exercises.filter((id) => exercises.get(id)?.["type"] === "presentation");
  if (u2Exercises.slice(0, u2Presentations.length).some((id) => exercises.get(id)?.["type"] !== "presentation")) {
    emit({
      code: "WAVE13_FLOW",
      path: "units[id=unit.literacy.wave13.ta_madd_alif].exerciseIds",
      message: "Unit 2 must place ALL presentations at the front.",
      severity: "error",
    });
  }
  const maddShowId = u2Exercises.find((id) => {
    const config = asRecord(exercises.get(id)?.["config"]);
    return exercises.get(id)?.["type"] === "presentation" && config?.["result"] === "تَا";
  });
  const maddScoreId = u2Exercises.find((id) => exercises.get(id)?.["type"] === "syllable_blending");
  const maddShowEx = maddShowId ? exercises.get(maddShowId) : undefined;
  const maddScoreEx = maddScoreId ? exercises.get(maddScoreId) : undefined;
  const maddConfig = asRecord(maddShowEx?.["config"]);
  if (
    maddShowEx?.["type"] !== "presentation" ||
    maddConfig?.["show"] !== "chunk" ||
    maddConfig?.["left"] !== "تَ" ||
    maddConfig?.["right"] !== "ا" ||
    maddConfig?.["result"] !== "تَا"
  ) {
    emit({
      code: "WAVE13_FLOW",
      path: "units[id=unit.literacy.wave13.ta_madd_alif].exerciseIds",
      message: "Unit 2 must SHOW تَ + ا → تَا with plain ا (show: chunk) before scoring.",
      severity: "error",
    });
  }
  if (maddScoreEx?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE13_FLOW",
      path: "units[id=unit.literacy.wave13.ta_madd_alif].exerciseIds",
      message: "Unit 2 scored madd evidence must be syllable_blending.",
      severity: "error",
    });
  } else {
    const choices = asStringArray(
      (Array.isArray(maddScoreEx["choices"]) ? maddScoreEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    if (
      asRecord(maddScoreEx["success"])?.["correctChoiceId"] !== "syllable.ta.madd_alif" ||
      !choices.includes("syllable.ta.madd_alif") ||
      SAFE_TAA_FOILS.some((id) => !choices.includes(id))
    ) {
      emit({
        code: "WAVE13_FLOW",
        path: `exercises[id=${maddScoreId}].choices`,
        message: "Scored madd activity must target تَا with foils تَ and بَا.",
        severity: "error",
      });
    }
    const targets = Array.isArray(maddScoreEx["masteryTargets"]) ? maddScoreEx["masteryTargets"] : [];
    if (
      targets.some(
        (row) =>
          asRecord(row)?.["syllableId"] === "syllable.ba.madd_alif" ||
          asRecord(row)?.["syllableId"] === "syllable.jim.madd_alif" ||
          asRecord(row)?.["syllableId"] === "syllable.nun.madd_alif" ||
          asRecord(row)?.["syllableId"] === "syllable.ta.fatha",
      )
    ) {
      emit({
        code: "WAVE13_LIVE_KEY",
        path: `exercises[id=${maddScoreId}].masteryTargets`,
        message: "Historical ta fatha and ba/jim/nun madd must not be Wave 13 Unit 2 mastery targets.",
        severity: "error",
      });
    }
  }
  if (maddShowId && maddScoreId && u2Exercises.indexOf(maddShowId) > u2Exercises.indexOf(maddScoreId)) {
    emit({
      code: "WAVE13_FLOW",
      path: "units[id=unit.literacy.wave13.ta_madd_alif].exerciseIds",
      message: "Unscored تَ + ا → تَا must occur before scored تَا.",
      severity: "error",
    });
  }
  if (u2Exercises.some((id) => exercises.get(id)?.["type"] === "letter_recognition" || exercises.get(id)?.["type"] === "audio_to_word")) {
    emit({
      code: "WAVE13_FORM",
      path: "units[id=unit.literacy.wave13.ta_madd_alif].exerciseIds",
      message: "Unit 2 must not add a new ta form quiz or decode كِتَاب.",
      severity: "error",
    });
  }

  const u3Presentations = u3Exercises.filter((id) => exercises.get(id)?.["type"] === "presentation");
  if (u3Exercises.slice(0, u3Presentations.length).some((id) => exercises.get(id)?.["type"] !== "presentation")) {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 3 must place ALL presentations at the front.",
      severity: "error",
    });
  }
  const kitaComposeId = u3Exercises.find((id) => asRecord(exercises.get(id)?.["config"])?.["result"] === "كِتَا");
  const kitabComposeId = u3Exercises.find((id) => asRecord(exercises.get(id)?.["config"])?.["result"] === "كِتَاب");
  const audioId = u3Exercises.find((id) => exercises.get(id)?.["type"] === "audio_to_word");
  const pictureId = u3Exercises.find((id) => exercises.get(id)?.["type"] === "word_to_picture");
  const kitaComposeEx = kitaComposeId ? exercises.get(kitaComposeId) : undefined;
  const kitabComposeEx = kitabComposeId ? exercises.get(kitabComposeId) : undefined;
  const audioEx = audioId ? exercises.get(audioId) : undefined;
  const pictureEx = pictureId ? exercises.get(pictureId) : undefined;
  const kitaConfig = asRecord(kitaComposeEx?.["config"]);
  const kitabConfig = asRecord(kitabComposeEx?.["config"]);
  if (
    kitaComposeEx?.["type"] !== "presentation" ||
    kitaConfig?.["show"] !== "chunk" ||
    kitaConfig?.["left"] !== "كِ" ||
    kitaConfig?.["right"] !== "تَا"
  ) {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 3 must include unscored كِ + تَا → كِتَا (show: chunk).",
      severity: "error",
    });
  }
  if (
    kitabComposeEx?.["type"] !== "presentation" ||
    kitabConfig?.["show"] !== "chunk" ||
    kitabConfig?.["left"] !== "كِتَا" ||
    kitabConfig?.["right"] !== "ب" ||
    kitabConfig?.["result"] !== "كِتَاب"
  ) {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 3 must include unscored كِتَا + isolated ب → كِتَاب.",
      severity: "error",
    });
  }
  if (kitabConfig?.["right"] === "ـب") {
    emit({
      code: "WAVE13_JOINING",
      path: `exercises[id=${kitabComposeId}].config.right`,
      message: "Compose must use isolated ب after alif, not final ـب.",
      severity: "error",
    });
  }
  if (audioEx?.["type"] !== "audio_to_word") {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FINAL_UNIT_ID}].exerciseIds`,
      message: "First scored كِتَاب evidence must be audio_to_word.",
      severity: "error",
    });
  } else {
    const choiceIds = asStringArray(
      (Array.isArray(audioEx["choices"]) ? audioEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    if (asRecord(audioEx["success"])?.["correctChoiceId"] !== "word.kitab" || !choiceIds.includes("word.kitab")) {
      emit({
        code: "WAVE13_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "audio_to_word choices must include كِتَاب.",
        severity: "error",
      });
    }
    const foils = choiceIds.filter((id) => id !== "word.kitab");
    if (foils.some((id) => !(SAFE_FOIL_WORDS as readonly string[]).includes(id))) {
      emit({
        code: "WAVE13_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "كِتَاب foils must already be decoded (دَفْتَر / كَلْب).",
        severity: "error",
      });
    }
  }
  if (pictureId && audioId && u3Exercises.indexOf(pictureId) < u3Exercises.indexOf(audioId)) {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FINAL_UNIT_ID}].exerciseIds`,
      message: "Picture must not be first كِتَاب evidence.",
      severity: "error",
    });
  }
  if (kitabComposeId && audioId && u3Exercises.indexOf(kitabComposeId) > u3Exercises.indexOf(audioId)) {
    emit({
      code: "WAVE13_FLOW",
      path: `units[id=${WAVE13_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unscored كِتَاب compose must occur before audio_to_word.",
      severity: "error",
    });
  }
  if (pictureEx && !asStringArray(pictureEx["tags"]).includes("reinforcement")) {
    emit({
      code: "WAVE13_FLOW",
      path: `exercises[id=${pictureId}].tags`,
      message: "كِتَاب picture must be reinforcement only.",
      severity: "error",
    });
  }

  for (const exercise of exercises.values()) {
    if (asStringArray(exercise["tags"]).includes("review")) {
      emit({
        code: "WAVE13_REVIEW",
        path: `exercises[id=${exercise["id"]}].tags`,
        message: "Wave 13 must not include a required review exercise.",
        severity: "error",
      });
    }
    if (exercise["type"] === "presentation" && (exercise["masteryTargets"] as unknown[] | undefined)?.length) {
      emit({
        code: "WAVE13_PRESENTATION",
        path: `exercises[id=${exercise["id"]}].`,
        message: "Wave 13 presentations must remain unscored (attempts 0).",
        severity: "error",
      });
    }
    if (exercise["type"] === "letter_recognition") {
      emit({
        code: "WAVE13_FORM",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 13 must not add a new form quiz.",
        severity: "error",
      });
    }
    if (exercise["type"] === "sound_to_letter" && asStringArray(exercise["contentIds"]).includes("letter.alif")) {
      emit({
        code: "WAVE13_ALIF",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 13 must not score letter:alif.sound.",
        severity: "error",
      });
    }
    if (exercise["type"] === "missing_haraka") {
      emit({
        code: "WAVE13_MASTERY",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 13 must not use missing_haraka as kasra mastery.",
        severity: "error",
      });
    }
  }

  const u1Required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
  const u2Required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
  const u3Required = asStringArray(asRecord(unit3["mastery"])?.["requiredSkillIds"]);
  if (
    u1Required.join(",") !== "skill.short_vowel.kasra" ||
    u1Required.includes("skill.short_vowel.fatha") ||
    u1Required.includes("skill.letter_forms.positional")
  ) {
    emit({
      code: "WAVE13_MASTERY",
      path: `units[id=${WAVE13_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 1 must require skill.short_vowel.kasra only.",
      severity: "error",
    });
  }
  if (u2Required.join(",") !== "skill.long_vowel.madd" || u2Required.includes("skill.short_vowel.fatha")) {
    emit({
      code: "WAVE13_MASTERY",
      path: "units[id=unit.literacy.wave13.ta_madd_alif].mastery.requiredSkillIds",
      message: "Unit 2 must require skill.long_vowel.madd only.",
      severity: "error",
    });
  }
  if (u3Required.join(",") !== "skill.word_decoding.simple") {
    emit({
      code: "WAVE13_MASTERY",
      path: `units[id=${WAVE13_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 3 must require skill.word_decoding.simple only.",
      severity: "error",
    });
  }

  for (const [unitId, unit] of [
    [WAVE13_FIRST_UNIT_ID, unit1],
    ["unit.literacy.wave13.ta_madd_alif", unit2],
    [WAVE13_FINAL_UNIT_ID, unit3],
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
          code: "WAVE13_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave13WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE13_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE13_BAND_A_REF",
        path: "words",
        message: `Wave 13 word "${id}" is not in production Band A.`,
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
          code: "WAVE13_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 13 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE13_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 13 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== source["legacyId"]) {
      emit({
        code: "WAVE13_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `Wave 13 "${id}" legacyId must match Band A.`,
        severity: "error",
      });
    }
    if (source["legacyId"] !== "school-6") {
      emit({
        code: "WAVE13_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: "word.kitab must remain Band A school-6.",
        severity: "error",
      });
    }
  }
}
