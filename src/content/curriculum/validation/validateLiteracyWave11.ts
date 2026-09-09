/**
 * Deterministic Wave 11 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 11 production bundle.
 * Waves 1–10 stay frozen. Madd-alif TRANSFER onto جَا, then دَجَاج.
 * No new phonics rule. No لَا. Compact two-unit wave.
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
import {
  WAVE10_FINAL_UNIT_ID,
  WAVE10_LETTER_IDS,
  WAVE10_WORD_IDS,
} from "./validateLiteracyWave10.ts";

export const LITERACY_WAVE11_META_ID = "hurufi.production.literacy.wave11";

/** No new consonant. ا remains a madd carrier, not a taught letter-sound. */
export const WAVE11_LETTER_IDS = [] as const;

export const WAVE11_WORD_IDS = ["word.dajaj"] as const;

export const WAVE11_BAND_A_WORD_IDS = ["word.dajaj"] as const;

export const WAVE11_PATH_ID = "path.literacy.wave11";

export const WAVE11_UNIT_IDS = [
  "unit.literacy.wave11.jim_madd_alif",
  "unit.literacy.wave11.dajaj",
] as const;

export const WAVE11_FIRST_UNIT_ID = "unit.literacy.wave11.jim_madd_alif";
export const WAVE11_FINAL_UNIT_ID = "unit.literacy.wave11.dajaj";

export const WAVE11_EXTERNAL_PREREQ_UNIT_IDS = [WAVE10_FINAL_UNIT_ID] as const;

const CARRIER_LETTER_IDS = ["letter.alif"] as const;

const FORBIDDEN_LETTERS = [
  "letter.ghain",
  "letter.nun",
  "letter.haa",
  "letter.kha",
  "letter.tah",
] as const;

const FORBIDDEN_SKILL_PREFIXES = [
  "skill.shadda.",
  "skill.tanween.",
  "skill.hamza.",
  "skill.taa_marbuta.",
  "skill.alif_maqsura.",
  "skill.articulation.",
  "skill.short_vowel.kasra",
  "skill.short_vowel.damma",
] as const;

const SAFE_FOIL_WORDS = ["word.bab", "word.jamal"] as const;
const SAFE_FORM_FOILS = ["letter.ha", "letter.ba"] as const;

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
] as const;

const HAMZA_SEATS = /[أإآ]/u;
const SHADDA = /\u0651/u;
const KASRA_DAMMA = /[\u064F\u0650]/u;
const TAA_MARBUTA = /ة/u;
const ALIF_MAQSURA = /ى/u;

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

export function isLiteracyWave11Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE11_META_ID;
}

