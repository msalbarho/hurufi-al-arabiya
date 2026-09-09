# Literacy Wave 18 — implementation report

Eighteenth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–17 remain frozen educational v1. The Master Curriculum Roadmap remains frozen v1. Band A v1 is unchanged. **Wave 19 is not implemented.**

This is **CONTENT ONLY** on the existing presentation + `syllable_blending` engines. Wave 18 reuses canonical `skill.short_vowel.damma` and the existing damma facet (`U+064F`). It does **not** extend LessonPlayer, the progress store, `hurufi-progress-v1`, or any runtime adapter.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-18.json`  
Meta id: `hurufi.production.literacy.wave18`  
Path: `path.literacy.wave18`  
Route slug: `wave-18`

---

## 1. Implementation summary

Wave 18 is a compact two-unit **productive OPEN DAMMA class**.

Unit 1 establishes **بُ**. Unit 2 transfers damma onto **كُ**. The child also sees unscored **مُ** as a third open-damma class look. That look does not create a third mastery gate.

Required live keys are exactly two:

- `letter:ba.damma`
- `letter:kaf.damma`

Historical fatha/kasra keys, mark-discrimination keys, `letter:mim.damma`, word keys, closed keys, and presentation seen keys do not satisfy Wave 18.

---

## 2. Files added

- `src/content/curriculum/data/production/literacy-path.wave-18.json`
- `src/content/curriculum/validation/validateLiteracyWave18.ts`
- `src/lib/curriculum/wave18Bundle.ts`
- `docs/literacy-wave-18-report.md`

---

## 3. Files changed

Registry / resolver / validator / mastery wiring only:

- `src/content/curriculum/validation/validateCurriculum.ts`
- `src/content/curriculum/validation/index.ts`
- `src/content/curriculum/index.ts`
- `src/lib/curriculum/resolveLearn.ts`
- `scripts/validate-curriculum.ts`
- `scripts/validate-unit-mastery.ts`

Not changed: LessonPlayer, progress store, `hurufi-progress-v1`, presentation engine, `syllable_blending` engine, `missing_haraka` engine, tracing engine, schema, master roadmap, Waves 1–17 JSON, Band A JSON.

---

## 4. Wave 18 IDs

| Layer | Id |
| --- | --- |
| meta | `hurufi.production.literacy.wave18` |
| path | `path.literacy.wave18` |
| slug | `wave-18` |
| Arabic label | الْمَوْجَةُ الثَّامِنَةَ عَشْرَة |
| Unit 1 | `unit.literacy.wave18.ba_damma` |
| Unit 2 | `unit.literacy.wave18.kaf_damma` |

---

## 5. Final unit list

1. `unit.literacy.wave18.ba_damma` — child title **بُ** — prerequisite `unit.literacy.wave17.wa_bint`
2. `unit.literacy.wave18.kaf_damma` — child title **كُ** — prerequisite Unit 1

Exactly two units. No Wave 19.

---

## 6. Actual child flow

**Unit 1**

1. SHOW familiar **بَ** (`syllable.ba.fatha`, `show: cv`)
2. SHOW **ب + ُ → بُ** (`syllable.ba.damma`, `show: cv`)
3. Scored `syllable_blending`: hear **بُ**; choices **بُ / بَ / بِ**; correct **بُ**

**Unit 2**

1. SHOW familiar **كَ** (`syllable.kaf.fatha`)
2. SHOW **ك + ُ → كُ** (`syllable.kaf.damma`)
3. SHOW **م + ُ → مُ** (`syllable.mim.damma`, unscored third-class look)
4. Scored `syllable_blending`: hear **كُ**; choices **كُ / كَ / كِ**; correct **كُ**

All presentations occur before scored work.

---

## 7. Damma skill reuse

Wave 18 reuses the existing canonical skill `skill.short_vowel.damma` from the shared-skills catalog (nameAr الضَّمَّة, prerequisite fatha). No second damma skill was created.

Canonical mark is **ُ** (`U+064F ARABIC DAMMA`). Existing `vowelFacetFromSkill` already maps this skill to facet `damma`, so `getSyllableLiveKey` emits `letter:{legacyId}.damma` with no engine change.

---

## 8. بُ mapping

| Field | Value |
| --- | --- |
| Syllable id | `syllable.ba.damma` |
| Pattern | CV |
| Letter | `letter.ba` (taught Wave 2) |
| Vowel skill | `skill.short_vowel.damma` |
| Text | بُ |
| Audio | `audio.syllable.ba.damma` |
| Live key | `letter:ba.damma` |

No word record. No new consonant.

---

## 9. كُ mapping

| Field | Value |
| --- | --- |
| Syllable id | `syllable.kaf.damma` |
| Pattern | CV |
| Letter | `letter.kaf` (taught Wave 5) |
| Vowel skill | `skill.short_vowel.damma` |
| Text | كُ |
| Audio | `audio.syllable.kaf.damma` |
| Live key | `letter:kaf.damma` |

---

## 10. مُ reinforcement mapping

Unit 2 SHOW 3 reuses historical `syllable.mim.damma` and `audio.syllable.mim.damma` from Wave 1. It is presentation-only: no `masteryTargets`, no `letter:mim.damma` requirement, no score.

This satisfies the three-CV exposure goal without a third mastery gate.

---

## 11. Fatha / kasra / damma contrasts

Scored triangles are intentionally:

- بُ / بَ / بِ — ب has productive fatha (Wave 2) and productive kasra (Wave 16)
- كُ / كَ / كِ — ك has productive fatha (Wave 5) and productive kasra (Wave 13)

مَ / مِ / مُ is not the required triangle because مِ is not productive. مُ remains SHOW only.

---

## 12. Required live keys

Exactly two new required Wave 18 keys:

- `letter:ba.damma`
- `letter:kaf.damma`

No others.

---

## 13. Historical key isolation

These do not satisfy Wave 18:

- `letter:ba.fatha`, `letter:ba.kasra`, `letter:ba.madd_alif`
- `letter:kaf.fatha`, `letter:kaf.kasra`
- `letter:mim.fatha`, `letter:jim.kasra`, `letter:ain.kasra`
- `letter:mim.damma`, `letter:fa.damma` (old foil records)
- `diacritic:mim.fatha.discrimination`, `diacritic:fa.fatha.discrimination`, `diacritic:ba.damma.discrimination`
- `word:naam.decoding`, `word:laa.decoding`, `word:wa.decoding`, any `word:*.decoding`
- any presentation seen key
- any `*.closed` key

---

## 14. Unit 1 mastery contract

Required skill: `skill.short_vowel.damma`  
Required live evidence: **`letter:ba.damma` only**

Unit 1 does not require `letter:ba.fatha`, `letter:ba.kasra`, `letter:ba.madd_alif`, `diacritic:ba.damma.discrimination`, `letter:mim.damma`, any word key, any presentation key, or any tracing key.

---

## 15. Unit 2 mastery contract

Required skill: `skill.short_vowel.damma`  
Required live evidence: **`letter:kaf.damma` only**

Unit 2 does not require `letter:kaf.fatha`, `letter:kaf.kasra`, `letter:mim.damma`, `diacritic:kaf.damma.discrimination`, any closed key, any word key, any presentation key, or any tracing key.

---

## 16. Presentation ordering

LessonPlayer drains unseen presentations first. Both units keep every SHOW before scored work:

- Unit 1: بَ → بُ → score بُ
- Unit 2: كَ → كُ → مُ → score كُ

All presentations are unscored, have no `masteryTargets`, and leave attempts at 0.

---

## 17. Why mark-discrimination is not required

Wave 18 mastery is **open-CV decoding evidence**, not mark-only evidence. `missing_haraka` would write `diacritic:{legacy}.damma.discrimination`. That is the same policy kasra waves already rejected: seeing the mark is not the same as blending the syllable. Both scored items are `syllable_blending`.

---

## 18. No-closed-damma result

No closed-damma class was authored. Forbidden targets مُنْ / بُلْ / قُمْ and any `syllable.*.closed` using damma are absent. Wave 19 owns closed damma.

---

## 19. No-verb result

No damma verb was introduced. يَلْعَبُ / يَشْرَبُ / يَلْبَسُ are absent. No `audio_to_word` activity exists. Wave 20 owns يَلْعَبُ.

---

## 20. No-sentence result

`sentences` is empty. الْوَلَدُ يَلْعَبُ is absent. Wave 21 owns that sentence.

---

## 21. No-new-letter result

Wave 18 uses only previously taught letters: ب (Wave 2), ك (Wave 5), م (Wave 1). ه ذ ز خ ث ص غ ط ض ظ are absent.

---

## 22. No-other-phonics result

The only newly productive phonics class is `skill.short_vowel.damma`. Wave 18 does not introduce madd-yaa, madd-waw, shadda, hamza, taa marbuta, alif maqsura, the definite article, or tanween. Sukun may remain historical elsewhere; it is not a Wave 18 rule.

---

## 23. Writing / tracing result

No required writing or tracing. Keys `letter:ba.damma.tracing` and `letter:kaf.damma.tracing` were not invented. Tracing does not honestly establish damma mastery.

---

## 24. Audio result

New logical stubs:

- `audio.syllable.ba.damma`
- `audio.syllable.kaf.damma`

SHOW مُ reuses existing `audio.syllable.mim.damma`. Current AudioManager / development TTS fallback is used. No production audio work.

---

## 25. Routing / unlock

`wave-1` … `wave-17` → `wave-18`. No `wave-19`.

Before `unit.literacy.wave17.wa_bint` is mastered, Wave 18 stays locked under the existing `/learn` pattern. After Wave 17 final mastery, Unit 1 opens and Unit 2 stays locked. After Unit 1, Unit 2 opens. After Unit 2, finish returns to `/learn`. No future wave appears.

---

## 26. Validation coverage

`validateLiteracyWave18.ts` enforces the approved contract: Waves 1–17 stay out of this bundle’s path/unit records; prerequisite is exactly `unit.literacy.wave17.wa_bint`; exactly two units with the frozen IDs; no Wave 19; damma is the only newly productive phonics class; canonical `skill.short_vowel.damma` and mark `U+064F`; new syllables exactly بُ and كُ; required third SHOW exactly مُ; both new syllables are CV on previously taught ب and ك; scored choices are بُ / بَ / بِ and كُ / كَ / كِ; required live keys exactly `letter:ba.damma` and `letter:kaf.damma`; no discrimination / `letter:mim.damma` / historical fatha-kasra / word / closed / verb / sentence / ال / tanween / madd-yaa / madd-waw / shadda / hamza / ة / ى / new consonant / writing; all SHOWs precede scored work; presentations stay unscored; engines remain presentation + `syllable_blending` only.

---

## 27. Unit-mastery coverage

`scripts/validate-unit-mastery.ts` proves:

- Wave 18 unavailable before Wave 17 final mastery
- after Wave 17 final: Unit 1 open, Unit 2 locked
- Unit 1 fails with only `letter:ba.fatha`
- Unit 1 fails with only `letter:ba.kasra`
- Unit 1 fails with only historical discrimination evidence
- Unit 1 fails with `letter:kaf.damma` alone
- Unit 1 passes only with `letter:ba.damma`
- Unit 2 then unlocks
- Unit 2 fails with Unit 1 evidence alone
- Unit 2 fails with historical `letter:kaf.fatha`
- Unit 2 fails with historical `letter:kaf.kasra`
- Unit 2 fails with seeded `letter:mim.damma`
- Unit 2 passes only with `letter:kaf.damma`
- presentations cannot satisfy mastery
- old foil syllable records cannot satisfy mastery
- word keys cannot satisfy mastery
- no Wave 19 exists

Older resolveLearn asserts now require Wave 18 registered and Wave 19 absent.

---

## 28. Browser verification

Headed Chrome (`playwright` Chromium, `http://localhost:8080`) against a seed through Wave 17 final.

