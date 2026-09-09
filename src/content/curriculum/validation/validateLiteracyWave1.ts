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

export const WAVE1_FINAL_UNIT_ID = "unit.literacy.wave1.jim_ya_decode";

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

  validateWave1TeachingContract(data, emit);
}

const ADULT_CHILD_COPY = ["يَفُكُّ", "الشَّكْلُ الْأَوْسَط", "الْحَرَكَات"];

function configString(row: Record<string, unknown>, key: string): string | undefined {
  if (!isRecord(row["config"])) return undefined;
  const value = row["config"][key];
  return typeof value === "string" ? value : undefined;
}

function isReinforcementRow(row: Record<string, unknown>): boolean {
  return asStringArray(row["tags"]).includes("reinforcement") || configString(row, "role") === "reinforcement";
}

function letterIdsMentioned(row: Record<string, unknown>): string[] {
  const ids = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === "string" && value.startsWith("letter.")) ids.add(value);
  };
  asStringArray(row["contentIds"]).forEach(add);
  if (isRecord(row["success"])) add(row["success"]["correctChoiceId"]);
  if (isRecord(row["config"])) add(row["config"]["letterId"]);
  if (Array.isArray(row["choices"])) {
    for (const choice of row["choices"]) {
      if (isRecord(choice)) add(choice["id"]);
    }
  }
  if (Array.isArray(row["masteryTargets"])) {
    for (const target of row["masteryTargets"]) {
      if (isRecord(target)) add(target["letterId"]);
    }
  }
  return [...ids];
}

function wordIdsMentioned(row: Record<string, unknown>): string[] {
  const ids = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === "string" && value.startsWith("word.")) ids.add(value);
  };
  asStringArray(row["contentIds"]).forEach(add);
  if (isRecord(row["success"])) add(row["success"]["correctChoiceId"]);
  if (isRecord(row["config"])) add(row["config"]["wordId"]);
  if (Array.isArray(row["choices"])) {
    for (const choice of row["choices"]) {
      if (isRecord(choice)) add(choice["id"]);
    }
  }
  if (Array.isArray(row["masteryTargets"])) {
    for (const target of row["masteryTargets"]) {
      if (isRecord(target)) add(target["wordId"]);
    }
  }
  return [...ids];
}

function teachingLetterIds(
  row: Record<string, unknown>,
  syllables: Map<string, Record<string, unknown>>,
): string[] {
  const type = row["type"];
  if (type === "presentation") {
    const show = configString(row, "show") ?? "letter";
    if (show === "word") return [];
    if (show === "cv") {
      const syllableId =
        configString(row, "syllableId") ?? asStringArray(row["contentIds"]).find((id) => id.startsWith("syllable."));
      const syllable = syllableId ? syllables.get(syllableId) : undefined;
      return typeof syllable?.["letterId"] === "string" ? [syllable["letterId"]] : [];
    }
    const letterId =
      configString(row, "letterId") ?? asStringArray(row["contentIds"]).find((id) => id.startsWith("letter."));
    return letterId ? [letterId] : [];
  }
  if (type === "sound_to_letter") {
    const id = isRecord(row["success"]) ? row["success"]["correctChoiceId"] : undefined;
    return typeof id === "string" && id.startsWith("letter.") ? [id] : [];
  }
  if (type === "letter_recognition") {
    const form = configString(row, "targetForm") ?? "isolated";
    if (form !== "isolated") return [];
    const id =
      configString(row, "letterId") ??
      (isRecord(row["success"]) && typeof row["success"]["correctChoiceId"] === "string"
        ? row["success"]["correctChoiceId"]
        : undefined);
    return typeof id === "string" && id.startsWith("letter.") ? [id] : [];
  }
  return [];
}

function scoredSoundLetter(row: Record<string, unknown>): string | undefined {
  if (row["type"] !== "sound_to_letter" || isReinforcementRow(row)) return undefined;
  const id = isRecord(row["success"]) ? row["success"]["correctChoiceId"] : undefined;
  return typeof id === "string" && id.startsWith("letter.") ? id : undefined;
}

