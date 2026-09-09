import wave8Json from "@/content/curriculum/data/production/literacy-path.wave-8.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 8 bundle. Portable JSON is the source of truth. */
export function getWave8Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave8Json);
  return cached;
}