| # | Check | Result |
| --- | --- | --- |
| 1 | Seed through Wave 17 final | Pass |
| 2 | `/learn` shows Wave 18 | Pass |
| 3 | Exactly 2 units | Pass |
| 4 | No Wave 19 | Pass |
| 5 | Unit 1 opens | Pass |
| 6 | Unit 2 locked | Pass |
| 7 | Unit 1 SHOW بَ | Pass |
| 8 | SHOW بُ | Pass |
| 9 | No score before both SHOWs | Pass |
| 10 | Scored بُ choices visibly بُ / بَ / بِ | Pass |
| 11 | Correct answer creates `letter:ba.damma` | Pass |
| 12 | Unit 1 mastery | Pass |
| 13 | Unit 2 unlocks | Pass |
| 14 | SHOW كَ | Pass |
| 15 | SHOW كُ | Pass |
| 16 | SHOW مُ | Pass |
| 17 | No score before all SHOWs | Pass |
| 18 | Scored كُ choices visibly كُ / كَ / كِ | Pass |
| 19 | Correct answer creates `letter:kaf.damma` | Pass |
| 20 | SHOW مُ creates no `letter:mim.damma` | Pass |
| 21 | Finish returns `/learn` | Pass |
| 22 | Wave 18 mastered | Pass |
| 23 | No Wave 19 | Pass |
| 24 | No closed-damma target | Pass |
| 25 | No verb | Pass |
| 26 | No sentence | Pass |
| 27 | No ال | Pass |
| 28 | No tanween | Pass |
| 29 | No new letter | Pass |
| 30 | Presentation attempts = 0 | Pass |

