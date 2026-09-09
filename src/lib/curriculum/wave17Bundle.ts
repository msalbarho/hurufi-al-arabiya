import wave17Json from "@/content/curriculum/data/production/literacy-path.wave-17.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 17 bundle. Portable JSON is the source of truth. */
export function getWave17Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave17Json);
  return cached;
}
