import wave11Json from "@/content/curriculum/data/production/literacy-path.wave-11.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 11 bundle. Portable JSON is the source of truth. */
export function getWave11Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave11Json);
  return cached;
}
