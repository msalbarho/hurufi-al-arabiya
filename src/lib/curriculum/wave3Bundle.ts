import wave3Json from "@/content/curriculum/data/production/literacy-path.wave-3.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 3 bundle. Portable JSON is the source of truth. */
export function getWave3Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave3Json);
  return cached;
}
