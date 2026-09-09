import wave6Json from "@/content/curriculum/data/production/literacy-path.wave-6.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 6 bundle. Portable JSON is the source of truth. */
export function getWave6Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave6Json);
  return cached;
}
