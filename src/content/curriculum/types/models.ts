/**
 * Portable curriculum models.
 * JSON-serializable, React-free, suitable for a later Kotlin port.
 * Learner progress is NOT represented here.
 */

export type CurriculumLevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type VocabBand = "A" | "B" | "C" | "D";

/** Packing cluster inside a band. Not teaching order. */
export type VocabSubBand = "A1" | "A2" | "A3" | "A4";

export type ContentDifficulty = 1 | 2 | 3;

export type ExerciseDifficulty = "easy" | "normal" | "hard";

export type MsaStatus =
  | "STANDARD_MSA"
  | "ACCEPTABLE_MSA"
  | "LOANWORD_ACCEPTED"
  | "LOANWORD_REVIEW"
  | "REGIONAL_STANDARD"
  | "NONSTANDARD"
  | "UNCERTAIN"
  | "DIALECTAL";

export type CurriculumAction =
  "KEEP" | "KEEP_ADVANCED" | "MOVE_CATEGORY" | "HUMAN_REVIEW" | "REPLACE" | "REMOVE";

export type FrequencyBand = "core" | "common" | "topic" | "rare";

export type ContentStatus = "active" | "deprecated" | "needs_review" | "fixture";

export type SkillDomain =
  | "letter_recognition"
  | "letter_sounds"
  | "similar_letter_discrimination"
  | "letter_forms"
  | "handwriting"
  | "short_vowels"
  | "long_vowels"
  | "sukun"
  | "tanween"
  | "shadda"
  | "syllable_blending"
  | "word_decoding"
  | "vocabulary_comprehension"
  | "spelling"
  | "sentence_reading"
  | "sentence_construction"
  | "listening_comprehension"
  | "reading_comprehension"
  | "story_comprehension"
  | "independent_reading"
  | "informational_reading"
  | "grammar_usage";

export type SkillModality = "listen" | "read" | "write" | "speak";

export type ExerciseType =
  | "letter_recognition"
  | "sound_to_letter"
  | "similar_letter_discrimination"
  | "tracing"
  | "picture_to_word"
  | "word_to_picture"
  | "audio_to_word"
  | "audio_to_sentence"
  | "audio_to_picture"
  | "missing_letter"
  | "missing_haraka"
  | "syllable_blending"
  | "word_order"
  | "sentence_order"
  | "dictation"
  | "comprehension"
  | "story_sequence"
  | "presentation";

export type AssetKind = "audio" | "image" | "trace";

export type SuccessType = "correct_choice" | "trace_coverage" | "ordered_ids" | "exact_text" | "continue";

export type ComprehensionType = "picture_match" | "wh_picture" | "sequence" | "fact_picture";

export interface CurriculumLevel {
  id: CurriculumLevelId;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
}

/** Logical asset id. Platforms resolve this later; never store file paths here. */
export interface AssetReference {
  id: string;
  kind: AssetKind;
  /** Optional human hint, not a runtime path. */
  hint?: string;
}

export interface SkillDefinition {
  id: string;
  domain: SkillDomain;
  nameAr: string;
  nameEn?: string;
  childLabelAr?: string;
  prereqSkillIds: string[];
  learnerLevelHint?: CurriculumLevelId;
  vocabBandHint?: VocabBand;
  modality?: SkillModality[];
  /** Descriptive only. Mastery algorithms live in progress code, not content. */
  masteryHint?: string;
  tags?: string[];
}

export interface LetterForms {
  isolated: string;
  initial: string;
  medial: string;
  final: string;
}

export interface LetterDefinition {
  id: string;
  /** Prototype id, e.g. `ba`. Progress keys today are `letter:${legacyId}`. */
  legacyId?: string;
  char: string;
  nameAr: string;
  phoneme?: string;
  phonemeNoteAr?: string;
  forms: LetterForms;
  nonConnecting?: boolean;
  abjadOrder?: number;
  wave?: number;
  teachOrder?: number;
  similarLetterIds?: string[];
  exampleWordIds?: string[];
  requiredSkillIds?: string[];
  unlocksSkillIds?: string[];
  audioAssetIds?: {
    name?: string;
    phoneme?: string;
    withFatha?: string;
    withDamma?: string;
    withKasra?: string;
  };
  traceAssetId?: string;
  tags?: string[];
}

