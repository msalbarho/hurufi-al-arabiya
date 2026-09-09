import wave19Json from "@/content/curriculum/data/production/literacy-path.wave-19.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 19 bundle. Portable JSON is the source of truth. */
export function getWave19Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave19Json);
  return cached;
}
