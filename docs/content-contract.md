# Hurufi Al Arabiya — Content contract

This is the practical contract for the **portable curriculum layer**. Full pedagogy lives in `docs/curriculum-architecture.md`. This file is only about IDs, files, and how platforms should consume content later.

The current React prototype still uses `src/content/letters.ts` and `src/content/words/`. **Do not point routes at the fixture, production Band A, or the Wave 1 literacy path yet.** The fixture is infrastructure. Production Band A is the approved 135-word lexicon, not the live `/words` catalog. Wave 1 is the first portable teaching path; UI integration is a later step.

## Where content lives

```
src/content/curriculum/
  types/          TypeScript models (JSON-shaped, no React)
  schema/         JSON Schema (canonical structural contract)
  data/fixture/   Sample bundle — NOT production curriculum
  data/production/ Production Band A v1 (`band-a.json`); literacy Wave 1 (`literacy-path.wave-1.json`); literacy Wave 2 (`literacy-path.wave-2.json`); literacy Wave 3 (`literacy-path.wave-3.json`); literacy Wave 4 (`literacy-path.wave-4.json`); literacy Wave 5 (`literacy-path.wave-5.json`); literacy Wave 6 (`literacy-path.wave-6.json`); shared skill catalog (`shared-skills.json`)
  validation/     Deterministic cross-reference validator
```

Long-term canonical form is **JSON + JSON Schema**. Kotlin should serialize the same JSON. React may keep TypeScript authoring temporarily, then export JSON.

## Stable ID policy

Canonical IDs are:

- ASCII
- lowercase
- dotted
- namespaced
- independent of array index, routes, and file paths
- stable if Arabic display text changes

| Namespace | Example | Meaning |
| --- | --- | --- |
| `letter.*` | `letter.ba` | A letter record |
| `skill.*` | `skill.short_vowel.fatha` | A skill-graph node (`skill.{domain}.{slug}`) |
| `word.*` | `word.umm` | A lemma (semantic slug, **not** `family-1`) |
| `sentence.*` | `sentence.l4.001` | A sentence (`sentence.{level}.{nnn}` — the number is part of the id, never renumbered) |
| `story.*` | `story.l4.bab` | A story |
| `text.*` | `text.l4.bab` | Informational / nonfiction |
| `exercise.*` | `exercise.picture_to_word.bab.01` | An exercise definition |
| `audio.*` / `image.*` / `trace.*` | `audio.word.umm` | Logical assets |
| `pack.*` | (future) | Word packs |
| `syllable.*` | `syllable.mim.fatha` | Pedagogical syllable actually taught |
| `unit.*` | `unit.literacy.wave1.qaf_qalam` | Ordered learning unit |
| `path.*` | `path.literacy.wave1` | Ordered learning path |
| `mastery.*` | `mastery.letter.mim.sound` | Portable mastery target (skill + item); not live progress |

Never encode React routes (`/letters/ba`) or paths (`/audio/ba.m4a`) in educational IDs.

## Legacy ID strategy

The prototype already stores progress as `` `${type}:${id}` ``:

- letters: `letter:ba` (id `ba` from `letters.ts`)
- words: `word:animals-1` (positional `build()` ids)

**This task does not rename those IDs.**

Portable records may carry `legacyId`:

| Canonical | legacyId | Today’s progress key |
| --- | --- | --- |
| `letter.ba` | `ba` | `letter:ba` |
| `word.qitt` | `animals-1` | `word:animals-1` |
| `word.umm` | `family-1` | `word:family-1` |

When a future migration switches the app to canonical IDs, map `legacyId → id` once. Until then, the live app keeps using prototype IDs.

Do not invent `legacyId` for lemmas that were not actually shipped with that prototype id.

## Asset IDs

Content stores **logical** ids only:

```
audio.letter.ba.name
image.word.bab
trace.letter.ba.isolated
```

A platform registry later maps id → file (web URL, Android `assets`, …). `AudioManager.register` already follows this idea. Do not put `/public/...` or Compose `R.drawable` into curriculum JSON.

The fixture’s `assets[]` list is the declared catalog for that bundle. The validator flags content that references an asset id not in the catalog.

## Relationships

Reference other records by canonical id:

- Word → `letterIds`, `requiredSkillIds`, `phonicsSkillIds`, optional `requiredLetterForms`
- Sentence → `wordIds`, `targetSkillIds`
- Story / informational text → `sentenceId` on pages, `vocabularyWordIds`
- Exercise → `skillIds`, `contentIds`, optional `learningObjectiveAr`, optional `masteryTargets`
- Syllable → `letterId`, `vowelSkillId`, optional `letterForm`
- Unit → `skillIds`, `letterIds`, optional `letterForms`, `syllableIds`, `wordIds`, `exerciseIds`, `prereqUnitIds`, `mastery`
- Path → `unitIds`