export interface WordDefinition {
  id: string;
  /** Prototype id, e.g. `animals-1`. Do not treat as canonical. */
  legacyId?: string;
  lemma: string;
  /**
   * Vocalized string. For Band A production policy this is the child-facing
   * teaching form unless `teachingForm` is set.
   */
  diacritized: string;
  /**
   * Child-facing card form when it must be distinguished from `lemma`.
   * Nouns: pause form without tanween (`كِتَاب`).
   * Verbs: 3rd m. sg. imperfect fully vocalized (`يَأْكُلُ`).
   * If omitted, platforms use `diacritized`.
   * Do not create a second word record for ordinary conjugations or `ال`.
   */
  teachingForm?: string;
  pos?: string;
  gender?: "m" | "f" | "none";
  number?: "sg" | "du" | "pl";
  category?: string;
  categories?: string[];
  vocabBand?: VocabBand;
  /** Indicative packing cluster (A1–A4). Not unlock order. */
  subBand?: VocabSubBand;
  learnerLevel?: CurriculumLevelId;
  difficulty?: ContentDifficulty;
  concreteness?: "concrete" | "abstract";
  msaStatus?: MsaStatus;
  curriculumAction?: CurriculumAction;
  syllableCount?: number;
  syllablePattern?: string;
  syllables?: string[];
  letterIds?: string[];
  requiredSkillIds?: string[];
  phonicsSkillIds?: string[];
  packId?: string;
  frequencyBand?: FrequencyBand;
  highFrequency?: boolean;
  reviewPriority?: 1 | 2 | 3 | 4 | 5;
  imageAssetId?: string;
  audioAssetIds?: {
    citation?: string;
    slow?: string;
  };
  tags?: string[];
  homographGroup?: string | null;
  status?: ContentStatus;
  /** Positional forms the child must have seen to decode this teaching form. */
  requiredLetterForms?: LetterFormRef[];
}

export interface SentenceDefinition {
  id: string;
  diacritized: string;
  text?: string;
  wordIds: string[];
  targetSkillIds?: string[];
  requiredSkillIds?: string[];
  learnerLevel?: CurriculumLevelId;
  difficulty?: ContentDifficulty;
  audioAssetId?: string;
  imageAssetId?: string;
  tags?: string[];
}

export interface ReadingPage {
  id: string;
  sentenceId: string;
  imageAssetId?: string;
  audioAssetId?: string;
}

export interface ComprehensionItem {
  id: string;
  type: ComprehensionType;
  promptAr: string;
  choiceAssetIds?: string[];
  correctAssetId?: string;
  choiceWordIds?: string[];
  correctWordId?: string;
  pageIds?: string[];
}

/** Shared by stories and informational texts so we do not fork two CMS shapes. */
export interface ReadingContentBase {
  id: string;
  titleAr: string;
  learnerLevel: CurriculumLevelId;
  difficulty?: ContentDifficulty;
  targetSkillIds?: string[];
  vocabularyWordIds?: string[];
  newWordIds?: string[];
  recycledWordIds?: string[];
  pages: ReadingPage[];
  coverAssetId?: string;
  audioAssetId?: string;
  comprehension?: ComprehensionItem[];
  tags?: string[];
}

export interface StoryDefinition extends ReadingContentBase {
  kind: "story";
}

export interface InformationalTextDefinition extends ReadingContentBase {
  kind: "informational";
  topic: string;
}

export interface ExerciseChoice {
  id: string;
  label?: string;
  assetId?: string;
}

export interface ExerciseSuccess {
  type: SuccessType;
  correctChoiceId?: string;
  orderedIds?: string[];
  exactText?: string;
  coverageThreshold?: number;
}

export interface MasteryEvidence {
  reading?: string[];
  writing?: string[];
  listening?: string[];
}

export type LetterFormSlot = "isolated" | "initial" | "medial" | "final";

/** A letter in a specific positional form. Used for teaching order and decodability. */
export interface LetterFormRef {
  letterId: string;
  form: LetterFormSlot;
}

