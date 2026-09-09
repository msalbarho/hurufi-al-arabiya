import orthographicFoundationsJson from "@/content/curriculum/data/production/literacy-path.orthographic-foundations.json";
import { asCurriculumBundle, type CurriculumBundle } from "@/content/curriculum/index.ts";

let cached: CurriculumBundle | undefined;

/** Production Module 2 bundle. Portable JSON is the source of truth. Not a wave. */
export function getOrthographicFoundationsBundle(): CurriculumBundle {
  cached ??= asCurriculumBundle(orthographicFoundationsJson);
  return cached;
}
