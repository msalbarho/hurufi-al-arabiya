/**
 * Resolve portable words for live lessons.
 * No unit-id or lemma branching — later word-decoding exercises reuse this.
 * Does not search the 720-word bank.
 */
import type { CurriculumBundle, ExerciseDefinition, WordDefinition } from "../../content/curriculum/index.ts";
import { prototypeVisualForWord, type PrototypeWordVisual } from "./prototypeWordVisual.ts";

export { prototypeVisualForWord, type PrototypeWordVisual } from "./prototypeWordVisual.ts";

export function wordIdFromExercise(exercise: ExerciseDefinition): string | undefined {
  if (exercise.success.correctChoiceId?.startsWith("word.")) return exercise.success.correctChoiceId;
  const fromTarget = exercise.masteryTargets?.find((target) => target.wordId)?.wordId;
  if (fromTarget) return fromTarget;
  return exercise.contentIds.find((id) => id.startsWith("word."));
}

export function portableWord(
  bundle: CurriculumBundle,
  id: string | undefined,
): WordDefinition | undefined {
  if (!id) return undefined;
  return bundle.words.find((row) => row.id === id);
}

export interface ResolvedWordChoice {
  id: string;
  lemma: string;
  displayText: string;
  audioAssetId?: string;
}

function displayTextFor(word: WordDefinition, label?: string): string {
  return word.teachingForm ?? word.diacritized ?? label ?? word.lemma;
}

export function resolveWordChoice(
  bundle: CurriculumBundle,
  wordId: string,
  label?: string,
): ResolvedWordChoice | undefined {
  const word = portableWord(bundle, wordId);
  if (!word) return undefined;
  const audioAssetId = word.audioAssetIds?.citation;
  return {
    id: word.id,
    lemma: word.lemma,
    displayText: displayTextFor(word, label),
    ...(audioAssetId ? { audioAssetId } : {}),
  };
}

export interface ResolvedAudioToWord {
  target: ResolvedWordChoice;
  choices: ResolvedWordChoice[];
  promptText?: string;
  promptAssetId?: string;
}

/**
 * Target + distractors from the exercise JSON.
 * If choices are omitted, other `word.*` contentIds on the same exercise are used.
 * Never invents words from Band A or the 720-word bank.
 */
export function resolveAudioToWord(
  bundle: CurriculumBundle,
  exercise: ExerciseDefinition,
): ResolvedAudioToWord | undefined {
  const targetId = wordIdFromExercise(exercise);
  const listedLabels = new Map(
    (exercise.choices ?? [])
      .filter((choice) => choice.id.startsWith("word."))
      .map((choice) => [choice.id, choice.label]),
  );
  const target = targetId ? resolveWordChoice(bundle, targetId, listedLabels.get(targetId)) : undefined;
  if (!target) return undefined;

  const listed = (exercise.choices ?? [])
    .filter((choice) => choice.id.startsWith("word."))
    .map((choice) => resolveWordChoice(bundle, choice.id, choice.label))
    .filter((row): row is ResolvedWordChoice => Boolean(row));

  const fromContent = exercise.contentIds
    .filter((id) => id.startsWith("word."))
    .map((id) => resolveWordChoice(bundle, id, listedLabels.get(id)))
    .filter((row): row is ResolvedWordChoice => Boolean(row));

  const source = listed.length ? listed : fromContent;
  const byId = new Map<string, ResolvedWordChoice>();
  for (const row of source) {
    if (!byId.has(row.id)) byId.set(row.id, row);
  }
  if (!byId.has(target.id)) byId.set(target.id, target);

  let choices = [...byId.values()].slice(0, 3);
  if (!choices.some((row) => row.id === target.id)) {
    choices = [...choices.slice(0, 2), target];
  }
  if (choices.length < 2 || !choices.some((row) => row.id === target.id)) return undefined;

  const promptAssetId = exercise.promptAssetId ?? target.audioAssetId;
  return {
    target,
    choices,
    ...(exercise.promptText ? { promptText: exercise.promptText } : {}),
    ...(promptAssetId ? { promptAssetId } : {}),
  };
}

export interface ResolvedPictureToWord {
  target: ResolvedWordChoice;
  choices: ResolvedWordChoice[];
  visual: PrototypeWordVisual;
  imageAssetId?: string;
  promptText?: string;
}

/**
 * Picture → written word. Visuals come from the prototype emoji source
 * until logical image assets have files. No spoken target.
 */
export function resolvePictureToWord(
  bundle: CurriculumBundle,
  exercise: ExerciseDefinition,
): ResolvedPictureToWord | undefined {
  const targetId = wordIdFromExercise(exercise);
  const word = portableWord(bundle, targetId);
  const listedLabels = new Map(
    (exercise.choices ?? [])
      .filter((choice) => choice.id.startsWith("word."))
      .map((choice) => [choice.id, choice.label]),
  );
  const target = targetId ? resolveWordChoice(bundle, targetId, listedLabels.get(targetId)) : undefined;
  if (!word || !target) return undefined;

  const listed = (exercise.choices ?? [])
    .filter((choice) => choice.id.startsWith("word."))
    .map((choice) => resolveWordChoice(bundle, choice.id, choice.label))
    .filter((row): row is ResolvedWordChoice => Boolean(row));

  const fromContent = exercise.contentIds
    .filter((id) => id.startsWith("word."))
    .map((id) => resolveWordChoice(bundle, id, listedLabels.get(id)))
    .filter((row): row is ResolvedWordChoice => Boolean(row));

  const source = listed.length ? listed : fromContent;
  const byId = new Map<string, ResolvedWordChoice>();
  for (const row of source) {
    if (!byId.has(row.id)) byId.set(row.id, row);
  }
  if (!byId.has(target.id)) byId.set(target.id, target);

  let choices = [...byId.values()].slice(0, 3);
  if (!choices.some((row) => row.id === target.id)) {
    choices = [...choices.slice(0, 2), target];
  }
  if (choices.length < 2 || !choices.some((row) => row.id === target.id)) return undefined;

  const visual = prototypeVisualForWord(word);
  if (visual.kind === "none") return undefined;

  const imageAssetId =
    (typeof exercise.promptAssetId === "string" && exercise.promptAssetId.startsWith("image.")
      ? exercise.promptAssetId
      : undefined) ?? word.imageAssetId;

  return {
    target,
    choices,
    visual,
    ...(imageAssetId ? { imageAssetId } : {}),
    ...(exercise.promptText ? { promptText: exercise.promptText } : {}),
  };
}
