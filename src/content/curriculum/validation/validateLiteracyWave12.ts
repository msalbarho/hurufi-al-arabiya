/**
 * Deterministic Wave 12 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 12 production bundle.
 * Waves 1–11 stay frozen. New consonant ن, madd-alif transfer onto نَا, then نَار.
 * No kasra. No نَعَم / لَا / شَاي. Compact two-unit wave.
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
import {
  WAVE11_FINAL_UNIT_ID,
  WAVE11_LETTER_IDS,
  WAVE11_WORD_IDS,
} from "./validateLiteracyWave11.ts";

export const LITERACY_WAVE12_META_ID = "hurufi.production.literacy.wave12";

export const WAVE12_LETTER_IDS = ["letter.nun"] as const;

export const WAVE12_WORD_IDS = ["word.nar"] as const;

export const WAVE12_BAND_A_WORD_IDS = ["word.nar"] as const;

export const WAVE12_PATH_ID = "path.literacy.wave12";

export const WAVE12_UNIT_IDS = [
  "unit.literacy.wave12.nun",
  "unit.literacy.wave12.nar",
] as const;

export const WAVE12_FIRST_UNIT_ID = "unit.literacy.wave12.nun";
export const WAVE12_FINAL_UNIT_ID = "unit.literacy.wave12.nar";

export const WAVE12_EXTERNAL_PREREQ_UNIT_IDS = [WAVE11_FINAL_UNIT_ID] as const;

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
  "skill.short_vowel.kasra",
  "skill.short_vowel.damma",
] as const;

const SAFE_SOUND_FOILS = ["letter.mim", "letter.ta", "letter.sin"] as const;
const SAFE_FATHA_FOILS = ["syllable.mim.fatha", "syllable.ta.fatha"] as const;
const SAFE_FORM_FOILS = ["letter.ta", "letter.ba"] as const;
const SAFE_FOIL_WORDS = ["word.bab", "word.dajaj"] as const;

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

export function isLiteracyWave12Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE12_META_ID;
}

export function validateLiteracyWave12Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE12_META",
        path: "meta.kind",
        message: "Literacy Wave 12 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE12_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 12 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-13") || blob.includes("wave13") || blob.includes("path.literacy.wave13")) {
    emit({
      code: "WAVE12_SCOPE",
      path: "$",
      message: "Wave 12 must not declare a Wave 13 path, route, or CTA.",
      severity: "error",
    });
  }
  if (blob.includes("word.laa") || blob.includes("word:laa")) {
    emit({
      code: "WAVE12_SCOPE",
      path: "$",
      message: "Wave 12 must not include word.laa / لَا.",
      severity: "error",
    });
  }
  if (blob.includes("word.naam") || blob.includes("word:naam") || blob.includes("نَعَم")) {
    emit({
      code: "WAVE12_SCOPE",
      path: "$",
      message: "Wave 12 must not include word.naam / نَعَم.",
      severity: "error",
    });
  }
  if (blob.includes("word.shay") || blob.includes("word:shay") || blob.includes("شَاي")) {
    emit({
      code: "WAVE12_SCOPE",
      path: "$",
      message: "Wave 12 must not include word.shay / شَاي.",
      severity: "error",
    });
  }
  if (blob.includes("النار") || blob.includes("النَّار") || blob.includes("الْنَّار")) {
    emit({
      code: "WAVE12_TITLE",
      path: "$",
      message: "Wave 12 must not use child title النار (definite article + sun-letter).",
      severity: "error",
    });
  }
  if (FORBIDDEN_LETTERS.some((id) => blob.includes(id))) {
    emit({
      code: "WAVE12_LETTER",
      path: "$",
      message: "Wave 12 must not teach ه, خ, ط, ث, or غ.",
      severity: "error",
    });
  }
  if (
    blob.includes("review-wave12") ||
    blob.includes("review.wave12") ||
    blob.includes("word:nar.review") ||
    blob.includes("skill.articulation")
  ) {
    emit({
      code: "WAVE12_REVIEW",
      path: "$",
      message: "Wave 12 must not require a review key or a new articulation skill.",
      severity: "error",
    });
  }

  for (const text of childTitleStrings(data)) {
    if (HAMZA_SEATS.test(text) || SHADDA.test(text)) {
      emit({
        code: "WAVE12_TITLE",
        path: "childTitle",
        message: `Wave 12 child titles must not contain hamza-on-alif or shadda: "${text}".`,
        severity: "error",
      });
    }
  }
  for (const text of childVisibleStrings(data)) {
    if (HAMZA_SEATS.test(text)) {
      emit({
        code: "WAVE12_HAMZA",
        path: "childVisible",
        message: `Wave 12 child-visible copy must not contain أ / إ / آ: "${text}".`,
        severity: "error",
      });
    }
  }

  const priorLetters = stringSet(PRIOR_LETTER_IDS);
  const allowedLetters = new Set<string>([...PRIOR_LETTER_IDS, ...WAVE12_LETTER_IDS, ...CARRIER_LETTER_IDS]);
  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  let foundAlif = false;
  let foundNun = false;
  for (let i = 0; i < letters.length; i++) {
    const letter = asRecord(letters[i]);
    if (!letter) continue;
    const id = typeof letter["id"] === "string" ? letter["id"] : "";
    if (id && !allowedLetters.has(id)) {
      emit({
        code: "WAVE12_LETTER",
        path: `letters[${i}].id`,
        message: `Wave 12 must not introduce untaught letter "${id}".`,
        severity: "error",
      });
    }
    if (id === "letter.nun") {
      foundNun = true;
      if (letter["nonConnecting"] === true) {
        emit({
          code: "WAVE12_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.nun must remain dual-joining so نَار begins with initial نـ.",
          severity: "error",
        });
      }
    }
    if (id === "letter.alif") {
      foundAlif = true;
      if (letter["nonConnecting"] !== true) {
        emit({
          code: "WAVE12_JOINING",
          path: `letters[${i}].nonConnecting`,
          message: "letter.alif must remain nonConnecting.",
          severity: "error",
        });
      }
      if (typeof letter["phoneme"] === "string" && letter["phoneme"].length > 0) {
        emit({
          code: "WAVE12_ALIF",
          path: `letters[${i}].phoneme`,
          message: "Wave 12 must not teach isolated alif as a letter-sound.",
          severity: "error",
        });
      }
    }
    if (id === "letter.ra" && letter["nonConnecting"] !== true) {
      emit({
        code: "WAVE12_JOINING",
        path: `letters[${i}].nonConnecting`,
        message: "letter.ra must remain nonConnecting so the last ر is isolated.",
        severity: "error",
      });
    }
    const wave = expectedPriorWave(id);
    if (wave !== undefined && priorLetters.has(id)) {
      const tags = asStringArray(letter["tags"]);
      if (!tags.includes("recycled")) {
        emit({
          code: "WAVE12_LETTER",
          path: `letters[${i}].tags`,
          message: `Recycled letter "${id}" must be tagged recycled.`,
          severity: "error",
        });
      }
    }
  }
  if (!foundNun) {
    emit({
      code: "WAVE12_LETTER",
      path: "letters",
      message: "Wave 12 must introduce letter.nun.",
      severity: "error",
    });
  }
  if (!foundAlif) {
    emit({
      code: "WAVE12_ALIF",
      path: "letters",
      message: "Wave 12 must include letter.alif as a madd carrier.",
      severity: "error",
    });
  }

  const allowedWords = new Set<string>([...PRIOR_WORD_IDS, ...WAVE12_WORD_IDS]);
  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  const foundNewWords = new Set<string>();
  for (let i = 0; i < words.length; i++) {
    const word = asRecord(words[i]);
    if (!word) continue;
    const id = typeof word["id"] === "string" ? word["id"] : "";
    if (id && !allowedWords.has(id)) {
      emit({
        code: "WAVE12_WORD",
        path: `words[${i}].id`,
        message: `Wave 12 must not introduce untaught word "${id}".`,
        severity: "error",
      });
    }
    if ((WAVE12_WORD_IDS as readonly string[]).includes(id)) foundNewWords.add(id);
    if (id === "word.nar") {
      if (word["teachingForm"] !== "نَار" || word["diacritized"] !== "نَار") {
        emit({
          code: "WAVE12_WORD",
          path: `words[${i}].teachingForm`,
          message: "word.nar teachingForm must be نَار.",
          severity: "error",
        });
      }
      const form = typeof word["teachingForm"] === "string" ? word["teachingForm"] : "";
      if (KASRA_DAMMA.test(form) || TAA_MARBUTA.test(form) || ALIF_MAQSURA.test(form) || SHADDA.test(form)) {
        emit({
          code: "WAVE12_PHONICS",
          path: `words[${i}].teachingForm`,
          message: "نَار must not contain kasra, damma, shadda, ة, or ى.",
          severity: "error",
        });
      }
      const phonics = asStringArray(word["phonicsSkillIds"]);
      const required = asStringArray(word["requiredSkillIds"]);
      if (!phonics.includes("skill.long_vowel.madd") || !required.includes("skill.long_vowel.madd")) {
        emit({
          code: "WAVE12_PHONICS",
          path: `words[${i}]`,
          message: "word.nar must require skill.long_vowel.madd.",
          severity: "error",
        });
      }
      if (phonics.includes("skill.sukun.basic") || required.includes("skill.sukun.basic")) {
        emit({
          code: "WAVE12_SUKUN",
          path: `words[${i}]`,
          message: "word.nar must not require sukun.",
          severity: "error",
        });
      }
      for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
        if (
          phonics.some((skillId) => skillId.startsWith(prefix) || skillId === prefix) ||
          required.some((skillId) => skillId.startsWith(prefix) || skillId === prefix)
        ) {
          emit({
            code: "WAVE12_PHONICS",
            path: `words[${i}]`,
            message: `word.nar must not require forbidden skill prefix ${prefix}.`,
            severity: "error",
          });
        }
      }
      if (word["legacyId"] !== "nature-32") {
        emit({
          code: "WAVE12_WORD",
          path: `words[${i}].legacyId`,
          message: "word.nar must remain Band A nature-32.",
          severity: "error",
        });
      }
      if (word["vocabBand"] !== "A" || word["subBand"] !== "A1") {
        emit({
          code: "WAVE12_WORD",
          path: `words[${i}].subBand`,
          message: "word.nar must remain Band A / A1.",
          severity: "error",
        });
      }
      const forms = letterFormsOnWord(word);
      const nunForms = forms.filter((row) => row.letterId === "letter.nun").map((row) => row.form);
      const raForms = forms.filter((row) => row.letterId === "letter.ra").map((row) => row.form);
      if (!nunForms.includes("initial")) {
        emit({
          code: "WAVE12_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "First ن must be recorded as initial, not inferred from string index.",
          severity: "error",
        });
      }
      if (nunForms.includes("medial") || nunForms.includes("final")) {
        emit({
          code: "WAVE12_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "Wave 12 must not require medial or final ن.",
          severity: "error",
        });
      }
      if (raForms.includes("final")) {
        emit({
          code: "WAVE12_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "Last ر after madd-alif must not be recorded as final ـر.",
          severity: "error",
        });
      }
      if (!raForms.includes("isolated")) {
        emit({
          code: "WAVE12_JOINING",
          path: `words[${i}].requiredLetterForms`,
          message: "Last ر after ا must be recorded as isolated ر.",
          severity: "error",
        });
      }
    }
  }
  for (const id of WAVE12_WORD_IDS) {
    if (!foundNewWords.has(id)) {
      emit({
        code: "WAVE12_WORD",
        path: "words",
        message: `Wave 12 must include ${id}.`,
        severity: "error",
      });
    }
  }
  if (foundNewWords.size !== WAVE12_WORD_IDS.length) {
    emit({
      code: "WAVE12_WORD",
      path: "words",
      message: "Wave 12 must add exactly word.nar.",
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
          code: "WAVE12_PHONICS",
          path: `skills[${i}].id`,
          message: `Wave 12 must not add forbidden skill "${skillId}".`,
          severity: "error",
        });
      }
    }
  }
  if (!foundMaddSkill) {
    emit({
      code: "WAVE12_PHONICS",
      path: "skills",
      message: "Wave 12 must include skill.long_vowel.madd.",
      severity: "error",
    });
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  let foundNunFatha = false;
  let foundNunMadd = false;
  for (let i = 0; i < syllables.length; i++) {
    const syllable = asRecord(syllables[i]);
    if (!syllable) continue;
    if (syllable["id"] === "syllable.nun.fatha") {
      foundNunFatha = true;
      if (syllable["pattern"] !== "CV" || syllable["text"] !== "نَ" || syllable["vowelSkillId"] !== "skill.short_vowel.fatha") {
        emit({
          code: "WAVE12_CV",
          path: `syllables[${i}]`,
          message: "syllable.nun.fatha must be CV نَ with skill.short_vowel.fatha.",
          severity: "error",
        });
      }
    }
    if (syllable["id"] === "syllable.nun.madd_alif") {
      foundNunMadd = true;
      if (syllable["pattern"] !== "CVV") {
        emit({
          code: "WAVE12_CVV",
          path: `syllables[${i}].pattern`,
          message: "syllable.nun.madd_alif must use pattern CVV.",
          severity: "error",
        });
      }
      if (syllable["text"] !== "نَا") {
        emit({
          code: "WAVE12_CVV",
          path: `syllables[${i}].text`,
          message: "syllable.nun.madd_alif text must be نَا.",
          severity: "error",
        });
      }
      if (syllable["vowelSkillId"] !== "skill.long_vowel.madd") {
        emit({
          code: "WAVE12_CVV",
          path: `syllables[${i}].vowelSkillId`,
          message: "syllable.nun.madd_alif must use skill.long_vowel.madd.",
          severity: "error",
        });
      }
      if (syllable["letterId"] !== "letter.nun") {
        emit({
          code: "WAVE12_CVV",
          path: `syllables[${i}].letterId`,
          message: "syllable.nun.madd_alif must use letter.nun.",
          severity: "error",
        });
      }
      const requiredLetters = asStringArray(syllable["requiredLetterIds"]);
      if (!requiredLetters.includes("letter.nun") || !requiredLetters.includes("letter.alif")) {
        emit({
          code: "WAVE12_CVV",
          path: `syllables[${i}].requiredLetterIds`,
          message: "syllable.nun.madd_alif must require letter.nun and letter.alif.",
          severity: "error",
        });
      }
    }
    if (syllable["pattern"] === "CVC") {
      emit({
        code: "WAVE12_CHUNK",
        path: `syllables[${i}].pattern`,
        message: "Wave 12 must not add a new CVC syllable.",
        severity: "error",
      });
    }
  }
  if (!foundNunFatha) {
    emit({
      code: "WAVE12_CV",
      path: "syllables",
      message: "Wave 12 must include syllable.nun.fatha.",
      severity: "error",
    });
  }
  if (!foundNunMadd) {
    emit({
      code: "WAVE12_CVV",
      path: "syllables",
      message: "Wave 12 must include syllable.nun.madd_alif.",
      severity: "error",
    });
  }

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 2) {
    emit({
      code: "WAVE12_UNITS",
      path: "units",
      message: "Wave 12 must declare exactly two units.",
      severity: "error",
    });
  }

  const unit1 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE12_FIRST_UNIT_ID));
  const unit2 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE12_FINAL_UNIT_ID));
  if (!unit1 || !unit2) {
    emit({
      code: "WAVE12_UNITS",
      path: "units",
      message: "Wave 12 must include unit.literacy.wave12.nun and unit.literacy.wave12.nar.",
      severity: "error",
    });
    return;
  }

  if (asStringArray(unit1["prereqUnitIds"])[0] !== WAVE11_FINAL_UNIT_ID) {
    emit({
      code: "WAVE12_PREREQ",
      path: `units[id=${WAVE12_FIRST_UNIT_ID}].prereqUnitIds`,
      message: "Wave 12 Unit 1 prerequisite must be unit.literacy.wave11.dajaj.",
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = asRecord(paths.find((row) => asRecord(row)?.["id"] === WAVE12_PATH_ID));
  if (!path) {
    emit({
      code: "WAVE12_PATH",
      path: "paths",
      message: "Wave 12 must include path.literacy.wave12.",
      severity: "error",
    });
  } else if (asStringArray(path["unitIds"]).join(",") !== WAVE12_UNIT_IDS.join(",")) {
    emit({
      code: "WAVE12_PATH",
      path: "paths[id=path.literacy.wave12].unitIds",
      message: "Wave 12 path must list exactly the two Wave 12 units in order.",
      severity: "error",
    });
  }

  const u1Exercises = asStringArray(unit1["exerciseIds"]);
  const u2Exercises = asStringArray(unit2["exerciseIds"]);
  if (asStringArray(unit1["wordIds"]).length > 0) {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FIRST_UNIT_ID}].wordIds`,
      message: "Wave 12 Unit 1 must have no word target.",
      severity: "error",
    });
  }

  const showNun = u1Exercises.find((id) => exercises.get(id)?.["type"] === "presentation" && asRecord(exercises.get(id)?.["config"])?.["show"] === "letter");
  const showFatha = u1Exercises.find((id) => {
    const ex = exercises.get(id);
    return ex?.["type"] === "presentation" && asRecord(ex["config"])?.["show"] === "cv";
  });
  const soundId = u1Exercises.find((id) => exercises.get(id)?.["type"] === "sound_to_letter");
  const fathaScoreId = u1Exercises.find((id) => exercises.get(id)?.["type"] === "syllable_blending");
  const formId = u1Exercises.find((id) => exercises.get(id)?.["type"] === "letter_recognition");
  const showNunEx = showNun ? exercises.get(showNun) : undefined;
  const showFathaEx = showFatha ? exercises.get(showFatha) : undefined;
  const soundEx = soundId ? exercises.get(soundId) : undefined;
  const fathaScoreEx = fathaScoreId ? exercises.get(fathaScoreId) : undefined;
  const formEx = formId ? exercises.get(formId) : undefined;

  if (showNunEx?.["type"] !== "presentation" || asRecord(showNunEx["config"])?.["letterId"] !== "letter.nun") {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must SHOW isolated ن before scored sound.",
      severity: "error",
    });
  }
  if (soundId && showNun && u1Exercises.indexOf(showNun) > u1Exercises.indexOf(soundId)) {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unscored isolated ن must occur before scored sound.",
      severity: "error",
    });
  }
  if (soundEx?.["type"] !== "sound_to_letter") {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must score letter:nun.sound.",
      severity: "error",
    });
  } else {
    const choiceIds = asStringArray(
      (Array.isArray(soundEx["choices"]) ? soundEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    const foils = choiceIds.filter((id) => id !== "letter.nun");
    if (asRecord(soundEx["success"])?.["correctChoiceId"] !== "letter.nun" || foils.some((id) => !(SAFE_SOUND_FOILS as readonly string[]).includes(id))) {
      emit({
        code: "WAVE12_FLOW",
        path: `exercises[id=${soundId}].choices`,
        message: "Nun sound foils must be already-taught letters (م / ت / س).",
        severity: "error",
      });
    }
  }

  if (showFathaEx?.["type"] !== "presentation" || asRecord(showFathaEx["config"])?.["show"] !== "cv") {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must SHOW نَ (cv) before scored fatha.",
      severity: "error",
    });
  }
  if (fathaScoreId && showFatha && u1Exercises.indexOf(showFatha) > u1Exercises.indexOf(fathaScoreId)) {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unscored نَ must occur before scored fatha.",
      severity: "error",
    });
  }
  if (fathaScoreEx?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 scored fatha evidence must be syllable_blending.",
      severity: "error",
    });
  } else {
    const choices = asStringArray(
      (Array.isArray(fathaScoreEx["choices"]) ? fathaScoreEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    if (
      asRecord(fathaScoreEx["success"])?.["correctChoiceId"] !== "syllable.nun.fatha" ||
      !choices.includes("syllable.nun.fatha") ||
      SAFE_FATHA_FOILS.some((id) => !choices.includes(id))
    ) {
      emit({
        code: "WAVE12_FLOW",
        path: `exercises[id=${fathaScoreId}].choices`,
        message: "Scored fatha activity must target نَ with foils مَ and تَ.",
        severity: "error",
      });
    }
  }

  if (formEx?.["type"] !== "letter_recognition") {
    emit({
      code: "WAVE12_FORM",
      path: `units[id=${WAVE12_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must score initial نـ.",
      severity: "error",
    });
  } else {
    const config = asRecord(formEx["config"]);
    const targets = Array.isArray(formEx["masteryTargets"]) ? formEx["masteryTargets"] : [];
    const formTarget = targets.map((row) => asRecord(row)).find((row) => row?.["letterForm"] === "initial");
    if (config?.["targetForm"] !== "initial" || formTarget?.["letterId"] !== "letter.nun") {
      emit({
        code: "WAVE12_FORM",
        path: `exercises[id=${formId}]`,
        message: "First scored form must be letter:nun.form.initial (نـ).",
        severity: "error",
      });
    }
    const choiceIds = asStringArray(
      (Array.isArray(formEx["choices"]) ? formEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    const foils = choiceIds.filter((id) => id !== "letter.nun");
    if (foils.some((id) => !(SAFE_FORM_FOILS as readonly string[]).includes(id))) {
      emit({
        code: "WAVE12_FORM",
        path: `exercises[id=${formId}].choices`,
        message: "Initial-ن foils must be already-taught forms (تـ / بـ).",
        severity: "error",
      });
    }
  }

  if (u1Exercises.some((id) => asStringArray(exercises.get(id)?.["contentIds"]).some((cid) => cid.includes("madd")))) {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must not include a madd quiz.",
      severity: "error",
    });
  }

  for (const exercise of exercises.values()) {
    const type = exercise["type"];
    if (type === "sound_to_letter" && asStringArray(exercise["contentIds"]).includes("letter.alif")) {
      emit({
        code: "WAVE12_ALIF",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 12 must not score letter:alif.sound.",
        severity: "error",
      });
    }
    if (type === "letter_recognition") {
      const formTargets = (Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [])
        .map((row) => asRecord(row))
        .filter((row) => row && typeof row["letterForm"] === "string");
      if (formTargets.some((row) => row?.["letterId"] === "letter.nun" && (row?.["letterForm"] === "medial" || row?.["letterForm"] === "final"))) {
        emit({
          code: "WAVE12_FORM",
          path: `exercises[id=${exercise["id"]}]`,
          message: "Wave 12 must not require medial or final ن.",
          severity: "error",
        });
      }
      if (formTargets.some((row) => row?.["letterId"] === "letter.ra")) {
        emit({
          code: "WAVE12_FORM",
          path: `exercises[id=${exercise["id"]}]`,
          message: "Wave 12 must not add a new ra form quiz.",
          severity: "error",
        });
      }
    }
    if (asStringArray(exercise["tags"]).includes("review")) {
      emit({
        code: "WAVE12_REVIEW",
        path: `exercises[id=${exercise["id"]}].tags`,
        message: "Wave 12 must not include a required review exercise.",
        severity: "error",
      });
    }
    if (exercise["type"] === "presentation" && (exercise["masteryTargets"] as unknown[] | undefined)?.length) {
      emit({
        code: "WAVE12_PRESENTATION",
        path: `exercises[id=${exercise["id"]}]`,
        message: "Wave 12 presentations must remain unscored (attempts 0).",
        severity: "error",
      });
    }
    if (exercise["type"] === "tracing" && !asStringArray(exercise["tags"]).includes("reinforcement")) {
      emit({
        code: "WAVE12_FLOW",
        path: `exercises[id=${exercise["id"]}].tags`,
        message: "Isolated tracing must be optional reinforcement, not a mastery gate.",
        severity: "error",
      });
    }
  }

  if (u1Exercises.some((id) => exercises.get(id)?.["type"] === "audio_to_word" || exercises.get(id)?.["type"] === "word_to_picture")) {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must not include a word target.",
      severity: "error",
    });
  }

  const maddShowId = u2Exercises.find((id) => {
    const config = asRecord(exercises.get(id)?.["config"]);
    return exercises.get(id)?.["type"] === "presentation" && config?.["result"] === "نَا";
  });
  const maddScoreId = u2Exercises.find((id) => exercises.get(id)?.["type"] === "syllable_blending");
  const composeId = u2Exercises.find((id) => {
    const config = asRecord(exercises.get(id)?.["config"]);
    return exercises.get(id)?.["type"] === "presentation" && config?.["result"] === "نَار";
  });
  const audioId = u2Exercises.find((id) => exercises.get(id)?.["type"] === "audio_to_word");
  const pictureId = u2Exercises.find((id) => exercises.get(id)?.["type"] === "word_to_picture");
  const maddShowEx = maddShowId ? exercises.get(maddShowId) : undefined;
  const maddScoreEx = maddScoreId ? exercises.get(maddScoreId) : undefined;
  const composeEx = composeId ? exercises.get(composeId) : undefined;
  const audioEx = audioId ? exercises.get(audioId) : undefined;
  const pictureEx = pictureId ? exercises.get(pictureId) : undefined;
  const maddConfig = asRecord(maddShowEx?.["config"]);
  const composeConfig = asRecord(composeEx?.["config"]);

  if (
    maddShowEx?.["type"] !== "presentation" ||
    maddConfig?.["show"] !== "chunk" ||
    maddConfig?.["left"] !== "نَ" ||
    maddConfig?.["right"] !== "ا" ||
    maddConfig?.["result"] !== "نَا"
  ) {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must include unscored نَ + ا → نَا (show: chunk).",
      severity: "error",
    });
  }
  if ((maddShowEx?.["masteryTargets"] as unknown[] | undefined)?.length) {
    emit({
      code: "WAVE12_PRESENTATION",
      path: `exercises[id=${maddShowId}]`,
      message: "SHOW نَا must remain unscored.",
      severity: "error",
    });
  }

  if (maddScoreEx?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 scored madd evidence must be syllable_blending.",
      severity: "error",
    });
  } else {
    const choices = asStringArray(
      (Array.isArray(maddScoreEx["choices"]) ? maddScoreEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    if (
      asRecord(maddScoreEx["success"])?.["correctChoiceId"] !== "syllable.nun.madd_alif" ||
      !choices.includes("syllable.nun.madd_alif") ||
      !choices.includes("syllable.nun.fatha") ||
      !choices.includes("syllable.ba.madd_alif")
    ) {
      emit({
        code: "WAVE12_FLOW",
        path: `exercises[id=${maddScoreId}].choices`,
        message: "Scored madd activity must target نَا with foils نَ and بَا.",
        severity: "error",
      });
    }
    const targets = Array.isArray(maddScoreEx["masteryTargets"]) ? maddScoreEx["masteryTargets"] : [];
    if (targets.some((row) => asRecord(row)?.["syllableId"] === "syllable.ba.madd_alif" || asRecord(row)?.["syllableId"] === "syllable.jim.madd_alif")) {
      emit({
        code: "WAVE12_LIVE_KEY",
        path: `exercises[id=${maddScoreId}].masteryTargets`,
        message: "Historical ba/jim madd must not be a Wave 12 mastery target.",
        severity: "error",
      });
    }
  }
  if (maddShowId && maddScoreId && u2Exercises.indexOf(maddShowId) > u2Exercises.indexOf(maddScoreId)) {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unscored نَ + ا → نَا must occur before scored نَا.",
      severity: "error",
    });
  }
  if (maddScoreId && audioId && u2Exercises.indexOf(maddScoreId) > u2Exercises.indexOf(audioId)) {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FINAL_UNIT_ID}].exerciseIds`,
      message: "Scored نَا must occur before نَار decode.",
      severity: "error",
    });
  }

  if (
    composeEx?.["type"] !== "presentation" ||
    composeConfig?.["show"] !== "chunk" ||
    composeConfig?.["left"] !== "نَا" ||
    composeConfig?.["right"] !== "ر" ||
    composeConfig?.["result"] !== "نَار"
  ) {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FINAL_UNIT_ID}].exerciseIds`,
      message: "Unit 2 must include unscored نَا + ر → نَار (show: chunk).",
      severity: "error",
    });
  }
  if ((composeEx?.["masteryTargets"] as unknown[] | undefined)?.length) {
    emit({
      code: "WAVE12_PRESENTATION",
      path: `exercises[id=${composeId}]`,
      message: "نَار composition chunk must remain unscored.",
      severity: "error",
    });
  }

  if (audioEx?.["type"] !== "audio_to_word") {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FINAL_UNIT_ID}].exerciseIds`,
      message: "First scored نَار evidence must be audio_to_word.",
      severity: "error",
    });
  } else {
    const choiceIds = asStringArray(
      (Array.isArray(audioEx["choices"]) ? audioEx["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
    );
    if (asRecord(audioEx["success"])?.["correctChoiceId"] !== "word.nar" || !choiceIds.includes("word.nar")) {
      emit({
        code: "WAVE12_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "audio_to_word choices must include نَار.",
        severity: "error",
      });
    }
    const foils = choiceIds.filter((id) => id !== "word.nar");
    if (foils.some((id) => !(SAFE_FOIL_WORDS as readonly string[]).includes(id))) {
      emit({
        code: "WAVE12_FLOW",
        path: `exercises[id=${audioId}].choices`,
        message: "نَار foils must already be decoded (بَاب / دَجَاج).",
        severity: "error",
      });
    }
  }
  if (pictureId && audioId && u2Exercises.indexOf(pictureId) < u2Exercises.indexOf(audioId)) {
    emit({
      code: "WAVE12_FLOW",
      path: `units[id=${WAVE12_FINAL_UNIT_ID}].exerciseIds`,
      message: "Picture must not be first نَار evidence.",
      severity: "error",
    });
  }
  if (pictureEx && !asStringArray(pictureEx["tags"]).includes("reinforcement")) {
    emit({
      code: "WAVE12_FLOW",
      path: `exercises[id=${pictureId}].tags`,
      message: "نَار picture must be reinforcement only.",
      severity: "error",
    });
  }

  const u1Required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
  const u2Required = asStringArray(asRecord(unit2["mastery"])?.["requiredSkillIds"]);
  if (
    !u1Required.includes("skill.letter_sounds.core") ||
    !u1Required.includes("skill.short_vowel.fatha") ||
    !u1Required.includes("skill.letter_forms.positional") ||
    u1Required.includes("skill.long_vowel.madd") ||
    u1Required.includes("skill.word_decoding.simple") ||
    u1Required.includes("skill.handwriting.isolated")
  ) {
    emit({
      code: "WAVE12_MASTERY",
      path: `units[id=${WAVE12_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 1 must require sound, fatha, and initial form only.",
      severity: "error",
    });
  }
  if (
    !u2Required.includes("skill.long_vowel.madd") ||
    !u2Required.includes("skill.word_decoding.simple") ||
    u2Required.includes("skill.short_vowel.fatha") ||
    u2Required.includes("skill.letter_sounds.core")
  ) {
    emit({
      code: "WAVE12_MASTERY",
      path: `units[id=${WAVE12_FINAL_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 2 must require long_vowel.madd and word_decoding.simple only.",
      severity: "error",
    });
  }

  for (const [unitId, unit] of [
    [WAVE12_FIRST_UNIT_ID, unit1],
    [WAVE12_FINAL_UNIT_ID, unit2],
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
          code: "WAVE12_LIVE_KEY",
          path: `units[id=${unitId}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }
}

export function validateWave12WordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of WAVE12_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE12_BAND_A_REF",
        path: "words",
        message: `Wave 12 word "${id}" is not in production Band A.`,
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
          code: "WAVE12_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 12 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "WAVE12_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 12 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
    if (slice["legacyId"] !== source["legacyId"]) {
      emit({
        code: "WAVE12_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: `Wave 12 "${id}" legacyId must match Band A.`,
        severity: "error",
      });
    }
    if (source["legacyId"] !== "nature-32") {
      emit({
        code: "WAVE12_BAND_A_REF",
        path: `words[id=${id}].legacyId`,
        message: "word.nar must remain Band A nature-32.",
        severity: "error",
      });
    }
  }
}
