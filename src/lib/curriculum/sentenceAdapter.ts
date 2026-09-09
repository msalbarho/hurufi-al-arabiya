/**
 * Resolve portable sentences for live lessons.
 * No unit-id or morphology branching — later sentence-reading
 * exercises reuse this. Does not concatenate word audio.
 */
import type {
  CurriculumBundle,
  ExerciseDefinition,
  SentenceDefinition,
  WordDefinition,
} from "../../content/curriculum/index.ts";
import { portableWord } from "./wordAdapter.ts";

export function sentenceIdFromExercise(exercise: ExerciseDefinition): string | undefined {
  if (exercise.success.correctChoiceId?.startsWith("sentence.")) return exercise.success.correctChoiceId;
  const fromTarget = exercise.masteryTargets?.find((target) => target.sentenceId)?.sentenceId;
  if (fromTarget) return fromTarget;
  return exercise.contentIds.find((id) => id.startsWith("sentence."));
}

export function portableSentence(
  bundle: CurriculumBundle,
  id: string | undefined,
): SentenceDefinition | undefined {
  if (!id) return undefined;
  return bundle.sentences.find((row) => row.id === id);
}

export interface ResolvedTextChoice {
  id: string;
  displayText: string;
  audioAssetId?: string;
}

function displayTextForSentence(sentence: SentenceDefinition, label?: string): string {
  return label ?? sentence.diacritized ?? sentence.text ?? sentence.id;
}

function displayTextForWord(word: WordDefinition, label?: string): string {
  return label ?? word.teachingForm ?? word.diacritized ?? word.lemma;
}

function resolveTextChoice(
  bundle: CurriculumBundle,
  id: string,
  label?: string,
): ResolvedTextChoice | undefined {
  if (id.startsWith("sentence.")) {
    const sentence = portableSentence(bundle, id);
    if (!sentence) return undefined;
    const audioAssetId = sentence.audioAssetId;
    return {
      id: sentence.id,
      displayText: displayTextForSentence(sentence, label),
      ...(audioAssetId ? { audioAssetId } : {}),
    };
  }
  if (id.startsWith("word.")) {
    const word = portableWord(bundle, id);
    if (!word) return undefined;
    const audioAssetId = word.audioAssetIds?.citation;
    return {
      id: word.id,
      displayText: displayTextForWord(word, label),
      ...(audioAssetId ? { audioAssetId } : {}),
    };
  }
  if (label && label.trim()) {
    return { id, displayText: label };
  }
  return undefined;
}

export interface ResolvedAudioToSentence {
  target: ResolvedTextChoice;
  choices: ResolvedTextChoice[];
  promptText?: string;
  promptAssetId?: string;
}

function listedChoiceIds(exercise: ExerciseDefinition): string[] {
  return (exercise.choices ?? [])
    .map((choice) => choice.id)
    .filter((id) => id.startsWith("sentence.") || id.startsWith("word."));
}

function listedLabels(exercise: ExerciseDefinition): Map<string, string | undefined> {
  return new Map((exercise.choices ?? []).map((choice) => [choice.id, choice.label]));
}

/**
 * Hear a complete sentence → choose the written sentence.
 * Choices are authored ids (sentences and/or already-taught words).
 * Never invents foil sentences. Two or more legal choices are enough.
 */
export function resolveAudioToSentence(
  bundle: CurriculumBundle,
  exercise: ExerciseDefinition,
): ResolvedAudioToSentence | undefined {
  const labels = listedLabels(exercise);
  const targetId = sentenceIdFromExercise(exercise);
  const target = targetId ? resolveTextChoice(bundle, targetId, labels.get(targetId)) : undefined;
  if (!target) return undefined;

  const listed = listedChoiceIds(exercise)
    .map((id) => resolveTextChoice(bundle, id, labels.get(id)))
    .filter((row): row is ResolvedTextChoice => Boolean(row));

  const fromContent = exercise.contentIds
    .filter((id) => id.startsWith("sentence.") || id.startsWith("word."))
    .map((id) => resolveTextChoice(bundle, id, labels.get(id)))
    .filter((row): row is ResolvedTextChoice => Boolean(row));

  const source = listed.length ? listed : fromContent;
  const byId = new Map<string, ResolvedTextChoice>();
  for (const row of source) {
    if (!byId.has(row.id)) byId.set(row.id, row);
  }
  if (!byId.has(target.id)) byId.set(target.id, target);

  const choices = [...byId.values()];
  if (choices.length < 2 || !choices.some((row) => row.id === target.id)) return undefined;

  const promptAssetId = exercise.promptAssetId ?? target.audioAssetId;
  return {
    target,
    choices,
    ...(exercise.promptText ? { promptText: exercise.promptText } : {}),
    ...(promptAssetId ? { promptAssetId } : {}),
  };
}
