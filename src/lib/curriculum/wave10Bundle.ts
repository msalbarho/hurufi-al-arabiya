import wave10Json from "@/content/curriculum/data/production/literacy-path.wave-10.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 10 bundle. Portable JSON is the source of truth. */
export function getWave10Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave10Json);
  return cached;
}
