# Literacy Wave 19 — implementation report

Nineteenth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–18 remain frozen educational v1. The Master Curriculum Roadmap remains frozen v1. Band A v1 is unchanged. **Wave 20 is not implemented.**

This is **CONTENT ONLY** on the existing presentation + `syllable_blending` engines. Wave 19 reuses historical `skill.syllable_blending.cvc`, `skill.short_vowel.damma`, and `skill.sukun.basic`. It does **not** extend LessonPlayer, the progress store, `hurufi-progress-v1`, `getClosedChunkLiveKey`, or any runtime adapter.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-19.json`  
Meta id: `hurufi.production.literacy.wave19`  
Path: `path.literacy.wave19`  
Route slug: `wave-19`

---

## 1. Implementation summary

Wave 19 is a compact one-unit **CLOSED DAMMA CVC proof**.

The child reuses productive open **بُ**, sees **بُ + لْ → بُلْ**, and scores the phonics chunk **بُلْ**.

Required live key is exactly one:

- `letter:bul.closed`

Wave 18 open-damma keys, historical closed keys, sukun-discrimination keys, word keys, and presentation seen keys do not satisfy Wave 19.

Wave 19 is a short-vowel completeness milestone. It is **not** a direct mechanical prerequisite inside `يَلْعَبُ`. The frozen roadmap is unchanged.

---

## 2. Files added

- `src/content/curriculum/data/production/literacy-path.wave-19.json`
- `src/content/curriculum/validation/validateLiteracyWave19.ts`
- `src/lib/curriculum/wave19Bundle.ts`
- `docs/literacy-wave-19-report.md`

---

## 3. Files changed

Registry / resolver / validator / mastery wiring only:

- `src/content/curriculum/validation/validateCurriculum.ts`
- `src/content/curriculum/validation/index.ts`
- `src/content/curriculum/index.ts`
- `src/lib/curriculum/resolveLearn.ts`
- `scripts/validate-curriculum.ts`
- `scripts/validate-unit-mastery.ts`

Not changed: LessonPlayer, progress store, `hurufi-progress-v1`, presentation engine, `syllable_blending` engine, `missing_haraka` engine, `audio_to_word` engine, tracing engine, schema, master roadmap, Waves 1–18 JSON, Band A JSON.

---

## 4. Wave 19 IDs

| Layer | Id |
| --- | --- |
| meta | `hurufi.production.literacy.wave19` |
| path | `path.literacy.wave19` |
| slug | `wave-19` |
| Arabic label | الْمَوْجَةُ التَّاسِعَةَ عَشْرَة |
| Unit 1 | `unit.literacy.wave19.bul_closed` |

---

## 5. Final unit list

1. `unit.literacy.wave19.bul_closed` — child title **بُلْ** — prerequisite `unit.literacy.wave18.kaf_damma`

Exactly one unit. No Wave 20.

---

## 6. Actual child flow

1. SHOW familiar **بُ** (`syllable.ba.damma`, `show: cv`)
2. SHOW **بُ + لْ → بُلْ** (`syllable.bul.closed`, `show: chunk`)
3. Scored `syllable_blending`: hear **بُلْ**; choices **بُلْ / بُ / رَمْ**; correct **بُلْ**

All presentations occur before scored work. No isolated لْ SHOW.

---

## 7. Closed-damma rationale

The short-vowel × syllable matrix is now complete for the first time:

- fatha closed: **رَمْ** (`letter:ram.closed`)
- kasra closed: **جِسْ** (`letter:jis.closed`)
- damma closed: **بُلْ** (`letter:bul.closed`)

Wave 18 proved open damma. Wave 19 applies known damma + known sukun to one scored CVC instance.

---

## 8. Wave 20 dependency note

Band A `يَلْعَبُ` decomposes as **يَلْ** (fatha-closed) + **عَ** + **بُ** (open damma). There is no closed-damma syllable inside the verb.

Wave 19 is therefore a **general completeness milestone**, not a direct decode prerequisite for Wave 20. The frozen roadmap still places the closed-class proof here. Wave 20 must not require `letter:bul.closed`.

---

## 9. بُلْ mapping

| Field | Value |
| --- | --- |
| Syllable id | `syllable.bul.closed` |
| Text | بُلْ |
| Unicode | ب + U+064F DAMMA + ل + U+0652 SUKUN |
| Pattern | CVC |
| Letter | `letter.ba` (taught Wave 2) |
| Coda | `letter.lam` (taught Wave 1) |
| Vowel skill | `skill.short_vowel.damma` |
| Required skills | `skill.short_vowel.damma`, `skill.sukun.basic` |
| Audio | `audio.syllable.bul.closed` |
| Tags | `cvc`, `closed-chunk`, `wave-19` |

No word record. No new consonant.

---

## 10. Closed-key mapping

Existing `getClosedChunkLiveKey` strips `syllable.` from `syllable.bul.closed` and emits:

**`letter:bul.closed`**

This matches `letter:ram.closed` and `letter:jis.closed`. No `letter:ba.damma.closed`. No unitMastery special case.

---

## 11. Fake-word / vocabulary decision

**بُلْ** is a phonics chunk, same pedagogical status as **رَمْ**.

- No `word.bul`
- Not added to Band A
- Not added to the 720-word bank
- No `audio_to_word` / `picture_to_word` / `word_to_picture`
- Child-facing copy stays phonics: `اُنْظُرْ وَاسْتَمِعْ` / `اِسْتَمِعْ وَاخْتَرِ الْمَقْطَع`

---

## 12. Open-damma reuse

SHOW **بُ** reuses `syllable.ba.damma` because Wave 18 already mastered `letter:ba.damma`.

Wave 19 does **not** require `letter:ba.damma` or `letter:kaf.damma` as live keys. Those remain Wave 18 evidence only.

---

## 13. Sukun reuse

لْ appears only as the right operand of the chunk SHOW. No `syllable.lam.sukun`. No `diacritic:*.sukun.discrimination`. No `missing_haraka`. Sukun stays historically productive via `skill.sukun.basic` on the syllable record, not as a unit gate.

---

## 14. Scoring exercise

Existing `syllable_blending` with `skill.syllable_blending.cvc`.

Unit `requiredSkillIds`: `["skill.syllable_blending.cvc"]` only.

No `audio_to_word`, `picture_to_word`, `missing_haraka`, or tracing.

---

## 15. Foil design

| Choice | Record | Role |
| --- | --- | --- |
| بُلْ | `syllable.bul.closed` | target |
| بُ | `syllable.ba.damma` | same onset, still open |
| رَمْ | `syllable.ram.closed` | known fatha-closed class |

No invented بَلْ / بِلْ / كُلْ / بُنْ foil records.

---

## 16. Required live key

Exactly one:

- `letter:bul.closed`

---

## 17. Historical key isolation

These do not satisfy Wave 19:

- `letter:ba.damma`, `letter:kaf.damma`
- `letter:ram.closed`, `letter:jis.closed`
- `diacritic:mim.sukun.discrimination`
- `word:naam.decoding`, `word:laa.decoding`, `word:wa.decoding`
- presentation seen keys (`letter:intro.wave19_*`)

---

## 18. Unit mastery contract

- Locked before `unit.literacy.wave18.kaf_damma`
- Opens after Wave 18 final
- Presentations cannot master the unit
- Open-damma keys alone cannot master it
- Historical closed / sukun / word keys cannot master it
- Only `letter:bul.closed` satisfies it

---

## 19. Presentation ordering

SHOW بُ → SHOW بُ + لْ → بُلْ → score بُلْ.

Presentations are unscored, have no `masteryTargets`, and keep attempts at 0.

---

## 20. Audio result

New logical stub: `audio.syllable.bul.closed`. Fallback TTS text: بُلْ.

Reused: `audio.syllable.ba.damma`, `audio.syllable.ram.closed`.

No production audio work.

---

## 21. Writing/tracing result

No tracing. No `letter:bul.closed.tracing`. No Wave 19 writing key.

---

## 22. No-verb result

No `يَلْعَبُ`. No `word.yalab`. Wave 20 owns the verb.

---

## 23. No-sentence result

`sentences: []`. No `الْوَلَدُ يَلْعَبُ`.

---

## 24. No-article result

No ال as a teaching target. Child titles are **بُلْ** only.

---

## 25. No-tanween result

No ـٌ / ـٍ / ـً.

---

## 26. No-new-letter result

Teaching letters: ب ل. Foil letters: ر م. All previously taught. No ه ذ ز خ ث ص غ ط ض ظ.

---

## 27. No-other-phonics result

No madd-yaa, madd-waw, shadda, hamza, ة, ى, definite article, or tanween. Novelty is application only: known open damma + known sukun → one CVC instance.

---

## 28. Routing/unlock

Sequence: wave-1 … wave-18 → **wave-19**. No wave-20.

Before Wave 18 final: Wave 19 locked. After `unit.literacy.wave18.kaf_damma`: the one Wave 19 unit opens. Finish returns to `/learn`. No future wave appears.

---

## 29. Validation coverage

`validateLiteracyWave19.ts` enforces the implementation contract: Waves 1–18 untouched, prereq exactly `unit.literacy.wave18.kaf_damma`, one unit, one CVC record `syllable.bul.closed`, text بُلْ, live key `letter:bul.closed`, no re-gate of open damma, no discrimination, no word/verb/sentence/article/tanween/new letter/other phonics, presentations before score, presentation + `syllable_blending` only, no Wave 20.

---

## 30. Unit-mastery coverage

`scripts/validate-unit-mastery.ts` proves unlock after Wave 18 final, isolation from open-damma / historical closed / sukun / word / presentation keys, pass only with `letter:bul.closed`, no Wave 20 registration, and no runtime architecture change.

Earlier-wave “Wave 19 is not registered” asserts now require Wave 19 and forbid Wave 20.

---

## 31. Browser verification

Headed Chrome walk against localhost: seed through Wave 18 final → `/learn` shows Wave 19, one unit, no Wave 20 → SHOW بُ → SHOW بُ + لْ → بُلْ → scored choices بُلْ / بُ / رَمْ → finish `/learn`. Details recorded in `.tmp-w19-walk/w19-walk.json`.

---

## 32. IndexedDB verification

After completion, new Wave 19 evidence is exactly `letter:bul.closed`. Absent as new Wave 19 evidence: `letter:ba.damma` (historical only), `letter:kaf.damma` (historical only), `letter:mim.damma`, discrimination keys, `word:bul*`, `word:yalab*`, writing keys. Presentation attempts = 0.

---

## 33. npm run check result

`npm run typecheck`, `npm run validate:curriculum`, `npm run validate:unit-mastery`, `npm run build`, and `npm run check` all pass.

---

## 34. Remaining non-blocking limitations

- TTS quality of بُلْ is a development fallback, same as other CVC stubs.
- A child may hear بُلْ as word-like; copy stays phonics-first.
- Wave 20 still needs يَلْ + عَ + بُ. Closed damma is not inside that word.

---

## 35. Wave 20 readiness note

Wave 20 may decode **`يَلْعَبُ`** as a word. It should reuse open `بُ` and historical closed fatha. It must not require `letter:bul.closed`. No sentence. Wave 21 owns ال + `الْوَلَدُ يَلْعَبُ`.

---

WAVE 19 IMPLEMENTED — DO NOT IMPLEMENT WAVE 20
