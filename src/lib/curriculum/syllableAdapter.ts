/**
 * Resolve portable syllables for live lessons.
 * No unit-id branching — later blending exercises reuse this.
 */
import type {
  CurriculumBundle,
  ExerciseDefinition,
  SyllableDefinition,
} from "../../content/curriculum/index.ts";

const FATHA = "\u064E";
const DAMMA = "\u064F";
const KASRA = "\u0650";
const TATWEEL = "\u0640";

const VOWEL_MARK: Record<string, string> = {
  "skill.short_vowel.fatha": FATHA,
  "skill.short_vowel.kasra": KASRA,
  "skill.short_vowel.damma": DAMMA,
};

export function portableSyllable(
  bundle: CurriculumBundle,
  id: string | undefined,
): SyllableDefinition | undefined {
  if (!id) return undefined;
  return bundle.syllables?.find((row) => row.id === id);
}

export function vowelMarkForSkill(vowelSkillId: string): string | undefined {
  return VOWEL_MARK[vowelSkillId];
}

/** Tatweel + haraka so the mark sits on a real Arabic carrier, not a Latin plus sign. */
export function harakaCarrier(vowelSkillId: string): string {
  return TATWEEL + (vowelMarkForSkill(vowelSkillId) ?? "");
}

/** Empty tatweel carrier for a missing-haraka slot (does not reveal the vowel). */
export function emptyHarakaCarrier(): string {
  return TATWEEL;
}

/** Letter + tatweel so the child sees where a short vowel belongs. */
export function missingHarakaPromptGlyph(letterGlyph: string): string {
  return letterGlyph + TATWEEL;
}

export interface ResolvedSyllableChoice {
  id: string;
  text: string;
  letterId: string;
  letterGlyph: string;
  vowelSkillId: string;
  harakaCarrier: string;
  letterAudioId?: string;
  syllableAudioId?: string;
}

function letterAudioId(bundle: CurriculumBundle, letterId: string): string | undefined {
  const letter = bundle.letters.find((row) => row.id === letterId);
  return letter?.audioAssetIds?.phoneme ?? letter?.audioAssetIds?.name;
}

export function resolveSyllableChoice(
  bundle: CurriculumBundle,
  syllableId: string,
): ResolvedSyllableChoice | undefined {
  const syllable = portableSyllable(bundle, syllableId);
  if (!syllable) return undefined;
  const letter = bundle.letters.find((row) => row.id === syllable.letterId);
  const letterGlyph = letter?.forms.isolated ?? letter?.char ?? "";
  if (!letterGlyph) return undefined;
  const letterAudio = letterAudioId(bundle, syllable.letterId);
  return {
    id: syllable.id,
    text: syllable.text,
    letterId: syllable.letterId,
    letterGlyph,
    vowelSkillId: syllable.vowelSkillId,
    harakaCarrier: harakaCarrier(syllable.vowelSkillId),
    ...(letterAudio ? { letterAudioId: letterAudio } : {}),
    ...(syllable.audioAssetId ? { syllableAudioId: syllable.audioAssetId } : {}),
  };
}

function syllableIdFromExercise(exercise: ExerciseDefinition): string | undefined {
  if (exercise.success.correctChoiceId?.startsWith("syllable.")) return exercise.success.correctChoiceId;
  const fromTarget = exercise.masteryTargets?.find((target) => target.syllableId)?.syllableId;
  if (fromTarget) return fromTarget;
  return exercise.contentIds.find((id) => id.startsWith("syllable."));
}

/**
 * Target + distractors from the exercise JSON.
 * If choices are omitted, other `syllable.*` contentIds on the same exercise are used.
 * Never invents syllables from the rest of the alphabet.
 */
export function resolveSyllableBlending(
  bundle: CurriculumBundle,
  exercise: ExerciseDefinition,
): { target: ResolvedSyllableChoice; choices: ResolvedSyllableChoice[] } | undefined {
  const targetId = syllableIdFromExercise(exercise);
  const target = targetId ? resolveSyllableChoice(bundle, targetId) : undefined;
  if (!target) return undefined;

  const listed = (exercise.choices ?? [])
    .map((choice) => resolveSyllableChoice(bundle, choice.id))
    .filter((row): row is ResolvedSyllableChoice => Boolean(row));

  const fromContent = exercise.contentIds
    .filter((id) => id.startsWith("syllable."))
    .map((id) => resolveSyllableChoice(bundle, id))
    .filter((row): row is ResolvedSyllableChoice => Boolean(row));

  const source = listed.length ? listed : fromContent.length ? fromContent : [target];
  const byId = new Map<string, ResolvedSyllableChoice>();
  for (const row of source) {
    if (!byId.has(row.id)) byId.set(row.id, row);
  }
  if (!byId.has(target.id)) byId.set(target.id, target);

  const ordered = [...byId.values()];
  let choices = ordered.slice(0, 3);
  if (!choices.some((row) => row.id === target.id)) {
    choices = [...choices.slice(0, 2), target];
  }
  return { target, choices };
}

export { hashString, shuffleWithSeed } from "./choiceOrder.ts";
