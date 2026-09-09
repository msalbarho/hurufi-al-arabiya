# Module 1 — Complete Reading Foundations

Post-wave Module 1 for حُرُوفِي العَرَبِيَّة. Waves 1–22 remain frozen. **Final wave count = 22. No Wave 23.** Module 2 is not implemented.

Source of truth: `src/content/curriculum/data/production/literacy-path.reading-foundations.json`  
Meta id: `hurufi.production.literacy.reading_foundations`  
Module id: `module.reading_foundations`  
Path: `path.literacy.reading_foundations`  
URL slug: `reading-foundations`  
Arabic title: **أُسُسُ الْقِرَاءَة**

---

## 1. Implementation summary

Five units after Wave 22 handoff: madd-yaa, madd-waw, madd transfer, tanween-damm, sentence transfer. Modules sit **beside** Waves. `LEARN_WAVE_SLUGS` still ends at `wave-22`. Lessons reuse `LessonPlayer`, the existing exercise registry, `hurufi-progress-v1`, and generic unlock/mastery. No island map, no ModuleLessonPlayer, no IndexedDB migration.

## 2. Architecture added

Parallel to waves, not appended to them:

- `LEARN_MODULE_SLUGS` / `READING_FOUNDATIONS_SLUG`
- `getReadingFoundationsBundle()`
- `listLearnModules` / `resolveLearnModulePath` / `resolveLearnModuleUnit`
- `lookupLearnPrereq` searches waves then modules
- Routes: `/learn/modules/$moduleId/$unitId`

## 3. Files added

- `src/content/curriculum/data/production/literacy-path.reading-foundations.json`
- `src/lib/curriculum/readingFoundationsBundle.ts`
- `src/content/curriculum/validation/validateReadingFoundationsModule.ts`
- `src/routes/learn/modules/$moduleId.$unitId.tsx`
- `docs/reading-foundations-module-report.md`

Headed-walk artifacts (not product source): `.tmp-m1-walk/`

## 4. Files changed

- `src/lib/curriculum/resolveLearn.ts`
- `src/lib/curriculum/unitMastery.ts` (madd_yaa / madd_waw / tanween_damm facets; word/sentence keys still win for those targets)
- `src/lib/curriculum/presentationAdapter.ts` (`glyph` / `contrast` SHOW)
- `src/components/learn/PresentationExercise.tsx`
- `src/components/learn/LessonPlayer.tsx` (accepts module unit views; finish still `/learn`)
- `src/routes/learn/index.tsx` (Modules section after Waves)
- `src/content/curriculum/data/production/shared-skills.json`
- `src/content/curriculum/validation/validateCurriculum.ts`
- `src/content/curriculum/validation/index.ts`
- `src/content/curriculum/index.ts`
- `scripts/validate-curriculum.ts`
- `scripts/validate-unit-mastery.ts`
- `docs/master-curriculum-roadmap.md` (post-wave Module 1 scope only)
- `src/routeTree.gen.ts` (generated)

Waves 1–22 JSON were not edited.

## 5. Wave registry preservation

`LEARN_WAVE_SLUGS` is still `[WAVE1_SLUG … WAVE22_SLUG]`. Module slugs live only on `LEARN_MODULE_SLUGS`.

## 6. No-Wave-23 verification

No `wave-23` slug, bundle, validator, or route. `/learn/wave-23/unit-1` stays invalid / 404. Headed walk confirmed it.

## 7. Module IDs

| Field | Value |
| --- | --- |
| Module | `module.reading_foundations` |
| Path | `path.literacy.reading_foundations` |
| Bundle meta | `hurufi.production.literacy.reading_foundations` |
| URL | `reading-foundations` |
| Title | أُسُسُ الْقِرَاءَة |

## 8. Module route

`/learn/modules/$moduleId/$unitId`

Examples:

- `/learn/modules/reading-foundations/madd-yaa`
- `/learn/modules/reading-foundations/madd-waw`
- `/learn/modules/reading-foundations/madd-transfer`
- `/learn/modules/reading-foundations/tanween-damm`
- `/learn/modules/reading-foundations/sentence-transfer`

Modules are not resolved through `$waveId`.

## 9. `/learn` handoff

Existing Wave list is unchanged. After it, a Modules section renders أُسُسُ الْقِرَاءَة and its five units. Same card theme. No island map.

## 10. Entry gate

Unit 1 prerequisite is exactly `unit.literacy.wave22.handoff`.  
No `waves.complete`, `module1.unlock`, or `module1.complete`.

Before Wave 22 mastery, Module Unit 1 is locked. After Wave 22 (`word:yalab.review`), it opens.

## 11. Unit list

1. `unit.literacy.reading_foundations.madd_yaa` — نَقْرَأُ ـِي
2. `unit.literacy.reading_foundations.madd_waw` — نَقْرَأُ ـُو
3. `unit.literacy.reading_foundations.madd_transfer` — كَبِير
4. `unit.literacy.reading_foundations.tanween_damm` — نَقْرَأُ ـٌ
5. `unit.literacy.reading_foundations.sentence_transfer` — وَلَدٌ يَلْعَبُ

