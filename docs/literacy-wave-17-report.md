# Literacy Wave 17 — implementation report

Seventeenth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–16 remain frozen educational v1. The Master Curriculum Roadmap remains frozen v1. Band A v1 is unchanged. **Wave 18 is not implemented.**

This is **CONTENT ONLY** on the existing presentation + `audio_to_word` engines. Wave 17 does **not** introduce a new phonics class, a new consonant, damma, a sentence, ال, tanween, or word-writing mastery.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-17.json`  
Meta id: `hurufi.production.literacy.wave17`  
Path: `path.literacy.wave17`  
Route slug: `wave-17`

---

## 1. Implementation summary

Wave 17 is a compact two-unit **language spark + writing look**.

Unit 1 teaches the utterances **نَعَم** and **لَا** as readable responses, not as a yes/no question frame and not as a sentence.

Unit 2 teaches the joiner **وَ** as an independent function word, shows the coordinated phrase **وَلَد وَبِنْت**, and lets the child inspect citation **بِنْت** as writing exposure.

Required live keys are exactly three:

- `word:naam.decoding`
- `word:laa.decoding`
- `word:wa.decoding`

Historical `letter:waw.fatha`, `word:walad.decoding`, and `word:bint.decoding` do not satisfy Wave 17.

---

## 2. Files added

- `src/content/curriculum/data/production/literacy-path.wave-17.json`
- `src/content/curriculum/validation/validateLiteracyWave17.ts`
- `src/lib/curriculum/wave17Bundle.ts`
- `docs/literacy-wave-17-report.md`

---

## 3. Files changed

Registry / resolver / validator / mastery wiring only:

- `src/content/curriculum/validation/validateCurriculum.ts`
- `src/content/curriculum/validation/index.ts`
- `src/content/curriculum/index.ts`
- `src/lib/curriculum/resolveLearn.ts`
- `scripts/validate-curriculum.ts`
- `scripts/validate-unit-mastery.ts`

Not changed: LessonPlayer, progress store, `hurufi-progress-v1`, presentation engine, `audio_to_word` engine, tracing engine, schema, master roadmap, Waves 1–16 JSON, Band A JSON.

---

## 4. Wave 17 IDs

| Layer | Id |
| --- | --- |
| meta | `hurufi.production.literacy.wave17` |
| path | `path.literacy.wave17` |
| slug | `wave-17` |
| Arabic label | الْمَوْجَةُ السَّابِعَةَ عَشْرَة |
| Unit 1 | `unit.literacy.wave17.naam_laa` |
| Unit 2 | `unit.literacy.wave17.wa_bint` |

---

## 5. Final unit list

1. `unit.literacy.wave17.naam_laa` — child title **نَعَم** — prerequisite `unit.literacy.wave16.bint`
2. `unit.literacy.wave17.wa_bint` — child title **وَ** — prerequisite Unit 1

Exactly two units. No Wave 18.

---

## 6. Actual child flow

**Unit 1**

1. SHOW **نَعَم**
2. SHOW **لَا**
3. scored `audio_to_word`: hear **نَعَم**, choose نَعَم / لَا
4. scored `audio_to_word`: hear **لَا**, choose لَا / نَعَم

**Unit 2**

1. SHOW **وَ** (historical `syllable.waw.fatha`, `show: cv`)
2. SHOW coordinated phrase **وَلَد وَبِنْت** (`chunk`: left وَلَد, right بِنْت, result وَلَد وَبِنْت)
3. SHOW citation **بِنْت** (writing look)
4. scored `audio_to_word`: hear **وَ**, choose وَ / لَا

Finish returns to `/learn`.

---

## 7. نعم mapping

Canonical Band A record `word.naam` copied into the Wave 17 bundle.

- lemma: نعم
- teachingForm / diacritized: نَعَم
- pos / category: function
- letters: nun, ain, mim
- phonics: fatha only
- highFrequency / frequencyBand: true / core (source values preserved)
- no `legacyId`
- live key: `word:naam.decoding`

No second word id. No picture_to_word.

---

## 8. لا mapping

Canonical Band A record `word.laa` copied into the Wave 17 bundle.

- lemma: لا
- teachingForm / diacritized: لَا
- pos / category: function
- letters: lam, alif
- phonics: fatha + existing madd-alif skill
- no `legacyId`
- live key: `word:laa.decoding`

لَا is not treated as a new madd class.

---

## 9. وَ mapping

New portable function-word record `word.wa` lives in the Wave 17 production bundle only. Band A JSON was not modified.

- lemma: و
- teachingForm / diacritized: وَ
- pos / category: function
- letters: `letter.waw`
- phonics: `skill.short_vowel.fatha`
- no `legacyId`
- live key: `word:wa.decoding`

Historical `syllable.waw.fatha` is reused for the unscored SHOW only. `letter:waw.fatha` is not a Wave 17 gate.

---

## 10. Coordinated phrase classification

**وَلَد وَبِنْت** is a coordinated noun phrase / language activity.

It is **not** a sentence. There is no sentence record and no fake word id. It uses the existing presentation `chunk` mechanism:

- left: وَلَد
- right: بِنْت
- result: وَلَد وَبِنْت

No tanween. No ال. No contextual sentence ending.

---

## 11. Writing exposure result

Unit 2 SHOWs citation **بِنْت** as a writing look. The child inspects the complete written form. Isolated-letter tracing was omitted: it would not honestly represent word writing and would not improve the flow.

---

## 12. Why writing is not a mastery gate

The tracing engine only supports isolated-letter tracing. Wave 17 therefore does not claim copy-word mastery, freehand word writing, whole-word tracing, or independent word production.

There is no `word:bint.writing`. Writing is not in `requiredSkillIds`. Historical `letter:ba.tracing` / `letter:nun.tracing` / `letter:ta.tracing` are not reused as a false word-writing gate.

---

## 13. Required live keys

Exactly:

- `word:naam.decoding`
- `word:laa.decoding`
- `word:wa.decoding`

No others.

---

## 14. Historical key isolation

These do **not** satisfy Wave 17:

- `letter:waw.fatha`
- `word:walad.decoding`
- `word:bint.decoding`
- any tracing key
- any phrase key
- presentation seen keys

---

## 15. Unit 1 mastery contract

`requiredSkillIds`: `skill.word_decoding.simple`

Both scored `audio_to_word` items write that skill on different words, so Unit 1 needs **both** `word:naam.decoding` and `word:laa.decoding`. Either key alone fails.

---

## 16. Unit 2 mastery contract

`requiredSkillIds`: `skill.word_decoding.simple`

Only `word.wa` is scored, so Unit 2 requires **only** `word:wa.decoding`.

---

## 17. Presentation ordering

All SHOWs are listed before scored items in JSON. The existing LessonPlayer unseen-presentation drain keeps that order at runtime.

Unit 1: نَعَم → لَا → scored نَعَم → scored لَا  
Unit 2: وَ → وَلَد وَبِنْت → بِنْت → scored وَ

Presentations have no mastery targets. Completion cannot satisfy mastery. Attempts remain 0.

---

## 18. No-sentence result

نَعَم / لَا are utterances / responses.  
وَلَد وَبِنْت is a coordinated phrase.

The first real sentence remains future: **الْوَلَدُ يَلْعَبُ** (Wave 21). It is not in Wave 17 child content. `sentences` is empty.

---

## 19. No-damma result

No child exercise contains damma. Forbidden targets يَلْعَبُ / هُوَ / هُنَا / أُمّ are absent. `skill.short_vowel.damma` is not introduced. Wave 18 owns damma.

---

## 20. No-new-phonics result

Allowed reuse only: fatha, kasra, sukun, madd-alif, existing letters/forms.

Not introduced: damma, madd-yaa, madd-waw, shadda, hamza, ة, ى, ال, tanween, new consonants.

---

## 21. Routing / unlock

`wave-1` … `wave-16` → `wave-17`. No `wave-18`.

Before `unit.literacy.wave16.bint` is mastered, Wave 17 units stay locked under the existing `/learn` pattern. After Wave 16 final mastery, Unit 1 opens and Unit 2 stays locked. After Unit 1, Unit 2 opens. After Unit 2, finish returns to `/learn`. No future wave appears.

---

## 22. Validation coverage

`validateLiteracyWave17.ts` enforces the approved contract: Waves 1–16 stay out of this bundle’s path/unit ids; prerequisite is `unit.literacy.wave16.bint`; exactly two units; no Wave 18; no damma / new consonant / madd-yaa / madd-waw / shadda / hamza / ة / ى / ال / tanween; canonical نَعَم / لَا / وَ; Band A fidelity for `word.naam` and `word.laa`; `word.wa` has no invented legacyId; the phrase is not a sentence record and is exactly وَلَد وَبِنْت as an unscored presentation; writing SHOW uses citation بِنْت; no writing mastery key; no `letter:waw.fatha` / `word:walad.decoding` / `word:bint.decoding` required; required keys exactly the three decoding keys; presentations precede scored items and stay unscored; no هَلْ / هَذَا / هَذِهِ as target content.

---

## 23. Unit-mastery coverage

`scripts/validate-unit-mastery.ts` proves:

- Wave 17 unavailable before Wave 16 final mastery
- after Wave 16 final: Unit 1 open, Unit 2 locked
- Unit 1 cannot pass with only `word:naam.decoding`
- Unit 1 cannot pass with only `word:laa.decoding`
- Unit 1 passes only with both
- historical `letter:waw.fatha` / `word:walad.decoding` / `word:bint.decoding` do not satisfy Wave 17
- Unit 2 requires only `word:wa.decoding`
- presentations cannot satisfy mastery
- no writing key can substitute
- no Wave 18 exists

Older resolveLearn asserts now require Wave 17 registered and Wave 18 absent.

---

## 24. Browser verification

Headed Chrome (`playwright` Chromium, `http://localhost:8080`) against a seed through Wave 16 final.

