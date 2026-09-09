import wave16Json from "@/content/curriculum/data/production/literacy-path.wave-16.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 16 bundle. Portable JSON is the source of truth. */
export function getWave16Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave16Json);
  return cached;
}
