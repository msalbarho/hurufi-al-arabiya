/**
 * Stable curriculum ID policy.
 *
 * Canonical IDs are ASCII, dotted, namespaced, and independent of
 * array index, React routes, and asset file paths.
 *
 * Existing prototype IDs (letter `ba`, word `animals-1`) are NOT renamed
 * in this step. Store them on `legacyId` when a portable record maps to
 * an already-shipped item.
 */

export const CURRICULUM_ID_NAMESPACES = [
  "letter",
  "skill",
  "word",
  "sentence",
  "story",
  "text",
  "exercise",
  "audio",
  "image",
  "trace",
  "pack",
  "syllable",
  "unit",
  "path",
  "mastery",
] as const;

export type CurriculumIdNamespace = (typeof CURRICULUM_ID_NAMESPACES)[number];

/** letter.ba | skill.short_vowel.fatha | word.bab | audio.word.bab */
export const CURRICULUM_ID_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/;

export const NAMESPACE_ID_PATTERNS: Record<CurriculumIdNamespace, RegExp> = {
  letter: /^letter\.[a-z][a-z0-9_]*$/,
  skill: /^skill\.[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/,
  word: /^word\.[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/,
  sentence: /^sentence\.[a-z0-9_]+(\.[a-z0-9_]+)+$/,
  story: /^story\.[a-z0-9_]+(\.[a-z0-9_]+)+$/,
  text: /^text\.[a-z0-9_]+(\.[a-z0-9_]+)+$/,
  exercise: /^exercise\.[a-z0-9_]+(\.[a-z0-9_]+)+$/,
  audio: /^audio\.[a-z0-9_]+(\.[a-z0-9_]+)+$/,
  image: /^image\.[a-z0-9_]+(\.[a-z0-9_]+)+$/,
  trace: /^trace\.[a-z0-9_]+(\.[a-z0-9_]+)+$/,
  pack: /^pack\.[a-z0-9_]+(\.[a-z0-9_]+)+$/,
  syllable: /^syllable\.[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/,
  unit: /^unit\.[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/,
  path: /^path\.[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/,
  mastery: /^mastery\.[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/,
};

export function isCurriculumIdNamespace(value: string): value is CurriculumIdNamespace {
  return (CURRICULUM_ID_NAMESPACES as readonly string[]).includes(value);
}

export function parseCurriculumId(
  id: string,
): { namespace: CurriculumIdNamespace; rest: string } | null {
  if (!CURRICULUM_ID_PATTERN.test(id)) return null;
  const dot = id.indexOf(".");
  if (dot <= 0) return null;
  const namespace = id.slice(0, dot);
  if (!isCurriculumIdNamespace(namespace)) return null;
  if (!NAMESPACE_ID_PATTERNS[namespace].test(id)) return null;
  return { namespace, rest: id.slice(dot + 1) };
}

export function isValidCurriculumId(id: string, namespace?: CurriculumIdNamespace): boolean {
  const parsed = parseCurriculumId(id);
  if (!parsed) return false;
  return namespace ? parsed.namespace === namespace : true;
}