| # | Check | Result |
| --- | --- | --- |
| 1 | Seed through Wave 16 final | Pass |
| 2 | `/learn` shows Wave 17 | Pass |
| 3 | Exactly 2 units | Pass |
| 4 | No Wave 18 | Pass |
| 5 | Unit 1 opens | Pass |
| 6 | Unit 2 locked | Pass |
| 7 | Unit 1 SHOW نَعَم | Pass |
| 8 | SHOW لَا | Pass |
| 9 | No scored item before SHOWs | Pass |
| 10 | Hear/select نَعَم | Pass |
| 11 | Hear/select لَا | Pass |
| 12 | Unit 1 mastery requires both keys | Pass (unit-mastery + live walk) |
| 13 | Unit 2 unlocks | Pass |
| 14 | SHOW وَ | Pass |
| 15 | SHOW phrase وَلَد وَبِنْت | Pass |
| 16 | Phrase not called sentence | Pass |
| 17 | SHOW citation بِنْت | Pass |
| 18 | No word-writing mastery claim | Pass |
| 19 | Scored وَ only after SHOWs | Pass |
| 20 | `word:wa.decoding` stored | Pass |
| 21 | No new `letter:waw.fatha` evidence | Pass |
| 22 | No writing mastery evidence | Pass |
| 23 | No damma in Wave 17 target content | Pass |
| 24 | No ال | Pass |
| 25 | No tanween | Pass |
| 26 | Finish returns `/learn` | Pass |
| 27 | Wave 17 mastered | Pass |
| 28 | No Wave 18 | Pass |

