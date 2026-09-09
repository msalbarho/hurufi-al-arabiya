import wave22Json from "@/content/curriculum/data/production/literacy-path.wave-22.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 22 bundle. Portable JSON is the source of truth. */
export function getWave22Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave22Json);
  return cached;
}
