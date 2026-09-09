import wave2Json from "@/content/curriculum/data/production/literacy-path.wave-2.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 2 bundle. Portable JSON is the source of truth. */
export function getWave2Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave2Json);
  return cached;
}
