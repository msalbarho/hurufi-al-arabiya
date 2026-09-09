import wave5Json from "@/content/curriculum/data/production/literacy-path.wave-5.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 5 bundle. Portable JSON is the source of truth. */
export function getWave5Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave5Json);
  return cached;
}