/**
 * Machine-readable mastery target for a future learner-state adapter.
 * Generic SkillDefinition + optional item (letter / form / syllable / word / sentence).
 * Does not rewrite live progress keys.
 */
export interface ExerciseMasteryTarget {
  id: string;
  skillId: string;
  letterId?: string;
  letterForm?: LetterFormSlot;
  syllableId?: string;
  wordId?: string;
  sentenceId?: string;
}

export interface ExerciseDefinition {
  id: string;
  /** What is trained, not how React renders it. */
  type: ExerciseType;
  skillIds: string[];
  contentIds: string[];
  difficulty: ExerciseDifficulty;
  prereqSkillIds?: string[];
  success: ExerciseSuccess;
  masteryEvidence?: MasteryEvidence;
  /** Child-facing / editor-facing literacy goal. Not a UI string catalog. */
  learningObjectiveAr?: string;
  learningObjectiveEn?: string;
  /** What this activity measures. Item-level; not a new SkillDefinition per letter. */
  masteryTargets?: ExerciseMasteryTarget[];
  promptAssetId?: string;
  promptText?: string;
  choices?: ExerciseChoice[];
  /** JSON-only configuration. No components, routes, or class names. */
  config?: Record<string, unknown>;
  tags?: string[];
}

/** Pedagogical syllable actually used in a path. Not a generated CV grid. */
export type SyllablePattern = "CV" | "CVC" | "CVV";

export interface SyllableDefinition {
  id: string;
  text: string;
  letterId: string;
  vowelSkillId: string;
  pattern: SyllablePattern;
  requiredSkillIds: string[];
  requiredLetterIds?: string[];
  /** CV syllables are isolated letter+haraka unless a connected form is taught. */
  letterForm?: LetterFormSlot;
  audioAssetId?: string;
  tags?: string[];
}

/**
 * Portable unit mastery expectations. Maps later onto
 * `src/lib/rules/mastery.ts` (attempts, accuracy, streak → 2, sessions → 3,
 * UNLOCK_THRESHOLD 0.7). Not live progress and not stars-only.
 */
export interface UnitMasteryCriteria {
  minAttempts: number;
  minAccuracy: number;
  minStreak?: number;
  minSessions?: number;
  requiredSkillIds?: string[];
  reviewAfterDays?: number;
}

/**
 * Ordered teaching chunk. Path → Unit → Exercise is the Wave 1 grain.
 * Lesson can be inserted later without renaming these ids.
 */
export interface LearningUnitDefinition {
  id: string;
  order: number;
  titleAr: string;
  titleEn?: string;
  /** Short child-facing goal for the learning path. Not adult curriculum prose. */
  childGoalAr?: string;
  learnerLevel?: CurriculumLevelId;
  skillIds: string[];
  letterIds?: string[];
  /** Positional forms introduced in this unit. Isolated is not assumed. */
  letterForms?: LetterFormRef[];
  syllableIds?: string[];
  wordIds?: string[];
  exerciseIds?: string[];
  prereqUnitIds: string[];
  reviewContentIds?: string[];
  mastery: UnitMasteryCriteria;
  tags?: string[];
}

export interface LearningPathDefinition {
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  learnerLevel?: CurriculumLevelId;
  unitIds: string[];
  tags?: string[];
}

export interface CurriculumBundleMeta {
  kind: "fixture" | "production";
  id: string;
  title: string;
  description: string;
  notProductionCurriculum: boolean;
}

export interface CurriculumBundle {
  meta: CurriculumBundleMeta;
  levels: CurriculumLevel[];
  skills: SkillDefinition[];
  letters: LetterDefinition[];
  words: WordDefinition[];
  sentences: SentenceDefinition[];
  stories: StoryDefinition[];
  informationalTexts: InformationalTextDefinition[];
  exercises: ExerciseDefinition[];
  assets: AssetReference[];
  /** Optional so fixture / Band A bundles stay valid without a path. */
  syllables?: SyllableDefinition[];
  units?: LearningUnitDefinition[];
  paths?: LearningPathDefinition[];
}