Before Wave 16 final mastery, Wave 17 is visible but both units show الْوَحْدَةُ التَّالِيَة. After Wave 16 final, Unit 1 has a CTA and Unit 2 stays locked. Wave 16 Unit 2 still opens on historical بِ + نْ → بِنْ.

---

## 25. IndexedDB verification

After the headed walk (`hurufi-progress-v1`):

**New**

- `word:naam.decoding` (2/2)
- `word:laa.decoding` (1/1)
- `word:wa.decoding` (3/3)

**Absent as new Wave 17 keys**

- `letter:waw.fatha` — historical value unchanged; no new evidence
- `word:bint.writing`
- `phrase:walad_wa_bint`
- `language.response.naam`
- `language.response.laa`
- `language.conjunction.wa`

**Presentations attempts = 0**

- `letter:intro.wave17_presentation_naam`
- `letter:intro.wave17_presentation_laa`
- `letter:intro.wave17_presentation_wa`
- `letter:intro.wave17_presentation_walad_wa_bint`
- `letter:intro.wave17_presentation_bint_writing`

Historical `word:walad.decoding`, `word:bint.decoding`, `letter:ba.kasra`, and `letter:ta.form.final` unchanged.

---

## 26. npm run check result

`npm run check` **PASS** (typecheck, validate:curriculum including Wave 17, validate:unit-mastery, build).

---

## 27. Remaining non-blocking limitations

- No genuine context-picture + question + نعم/لا engine exists. Wave 17 therefore stays utterance decoding only.
- Presentation `chunk` has no joiner field. The phrase shows وَلَد + بِنْت → وَلَد وَبِنْت; the joiner is visible in the result, not as a separate operand.
- Function-word prototype images are unsuitable; picture activities were not used.
- Citation بِنْت is a writing look, not production.
- Development audio fallback is used. No production audio pipeline work.

---

## 28. Wave 18 readiness note

Wave 17 is complete. The next planned slice is damma. Do not implement it in this branch. Do not add Wave 18 routing, JSON, or units here.

---

WAVE 17 IMPLEMENTED — DO NOT IMPLEMENT WAVE 18
