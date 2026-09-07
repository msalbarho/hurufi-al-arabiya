import type { CurriculumBundle, ExerciseDefinition } from "@/content/curriculum/index.ts";

export interface ExerciseViewProps {
  exercise: ExerciseDefinition;
  bundle: CurriculumBundle;
  onResult: (correct: boolean) => void;
  locked?: boolean;
}
