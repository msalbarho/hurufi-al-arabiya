import type { CurriculumBundle } from "@/content/curriculum/index.ts";
import { AudioManager } from "@/lib/audio/AudioManager";
import { portableLetter } from "./letterAdapter.ts";

/**
 * Play a portable logical asset id. No file is registered unless a real
 * bundle exists — TTS is the documented development fallback.
 */
export function playCurriculumAudio(
  bundle: CurriculumBundle,
  assetId: string | undefined,
  fallbackText: string,
): Promise<void> {
  if (!assetId) return AudioManager.speak(fallbackText);
  const asset = bundle.assets.find((row) => row.id === assetId);
  if (!asset) {
    if (import.meta.env.DEV) {
      console.warn(`[curriculum audio] unknown asset id: ${assetId}`);
    }
    return AudioManager.speak(fallbackText);
  }
  return AudioManager.play(assetId, fallbackText);
}

export function letterSoundFallback(
  bundle: CurriculumBundle,
  canonicalLetterId: string,
): string {
  const letter = portableLetter(bundle, canonicalLetterId);
  return letter?.forms.isolated ?? letter?.char ?? "";
}

export function letterNameFallback(
  bundle: CurriculumBundle,
  canonicalLetterId: string,
): string {
  return portableLetter(bundle, canonicalLetterId)?.nameAr ?? letterSoundFallback(bundle, canonicalLetterId);
}
