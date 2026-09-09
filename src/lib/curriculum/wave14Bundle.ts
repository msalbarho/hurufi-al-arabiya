import wave14Json from "@/content/curriculum/data/production/literacy-path.wave-14.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 14 bundle. Portable JSON is the source of truth. */
export function getWave14Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave14Json);
  return cached;
}
