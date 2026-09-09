# Literacy Wave 22 — implementation report

Final production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–21 remain frozen educational v1. **Final wave count = 22.** Wave 22 is the last registered wave. **Wave 23 is not implemented.**

Wave 22 is foundation consolidation and handoff: three unscored SHOWs of known material, then one generic `audio_to_word` review of **يَلْعَبُ**. No new letter, phonics, sentence, tanween, pronoun, demonstrative, or writing.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-22.json`  
Meta id: `hurufi.production.literacy.wave22`  
Path: `path.literacy.wave22`  
Route slug: `wave-22`

---

## 1. Implementation summary

One unit, `unit.literacy.wave22.handoff`, gated on `unit.literacy.wave21.alwaladu_yalabu`. Presentations reuse the existing engine. Scoring reuses generic `audio_to_word` with `tag: review`, which writes **`word:yalab.review`**. LessonPlayer is unchanged. After mastery the finish CTA still returns to `/learn`. No Module UI.

## 2. Files added

- `src/content/curriculum/data/production/literacy-path.wave-22.json`
- `src/content/curriculum/validation/validateLiteracyWave22.ts`
- `src/lib/curriculum/wave22Bundle.ts`
- `docs/literacy-wave-22-report.md`

Headed-walk artifacts (not product source): `.tmp-w22-walk/`

## 3. Files changed

Normal registry / routing / validator ceiling only:

- `src/lib/curriculum/resolveLearn.ts`
- `src/content/curriculum/validation/validateCurriculum.ts`
- `src/content/curriculum/validation/index.ts`
- `src/content/curriculum/index.ts`
- `scripts/validate-curriculum.ts`
- `scripts/validate-unit-mastery.ts`

Waves 1–21 JSON were not edited. LessonPlayer was not edited.

## 4. Final Wave registration

`WAVE22_SLUG = "wave-22"` is appended after `wave-21` in `LEARN_WAVE_SLUGS`. Arabic label: **الْمَوْجَةُ الثَّانِيَةُ وَالْعِشْرُون**. No `wave-23` slug, bundle, or path.

## 5. Unit ID

`unit.literacy.wave22.handoff`

## 6. Prerequisite

Exactly `unit.literacy.wave21.alwaladu_yalabu`.

## 7. Known-content reuse

| Record | Form |
| --- | --- |
| `word.yalab` | يَلْعَبُ |
| `word.walad` | وَلَد (citation unchanged) |
| `word.bint` | بِنْت |
| Wave 21 sentence (SHOW only) | الْوَلَدُ يَلْعَبُ |

Letters recycled only: alif, lam, waw, dal, ya, ain, ba, nun, ta.

## 8. Presentation sequence

Exactly three unscored SHOWs, then score:

1. SHOW word: **يَلْعَبُ**
2. SHOW chunk: **الْ + وَلَد → الْوَلَدُ**
3. SHOW chunk: **الْوَلَدُ + يَلْعَبُ → الْوَلَدُ يَلْعَبُ**

No `masteryTargets`. Attempts remain 0 (`letter:intro.wave22_presentation_*`).

## 9. Scoring activity

Type: `audio_to_word`  
Target: `word.yalab`  
Choices exactly: يَلْعَبُ / وَلَد / بِنْت  
Prompt audio: `audio.word.yalab`

## 10. Review-facet decision

The scored exercise is tagged `review` (generic mixed-review facet, not `review-wave6`). Existing `wordLiveFacet` maps that tag to `word:{slug}.review`. Wave 20 `word:yalab.decoding` cannot auto-master Wave 22.

## 11. Required live key

Exactly one new live key:

`word:yalab.review`

## 12. Historical-key isolation

These do not master Wave 22:

- `word:yalab.decoding`
- `word:walad.decoding`
- `word:walad.review`
- `word:bint.decoding`
- `sentence:wave21.alwaladu_yalabu.reading`
- `letter:bul.closed`, `letter:ba.damma`, `letter:kaf.damma`, `letter:ram.closed`, `letter:jis.closed`
- historical vowel / sukun / madd keys
- presentation-seen keys

## 13. Duplicate-master-key protection

No `wave22.complete`. No second `sentence:wave21.alwaladu_yalabu.reading` gate. No article, writing, decoding, or comprehension keys. Scored mastery target id is `mastery.word.yalab.review`, not a decoding id.

## 14. Sentence reuse

Wave 22 JSON has `"sentences": []`. The child-facing string **الْوَلَدُ يَلْعَبُ** is an authored SHOW `result`. No `sentence.wave22.*`.

## 15. Sentence ownership

Semantic ownership stays Wave 21 (`sentence.wave21.alwaladu_yalabu`). Architecture did not require a local copy of that record.

## 16. Audio reuse

- `audio.word.yalab`
- `audio.word.walad`
- `audio.word.bint`
- `audio.sentence.wave21.alwaladu_yalabu` (SHOW 3 only)

No concatenated word audio. No production audio work.

## 17. Picture decision

No `word_to_picture`, `picture_to_word`, or `sentence_to_picture`. Reading remains primary. Current visuals are not precise enough for الْوَلَدُ يَلْعَبُ.

## 18. Comprehension decision

No comprehension engine or key. Light semantic exposure only through the known sentence SHOW.

## 19. No-tanween result

No ـٌ ـٍ ـً. Old Wave-22 tanween roadmap is retired. Tanween belongs to Module 1.

## 20. No-new-phonics result

No madd-yaa, madd-waw, shadda, hamza, ة, ى, sun-letter lesson, or remaining consonants.

## 21. No-pronoun/demonstrative result

No هُوَ / هِيَ / هَذَا / هَذِهِ.

## 22. No-new-sentence result

Only reused الْوَلَدُ يَلْعَبُ. No الْبِنْتُ يَلْعَبُ, وَلَد يَلْعَبُ, or الْجَمَلُ يَلْعَبُ.

## 23. No-runtime-morphology result

الْوَلَدُ and الْوَلَدُ يَلْعَبُ remain authored strings in presentation config.

## 24. Writing result

No tracing, copy, dictation, or writing keys.

## 25. Routing result

Registered sequence ends `wave-20` → `wave-21` → `wave-22`. Unknown `wave-23` is invalid / 404.

## 26. Final-wave completion behavior

Finish CTA is generic `رُجُوعٌ لِلطَّرِيق` → `/learn`. Wave 22 then shows **أَتْقَنْتَ**. No next-wave control. No redirect loop.

## 27. No-Wave-23 verification

- `resolveLearn.ts` has no `WAVE23` / `wave-23` / `getWave23Bundle`
- no `literacy-path.wave-23.json`
- headed walk: `/learn/wave-23/unit-1` is 404
- learn index shows no third-and-twentieth wave

## 28. Validator coverage

`validateLiteracyWave22.ts` enforces the approved contract: final wave, one unit, exact ids/prereq, known letters/phonics only, no tanween/madd-yaa/madd-waw/shadda/hamza/ة/ى/new consonant/sun-letter/pronoun/demonstrative/writing/new sentence, reused الْوَلَدُ يَلْعَبُ, no runtime morphology, three unscored presentations before `audio_to_word` + `review` on `word.yalab` with choices yalab/walad/bint, live key `word:yalab.review`, no decoding gate / `wave22.complete` / duplicate Wave 21 sentence mastery / Modules.

## 29. Unit-mastery coverage

`scripts/validate-unit-mastery.ts` proves lock before Wave 21, open after Wave 21, historical-key isolation, mastery only via `word:yalab.review`, Wave 23 unregistered, and stable final CTA `/learn` + أَتْقَنْتَ.

## 30. IndexedDB verification

Headed Chrome after Wave 22 (`.tmp-w22-walk/idb-after.json`):

- **New:** `word:yalab.review` (`attempts` 3, `correct` 3, `mastery` 2)
- **Unchanged historical:** `word:yalab.decoding`, `sentence:wave21.alwaladu_yalabu.reading`, `word:walad.decoding`, `word:bint.decoding`, letter/vowel/sukun/madd evidence
- **Presentations:** `letter:intro.wave22_presentation_yalab`, `…_alwaladu`, `…_alwaladu_yalabu` with `attempts = 0`
- **Absent:** `wave22.complete`, tanween / pronoun / demonstrative / writing / new phonics / `sentence:wave22*` keys

## 31. Headed-browser verification

Headed Chrome Playwright walk against `http://localhost:8080` (`.tmp-w22-walk/walk.mjs`): **passed**.

