/**
 * Deterministic Module 1 (Complete Reading Foundations) production checks.
 * Only runs when meta.id is the reading-foundations production bundle.
 * Waves 1–22 stay frozen. This is not a wave and must not declare Wave 23.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";
import { WAVE22_FINAL_UNIT_ID } from "./validateLiteracyWave22.ts";

export const READING_FOUNDATIONS_META_ID = "hurufi.production.literacy.reading_foundations";
export const READING_FOUNDATIONS_MODULE_ID = "module.reading_foundations";
export const READING_FOUNDATIONS_PATH_ID = "path.literacy.reading_foundations";

export const READING_FOUNDATIONS_UNIT_IDS = [
  "unit.literacy.reading_foundations.madd_yaa",
  "unit.literacy.reading_foundations.madd_waw",
  "unit.literacy.reading_foundations.madd_transfer",
  "unit.literacy.reading_foundations.tanween_damm",
  "unit.literacy.reading_foundations.sentence_transfer",
] as const;

export const READING_FOUNDATIONS_FIRST_UNIT_ID = READING_FOUNDATIONS_UNIT_IDS[0];
export const READING_FOUNDATIONS_FINAL_UNIT_ID = READING_FOUNDATIONS_UNIT_IDS[4];
export const READING_FOUNDATIONS_EXTERNAL_PREREQ_UNIT_IDS = [WAVE22_FINAL_UNIT_ID] as const;

export const READING_FOUNDATIONS_LETTER_IDS = [] as const;
export const READING_FOUNDATIONS_WORD_IDS = [
  "word.fi",
  "word.fil",
  "word.kub",
  "word.yaqul",
  "word.kabir",
] as const;
export const READING_FOUNDATIONS_BAND_A_WORD_IDS = [
  "word.fi",
  "word.fil",
  "word.kub",
  "word.yaqul",
  "word.kabir",
  "word.kitab",
  "word.walad",
  "word.yalab",
] as const;

export const KITABUN_SENTENCE_ID = "sentence.reading_foundations.kitabun";
export const WALADUN_YALABU_SENTENCE_ID = "sentence.reading_foundations.waladun_yalabu";
export const ALKITABU_KABIRUN_SENTENCE_ID = "sentence.reading_foundations.alkitabu_kabirun";
export const KITABUN_AUDIO_ID = "audio.sentence.reading_foundations.kitabun";
export const WALADUN_YALABU_AUDIO_ID = "audio.sentence.reading_foundations.waladun_yalabu";
export const ALKITABU_KABIRUN_AUDIO_ID = "audio.sentence.reading_foundations.alkitabu_kabirun";

export const READING_FOUNDATIONS_REQUIRED_LIVE_KEYS = [
  "word:fi.decoding",
  "word:fil.decoding",
  "word:kub.decoding",
  "word:yaqul.decoding",
  "word:kabir.decoding",
  "sentence:reading_foundations.kitabun.reading",
  "sentence:reading_foundations.waladun_yalabu.reading",
  "sentence:reading_foundations.alkitabu_kabirun.reading",
] as const;

const KNOWN_LETTERS = [
  "letter.mim",
  "letter.lam",
  "letter.qaf",
  "letter.dal",
  "letter.waw",
  "letter.jim",
  "letter.ya",
  "letter.ra",
  "letter.ba",
  "letter.fa",
  "letter.ha",
  "letter.kaf",
  "letter.ta",
  "letter.sin",
  "letter.shin",
  "letter.ain",
  "letter.nun",
  "letter.alif",
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

const CITATION_FORMS: Record<string, string> = {
  "word.walad": "وَلَد",
  "word.kitab": "كِتَاب",
  "word.kabir": "كَبِير",
  "word.yalab": "يَلْعَبُ",
  "word.fi": "فِي",
  "word.fil": "فِيل",
  "word.kub": "كُوب",
  "word.yaqul": "يَقُولُ",
};

const UNIT_TITLES: Record<string, string> = {
  "unit.literacy.reading_foundations.madd_yaa": "نَقْرَأُ ـِي",
  "unit.literacy.reading_foundations.madd_waw": "نَقْرَأُ ـُو",
  "unit.literacy.reading_foundations.madd_transfer": "كَبِير",
  "unit.literacy.reading_foundations.tanween_damm": "نَقْرَأُ ـٌ",
  "unit.literacy.reading_foundations.sentence_transfer": "وَلَدٌ يَلْعَبُ",
};

const UNIT_PREREQS: Record<string, string> = {
  "unit.literacy.reading_foundations.madd_yaa": WAVE22_FINAL_UNIT_ID,
  "unit.literacy.reading_foundations.madd_waw": "unit.literacy.reading_foundations.madd_yaa",
  "unit.literacy.reading_foundations.madd_transfer": "unit.literacy.reading_foundations.madd_waw",
  "unit.literacy.reading_foundations.tanween_damm": "unit.literacy.reading_foundations.madd_transfer",
  "unit.literacy.reading_foundations.sentence_transfer": "unit.literacy.reading_foundations.tanween_damm",
};

const HAMZA_SEATS = /[أإآ]/u;
const SHADDA = /\u0651/u;
const TANWEEN_KASRA = /\u064D/u;
const TANWEEN_FATHA = /\u064B/u;
const TAA_MARBUTA = /ة/u;
const ALIF_MAQSURA = /ى/u;
const ARTICLE_PLUS_TANWEEN = /الْ[^\s]*[ًٌٍ]/u;
const ILLEGAL_SURFACES = ["الْوَلَدٌ", "الْكِتَابٌ", "الْبِنْتٌ", "فِي الْبَيْتِ"];

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

function sorted(values: string[]): string[] {
  return values.slice().sort();
}

function walkStrings(value: unknown, visit: (text: string, path: string) => void, path = "$"): void {
  if (typeof value === "string") {
    visit(value, path);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => walkStrings(item, visit, `${path}[${i}]`));
    return;
  }
  const rec = asRecord(value);
  if (!rec) return;
  for (const [key, child] of Object.entries(rec)) walkStrings(child, visit, `${path}.${key}`);
}

export function isReadingFoundationsBundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === READING_FOUNDATIONS_META_ID;
}

export function validateReadingFoundationsModule(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;
  const blob = jsonText(data);

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({ code: "MODULE1_META", path: "meta.kind", message: "Module 1 must have meta.kind \"production\".", severity: "error" });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "MODULE1_META",
        path: "meta.notProductionCurriculum",
        message: "Module 1 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
    if (meta["id"] !== READING_FOUNDATIONS_META_ID) {
      emit({
        code: "MODULE1_META",
        path: "meta.id",
        message: `Module 1 meta.id must be ${READING_FOUNDATIONS_META_ID}.`,
        severity: "error",
      });
    }
  }

  if (
    blob.includes("wave-23") ||
    blob.includes("wave23") ||
    blob.includes("WAVE23") ||
    blob.includes("path.literacy.wave23") ||
    blob.includes("unit.literacy.wave23")
  ) {
    emit({
      code: "MODULE1_NO_WAVE23",
      path: "$",
      message: "Module 1 must not declare Wave 23.",
      severity: "error",
    });
  }

  if (
    blob.includes("module1.complete") ||
    blob.includes("module:reading_foundations.complete") ||
    blob.includes("waves.complete") ||
    blob.includes("module1.unlock")
  ) {
    emit({
      code: "MODULE1_COMPLETE",
      path: "$",
      message: "Module 1 must not persist an aggregate complete/unlock key.",
      severity: "error",
    });
  }

  if (
    blob.includes("\"tracing\"") ||
    blob.includes("skill.handwriting") ||
    blob.includes(".writing") ||
    blob.includes("\"dictation\"")
  ) {
    emit({
      code: "MODULE1_WRITING",
      path: "$",
      message: "Module 1 must not introduce writing mastery.",
      severity: "error",
    });
  }

  if (blob.includes("فِي الْبَيْتِ") || blob.includes("word.bayt") || blob.includes("word.huwa") || blob.includes("word.hadha")) {
    emit({
      code: "MODULE1_SCOPE",
      path: "$",
      message: "Module 1 must not introduce Module 3 function-word frames or Module 2 pronouns.",
      severity: "error",
    });
  }

  if (
    blob.includes("skill.shadda") ||
    blob.includes("skill.hamza") ||
    blob.includes("sun_letter") ||
    blob.includes("moon_letter") ||
    blob.includes("module.remaining_letters") ||
    blob.includes("unit.literacy.remaining") ||
    blob.includes("module.letters")
  ) {
    emit({
      code: "MODULE1_MODULE2",
      path: "$",
      message: "Module 1 must not include Module 2 letters, shadda, hamza, or sun/moon work.",
      severity: "error",
    });
  }

  for (const id of FORBIDDEN_LETTERS) {
    if (blob.includes(`"${id}"`)) {
      emit({
        code: "MODULE1_LETTER",
        path: "$",
        message: `Module 1 must not include remaining-letter ${id}.`,
        severity: "error",
      });
    }
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  if (paths.length !== 1) {
    emit({ code: "MODULE1_PATH", path: "paths", message: "Module 1 must declare exactly one path.", severity: "error" });
  }
  const path = asRecord(paths[0]);
  if (path) {
    if (path["id"] !== READING_FOUNDATIONS_PATH_ID) {
      emit({
        code: "MODULE1_PATH",
        path: "paths[0].id",
        message: `Path id must be ${READING_FOUNDATIONS_PATH_ID}.`,
        severity: "error",
      });
    }
    if (path["titleAr"] !== "أُسُسُ الْقِرَاءَة") {
      emit({
        code: "MODULE1_PATH",
        path: "paths[0].titleAr",
        message: "Child-facing module title must be أُسُسُ الْقِرَاءَة.",
        severity: "error",
      });
    }
    const unitIds = asStringArray(path["unitIds"]);
    if (unitIds.join(",") !== READING_FOUNDATIONS_UNIT_IDS.join(",")) {
      emit({
        code: "MODULE1_UNITS",
        path: "paths[0].unitIds",
        message: "Module 1 must list exactly the five unit ids in order.",
        severity: "error",
      });
    }
    if (!asStringArray(path["tags"]).includes(READING_FOUNDATIONS_MODULE_ID)) {
      emit({
        code: "MODULE1_ID",
        path: "paths[0].tags",
        message: `Path tags must include ${READING_FOUNDATIONS_MODULE_ID}.`,
        severity: "error",
      });
    }
  }

  const units = recordById(Array.isArray(rec["units"]) ? rec["units"] : []);
  if (units.size !== 5) {
    emit({ code: "MODULE1_UNITS", path: "units", message: "Module 1 must declare exactly five units.", severity: "error" });
  }
  READING_FOUNDATIONS_UNIT_IDS.forEach((id, index) => {
    const unit = units.get(id);
    if (!unit) {
      emit({ code: "MODULE1_UNITS", path: "units", message: `Missing unit ${id}.`, severity: "error" });
      return;
    }
    if (unit["order"] !== index + 1) {
      emit({
        code: "MODULE1_UNITS",
        path: `units[id=${id}].order`,
        message: `Unit ${id} order must be ${index + 1}.`,
        severity: "error",
      });
    }
    if (unit["titleAr"] !== UNIT_TITLES[id]) {
      emit({
        code: "MODULE1_UNITS",
        path: `units[id=${id}].titleAr`,
        message: `Unit title must be ${UNIT_TITLES[id]}.`,
        severity: "error",
      });
    }
    const prereqs = asStringArray(unit["prereqUnitIds"]);
    if (prereqs.length !== 1 || prereqs[0] !== UNIT_PREREQS[id]) {
      emit({
        code: "MODULE1_GATE",
        path: `units[id=${id}].prereqUnitIds`,
        message: `Unit ${id} prerequisite must be exactly ${UNIT_PREREQS[id]}.`,
        severity: "error",
      });
    }
    const exerciseIds = asStringArray(unit["exerciseIds"]);
    const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);
    let seenScore = false;
    for (const exerciseId of exerciseIds) {
      const exercise = exercises.get(exerciseId);
      if (!exercise) continue;
      const type = exercise["type"];
      if (type === "presentation") {
        if (Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
          emit({
            code: "MODULE1_PRESENTATION",
            path: `exercises[id=${exerciseId}].masteryTargets`,
            message: "Presentations must be unscored / have no mastery targets.",
            severity: "error",
          });
        }
        if (seenScore && id !== READING_FOUNDATIONS_FINAL_UNIT_ID) {
          emit({
            code: "MODULE1_PRESENTATION",
            path: `units[id=${id}].exerciseIds`,
            message: "Presentations must precede scoring in each unit.",
            severity: "error",
          });
        }
      } else {
        seenScore = true;
      }
      const config = asRecord(exercise["config"]);
      if (config && (config["generate"] === true || config["morphology"] === true || config["runtimeForm"] === true)) {
        emit({
          code: "MODULE1_MORPHOLOGY",
          path: `exercises[id=${exerciseId}].config`,
          message: "No runtime morphology. Authored surfaces only.",
          severity: "error",
        });
      }
    }
  });

  const words = recordById(Array.isArray(rec["words"]) ? rec["words"] : []);
  for (const [id, form] of Object.entries(CITATION_FORMS)) {
    const word = words.get(id);
    if (!word) continue;
    if (word["teachingForm"] !== form || word["diacritized"] !== form) {
      emit({
        code: "MODULE1_POLICY_A",
        path: `words[id=${id}].teachingForm`,
        message: `Citation teachingForm/diacritized for ${id} must remain ${form}.`,
        severity: "error",
      });
    }
    for (const letterId of asStringArray(word["letterIds"])) {
      if (!(KNOWN_LETTERS as readonly string[]).includes(letterId)) {
        emit({
          code: "MODULE1_LETTER",
          path: `words[id=${id}].letterIds`,
          message: `${id} uses untaught letter ${letterId}.`,
          severity: "error",
        });
      }
    }
  }

  const sentences = recordById(Array.isArray(rec["sentences"]) ? rec["sentences"] : []);
  const expectedSentences: Array<[string, string, string]> = [
    [KITABUN_SENTENCE_ID, "كِتَابٌ", KITABUN_AUDIO_ID],
    [WALADUN_YALABU_SENTENCE_ID, "وَلَدٌ يَلْعَبُ", WALADUN_YALABU_AUDIO_ID],
    [ALKITABU_KABIRUN_SENTENCE_ID, "الْكِتَابُ كَبِيرٌ", ALKITABU_KABIRUN_AUDIO_ID],
  ];
  if (sentences.size !== 3) {
    emit({
      code: "MODULE1_SENTENCE",
      path: "sentences",
      message: "Module 1 must author exactly three sentence surfaces.",
      severity: "error",
    });
  }
  for (const [id, surface, audio] of expectedSentences) {
    const sentence = sentences.get(id);
    if (!sentence) {
      emit({ code: "MODULE1_SENTENCE", path: "sentences", message: `Missing sentence ${id}.`, severity: "error" });
      continue;
    }
    if (sentence["diacritized"] !== surface) {
      emit({
        code: "MODULE1_SENTENCE",
        path: `sentences[id=${id}].diacritized`,
        message: `Surface must be exactly ${surface}.`,
        severity: "error",
      });
    }
    if (sentence["audioAssetId"] !== audio) {
      emit({
        code: "MODULE1_AUDIO",
        path: `sentences[id=${id}].audioAssetId`,
        message: `Audio must be ${audio}. Do not reuse pause-form word audio.`,
        severity: "error",
      });
    }
  }

  walkStrings(data, (text, path) => {
    if (ARTICLE_PLUS_TANWEEN.test(text) || ILLEGAL_SURFACES.some((row) => text.includes(row))) {
      emit({
        code: "MODULE1_ARTICLE_TANWEEN",
        path,
        message: `Illegal article+tanween or forbidden surface in "${text}".`,
        severity: "error",
      });
    }
  });

  const surfacePaths = (path: string) =>
    path.includes(".diacritized") ||
    path.includes(".teachingForm") ||
    path.includes(".label") ||
    path.includes(".left") ||
    path.includes(".right") ||
    path.includes(".result") ||
    path.includes(".glyph");

  walkStrings(data, (text, path) => {
    if (!surfacePaths(path)) return;
    if (TANWEEN_KASRA.test(text) || TANWEEN_FATHA.test(text)) {
      emit({
        code: "MODULE1_TANWEEN",
        path,
        message: "Module 1 may teach ـٌ only. No ـٍ or ـً.",
        severity: "error",
      });
    }
    if (SHADDA.test(text) || HAMZA_SEATS.test(text) || TAA_MARBUTA.test(text) || ALIF_MAQSURA.test(text)) {
      emit({
        code: "MODULE1_ORTHOGRAPHY",
        path,
        message: `Module 1 must not introduce shadda, hamza, ة, or ى in "${text}".`,
        severity: "error",
      });
    }
  });


  const exercises = Array.isArray(rec["exercises"]) ? rec["exercises"] : [];
  const scoredKeys: string[] = [];
  for (const row of exercises) {
    const exercise = asRecord(row);
    if (!exercise || exercise["type"] === "presentation") continue;
    if (exercise["type"] === "tracing" || exercise["type"] === "dictation" || exercise["type"] === "comprehension") {
      emit({
        code: "MODULE1_ENGINE",
        path: `exercises[id=${exercise["id"]}].type`,
        message: "Module 1 must reuse presentation, audio_to_word, and audio_to_sentence only.",
        severity: "error",
      });
    }
    const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
    for (const target of targets) {
      const recTarget = asRecord(target);
      if (!recTarget) continue;
      const wordId = recTarget["wordId"];
      const sentenceId = recTarget["sentenceId"];
      const skillId = recTarget["skillId"];
      if (typeof wordId === "string") {
        const stem = wordId.startsWith("word.") ? wordId.slice("word.".length) : wordId;
        scoredKeys.push(`word:${stem}.decoding`);
        if (skillId === "skill.long_vowel.madd") {
          emit({
            code: "MODULE1_MADD_ALIF",
            path: `exercises[id=${exercise["id"]}].masteryTargets`,
            message: "Do not map madd-yaa/waw evidence onto skill.long_vowel.madd / madd_alif.",
            severity: "error",
          });
        }
      }
      if (typeof sentenceId === "string") {
        const stem = sentenceId.startsWith("sentence.") ? sentenceId.slice("sentence.".length) : sentenceId;
        scoredKeys.push(`sentence:${stem}.reading`);
      }
    }
    if (exercise["promptAssetId"] === "audio.word.kitab" && exercise["type"] === "audio_to_sentence") {
      emit({
        code: "MODULE1_AUDIO",
        path: `exercises[id=${exercise["id"]}].promptAssetId`,
        message: "Do not reuse pause-form audio.word.kitab for the tanween surface.",
        severity: "error",
      });
    }
  }

  const uniqueKeys = [...new Set(scoredKeys)];
  if (uniqueKeys.sort().join(",") !== [...READING_FOUNDATIONS_REQUIRED_LIVE_KEYS].slice().sort().join(",")) {
    emit({
      code: "MODULE1_LIVE_KEY",
      path: "exercises",
      message: `Module 1 required live keys must be exactly the eight contracted keys. Found: ${uniqueKeys.join(", ")}`,
      severity: "error",
    });
  }

  const skills = recordById(Array.isArray(rec["skills"]) ? rec["skills"] : []);
  for (const id of ["skill.long_vowel.madd_yaa", "skill.long_vowel.madd_waw", "skill.tanween.damm"]) {
    if (!skills.has(id)) {
      emit({ code: "MODULE1_SKILL", path: "skills", message: `Missing teaching skill ${id}.`, severity: "error" });
    }
  }
}

export function validateReadingFoundationsWordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of READING_FOUNDATIONS_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "MODULE1_BAND_A_REF",
        path: "words",
        message: `Module 1 word "${id}" is not in production Band A.`,
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
      ["vocabBand", slice["vocabBand"], source["vocabBand"]],
      ["subBand", slice["subBand"], source["subBand"]],
      ["category", slice["category"], source["category"]],
    ];
    for (const [field, left, right] of fields) {
      if (left !== right) {
        emit({
          code: "MODULE1_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Module 1 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "MODULE1_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Module 1 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
  }
}
