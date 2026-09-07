/**
 * Deterministic Band A v1 production integrity checks.
 * Only runs when meta.id is the Band A production bundle.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";

export const BAND_A_PRODUCTION_META_ID = "hurufi.production.band-a.v1";

export const BAND_A_V1_WORD_COUNT = 135;
export const BAND_A_V1_EXISTING_COUNT = 113;
export const BAND_A_V1_NEW_REQUIRED_COUNT = 22;
export const BAND_A_V1_CLUSTER_COUNTS = { A1: 28, A2: 35, A3: 37, A4: 35 } as const;

/** Lemmas approved as NEW_REQUIRED (no prototype legacyId). */
export const BAND_A_NEW_REQUIRED_LEMMAS = new Set([
  "بنت",
  "ولد",
  "قطة",
  "كرة",
  "لعبة",
  "مسجد",
  "سوق",
  "يوم",
  "صباح",
  "يذهب",
  "يرى",
  "هذا",
  "هذه",
  "هو",
  "هي",
  "في",
  "على",
  "هنا",
  "نعم",
  "لا",
  "يقول",
  "يأتي",
]);

/** High-frequency spine from docs/band-a-vocabulary-plan.md §11. */
export const BAND_A_HIGH_FREQUENCY_LEMMAS = new Set([
  "أم",
  "أب",
  "بنت",
  "ولد",
  "بيت",
  "باب",
  "ماء",
  "يد",
  "كتاب",
  "قلم",
  "مدرسة",
  "كرة",
  "قط",
  "قطة",
  "كلب",
  "هذا",
  "هذه",
  "هو",
  "هي",
  "في",
  "على",
  "هنا",
  "نعم",
  "لا",
  "يأكل",
  "يشرب",
  "يلعب",
  "ينام",
  "يذهب",
  "يرى",
  "يقول",
  "كبير",
  "صغير",
  "سعيد",
]);

