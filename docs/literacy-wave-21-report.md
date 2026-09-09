# Literacy Wave 21 — implementation report

Twenty-first production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–20 remain frozen educational v1. Final wave count remains 22. **Wave 22 is not implemented.**

Wave 21 unblocks first sentence reading by adding one reusable `audio_to_sentence` engine, then teaching the canonical sentence **الْوَلَدُ يَلْعَبُ**.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-21.json`  
Meta id: `hurufi.production.literacy.wave21`  
Path: `path.literacy.wave21`  
Route slug: `wave-21`

---

## 1. Current-state verification

Before implementation, the repository matched the audit:

- Wave 20 exists (`hurufi.production.literacy.wave20`).
- Final Wave 20 unit is `unit.literacy.wave20.yalab`.
- Required Wave 20 live key is `word:yalab.decoding`.
- No Wave 21 JSON, bundle, slug, or validator existed.
- No live sentence scorer existed (`audio_to_sentence` was absent from `ExerciseType`, `READY_EXERCISE_TYPES`, and the renderer registry).
- Portable `SentenceDefinition` already existed in models/schema; production waves 1–20 used `"sentences": []`.
- Progress `ItemType` already included `"sentence"`.

## 2. Exact blocker found

Wave 21 could not ship on existing engines: LessonPlayer had no sentence-reading choice activity. Presentation `show: "chunk"` already displayed authored strings, including spaces, so the remaining gap was scoring a heard sentence against written choices.

## 3. Sentence engine implementation

One generic engine, cloned from `audio_to_word`:

- Type: `audio_to_sentence`
- Adapter: `src/lib/curriculum/sentenceAdapter.ts` (`resolveAudioToSentence`)
- Renderer: `src/components/learn/AudioToSentenceExercise.tsx`
- Live key helper: `getSentenceLiveKey` in `unitMastery.ts`
- LessonPlayer is unchanged (registry dispatch only)

Mixed `sentence.*` / `word.*` choice ids are legal. Two or more authored choices are enough; the engine does not invent foil sentences.

## 4. Files added/changed

Added:

- `src/lib/curriculum/sentenceAdapter.ts`
- `src/components/learn/AudioToSentenceExercise.tsx`
- `src/content/curriculum/data/production/literacy-path.wave-21.json`
- `src/content/curriculum/validation/validateLiteracyWave21.ts`
- `src/lib/curriculum/wave21Bundle.ts`
- `docs/literacy-wave-21-report.md`

Changed (engine + registry + Wave 21 wiring only):

- `src/content/curriculum/types/models.ts`
- `src/content/curriculum/schema/curriculum-bundle.schema.json`
- `src/lib/curriculum/exerciseReadiness.ts`
- `src/lib/curriculum/unitMastery.ts`
- `src/lib/curriculum/masteryAdapter.ts`
- `src/lib/curriculum/resolveLearn.ts`
- `src/components/learn/exerciseRegistry.tsx`
- `src/components/learn/PresentationExercise.tsx` (generic long-glyph sizing)
- `src/content/curriculum/data/production/shared-skills.json`
- `src/content/curriculum/validation/validateCurriculum.ts`
- `src/content/curriculum/validation/index.ts`
- `src/content/curriculum/index.ts`
- `scripts/validate-curriculum.ts`
- `scripts/validate-unit-mastery.ts`

Waves 1–20 JSON were not edited.

## 5. Sentence schema/model decision

Reuse existing `SentenceDefinition`. Add optional `ExerciseMasteryTarget.sentenceId`. Add `audio_to_sentence` to `ExerciseType` and the JSON Schema enum. No new morphology, grammar, or comprehension models.

## 6. Sentence ID

`sentence.wave21.alwaladu_yalabu`

Matches `sentence.[a-z0-9_]+(.[a-z0-9_]+)+` (two dotted segments after `sentence.`).

## 7. Sentence audio ID

`audio.sentence.wave21.alwaladu_yalabu`

Logical asset. Runtime TTS fallback speaks the full authored sentence. Word audio is not concatenated.

## 8. Sentence live key

`sentence:wave21.alwaladu_yalabu.reading`

From `getSentenceLiveKey`: strip `sentence.`, append `.reading`.

## 9. Wave 21 unit count

1

## 10. Unit ID

`unit.literacy.wave21.alwaladu_yalabu`

## 11. Prerequisite

`unit.literacy.wave20.yalab`

## 12. Presentation sequence

Unscored `show: "chunk"` authored strings:

1. ا + لْ → الْ
2. الْ + وَلَد → الْوَلَدُ
3. الْوَلَدُ + يَلْعَبُ → الْوَلَدُ يَلْعَبُ

Then scored `audio_to_sentence`.

## 13. Article mastery decision

Presentation-only. No `letter:al.article`, `article:al.complete`, or `wave21.article` key. The only new required evidence is sentence reading.

## 14. Contextual الْوَلَدُ handling

Authored string on SHOW 2 result and SHOW 3 left/result. `word.walad` citation remains `وَلَد`. No runtime article attachment.

## 15. Policy A verification

Standalone citation: `وَلَد`  
Contextual sentence: `الْوَلَدُ يَلْعَبُ`  
Forbidden phrase `وَلَد يَلْعَبُ` is validator-blocked and absent from the Wave 21 JSON.

## 16. Scored sentence activity

`exercise.wave21.audio_to_sentence.alwaladu_yalabu`  
Prompt asset: `audio.sentence.wave21.alwaladu_yalabu`  
Correct choice: `sentence.wave21.alwaladu_yalabu`

No picture matching gate.

## 17. Foil/choice solution

No fake sentences. Three legal authored choices:

- `sentence.wave21.alwaladu_yalabu` → الْوَلَدُ يَلْعَبُ
- `word.yalab` → يَلْعَبُ
- `word.walad` → وَلَد

The generic scorer accepts mixed sentence/word ids and does not require three sentence foils.

## 18. No-runtime-morphology proof

Presentation adapter still renders authored `left` / `right` / `result` strings. Sentence adapter never builds الْوَلَدُ from `word.walad`. `word.walad.teachingForm` remains `وَلَد`.

## 19. No-tanween proof

Validator forbids tanween on titles, choices, and the canonical sentence. Wave 21 JSON does not contain `ً` `ٌ` `ٍ`. Citation is `وَلَد`, not `وَلَدٌ`.

## 20. No-pronoun/demonstrative proof

Validator forbids `هُوَ`, `هِيَ`, `هَذَا`, `هَذِهِ`. None appear in Wave 21 content.

## 21. No-new-phonics proof

No new consonant. No madd-yaa, madd-waw, shadda, hamza, ة, ى, or sun-letter assimilation skill. Recycled letters only: alif, lam, waw, dal, ya, ain, ba.

## 22. Writing result

No tracing, copying, dictation, or sentence-writing mastery.

## 23. Routing result

`wave-21` is registered after `wave-20`. Wave 21 locks until Wave 20 final is mastered. LessonPlayer finish CTA still returns to `/learn`. `wave-22` and `wave-23` are not registered.

## 24. Validator result

`validateLiteracyWave21Production` enforces the unit, prereq, canonical sentence, citation forms, authored morphology, article-before-score order, one sentence-reading key, and the forbidden-content list.

## 25. Unit-mastery result

See `scripts/validate-unit-mastery.ts` W21.1 / W21.3:

1. Locked before Wave 20 final
2. Opens after Wave 20
3. `word:yalab.decoding` does not master Wave 21
4. `word:walad.decoding` does not master Wave 21
5. Presentation-seen evidence does not master Wave 21
6. Only `sentence:wave21.alwaladu_yalabu.reading` masters Wave 21
7. No Wave 22 registered
8. No Wave 23 registered

## 26. IndexedDB result

Headed Chrome after completing Wave 21 (`/.tmp-w21-walk/idb-after.json`):

- New scored key: `sentence:wave21.alwaladu_yalabu.reading` (`attempts` 1, `correct` 1, `mastery` 1).
- Exactly one `sentence:` key.
- `word:yalab.decoding` still present from Wave 20.
- Wave 21 did not write a new `word:walad.decoding` attempt.
- Presentation keys `letter:intro.wave21_presentation_al`, `letter:intro.wave21_presentation_alwaladu`, `letter:intro.wave21_presentation_alwaladu_yalabu` have `attempts = 0`.
- No tanween, pronoun, demonstrative, writing, or article-fragment keys.

## 27. Headed-browser result

Headed Chrome against `http://localhost:8080` (`.tmp-w21-walk/walk.mjs`): **passed**.

Seeded through Wave 20 (`word:yalab.decoding=true`, sentence key false). Wave 21 stayed locked until then, then showed one unit and no Wave 22. Article SHOW `ا + لْ → الْ`, definite noun `الْوَلَدُ`, and full sentence `الْوَلَدُ يَلْعَبُ` all appeared. TTS spoke the full sentence string (not concatenated word ids). Choosing the sentence persisted `sentence:wave21.alwaladu_yalabu.reading`. Finish returned to `/learn`. `/learn/wave-22/unit-1` is 404.

## 28. npm checks

All passed:

- `npm run typecheck`
- `npm run validate:curriculum` (Wave 21 included; 23 bundles)
- `npm run validate:unit-mastery` (W21.1 / W21.3)
- `npm run build`
- `npm run check`

## 29. Wave 22 readiness

Wave 21 is the missing sentence-reading foundation. Wave 22 planning remains approved and unimplemented.

## 30. Remaining blocker, if any

None for Wave 21. Do not implement Wave 22 in this change.

---

WAVE 21 IMPLEMENTED — READY FOR WAVE 22
