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

export function isLegalLetterForm(
  nonConnecting: boolean | undefined,
  form: "isolated" | "initial" | "medial" | "final",
): boolean {
  if (nonConnecting && (form === "initial" || form === "medial")) return false;
  return true;
}

/** Portable glyph for a taught form. Refuses invented joining forms. */
export function letterFormGlyph(
  bundle: CurriculumBundle,
  canonicalId: string,
  form: "isolated" | "initial" | "medial" | "final",
): string | undefined {
  const def = portableLetter(bundle, canonicalId);
  if (!def || !isLegalLetterForm(def.nonConnecting, form)) return undefined;
  return def.forms[form];
}
