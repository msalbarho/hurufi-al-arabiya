import wave13Json from "@/content/curriculum/data/production/literacy-path.wave-13.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 13 bundle. Portable JSON is the source of truth. */
export function getWave13Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave13Json);
  return cached;
}
