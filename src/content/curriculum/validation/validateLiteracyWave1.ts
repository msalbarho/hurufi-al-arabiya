/**
 * Deterministic Wave 1 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 1 production bundle.
 * Word identity vs Band A is checked separately by the CLI.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";

export const LITERACY_WAVE1_META_ID = "hurufi.production.literacy.wave1";

export const WAVE1_LETTER_IDS = [
  "letter.mim",
  "letter.lam",
  "letter.qaf",
  "letter.dal",
  "letter.waw",
  "letter.jim",
  "letter.ya",
] as const;

export const WAVE1_WORD_IDS = [
  "word.qalam",
  "word.qadam",
  "word.walad",
  "word.jamal",
  "word.yad",
] as const;

export const WAVE1_PATH_ID = "path.literacy.wave1";

const DEFERRED_SKILL_PREFIXES = [
  "skill.sukun.",
  "skill.shadda.",
  "skill.tanween.",
  "skill.hamza.",
  "skill.long_vowel.",
  "skill.taa_marbuta.",
  "skill.alif_maqsura.",
] as const;

const FORBIDDEN_WAVE_SKILL_IDS = [
  "skill.letter_recognition.wave1",
  "skill.letter_sounds.wave1",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringSet(ids: readonly string[]): Set<string> {
  return new Set(ids);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

export function isLiteracyWave1Bundle(data: unknown): boolean {
  if (!isRecord(data) || !isRecord(data["meta"])) return false;
  return data["meta"]["id"] === LITERACY_WAVE1_META_ID;
}

export function validateLiteracyWave1Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  if (!isRecord(data)) return;
  const meta = data["meta"];
  if (isRecord(meta)) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE1_META",
        path: "meta.kind",
        message: "Literacy Wave 1 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE1_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 1 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const expectedLetters = stringSet(WAVE1_LETTER_IDS);
  const letters = Array.isArray(data["letters"]) ? data["letters"] : [];
  const foundLetters = new Set<string>();
  letters.forEach((row, i) => {
    if (!isRecord(row) || typeof row["id"] !== "string") return;
    foundLetters.add(row["id"]);
    if (!expectedLetters.has(row["id"])) {
      emit({
        code: "WAVE1_LETTER",
        path: `letters[${i}].id`,
        message: `Unexpected letter "${row["id"]}" in Wave 1 (slice must stay on the approved 7-letter set).`,
        severity: "error",
      });
    }
    if (row["wave"] !== 1) {
      emit({
        code: "WAVE1_LETTER",
        path: `letters[${i}].wave`,
        message: `Wave 1 letter "${row["id"]}" must set wave: 1.`,
        severity: "error",
      });
    }
    if (typeof row["legacyId"] !== "string" || row["legacyId"].length === 0) {
      emit({
        code: "WAVE1_LETTER",
        path: `letters[${i}].legacyId`,
        message: `Wave 1 letter "${row["id"]}" must bridge to a prototype legacyId.`,
        severity: "error",
      });
    }
  });
  for (const id of WAVE1_LETTER_IDS) {
    if (!foundLetters.has(id)) {
      emit({
        code: "WAVE1_LETTER",
        path: "letters",
        message: `Wave 1 is missing required letter "${id}".`,
        severity: "error",
      });
    }
  }

  const expectedWords = stringSet(WAVE1_WORD_IDS);
  const words = Array.isArray(data["words"]) ? data["words"] : [];
  const foundWords = new Set<string>();
  words.forEach((row, i) => {
    if (!isRecord(row) || typeof row["id"] !== "string") return;
    foundWords.add(row["id"]);
    if (!expectedWords.has(row["id"])) {
      emit({
        code: "WAVE1_WORD",
        path: `words[${i}].id`,
        message: `Unexpected word "${row["id"]}" — Wave 1 may only copy approved Band A lemmas.`,
        severity: "error",
      });
    }
    if (row["vocabBand"] !== "A") {
      emit({
        code: "WAVE1_WORD",
        path: `words[${i}].vocabBand`,
        message: `Wave 1 word "${row["id"]}" must remain vocabBand "A".`,
        severity: "error",
      });
    }
    if (row["status"] === "fixture") {
      emit({
        code: "WAVE1_WORD",
        path: `words[${i}].status`,
        message: `Wave 1 word "${row["id"]}" must not be marked fixture.`,
        severity: "error",
      });
    }
  });
  for (const id of WAVE1_WORD_IDS) {
    if (!foundWords.has(id)) {
      emit({
        code: "WAVE1_WORD",
        path: "words",
        message: `Wave 1 is missing required Band A word "${id}".`,
        severity: "error",
      });
    }
  }

  const skills = Array.isArray(data["skills"]) ? data["skills"] : [];
  skills.forEach((row, i) => {
    if (!isRecord(row)) return;
    const skillId = row["id"];
    if (typeof skillId !== "string") return;
    if (DEFERRED_SKILL_PREFIXES.some((prefix) => skillId.startsWith(prefix))) {
      emit({
        code: "WAVE1_PHONICS",
        path: `skills[${i}].id`,
        message: `Wave 1 must not teach deferred phonics skill "${skillId}".`,
        severity: "error",
      });
    }
    if ((FORBIDDEN_WAVE_SKILL_IDS as readonly string[]).includes(skillId)) {
      emit({
        code: "WAVE1_SKILL",
        path: `skills[${i}].id`,
        message: `Wave-specific skill "${skillId}" is not allowed; use generic skill + letterId.`,
        severity: "error",
      });
    }
  });

  const syllables = Array.isArray(data["syllables"]) ? data["syllables"] : [];
  if (syllables.length === 0) {
    emit({
      code: "WAVE1_SYLLABLE",
      path: "syllables",
      message: "Wave 1 must declare pedagogical syllables.",
      severity: "error",
    });
  }
  syllables.forEach((row, i) => {
    if (!isRecord(row)) return;
    if (row["pattern"] !== "CV") {
      emit({
        code: "WAVE1_SYLLABLE",
        path: `syllables[${i}].pattern`,
        message: "Wave 1 syllables must be CV (sukun / CVC is deferred).",
        severity: "error",
      });
    }
  });

  const units = Array.isArray(data["units"]) ? data["units"] : [];
  if (units.length === 0) {
    emit({
      code: "WAVE1_UNIT",
      path: "units",
      message: "Wave 1 must declare ordered learning units.",
      severity: "error",
    });
  }

  const paths = Array.isArray(data["paths"]) ? data["paths"] : [];
  if (paths.length !== 1) {
    emit({
      code: "WAVE1_PATH",
      path: "paths",
      message: `Wave 1 must contain exactly one learning path (found ${paths.length}).`,
      severity: "error",
    });
  } else if (isRecord(paths[0]) && paths[0]["id"] !== WAVE1_PATH_ID) {
    emit({
      code: "WAVE1_PATH",
      path: "paths[0].id",
      message: `Wave 1 path id must be "${WAVE1_PATH_ID}".`,
      severity: "error",
    });
  }

  const exercises = Array.isArray(data["exercises"]) ? data["exercises"] : [];
  if (exercises.length === 0) {
    emit({
      code: "WAVE1_EXERCISE",
      path: "exercises",
      message: "Wave 1 must include reusable exercise definitions.",
      severity: "error",
    });
  }
  exercises.forEach((row, i) => {
    if (!isRecord(row)) return;
    if (typeof row["learningObjectiveAr"] !== "string" || row["learningObjectiveAr"].length === 0) {
      emit({
        code: "WAVE1_OBJECTIVE",
        path: `exercises[${i}].learningObjectiveAr`,
        message: "Every Wave 1 exercise must declare a learning objective.",
        severity: "error",
      });
    }
  });
}

function sorted(ids: string[]): string[] {
  return [...ids].sort();
}

function recordById(rows: unknown[]): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    if (isRecord(row) && typeof row["id"] === "string") map.set(row["id"], row);
  }
  return map;
}

/** Wave 1 words must be copies of Band A records, not new vocabulary. */
export function validateLiteracyWordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  if (!isRecord(literacy) || !isRecord(bandA)) return;
  const literacyWords = recordById(Array.isArray(literacy["words"]) ? literacy["words"] : []);
  const bandAWords = recordById(Array.isArray(bandA["words"]) ? bandA["words"] : []);

  for (const id of WAVE1_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "WAVE1_BAND_A_REF",
        path: "words",
        message: `Wave 1 word "${id}" is not in production Band A.`,
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
          code: "WAVE1_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Wave 1 "${id}".${field} must match Band A (slice "${String(left)}" vs Band A "${String(right)}").`,
          severity: "error",
        });
      }
    }

    const sliceLetters = sorted(asStringArray(slice["letterIds"]));
    const sourceLetters = sorted(asStringArray(source["letterIds"]));
    if (sliceLetters.join(",") !== sourceLetters.join(",")) {
      emit({
        code: "WAVE1_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Wave 1 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }

    const sliceSkills = sorted(asStringArray(slice["requiredSkillIds"]));
    const sourceSkills = sorted(asStringArray(source["requiredSkillIds"]));
    if (sliceSkills.join(",") !== sourceSkills.join(",")) {
      emit({
        code: "WAVE1_BAND_A_REF",
        path: `words[id=${id}].requiredSkillIds`,
        message: `Wave 1 "${id}" requiredSkillIds must match Band A.`,
        severity: "error",
      });
    }
  }
}
