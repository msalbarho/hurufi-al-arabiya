import wave18Json from "@/content/curriculum/data/production/literacy-path.wave-18.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Wave 18 bundle. Portable JSON is the source of truth. */
export function getWave18Bundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(wave18Json);
  return cached;
}