Seeded through Wave 20: Wave 22 locked. Seeded through Wave 21: Wave 22 last visible unit, no Wave 23. SHOWs يَلْعَبُ, الْ + وَلَد → الْوَلَدُ, الْوَلَدُ يَلْعَبُ, then score choices يَلْعَبُ / وَلَد / بِنْت. Correct answers stored `word:yalab.review` without rewriting `word:yalab.decoding`. Finish returned `/learn` with أَتْقَنْتَ. `/learn/wave-23/unit-1` 404.

## 32. npm checks

All passed:

- `npm run typecheck`
- `npm run validate:curriculum` (Wave 22 included; 24 bundles)
- `npm run validate:unit-mastery` (W22.1 / W22.3 / W22.5 / W22.6)
- `npm run build`
- `npm run check`

## 33. Post-wave Module readiness

Wave phase is complete. Temporary product handoff is: final Wave completed successfully. Module 1 (tanween and later grammar) is **not** implemented and must not be inferred from Wave 22.

## 34. Remaining non-blocking limitations

- Picture/visual assets remain too coarse for sentence meaning; reading-only gate is intentional.
- No production audio recording pass; reused ids only.
- LessonPlayer still has no next-wave CTA by design; the path list on `/learn` is the map.
- Modules have no routes, bundles, or UI.

---

WAVE 22 IMPLEMENTED — WAVE PHASE COMPLETE — NO WAVE 23
