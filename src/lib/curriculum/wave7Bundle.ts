import wave7Json from "@/content/curriculum/data/production/literacy-path.wave-7.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 7 bundle. Portable JSON is the source of truth. */
export function getWave7Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave7Json);
  return cached;
}