export function validateLiteracyWave11Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE11_META",
        path: "meta.kind",
        message: "Literacy Wave 11 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE11_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 11 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-12") || blob.includes("wave12") || blob.includes("path.literacy.wave12")) {
    emit({
      code: "WAVE11_SCOPE",
      path: "$",
      message: "Wave 11 must not declare a Wave 12 path, route, or CTA.",
      severity: "error",
    });
  }
  if (blob.includes("word.laa") || blob.includes("word:laa")) {
    emit({
      code: "WAVE11_SCOPE",
      path: "$",
      message: "Wave 11 must not include word.laa / لَا.",
      severity: "error",
    });
  }
  if (blob.includes("word.dajaja") || blob.includes("دَجَاجَة")) {
    emit({
      code: "WAVE11_SCOPE",
      path: "$",
      message: "Wave 11 must not include دَجَاجَة.",
      severity: "error",
    });
  }
  if (blob.includes("الدَّجَاج") || blob.includes("الْدَّجَاج")) {
    emit({
      code: "WAVE11_TITLE",
      path: "$",
      message: "Wave 11 must not use child title الدَّجَاج (definite article + sun-letter shadda).",
      severity: "error",
    });
  }
  if (blob.includes("word.arnab") || blob.includes("أَرْنَب")) {
    emit({
      code: "WAVE11_HAMZA",
      path: "$",
      message: "Wave 11 must not use أَرْنَب or word.arnab.",
      severity: "error",
    });
  }
  if (FORBIDDEN_LETTERS.some((id) => blob.includes(id))) {
    emit({
      code: "WAVE11_LETTER",
      path: "$",
      message: "Wave 11 must not teach غ, ن, ه, خ, or ط.",
      severity: "error",
    });
  }
  if (
    blob.includes("review-wave11") ||
    blob.includes("review.wave11") ||
    blob.includes("word:dajaj.review") ||
    blob.includes("skill.articulation")
  ) {
    emit({
      code: "WAVE11_REVIEW",
      path: "$",
      message: "Wave 11 must not require a review key or a new articulation skill.",
      severity: "error",
    });
  }

  for (const text of childTitleStrings(data)) {
    if (HAMZA_SEATS.test(text) || SHADDA.test(text)) {
      emit({
        code: "WAVE11_TITLE",
        path: "childTitle",
        message: `Wave 11 child titles must not contain hamza-on-alif or shadda: "${text}".`,
        severity: "error",
      });
    }
  }
  for (const text of childVisibleStrings(data)) {
    if (HAMZA_SEATS.test(text)) {
      emit({
        code: "WAVE11_HAMZA",
        path: "childVisible",
        message: `Wave 11 child-visible copy must not contain أ / إ / آ: "${text}".`,
        severity: "error",
      });
    }
  }

  const priorLetters = stringSet(PRIOR_LETTER_IDS);
  const allowedLetters = new Set<string>([...PRIOR_LETTER_IDS, ...CARRIER_LETTER_IDS]);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  let foundAlif = false;
  for (let i = 0; i < letters.length; i++) {
    const letter = asRecord(letters[i]);
    if (!letter) continue;
    const id = typeof letter["id"] === "string" ? letter["id"] : "";
    if (id && !allowedLetters.has(id)) {
      emit({
        code: "WAVE11_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 11 must not introduce a new consonant "${id}".`,
        severity: "error",
      });
    }
    if (id === "letter.alif") {
      foundAlif = true;
      if (letter["nonConnecting"] !== true) {
        emit({
          code: "WAVE11_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.alif must remain nonConnecting.",
          severity: "error",
        });
      }
      if (typeof letter["phoneme"] === "string" && letter["phoneme"].length > 0) {
        emit({
          code: "WAVE11_ALIF",
          path: `letters[${i}].phoneme`,
          message: "Wave 11 must not teach isolated alif as a letter-sound.",
          severity: "error",
        });
      }
    }
    if (id === "letter.dal" && letter["nonConnecting"] !== true) {
      emit({
        code: "WAVE11_JOINING",
        path: `letters[${i}].nonConnecting`,
        message: "letter.dal must remain nonConnecting so the first ج is initial, not medial.",
        severity: "error",
      });
    }
    if (id === "letter.jim" && letter["nonConnecting"] === true) {
      emit({
        code: "WAVE11_JOINING",
        path: `letters[${i}].nonConnecting`,
        message: "letter.jim must remain dual-joining.",
        severity: "error",
      });
    }
    const wave = expectedPriorWave(id);
    if (wave !== undefined && priorLetters.has(id)) {
      const tags = asStringArray(letter["tags"]);
      if (!tags.includes("recycled")) {
        emit({
          code: "WAVE11_LETTER",
          path: `letters[${i}].tags`,
          message: `Recycled letter "${id}" must be tagged recycled.`,
          severity: "error",
        });
      }
    }
  }
  if (!foundAlif) {
    emit({
      code: "WAVE11_ALIF",
      path: "letters",
      message: "Wave 11 must include letter.alif as a madd carrier.",
      severity: "error",
    });
  }

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE11_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  for (let i = 0; i < words.length; i++) {
    const word = asRecord(words[i]);
    if (!word) continue;
    const id = typeof word["id"] === "string" ? word["id"] : "";
    if (id && !allowedWords.has(id)) {
      emit({
        code: "WAVE11_WORD",
        path: `words[${i}].id`,
        message: `Wave 11 must not introduce untaught word "${id}".`,
        severity: "error",
      });
    }
    if ((WAVE11_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
    if (id === "word.dajaj") {
      if (word["teachingForm"] !== "دَجَاج" || word["diacritized"] !== "دَجَاج") {
        emit({
          code: "WAVE11_WORD",
          path: `words[${i}].teachingForm`,
          message: "word.dajaj teachingForm must be دَجَاج.",
          severity: "error",
        });
      }
      const form = typeof word["teachingForm"] === "string" ? word["teachingForm"] : "";
      if (KASRA_DAMMA.test(form) || TAA_MARBUTA.test(form) || ALIF_MAQSURA.test(form) || SHADDA.test(form)) {
        emit({
          code: "WAVE11_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "دَجَاج must not contain kasra, damma, shadda, ة, or ى.",
          severity: "error",
        });
      }
      const phonics = asStringArray(word["phonicsSkillIds"]);
      const required = asStringArray(word["requiredSkillIds"]);
      if (!phonics.includes("skill.long_vowel.madd") || !required.includes("skill.long_vowel.madd")) {
        emit({
          code: "WAVE11_PHONICS",
          path: `words[${i}]`,
          message: "word.dajaj must require skill.long_vowel.madd.",
          severity: "error",
        });
      }
      if (phonics.includes("skill.sukun.basic") || required.includes("skill.sukun.basic")) {
        emit({
          code: "WAVE11_SUKUN",
          path: `words[${i}]`,
          message: "word.dajaj must not require sukun.",
          severity: "error",
        });
      }
      for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
        if (phonics.some((skillId) => skillId.startsWith(prefix) || skillId === prefix) ||
          required.some((skillId) => skillId.startsWith(prefix) || skillId === prefix)) {
          emit({
            code: "WAVE11_PHONICS",
            path: `words[${i}]`,
            message: `word.dajaj must not require forbidden skill prefix ${prefix}.`,
            severity: "error",
          });
        }
      }
      if (word["legacyId"] !== "food-8") {
        emit({
          code: "WAVE11_WORD",
          path: `words[${i}].legacyId`,
          message: "word.dajaj must remain Band A food-8.",
          severity: "error",
        });
      }
      const forms = letterFormsOnWord(word);
      const jimForms = forms.filter((row) => row.letterId === "letter.jim").map((row) => row.form);
      const dalForms = forms.filter((row) => row.letterId === "letter.dal").map((row) => row.form);
      if (!jimForms.includes("initial")) {
        emit({
          code: "WAVE11_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "First ج after non-connecting د must be recorded as initial, not inferred from string index.",
          severity: "error",
        });
      }
      if (jimForms.includes("medial")) {
        emit({
          code: "WAVE11_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "Wave 11 must not treat the first ج in دَجَاج as medial.",
          severity: "error",
        });
      }
      if (jimForms.includes("final")) {
        emit({
          code: "WAVE11_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "Last ج after madd-alif must not be recorded as final ـج.",
          severity: "error",
        });
      }
      if (!jimForms.includes("isolated")) {
        emit({
          code: "WAVE11_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "Last ج after ا must be recorded as isolated ج.",
          severity: "error",
        });
      }
      if (!dalForms.includes("isolated")) {
        emit({
          code: "WAVE11_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "Word-initial د must be recorded as isolated.",
          severity: "error",
        });
      }
    }
  }
  for (const id of WAVE11_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE11_WORD",
        path: "words",
        message: `Wave 11 must include ${id}.`,
        severity: "error",
      });
    }
  }
  if (foundNewWords.size !== WAVE11_WORD_IDS.length) {
    emit({
      code: "WAVE11_WORD",
      path: "words",
      message: "Wave 11 must add exactly word.dajaj.",
      severity: "error",
    });
  }

  const skills = Array.isArray(rec["skills"]) ? rec["skills"] : [];
  let foundMaddSkill = false;
  for (let i = 0; i < skills.length; i++) {
    const skill = asRecord(skills[i]);
    const skillId = typeof skill?.["id"] === "string" ? skill["id"] : "";
    if (skillId === "skill.long_vowel.madd") foundMaddSkill = true;
    for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
      if (skillId.startsWith(prefix) || skillId === prefix) {
        emit({
          code: "WAVE11_PHONICS",
          path: `skills[${i}].id`,
          message: `Wave 11 must not add forbidden skill "${skillId}".`,
          severity: "error",
        });
      }
    }
    if (skillId === "skill.syllable_blending.cvc" || skillId === "skill.sukun.basic") {
      emit({
        code: "WAVE11_CHUNK",
        path: `skills[${i}].id`,
        message: "Wave 11 must not add a new closed-chunk or sukun skill.",
        severity: "error",
      });
    }
  }
  if (!foundMaddSkill) {
    emit({
      code: "WAVE11_PHONICS",
      path: "skills",
      message: "Wave 11 must include skill.long_vowel.madd.",
      severity: "error",
    });
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  let foundJimMadd = false;
  for (let i = 0; i < syllables.length; i++) {
    const syllable = asRecord(syllables[i]);
    if (!syllable) continue;
    if (syllable["id"] === "syllable.jim.madd_alif") {
      foundJimMadd = true;
      if (syllable["pattern"] !== "CVV") {
        emit({
          code: "WAVE11_CVV",
          path: `syllables[${i}].pattern`,
          message: "syllable.jim.madd_alif must use pattern CVV.",
          severity: "error",
        });
      }
      if (syllable["text"] !== "جَا") {
        emit({
          code: "WAVE11_CVV",
          path: `syllables[${i}].text`,
          message: "syllable.jim.madd_alif text must be جَا.",
          severity: "error",
        });
      }
      if (syllable["vowelSkillId"] !== "skill.long_vowel.madd") {
        emit({
          code: "WAVE11_CVV",
          path: `syllables[${i}].vowelSkillId`,
          message: "syllable.jim.madd_alif must use skill.long_vowel.madd.",
          severity: "error",
        });
      }
      if (syllable["letterId"] !== "letter.jim") {
        emit({
          code: "WAVE11_CVV",
          path: `syllables[${i}].letterId`,
          message: "syllable.jim.madd_alif must use letter.jim.",
          severity: "error",
        });
      }
      const requiredLetters = asStringArray(syllable["requiredLetterIds"]);
      if (!requiredLetters.includes("letter.jim") || !requiredLetters.includes("letter.alif")) {
        emit({
          code: "WAVE11_CVV",
          path: `syllables[${i}].requiredLetterIds`,
          message: "syllable.jim.madd_alif must require letter.jim and letter.alif.",
          severity: "error",
        });
      }
    }
    if (syllable["pattern"] === "CVC") {
      emit({
        code: "WAVE11_CHUNK",
        path: `syllables[${i}].pattern`,
        message: "Wave 11 must not add a new CVC syllable.",
        severity: "error",
      });
    }
    if (syllable["vowelSkillId"] === "skill.sukun.basic") {
      emit({
        code: "WAVE11_SUKUN",
        path: `syllables[${i}].vowelSkillId`,
        message: "Wave 11 must not add a new sukun syllable.",
        severity: "error",
      });
    }
  }
  if (!foundJimMadd) {
    emit({
      code: "WAVE11_CVV",
      path: "syllables",
      message: "Wave 11 must include syllable.jim.madd_alif.",
      severity: "error",
    });
  }

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 2) {
    emit({
      code: "WAVE11_UNITS",
      path: "units",
      message: "Wave 11 must declare exactly two units.",
      severity: "error",
    });
  }

  const unit1 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE11_FIRST_UNIT_ID));
  const unit2 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE11_FINAL_UNIT_ID));
  if (!unit1 || !unit2) {
    emit({
      code: "WAVE11_UNITS",
      path: "units",
      message: "Wave 11 must include unit.literacy.wave11.jim_madd_alif and unit.literacy.wave11.dajaj.",
      severity: "error",
    });
    return;
  }

  const unit1Prereqs = asStringArray(unit1["prereqUnitIds"]);
  if (unit1Prereqs[0] !== WAVE10_FINAL_UNIT_ID) {
    emit({
      code: "WAVE11_PREREQ",
      path: `units[id=${WAVE11_FIRST_UNIT_ID}].prereqUnitIds`,
      message: "Wave 11 Unit 1 prerequisite must be unit.literacy.wave10.bab.",
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = asRecord(paths.find((row) => asRecord(row)?.["id"] === WAVE11_PATH_ID));
  if (!path) {
    emit({
      code: "WAVE11_PATH",
      path: "paths",
      message: "Wave 11 must include path.literacy.wave11.",
      severity: "error",
    });
  } else if (asStringArray(path["unitIds"]).join(",") !== WAVE11_UNIT_IDS.join(",")) {
    emit({
      code: "WAVE11_PATH",
      path: "paths[id=path.literacy.wave11].unitIds",
      message: "Wave 11 path must list exactly the two Wave 11 units in order.",
      severity: "error",
    });
  }

  const u1Exercises = asStringArray(unit1["exerciseIds"]);
  const u2Exercises = asStringArray(unit2["exerciseIds"]);
  if (asStringArray(unit1["wordIds"]).length > 0) {
    emit({
      code: "WAVE11_FLOW",
      path: `units[id=${WAVE11_FIRST_UNIT_ID}].wordIds`,
      message: "Wave 11 Unit 1 must have no word target.",
      severity: "error",
    });
  }

  const showJaa = u1Exercises[0];
  const formId = u1Exercises[1];
  const scoredMadd = u1Exercises[2];
  const formEx = formId ? exercises.get(formId) : undefined;
  const showJaaEx = showJaa ? exercises.get(showJaa) : undefined;
  const scoredMaddEx = scoredMadd ? exercises.get(scoredMadd) : undefined;

  if (formEx?.["type"] !== "letter_recognition") {
    emit({
      code: "WAVE11_FLOW",
      path: `units[id=${WAVE11_FIRST_UNIT_ID}].exerciseIds[1]`,
      message: "Unit 1 first scored beat must be initial-ج form preparation.",
      severity: "error",
    });
  } else {
    const config = asRecord(formEx["config"]);
    const targets = Array.isArray(formEx["masteryTargets"]) ? formEx["masteryTargets"] : [];
    const formTarget = targets.map((row) => asRecord(row)).find((row) => row?.["letterForm"] === "initial");
    if (config?.["targetForm"] !== "initial" || formTarget?.["letterId"] !== "letter.jim") {
      emit({
        code: "WAVE11_FORM",
        path: `exercises[id=${formId}]`,
        message: "First scored form must be letter:jim.form.initial (جـ).",
        severity: "error",
      });
    }
    if (formTarget?.["letterForm"] === "medial" || formTarget?.["letterForm"] === "final") {
      emit({
        code: "WAVE11_FORM",
        path: `exercises[id=${formId}]`,
        message: "Wave 11 must not require medial or final ج.",
        severity: "error",
      });
    }
    const choiceIds = asStringArray(
      (Array.isArray(formEx["choices"]) ? formEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    const foils = choiceIds.filter((id) => id !== "letter.jim");
    if (foils.some((id) => !(SAFE_FORM_FOILS as readonly string[]).includes(id))) {
      emit({
        code: "WAVE11_FORM",
        path: `exercises[id=${formId}].choices`,
        message: "Initial-ج foils must be already-taught forms (حـ / بـ).",
        severity: "error",
      });
    }
    const prompt = typeof formEx["promptText"] === "string" ? formEx["promptText"] : "";
    if (prompt.includes("جـ") || prompt.includes("جَا")) {
      emit({
        code: "WAVE11_FLOW",
        path: `exercises[id=${formId}].promptText`,
        message: "Form prompt must not name the target.",
        severity: "error",
      });
    }
  }

  const maddConfig = asRecord(showJaaEx?.["config"]);
  if (
    showJaaEx?.["type"] !== "presentation" ||
    maddConfig?.["show"] !== "chunk" ||
    maddConfig?.["left"] !== "جَ" ||
    maddConfig?.["right"] !== "ا" ||
    maddConfig?.["result"] !== "جَا"
  ) {
    emit({
      code: "WAVE11_FLOW",
      path: `units[id=${WAVE11_FIRST_UNIT_ID}].exerciseIds[0]`,
      message: "Unit 1 must open with unscored جَ + ا → جَا (show: chunk) so the generic scheduler plays the transfer demo before scored beats.",
      severity: "error",
    });
  }
  if ((showJaaEx?.["masteryTargets"] as unknown[] | undefined)?.length) {
    emit({
      code: "WAVE11_PRESENTATION",
      path: `exercises[id=${showJaa}]`,
      message: "SHOW جَا must remain unscored.",
      severity: "error",
    });
  }
  if (u1Exercises.indexOf(showJaa ?? "") > u1Exercises.indexOf(scoredMadd ?? "")) {
    emit({
      code: "WAVE11_FLOW",
      path: `units[id=${WAVE11_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unscored جَ + ا → جَا must occur before scored جَا.",
      severity: "error",
    });
  }

  if (scoredMaddEx?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE11_FLOW",
      path: `units[id=${WAVE11_FIRST_UNIT_ID}].exerciseIds[2]`,
      message: "Unit 1 scored madd evidence must be syllable_blending.",
      severity: "error",
    });
  } else {
    const choices = asStringArray(
      (Array.isArray(scoredMaddEx["choices"]) ? scoredMaddEx["choices"] : []).map(
        (choice) => asRecord(choice)?.["id"],
      ),
    );
    if (
      asRecord(scoredMaddEx["success"])?.["correctChoiceId"] !== "syllable.jim.madd_alif" ||
      !choices.includes("syllable.jim.madd_alif") ||
      !choices.includes("syllable.jim.fatha") ||
      !choices.includes("syllable.ba.madd_alif")
    ) {
      emit({
        code: "WAVE11_FLOW",
        path: `exercises[id=${scoredMadd}].choices`,
        message: "Scored madd activity must target جَا with foils جَ and بَا.",
        severity: "error",
      });
    }
    const prompt = typeof scoredMaddEx["promptText"] === "string" ? scoredMaddEx["promptText"] : "";
    if (prompt.includes("جَا")) {
      emit({
        code: "WAVE11_FLOW",
        path: `exercises[id=${scoredMadd}].promptText`,
        message: "Scored madd prompt must not leak جَا.",
        severity: "error",
      });
    }
    const targets = Array.isArray(scoredMaddEx["masteryTargets"]) ? scoredMaddEx["masteryTargets"] : [];
    const maddTarget = targets
      .map((row) => asRecord(row))
      .find((row) => row?.["skillId"] === "skill.long_vowel.madd");
    if (!maddTarget || maddTarget["syllableId"] !== "syllable.jim.madd_alif") {
      emit({
        code: "WAVE11_LIVE_KEY",
        path: `exercises[id=${scoredMadd}].masteryTargets`,
        message: "Scored madd evidence must target skill.long_vowel.madd on syllable.jim.madd_alif (letter:jim.madd_alif).",
        severity: "error",
      });
    }
    if (targets.some((row) => asRecord(row)?.["syllableId"] === "syllable.ba.madd_alif")) {
      emit({
        code: "WAVE11_LIVE_KEY",
        path: `exercises[id=${scoredMadd}].masteryTargets`,
        message: "Historical letter:ba.madd_alif must not be a Wave 11 mastery target.",
        severity: "error",
      });
    }
    if (targets.some((row) => asRecord(row)?.["skillId"] === "skill.short_vowel.fatha")) {
      emit({
        code: "WAVE11_LIVE_KEY",
        path: `exercises[id=${scoredMadd}].masteryTargets`,
        message: "Madd evidence must not collide with letter:jim.fatha.",
        severity: "error",
      });
    }
  }

  for (const exercise of exercises.values()) {
    const type = exercise["type"];
    if (type === "sound_to_letter" && asStringArray(exercise["contentIds"]).includes("letter.alif")) {
      emit({
        code: "WAVE11_ALIF",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 11 must not score letter:alif.sound.",
        severity: "error",
      });
    }
    if (type === "letter_recognition") {
      const formTargets = (Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [])
        .map((row) => asRecord(row))
        .filter((row) => row && typeof row["letterForm"] === "string");
      if (formTargets.some((row) => row?.["letterId"] === "letter.alif")) {
        emit({
          code: "WAVE11_FORM",
          path: `exercises[id=${exercise["id"]}]`,
          message: "Wave 11 must not quiz alif positional forms.",
          severity: "error",
        });
      }
      if (formTargets.some((row) => row?.["letterId"] === "letter.jim" && row?.["letterForm"] === "medial")) {
        emit({
          code: "WAVE11_FORM",
          path: `exercises[id=${exercise["id"]}]`,
          message: "Wave 11 must not require historical letter:jim.form.medial.",
          severity: "error",
        });
      }
      if (formTargets.some((row) => row?.["letterId"] === "letter.jim" && row?.["letterForm"] === "final")) {
        emit({
          code: "WAVE11_FORM",
          path: `exercises[id=${exercise["id"]}]`,
          message: "Wave 11 must not quiz last ج as final ـج.",
          severity: "error",
        });
      }
      if (formTargets.some((row) => row?.["letterId"] === "letter.jim" && row?.["letterForm"] === "isolated")) {
        emit({
          code: "WAVE11_FORM",
          path: `exercises[id=${exercise["id"]}]`,
          message: "Wave 11 must not add letter:jim.form.isolated as a scored quiz.",
          severity: "error",
        });
      }
    }
    if (type === "missing_haraka") {
      emit({
        code: "WAVE11_SUKUN",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 11 must not add a sukun/haraka discrimination lesson.",
        severity: "error",
      });
    }
    if (asStringArray(exercise["tags"]).includes("review")) {
      emit({
        code: "WAVE11_REVIEW",
        path: `exercises[id=${exercise["id"]}].tags`,
        message: "Wave 11 must not include a required review exercise.",
        severity: "error",
      });
    }
  }

  const composeId = u2Exercises[0];
  const audioId = u2Exercises[1];
  const pictureId = u2Exercises.find((id) => exercises.get(id)?.["type"] === "word_to_picture");
  const composeEx = composeId ? exercises.get(composeId) : undefined;
  const audioEx = audioId ? exercises.get(audioId) : undefined;
  const pictureEx = pictureId ? exercises.get(pictureId) : undefined;
  const composeConfig = asRecord(composeEx?.["config"]);
  if (
    composeEx?.["type"] !== "presentation" ||
    composeConfig?.["show"] !== "chunk" ||
    composeConfig?.["left"] !== "دَ" ||
    composeConfig?.["right"] !== "جَاج" ||
    composeConfig?.["result"] !== "دَجَاج"
  ) {
    emit({
      code: "WAVE11_FLOW",
      path: `units[id=${WAVE11_FINAL_UNIT_ID}].exerciseIds[0]`,
      message: "Unit 2 must open with unscored دَ + جَاج → دَجَاج (show: chunk).",
      severity: "error",
    });
  }
  if ((composeEx?.["masteryTargets"] as unknown[] | undefined)?.length) {
    emit({
      code: "WAVE11_PRESENTATION",
      path: `exercises[id=${composeId}]`,
      message: "دَجَاج composition chunk must remain unscored.",
      severity: "error",
    });
  }
  if (composeConfig?.["show"] === "word") {
    emit({
      code: "WAVE11_FLOW",
      path: `exercises[id=${composeId}].config.show`,
      message: "First دَجَاج beat must not be a word presentation.",
      severity: "error",
    });
  }
  if (audioEx?.["type"] !== "audio_to_word") {
    emit({
      code: "WAVE11_FLOW",
      path: `units[id=${WAVE11_FINAL_UNIT_ID}].exerciseIds[1]`,
      message: "First scored دَجَاج evidence must be audio_to_word.",
      severity: "error",
    });
  } else {
    const success = asRecord(audioEx["success"]);
    const choiceIds = asStringArray(
      (Array.isArray(audioEx["choices"]) ? audioEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    if (success?.["correctChoiceId"] !== "word.dajaj" || !choiceIds.includes("word.dajaj")) {
      emit({
        code: "WAVE11_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "audio_to_word choices must include دَجَاج.",
        severity: "error",
      });
    }
    const foils = choiceIds.filter((id) => id !== "word.dajaj");
    if (foils.some((id) => !(SAFE_FOIL_WORDS as readonly string[]).includes(id))) {
      emit({
        code: "WAVE11_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "دَجَاج foils must already be decoded (بَاب / جَمَل).",
        severity: "error",
      });
    }
    const prompt = typeof audioEx["promptText"] === "string" ? audioEx["promptText"] : "";
    if (prompt.includes("دَجَاج")) {
      emit({
        code: "WAVE11_FLOW",
        path: `exercises[id=${audioId}].promptText`,
        message: "First scored word prompt must not leak دَجَاج.",
        severity: "error",
      });
    }
  }
  if (pictureId && u2Exercises.indexOf(pictureId) < u2Exercises.indexOf(audioId ?? "")) {
    emit({
      code: "WAVE11_FLOW",
      path: `units[id=${WAVE11_FINAL_UNIT_ID}].exerciseIds`,
      message: "Picture must not be first دَجَاج evidence.",
      severity: "error",
    });
  }
  if (pictureEx && !asStringArray(pictureEx["tags"]).includes("reinforcement")) {
    emit({
      code: "WAVE11_FLOW",
      path: `exercises[id=${pictureId}].tags`,
      message: "دَجَاج picture must be reinforcement only.",
      severity: "error",
    });
  }

  const u1Required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
  const u2Required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
  if (
    !u1Required.includes("skill.letter_forms.positional") ||
    !u1Required.includes("skill.long_vowel.madd") ||
    u1Required.includes("skill.short_vowel.fatha") ||
    u1Required.includes("skill.word_decoding.simple")
  ) {
    emit({
      code: "WAVE11_MASTERY",
      path: `units[id=${WAVE11_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 1 must require letter_forms.positional and long_vowel.madd only.",
      severity: "error",
    });
  }
  if (u2Required.join(",") !== "skill.word_decoding.simple") {
    emit({
      code: "WAVE11_MASTERY",
      path: `units[id=${WAVE11_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 2 must require exactly skill.word_decoding.simple.",
      severity: "error",
    });
  }

  for (const [unitId, unit] of [
    [WAVE11_FIRST_UNIT_ID, unit1],
    [WAVE11_FINAL_UNIT_ID, unit2],
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
          code: "WAVE11_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave11WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE11_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE11_BAND_A_REF",
        path: "words",
        message: `Wave 11 word "${id}" is not in production Band A.`,
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
          code: "WAVE11_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 11 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE11_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 11 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== source["legacyId"]) {
      emit({
        code: "WAVE11_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `Wave 11 "${id}" legacyId must match Band A.`,
        severity: "error",
      });
    }
    if (source["legacyId"] !== "food-8") {
      emit({
        code: "WAVE11_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: "word.dajaj must remain Band A food-8.",
        severity: "error",
      });
    }
  }
}
