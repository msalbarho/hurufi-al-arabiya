import wave1Json from "@/content/curriculum/data/production/literacy-path.wave-1.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 1 bundle. Portable JSON is the source of truth. */
export function getWave1Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave1Json);
  return cached;
}
