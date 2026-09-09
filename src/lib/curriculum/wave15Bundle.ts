import wave15Json from "@/content/curriculum/data/production/literacy-path.wave-15.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 15 bundle. Portable JSON is the source of truth. */
export function getWave15Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave15Json);
  return cached;
}
