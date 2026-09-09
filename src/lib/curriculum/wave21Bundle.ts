import wave21Json from "@/content/curriculum/data/production/literacy-path.wave-21.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 21 bundle. Portable JSON is the source of truth. */
export function getWave21Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave21Json);
  return cached;
}