Shared foundational `SkillDefinition` identity lives in `data/production/shared-skills.json`. Bundles may embed copies; equal skill ids must match catalog identity (`prereqSkillIds` are global, not wave-specific). Per-letter mastery is `skillId` + item on `masteryTargets`, not 28 copies of each generic skill.

Do not couple content to React imports.

## Content vs progress

| Curriculum content | Learner progress |
| --- | --- |
| What exists to be taught | What this child has done |
| JSON bundle | Zustand / IndexedDB today; DataStore later |
| `SkillDefinition` | mastery, attempts, review flags |
| Stable forever (except editorial fixes) | Per profile, resettable |

Mastery algorithms stay in `src/lib/rules/mastery.ts` (and a future Kotlin port). Content may include `masteryHint` as documentation only.

## How React should consume this later

1. Keep using `letters.ts` / `words/` until a dedicated migration.
2. Load `content/*.json` (or generated types from JSON).
3. Resolve `legacyId` when writing progress so existing profiles do not reset.
4. Resolve asset ids through `AudioManager.register` / an image map.
5. Never import fixture JSON from `/letters` or `/words` until product owners promote real content.

## How Kotlin should consume this later

1. `kotlinx.serialization` data classes named like the TypeScript models.
2. Ship the same JSON in `assets/`.
3. Same id strings; same `legacyId` map if Android must import web progress.
4. Do not author curriculum in Compose.

## How to add a future word safely

1. Choose a **new** canonical id (`word.bayt`). Never reuse a retired id.
2. Do **not** use `category-N`; that id changes if the array is sorted.
3. Set `lemma` + `diacritized` (required). Optional `teachingForm` is the child-facing card when it must be distinguished from the lemma (noun pause form without tanween; verb 3ms imperfect such as `يَأْكُلُ`). If omitted, `diacritized` is the card. Do not create a second word id for `ال…`, tanween, or ordinary conjugations. Leave other optional linguistic fields empty until an editor fills them — do not guess.
4. If the word already exists in the 720-word prototype, set `legacyId` to that prototype id (`home-12`, etc.) after checking `build()` order. Prefer not to guess.
5. Point `letterIds` / `skillIds` only at ids that exist in the same bundle.
6. If audio/image exist as logical ids, add them to `assets[]`.
7. Run `npm run validate:curriculum` (and later, production-bundle validation).

`vocabBand: "A"` means the lemma is in the Band A *scope* (`docs/band-a-vocabulary-plan.md`). Optional `subBand` (`A1`–`A4`) is a packing cluster, not teaching order. Teaching availability is `letterIds` + `requiredSkillIds` / `phonicsSkillIds` + learner mastery — not array order and not “A1 means week one.”

The 720-word files are unchanged until a controlled migration.

## Validation

```bash
npm run validate:curriculum
npm run typecheck
npm run check
```

`validate:curriculum`:

1. Parses `src/content/curriculum/data/fixture/curriculum.json`, `src/content/curriculum/data/production/band-a.json`, `src/content/curriculum/data/production/literacy-path.wave-1.json`, `src/content/curriculum/data/production/literacy-path.wave-2.json`, `src/content/curriculum/data/production/literacy-path.wave-3.json`, `src/content/curriculum/data/production/literacy-path.wave-4.json`, `src/content/curriculum/data/production/literacy-path.wave-5.json`, and `src/content/curriculum/data/production/literacy-path.wave-6.json`
2. Validates each JSON against `src/content/curriculum/schema/curriculum-bundle.schema.json` (Ajv, JSON Schema Draft 2020-12)
3. Runs TypeScript cross-reference / semantic checks (plus Band A integrity on the lexicon bundle, Wave 1–5 integrity on the literacy paths, and Band A word-identity cross-checks)
4. Exits non-zero if any bundle fails; the CLI names the failing bundle

`typecheck` type-checks the app (`tsconfig.json`) and CLI scripts (`tsconfig.scripts.json`).

`check` runs typecheck, curriculum validation, then the production build.

Cross-reference checks include: duplicate ids, invalid id format, missing skill/word/letter/sentence/syllable/unit/exercise/asset refs, self-prerequisites, duplicate prerequisites, invalid levels (not 1–8 or not listed in `levels[]`), learning-unit prerequisite cycles, and words/syllables introduced before their letters or skills are available on the path.

JSON Schema does **not** prove the skill graph is teachable. That remains the TypeScript validator (and human review).
