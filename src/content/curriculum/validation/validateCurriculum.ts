import {
  isValidCurriculumId,
  parseCurriculumId,
  type CurriculumIdNamespace,
} from "../types/ids.ts";
import type {
  AssetKind,
  ComprehensionType,
  ContentDifficulty,
  CurriculumAction,
  CurriculumBundle,
  CurriculumLevelId,
  ExerciseDifficulty,
  ExerciseType,
  FrequencyBand,
  MsaStatus,
  SkillDomain,
  SkillModality,
  SuccessType,
  VocabBand,
} from "../types/models.ts";
import { isBandAProductionBundle, validateBandAProduction } from "./validateBandA.ts";
import {
  isLiteracyWave1Bundle,
  validateLiteracyWave1Production,
} from "./validateLiteracyWave1.ts";
export {
  BAND_A_PRODUCTION_META_ID,
  BAND_A_V1_WORD_COUNT,
  isBandAProductionBundle,
  validateBandAProduction,
} from "./validateBandA.ts";
export {
  LITERACY_WAVE1_META_ID,
  WAVE1_LETTER_IDS,
  WAVE1_PATH_ID,
  WAVE1_WORD_IDS,
  isLiteracyWave1Bundle,
  validateLiteracyWave1Production,
  validateLiteracyWordsAgainstBandA,
} from "./validateLiteracyWave1.ts";
export {
  SHARED_SKILLS_CATALOG_ID,
  catalogSkillsFrom,
  skillIdentityKey,
  validateSkillsAgainstCatalog,
} from "./validateSharedSkills.ts";

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
  severity: ValidationSeverity;
}

export interface ValidationResult {
  ok: boolean;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
}

const SKILL_DOMAINS = new Set<SkillDomain>([
  "letter_recognition",
  "letter_sounds",
  "similar_letter_discrimination",
  "letter_forms",
  "handwriting",
  "short_vowels",
  "long_vowels",
  "sukun",
  "tanween",
  "shadda",
  "syllable_blending",
  "word_decoding",
  "vocabulary_comprehension",
  "spelling",
  "sentence_reading",
  "sentence_construction",
  "listening_comprehension",
  "reading_comprehension",
  "story_comprehension",
  "independent_reading",
  "informational_reading",
  "grammar_usage",
]);

const EXERCISE_TYPES = new Set<ExerciseType>([
  "letter_recognition",
  "sound_to_letter",
  "similar_letter_discrimination",
  "tracing",
  "picture_to_word",
  "word_to_picture",
  "audio_to_word",
  "audio_to_picture",
  "missing_letter",
  "missing_haraka",
  "syllable_blending",
  "word_order",
  "sentence_order",
  "dictation",
  "comprehension",
  "story_sequence",
]);

const MSA_STATUSES = new Set<MsaStatus>([
  "STANDARD_MSA",
  "ACCEPTABLE_MSA",
  "LOANWORD_ACCEPTED",
  "LOANWORD_REVIEW",
  "REGIONAL_STANDARD",
  "NONSTANDARD",
  "UNCERTAIN",
  "DIALECTAL",
]);

const CURRICULUM_ACTIONS = new Set<CurriculumAction>([
  "KEEP",
  "KEEP_ADVANCED",
  "MOVE_CATEGORY",
  "HUMAN_REVIEW",
  "REPLACE",
  "REMOVE",
]);

const VOCAB_BANDS = new Set<VocabBand>(["A", "B", "C", "D"]);
const FREQUENCY_BANDS = new Set<FrequencyBand>(["core", "common", "topic", "rare"]);
const EXERCISE_DIFFICULTIES = new Set<ExerciseDifficulty>(["easy", "normal", "hard"]);
const SUCCESS_TYPES = new Set<SuccessType>([
  "correct_choice",
  "trace_coverage",
  "ordered_ids",
  "exact_text",
]);
const COMPREHENSION_TYPES = new Set<ComprehensionType>([
  "picture_match",
  "wh_picture",
  "sequence",
  "fact_picture",
]);
const ASSET_KINDS = new Set<AssetKind>(["audio", "image", "trace"]);
const MODALITIES = new Set<SkillModality>(["listen", "read", "write", "speak"]);
const SYLLABLE_PATTERNS = new Set(["CV", "CVC"]);
const LETTER_FORM_SLOTS = new Set(["isolated", "initial", "medial", "final"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLevelId(value: unknown): value is CurriculumLevelId {
  return (
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5 ||
    value === 6 ||
    value === 7 ||
    value === 8
  );
}

function isContentDifficulty(value: unknown): value is ContentDifficulty {
  return value === 1 || value === 2 || value === 3;
}

class IssueList {
  issues: ValidationIssue[] = [];

  error(code: string, path: string, message: string) {
    this.issues.push({ code, path, message, severity: "error" });
  }

  warn(code: string, path: string, message: string) {
    this.issues.push({ code, path, message, severity: "warning" });
  }

  result(): ValidationResult {
    const errorCount = this.issues.filter((i) => i.severity === "error").length;
    const warningCount = this.issues.filter((i) => i.severity === "warning").length;
    return {
      ok: errorCount === 0,
      errorCount,
      warningCount,
      issues: this.issues,
    };
  }
}

function expectString(
  out: IssueList,
  path: string,
  value: unknown,
  required: boolean,
): string | undefined {
  if (value === undefined) {
    if (required) out.error("MISSING_FIELD", path, "Required string is missing.");
    return undefined;
  }
  if (typeof value !== "string" || value.length === 0) {
    out.error("INVALID_TYPE", path, "Expected a non-empty string.");
    return undefined;
  }
  return value;
}

function expectArray(
  out: IssueList,
  path: string,
  value: unknown,
  required: boolean,
): unknown[] | undefined {
  if (value === undefined) {
    if (required) out.error("MISSING_FIELD", path, "Required array is missing.");
    return undefined;
  }
  if (!Array.isArray(value)) {
    out.error("INVALID_TYPE", path, "Expected an array.");
    return undefined;
  }
  return value;
}

function checkId(out: IssueList, path: string, id: string, namespace?: CurriculumIdNamespace) {
  if (!isValidCurriculumId(id, namespace)) {
    out.error(
      "INVALID_ID_FORMAT",
      path,
      namespace ? `Invalid ${namespace} id "${id}".` : `Invalid curriculum id "${id}".`,
    );
  }
}

function addGlobalId(out: IssueList, seen: Map<string, string>, id: string, path: string) {
  const previous = seen.get(id);
  if (previous) {
    out.error("DUPLICATE_ID", path, `Duplicate id "${id}" (also at ${previous}).`);
    return;
  }
  seen.set(id, path);
}

function collectStringRefs(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStringRefs);
  if (isRecord(value)) return Object.values(value).flatMap(collectStringRefs);
  return [];
}

function expectInteger(
  out: IssueList,
  path: string,
  value: unknown,
  required: boolean,
): number | undefined {
  if (value === undefined) {
    if (required) out.error("MISSING_FIELD", path, "Required integer is missing.");
    return undefined;
  }
  if (typeof value !== "number" || !Number.isInteger(value)) {
    out.error("INVALID_TYPE", path, "Expected an integer.");
    return undefined;
  }
  return value;
}

function expectNumber(
  out: IssueList,
  path: string,
  value: unknown,
  required: boolean,
): number | undefined {
  if (value === undefined) {
    if (required) out.error("MISSING_FIELD", path, "Required number is missing.");
    return undefined;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    out.error("INVALID_TYPE", path, "Expected a number.");
    return undefined;
  }
  return value;
}

function findIdCycle(edges: Map<string, string[]>): string[] | null {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  let cycle: string[] | null = null;

  const dfs = (id: string, stack: string[]) => {
    if (cycle) return;
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      cycle = start >= 0 ? [...stack.slice(start), id] : [id, id];
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const next of edges.get(id) ?? []) {
      dfs(next, [...stack, id]);
    }
    visiting.delete(id);
    visited.add(id);
  };

  for (const id of edges.keys()) dfs(id, []);
  return cycle;
}

function duplicateStrings(ids: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  return [...dupes];
}

function formKey(letterId: string, form: string): string {
  return `${letterId}#${form}`;
}

function parseLetterFormRefs(
  out: IssueList,
  path: string,
  value: unknown,
): Array<{ letterId: string; form: string }> {
  if (value === undefined) return [];
  const rows = expectArray(out, path, value, false);
  if (!rows) return [];
  const result: Array<{ letterId: string; form: string }> = [];
  rows.forEach((row, i) => {
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", `${path}[${i}]`, "Letter form ref must be an object.");
      return;
    }
    const letterId = expectString(out, `${path}[${i}].letterId`, row["letterId"], true);
    const form = expectString(out, `${path}[${i}].form`, row["form"], true);
    if (form && !LETTER_FORM_SLOTS.has(form)) {
      out.error("UNKNOWN_ENUM", `${path}[${i}].form`, `Unknown letter form "${form}".`);
    }
    if (letterId && form) result.push({ letterId, form });
  });
  return result;
}

function checkImpossibleForm(
  out: IssueList,
  path: string,
  letterId: string,
  form: string,
  nonConnecting: Map<string, boolean>,
) {
  if (!nonConnecting.get(letterId)) return;
  if (form === "initial") {
    out.error(
      "INVALID_LETTER_FORM",
      path,
      `Letter "${letterId}" is non-connecting; use isolated, not a distinct initial joining form.`,
    );
  }
  if (form === "medial") {
    out.error(
      "INVALID_LETTER_FORM",
      path,
      `Letter "${letterId}" is non-connecting; use final (incoming join), not a distinct medial form.`,
    );
  }
}

function validateMeta(out: IssueList, data: unknown): void {
  if (!isRecord(data)) {
    out.error("INVALID_STRUCTURE", "meta", "meta must be an object.");
    return;
  }
  const kind = expectString(out, "meta.kind", data["kind"], true);
  if (kind && kind !== "fixture" && kind !== "production") {
    out.error("UNKNOWN_ENUM", "meta.kind", `Unknown meta.kind "${kind}".`);
  }
  expectString(out, "meta.id", data["id"], true);
  expectString(out, "meta.title", data["title"], true);
  expectString(out, "meta.description", data["description"], true);
  if (typeof data["notProductionCurriculum"] !== "boolean") {
    out.error("INVALID_TYPE", "meta.notProductionCurriculum", "Expected a boolean.");
  }
  if (kind === "fixture" && data["notProductionCurriculum"] === false) {
    out.error(
      "INVALID_STRUCTURE",
      "meta.notProductionCurriculum",
      "Fixture bundles must set notProductionCurriculum to true.",
    );
  }
  if (kind === "production" && data["notProductionCurriculum"] !== false) {
    out.error(
      "INVALID_STRUCTURE",
      "meta.notProductionCurriculum",
      "Production bundles must set notProductionCurriculum to false.",
    );
  }
}

