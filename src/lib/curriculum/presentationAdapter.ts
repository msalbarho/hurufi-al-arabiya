/**
 * Unscored teach/demo beat. Completing it marks the activity seen
 * without writing mastery attempts.
 */
import type { CurriculumBundle, ExerciseDefinition } from "../../content/curriculum/index.ts";
import { harakaCarrier, portableSyllable } from "./syllableAdapter.ts";
import { portableWord } from "./wordAdapter.ts";

function isolatedGlyph(bundle: CurriculumBundle, letterId: string): string | undefined {
  return bundle.letters.find((row) => row.id === letterId)?.forms.isolated;
}

export function isPresentationExercise(exercise: Pick<ExerciseDefinition, "type">): boolean {
  return exercise.type === "presentation";
}

export function isReinforcementExercise(exercise: Pick<ExerciseDefinition, "tags" | "config">): boolean {
  if (exercise.tags?.includes("reinforcement")) return true;
  return exercise.config?.["role"] === "reinforcement";
}

/** Mixed review of already-taught words. Distinct from picture reinforcement. */
export function isReviewExercise(exercise: Pick<ExerciseDefinition, "tags" | "config">): boolean {
  if (exercise.tags?.includes("review")) return true;
  return exercise.config?.["role"] === "review";
}

/** Progress key for demo completion. Not a required mastery ref. */
export function getPresentationLiveKey(exerciseId: string): {
  type: "letter";
  id: string;
  liveKey: string;
} {
  const slug = exerciseId.replace(/^exercise\./, "").replace(/\./g, "_");
  const id = `intro.${slug}`;
  return { type: "letter", id, liveKey: `letter:${id}` };
}

export type PresentationShow = "letter" | "cv" | "word" | "chunk" | "glyph" | "contrast";

export interface ResolvedPresentation {
  show: PresentationShow;
  headlineAr: string;
  glyph: string;
  secondaryGlyph?: string;
  resultGlyph?: string;
  promptAssetId?: string;
  fallbackText: string;
}

function configString(exercise: ExerciseDefinition, key: string): string | undefined {
  const value = exercise.config?.[key];
  return typeof value === "string" ? value : undefined;
}

function withPrompt(assetId: string | undefined): { promptAssetId?: string } {
  return assetId ? { promptAssetId: assetId } : {};
}

export function resolvePresentation(
  bundle: CurriculumBundle,
  exercise: ExerciseDefinition,
): ResolvedPresentation | undefined {
  const showRaw = configString(exercise, "show") ?? "letter";
  const show: PresentationShow =
    showRaw === "cv" ||
    showRaw === "word" ||
    showRaw === "chunk" ||
    showRaw === "glyph" ||
    showRaw === "contrast"
      ? showRaw
      : "letter";
  const headlineAr = (exercise.promptText ?? "اُنْظُرْ وَاسْتَمِعْ").trim();

  if (show === "glyph") {
    const glyph = configString(exercise, "glyph");
    if (!glyph) return undefined;
    return {
      show,
      headlineAr,
      glyph,
      ...withPrompt(exercise.promptAssetId),
      fallbackText: glyph,
    };
  }

  if (show === "contrast") {
    const left = configString(exercise, "left");
    const right = configString(exercise, "right");
    if (!left || !right) return undefined;
    return {
      show,
      headlineAr,
      glyph: left,
      secondaryGlyph: right,
      ...withPrompt(exercise.promptAssetId),
      fallbackText: right,
    };
  }

  if (show === "chunk") {
    const left = configString(exercise, "left");
    const right = configString(exercise, "right");
    const result = configString(exercise, "result");
    if (!left || !right || !result) return undefined;
    return {
      show,
      headlineAr,
      glyph: left,
      secondaryGlyph: right,
      resultGlyph: result,
      ...withPrompt(exercise.promptAssetId),
      fallbackText: result,
    };
  }

  if (show === "word") {
    const wordId = configString(exercise, "wordId") ?? exercise.contentIds.find((id) => id.startsWith("word."));
    const word = portableWord(bundle, wordId);
    if (!word) return undefined;
    const glyph = word.teachingForm ?? word.diacritized;
    return {
      show,
      headlineAr,
      glyph,
      ...withPrompt(exercise.promptAssetId ?? word.audioAssetIds?.citation),
      fallbackText: glyph,
    };
  }

  if (show === "cv") {
    const syllableId =
      configString(exercise, "syllableId") ?? exercise.contentIds.find((id) => id.startsWith("syllable."));
    const syllable = portableSyllable(bundle, syllableId);
    if (!syllable) return undefined;
    const letterGlyph = isolatedGlyph(bundle, syllable.letterId);
    if (!letterGlyph) return undefined;
    return {
      show,
      headlineAr,
      glyph: letterGlyph,
      secondaryGlyph: harakaCarrier(syllable.vowelSkillId),
      resultGlyph: syllable.text,
      ...withPrompt(exercise.promptAssetId ?? syllable.audioAssetId),
      fallbackText: syllable.text,
    };
  }

  const letterId = configString(exercise, "letterId") ?? exercise.contentIds.find((id) => id.startsWith("letter."));
  const glyph = letterId ? isolatedGlyph(bundle, letterId) : undefined;
  if (!glyph || !letterId) return undefined;
  const letter = bundle.letters.find((row) => row.id === letterId);
  return {
    show: "letter",
    headlineAr,
    glyph,
    ...withPrompt(exercise.promptAssetId ?? letter?.audioAssetIds?.phoneme ?? letter?.audioAssetIds?.name),
    fallbackText: glyph,
  };
}