function scoredDecodingWord(row: Record<string, unknown>): string | undefined {
  if (row["type"] !== "audio_to_word" || isReinforcementRow(row)) return undefined;
  const hasDecoding = Array.isArray(row["masteryTargets"])
    ? row["masteryTargets"].some(
        (target) => isRecord(target) && target["skillId"] === "skill.word_decoding.simple",
      )
    : false;
  if (!hasDecoding) return undefined;
  const id = isRecord(row["success"]) ? row["success"]["correctChoiceId"] : undefined;
  return typeof id === "string" && id.startsWith("word.") ? id : undefined;
}

/**
 * Educational contract: claimed letters are taught as targets before they
 * appear as foils or in scored decoding words. Picture matching is not the
 * first decoding evidence. Unit 5 claims fatha contrast, not the whole
 * haraka system.
 */
function validateWave1TeachingContract(
  data: Record<string, unknown>,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  const exercises = recordById(Array.isArray(data["exercises"]) ? data["exercises"] : []);
  const units = recordById(Array.isArray(data["units"]) ? data["units"] : []);
  const words = recordById(Array.isArray(data["words"]) ? data["words"] : []);
  const syllables = recordById(Array.isArray(data["syllables"]) ? data["syllables"] : []);
  const paths = Array.isArray(data["paths"]) ? data["paths"] : [];
  const path = paths.find((row) => isRecord(row) && row["id"] === WAVE1_PATH_ID);
  if (!isRecord(path)) return;

  const introduced = new Set<string>();
  const scoredSound = new Set<string>();
  const audioDecoded = new Set<string>();
  const presentationLiveKeys = new Set<string>();

  for (const unitId of asStringArray(path["unitIds"])) {
    const unit = units.get(unitId);
    if (!unit) continue;
    const titleAr = typeof unit["titleAr"] === "string" ? unit["titleAr"] : "";
    const childGoalAr = typeof unit["childGoalAr"] === "string" ? unit["childGoalAr"] : "";
    for (const phrase of ADULT_CHILD_COPY) {
      if (titleAr.includes(phrase) || childGoalAr.includes(phrase)) {
        emit({
          code: "WAVE1_CHILD_LANGUAGE",
          path: `units[id=${unitId}]`,
          message: `Unit "${unitId}" child-facing copy still uses adult curriculum language (${phrase}).`,
          severity: "error",
        });
      }
    }

    for (const [exerciseIndex, exerciseId] of asStringArray(unit["exerciseIds"]).entries()) {
      const exercise = exercises.get(exerciseId);
      if (!exercise) continue;
      const pathRef = `units[id=${unitId}].exerciseIds[${exerciseIndex}]`;

      if (exercise["type"] === "presentation") {
        if (Array.isArray(exercise["masteryTargets"]) && exercise["masteryTargets"].length > 0) {
          emit({
            code: "WAVE1_DEMO",
            path: pathRef,
            message: `Presentation "${exerciseId}" must not declare mastery targets.`,
            severity: "error",
          });
        }
        const successType = isRecord(exercise["success"]) ? exercise["success"]["type"] : undefined;
        if (successType !== "continue") {
          emit({
            code: "WAVE1_DEMO",
            path: pathRef,
            message: `Presentation "${exerciseId}" must use success type "continue".`,
            severity: "error",
          });
        }
        const slug = exerciseId.replace(/^exercise\./, "").replace(/\./g, "_");
        const liveKey = `letter:intro.${slug}`;
        if (presentationLiveKeys.has(liveKey)) {
          emit({
            code: "WAVE1_LIVE_KEY",
            path: pathRef,
            message: `Presentation live key "${liveKey}" collides with another demo.`,
            severity: "error",
          });
        }
        presentationLiveKeys.add(liveKey);
        if (liveKey === "letter:mim.sound" || liveKey === "letter:mim.tracing") {
          emit({
            code: "WAVE1_LIVE_KEY",
            path: pathRef,
            message: `Presentation live key "${liveKey}" collides with a stable Wave 1 mastery key.`,
            severity: "error",
          });
        }
      }

      const teaching = teachingLetterIds(exercise, syllables);
      for (const letterId of letterIdsMentioned(exercise)) {
        if (teaching.includes(letterId)) continue;
        if (!introduced.has(letterId)) {
          emit({
            code: "WAVE1_TEACH_ORDER",
            path: pathRef,
            message: `Exercise "${exerciseId}" uses letter "${letterId}" before it is taught as a target.`,
            severity: "error",
          });
        }
      }

      for (const wordId of wordIdsMentioned(exercise)) {
        const word = words.get(wordId);
        const needed = asStringArray(word?.["letterIds"]);
        for (const letterId of needed) {
          if (!introduced.has(letterId) && !teaching.includes(letterId)) {
            emit({
              code: "WAVE1_TEACH_ORDER",
              path: pathRef,
              message: `Word "${wordId}" in "${exerciseId}" needs letter "${letterId}" before that letter is taught.`,
              severity: "error",
            });
          }
        }
      }

      const pictureType = exercise["type"] === "picture_to_word" || exercise["type"] === "word_to_picture";
      const decodingWord =
        scoredDecodingWord(exercise) ??
        (pictureType && isRecord(exercise["success"]) && typeof exercise["success"]["correctChoiceId"] === "string"
          ? String(exercise["success"]["correctChoiceId"])
          : undefined);
      if (pictureType && decodingWord?.startsWith("word.") && !audioDecoded.has(decodingWord)) {
        emit({
          code: "WAVE1_DECODING_EVIDENCE",
          path: pathRef,
          message: `Picture exercise "${exerciseId}" cannot be the first decoding evidence for "${decodingWord}".`,
          severity: "error",
        });
      }

      for (const letterId of teaching) introduced.add(letterId);
      const soundLetter = scoredSoundLetter(exercise);
      if (soundLetter) scoredSound.add(soundLetter);
      const decoded = scoredDecodingWord(exercise);
      if (decoded) audioDecoded.add(decoded);
    }
  }

  for (const letterId of WAVE1_LETTER_IDS) {
    if (!scoredSound.has(letterId)) {
      emit({
        code: "WAVE1_LETTER_TARGET",
        path: "exercises",
        message: `Wave 1 letter "${letterId}" has no scored hear/identify exercise.`,
        severity: "error",
      });
    }
  }

  const unit4 = units.get("unit.literacy.wave1.dal_qadam");
  if (unit4) {
    const titleAr = typeof unit4["titleAr"] === "string" ? unit4["titleAr"] : "";
    if (titleAr.includes("قَدَم") || titleAr.includes("قَلَم")) {
      emit({
        code: "WAVE1_UNIT4_ALIGN",
        path: "units[id=unit.literacy.wave1.dal_qadam].titleAr",
        message: "Unit 4 title must not reveal the scored word.",
        severity: "error",
      });
    }
    const required = asStringArray(isRecord(unit4["mastery"]) ? unit4["mastery"]["requiredSkillIds"] : []);
    if (!required.includes("skill.letter_sounds.core") || !required.includes("skill.word_decoding.simple")) {
      emit({
        code: "WAVE1_UNIT4_ALIGN",
        path: "units[id=unit.literacy.wave1.dal_qadam].mastery.requiredSkillIds",
        message: "Unit 4 mastery must require dal sound evidence and قَدَم decoding.",
        severity: "error",
      });
    }
    const ids = asStringArray(unit4["exerciseIds"]);
    const teachesDal = ids.some((id) => {
      const row = exercises.get(id);
      return Boolean(row && scoredSoundLetter(row) === "letter.dal");
    });
    const scoresQadam = ids.some((id) => {
      const row = exercises.get(id);
      return Boolean(row && scoredDecodingWord(row) === "word.qadam");
    });
    if (!teachesDal || !scoresQadam) {
      emit({
        code: "WAVE1_UNIT4_ALIGN",
        path: "units[id=unit.literacy.wave1.dal_qadam].exerciseIds",
        message: "Unit 4 must teach د as a target and score قَدَم as a reading word.",
        severity: "error",
      });
    }
  }

  const unit5 = units.get("unit.literacy.wave1.waw_walad_vowels");
  if (unit5) {
    const required = asStringArray(isRecord(unit5["mastery"]) ? unit5["mastery"]["requiredSkillIds"] : []);
    if (required.includes("skill.short_vowel.kasra") || required.includes("skill.short_vowel.damma")) {
      emit({
        code: "WAVE1_HARAKA_SCOPE",
        path: "units[id=unit.literacy.wave1.waw_walad_vowels].mastery.requiredSkillIds",
        message:
          "Unit 5 must not require kasra/damma mastery; fatha contrast is the honest Wave 1 vowel scope.",
        severity: "error",
      });
    }
  }
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