## 12. Unit 1 implementation

Presentations: فِ → فِ + ي → فِي → فِ vs فِي → فِيل, optional كِ vs كِي.  
Scored: `audio_to_word` فِي then فِيل.  
Audio: `audio.word.fi`, `audio.word.fil`. No sentence.

## 13. Madd-yaa skill/evidence

Teaching skill: `skill.long_vowel.madd_yaa`.  
Live keys: `word:fi.decoding`, `word:fil.decoding`.  
Not mapped to historical `skill.long_vowel.madd` / `letter:*.madd_alif`.

## 14. Unit 2 implementation

Presentations: كُ vs كُو → كُوب, and قُو inside يَقُولُ.  
Scored: كُوب, يَقُولُ.  
Audio: `audio.word.kub`, `audio.word.yaqul`. No new sentence.

## 15. Madd-waw skill/evidence

Teaching skill: `skill.long_vowel.madd_waw`.  
Live keys: `word:kub.decoding`, `word:yaqul.decoding`. Distinct from madd-alif.

## 16. Unit 3 transfer

Target كَبِير via كَ + بِير. Recycles فِيل as unscored SHOW.  
Scored `audio_to_word` with foils كِتَاب / كُوب.  
Required live key: `word:kabir.decoding`. No tanween yet.

## 17. Unit 4 tanween-damm

Citation vs ـٌ: كِتَاب → كِتَابٌ and وَلَد → وَلَدٌ. Never الْكِتَابٌ / الْوَلَدٌ.  
`word.kitab.teachingForm` stays كِتَاب.  
Scored authored surface كِتَابٌ through generic `audio_to_sentence`.

## 18. One-token authored-surface decision

`audio_to_word` prefers canonical `teachingForm`, so mutating `word.kitab` to كِتَابٌ would break Policy A. Module 1 therefore scores tanween-damm as a **one-token pedagogical sentence**:

- Record: `sentence.reading_foundations.kitabun`
- Surface: كِتَابٌ
- Audio: `audio.sentence.reading_foundations.kitabun` (not pause-form `audio.word.kitab`)
- Live key: `sentence:reading_foundations.kitabun.reading`

This reuses the existing sentence engine. No new morphology engine.

## 19. Unit 5 sentence transfer

Unscored SHOW of Wave 21 `الْوَلَدُ يَلْعَبُ` (historical key not re-gated).  
Then authored:

- `sentence.reading_foundations.waladun_yalabu` = وَلَدٌ يَلْعَبُ
- `sentence.reading_foundations.alkitabu_kabirun` = الْكِتَابُ كَبِيرٌ

Both scored with `audio_to_sentence`. Both live keys required.

## 20. Policy A verification

Citation teachingForms stay وَلَد / كِتَاب / كَبِير. Contextual surfaces are authored sentences only. No runtime iʿrāb.

## 21. Article + tanween guard

Validator walks authored surfaces and scoring foils. Illegal combinations `الْوَلَدٌ` / `الْكِتَابٌ` / `الْبِنْتٌ` are rejected. Headed Unit 4 did not display الْكِتَابٌ.

## 22. Exact eight live keys

1. `word:fi.decoding`
2. `word:fil.decoding`
3. `word:kub.decoding`
4. `word:yaqul.decoding`
5. `word:kabir.decoding`
6. `sentence:reading_foundations.kitabun.reading`
7. `sentence:reading_foundations.waladun_yalabu.reading`
8. `sentence:reading_foundations.alkitabu_kabirun.reading`

No additional required Module 1 live key.

## 23. Historical-key isolation

These do not master Module 1 units: `word:yalab.decoding` / `.review`, `word:walad.*`, `word:bint.decoding`, `word:kitab.decoding`, `sentence:wave21.alwaladu_yalabu.reading`, `letter:*.madd_alif`, historical fatha/kasra/damma/sukun, presentation keys, `review.wave6`. Unit-mastery tests prove this.

## 24. Exercise-engine reuse

`presentation`, `audio_to_word`, `audio_to_sentence` only. Same registry and LessonPlayer. No tracing, dictation, picture gates, or new exercise types.

## 25. Audio contract

Reused: `audio.word.fi` / `fil` / `kub` / `yaqul` / `kabir`, plus historical word and Wave 21 sentence audio for SHOW.  
New logical ids: `audio.sentence.reading_foundations.kitabun`, `waladun_yalabu`, `alkitabu_kabirun`.  
No concatenation. Fallback TTS speaks the complete authored surface. No production audio generated.

## 26. Image result

No new image assets. Images are not mastery gates. No emoji used as reading proof.

## 27. Writing boundary

No tracing, copying, or dictation. No writing live keys. Module 4 remains Reading + Writing.

## 28. Comprehension boundary

No comprehension engine expansion. Pictures are not required gates.

## 29. Module completion contract

Module 1 is complete when `unit.literacy.reading_foundations.sentence_transfer` is mastered. `/learn` shows أَتْقَنْتَ on the module heading then. No persisted `module1.complete`.

## 30. Future Module 2 gate

