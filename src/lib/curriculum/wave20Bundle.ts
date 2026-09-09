import wave20Json from "@/content/curriculum/data/production/literacy-path.wave-20.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 20 bundle. Portable JSON is the source of truth. */
export function getWave20Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave20Json);
  return cached;
}