const TANWEEN = /[\u064B\u064C\u064D]/;
const SUB_BANDS = new Set(["A1", "A2", "A3", "A4"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isBandAProductionBundle(data: unknown): boolean {
  if (!isRecord(data) || !isRecord(data["meta"])) return false;
  return data["meta"]["id"] === BAND_A_PRODUCTION_META_ID;
}

export function validateBandAProduction(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  if (!isRecord(data)) return;
  const meta = data["meta"];
  if (isRecord(meta)) {
    if (meta["kind"] !== "production") {
      emit({
        code: "BAND_A_META",
        path: "meta.kind",
        message: "Band A production bundle must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "BAND_A_META",
        path: "meta.notProductionCurriculum",
        message: "Band A production bundle must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const words = Array.isArray(data["words"]) ? data["words"] : [];
  if (words.length !== BAND_A_V1_WORD_COUNT) {
    emit({
      code: "BAND_A_COUNT",
      path: "words",
      message: `Band A v1 must contain exactly ${BAND_A_V1_WORD_COUNT} words (found ${words.length}).`,
      severity: "error",
    });
  }

  const clusterCounts = { A1: 0, A2: 0, A3: 0, A4: 0 };
  let withLegacy = 0;
  let newRequired = 0;

  words.forEach((row, i) => {
    const path = `words[${i}]`;
    if (!isRecord(row)) return;

    if (row["status"] === "fixture") {
      emit({
        code: "BAND_A_STATUS",
        path: `${path}.status`,
        message: "Production Band A words must not be marked fixture.",
        severity: "error",
      });
    }
    if (row["status"] !== undefined && row["status"] !== "active") {
      emit({
        code: "BAND_A_STATUS",
        path: `${path}.status`,
        message: `Production Band A words should be status "active" (found "${String(row["status"])}").`,
        severity: "error",
      });
    }
    if (row["vocabBand"] !== "A") {
      emit({
        code: "BAND_A_BAND",
        path: `${path}.vocabBand`,
        message: "Every Band A v1 word must have vocabBand \"A\".",
        severity: "error",
      });
    }

    const subBand = row["subBand"];
    if (typeof subBand !== "string" || !SUB_BANDS.has(subBand)) {
      emit({
        code: "BAND_A_SUBBAND",
        path: `${path}.subBand`,
        message: "Production Band A words must have subBand A1–A4.",
        severity: "error",
      });
    } else {
      clusterCounts[subBand as keyof typeof clusterCounts] += 1;
    }

    const lemma = typeof row["lemma"] === "string" ? row["lemma"] : "";
    const teachingForm = typeof row["teachingForm"] === "string" ? row["teachingForm"] : "";
    const diacritized = typeof row["diacritized"] === "string" ? row["diacritized"] : "";

    if (!teachingForm) {
      emit({
        code: "BAND_A_TEACHING_FORM",
        path: `${path}.teachingForm`,
        message: "Production Band A words must include teachingForm.",
        severity: "error",
      });
    } else if (teachingForm !== diacritized) {
      emit({
        code: "BAND_A_TEACHING_FORM",
        path: `${path}.teachingForm`,
        message: "Band A v1 teachingForm must match diacritized.",
        severity: "error",
      });
    }

    if (TANWEEN.test(teachingForm)) {
      emit({
        code: "BAND_A_TANWEEN",
        path: `${path}.teachingForm`,
        message: "Noun/card teachingForm must not include tanween.",
        severity: "error",
      });
    }

    if (lemma.startsWith("ال") || lemma.startsWith("الْ")) {
      emit({
        code: "BAND_A_ARTICLE",
        path: `${path}.lemma`,
        message: `Canonical lemma "${lemma}" must not begin with ال unless explicitly justified.`,
        severity: "error",
      });
    }

    const legacyId = row["legacyId"];
    const hasLegacy = typeof legacyId === "string" && legacyId.length > 0;
    if (BAND_A_NEW_REQUIRED_LEMMAS.has(lemma)) {
      newRequired += 1;
      if (hasLegacy) {
        emit({
          code: "BAND_A_LEGACY",
          path: `${path}.legacyId`,
          message: `NEW_REQUIRED lemma "${lemma}" must not have a fabricated legacyId.`,
          severity: "error",
        });
      }
    } else if (lemma) {
      withLegacy += 1;
      if (!hasLegacy) {
        emit({
          code: "BAND_A_LEGACY",
          path: `${path}.legacyId`,
          message: `Existing-720 lemma "${lemma}" must preserve prototype legacyId.`,
          severity: "error",
        });
      }
    }

    if (BAND_A_HIGH_FREQUENCY_LEMMAS.has(lemma) && row["highFrequency"] !== true) {
      emit({
        code: "BAND_A_HIGH_FREQUENCY",
        path: `${path}.highFrequency`,
        message: `Approved high-frequency lemma "${lemma}" must have highFrequency true.`,
        severity: "error",
      });
    }
    if (!BAND_A_HIGH_FREQUENCY_LEMMAS.has(lemma) && row["highFrequency"] === true) {
      emit({
        code: "BAND_A_HIGH_FREQUENCY",
        path: `${path}.highFrequency`,
        message: `Lemma "${lemma}" is not on the approved high-frequency spine.`,
        severity: "error",
      });
    }
  });

  if (withLegacy !== BAND_A_V1_EXISTING_COUNT) {
    emit({
      code: "BAND_A_COUNT",
      path: "words",
      message: `Expected ${BAND_A_V1_EXISTING_COUNT} existing-720 words with legacyId (found ${withLegacy}).`,
      severity: "error",
    });
  }
  if (newRequired !== BAND_A_V1_NEW_REQUIRED_COUNT) {
    emit({
      code: "BAND_A_COUNT",
      path: "words",
      message: `Expected ${BAND_A_V1_NEW_REQUIRED_COUNT} NEW_REQUIRED words (found ${newRequired}).`,
      severity: "error",
    });
  }

  for (const key of ["A1", "A2", "A3", "A4"] as const) {
    const expected = BAND_A_V1_CLUSTER_COUNTS[key];
    if (clusterCounts[key] !== expected) {
      emit({
        code: "BAND_A_SUBBAND",
        path: "words",
        message: `Expected ${expected} ${key} words (found ${clusterCounts[key]}).`,
        severity: "error",
      });
    }
  }
}
