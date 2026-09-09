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
const SUKUN = "\u0652";
const TATWEEL = "\u0640";

const VOWEL_MARK: Record<string, string> = {
  "skill.short_vowel.fatha": FATHA,
  "skill.short_vowel.kasra": KASRA,
  "skill.short_vowel.damma": DAMMA,
  "skill.sukun.basic": SUKUN,
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

/** Neutral scored instruction. Does not name the target syllable. */
export const SYLLABLE_LISTEN_PROMPT = "اِسْتَمِعْ وَاخْتَرِ الْمَقْطَع";

function promptTokens(promptText: string): string[] {
  return promptText.split(/[\s:：،,.!?؟]+/u).filter((token) => token.length > 0);
}

/**
 * True when a prompt prints the complete target syllable as its own token
 * (for example after a colon). A naive substring check is wrong: the word
 * الْمَقْطَع contains the letters of مَ.
 */
export function syllablePromptExposesTarget(promptText: string | undefined, targetText: string): boolean {
  if (!promptText || !targetText) return false;
  return promptTokens(promptText).includes(targetText);
}

/**
 * Child-facing scored prompt. If content prints the target syllable, replace it
 * with a generic listen instruction. Does not branch on unit or letter ids.
 */
export function scoredSyllablePromptText(promptText: string | undefined, targetText: string): string {
  const raw = promptText?.trim();
  if (!raw || syllablePromptExposesTarget(raw, targetText)) return SYLLABLE_LISTEN_PROMPT;
  return raw;
}

export interface ResolvedSyllableBlending {
  target: ResolvedSyllableChoice;
  choices: ResolvedSyllableChoice[];
  /** Scored prompt. Never includes the complete target syllable. */
  promptText: string;
  promptAssetId?: string;
  /**
   * Glyphs shown in the scored prompt area (not choice buttons).
   * Empty for listen-and-choose so the target is not printed before answering.
   * LessonPlayer has no separate demo step; a later native UI can fill this
   * without changing live keys.
   */
  promptGlyphs: readonly string[];
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
  const usesCombiningMark =
    syllable.pattern !== "CVV" && syllable.vowelSkillId !== "skill.long_vowel.madd";
  return {
    id: syllable.id,
    text: syllable.text,
    letterId: syllable.letterId,
    letterGlyph,
    vowelSkillId: syllable.vowelSkillId,
    harakaCarrier: usesCombiningMark ? harakaCarrier(syllable.vowelSkillId) : "",
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
 *
 * Scored presentation is listen-and-choose: audio prompt, printed choices,
 * no complete target glyph outside those choices. The schema has no separate
 * demo-vs-assessment type; LessonPlayer scores the same exercise record, so
 * this adapter does not emit a teaching assembly that would leak the answer.
 */
export function resolveSyllableBlending(
  bundle: CurriculumBundle,
  exercise: ExerciseDefinition,
): ResolvedSyllableBlending | undefined {
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

  const promptAssetId = exercise.promptAssetId ?? target.syllableAudioId;
  return {
    target,
    choices,
    promptText: scoredSyllablePromptText(exercise.promptText, target.text),
    ...(promptAssetId ? { promptAssetId } : {}),
    promptGlyphs: [],
  };
}

export { hashString, shuffleWithSeed } from "./choiceOrder.ts";
