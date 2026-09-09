import readingFoundationsJson from "@/content/curriculum/data/production/literacy-path.reading-foundations.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Module 1 bundle. Portable JSON is the source of truth. Not a wave. */
export function getReadingFoundationsBundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(readingFoundationsJson);
  return cached;
}