Before Wave 17 final mastery, Wave 18 is visible but both units show الْوَحْدَةُ التَّالِيَة. After Wave 17 final, Unit 1 has a CTA and Unit 2 stays locked.

---

## 29. IndexedDB verification

After the headed walk (`hurufi-progress-v1`):

**New**

- `letter:ba.damma` (3/3, streak 3)
- `letter:kaf.damma` (3/3, streak 3)

**Absent as new Wave 18 keys**

- `diacritic:ba.damma.discrimination`
- `diacritic:kaf.damma.discrimination`
- `letter:mim.damma`
- `letter:fa.damma`
- any new `*.closed`
- any Wave 18 word key
- any Wave 18 writing/tracing key

**Presentations attempts = 0**

- `letter:intro.wave18_presentation_ba_fatha`
- `letter:intro.wave18_presentation_ba_damma`
- `letter:intro.wave18_presentation_kaf_fatha`
- `letter:intro.wave18_presentation_kaf_damma`
- `letter:intro.wave18_presentation_mim_damma`

Historical `letter:ba.fatha`, `letter:ba.kasra`, `letter:kaf.fatha`, `letter:kaf.kasra`, `word:naam.decoding`, `word:laa.decoding`, and `word:wa.decoding` unchanged (still the Wave 17 seed values from 2026-03-01).

---

## 30. npm run check result

`npm run check` **PASS** (typecheck, validate:curriculum including Wave 18, validate:unit-mastery, build).

---

## 31. Remaining non-blocking limitations

- Development audio fallback is used. No production audio pipeline work.
- Presentation `show: cv` shows the composed syllable; it does not add a new “letter + mark → syllable” operand field.
- Historical `syllable.mim.damma` remains a Wave 1 foil record reused as an unscored look. Seeing it still does not write `letter:mim.damma`.
- Closed damma, يَلْعَبُ, ال, and tanween remain later-wave work.

---

## 32. Wave 19 readiness note

Wave 18 is complete. The next planned slice is closed damma. Do not implement it in this branch. Do not add Wave 19 routing, JSON, or units here.

---

WAVE 18 IMPLEMENTED — DO NOT IMPLEMENT WAVE 19