Module 2 is not implemented. The reserved future Unit 1 prerequisite remains `unit.literacy.reading_foundations.sentence_transfer`.

## 31. Validator coverage

`validateReadingFoundationsModule.ts` is wired on meta id `hurufi.production.literacy.reading_foundations`. It enforces: no Wave 23; exact module/path ids; five units in order; Wave 22 handoff then chain; known consonants only; madd-yaa/waw and tanween-damm allowed; no ـٍ / ـً / shadda / hamza / ة / ى / remaining letters / sun assimilation / writing / runtime morphology; citation forms unchanged; exact sentence surfaces; no article+tanween; presentations unscored and first; exact eight live keys; no historical madd_alif mapping; no module-complete key; no Module 2 content. Wave validators stay frozen.

## 32. Unit-mastery coverage

`scripts/validate-unit-mastery.ts` proves LEARN_WAVE_SLUGS ends at wave-22; wave-23 does not resolve; Unit 1 locked then opens after Wave 22; historical evidence cannot master Module units; exact per-unit required keys; presentations do not master; Wave 21 sentence key does not master Unit 5; Unit 5 mastery completes Module 1; no `module1.complete`.

## 33. IndexedDB compatibility

Store name remains `hurufi-progress-v1`. No migration. After the headed walk the only new **required** curriculum evidence is the eight keys above. Historical keys including `word:yalab.review` and `sentence:wave21.alwaladu_yalabu.reading` remain. Presentation intro keys have `attempts = 0`.

## 34. Headed-browser verification

Headed Chromium against `http://localhost:8080` (`.tmp-m1-walk/walk.mjs`): **passed**.

| # | Check | Result |
| --- | --- | --- |
| 1 | Seed through Wave 22 | Pass |
| 2 | `/learn` still shows Waves 1–22 | Pass |
| 3 | No Wave 23 | Pass |
| 4 | Module section appears | Pass |
| 5 | Module Unit 1 locked before Wave 22 | Pass |
| 6 | Opens after Wave 22 | Pass |
| 7 | `/learn/modules/reading-foundations/madd-yaa` | Pass |
| 8 | Unit 1 presentations | Pass |
| 9 | Score فِي | Pass |
| 10 | Score فِيل | Pass |
| 11 | Exact Unit 1 keys | Pass |
| 12 | Unit 2 unlock | Pass |
| 13 | Score كُوب | Pass |
| 14 | Score يَقُولُ | Pass |
| 15 | Exact Unit 2 keys | Pass |
| 16 | Unit 3 unlock | Pass |
| 17 | Score كَبِير | Pass |
| 18 | Exact Unit 3 key | Pass |
| 19 | Unit 4 citation vs ـٌ | Pass |
| 20 | No illegal الْكِتَابٌ | Pass |
| 21 | Scored كِتَابٌ with tanween | Pass |
| 22 | Tanween audio uses authored form (TTS fallback of كِتَابٌ) | Pass |
| 23 | Exact Unit 4 sentence key | Pass |
| 24 | Unit 5 unlock | Pass |
| 25 | Contrast الْوَلَدُ يَلْعَبُ | Pass |
| 26 | وَلَدٌ يَلْعَبُ | Pass |
| 27 | الْكِتَابُ كَبِيرٌ | Pass |
| 28 | Both sentence scores work | Pass |
| 29 | Exact Unit 5 keys | Pass |
| 30 | Finish returns `/learn` | Pass |
| 31 | Module أَتْقَنْتَ | Pass |
| 32 | No Wave 23 | Pass |
| 33 | No Module 2 | Pass |
| 34 | Presentations attempts = 0 | Pass |
| 35 | No historical key corruption | Pass |

## 35. React → Kotlin portability

Bundle JSON, skill ids, live keys, and mastery rules stay React-free. Module routing is a thin slug resolver beside waves. LessonPlayer was not forked.

## 36. Roadmap refinement

`docs/master-curriculum-roadmap.md` post-wave Module descriptions now match the approved plan:

- Module 1 owns madd-yaa, madd-waw, tanween-damm, and limited sentence transfer only.
- Tanween-kasra / tanween-fatha wait until later Modules when contextual use exists.
- Sun/moon hearing waits until later Modules, after shadda / appropriate letter foundations.

Waves 1–22 documentation was not rewritten.

## 37. npm checks

- `npm run typecheck` — PASS
- `npm run validate:curriculum` — PASS (25 bundles, including reading foundations)
- `npm run validate:unit-mastery` — PASS
- `npm run build` — PASS
- `npm run check` — PASS

## 38. Remaining non-blocking limitations

- New sentence audio is logical ids + TTS fallback; no production files were generated.
- Unit 4 tanween uses a one-token `audio_to_sentence` container (approved compromise).
- `presentation` gained generic `glyph` / `contrast` SHOWs; not module-named.
- Foil words appear on unit `wordIds` so intra-bundle premature-content checks pass; they are not extra required live keys.
- Module 2 is intentionally absent.

MODULE 1 IMPLEMENTED — READY FOR MODULE 2 — NO WAVE 23
