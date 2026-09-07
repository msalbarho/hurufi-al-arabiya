import { getLetter, type Letter } from "@/content/letters";
import type { CurriculumBundle, LetterDefinition } from "@/content/curriculum/index.ts";

export function portableLetter(
  bundle: CurriculumBundle,
  canonicalId: string,
): LetterDefinition | undefined {
  return bundle.letters.find((letter) => letter.id === canonicalId);
}

/**
 * Canonical portable id (`letter.mim`) → existing prototype letter (`mim`).
 * Does not duplicate `letters.ts` and does not rename live ids.
 */
export function legacyLetterFromCanonical(
  bundle: CurriculumBundle,
  canonicalId: string,
): Letter | undefined {
  const def = portableLetter(bundle, canonicalId);
  if (!def?.legacyId) return undefined;
  return getLetter(def.legacyId);
}

/** Isolated glyph from portable data — never invent a connected form. */
export function isolatedGlyph(
  bundle: CurriculumBundle,
  canonicalId: string,
): string | undefined {
  return portableLetter(bundle, canonicalId)?.forms.isolated;
}

export function letterFormGlyph(
  bundle: CurriculumBundle,
  canonicalId: string,
  form: "isolated" | "initial" | "medial" | "final",
): string | undefined {
  const def = portableLetter(bundle, canonicalId);
  return def?.forms[form];
}