function validateLevels(out: IssueList, data: unknown): Set<CurriculumLevelId> {
  const ids = new Set<CurriculumLevelId>();
  const rows = expectArray(out, "levels", data, true);
  if (!rows) return ids;
  rows.forEach((row, i) => {
    const path = `levels[${i}]`;
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", path, "Level must be an object.");
      return;
    }
    if (!isLevelId(row["id"])) {
      out.error("INVALID_LEVEL", `${path}.id`, "Level id must be an integer 1–8.");
      return;
    }
    if (ids.has(row["id"])) {
      out.error("DUPLICATE_ID", `${path}.id`, `Duplicate curriculum level ${row["id"]}.`);
    }
    ids.add(row["id"]);
    expectString(out, `${path}.nameAr`, row["nameAr"], true);
  });
  return ids;
}

export function validateCurriculum(data: unknown): ValidationResult {
  const out = new IssueList();

  if (!isRecord(data)) {
    out.error("INVALID_STRUCTURE", "$", "Curriculum bundle must be a JSON object.");
    return out.result();
  }

  validateMeta(out, data["meta"]);
  const levelIds = validateLevels(out, data["levels"]);

  const skills = expectArray(out, "skills", data["skills"], true) ?? [];
  const letters = expectArray(out, "letters", data["letters"], true) ?? [];
  const words = expectArray(out, "words", data["words"], true) ?? [];
  const sentences = expectArray(out, "sentences", data["sentences"], true) ?? [];
  const stories = expectArray(out, "stories", data["stories"], true) ?? [];
  const informationalTexts =
    expectArray(out, "informationalTexts", data["informationalTexts"], true) ?? [];
  const exercises = expectArray(out, "exercises", data["exercises"], true) ?? [];
  const assets = expectArray(out, "assets", data["assets"], true) ?? [];
  const syllables = expectArray(out, "syllables", data["syllables"], false) ?? [];
  const units = expectArray(out, "units", data["units"], false) ?? [];
  const paths = expectArray(out, "paths", data["paths"], false) ?? [];

  const globalIds = new Map<string, string>();
  const skillIds = new Set<string>();
  const letterIds = new Set<string>();
  const wordIds = new Set<string>();
  const sentenceIds = new Set<string>();
  const assetIds = new Set<string>();
  const exerciseIds = new Set<string>();
  const syllableIds = new Set<string>();
  const unitIds = new Set<string>();
  const letterLegacy = new Map<string, string>();
  const wordLegacy = new Map<string, string>();
  const letterNonConnecting = new Map<string, boolean>();
  const wordFormReqs = new Map<string, Array<{ letterId: string; form: string }>>();
  const unitFormKeys = new Map<string, string[]>();
  const masteryTargetMeanings = new Map<string, string>();
  const exercisesInUnits = new Set<string>();

  const requireLevel = (path: string, value: unknown) => {
    if (value === undefined) return;
    if (!isLevelId(value)) {
      out.error("INVALID_LEVEL", path, "Level must be an integer 1–8.");
      return;
    }
    if (levelIds.size > 0 && !levelIds.has(value)) {
      out.error("INVALID_LEVEL", path, `Level ${value} is not listed in levels[].`);
    }
  };

  skills.forEach((row, i) => {
    const path = `skills[${i}]`;
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", path, "Skill must be an object.");
      return;
    }
    const id = expectString(out, `${path}.id`, row["id"], true);
    if (id) {
      checkId(out, `${path}.id`, id, "skill");
      addGlobalId(out, globalIds, id, `${path}.id`);
      skillIds.add(id);
    }
    const domain = expectString(out, `${path}.domain`, row["domain"], true);
    if (domain && !SKILL_DOMAINS.has(domain as SkillDomain)) {
      out.error("UNKNOWN_ENUM", `${path}.domain`, `Unknown skill domain "${domain}".`);
    }
    expectString(out, `${path}.nameAr`, row["nameAr"], true);
    const prereqs = expectArray(out, `${path}.prereqSkillIds`, row["prereqSkillIds"], true) ?? [];
    const prereqIds = prereqs.filter((x): x is string => typeof x === "string");
    for (const dupe of duplicateStrings(prereqIds)) {
      out.error(
        "DUPLICATE_PREREQUISITE",
        `${path}.prereqSkillIds`,
        `Duplicate prerequisite "${dupe}".`,
      );
    }
    if (id && prereqIds.includes(id)) {
      out.error(
        "SELF_PREREQUISITE",
        `${path}.prereqSkillIds`,
        `Skill "${id}" lists itself as a prerequisite.`,
      );
    }
    for (const [j, prereq] of prereqIds.entries()) {
      checkId(out, `${path}.prereqSkillIds[${j}]`, prereq, "skill");
    }
    requireLevel(`${path}.learnerLevelHint`, row["learnerLevelHint"]);
    const band = row["vocabBandHint"];
    if (typeof band === "string" && !VOCAB_BANDS.has(band as VocabBand)) {
      out.error("UNKNOWN_ENUM", `${path}.vocabBandHint`, `Unknown vocab band "${band}".`);
    }
    const modality = row["modality"];
    if (Array.isArray(modality)) {
      modality.forEach((m, j) => {
        if (typeof m !== "string" || !MODALITIES.has(m as SkillModality)) {
          out.error("UNKNOWN_ENUM", `${path}.modality[${j}]`, `Unknown modality "${String(m)}".`);
        }
      });
    }
  });

  letters.forEach((row, i) => {
    const path = `letters[${i}]`;
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", path, "Letter must be an object.");
      return;
    }
    const id = expectString(out, `${path}.id`, row["id"], true);
    if (id) {
      checkId(out, `${path}.id`, id, "letter");
      addGlobalId(out, globalIds, id, `${path}.id`);
      letterIds.add(id);
    }
    expectString(out, `${path}.char`, row["char"], true);
    expectString(out, `${path}.nameAr`, row["nameAr"], true);
    if (!isRecord(row["forms"])) {
      out.error("MISSING_FIELD", `${path}.forms`, "Letter forms are required.");
    } else {
      for (const form of ["isolated", "initial", "medial", "final"] as const) {
        expectString(out, `${path}.forms.${form}`, row["forms"][form], true);
      }
    }
    const legacyId = row["legacyId"];
    if (typeof legacyId === "string" && id) {
      const prev = letterLegacy.get(legacyId);
      if (prev)
        out.error(
          "DUPLICATE_ID",
          `${path}.legacyId`,
          `Duplicate letter legacyId "${legacyId}" (also ${prev}).`,
        );
      letterLegacy.set(legacyId, `${path}.legacyId`);
    }
    if (id) letterNonConnecting.set(id, row["nonConnecting"] === true);
  });

  words.forEach((row, i) => {
    const path = `words[${i}]`;
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", path, "Word must be an object.");
      return;
    }
    const id = expectString(out, `${path}.id`, row["id"], true);
    if (id) {
      checkId(out, `${path}.id`, id, "word");
      addGlobalId(out, globalIds, id, `${path}.id`);
      wordIds.add(id);
    }
    expectString(out, `${path}.lemma`, row["lemma"], true);
    expectString(out, `${path}.diacritized`, row["diacritized"], true);
    if (row["teachingForm"] !== undefined) {
      expectString(out, `${path}.teachingForm`, row["teachingForm"], true);
    }
    requireLevel(`${path}.learnerLevel`, row["learnerLevel"]);
    if (row["difficulty"] !== undefined && !isContentDifficulty(row["difficulty"])) {
      out.error("UNKNOWN_ENUM", `${path}.difficulty`, "Word difficulty must be 1, 2, or 3.");
    }
    if (typeof row["msaStatus"] === "string" && !MSA_STATUSES.has(row["msaStatus"] as MsaStatus)) {
      out.error("UNKNOWN_ENUM", `${path}.msaStatus`, `Unknown msaStatus "${row["msaStatus"]}".`);
    }
    if (
      typeof row["curriculumAction"] === "string" &&
      !CURRICULUM_ACTIONS.has(row["curriculumAction"] as CurriculumAction)
    ) {
      out.error(
        "UNKNOWN_ENUM",
        `${path}.curriculumAction`,
        `Unknown curriculumAction "${row["curriculumAction"]}".`,
      );
    }
    if (typeof row["vocabBand"] === "string" && !VOCAB_BANDS.has(row["vocabBand"] as VocabBand)) {
      out.error("UNKNOWN_ENUM", `${path}.vocabBand`, `Unknown vocabBand "${row["vocabBand"]}".`);
    }
    const subBand = row["subBand"];
    if (subBand !== undefined) {
      if (subBand !== "A1" && subBand !== "A2" && subBand !== "A3" && subBand !== "A4") {
        out.error("UNKNOWN_ENUM", `${path}.subBand`, `Unknown subBand "${String(subBand)}".`);
      }
    }
    if (
      typeof row["frequencyBand"] === "string" &&
      !FREQUENCY_BANDS.has(row["frequencyBand"] as FrequencyBand)
    ) {
      out.error(
        "UNKNOWN_ENUM",
        `${path}.frequencyBand`,
        `Unknown frequencyBand "${row["frequencyBand"]}".`,
      );
    }
    const legacyId = row["legacyId"];
    if (typeof legacyId === "string" && id) {
      const prev = wordLegacy.get(legacyId);
      if (prev)
        out.error(
          "DUPLICATE_ID",
          `${path}.legacyId`,
          `Duplicate word legacyId "${legacyId}" (also ${prev}).`,
        );
      wordLegacy.set(legacyId, `${path}.legacyId`);
    }
    if (id) {
      const forms = parseLetterFormRefs(out, `${path}.requiredLetterForms`, row["requiredLetterForms"]);
      for (const ref of forms) {
        checkId(out, `${path}.requiredLetterForms`, ref.letterId, "letter");
        checkImpossibleForm(out, `${path}.requiredLetterForms`, ref.letterId, ref.form, letterNonConnecting);
      }
      wordFormReqs.set(id, forms);
    }
  });

  sentences.forEach((row, i) => {
    const path = `sentences[${i}]`;
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", path, "Sentence must be an object.");
      return;
    }
    const id = expectString(out, `${path}.id`, row["id"], true);
    if (id) {
      checkId(out, `${path}.id`, id, "sentence");
      addGlobalId(out, globalIds, id, `${path}.id`);
      sentenceIds.add(id);
    }
    expectString(out, `${path}.diacritized`, row["diacritized"], true);
    const wordRefs = expectArray(out, `${path}.wordIds`, row["wordIds"], true) ?? [];
    if (wordRefs.length === 0) {
      out.error("MISSING_FIELD", `${path}.wordIds`, "Sentence must reference at least one word.");
    }
    requireLevel(`${path}.learnerLevel`, row["learnerLevel"]);
  });

  const validateReading = (
    row: Record<string, unknown>,
    path: string,
    kind: "story" | "informational",
    idNamespace: CurriculumIdNamespace,
  ) => {
    const id = expectString(out, `${path}.id`, row["id"], true);
    if (id) {
      checkId(out, `${path}.id`, id, idNamespace);
      addGlobalId(out, globalIds, id, `${path}.id`);
    }
    if (row["kind"] !== kind) {
      out.error("INVALID_STRUCTURE", `${path}.kind`, `Expected kind "${kind}".`);
    }
    expectString(out, `${path}.titleAr`, row["titleAr"], true);
    requireLevel(`${path}.learnerLevel`, row["learnerLevel"]);
    if (row["learnerLevel"] === undefined) {
      out.error("MISSING_FIELD", `${path}.learnerLevel`, "learnerLevel is required.");
    }
    const pages = expectArray(out, `${path}.pages`, row["pages"], true) ?? [];
    if (pages.length === 0) {
      out.error("MISSING_FIELD", `${path}.pages`, "At least one page is required.");
    }
    const pageIds = new Set<string>();
    pages.forEach((page, j) => {
      if (!isRecord(page)) {
        out.error("INVALID_STRUCTURE", `${path}.pages[${j}]`, "Page must be an object.");
        return;
      }
      const pageId = expectString(out, `${path}.pages[${j}].id`, page["id"], true);
      if (pageId) {
        if (pageIds.has(pageId)) {
          out.error("DUPLICATE_ID", `${path}.pages[${j}].id`, `Duplicate page id "${pageId}".`);
        }
        pageIds.add(pageId);
      }
      expectString(out, `${path}.pages[${j}].sentenceId`, page["sentenceId"], true);
    });
    const comprehension = row["comprehension"];
    if (Array.isArray(comprehension)) {
      comprehension.forEach((item, j) => {
        if (!isRecord(item)) return;
        expectString(out, `${path}.comprehension[${j}].id`, item["id"], true);
        const type = expectString(out, `${path}.comprehension[${j}].type`, item["type"], true);
        if (type && !COMPREHENSION_TYPES.has(type as ComprehensionType)) {
          out.error(
            "UNKNOWN_ENUM",
            `${path}.comprehension[${j}].type`,
            `Unknown comprehension type "${type}".`,
          );
        }
        expectString(out, `${path}.comprehension[${j}].promptAr`, item["promptAr"], true);
      });
    }
  };

  stories.forEach((row, i) => {
    const path = `stories[${i}]`;
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", path, "Story must be an object.");
      return;
    }
    validateReading(row, path, "story", "story");
  });

  informationalTexts.forEach((row, i) => {
    const path = `informationalTexts[${i}]`;
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", path, "Informational text must be an object.");
      return;
    }
    expectString(out, `${path}.topic`, row["topic"], true);
    validateReading(row, path, "informational", "text");
  });

  exercises.forEach((row, i) => {
    const path = `exercises[${i}]`;
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", path, "Exercise must be an object.");
      return;
    }
    const id = expectString(out, `${path}.id`, row["id"], true);
    if (id) {
      checkId(out, `${path}.id`, id, "exercise");
      addGlobalId(out, globalIds, id, `${path}.id`);
      exerciseIds.add(id);
    }
    const type = expectString(out, `${path}.type`, row["type"], true);
    if (type && !EXERCISE_TYPES.has(type as ExerciseType)) {
      out.error("UNKNOWN_ENUM", `${path}.type`, `Unknown exercise type "${type}".`);
    }
    const skillRefs = expectArray(out, `${path}.skillIds`, row["skillIds"], true) ?? [];
    if (skillRefs.length === 0) {
      out.error("MISSING_FIELD", `${path}.skillIds`, "Exercise must declare at least one skill.");
    }
    expectArray(out, `${path}.contentIds`, row["contentIds"], true);
    const difficulty = expectString(out, `${path}.difficulty`, row["difficulty"], true);
    if (difficulty && !EXERCISE_DIFFICULTIES.has(difficulty as ExerciseDifficulty)) {
      out.error("UNKNOWN_ENUM", `${path}.difficulty`, `Unknown difficulty "${difficulty}".`);
    }
    if (!isRecord(row["success"])) {
      out.error("MISSING_FIELD", `${path}.success`, "success is required.");
    } else {
      const successType = expectString(out, `${path}.success.type`, row["success"]["type"], true);
      if (successType && !SUCCESS_TYPES.has(successType as SuccessType)) {
        out.error("UNKNOWN_ENUM", `${path}.success.type`, `Unknown success type "${successType}".`);
      }
    }
    const prereqs = row["prereqSkillIds"];
    if (Array.isArray(prereqs)) {
      const ids = prereqs.filter((x): x is string => typeof x === "string");
      for (const dupe of duplicateStrings(ids)) {
        out.error(
          "DUPLICATE_PREREQUISITE",
          `${path}.prereqSkillIds`,
          `Duplicate prerequisite "${dupe}".`,
        );
      }
      if (id && ids.includes(id)) {
        out.error(
          "SELF_PREREQUISITE",
          `${path}.prereqSkillIds`,
          `Exercise "${id}" lists itself as a prerequisite.`,
        );
      }
    }
    const targets = row["masteryTargets"];
    if (Array.isArray(targets)) {
      targets.forEach((target, j) => {
        if (!isRecord(target)) {
          out.error("INVALID_STRUCTURE", `${path}.masteryTargets[${j}]`, "Mastery target must be an object.");
          return;
        }
        const targetId = expectString(out, `${path}.masteryTargets[${j}].id`, target["id"], true);
        if (targetId) checkId(out, `${path}.masteryTargets[${j}].id`, targetId, "mastery");
        const skillId = expectString(out, `${path}.masteryTargets[${j}].skillId`, target["skillId"], true);
        if (skillId) checkId(out, `${path}.masteryTargets[${j}].skillId`, skillId, "skill");
        const letterForm = target["letterForm"];
        if (letterForm !== undefined) {
          if (typeof letterForm !== "string" || !LETTER_FORM_SLOTS.has(letterForm)) {
            out.error(
              "UNKNOWN_ENUM",
              `${path}.masteryTargets[${j}].letterForm`,
              `Unknown letter form "${String(letterForm)}".`,
            );
          }
        }
        if (typeof target["letterId"] === "string" && typeof letterForm === "string") {
          checkImpossibleForm(
            out,
            `${path}.masteryTargets[${j}].letterForm`,
            target["letterId"],
            letterForm,
            letterNonConnecting,
          );
        }
        if (targetId) {
          const meaning = JSON.stringify({
            skillId: target["skillId"] ?? "",
            letterId: target["letterId"] ?? "",
            letterForm: target["letterForm"] ?? "",
            syllableId: target["syllableId"] ?? "",
            wordId: target["wordId"] ?? "",
          });
          const prev = masteryTargetMeanings.get(targetId);
          if (prev && prev !== meaning) {
            out.error(
              "DUPLICATE_ID",
              `${path}.masteryTargets[${j}].id`,
              `Mastery target "${targetId}" is reused with a different skill/item payload.`,
            );
          } else {
            masteryTargetMeanings.set(targetId, meaning);
          }
        }
      });
    }
  });

  assets.forEach((row, i) => {
    const path = `assets[${i}]`;
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", path, "Asset must be an object.");
      return;
    }
    const id = expectString(out, `${path}.id`, row["id"], true);
    const kind = expectString(out, `${path}.kind`, row["kind"], true);
    if (id) {
      const expectedNs: CurriculumIdNamespace | undefined =
        kind === "audio" || kind === "image" || kind === "trace" ? kind : undefined;
      checkId(out, `${path}.id`, id, expectedNs);
      addGlobalId(out, globalIds, id, `${path}.id`);
      assetIds.add(id);
    }
    if (kind && !ASSET_KINDS.has(kind as AssetKind)) {
      out.error("UNKNOWN_ENUM", `${path}.kind`, `Unknown asset kind "${kind}".`);
    }
  });

  const unitPrereqEdges = new Map<string, string[]>();
  const unitLetterIds = new Map<string, string[]>();
  const unitSkillIds = new Map<string, string[]>();
  const unitWordIds = new Map<string, string[]>();
  const unitSyllableIds = new Map<string, string[]>();

  syllables.forEach((row, i) => {
    const path = `syllables[${i}]`;
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", path, "Syllable must be an object.");
      return;
    }
    const id = expectString(out, `${path}.id`, row["id"], true);
    if (id) {
      checkId(out, `${path}.id`, id, "syllable");
      addGlobalId(out, globalIds, id, `${path}.id`);
      syllableIds.add(id);
    }
    expectString(out, `${path}.text`, row["text"], true);
    const letterId = expectString(out, `${path}.letterId`, row["letterId"], true);
    if (letterId) checkId(out, `${path}.letterId`, letterId, "letter");
    const vowelSkillId = expectString(out, `${path}.vowelSkillId`, row["vowelSkillId"], true);
    if (vowelSkillId) checkId(out, `${path}.vowelSkillId`, vowelSkillId, "skill");
    if (vowelSkillId && !vowelSkillId.startsWith("skill.short_vowel.")) {
      out.error(
        "INVALID_TYPE",
        `${path}.vowelSkillId`,
        `Syllable vowelSkillId must be a short-vowel skill, got "${vowelSkillId}".`,
      );
    }
    const pattern = expectString(out, `${path}.pattern`, row["pattern"], true);
    if (pattern && !SYLLABLE_PATTERNS.has(pattern)) {
      out.error("UNKNOWN_ENUM", `${path}.pattern`, `Unknown syllable pattern "${pattern}".`);
    }
    const requiredSkills =
      expectArray(out, `${path}.requiredSkillIds`, row["requiredSkillIds"], true) ?? [];
    requiredSkills.forEach((idRef, j) => {
      if (typeof idRef === "string") checkId(out, `${path}.requiredSkillIds[${j}]`, idRef, "skill");
    });
    const requiredLetters = row["requiredLetterIds"];
    if (Array.isArray(requiredLetters)) {
      requiredLetters.forEach((idRef, j) => {
        if (typeof idRef === "string")
          checkId(out, `${path}.requiredLetterIds[${j}]`, idRef, "letter");
      });
    }
    const letterForm = row["letterForm"];
    if (letterForm !== undefined) {
      if (typeof letterForm !== "string" || !LETTER_FORM_SLOTS.has(letterForm)) {
        out.error("UNKNOWN_ENUM", `${path}.letterForm`, `Unknown letter form "${String(letterForm)}".`);
      } else if (letterId) {
        checkImpossibleForm(out, `${path}.letterForm`, letterId, letterForm, letterNonConnecting);
      }
    }
  });

  units.forEach((row, i) => {
    const path = `units[${i}]`;
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", path, "Learning unit must be an object.");
      return;
    }
    const id = expectString(out, `${path}.id`, row["id"], true);
    if (id) {
      checkId(out, `${path}.id`, id, "unit");
      addGlobalId(out, globalIds, id, `${path}.id`);
      unitIds.add(id);
    }
    const order = expectInteger(out, `${path}.order`, row["order"], true);
    if (order !== undefined && order < 1) {
      out.error("INVALID_TYPE", `${path}.order`, "Unit order must be >= 1.");
    }
    expectString(out, `${path}.titleAr`, row["titleAr"], true);
    requireLevel(`${path}.learnerLevel`, row["learnerLevel"]);

    const skillRefs = expectArray(out, `${path}.skillIds`, row["skillIds"], true) ?? [];
    if (skillRefs.length === 0) {
      out.error("MISSING_FIELD", `${path}.skillIds`, "Unit must declare at least one skill.");
    }
    const prereqs = expectArray(out, `${path}.prereqUnitIds`, row["prereqUnitIds"], true) ?? [];
    const prereqIds = prereqs.filter((x): x is string => typeof x === "string");
    for (const dupe of duplicateStrings(prereqIds)) {
      out.error(
        "DUPLICATE_PREREQUISITE",
        `${path}.prereqUnitIds`,
        `Duplicate prerequisite "${dupe}".`,
      );
    }
    if (id && prereqIds.includes(id)) {
      out.error(
        "SELF_PREREQUISITE",
        `${path}.prereqUnitIds`,
        `Unit "${id}" lists itself as a prerequisite.`,
      );
    }
    for (const [j, prereq] of prereqIds.entries()) {
      checkId(out, `${path}.prereqUnitIds[${j}]`, prereq, "unit");
    }
    if (id) {
      unitPrereqEdges.set(id, prereqIds);
      unitSkillIds.set(id, skillRefs.filter((x): x is string => typeof x === "string"));
      unitLetterIds.set(
        id,
        (Array.isArray(row["letterIds"]) ? row["letterIds"] : []).filter(
          (x): x is string => typeof x === "string",
        ),
      );
      unitWordIds.set(
        id,
        (Array.isArray(row["wordIds"]) ? row["wordIds"] : []).filter(
          (x): x is string => typeof x === "string",
        ),
      );
      unitSyllableIds.set(
        id,
        (Array.isArray(row["syllableIds"]) ? row["syllableIds"] : []).filter(
          (x): x is string => typeof x === "string",
        ),
      );
      const taughtForms = parseLetterFormRefs(out, `${path}.letterForms`, row["letterForms"]);
      for (const ref of taughtForms) {
        checkId(out, `${path}.letterForms`, ref.letterId, "letter");
        checkImpossibleForm(out, `${path}.letterForms`, ref.letterId, ref.form, letterNonConnecting);
      }
      unitFormKeys.set(
        id,
        taughtForms.map((ref) => formKey(ref.letterId, ref.form)),
      );
      const exIds = (Array.isArray(row["exerciseIds"]) ? row["exerciseIds"] : []).filter(
        (x): x is string => typeof x === "string",
      );
      for (const exId of exIds) exercisesInUnits.add(exId);
    }

    if (!isRecord(row["mastery"])) {
      out.error("MISSING_FIELD", `${path}.mastery`, "Unit mastery criteria are required.");
    } else {
      const masteryPath = `${path}.mastery`;
      const minAttempts = expectInteger(
        out,
        `${masteryPath}.minAttempts`,
        row["mastery"]["minAttempts"],
        true,
      );
      if (minAttempts !== undefined && minAttempts < 1) {
        out.error("INVALID_TYPE", `${masteryPath}.minAttempts`, "minAttempts must be >= 1.");
      }
      const minAccuracy = expectNumber(
        out,
        `${masteryPath}.minAccuracy`,
        row["mastery"]["minAccuracy"],
        true,
      );
      if (minAccuracy !== undefined && (minAccuracy < 0 || minAccuracy > 1)) {
        out.error("INVALID_TYPE", `${masteryPath}.minAccuracy`, "minAccuracy must be between 0 and 1.");
      }
    }
  });

  const unitOrders = new Map<number, string>();
  units.forEach((row, i) => {
    if (!isRecord(row)) return;
    const order = row["order"];
    const id = row["id"];
    if (typeof order === "number" && typeof id === "string") {
      const prev = unitOrders.get(order);
      if (prev) {
        out.error(
          "DUPLICATE_ID",
          `units[${i}].order`,
          `Duplicate unit order ${order} (also unit "${prev}").`,
        );
      } else {
        unitOrders.set(order, id);
      }
    }
  });

  paths.forEach((row, i) => {
    const path = `paths[${i}]`;
    if (!isRecord(row)) {
      out.error("INVALID_STRUCTURE", path, "Learning path must be an object.");
      return;
    }
    const id = expectString(out, `${path}.id`, row["id"], true);
    if (id) {
      checkId(out, `${path}.id`, id, "path");
      addGlobalId(out, globalIds, id, `${path}.id`);
    }
    expectString(out, `${path}.titleAr`, row["titleAr"], true);
    requireLevel(`${path}.learnerLevel`, row["learnerLevel"]);
    const unitRefs = expectArray(out, `${path}.unitIds`, row["unitIds"], true) ?? [];
    if (unitRefs.length === 0) {
      out.error("MISSING_FIELD", `${path}.unitIds`, "Path must list at least one unit.");
    }
    const ids = unitRefs.filter((x): x is string => typeof x === "string");
    for (const dupe of duplicateStrings(ids)) {
      out.error("DUPLICATE_ID", `${path}.unitIds`, `Duplicate unit "${dupe}" on the path.`);
    }
    ids.forEach((unitId, j) => checkId(out, `${path}.unitIds[${j}]`, unitId, "unit"));
  });

  if (units.length > 0 && paths.length === 0) {
    out.error("MISSING_FIELD", "paths", "Learning units require at least one path.");
  }

  if (exercisesInUnits.size > 0) {
    exercises.forEach((row, i) => {
      if (!isRecord(row) || typeof row["id"] !== "string") return;
      if (!exercisesInUnits.has(row["id"])) return;
      const targets = row["masteryTargets"];
      if (!Array.isArray(targets) || targets.length === 0) {
        out.error(
          "MISSING_MASTERY_TARGET",
          `exercises[${i}].masteryTargets`,
          `Exercise "${row["id"]}" is used on a learning path and must declare a machine-readable mastery target.`,
        );
      }
    });
  }

  const missing = (code: string, path: string, id: string, kind: string) => {
    out.error(code, path, `Missing ${kind} "${id}".`);
  };

  const resolveSkill = (path: string, id: string) => {
    if (typeof id !== "string") return;
    if (!skillIds.has(id)) missing("MISSING_SKILL", path, id, "skill");
  };
  const resolveWord = (path: string, id: string) => {
    if (typeof id !== "string") return;
    if (!wordIds.has(id)) missing("MISSING_WORD", path, id, "word");
  };
  const resolveLetter = (path: string, id: string) => {
    if (typeof id !== "string") return;
    if (!letterIds.has(id)) missing("MISSING_LETTER", path, id, "letter");
  };
  const resolveSentence = (path: string, id: string) => {
    if (typeof id !== "string") return;
    if (!sentenceIds.has(id)) missing("MISSING_SENTENCE", path, id, "sentence");
  };
  const resolveAsset = (path: string, id: unknown) => {
    if (typeof id !== "string") return;
    const parsed = parseCurriculumId(id);
    if (
      !parsed ||
      (parsed.namespace !== "audio" && parsed.namespace !== "image" && parsed.namespace !== "trace")
    ) {
      return;
    }
    if (!assetIds.has(id)) missing("MISSING_ASSET", path, id, "asset");
  };
  const resolveSyllable = (path: string, id: string) => {
    if (typeof id !== "string") return;
    if (!syllableIds.has(id)) missing("MISSING_SYLLABLE", path, id, "syllable");
  };
  const resolveUnit = (path: string, id: string) => {
    if (typeof id !== "string") return;
    if (!unitIds.has(id)) missing("MISSING_UNIT", path, id, "unit");
  };
  const resolveExercise = (path: string, id: string) => {
    if (typeof id !== "string") return;
    if (!exerciseIds.has(id)) missing("MISSING_EXERCISE", path, id, "exercise");
  };
  const resolveReviewContent = (path: string, id: string) => {
    const parsed = parseCurriculumId(id);
    if (!parsed) {
      out.error("INVALID_ID_FORMAT", path, `Invalid content id "${id}".`);
      return;
    }
    if (parsed.namespace === "skill") resolveSkill(path, id);
    else if (parsed.namespace === "word") resolveWord(path, id);
    else if (parsed.namespace === "letter") resolveLetter(path, id);
    else if (parsed.namespace === "sentence") resolveSentence(path, id);
    else if (parsed.namespace === "syllable") resolveSyllable(path, id);
    else if (parsed.namespace === "exercise") resolveExercise(path, id);
    else if (
      parsed.namespace === "audio" ||
      parsed.namespace === "image" ||
      parsed.namespace === "trace"
    ) {
      resolveAsset(path, id);
    }
  };

  skills.forEach((row, i) => {
    if (!isRecord(row)) return;
    const prereqs = row["prereqSkillIds"];
    if (Array.isArray(prereqs)) {
      prereqs.forEach((id, j) => {
        if (typeof id === "string") resolveSkill(`skills[${i}].prereqSkillIds[${j}]`, id);
      });
    }
  });

  letters.forEach((row, i) => {
    if (!isRecord(row)) return;
    const path = `letters[${i}]`;
    (row["similarLetterIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveLetter(`${path}.similarLetterIds[${j}]`, id);
    });
    (row["exampleWordIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveWord(`${path}.exampleWordIds[${j}]`, id);
    });
    (row["requiredSkillIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveSkill(`${path}.requiredSkillIds[${j}]`, id);
    });
    (row["unlocksSkillIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveSkill(`${path}.unlocksSkillIds[${j}]`, id);
    });
    collectStringRefs(row["audioAssetIds"]).forEach((id) =>
      resolveAsset(`${path}.audioAssetIds`, id),
    );
    resolveAsset(`${path}.traceAssetId`, row["traceAssetId"]);
  });

  words.forEach((row, i) => {
    if (!isRecord(row)) return;
    const path = `words[${i}]`;
    (row["letterIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveLetter(`${path}.letterIds[${j}]`, id);
    });
    (row["requiredSkillIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveSkill(`${path}.requiredSkillIds[${j}]`, id);
    });
    (row["phonicsSkillIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveSkill(`${path}.phonicsSkillIds[${j}]`, id);
    });
    (row["requiredLetterForms"] as unknown[] | undefined)?.forEach((ref, j) => {
      if (isRecord(ref) && typeof ref["letterId"] === "string")
        resolveLetter(`${path}.requiredLetterForms[${j}].letterId`, ref["letterId"]);
    });
    resolveAsset(`${path}.imageAssetId`, row["imageAssetId"]);
    collectStringRefs(row["audioAssetIds"]).forEach((id) =>
      resolveAsset(`${path}.audioAssetIds`, id),
    );
  });

  sentences.forEach((row, i) => {
    if (!isRecord(row)) return;
    const path = `sentences[${i}]`;
    (row["wordIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveWord(`${path}.wordIds[${j}]`, id);
    });
    (row["targetSkillIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveSkill(`${path}.targetSkillIds[${j}]`, id);
    });
    (row["requiredSkillIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveSkill(`${path}.requiredSkillIds[${j}]`, id);
    });
    resolveAsset(`${path}.audioAssetId`, row["audioAssetId"]);
    resolveAsset(`${path}.imageAssetId`, row["imageAssetId"]);
  });

  const resolveReadingRefs = (row: Record<string, unknown>, path: string) => {
    (row["targetSkillIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveSkill(`${path}.targetSkillIds[${j}]`, id);
    });
    (row["vocabularyWordIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveWord(`${path}.vocabularyWordIds[${j}]`, id);
    });
    (row["newWordIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveWord(`${path}.newWordIds[${j}]`, id);
    });
    (row["recycledWordIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveWord(`${path}.recycledWordIds[${j}]`, id);
    });
    resolveAsset(`${path}.coverAssetId`, row["coverAssetId"]);
    resolveAsset(`${path}.audioAssetId`, row["audioAssetId"]);
    const pages = row["pages"];
    if (Array.isArray(pages)) {
      pages.forEach((page, j) => {
        if (!isRecord(page)) return;
        if (typeof page["sentenceId"] === "string")
          resolveSentence(`${path}.pages[${j}].sentenceId`, page["sentenceId"]);
        resolveAsset(`${path}.pages[${j}].imageAssetId`, page["imageAssetId"]);
        resolveAsset(`${path}.pages[${j}].audioAssetId`, page["audioAssetId"]);
      });
    }
    const comprehension = row["comprehension"];
    if (Array.isArray(comprehension)) {
      comprehension.forEach((item, j) => {
        if (!isRecord(item)) return;
        (item["choiceWordIds"] as unknown[] | undefined)?.forEach((id, k) => {
          if (typeof id === "string")
            resolveWord(`${path}.comprehension[${j}].choiceWordIds[${k}]`, id);
        });
        if (typeof item["correctWordId"] === "string")
          resolveWord(`${path}.comprehension[${j}].correctWordId`, item["correctWordId"]);
        (item["choiceAssetIds"] as unknown[] | undefined)?.forEach((id, k) =>
          resolveAsset(`${path}.comprehension[${j}].choiceAssetIds[${k}]`, id),
        );
        resolveAsset(`${path}.comprehension[${j}].correctAssetId`, item["correctAssetId"]);
      });
    }
  };

  stories.forEach((row, i) => {
    if (isRecord(row)) resolveReadingRefs(row, `stories[${i}]`);
  });
  informationalTexts.forEach((row, i) => {
    if (isRecord(row)) resolveReadingRefs(row, `informationalTexts[${i}]`);
  });

  exercises.forEach((row, i) => {
    if (!isRecord(row)) return;
    const path = `exercises[${i}]`;
    (row["skillIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveSkill(`${path}.skillIds[${j}]`, id);
    });
    (row["prereqSkillIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveSkill(`${path}.prereqSkillIds[${j}]`, id);
    });
    (row["contentIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id !== "string") return;
      const parsed = parseCurriculumId(id);
      if (!parsed) {
        out.error("INVALID_ID_FORMAT", `${path}.contentIds[${j}]`, `Invalid content id "${id}".`);
        return;
      }
      if (parsed.namespace === "skill") resolveSkill(`${path}.contentIds[${j}]`, id);
      if (parsed.namespace === "word") resolveWord(`${path}.contentIds[${j}]`, id);
      if (parsed.namespace === "letter") resolveLetter(`${path}.contentIds[${j}]`, id);
      if (parsed.namespace === "sentence") resolveSentence(`${path}.contentIds[${j}]`, id);
      if (parsed.namespace === "syllable") resolveSyllable(`${path}.contentIds[${j}]`, id);
      if (
        parsed.namespace === "audio" ||
        parsed.namespace === "image" ||
        parsed.namespace === "trace"
      ) {
        resolveAsset(`${path}.contentIds[${j}]`, id);
      }
    });
    resolveAsset(`${path}.promptAssetId`, row["promptAssetId"]);
    const masteryTargets = row["masteryTargets"];
    if (Array.isArray(masteryTargets)) {
      masteryTargets.forEach((target, j) => {
        if (!isRecord(target)) return;
        if (typeof target["skillId"] === "string")
          resolveSkill(`${path}.masteryTargets[${j}].skillId`, target["skillId"]);
        if (typeof target["letterId"] === "string")
          resolveLetter(`${path}.masteryTargets[${j}].letterId`, target["letterId"]);
        if (typeof target["syllableId"] === "string")
          resolveSyllable(`${path}.masteryTargets[${j}].syllableId`, target["syllableId"]);
        if (typeof target["wordId"] === "string")
          resolveWord(`${path}.masteryTargets[${j}].wordId`, target["wordId"]);
      });
    }
    const choices = row["choices"];
    if (Array.isArray(choices)) {
      choices.forEach((choice, j) => {
        if (!isRecord(choice)) return;
        resolveAsset(`${path}.choices[${j}].assetId`, choice["assetId"]);
        if (typeof choice["id"] !== "string") return;
        const parsed = parseCurriculumId(choice["id"]);
        if (parsed?.namespace === "syllable") resolveSyllable(`${path}.choices[${j}].id`, choice["id"]);
        if (parsed?.namespace === "letter") resolveLetter(`${path}.choices[${j}].id`, choice["id"]);
        if (parsed?.namespace === "word") resolveWord(`${path}.choices[${j}].id`, choice["id"]);
      });
    }
    if (row["type"] === "syllable_blending") {
      const success = isRecord(row["success"]) ? row["success"] : undefined;
      const correctId = success && typeof success["correctChoiceId"] === "string" ? success["correctChoiceId"] : undefined;
      if (correctId) {
        const parsed = parseCurriculumId(correctId);
        if (parsed?.namespace === "syllable") resolveSyllable(`${path}.success.correctChoiceId`, correctId);
      }
      const hasSyllableContent = (Array.isArray(row["contentIds"]) ? row["contentIds"] : []).some(
        (id) => typeof id === "string" && id.startsWith("syllable."),
      );
      const targetSyllableIds = Array.isArray(row["masteryTargets"])
        ? row["masteryTargets"].flatMap((target) =>
            isRecord(target) && typeof target["syllableId"] === "string" ? [target["syllableId"]] : [],
          )
        : [];
      const hasSyllableTarget = targetSyllableIds.length > 0;
      if (!hasSyllableContent && !hasSyllableTarget && !correctId) {
        out.error(
          "MISSING_FIELD",
          `${path}.contentIds`,
          "syllable_blending exercise must reference a syllable.",
        );
      }
      if (correctId && Array.isArray(choices) && choices.length > 0) {
        const choiceIds = choices.flatMap((choice) =>
          isRecord(choice) && typeof choice["id"] === "string" ? [choice["id"]] : [],
        );
        if (!choiceIds.includes(correctId)) {
          out.error(
            "MISSING_FIELD",
            `${path}.success.correctChoiceId`,
            `syllable_blending correctChoiceId "${correctId}" is not listed in choices.`,
          );
        }
      }
      if (correctId?.startsWith("syllable.") && hasSyllableTarget && !targetSyllableIds.includes(correctId)) {
        out.error(
          "MISSING_MASTERY_TARGET",
          `${path}.masteryTargets`,
          `syllable_blending exercise does not score its correct syllable "${correctId}".`,
        );
      }
    }
    if (row["type"] === "letter_recognition") {
      const success = isRecord(row["success"]) ? row["success"] : undefined;
      const correctId = success && typeof success["correctChoiceId"] === "string" ? success["correctChoiceId"] : undefined;
      if (correctId) {
        const parsed = parseCurriculumId(correctId);
        if (parsed?.namespace === "letter") resolveLetter(`${path}.success.correctChoiceId`, correctId);
      }
      const config = isRecord(row["config"]) ? row["config"] : undefined;
      const configLetterId = config && typeof config["letterId"] === "string" ? config["letterId"] : undefined;
      if (configLetterId) resolveLetter(`${path}.config.letterId`, configLetterId);
      const configForm = config && typeof config["targetForm"] === "string" ? config["targetForm"] : undefined;
      if (configForm && !LETTER_FORM_SLOTS.has(configForm)) {
        out.error("UNKNOWN_ENUM", `${path}.config.targetForm`, `Unknown letter form "${configForm}".`);
      }
      const targetLetterId =
        configLetterId ??
        (Array.isArray(row["masteryTargets"])
          ? row["masteryTargets"].flatMap((target) =>
              isRecord(target) && typeof target["letterId"] === "string" ? [target["letterId"]] : [],
            )[0]
          : undefined) ??
        (correctId?.startsWith("letter.") ? correctId : undefined);
      const targetForm =
        configForm ??
        (Array.isArray(row["masteryTargets"])
          ? row["masteryTargets"].flatMap((target) =>
              isRecord(target) && typeof target["letterForm"] === "string" ? [target["letterForm"]] : [],
            )[0]
          : undefined);
      if (!targetLetterId) {
        out.error(
          "MISSING_FIELD",
          `${path}.config.letterId`,
          "letter_recognition exercise must reference a letter.",
        );
      }
      if (targetLetterId && targetForm && LETTER_FORM_SLOTS.has(targetForm)) {
        checkImpossibleForm(out, `${path}.config.targetForm`, targetLetterId, targetForm, letterNonConnecting);
      }
      if (correctId && Array.isArray(choices) && choices.length > 0) {
        const choiceIds = choices.flatMap((choice) =>
          isRecord(choice) && typeof choice["id"] === "string" ? [choice["id"]] : [],
        );
        if (!choiceIds.includes(correctId)) {
          out.error(
            "MISSING_FIELD",
            `${path}.success.correctChoiceId`,
            `letter_recognition correctChoiceId "${correctId}" is not listed in choices.`,
          );
        }
      }
    }
    if (row["type"] === "audio_to_word") {
      const success = isRecord(row["success"]) ? row["success"] : undefined;
      const correctId = success && typeof success["correctChoiceId"] === "string" ? success["correctChoiceId"] : undefined;
      if (correctId) {
        const parsed = parseCurriculumId(correctId);
        if (parsed?.namespace === "word") resolveWord(`${path}.success.correctChoiceId`, correctId);
      }
      const contentWordIds = (Array.isArray(row["contentIds"]) ? row["contentIds"] : []).filter(
        (id): id is string => typeof id === "string" && id.startsWith("word."),
      );
      const targetWordIds = Array.isArray(row["masteryTargets"])
        ? row["masteryTargets"].flatMap((target) =>
            isRecord(target) && typeof target["wordId"] === "string" ? [target["wordId"]] : [],
          )
        : [];
      const decodingWordIds = Array.isArray(row["masteryTargets"])
        ? row["masteryTargets"].flatMap((target) =>
            isRecord(target) &&
            target["skillId"] === "skill.word_decoding.simple" &&
            typeof target["wordId"] === "string"
              ? [target["wordId"]]
              : [],
          )
        : [];
      const hasDecodingWithoutWord = Array.isArray(row["masteryTargets"])
        ? row["masteryTargets"].some(
            (target) =>
              isRecord(target) &&
              target["skillId"] === "skill.word_decoding.simple" &&
              typeof target["wordId"] !== "string",
          )
        : false;
      const targetId =
        (correctId?.startsWith("word.") ? correctId : undefined) ??
        targetWordIds[0] ??
        contentWordIds[0];
      if (!targetId) {
        out.error(
          "MISSING_FIELD",
          `${path}.success.correctChoiceId`,
          "audio_to_word exercise must reference a playable target word.",
        );
      }
      if (hasDecodingWithoutWord) {
        out.error(
          "MISSING_FIELD",
          `${path}.masteryTargets`,
          "audio_to_word word-decoding mastery target must declare wordId.",
        );
      }
      if (correctId && Array.isArray(choices) && choices.length > 0) {
        const choiceIds = choices.flatMap((choice) =>
          isRecord(choice) && typeof choice["id"] === "string" ? [choice["id"]] : [],
        );
        if (!choiceIds.includes(correctId)) {
          out.error(
            "MISSING_FIELD",
            `${path}.success.correctChoiceId`,
            `audio_to_word correctChoiceId "${correctId}" is not listed in choices.`,
          );
        }
      }
      if (correctId?.startsWith("word.") && decodingWordIds.length > 0 && decodingWordIds.some((id) => id !== correctId)) {
        out.error(
          "MISSING_MASTERY_TARGET",
          `${path}.masteryTargets`,
          `audio_to_word word-decoding target does not match scored word "${correctId}".`,
        );
      }
      if (correctId?.startsWith("word.") && targetWordIds.length > 0 && !targetWordIds.includes(correctId)) {
        out.error(
          "MISSING_MASTERY_TARGET",
          `${path}.masteryTargets`,
          `audio_to_word exercise does not score its correct word "${correctId}".`,
        );
      }
    }
    if (row["type"] === "missing_haraka") {
      const success = isRecord(row["success"]) ? row["success"] : undefined;
      const correctId = success && typeof success["correctChoiceId"] === "string" ? success["correctChoiceId"] : undefined;
      if (correctId) {
        const parsed = parseCurriculumId(correctId);
        if (parsed?.namespace === "syllable") resolveSyllable(`${path}.success.correctChoiceId`, correctId);
      }
      const contentSyllableIds = (Array.isArray(row["contentIds"]) ? row["contentIds"] : []).filter(
        (id): id is string => typeof id === "string" && id.startsWith("syllable."),
      );
      const targetSyllableIds = Array.isArray(row["masteryTargets"])
        ? row["masteryTargets"].flatMap((target) =>
            isRecord(target) && typeof target["syllableId"] === "string" ? [target["syllableId"]] : [],
          )
        : [];
      const vowelTargetSkills = Array.isArray(row["masteryTargets"])
        ? row["masteryTargets"].flatMap((target) =>
            isRecord(target) && typeof target["skillId"] === "string" && target["skillId"].startsWith("skill.short_vowel.")
              ? [target["skillId"]]
              : [],
          )
        : [];
      const targetId =
        (correctId?.startsWith("syllable.") ? correctId : undefined) ??
        targetSyllableIds[0] ??
        contentSyllableIds[0];
      if (!targetId) {
        out.error(
          "MISSING_FIELD",
          `${path}.success.correctChoiceId`,
          "missing_haraka exercise must reference a playable target syllable.",
        );
      }
      const vowelOf = (id: string | undefined): string | undefined => {
        if (!id) return undefined;
        const found = syllables.find((item) => isRecord(item) && item["id"] === id);
        return isRecord(found) && typeof found["vowelSkillId"] === "string" ? found["vowelSkillId"] : undefined;
      };
      const targetVowel = vowelOf(targetId);
      if (targetId && !targetVowel) {
        out.error(
          "MISSING_FIELD",
          `${path}.success.correctChoiceId`,
          `missing_haraka target "${targetId}" has no short-vowel skill.`,
        );
      } else if (
        targetVowel &&
        targetVowel !== "skill.short_vowel.fatha" &&
        targetVowel !== "skill.short_vowel.kasra" &&
        targetVowel !== "skill.short_vowel.damma"
      ) {
        out.error(
          "UNKNOWN_ENUM",
          `${path}.success.correctChoiceId`,
          `missing_haraka target "${targetId}" uses unsupported vowel "${targetVowel}".`,
        );
      }
      if (correctId && Array.isArray(choices) && choices.length > 0) {
        const choiceIds = choices.flatMap((choice) =>
          isRecord(choice) && typeof choice["id"] === "string" ? [choice["id"]] : [],
        );
        if (!choiceIds.includes(correctId)) {
          out.error(
            "MISSING_FIELD",
            `${path}.success.correctChoiceId`,
            `missing_haraka correctChoiceId "${correctId}" is not listed in choices.`,
          );
        }
      }
      if (Array.isArray(choices)) {
        choices.forEach((choice, j) => {
          if (!isRecord(choice) || typeof choice["id"] !== "string") return;
          if (!choice["id"].startsWith("syllable.")) {
            out.error(
              "INVALID_TYPE",
              `${path}.choices[${j}].id`,
              `missing_haraka choice "${choice["id"]}" must be a syllable.`,
            );
            return;
          }
          const vowel = vowelOf(choice["id"]);
          if (
            vowel &&
            vowel !== "skill.short_vowel.fatha" &&
            vowel !== "skill.short_vowel.kasra" &&
            vowel !== "skill.short_vowel.damma"
          ) {
            out.error(
              "UNKNOWN_ENUM",
              `${path}.choices[${j}].id`,
              `missing_haraka choice "${choice["id"]}" is not a short-vowel haraka.`,
            );
          }
        });
      }
      if (targetVowel && vowelTargetSkills.length > 0 && vowelTargetSkills.some((id) => id !== targetVowel)) {
        out.error(
          "MISSING_MASTERY_TARGET",
          `${path}.masteryTargets`,
          `missing_haraka mastery skill does not match scored vowel "${targetVowel}".`,
        );
      }
      if (correctId?.startsWith("syllable.") && targetSyllableIds.length > 0 && !targetSyllableIds.includes(correctId)) {
        out.error(
          "MISSING_MASTERY_TARGET",
          `${path}.masteryTargets`,
          `missing_haraka exercise does not score its correct syllable "${correctId}".`,
        );
      }
    }
    if (row["type"] === "picture_to_word") {
      const success = isRecord(row["success"]) ? row["success"] : undefined;
      const correctId = success && typeof success["correctChoiceId"] === "string" ? success["correctChoiceId"] : undefined;
      if (correctId) {
        const parsed = parseCurriculumId(correctId);
        if (parsed?.namespace === "word") resolveWord(`${path}.success.correctChoiceId`, correctId);
      }
      const contentWordIds = (Array.isArray(row["contentIds"]) ? row["contentIds"] : []).filter(
        (id): id is string => typeof id === "string" && id.startsWith("word."),
      );
      const targetWordIds = Array.isArray(row["masteryTargets"])
        ? row["masteryTargets"].flatMap((target) =>
            isRecord(target) && typeof target["wordId"] === "string" ? [target["wordId"]] : [],
          )
        : [];
      const decodingWordIds = Array.isArray(row["masteryTargets"])
        ? row["masteryTargets"].flatMap((target) =>
            isRecord(target) &&
            target["skillId"] === "skill.word_decoding.simple" &&
            typeof target["wordId"] === "string"
              ? [target["wordId"]]
              : [],
          )
        : [];
      const targetId =
        (correctId?.startsWith("word.") ? correctId : undefined) ??
        targetWordIds[0] ??
        contentWordIds[0];
      if (!targetId) {
        out.error(
          "MISSING_FIELD",
          `${path}.success.correctChoiceId`,
          "picture_to_word exercise must reference a playable target word.",
        );
      }
      const promptId = row["promptAssetId"];
      const wordRow = words.find((item) => isRecord(item) && item["id"] === targetId);
      const wordImage = isRecord(wordRow) && typeof wordRow["imageAssetId"] === "string" ? wordRow["imageAssetId"] : undefined;
      const hasVisual =
        (typeof promptId === "string" && promptId.startsWith("image.")) || Boolean(wordImage);
      if (targetId && !hasVisual) {
        out.error(
          "MISSING_FIELD",
          `${path}.promptAssetId`,
          `picture_to_word "${row["id"]}" has no visual target (promptAssetId or word imageAssetId).`,
        );
      }
      if (typeof promptId === "string" && !promptId.startsWith("image.")) {
        out.error(
          "INVALID_TYPE",
          `${path}.promptAssetId`,
          "picture_to_word promptAssetId must be an image asset.",
        );
      }
      if (correctId && Array.isArray(choices) && choices.length > 0) {
        const choiceIds = choices.flatMap((choice) =>
          isRecord(choice) && typeof choice["id"] === "string" ? [choice["id"]] : [],
        );
        if (!choiceIds.includes(correctId)) {
          out.error(
            "MISSING_FIELD",
            `${path}.success.correctChoiceId`,
            `picture_to_word correctChoiceId "${correctId}" is not listed in choices.`,
          );
        }
      }
      if (correctId?.startsWith("word.") && decodingWordIds.length > 0 && decodingWordIds.some((id) => id !== correctId)) {
        out.error(
          "MISSING_MASTERY_TARGET",
          `${path}.masteryTargets`,
          `picture_to_word word-decoding target does not match scored word "${correctId}".`,
        );
      }
    }
    if (row["type"] === "word_to_picture") {
      const success = isRecord(row["success"]) ? row["success"] : undefined;
      const correctId = success && typeof success["correctChoiceId"] === "string" ? success["correctChoiceId"] : undefined;
      if (correctId) {
        const parsed = parseCurriculumId(correctId);
        if (parsed?.namespace === "word") resolveWord(`${path}.success.correctChoiceId`, correctId);
      }
      const contentWordIds = (Array.isArray(row["contentIds"]) ? row["contentIds"] : []).filter(
        (id): id is string => typeof id === "string" && id.startsWith("word."),
      );
      const targetWordIds = Array.isArray(row["masteryTargets"])
        ? row["masteryTargets"].flatMap((target) =>
            isRecord(target) && typeof target["wordId"] === "string" ? [target["wordId"]] : [],
          )
        : [];
      const decodingWordIds = Array.isArray(row["masteryTargets"])
        ? row["masteryTargets"].flatMap((target) =>
            isRecord(target) &&
            target["skillId"] === "skill.word_decoding.simple" &&
            typeof target["wordId"] === "string"
              ? [target["wordId"]]
              : [],
          )
        : [];
      const targetId =
        (correctId?.startsWith("word.") ? correctId : undefined) ??
        targetWordIds[0] ??
        contentWordIds[0];
      if (!targetId) {
        out.error(
          "MISSING_FIELD",
          `${path}.success.correctChoiceId`,
          "word_to_picture exercise must reference a playable target word.",
        );
      }
      if (correctId && Array.isArray(choices) && choices.length > 0) {
        const choiceIds = choices.flatMap((choice) =>
          isRecord(choice) && typeof choice["id"] === "string" ? [choice["id"]] : [],
        );
        if (!choiceIds.includes(correctId)) {
          out.error(
            "MISSING_FIELD",
            `${path}.success.correctChoiceId`,
            `word_to_picture correctChoiceId "${correctId}" is not listed in choices.`,
          );
        }
      }
      if (Array.isArray(choices)) {
        choices.forEach((choice, j) => {
          if (!isRecord(choice) || typeof choice["id"] !== "string") return;
          if (!choice["id"].startsWith("word.")) {
            out.error(
              "INVALID_TYPE",
              `${path}.choices[${j}].id`,
              `word_to_picture choice "${choice["id"]}" must be a word.`,
            );
            return;
          }
          const wordRow = words.find((item) => isRecord(item) && item["id"] === choice["id"]);
          const wordImage =
            isRecord(wordRow) && typeof wordRow["imageAssetId"] === "string" ? wordRow["imageAssetId"] : undefined;
          const choiceImage =
            typeof choice["assetId"] === "string" && choice["assetId"].startsWith("image.") ? choice["assetId"] : undefined;
          if (!choiceImage && !wordImage) {
            out.error(
              "MISSING_FIELD",
              `${path}.choices[${j}].assetId`,
              `word_to_picture choice "${choice["id"]}" has no visual target (choice assetId or word imageAssetId).`,
            );
          }
        });
      }
      if (correctId?.startsWith("word.") && decodingWordIds.length > 0 && decodingWordIds.some((id) => id !== correctId)) {
        out.error(
          "MISSING_MASTERY_TARGET",
          `${path}.masteryTargets`,
          `word_to_picture word-decoding target does not match scored word "${correctId}".`,
        );
      }
    }
    const evidence = row["masteryEvidence"];
    if (isRecord(evidence)) {
      for (const key of ["reading", "writing", "listening"] as const) {
        const ids = evidence[key];
        if (Array.isArray(ids)) {
          ids.forEach((id, j) => {
            if (typeof id === "string") resolveSkill(`${path}.masteryEvidence.${key}[${j}]`, id);
          });
        }
      }
    }
  });

  syllables.forEach((row, i) => {
    if (!isRecord(row)) return;
    const path = `syllables[${i}]`;
    if (typeof row["letterId"] === "string") resolveLetter(`${path}.letterId`, row["letterId"]);
    if (typeof row["vowelSkillId"] === "string")
      resolveSkill(`${path}.vowelSkillId`, row["vowelSkillId"]);
    (row["requiredSkillIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveSkill(`${path}.requiredSkillIds[${j}]`, id);
    });
    (row["requiredLetterIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveLetter(`${path}.requiredLetterIds[${j}]`, id);
    });
    resolveAsset(`${path}.audioAssetId`, row["audioAssetId"]);
  });

  units.forEach((row, i) => {
    if (!isRecord(row)) return;
    const path = `units[${i}]`;
    (row["skillIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveSkill(`${path}.skillIds[${j}]`, id);
    });
    (row["letterIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveLetter(`${path}.letterIds[${j}]`, id);
    });
    (row["letterForms"] as unknown[] | undefined)?.forEach((ref, j) => {
      if (isRecord(ref) && typeof ref["letterId"] === "string")
        resolveLetter(`${path}.letterForms[${j}].letterId`, ref["letterId"]);
    });
    (row["syllableIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveSyllable(`${path}.syllableIds[${j}]`, id);
    });
    (row["wordIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveWord(`${path}.wordIds[${j}]`, id);
    });
    (row["exerciseIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveExercise(`${path}.exerciseIds[${j}]`, id);
    });
    (row["prereqUnitIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveUnit(`${path}.prereqUnitIds[${j}]`, id);
    });
    (row["reviewContentIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id === "string") resolveReviewContent(`${path}.reviewContentIds[${j}]`, id);
    });
    if (isRecord(row["mastery"])) {
      (row["mastery"]["requiredSkillIds"] as unknown[] | undefined)?.forEach((id, j) => {
        if (typeof id === "string")
          resolveSkill(`${path}.mastery.requiredSkillIds[${j}]`, id);
      });
    }
  });

  const exerciseMeasuredSkills = new Map<string, Set<string>>();
  exercises.forEach((row) => {
    if (!isRecord(row) || typeof row["id"] !== "string") return;
    const measured = new Set<string>();
    const targets = row["masteryTargets"];
    if (Array.isArray(targets)) {
      for (const target of targets) {
        if (isRecord(target) && typeof target["skillId"] === "string") {
          measured.add(target["skillId"]);
        }
      }
    }
    exerciseMeasuredSkills.set(row["id"], measured);
  });
  units.forEach((row, i) => {
    if (!isRecord(row) || typeof row["id"] !== "string") return;
    if (!isRecord(row["mastery"])) return;
    const required = row["mastery"]["requiredSkillIds"];
    if (!Array.isArray(required) || required.length === 0) return;
    const measured = new Set<string>();
    const listed = Array.isArray(row["exerciseIds"]) ? row["exerciseIds"] : [];
    for (const exerciseId of listed) {
      if (typeof exerciseId !== "string") continue;
      for (const skillId of exerciseMeasuredSkills.get(exerciseId) ?? []) {
        measured.add(skillId);
      }
    }
    required.forEach((skillId, j) => {
      if (typeof skillId !== "string") return;
      if (measured.has(skillId)) return;
      out.error(
        "UNMAPPED_REQUIRED_SKILL",
        `units[${i}].mastery.requiredSkillIds[${j}]`,
        `Unit "${row["id"]}" requires skill "${skillId}" but no exercise mastery target in this unit measures it.`,
      );
    });
  });

  const unitsOnAPath = new Set<string>();
  paths.forEach((row, i) => {
    if (!isRecord(row)) return;
    const path = `paths[${i}]`;
    (row["unitIds"] as unknown[] | undefined)?.forEach((id, j) => {
      if (typeof id !== "string") return;
      resolveUnit(`${path}.unitIds[${j}]`, id);
      unitsOnAPath.add(id);
    });
  });
  units.forEach((row, i) => {
    if (!isRecord(row) || typeof row["id"] !== "string") return;
    if (paths.length > 0 && !unitsOnAPath.has(row["id"])) {
      out.error(
        "MISSING_UNIT",
        `units[${i}].id`,
        `Unit "${row["id"]}" is not listed on any learning path.`,
      );
    }
  });

  const unitCycle = findIdCycle(unitPrereqEdges);
  if (unitCycle) {
    out.error(
      "PREREQUISITE_CYCLE",
      "units",
      `Learning-unit prerequisite cycle: ${unitCycle.join(" → ")}.`,
    );
  } else {
    const wordLetterReqs = new Map<string, string[]>();
    const wordSkillReqs = new Map<string, string[]>();
    const syllableLetterReqs = new Map<string, string[]>();
    const syllableSkillReqs = new Map<string, string[]>();

    words.forEach((row) => {
      if (!isRecord(row) || typeof row["id"] !== "string") return;
      wordLetterReqs.set(
        row["id"],
        (Array.isArray(row["letterIds"]) ? row["letterIds"] : []).filter(
          (x): x is string => typeof x === "string",
        ),
      );
      wordSkillReqs.set(
        row["id"],
        (Array.isArray(row["requiredSkillIds"]) ? row["requiredSkillIds"] : []).filter(
          (x): x is string => typeof x === "string",
        ),
      );
    });
    syllables.forEach((row) => {
      if (!isRecord(row) || typeof row["id"] !== "string") return;
      const letters = [
        ...(typeof row["letterId"] === "string" ? [row["letterId"]] : []),
        ...(Array.isArray(row["requiredLetterIds"]) ? row["requiredLetterIds"] : []).filter(
          (x): x is string => typeof x === "string",
        ),
      ];
      const skills = [
        ...(typeof row["vowelSkillId"] === "string" ? [row["vowelSkillId"]] : []),
        ...(Array.isArray(row["requiredSkillIds"]) ? row["requiredSkillIds"] : []).filter(
          (x): x is string => typeof x === "string",
        ),
      ];
      syllableLetterReqs.set(row["id"], letters);
      syllableSkillReqs.set(row["id"], skills);
    });

    const closureCache = new Map<string, Set<string>>();
    const unitClosure = (id: string): Set<string> => {
      const cached = closureCache.get(id);
      if (cached) return cached;
      const seen = new Set<string>([id]);
      for (const prereq of unitPrereqEdges.get(id) ?? []) {
        for (const x of unitClosure(prereq)) seen.add(x);
      }
      closureCache.set(id, seen);
      return seen;
    };

    const accumulate = (ids: Iterable<string>, fromUnit: (uid: string) => string[] | undefined) => {
      const set = new Set<string>();
      for (const uid of ids) {
        for (const item of fromUnit(uid) ?? []) set.add(item);
      }
      return set;
    };

    units.forEach((row, i) => {
      if (!isRecord(row) || typeof row["id"] !== "string") return;
      const id = row["id"];
      const available = unitClosure(id);
      const availableLetters = accumulate(available, (uid) => unitLetterIds.get(uid));
      const availableSkills = accumulate(available, (uid) => unitSkillIds.get(uid));
      const availableForms = accumulate(available, (uid) => unitFormKeys.get(uid));
      const availableSyllables = accumulate(available, (uid) => unitSyllableIds.get(uid));
      const availableWords = accumulate(available, (uid) => unitWordIds.get(uid));

      for (const [j, wordId] of (unitWordIds.get(id) ?? []).entries()) {
        for (const lid of wordLetterReqs.get(wordId) ?? []) {
          if (letterIds.has(lid) && !availableLetters.has(lid)) {
            out.error(
              "PREMATURE_WORD",
              `units[${i}].wordIds[${j}]`,
              `Word "${wordId}" needs letter "${lid}" before unit "${id}" teaches it.`,
            );
          }
        }
        for (const sid of wordSkillReqs.get(wordId) ?? []) {
          if (skillIds.has(sid) && !availableSkills.has(sid)) {
            out.error(
              "PREMATURE_WORD",
              `units[${i}].wordIds[${j}]`,
              `Word "${wordId}" needs skill "${sid}" before unit "${id}" teaches it.`,
            );
          }
        }
        for (const ref of wordFormReqs.get(wordId) ?? []) {
          const key = formKey(ref.letterId, ref.form);
          if (!availableForms.has(key)) {
            out.error(
              "PREMATURE_WORD",
              `units[${i}].wordIds[${j}]`,
              `Word "${wordId}" needs ${ref.letterId} ${ref.form} form before unit "${id}" introduces it.`,
            );
          }
        }
      }

      for (const [j, syllableId] of (unitSyllableIds.get(id) ?? []).entries()) {
        for (const lid of syllableLetterReqs.get(syllableId) ?? []) {
          if (letterIds.has(lid) && !availableLetters.has(lid)) {
            out.error(
              "PREMATURE_CONTENT",
              `units[${i}].syllableIds[${j}]`,
              `Syllable "${syllableId}" needs letter "${lid}" before unit "${id}" teaches it.`,
            );
          }
        }
        for (const sid of syllableSkillReqs.get(syllableId) ?? []) {
          if (skillIds.has(sid) && !availableSkills.has(sid)) {
            out.error(
              "PREMATURE_CONTENT",
              `units[${i}].syllableIds[${j}]`,
              `Syllable "${syllableId}" needs skill "${sid}" before unit "${id}" teaches it.`,
            );
          }
        }
      }

      const listedExercises = (Array.isArray(row["exerciseIds"]) ? row["exerciseIds"] : []).filter(
        (x): x is string => typeof x === "string",
      );
      const listedExerciseRows = listedExercises.flatMap((exerciseId) => {
        const exercise = exercises.find((item) => isRecord(item) && item["id"] === exerciseId);
        return isRecord(exercise) ? [{ exerciseId, exercise }] : [];
      });
      const blendingOnly =
        listedExerciseRows.length > 0 &&
        listedExerciseRows.every((item) => item.exercise["type"] === "syllable_blending");
      const scoredSyllables = new Set<string>();
      for (const [j, { exerciseId, exercise }] of listedExerciseRows.entries()) {
        const usedSyllables = new Set<string>();
        const addSyllable = (value: unknown) => {
          if (typeof value === "string" && value.startsWith("syllable.")) usedSyllables.add(value);
        };
        const addScored = (value: unknown) => {
          if (typeof value === "string" && value.startsWith("syllable.")) scoredSyllables.add(value);
        };
        (Array.isArray(exercise["contentIds"]) ? exercise["contentIds"] : []).forEach(addSyllable);
        if (isRecord(exercise["success"])) {
          addSyllable(exercise["success"]["correctChoiceId"]);
          addScored(exercise["success"]["correctChoiceId"]);
        }
        const targets = exercise["masteryTargets"];
        if (Array.isArray(targets)) {
          targets.forEach((target) => {
            if (!isRecord(target)) return;
            addSyllable(target["syllableId"]);
            addScored(target["syllableId"]);
          });
        }
        const choices = exercise["choices"];
        if (Array.isArray(choices)) {
          choices.forEach((choice) => {
            if (isRecord(choice)) addSyllable(choice["id"]);
          });
        }
        for (const syllableId of usedSyllables) {
          if (!syllableIds.has(syllableId)) continue;
          if (!availableSyllables.has(syllableId)) {
            out.error(
              "PREMATURE_CONTENT",
              `units[${i}].exerciseIds[${j}]`,
              `Exercise "${exerciseId}" uses syllable "${syllableId}" before unit "${id}" introduces it.`,
            );
          }
          for (const lid of syllableLetterReqs.get(syllableId) ?? []) {
            if (letterIds.has(lid) && !availableLetters.has(lid)) {
              out.error(
                "PREMATURE_CONTENT",
                `units[${i}].exerciseIds[${j}]`,
                `Syllable "${syllableId}" needs letter "${lid}" before unit "${id}" teaches it.`,
              );
            }
          }
          for (const sid of syllableSkillReqs.get(syllableId) ?? []) {
            if (skillIds.has(sid) && !availableSkills.has(sid)) {
              out.error(
                "PREMATURE_CONTENT",
                `units[${i}].exerciseIds[${j}]`,
                `Syllable "${syllableId}" needs skill "${sid}" before unit "${id}" teaches it.`,
              );
            }
          }
        }
        if (exercise["type"] === "letter_recognition") {
          const usedLetters = new Set<string>();
          const addLetter = (value: unknown) => {
            if (typeof value === "string" && value.startsWith("letter.")) usedLetters.add(value);
          };
          (Array.isArray(exercise["contentIds"]) ? exercise["contentIds"] : []).forEach(addLetter);
          if (isRecord(exercise["success"])) addLetter(exercise["success"]["correctChoiceId"]);
          if (Array.isArray(exercise["masteryTargets"])) {
            exercise["masteryTargets"].forEach((target) => {
              if (isRecord(target)) addLetter(target["letterId"]);
            });
          }
          if (isRecord(exercise["config"])) addLetter(exercise["config"]["letterId"]);
          if (Array.isArray(exercise["choices"])) {
            exercise["choices"].forEach((choice) => {
              if (isRecord(choice)) addLetter(choice["id"]);
            });
          }
          for (const letterId of usedLetters) {
            if (!letterIds.has(letterId)) continue;
            if (!availableLetters.has(letterId)) {
              out.error(
                "PREMATURE_CONTENT",
                `units[${i}].exerciseIds[${j}]`,
                `Exercise "${exerciseId}" uses letter "${letterId}" before unit "${id}" introduces it.`,
              );
            }
          }
          const formLetter =
            (isRecord(exercise["config"]) && typeof exercise["config"]["letterId"] === "string"
              ? exercise["config"]["letterId"]
              : undefined) ??
            (Array.isArray(exercise["masteryTargets"])
              ? exercise["masteryTargets"].flatMap((target) =>
                  isRecord(target) && typeof target["letterId"] === "string" ? [target["letterId"]] : [],
                )[0]
              : undefined);
          const formSlot =
            (isRecord(exercise["config"]) && typeof exercise["config"]["targetForm"] === "string"
              ? exercise["config"]["targetForm"]
              : undefined) ??
            (Array.isArray(exercise["masteryTargets"])
              ? exercise["masteryTargets"].flatMap((target) =>
                  isRecord(target) && typeof target["letterForm"] === "string" ? [target["letterForm"]] : [],
                )[0]
              : undefined);
          if (formLetter && formSlot) {
            const key = formKey(formLetter, formSlot);
            if (!availableForms.has(key)) {
              out.error(
                "PREMATURE_CONTENT",
                `units[${i}].exerciseIds[${j}]`,
                `Exercise "${exerciseId}" uses ${formLetter} ${formSlot} form before unit "${id}" introduces it.`,
              );
            }
          }
        }
        if (exercise["type"] === "audio_to_word" || exercise["type"] === "picture_to_word" || exercise["type"] === "word_to_picture") {
          const usedWords = new Set<string>();
          const addWord = (value: unknown) => {
            if (typeof value === "string" && value.startsWith("word.")) usedWords.add(value);
          };
          (Array.isArray(exercise["contentIds"]) ? exercise["contentIds"] : []).forEach(addWord);
          if (isRecord(exercise["success"])) addWord(exercise["success"]["correctChoiceId"]);
          if (Array.isArray(exercise["masteryTargets"])) {
            exercise["masteryTargets"].forEach((target) => {
              if (isRecord(target)) addWord(target["wordId"]);
            });
          }
          if (Array.isArray(exercise["choices"])) {
            exercise["choices"].forEach((choice) => {
              if (isRecord(choice)) addWord(choice["id"]);
            });
          }
          for (const wordId of usedWords) {
            if (!wordIds.has(wordId)) continue;
            if (!availableWords.has(wordId)) {
              out.error(
                "PREMATURE_CONTENT",
                `units[${i}].exerciseIds[${j}]`,
                `Exercise "${exerciseId}" uses word "${wordId}" before unit "${id}" introduces it.`,
              );
            }
          }
        }
      }
      if (blendingOnly) {
        for (const [j, syllableId] of (unitSyllableIds.get(id) ?? []).entries()) {
          if (!scoredSyllables.has(syllableId)) {
            out.error(
              "MISSING_MASTERY_TARGET",
              `units[${i}].syllableIds[${j}]`,
              `Unit "${id}" lists syllable "${syllableId}" but no syllable_blending exercise scores it.`,
            );
          }
        }
      }
    });
  }

  if (isBandAProductionBundle(data)) {
    validateBandAProduction(data, (issue) => {
      if (issue.severity === "warning") out.warn(issue.code, issue.path, issue.message);
      else out.error(issue.code, issue.path, issue.message);
    });
  }

  if (isLiteracyWave1Bundle(data)) {
    validateLiteracyWave1Production(data, (issue) => {
      if (issue.severity === "warning") out.warn(issue.code, issue.path, issue.message);
      else out.error(issue.code, issue.path, issue.message);
    });
  }

  return out.result();
}

/** Narrow a validated unknown blob. Call only when validateCurriculum().ok is true. */
export function asCurriculumBundle(data: unknown): CurriculumBundle {
  return data as CurriculumBundle;
}
