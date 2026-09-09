/**
 * Deterministic Module 2 (Remaining Letters & Orthographic Forms) checks.
 * Only runs when meta.id is the orthographic-foundations production bundle.
 * Waves 1–22 and Module 1 stay frozen. This is not a wave and must not declare Wave 23.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";
import { READING_FOUNDATIONS_FINAL_UNIT_ID } from "./validateReadingFoundationsModule.ts";

export const ORTHOGRAPHIC_FOUNDATIONS_META_ID = "hurufi.production.literacy.orthographic_foundations";
export const ORTHOGRAPHIC_FOUNDATIONS_MODULE_ID = "module.orthographic_foundations";
export const ORTHOGRAPHIC_FOUNDATIONS_PATH_ID = "path.literacy.orthographic_foundations";

export const ORTHOGRAPHIC_FOUNDATIONS_UNIT_IDS = [
  "unit.literacy.orthographic_foundations.haa",
  "unit.literacy.orthographic_foundations.thal_zay",
  "unit.literacy.orthographic_foundations.kha_tha",
  "unit.literacy.orthographic_foundations.sad_dad",
  "unit.literacy.orthographic_foundations.ghain",
  "unit.literacy.orthographic_foundations.tah_zah",
  "unit.literacy.orthographic_foundations.shadda",
  "unit.literacy.orthographic_foundations.hamza",
  "unit.literacy.orthographic_foundations.taa_maqsura",
] as const;

export const ORTHOGRAPHIC_FOUNDATIONS_FIRST_UNIT_ID = ORTHOGRAPHIC_FOUNDATIONS_UNIT_IDS[0];
export const ORTHOGRAPHIC_FOUNDATIONS_FINAL_UNIT_ID = ORTHOGRAPHIC_FOUNDATIONS_UNIT_IDS[8];
export const ORTHOGRAPHIC_FOUNDATIONS_EXTERNAL_PREREQ_UNIT_IDS = [
  READING_FOUNDATIONS_FINAL_UNIT_ID,
] as const;

export const ORTHOGRAPHIC_FOUNDATIONS_LETTER_IDS = [
  "letter.haa",
  "letter.thal",
  "letter.zay",
  "letter.kha",
  "letter.tha",
  "letter.sad",
  "letter.dad",
  "letter.ghain",
  "letter.tah",
  "letter.zah",
] as const;

export const ORTHOGRAPHIC_FOUNDATIONS_WORD_IDS = [
  "word.nahr",
  "word.ladhidh",
  "word.mawz",
  "word.khubz",
  "word.thalj",
  "word.hisan",
  "word.bayd",
  "word.saghir",
  "word.matar",
  "word.zahr",
  "word.sinn",
  "word.ab",
  "word.kura",
  "word.madrasa",
  "word.yara",
] as const;

export const ORTHOGRAPHIC_FOUNDATIONS_BAND_A_WORD_IDS = [
  "word.nahr",
  "word.wajh",
  "word.ladhidh",
  "word.mawz",
  "word.khubz",
  "word.hisan",
  "word.bayd",
  "word.saghir",
  "word.matar",
  "word.sinn",
  "word.qitt",
  "word.ab",
  "word.asad",
  "word.kura",
  "word.madrasa",
  "word.yara",
  "word.ala",
  "word.shams",
  "word.walad",
] as const;

export const ORTHOGRAPHIC_FOUNDATIONS_LOCAL_WORD_IDS = ["word.thalj", "word.zahr"] as const;

export const ALSHAMSU_SENTENCE_ID = "sentence.orthographic_foundations.alshamsu";
export const ALSHAMSU_AUDIO_ID = "audio.sentence.orthographic_foundations.alshamsu";

export const ORTHOGRAPHIC_FOUNDATIONS_REQUIRED_LIVE_KEYS = [
  "letter:haa.sound",
  "letter:thal.sound",
  "letter:zay.sound",
  "letter:kha.sound",
  "letter:tha.sound",
  "letter:sad.sound",
  "letter:dad.sound",
  "letter:ghain.sound",
  "letter:tah.sound",
  "letter:zah.sound",
  "word:nahr.decoding",
  "word:ladhidh.decoding",
  "word:mawz.decoding",
  "word:khubz.decoding",
  "word:thalj.decoding",
  "word:hisan.decoding",
  "word:bayd.decoding",
  "word:saghir.decoding",
  "word:matar.decoding",
  "word:zahr.decoding",
  "word:sinn.decoding",
  "word:ab.decoding",
  "word:kura.decoding",
  "word:madrasa.decoding",
  "word:yara.decoding",
] as const;

const UNIT_TITLES: Record<string, string> = {
  "unit.literacy.orthographic_foundations.haa": "نَقْرَأُ ه",
  "unit.literacy.orthographic_foundations.thal_zay": "ذ وَ ز",
  "unit.literacy.orthographic_foundations.kha_tha": "خ وَ ث",
  "unit.literacy.orthographic_foundations.sad_dad": "ص وَ ض",
  "unit.literacy.orthographic_foundations.ghain": "نَقْرَأُ غ",
  "unit.literacy.orthographic_foundations.tah_zah": "ط وَ ظ",
  "unit.literacy.orthographic_foundations.shadda": "نَقْرَأُ ّ",
  "unit.literacy.orthographic_foundations.hamza": "نَقْرَأُ أ",
  "unit.literacy.orthographic_foundations.taa_maqsura": "ة وَ ى",
};

const UNIT_PREREQS: Record<string, string> = {
  "unit.literacy.orthographic_foundations.haa": READING_FOUNDATIONS_FINAL_UNIT_ID,
  "unit.literacy.orthographic_foundations.thal_zay": "unit.literacy.orthographic_foundations.haa",
  "unit.literacy.orthographic_foundations.kha_tha": "unit.literacy.orthographic_foundations.thal_zay",
  "unit.literacy.orthographic_foundations.sad_dad": "unit.literacy.orthographic_foundations.kha_tha",
  "unit.literacy.orthographic_foundations.ghain": "unit.literacy.orthographic_foundations.sad_dad",
  "unit.literacy.orthographic_foundations.tah_zah": "unit.literacy.orthographic_foundations.ghain",
  "unit.literacy.orthographic_foundations.shadda": "unit.literacy.orthographic_foundations.tah_zah",
  "unit.literacy.orthographic_foundations.hamza": "unit.literacy.orthographic_foundations.shadda",
  "unit.literacy.orthographic_foundations.taa_maqsura": "unit.literacy.orthographic_foundations.hamza",
};

const UNIT_LETTER_SOUND_KEYS: Record<string, readonly string[]> = {
  "unit.literacy.orthographic_foundations.haa": ["letter:haa.sound"],
  "unit.literacy.orthographic_foundations.thal_zay": ["letter:thal.sound", "letter:zay.sound"],
  "unit.literacy.orthographic_foundations.kha_tha": ["letter:kha.sound", "letter:tha.sound"],
  "unit.literacy.orthographic_foundations.sad_dad": ["letter:sad.sound", "letter:dad.sound"],
  "unit.literacy.orthographic_foundations.ghain": ["letter:ghain.sound"],
  "unit.literacy.orthographic_foundations.tah_zah": ["letter:tah.sound", "letter:zah.sound"],
};

const UNIT_WORD_KEYS: Record<string, readonly string[]> = {
  "unit.literacy.orthographic_foundations.haa": ["word:nahr.decoding"],
  "unit.literacy.orthographic_foundations.thal_zay": ["word:ladhidh.decoding", "word:mawz.decoding"],
  "unit.literacy.orthographic_foundations.kha_tha": ["word:khubz.decoding", "word:thalj.decoding"],
  "unit.literacy.orthographic_foundations.sad_dad": ["word:hisan.decoding", "word:bayd.decoding"],
  "unit.literacy.orthographic_foundations.ghain": ["word:saghir.decoding"],
  "unit.literacy.orthographic_foundations.tah_zah": ["word:matar.decoding", "word:zahr.decoding"],
  "unit.literacy.orthographic_foundations.shadda": ["word:sinn.decoding"],
  "unit.literacy.orthographic_foundations.hamza": ["word:ab.decoding"],
  "unit.literacy.orthographic_foundations.taa_maqsura": [
    "word:kura.decoding",
    "word:madrasa.decoding",
    "word:yara.decoding",
  ],
};

const LETTER_INTRODUCED_IN: Record<string, string> = {
  "letter.haa": "unit.literacy.orthographic_foundations.haa",
  "letter.thal": "unit.literacy.orthographic_foundations.thal_zay",
  "letter.zay": "unit.literacy.orthographic_foundations.thal_zay",
  "letter.kha": "unit.literacy.orthographic_foundations.kha_tha",
  "letter.tha": "unit.literacy.orthographic_foundations.kha_tha",
  "letter.sad": "unit.literacy.orthographic_foundations.sad_dad",
  "letter.dad": "unit.literacy.orthographic_foundations.sad_dad",
  "letter.ghain": "unit.literacy.orthographic_foundations.ghain",
  "letter.tah": "unit.literacy.orthographic_foundations.tah_zah",
  "letter.zah": "unit.literacy.orthographic_foundations.tah_zah",
};

const KNOWN_BEFORE: string[] = [
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
];

const FORBIDDEN_FUNCTION_WORDS = ["word.huwa", "word.hiya", "word.huna", "word.hadha", "word.hadhihi"];
const SHADDA = /\u0651/u;
const TANWEEN_KASRA = /\u064D/u;
const TANWEEN_FATHA = /\u064B/u;
const TAA_MARBUTA = /ة/u;
const ALIF_MAQSURA = /ى/u;
const ADVANCED_HAMZA = /[إؤئءآ]/u;
const FORM_GATE = /letter:[a-z]+\.form\.(initial|medial|final)/;

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

function letterLiveKey(letters: Map<string, Record<string, unknown>>, letterId: string): string | undefined {
  const letter = letters.get(letterId);
  const legacy = letter && typeof letter["legacyId"] === "string" ? letter["legacyId"] : undefined;
  if (!legacy) return undefined;
  return `letter:${legacy}.sound`;
}

function wordLiveKey(wordId: string): string {
  const stem = wordId.startsWith("word.") ? wordId.slice("word.".length) : wordId;
  return `word:${stem}.decoding`;
}

function unitIndex(id: string): number {
  return (ORTHOGRAPHIC_FOUNDATIONS_UNIT_IDS as readonly string[]).indexOf(id);
}

export function isOrthographicFoundationsBundle(data: unknown): boolean {
  const rec = asRecord(data);
  if (!rec) return false;
  const meta = asRecord(rec["meta"]);
  return meta?.["id"] === ORTHOGRAPHIC_FOUNDATIONS_META_ID;
}

export function validateOrthographicFoundationsModule(
  data: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const rec = asRecord(data);
  if (!rec) return;
  const blob = jsonText(data);

  const meta = asRecord(rec["meta"]);
  if (meta) {
    if (meta["kind"] !== "production") {
      emit({ code: "MODULE2_META", path: "meta.kind", message: "Module 2 must have meta.kind \"production\".", severity: "error" });
    }
    if (meta["notProductionCurriculum"] !== false) {
      emit({
        code: "MODULE2_META",
        path: "meta.notProductionCurriculum",
        message: "Module 2 must set notProductionCurriculum to false.",
        severity: "error",
      });
    }
    if (meta["id"] !== ORTHOGRAPHIC_FOUNDATIONS_META_ID) {
      emit({
        code: "MODULE2_META",
        path: "meta.id",
        message: `Module 2 meta.id must be ${ORTHOGRAPHIC_FOUNDATIONS_META_ID}.`,
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
    emit({ code: "MODULE2_NO_WAVE23", path: "$", message: "Module 2 must not declare Wave 23.", severity: "error" });
  }

  if (
    blob.includes("module2.complete") ||
    blob.includes("module:orthographic_foundations.complete") ||
    blob.includes("orthography.complete") ||
    blob.includes("alphabet.complete") ||
    blob.includes("waves.complete") ||
    blob.includes("module1.complete")
  ) {
    emit({
      code: "MODULE2_COMPLETE",
      path: "$",
      message: "Module 2 must not persist an aggregate complete key.",
      severity: "error",
    });
  }

  if (blob.includes("letter.dhal") || blob.includes("\"letter.dhal\"")) {
    emit({
      code: "MODULE2_THAL",
      path: "$",
      message: "Use canonical letter.thal, never letter.dhal.",
      severity: "error",
    });
  }

  if (blob.includes("diacritic:shadda") || blob.includes("article:sun_assimilation") || blob.includes("hamza:initial")) {
    emit({
      code: "MODULE2_NAMESPACE",
      path: "$",
      message: "Do not invent diacritic/article/hamza mastery namespaces.",
      severity: "error",
    });
  }

  if (FORM_GATE.test(blob)) {
    emit({
      code: "MODULE2_FORM_GATE",
      path: "$",
      message: "Module 2 must not gate letter form mastery keys.",
      severity: "error",
    });
  }

  if (blob.includes("\"tracing\"") || blob.includes("skill.handwriting") || blob.includes("\"dictation\"")) {
    emit({
      code: "MODULE2_WRITING",
      path: "$",
      message: "Module 2 must not introduce writing mastery.",
      severity: "error",
    });
  }

  if (
    blob.includes("module.functional") ||
    blob.includes("path.literacy.functional") ||
    blob.includes("unit.literacy.functional")
  ) {
    emit({ code: "MODULE2_NO_MODULE3", path: "$", message: "Module 2 must not implement Module 3.", severity: "error" });
  }

  const paths = Array.isArray(rec["paths"]) ? rec["paths"] : [];
  if (paths.length !== 1) {
    emit({ code: "MODULE2_PATH", path: "paths", message: "Module 2 must declare exactly one path.", severity: "error" });
  }
  const path = asRecord(paths[0]);
  if (path) {
    if (path["id"] !== ORTHOGRAPHIC_FOUNDATIONS_PATH_ID) {
      emit({
        code: "MODULE2_PATH",
        path: "paths[0].id",
        message: `Path id must be ${ORTHOGRAPHIC_FOUNDATIONS_PATH_ID}.`,
        severity: "error",
      });
    }
    if (path["titleAr"] !== "الْحُرُوفُ وَالْعَلَامَات") {
      emit({
        code: "MODULE2_PATH",
        path: "paths[0].titleAr",
        message: "Child-facing module title must be الْحُرُوفُ وَالْعَلَامَات.",
        severity: "error",
      });
    }
    const unitIds = asStringArray(path["unitIds"]);
    if (unitIds.join(",") !== ORTHOGRAPHIC_FOUNDATIONS_UNIT_IDS.join(",")) {
      emit({
        code: "MODULE2_UNITS",
        path: "paths[0].unitIds",
        message: "Module 2 must list exactly the nine unit ids in order.",
        severity: "error",
      });
    }
    if (!asStringArray(path["tags"]).includes(ORTHOGRAPHIC_FOUNDATIONS_MODULE_ID)) {
      emit({
        code: "MODULE2_ID",
        path: "paths[0].tags",
        message: `Path tags must include ${ORTHOGRAPHIC_FOUNDATIONS_MODULE_ID}.`,
        severity: "error",
      });
    }
  }

  const units = recordById(Array.isArray(rec["units"]) ? rec["units"] : []);
  if (units.size !== 9) {
    emit({ code: "MODULE2_UNITS", path: "units", message: "Module 2 must declare exactly nine units.", severity: "error" });
  }

  const letters = recordById(Array.isArray(rec["letters"]) ? rec["letters"] : []);
  const words = recordById(Array.isArray(rec["words"]) ? rec["words"] : []);
  const exercises = recordById(Array.isArray(rec["exercises"]) ? rec["exercises"] : []);

  for (const id of ORTHOGRAPHIC_FOUNDATIONS_LETTER_IDS) {
    const letter = letters.get(id);
    if (!letter) {
      emit({ code: "MODULE2_LETTER", path: "letters", message: `Missing letter ${id}.`, severity: "error" });
      continue;
    }
    if (id === "letter.haa" && letter["char"] !== "ه") {
      emit({ code: "MODULE2_LETTER", path: `letters[id=${id}].char`, message: "letter.haa must be ه.", severity: "error" });
    }
    if (id === "letter.haa" && letter["legacyId"] !== "haa") {
      emit({ code: "MODULE2_LETTER", path: `letters[id=${id}].legacyId`, message: "letter.haa legacyId must be haa.", severity: "error" });
    }
  }
  const ha = letters.get("letter.ha");
  if (ha && ha["char"] !== "ح") {
    emit({ code: "MODULE2_LETTER", path: "letters[id=letter.ha].char", message: "letter.ha must remain ح.", severity: "error" });
  }

  for (const id of ORTHOGRAPHIC_FOUNDATIONS_LOCAL_WORD_IDS) {
    const word = words.get(id);
    if (!word) {
      emit({ code: "MODULE2_LOCAL_WORD", path: "words", message: `Missing module-local word ${id}.`, severity: "error" });
      continue;
    }
    const expected = id === "word.thalj" ? "ثَلْج" : "ظَهْر";
    if (word["teachingForm"] !== expected || word["diacritized"] !== expected) {
      emit({
        code: "MODULE2_LOCAL_WORD",
        path: `words[id=${id}].teachingForm`,
        message: `${id} teachingForm/diacritized must be ${expected}.`,
        severity: "error",
      });
    }
  }

  const sentences = recordById(Array.isArray(rec["sentences"]) ? rec["sentences"] : []);
  const sun = sentences.get(ALSHAMSU_SENTENCE_ID);
  if (!sun) {
    emit({ code: "MODULE2_SUN", path: "sentences", message: `Missing SHOW sentence ${ALSHAMSU_SENTENCE_ID}.`, severity: "error" });
  } else {
    if (sun["diacritized"] !== "الشَّمْس") {
      emit({
        code: "MODULE2_SUN",
        path: `sentences[id=${ALSHAMSU_SENTENCE_ID}].diacritized`,
        message: "Sun SHOW surface must be الشَّمْس.",
        severity: "error",
      });
    }
    if (sun["audioAssetId"] !== ALSHAMSU_AUDIO_ID) {
      emit({
        code: "MODULE2_AUDIO",
        path: `sentences[id=${ALSHAMSU_SENTENCE_ID}].audioAssetId`,
        message: `Sun SHOW audio must be ${ALSHAMSU_AUDIO_ID}. Do not concatenate.`,
        severity: "error",
      });
    }
  }

  const scoredKeys: string[] = [];
  const scoredByUnit = new Map<string, string[]>();

  ORTHOGRAPHIC_FOUNDATIONS_UNIT_IDS.forEach((id, index) => {
    const unit = units.get(id);
    if (!unit) {
      emit({ code: "MODULE2_UNITS", path: "units", message: `Missing unit ${id}.`, severity: "error" });
      return;
    }
    if (unit["order"] !== index + 1) {
      emit({
        code: "MODULE2_UNITS",
        path: `units[id=${id}].order`,
        message: `Unit ${id} order must be ${index + 1}.`,
        severity: "error",
      });
    }
    if (unit["titleAr"] !== UNIT_TITLES[id]) {
      emit({
        code: "MODULE2_UNITS",
        path: `units[id=${id}].titleAr`,
        message: `Unit title must be ${UNIT_TITLES[id]}.`,
        severity: "error",
      });
    }
    const prereqs = asStringArray(unit["prereqUnitIds"]);
    if (prereqs.length !== 1 || prereqs[0] !== UNIT_PREREQS[id]) {
      emit({
        code: "MODULE2_GATE",
        path: `units[id=${id}].prereqUnitIds`,
        message: `Unit ${id} prerequisite must be exactly ${UNIT_PREREQS[id]}.`,
        severity: "error",
      });
    }

    const unitKeys: string[] = [];
    for (const exerciseId of asStringArray(unit["exerciseIds"])) {
      const exercise = exercises.get(exerciseId);
      if (!exercise) continue;
      const type = exercise["type"];
      if (type === "presentation") {
        if (Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
          emit({
            code: "MODULE2_PRESENTATION",
            path: `exercises[id=${exerciseId}].masteryTargets`,
            message: "Presentations must be unscored / have no mastery targets.",
            severity: "error",
          });
        }
        continue;
      }
      if (type !== "sound_to_letter" && type !== "audio_to_word") {
        emit({
          code: "MODULE2_ENGINE",
          path: `exercises[id=${exerciseId}].type`,
          message: "Module 2 scored engines are sound_to_letter and audio_to_word only.",
          severity: "error",
        });
      }
      if (type === "sound_to_letter" && id === "unit.literacy.orthographic_foundations.haa") {
        const choices = Array.isArray(exercise["choices"]) ? exercise["choices"] : [];
        const foilHasHa = choices.some((choice) => asRecord(choice)?.["id"] === "letter.ha");
        if (!foilHasHa) {
          emit({
            code: "MODULE2_FOIL",
            path: `exercises[id=${exerciseId}].choices`,
            message: "Unit 1 sound_to_letter foil set must include ح (letter.ha).",
            severity: "error",
          });
        }
      }
      const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
      for (const target of targets) {
        const recTarget = asRecord(target);
        if (!recTarget) continue;
        const letterId = recTarget["letterId"];
        const wordId = recTarget["wordId"];
        const skillId = recTarget["skillId"];
        if (typeof letterId === "string" && skillId === "skill.letter_sounds.core") {
          const key = letterLiveKey(letters, letterId);
          if (key) {
            scoredKeys.push(key);
            unitKeys.push(key);
          }
        }
        if (typeof wordId === "string") {
          const key = wordLiveKey(wordId);
          scoredKeys.push(key);
          unitKeys.push(key);
          if (FORBIDDEN_FUNCTION_WORDS.includes(wordId) || wordId === "word.ala") {
            emit({
              code: "MODULE2_FUNCTION",
              path: `exercises[id=${exerciseId}].masteryTargets`,
              message: `Do not score function-word ${wordId}.`,
              severity: "error",
            });
          }
          const word = words.get(wordId);
          const form = typeof word?.["teachingForm"] === "string" ? String(word["teachingForm"]) : "";
          if (unitIndex(id) < 6 && SHADDA.test(form)) {
            emit({
              code: "MODULE2_SHADDA",
              path: `exercises[id=${exerciseId}]`,
              message: "No scored shadda word before Unit 7.",
              severity: "error",
            });
          }
          if (unitIndex(id) < 7 && /أ/.test(form)) {
            emit({
              code: "MODULE2_HAMZA",
              path: `exercises[id=${exerciseId}]`,
              message: "No scored initial-hamza word before Unit 8.",
              severity: "error",
            });
          }
          if (unitIndex(id) < 8 && (TAA_MARBUTA.test(form) || ALIF_MAQSURA.test(form))) {
            emit({
              code: "MODULE2_ORTHOGRAPHY",
              path: `exercises[id=${exerciseId}]`,
              message: "ة and ى may be scored only in Unit 9.",
              severity: "error",
            });
          }
          for (const usedLetter of asStringArray(word?.["letterIds"])) {
            const introducedIn = LETTER_INTRODUCED_IN[usedLetter];
            if (!introducedIn) continue;
            if (unitIndex(introducedIn) > unitIndex(id)) {
              emit({
                code: "MODULE2_LETTER_ORDER",
                path: `exercises[id=${exerciseId}]`,
                message: `Scored word ${wordId} uses ${usedLetter} before that letter is taught.`,
                severity: "error",
              });
            }
          }
        }
      }
    }
    scoredByUnit.set(id, unitKeys);

    const expected = [...(UNIT_LETTER_SOUND_KEYS[id] ?? []), ...(UNIT_WORD_KEYS[id] ?? [])];
    if (sorted([...new Set(unitKeys)]).join(",") !== sorted(expected).join(",")) {
      emit({
        code: "MODULE2_LIVE_KEY",
        path: `units[id=${id}]`,
        message: `Unit required live keys must be exactly ${expected.join(", ")}. Found: ${[...new Set(unitKeys)].join(", ")}`,
        severity: "error",
      });
    }
  });

  const uniqueKeys = [...new Set(scoredKeys)];
  if (sorted(uniqueKeys).join(",") !== sorted([...ORTHOGRAPHIC_FOUNDATIONS_REQUIRED_LIVE_KEYS]).join(",")) {
    emit({
      code: "MODULE2_LIVE_KEY",
      path: "exercises",
      message: `Module 2 required live keys must be exactly the 25 contracted keys. Found: ${uniqueKeys.join(", ")}`,
      severity: "error",
    });
  }

  if (uniqueKeys.includes("word:ala.decoding") || uniqueKeys.includes("word:qitt.decoding") || uniqueKeys.includes("word:wajh.decoding")) {
    emit({
      code: "MODULE2_OPTIONAL",
      path: "exercises",
      message: "Optional/SHOW words must not become required live keys.",
      severity: "error",
    });
  }

  walkStrings(data, (text, path) => {
    const surface =
      path.includes(".diacritized") ||
      path.includes(".teachingForm") ||
      path.includes(".label") ||
      path.includes(".left") ||
      path.includes(".right") ||
      path.includes(".result") ||
      path.includes(".glyph") ||
      path.includes(".titleAr");
    if (!surface) return;
    if (TANWEEN_KASRA.test(text) || TANWEEN_FATHA.test(text)) {
      emit({
        code: "MODULE2_TANWEEN",
        path,
        message: "Module 2 must not teach ـٍ or ـً.",
        severity: "error",
      });
    }
    if (ADVANCED_HAMZA.test(text)) {
      emit({
        code: "MODULE2_HAMZA_SEAT",
        path,
        message: `Advanced hamza seat in "${text}". Scope is initial أ only.`,
        severity: "error",
      });
    }
  });

  const alaScored = [...exercises.values()].some((exercise) => {
    if (exercise["type"] === "presentation") return false;
    const targets = Array.isArray(exercise["masteryTargets"]) ? exercise["masteryTargets"] : [];
    return targets.some((target) => asRecord(target)?.["wordId"] === "word.ala");
  });
  if (alaScored) {
    emit({ code: "MODULE2_ALA", path: "exercises", message: "عَلَى must remain SHOW-only.", severity: "error" });
  }

  void KNOWN_BEFORE;
  void scoredByUnit;
}

export function validateOrthographicFoundationsWordsAgainstBandA(
  literacy: unknown,
  bandA: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const literacyRec = asRecord(literacy);
  const bandARec = asRecord(bandA);
  if (!literacyRec || !bandARec) return;
  const literacyWords = recordById(Array.isArray(literacyRec["words"]) ? literacyRec["words"] : []);
  const bandAWords = recordById(Array.isArray(bandARec["words"]) ? bandARec["words"] : []);

  for (const id of ORTHOGRAPHIC_FOUNDATIONS_LOCAL_WORD_IDS) {
    if (bandAWords.has(id)) {
      emit({
        code: "MODULE2_BAND_A_REF",
        path: `words[id=${id}]`,
        message: `${id} is module-local and must not exist in frozen Band A.`,
        severity: "error",
      });
    }
  }

  for (const id of ORTHOGRAPHIC_FOUNDATIONS_BAND_A_WORD_IDS) {
    const slice = literacyWords.get(id);
    const source = bandAWords.get(id);
    if (!source) {
      emit({
        code: "MODULE2_BAND_A_REF",
        path: "words",
        message: `Module 2 word "${id}" is not in production Band A.`,
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
          code: "MODULE2_BAND_A_REF",
          path: `words[id=${id}].${field}`,
          message: `Module 2 "${id}".${field} must match Band A.`,
          severity: "error",
        });
      }
    }
    if (sorted(asStringArray(slice["letterIds"])).join(",") !== sorted(asStringArray(source["letterIds"])).join(",")) {
      emit({
        code: "MODULE2_BAND_A_REF",
        path: `words[id=${id}].letterIds`,
        message: `Module 2 "${id}" letterIds must match Band A.`,
        severity: "error",
      });
    }
  }
}
