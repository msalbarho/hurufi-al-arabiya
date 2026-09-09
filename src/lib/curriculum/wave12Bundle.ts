import wave12Json from "@/content/curriculum/data/production/literacy-path.wave-12.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 12 bundle. Portable JSON is the source of truth. */
export function getWave12Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave12Json);
  return cached;
}
