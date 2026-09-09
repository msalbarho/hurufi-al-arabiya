import wave4Json from "@/content/curriculum/data/production/literacy-path.wave-4.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 4 bundle. Portable JSON is the source of truth. */
export function getWave4Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave4Json);
  return cached;
}
