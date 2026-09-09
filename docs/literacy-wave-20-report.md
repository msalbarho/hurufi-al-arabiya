# Literacy Wave 20 — implementation report

Twentieth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–19 remain frozen educational v1. The re-frozen Master Curriculum Roadmap (final Wave = 22) is unchanged. Band A v1 is unchanged. **Wave 21 is not implemented.**

This is **CONTENT ONLY** on the existing presentation + `audio_to_word` engines. Wave 20 reuses historical `skill.word_decoding.simple` and canonical `word.yalab`. It does **not** extend LessonPlayer, the progress store, `hurufi-progress-v1`, `getWordLiveKey`, or any runtime adapter.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-20.json`  
Meta id: `hurufi.production.literacy.wave20`  
Path: `path.literacy.wave20`  
Route slug: `wave-20`

---

## 1. Implementation summary

Wave 20 is a compact one-unit **WORD DECODING** slice.

The child sees three binary compositions and then scores the real word **يَلْعَبُ**.

Required live key is exactly one:

- `word:yalab.decoding`

Wave 19 `letter:bul.closed`, Wave 18 open-damma keys, historical closed keys, sukun-discrimination keys, `word:jism.decoding`, `word:bint.decoding`, and presentation seen keys do not satisfy Wave 20.

---

## 2. Files added

- `src/content/curriculum/data/production/literacy-path.wave-20.json`
- `src/content/curriculum/validation/validateLiteracyWave20.ts`
- `src/lib/curriculum/wave20Bundle.ts`
- `docs/literacy-wave-20-report.md`

---

## 3. Files changed

Registry / resolver / validator / mastery wiring only:

- `src/content/curriculum/validation/validateCurriculum.ts`
- `src/content/curriculum/validation/index.ts`
- `src/content/curriculum/index.ts`
- `src/lib/curriculum/resolveLearn.ts`
- `scripts/validate-curriculum.ts`
- `scripts/validate-unit-mastery.ts`

Not changed: LessonPlayer, progress store, `hurufi-progress-v1`, presentation engine, `audio_to_word` engine, `syllable_blending` engine, `missing_haraka` engine, tracing engine, schema, master roadmap, Waves 1–19 JSON, Band A JSON.

---

## 4. Wave 20 IDs

| Layer | Id |
| --- | --- |
| meta | `hurufi.production.literacy.wave20` |
| path | `path.literacy.wave20` |
| slug | `wave-20` |
| Arabic label | الْمَوْجَةُ الْعِشْرُون |
| Unit 1 | `unit.literacy.wave20.yalab` |

---

## 5. Final unit list

1. `unit.literacy.wave20.yalab` — child title **يَلْعَبُ** — prerequisite `unit.literacy.wave19.bul_closed`

Exactly one unit. No Wave 21.

---

## 6. Canonical word.yalab mapping

Copied from Band A, not invented:

| Field | Value |
| --- | --- |
| id | `word.yalab` |
| lemma | يلعب |
| diacritized | يَلْعَبُ |
| teachingForm | يَلْعَبُ |
| pos | verb |
| category | verbs |
| vocabBand | A |
| subBand | A2 |
| letters | `letter.ya` `letter.lam` `letter.ain` `letter.ba` |
| phonics | fatha, damma, sukun |
| audio | `audio.word.yalab` |
| image | `image.word.yalab` (logical only) |
| legacyId | `verbs-5` |

No `word.yalabu`.

---

## 7. Actual child flow

1. SHOW **يَ + لْ → يَلْ** (`show: chunk`)
2. SHOW **يَلْ + عَ → يَلْعَ** (`show: chunk`)
3. SHOW **يَلْعَ + بُ → يَلْعَبُ** (`show: chunk`)
4. Scored `audio_to_word`: hear **يَلْعَبُ**; choices **يَلْعَبُ / جِسْم / بِنْت**; correct **يَلْعَبُ**

All presentations occur before scored work.

---

## 8. Phonics decomposition

Recommended child-facing assembly (binary only):

يَ + لْ → يَلْ  
يَلْ + عَ → يَلْعَ  
يَلْعَ + بُ → يَلْعَبُ

All marks are historical: fatha, sukun, open damma.

---

## 9. يَلْ presentation-only decision

يَلْ is a presentation string, same pattern as Wave 16 presentation-only **بِنْ**.

No `syllable.yal.closed`.  
No `letter:yal.closed`.

---

## 10. عَ reuse

Bundle recycles `syllable.ain.fatha` (`عَ`). No duplicate fatha class.

---

## 11. بُ reuse

Bundle recycles `syllable.ba.damma` (`بُ`). Historical `letter:ba.damma` is not a Wave 20 gate.

---

## 12. Intermediate-record result

No `letter:yal.closed`.  
No `letter:yalab.partial`.  
No `word:yalab.partial`.

---

## 13. Presentation-engine result

Existing binary `show: "chunk"` only. No ternary presentation. No engine change.

---

## 14. Scoring exercise

Exactly one scored item: `audio_to_word`  
Skill: `skill.word_decoding.simple`  
Target: `word.yalab`

---

## 15. Foil result

Exact readable foils:

- `word.jism` → جِسْم
- `word.bint` → بِنْت

No `وَلَد`. No second verb. No fake words.

---

## 16. Picture decision

No `word_to_picture`. `image.word.yalab` remains a logical asset. No emoji override. No image pipeline work.

---

## 17. Semantic exposure

The child may treat يَلْعَبُ as the familiar meaning “plays”. No formal grammar, no فعل مضارع, no هُوَ, no person/gender lesson. Child-facing task is reading/decoding.

---

## 18. Required live key

Exactly:

`word:yalab.decoding`

---

## 19. Historical-key isolation

Not Wave 20 evidence:

- `letter:ba.damma`
- `letter:kaf.damma`
- `letter:bul.closed`
- `letter:ram.closed`
- `letter:jis.closed`
- historical fatha/kasra keys
- sukun discrimination
- `word:jism.decoding`
- `word:bint.decoding`
- presentation seen keys

---

## 20. Unit mastery contract

`requiredSkillIds`: `["skill.word_decoding.simple"]`

The only live key that satisfies the unit is `word:yalab.decoding`.

---

## 21. Presentation ordering

Three SHOWs first, then the scored item. Presentations have no `masteryTargets`. Attempts remain 0.

---

## 22. Audio result

Logical citation `audio.word.yalab`. Fallback TTS text is **يَلْعَبُ**. Foils reuse `audio.word.jism` and `audio.word.bint`. No production audio work.

---

## 23. Writing result

No tracing. No copy. No `word:yalab.writing`.

---

## 24. No-sentence result

`sentences` is empty. No `وَلَد يَلْعَبُ`. No `الْوَلَدُ يَلْعَبُ`.

---

## 25. No-article result

ال is not taught. Wave 21 owns it.

---

## 26. No-pronoun result

هُوَ is not taught.

---

## 27. No-tanween result

No ـٌ ـٍ ـً.

---

## 28. No-new-letter result

Target letters are only ي ل ع ب, all historical. Foil letters ج س م ن ت are also historical.

---

## 29. No-other-phonics result

No madd-yaa, madd-waw, shadda, hamza, ة, ى, tanween, or article class.

---

## 30. Routing/unlock

Sequence: `wave-18` → `wave-19` → `wave-20`.

Wave 20 stays locked until `unit.literacy.wave19.bul_closed` is mastered.

Finish returns `/learn`. No Wave 21 route.

---

## 31. Validator coverage

`validateLiteracyWave20.ts` enforces the approved contract: one unit, exact SHOWs, `audio_to_word` choices, `word:yalab.decoding`, no closed-yal key, no sentence/article/pronoun/tanween/writing/picture gate, no Wave 21.

---

## 32. Unit-mastery coverage

`scripts/validate-unit-mastery.ts` proves lock/unlock, isolation of historical keys, presentation-cannot-master, and that only `word:yalab.decoding` masters the unit. No Wave 21 is registered.

---

## 33. Browser verification

Headed Chrome Playwright walk against `http://localhost:8080` (`.tmp-w20-walk/walk.mjs`) passed all checks.

