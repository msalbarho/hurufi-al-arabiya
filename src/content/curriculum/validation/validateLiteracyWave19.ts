/**
 * Deterministic Wave 19 literacy-path production integrity checks.
 * Only runs when meta.id is the Wave 19 production bundle.
 * Waves 1–18 stay frozen. One-unit CLOSED DAMMA CVC proof: بُلْ.
 * No word, no verb, no sentence, no Wave 20.
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
import { WAVE16_LETTER_IDS, WAVE16_WORD_IDS } from "./validateLiteracyWave16.ts";
import { WAVE17_LETTER_IDS, WAVE17_WORD_IDS } from "./validateLiteracyWave17.ts";
import {
  WAVE18_FINAL_UNIT_ID,
  WAVE18_LETTER_IDS,
  WAVE18_WORD_IDS,
} from "./validateLiteracyWave18.ts";

export const LITERACY_WAVE19_META_ID = "hurufi.production.literacy.wave19";

export const WAVE19_LETTER_IDS = [] as const;

export const WAVE19_WORD_IDS = [] as const;

export const WAVE19_PATH_ID = "path.literacy.wave19";

export const WAVE19_UNIT_IDS = ["unit.literacy.wave19.bul_closed"] as const;

export const WAVE19_FIRST_UNIT_ID = "unit.literacy.wave19.bul_closed";
export const WAVE19_FINAL_UNIT_ID = "unit.literacy.wave19.bul_closed";

export const WAVE19_EXTERNAL_PREREQ_UNIT_IDS = [WAVE18_FINAL_UNIT_ID] as const;

const REQUIRED_LETTERS = ["letter.ba", "letter.lam", "letter.ra", "letter.mim"] as const;

const ALLOWED_SKILLS = [
  "skill.letter_recognition.core",
  "skill.short_vowel.fatha",
  "skill.short_vowel.damma",
  "skill.sukun.basic",
  "skill.syllable_blending.cv",
  "skill.syllable_blending.cvc",
] as const;

const FORBIDDEN_LETTERS = [
  "letter.haa",
  "letter.dhal",
  "letter.zay",
  "letter.kha",
  "letter.tha",
  "letter.sad",
  "letter.ghain",
  "letter.tah",
  "letter.dad",
  "letter.zah",
] as const;

const FORBIDDEN_SKILL_PREFIXES = [
  "skill.shadda.",
  "skill.tanween.",
  "skill.hamza.",
  "skill.taa_marbuta.",
  "skill.alif_maqsura.",
  "skill.articulation.",
  "skill.definite_article",
  "skill.long_vowel.madd_yaa",
  "skill.long_vowel.madd_waw",
] as const;

const FORBIDDEN_WORDS = [
  "word.bul",
  "word.yalab",
  "word.yalabu",
  "word.yashrabu",
  "word.yalbasu",
  "word.naam",
  "word.laa",
  "word.wa",
] as const;

const FORBIDDEN_TARGET_STRINGS = [
  "يَلْعَبُ",
  "يَشْرَبُ",
  "يَلْبَسُ",
  "الْوَلَدُ يَلْعَبُ",
  "كُلْ",
  "كُرْ",
  "بُنْ",
  "بُرْ",
  "مُنْ",
  "قُمْ",
  "بَلْ",
  "بِلْ",
] as const;

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
  ...WAVE17_LETTER_IDS,
  ...WAVE18_LETTER_IDS,
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
  ...WAVE17_WORD_IDS,
  ...WAVE18_WORD_IDS,
] as const;

const HAMZA_SEATS = /[أإآ]/u;
const SHADDA = /\u0651/u;
const DAMMA = /\u064F/u;
const SUKUN = /\u0652/u;
const TANWEEN = /[\u064B\u064C\u064D]/u;
const TAA_MARBUTA = /ة/u;
const ALIF_MAQSURA = /ى/u;
const MADD_YAA = /ِي(?!\u0652)/u;
const MADD_WAW = /ُو(?!\u0652)/u;
const DEFINITE_ARTICLE = /الْ|ال(?=[\u0621-\u064A])/u;

const UNIT_FLOW = [
  "exercise.wave19.presentation.ba_damma",
  "exercise.wave19.presentation.bul_closed",
  "exercise.wave19.syllable_blending.bul_closed",
] as const;

function isRecord(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? (value as Record<string, unknown>) : undefined;
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

function childTitleStrings(data: unknown): string[] {
  const rec = asRecord(data);
  const units = Array.isArray(rec?.["units"]) ? rec["units"] : [];
  const paths = Array.isArray(rec?.["paths"]) ? rec["paths"] : [];
  const out: string[] = [];
  for (const row of [...units, ...paths]) {
    const item = asRecord(row);
    if (!item) continue;
    for (const key of ["titleAr", "childGoalAr", "descriptionAr"] as const) {
      if (typeof item[key] === "string") out.push(item[key] as string);
    }
  }
  return out;
}

function skillIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((row) => {
    const rec = asRecord(row);
    return rec && typeof rec["skillId"] === "string" ? [rec["skillId"]] : [];
  });
}

function letterIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((row) => {
    const rec = asRecord(row);
    return rec && typeof rec["letterId"] === "string" ? [rec["letterId"]] : [];
  });
}

function wordIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((row) => {
    const rec = asRecord(row);
    return rec && typeof rec["wordId"] === "string" ? [rec["wordId"]] : [];
  });
}

function syllableIdsOnTargets(exercise: Record<string, unknown>): string[] {
  const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
  return targets.flatMap((row) => {
    const rec = asRecord(row);
    return rec && typeof rec["syllableId"] === "string" ? [rec["syllableId"]] : [];
  });
}

function choiceIds(exercise: Record<string, unknown>): string[] {
  return asStringArray(
    (Array.isArray(exercise["choices"]) ? exercise["choices"] : []).map((choice) => asRecord(choice)?.["id"]),
  );
}

function choiceLabels(exercise: Record<string, unknown>): string[] {
  return (Array.isArray(exercise["choices"]) ? exercise["choices"] : []).flatMap((choice) => {
    const rec = asRecord(choice);
    return rec && typeof rec["label"] === "string" ? [rec["label"]] : [];
  });
}

function expectedPriorWave(id: string): number | undefined {
  if ((WAVE1_LETTER_IDS as readonly string[]).includes(id)) return 1;
  if ((WAVE2_LETTER_IDS as readonly string[]).includes(id)) return 2;
  return undefined;
}

export function isLiteracyWave19Bundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === LITERACY_WAVE19_META_ID;
}

export function validateLiteracyWave19Production(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({
        code: "WAVE19_META",
        path: "meta.kind",
        message: "Literacy Wave 19 must have meta.kind \"production\".",
        severity: "error",
      });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "WAVE19_META",
        path: "meta.notProductionCurriculum",
        message: "Literacy Wave 19 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
  }

  const blob = jsonText(data);
  if (blob.includes("wave-20") || blob.includes("wave20") || blob.includes("path.literacy.wave20")) {
    emit({
      code: "WAVE19_SCOPE",
      path: "$",
      message: "Wave 19 must not declare a Wave 20 path, route, or CTA.",
      severity: "error",
    });
  }
  if (
    blob.includes("path.literacy.wave18") ||
    blob.includes("unit.literacy.wave17") ||
    blob.includes("path.literacy.wave1\"")
  ) {
    emit({
      code: "WAVE19_SCOPE",
      path: "$",
      message: "Wave 19 must not rewrite frozen Waves 1–18 path or unit records.",
      severity: "error",
    });
  }
  for (const id of FORBIDDEN_WORDS) {
    if (blob.includes(`"${id}"`) || blob.includes(id.replace("word.", "word:"))) {
      emit({
        code: "WAVE19_SCOPE",
        path: "$",
        message: `Wave 19 must not include forbidden word ${id}.`,
        severity: "error",
      });
    }
  }
  for (const text of FORBIDDEN_TARGET_STRINGS) {
    if (blob.includes(text)) {
      emit({
        code: "WAVE19_SCOPE",
        path: "$",
        message: `Wave 19 must not include forbidden target "${text}".`,
        severity: "error",
      });
    }
  }
  if (FORBIDDEN_LETTERS.some((id) => blob.includes(`"${id}"`))) {
    emit({
      code: "WAVE19_LETTER",
      path: "$",
      message: "Wave 19 must not teach a new consonant.",
      severity: "error",
    });
  }
  for (const prefix of FORBIDDEN_SKILL_PREFIXES) {
    if (blob.includes(`"${prefix}`) || blob.includes(prefix)) {
      emit({
        code: "WAVE19_PHONICS",
        path: "$",
        message: `Wave 19 must not introduce forbidden skill ${prefix}.`,
        severity: "error",
      });
      break;
    }
  }
  if (
    blob.includes("diacritic:") ||
    blob.includes("missing_haraka") ||
    blob.includes("damma.discrimination") ||
    blob.includes("sukun.discrimination")
  ) {
    emit({
      code: "WAVE19_LIVE_KEY",
      path: "$",
      message: "Wave 19 must not require mark-discrimination or missing_haraka.",
      severity: "error",
    });
  }
  if (
    blob.includes("letter:ba.damma") ||
    blob.includes("letter:kaf.damma") ||
    blob.includes("mastery.letter.ba.damma") ||
    blob.includes("mastery.letter.kaf.damma")
  ) {
    emit({
      code: "WAVE19_LIVE_KEY",
      path: "$",
      message: "Wave 19 must not re-gate letter:ba.damma or letter:kaf.damma.",
      severity: "error",
    });
  }
  if (
    blob.includes("letter:ba.damma.closed") ||
    blob.includes("letter:bul.closed.tracing") ||
    blob.includes("skill.handwriting") ||
    blob.includes("\"tracing\"")
  ) {
    emit({
      code: "WAVE19_WRITING",
      path: "$",
      message: "Wave 19 must not invent a writing/tracing mastery key or letter:ba.damma.closed.",
      severity: "error",
    });
  }
  if (blob.includes("audio_to_word") || blob.includes("picture_to_word") || blob.includes("word_to_picture")) {
    emit({
      code: "WAVE19_FLOW",
      path: "$",
      message: "Wave 19 must not use word engines. Closed-chunk blending only.",
      severity: "error",
    });
  }
  if (blob.includes("syllable.lam.sukun") || blob.includes("syllable.bin.closed")) {
    emit({
      code: "WAVE19_CLOSED",
      path: "$",
      message: "Wave 19 must not author syllable.lam.sukun or extra closed keys.",
      severity: "error",
    });
  }

  const sentences = Array.isArray(rec["sentences"]) ? rec["sentences"] : [];
  if (sentences.length > 0) {
    emit({
      code: "WAVE19_SENTENCE",
      path: "sentences",
      message: "Wave 19 sentences must remain empty.",
      severity: "error",
    });
  }

  const words = Array.isArray(rec["words"]) ? rec["words"] : [];
  if (words.length > 0) {
    emit({
      code: "WAVE19_WORD",
      path: "words",
      message: "Wave 19 must not introduce a vocabulary word. بُلْ is a phonics chunk.",
      severity: "error",
    });
  }

  const skills = Array.isArray(rec["skills"]) ? rec["skills"] : [];
  const skillRows = recordById(skills);
  if (!skillRows.has("skill.syllable_blending.cvc")) {
    emit({
      code: "WAVE19_PHONICS",
      path: "skills",
      message: "Wave 19 must reuse canonical skill.syllable_blending.cvc.",
      severity: "error",
    });
  }
  if (!skillRows.has("skill.sukun.basic")) {
    emit({
      code: "WAVE19_PHONICS",
      path: "skills",
      message: "Wave 19 must reuse historical skill.sukun.basic, not reteach it.",
      severity: "error",
    });
  }
  if (!skillRows.has("skill.short_vowel.damma")) {
    emit({
      code: "WAVE19_PHONICS",
      path: "skills",
      message: "Wave 19 must reuse canonical skill.short_vowel.damma.",
      severity: "error",
    });
  }
  for (const row of skills) {
    const id = asRecord(row)?.["id"];
    if (typeof id !== "string") continue;
    if (!(ALLOWED_SKILLS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE19_PHONICS",
        path: `skills[id=${id}]`,
        message: "Wave 19 may only reuse historical phonics skills needed for the closed-damma chunk.",
        severity: "error",
      });
    }
  }

  const letters = Array.isArray(rec["letters"]) ? rec["letters"] : [];
  const allowedLetters = new Set<string>([...PRIOR_LETTER_IDS, ...WAVE19_LETTER_IDS]);
  for (const row of letters) {
    const letter = asRecord(row);
    const id = letter?.["id"];
    if (typeof id !== "string") continue;
    if (!allowedLetters.has(id)) {
      emit({
        code: "WAVE19_LETTER",
        path: `letters[id=${id}]`,
        message: `Wave 19 letter "${id}" was not previously taught.`,
        severity: "error",
      });
    }
    if ((WAVE19_LETTER_IDS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE19_LETTER",
        path: `letters[id=${id}]`,
        message: "Wave 19 must not introduce a new consonant.",
        severity: "error",
      });
    }
    const prior = expectedPriorWave(id);
    if (prior !== undefined && letter?.["wave"] !== prior) {
      emit({
        code: "WAVE19_LETTER",
        path: `letters[id=${id}].wave`,
        message: `Recycled letter "${id}" must keep historical wave ${prior}.`,
        severity: "error",
      });
    }
  }
  for (const id of REQUIRED_LETTERS) {
    if (!letters.some((row) => asRecord(row)?.["id"] === id)) {
      emit({
        code: "WAVE19_LETTER",
        path: "letters",
        message: `Wave 19 must recycle previously taught letter ${id}.`,
        severity: "error",
      });
    }
  }

  const wordIds = words.flatMap((row) => {
    const id = asRecord(row)?.["id"];
    return typeof id === "string" ? [id] : [];
  });
  for (const id of wordIds) {
    if (!(PRIOR_WORD_IDS as readonly string[]).includes(id) && !(WAVE19_WORD_IDS as readonly string[]).includes(id)) {
      emit({
        code: "WAVE19_WORD",
        path: `words[id=${id}]`,
        message: `Wave 19 must not invent word "${id}".`,
        severity: "error",
      });
    }
  }

  const syllables = Array.isArray(rec["syllables"]) ? rec["syllables"] : [];
  const syllableRows = recordById(syllables);
  const baDamma = syllableRows.get("syllable.ba.damma");
  const bulClosed = syllableRows.get("syllable.bul.closed");
  const ramClosed = syllableRows.get("syllable.ram.closed");
  if (!baDamma || baDamma["text"] !== "بُ" || baDamma["pattern"] !== "CV" || baDamma["letterId"] !== "letter.ba") {
    emit({
      code: "WAVE19_SYLLABLE",
      path: "syllables[id=syllable.ba.damma]",
      message: "Wave 19 must reuse familiar open بُ via syllable.ba.damma.",
      severity: "error",
    });
  }
  if (
    !bulClosed ||
    bulClosed["text"] !== "بُلْ" ||
    bulClosed["pattern"] !== "CVC" ||
    bulClosed["letterId"] !== "letter.ba" ||
    bulClosed["vowelSkillId"] !== "skill.short_vowel.damma"
  ) {
    emit({
      code: "WAVE19_SYLLABLE",
      path: "syllables[id=syllable.bul.closed]",
      message: "New closed chunk must be exactly بُلْ (CVC, letter.ba, skill.short_vowel.damma).",
      severity: "error",
    });
  } else {
    const text = typeof bulClosed["text"] === "string" ? bulClosed["text"] : "";
    if (!DAMMA.test(text) || !SUKUN.test(text)) {
      emit({
        code: "WAVE19_SYLLABLE",
        path: "syllables[id=syllable.bul.closed].text",
        message: "بُلْ must contain canonical U+064F ARABIC DAMMA and U+0652 ARABIC SUKUN.",
        severity: "error",
      });
    }
    const requiredLetters = asStringArray(bulClosed["requiredLetterIds"]).slice().sort().join(",");
    if (requiredLetters !== ["letter.ba", "letter.lam"].sort().join(",")) {
      emit({
        code: "WAVE19_SYLLABLE",
        path: "syllables[id=syllable.bul.closed].requiredLetterIds",
        message: "syllable.bul.closed requiredLetterIds must be exactly letter.ba and letter.lam.",
        severity: "error",
      });
    }
    const requiredSkills = asStringArray(bulClosed["requiredSkillIds"]);
    if (!requiredSkills.includes("skill.short_vowel.damma") || !requiredSkills.includes("skill.sukun.basic")) {
      emit({
        code: "WAVE19_SYLLABLE",
        path: "syllables[id=syllable.bul.closed].requiredSkillIds",
        message: "syllable.bul.closed must require skill.short_vowel.damma and skill.sukun.basic.",
        severity: "error",
      });
    }
    if (bulClosed["audioAssetId"] !== "audio.syllable.bul.closed") {
      emit({
        code: "WAVE19_AUDIO",
        path: "syllables[id=syllable.bul.closed].audioAssetId",
        message: "بُلْ must use logical audio.syllable.bul.closed.",
        severity: "error",
      });
    }
    const tags = asStringArray(bulClosed["tags"]);
    if (!tags.includes("cvc") || !tags.includes("closed-chunk")) {
      emit({
        code: "WAVE19_SYLLABLE",
        path: "syllables[id=syllable.bul.closed].tags",
        message: "syllable.bul.closed must keep Wave 4 / Wave 15 tags cvc and closed-chunk.",
        severity: "error",
      });
    }
  }
  if (!ramClosed || ramClosed["text"] !== "رَمْ" || ramClosed["pattern"] !== "CVC") {
    emit({
      code: "WAVE19_SYLLABLE",
      path: "syllables[id=syllable.ram.closed]",
      message: "Foil must reuse historical syllable.ram.closed as رَمْ.",
      severity: "error",
    });
  }

  const closedIds = [...syllableRows.entries()]
    .filter(([id, row]) => row["pattern"] === "CVC" || id.endsWith(".closed"))
    .map(([id]) => id)
    .sort();
  if (closedIds.join(",") !== ["syllable.bul.closed", "syllable.ram.closed"].sort().join(",")) {
    emit({
      code: "WAVE19_CLOSED",
      path: "syllables",
      message: "Wave 19 must author exactly one new closed chunk syllable.bul.closed plus foil syllable.ram.closed.",
      severity: "error",
    });
  }

  const units = Array.isArray(rec["units"]) ? rec["units"] : [];
  if (units.length !== 1) {
    emit({
      code: "WAVE19_UNITS",
      path: "units",
      message: "Wave 19 must declare exactly one unit.",
      severity: "error",
    });
  }
  const unit1 = asRecord(units.find((row) => asRecord(row)?.["id"] === WAVE19_FIRST_UNIT_ID));
  if (!unit1) {
    emit({
      code: "WAVE19_UNITS",
      path: "units",
      message: "Wave 19 unit id must be exactly unit.literacy.wave19.bul_closed.",
      severity: "error",
    });
  }

  for (const text of childTitleStrings(data)) {
    if (HAMZA_SEATS.test(text) || SHADDA.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text)) {
      emit({
        code: "WAVE19_TITLE",
        path: "childTitle",
        message: `Wave 19 child titles must not contain hamza, shadda, ة, or ى: "${text}".`,
        severity: "error",
      });
    }
    if (TANWEEN.test(text) || MADD_YAA.test(text) || MADD_WAW.test(text)) {
      emit({
        code: "WAVE19_PHONICS",
        path: "childTitle",
        message: `Wave 19 titles must not contain tanween or madd-yaa/madd-waw: "${text}".`,
        severity: "error",
      });
    }
    if (DEFINITE_ARTICLE.test(text)) {
      emit({
        code: "WAVE19_ARTICLE",
        path: "childTitle",
        message: `Wave 19 must not introduce ال: "${text}".`,
        severity: "error",
      });
    }
  }
  if (unit1 && unit1["titleAr"] !== "بُلْ") {
    emit({
      code: "WAVE19_TITLE",
      path: `units[id=${WAVE19_FIRST_UNIT_ID}].titleAr`,
      message: "Unit 1 child title must be exactly بُلْ.",
      severity: "error",
    });
  }

  if (unit1 && asStringArray(unit1["prereqUnitIds"]).join(",") !== WAVE18_FINAL_UNIT_ID) {
    emit({
      code: "WAVE19_PREREQ",
      path: `units[id=${WAVE19_FIRST_UNIT_ID}].prereqUnitIds`,
      message: "Wave 19 prerequisite must be exactly unit.literacy.wave18.kaf_damma.",
      severity: "error",
    });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  const path = asRecord(paths.find((row) => asRecord(row)?.["id"] === WAVE19_PATH_ID));
  if (!path) {
    emit({
      code: "WAVE19_PATH",
      path: "paths",
      message: "Wave 19 must include path.literacy.wave19.",
      severity: "error",
    });
  } else if (asStringArray(path["unitIds"]).join(",") !== WAVE19_UNIT_IDS.join(",")) {
    emit({
      code: "WAVE19_PATH",
      path: "paths[id=path.literacy.wave19].unitIds",
      message: "path.literacy.wave19 must list exactly unit.literacy.wave19.bul_closed.",
      severity: "error",
    });
  }
  if (paths.length !== 1) {
    emit({
      code: "WAVE19_PATH",
      path: "paths",
      message: "Wave 19 must not include any other path.",
      severity: "error",
    });
  }

  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
  const u1Exercises = unit1 ? asStringArray(unit1["exerciseIds"]) : [];
  if (u1Exercises.join(",") !== UNIT_FLOW.join(",")) {
    emit({
      code: "WAVE19_FLOW",
      path: `units[id=${WAVE19_FIRST_UNIT_ID}].exerciseIds`,
      message: "Unit 1 must be SHOW بُ, SHOW بُ + لْ → بُلْ, then scored بُلْ.",
      severity: "error",
    });
  }

  const showBa = exercises.get("exercise.wave19.presentation.ba_damma");
  const showBul = exercises.get("exercise.wave19.presentation.bul_closed");
  const scoreBul = exercises.get("exercise.wave19.syllable_blending.bul_closed");
  const showBaConfig = asRecord(showBa?.["config"]);
  const showBulConfig = asRecord(showBul?.["config"]);

  if (showBaConfig?.["syllableId"] !== "syllable.ba.damma" || showBaConfig?.["show"] !== "cv") {
    emit({
      code: "WAVE19_FLOW",
      path: "exercises[id=exercise.wave19.presentation.ba_damma]",
      message: "First SHOW must be familiar بُ via syllable.ba.damma.",
      severity: "error",
    });
  }
  if (
    showBul?.["type"] !== "presentation" ||
    showBulConfig?.["show"] !== "chunk" ||
    showBulConfig?.["left"] !== "بُ" ||
    showBulConfig?.["right"] !== "لْ" ||
    showBulConfig?.["result"] !== "بُلْ"
  ) {
    emit({
      code: "WAVE19_FLOW",
      path: "exercises[id=exercise.wave19.presentation.bul_closed]",
      message: "Second SHOW must be chunk بُ + لْ → بُلْ.",
      severity: "error",
    });
  }

  const firstScored = u1Exercises.find((id) => exercises.get(id)?.["type"] !== "presentation");
  if (firstScored !== "exercise.wave19.syllable_blending.bul_closed") {
    emit({
      code: "WAVE19_FLOW",
      path: `units[id=${WAVE19_FIRST_UNIT_ID}].exerciseIds`,
      message: "All presentations must occur before scored بُلْ.",
      severity: "error",
    });
  }

  if (scoreBul?.["type"] !== "syllable_blending") {
    emit({
      code: "WAVE19_FLOW",
      path: "exercises[id=exercise.wave19.syllable_blending.bul_closed]",
      message: "Scored item must be syllable_blending for بُلْ.",
      severity: "error",
    });
  } else {
    const ids = choiceIds(scoreBul);
    const labels = choiceLabels(scoreBul);
    if (
      asRecord(scoreBul["success"])?.["correctChoiceId"] !== "syllable.bul.closed" ||
      ids.join(",") !== "syllable.bul.closed,syllable.ba.damma,syllable.ram.closed" ||
      !labels.includes("بُلْ") ||
      !labels.includes("بُ") ||
      !labels.includes("رَمْ")
    ) {
      emit({
        code: "WAVE19_FLOW",
        path: "exercises[id=exercise.wave19.syllable_blending.bul_closed].choices",
        message: "Scored بُلْ choices must be exactly بُلْ / بُ / رَمْ.",
        severity: "error",
      });
    }
    if (
      skillIdsOnTargets(scoreBul).join(",") !== "skill.syllable_blending.cvc" ||
      syllableIdsOnTargets(scoreBul).join(",") !== "syllable.bul.closed" ||
      letterIdsOnTargets(scoreBul).length > 0 ||
      wordIdsOnTargets(scoreBul).length > 0
    ) {
      emit({
        code: "WAVE19_LIVE_KEY",
        path: "exercises[id=exercise.wave19.syllable_blending.bul_closed].masteryTargets",
        message: "Required live evidence must be exactly letter:bul.closed from syllable.bul.closed.",
        severity: "error",
      });
    }
  }

  const u1Required = unit1 ? asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]) : [];
  if (u1Required.join(",") !== "skill.syllable_blending.cvc") {
    emit({
      code: "WAVE19_MASTERY",
      path: `units[id=${WAVE19_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
      message: "Unit 1 must require skill.syllable_blending.cvc only.",
      severity: "error",
    });
  }

  if (unit1) {
    const required = asStringArray(asRecord(unit1["mastery"])?.["requiredSkillIds"]);
    const mapped = new Set<string>();
    for (const exerciseId of asStringArray(unit1["exerciseIds"])) {
      const exercise = exercises.get(exerciseId);
      if (!exercise || asStringArray(exercise["tags"]).includes("reinforcement")) continue;
      if (exercise["type"] === "presentation") continue;
      for (const skillId of skillIdsOnTargets(exercise)) mapped.add(skillId);
    }
    for (const skillId of required) {
      if (!mapped.has(skillId)) {
        emit({
          code: "WAVE19_LIVE_KEY",
          path: `units[id=${WAVE19_FIRST_UNIT_ID}].mastery.requiredSkillIds`,
          message: `Required skill "${skillId}" has no live mastery target.`,
          severity: "error",
        });
      }
    }
  }

  for (const exercise of exercises.values()) {
    if (exercise["type"] === "presentation" && Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
      emit({
        code: "WAVE19_MASTERY",
        path: `exercises[id=${exercise["id"]}].masteryTargets`,
        message: "Presentations must have attempts 0 / no mastery targets.",
        severity: "error",
      });
    }
    if (exercise["type"] !== "presentation" && exercise["type"] !== "syllable_blending") {
      emit({
        code: "WAVE19_RUNTIME",
        path: `exercises[id=${exercise["id"]}].type`,
        message: "Wave 19 must reuse existing presentation + syllable_blending engines only.",
        severity: "error",
      });
    }
    for (const label of choiceLabels(exercise)) {
      if (TANWEEN.test(label) || TAA_MARBUTA.test(label) || ALIF_MAQSURA.test(label) || HAMZA_SEATS.test(label) || SHADDA.test(label)) {
        emit({
          code: "WAVE19_PHONICS",
          path: `exercises[id=${exercise["id"]}].choices`,
          message: `Choice label must not introduce tanween, hamza, shadda, ة, or ى: "${label}".`,
          severity: "error",
        });
      }
    }
  }
}
