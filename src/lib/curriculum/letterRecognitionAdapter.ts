/**
 * Resolve portable letter-recognition exercises.
 * No unit-id branching — later letters/forms reuse this.
 */
import type {
  CurriculumBundle,
  ExerciseDefinition,
  LetterFormSlot,
} from "../../content/curriculum/index.ts";

const FORMS: ReadonlySet<string> = new Set(["isolated", "initial", "medial", "final"]);

export interface ResolvedLetterChoice {
  id: string;
  glyph: string;
}

export interface ResolvedLetterRecognition {
  targetLetterId: string;
  targetForm: LetterFormSlot;
  promptGlyph: string;
  promptText?: string;
  promptAssetId?: string;
  choices: ResolvedLetterChoice[];
}

export function isLegalLetterForm(nonConnecting: boolean | undefined, form: string): boolean {
  if (!FORMS.has(form)) return false;
  if (nonConnecting && (form === "initial" || form === "medial")) return false;
  return true;
}

function asForm(value: unknown): LetterFormSlot | undefined {
  return typeof value === "string" && FORMS.has(value) ? (value as LetterFormSlot) : undefined;
}

function configString(exercise: ExerciseDefinition, key: string): string | undefined {
  const value = exercise.config?.[key];
  return typeof value === "string" ? value : undefined;
}

function letterGlyph(
  bundle: CurriculumBundle,
  letterId: string,
  form: LetterFormSlot,
): string | undefined {
  const letter = bundle.letters.find((row) => row.id === letterId);
  if (!letter) return undefined;
  if (!isLegalLetterForm(letter.nonConnecting, form)) return undefined;
  return letter.forms[form] || letter.char;
}

function targetLetterId(exercise: ExerciseDefinition): string | undefined {
  const fromConfig = configString(exercise, "letterId");
  if (fromConfig?.startsWith("letter.")) return fromConfig;
  const fromTarget = exercise.masteryTargets?.find((target) => target.letterId)?.letterId;
  if (fromTarget) return fromTarget;
  if (exercise.success.correctChoiceId?.startsWith("letter.")) return exercise.success.correctChoiceId;
  return exercise.contentIds.find((id) => id.startsWith("letter."));
}

function targetForm(exercise: ExerciseDefinition): LetterFormSlot {
  return (
    asForm(exercise.config?.["targetForm"]) ??
    exercise.masteryTargets?.find((target) => target.letterForm)?.letterForm ??
    "isolated"
  );
}

function resolveChoice(bundle: CurriculumBundle, letterId: string): ResolvedLetterChoice | undefined {
  const glyph = letterGlyph(bundle, letterId, "isolated");
  if (!glyph) return undefined;
  return { id: letterId, glyph };
}

/**
 * Target form + identity choices from the exercise JSON.
 * If choices are omitted, other `letter.*` contentIds on the same exercise are used.
 * Never invents letters from the rest of the alphabet.
 */
export function resolveLetterRecognition(
  bundle: CurriculumBundle,
  exercise: ExerciseDefinition,
): ResolvedLetterRecognition | undefined {
  const letterId = targetLetterId(exercise);
  const form = targetForm(exercise);
  if (!letterId) return undefined;
  const promptGlyph = letterGlyph(bundle, letterId, form);
  if (!promptGlyph) return undefined;

  const listed = (exercise.choices ?? [])
    .map((choice) => resolveChoice(bundle, choice.id))
    .filter((row): row is ResolvedLetterChoice => Boolean(row));

  const fromContent = exercise.contentIds
    .filter((id) => id.startsWith("letter."))
    .map((id) => resolveChoice(bundle, id))
    .filter((row): row is ResolvedLetterChoice => Boolean(row));

  const source = listed.length ? listed : fromContent;
  const byId = new Map<string, ResolvedLetterChoice>();
  for (const row of source) {
    if (!byId.has(row.id)) byId.set(row.id, row);
  }
  const targetChoice = resolveChoice(bundle, letterId);
  if (targetChoice && !byId.has(targetChoice.id)) byId.set(targetChoice.id, targetChoice);

  let choices = [...byId.values()].slice(0, 3);
  if (targetChoice && !choices.some((row) => row.id === targetChoice.id)) {
    choices = [...choices.slice(0, 2), targetChoice];
  }
  if (choices.length < 2 || !choices.some((row) => row.id === letterId)) return undefined;

  return {
    targetLetterId: letterId,
    targetForm: form,
    promptGlyph,
    ...(exercise.promptText ? { promptText: exercise.promptText } : {}),
    ...(exercise.promptAssetId ? { promptAssetId: exercise.promptAssetId } : {}),
    choices,
  };
}
