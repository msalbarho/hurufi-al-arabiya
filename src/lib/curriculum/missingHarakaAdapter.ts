/**
 * Resolve portable missing-haraka exercises.
 * No unit-id or letter-specific React branching.
 */
import type { CurriculumBundle, ExerciseDefinition } from "../../content/curriculum/index.ts";
import {
  missingHarakaPromptGlyph,
  resolveSyllableChoice,
  type ResolvedSyllableChoice,
} from "./syllableAdapter.ts";

const SHORT_VOWEL_SKILLS = new Set([
  "skill.short_vowel.fatha",
  "skill.short_vowel.kasra",
  "skill.short_vowel.damma",
]);

function targetSyllableId(exercise: ExerciseDefinition): string | undefined {
  if (exercise.success.correctChoiceId?.startsWith("syllable.")) return exercise.success.correctChoiceId;
  const fromTarget = exercise.masteryTargets?.find((target) => target.syllableId)?.syllableId;
  if (fromTarget) return fromTarget;
  return exercise.contentIds.find((id) => id.startsWith("syllable."));
}

export interface ResolvedMissingHaraka {
  target: ResolvedSyllableChoice;
  letterGlyph: string;
  promptGlyph: string;
  choices: ResolvedSyllableChoice[];
  promptText?: string;
  promptAssetId?: string;
}

export function resolveMissingHaraka(
  bundle: CurriculumBundle,
  exercise: ExerciseDefinition,
): ResolvedMissingHaraka | undefined {
  const targetId = targetSyllableId(exercise);
  const target = targetId ? resolveSyllableChoice(bundle, targetId) : undefined;
  if (!target || !SHORT_VOWEL_SKILLS.has(target.vowelSkillId)) return undefined;

  const listed = (exercise.choices ?? [])
    .filter((choice) => choice.id.startsWith("syllable."))
    .map((choice) => resolveSyllableChoice(bundle, choice.id))
    .filter((row): row is ResolvedSyllableChoice => row !== undefined && SHORT_VOWEL_SKILLS.has(row.vowelSkillId));

  const fromContent = exercise.contentIds
    .filter((id) => id.startsWith("syllable."))
    .map((id) => resolveSyllableChoice(bundle, id))
    .filter((row): row is ResolvedSyllableChoice => row !== undefined && SHORT_VOWEL_SKILLS.has(row.vowelSkillId));

  const source = listed.length ? listed : fromContent;
  const byId = new Map<string, ResolvedSyllableChoice>();
  for (const row of source) {
    if (!byId.has(row.id)) byId.set(row.id, row);
  }
  if (!byId.has(target.id)) byId.set(target.id, target);

  let choices = [...byId.values()].slice(0, 3);
  if (!choices.some((row) => row.id === target.id)) {
    choices = [...choices.slice(0, 2), target];
  }
  if (choices.length < 2 || !choices.some((row) => row.id === target.id)) return undefined;

  return {
    target,
    letterGlyph: target.letterGlyph,
    promptGlyph: missingHarakaPromptGlyph(target.letterGlyph),
    choices,
    ...(exercise.promptText ? { promptText: exercise.promptText } : {}),
    ...(exercise.promptAssetId ? { promptAssetId: exercise.promptAssetId } : {}),
  };
}