1. Seed through Wave 18 only: `/learn/wave-20/unit-1` shows the lock card `أَكْمِلِ الْوَحْدَةَ السَّابِقَةَ أَوَّلاً`.
2. Seed through Wave 19 final: `/learn` shows الْمَوْجَةُ الْعِشْرُون / **يَلْعَبُ**.
3. Exactly one Wave 20 unit cue.
4. No Wave 21 on `/learn`. `/learn/wave-21/unit-1` is 404.
5. Prerequisite followed: locked before Wave 19; open after `unit.literacy.wave19.bul_closed`.
6. First SHOW: **يَ + لْ → يَلْ**
7. Second SHOW: **يَلْ + عَ → يَلْعَ**
8. Third SHOW: **يَلْعَ + بُ → يَلْعَبُ**
9. No scoring before all three SHOWs.
10. Scored choices: **يَلْعَبُ / جِسْم / بِنْت**
11. Correct answer stored `word:yalab.decoding`.
12. No `letter:yal.closed`.
13. No new damma key.
14. No new closed key.
15. No sentence.
16. No article.
17. No pronoun.
18. No tanween.
19. Finish returns `/learn`.
20. No Wave 21 after finish.
21. Presentation attempts = 0.

Artifacts: `.tmp-w20-walk/w20-walk.json`, `.tmp-w20-walk/shots/`.

---

## 34. IndexedDB verification

After completing Wave 20 (`idb-after.json`):

NEW evidence exactly:

- `word:yalab.decoding` — attempts 1, correct 1

Historical evidence unchanged:

- `letter:ba.damma`
- `letter:kaf.damma`
- `letter:bul.closed`
- `letter:ram.closed`
- `letter:jis.closed`

Presentation seen keys (attempts = 0):

- `letter:intro.wave20_presentation_yal`
- `letter:intro.wave20_presentation_yala`
- `letter:intro.wave20_presentation_yalab`

Absent:

- `letter:yal.closed`
- `word:yalab.partial`
- `word:yalab.writing`
- sentence / article / pronoun / new damma keys

---

## 35. npm run check result

`npm run typecheck`, `npm run validate:curriculum`, `npm run validate:unit-mastery`, `npm run build`, and `npm run check` all pass.

---

## 36. Remaining non-blocking limitations

- `image.word.yalab` is still only a logical asset.
- Citation audio is still development TTS fallback.
- Wave 21 (ال + `الْوَلَدُ يَلْعَبُ`) is not opened.

---

## 37. Wave 21 readiness

The child now has `يَلْعَبُ` as a readable word. Wave 21 may introduce ال and the first contextual sentence `الْوَلَدُ يَلْعَبُ`. Do not pull that work into Wave 20.

WAVE 20 IMPLEMENTED — DO NOT IMPLEMENT WAVE 21
