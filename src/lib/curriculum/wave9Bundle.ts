import wave9Json from "@/content/curriculum/data/production/literacy-path.wave-9.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 9 bundle. Portable JSON is the source of truth. */
export function getWave9Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave9Json);
  return cached;
}
