# Module 2 — Remaining Letters & Orthographic Forms

Post-wave Module 2 for حُرُوفِي العَرَبِيَّة. Waves 1–22 remain frozen. Module 1 remains frozen. **Final wave count = 22. No Wave 23.** Module 3 is not implemented.

Source of truth: `src/content/curriculum/data/production/literacy-path.orthographic-foundations.json`  
Meta id: `hurufi.production.literacy.orthographic_foundations`  
Module id: `module.orthographic_foundations`  
Path: `path.literacy.orthographic_foundations`  
URL slug: `orthographic-foundations`  
Arabic title: **الْحُرُوفُ وَالْعَلَامَات**

---

## 1. Implementation summary

Nine units after Module 1 final (`unit.literacy.reading_foundations.sentence_transfer`): ه, ذ/ز, خ/ث, ص/ض, غ, ط/ظ, shadda, initial أ, then ة/ى. Modules sit **beside** Waves. `LEARN_WAVE_SLUGS` still ends at `wave-22`. `orthographic-foundations` is added only to `LEARN_MODULE_SLUGS`. Lessons reuse `LessonPlayer`, the existing exercise registry, `hurufi-progress-v1`, and generic unlock/mastery. No island map, no second LessonPlayer, no IndexedDB migration.

---

## 2. Architecture reuse

Same Module architecture as Module 1:

- `LEARN_MODULE_SLUGS` / `ORTHOGRAPHIC_FOUNDATIONS_SLUG`
- `getOrthographicFoundationsBundle()`
- `listLearnModules` / `resolveLearnModulePath` / `resolveLearnModuleUnit`
- `lookupLearnPrereq` searches waves then modules
- Routes: `/learn/modules/$moduleId/$unitId`
- `LearningUnitDefinition`, `CurriculumBundle`, `evaluateUnitUnlock`, `evaluateUnitMastery`

---

## 3. Files added

- `src/content/curriculum/data/production/literacy-path.orthographic-foundations.json`
- `src/lib/curriculum/orthographicFoundationsBundle.ts`
- `src/content/curriculum/validation/validateOrthographicFoundationsModule.ts`
- `docs/orthographic-foundations-module-report.md`

Headed-walk artifacts (not product source): `.tmp-m2-walk/`

---

## 4. Files changed

- `src/lib/curriculum/resolveLearn.ts` (`ORTHOGRAPHIC_FOUNDATIONS_SLUG` on `LEARN_MODULE_SLUGS` only)
- `src/content/curriculum/validation/validateCurriculum.ts`
- `src/content/curriculum/validation/index.ts`
- `src/content/curriculum/index.ts`
- `scripts/validate-curriculum.ts`
- `scripts/validate-unit-mastery.ts`
- `docs/master-curriculum-roadmap.md` (post-wave Module 2 details only)

Waves 1–22 JSON and Module 1 JSON were not edited. `LessonPlayer` was not forked.

---

## 5. Module identity

| Field | Value |
| --- | --- |
| Module | `module.orthographic_foundations` |
| Path | `path.literacy.orthographic_foundations` |
| Bundle meta | `hurufi.production.literacy.orthographic_foundations` |
| URL | `orthographic-foundations` |
| Title | الْحُرُوفُ وَالْعَلَامَات |

---

## 6. Entry gate

Module 2 Unit 1 prerequisite is exactly `unit.literacy.reading_foundations.sentence_transfer`.

No `module1.complete`, `module2.complete`, or `waves.complete`.

---

## 7. Unit count

Exactly nine units, in order:

1. `unit.literacy.orthographic_foundations.haa` — `haa` — نَقْرَأُ ه
2. `unit.literacy.orthographic_foundations.thal_zay` — `thal-zay` — ذ وَ ز
3. `unit.literacy.orthographic_foundations.kha_tha` — `kha-tha` — خ وَ ث
4. `unit.literacy.orthographic_foundations.sad_dad` — `sad-dad` — ص وَ ض
5. `unit.literacy.orthographic_foundations.ghain` — `ghain` — نَقْرَأُ غ
6. `unit.literacy.orthographic_foundations.tah_zah` — `tah-zah` — ط وَ ظ
7. `unit.literacy.orthographic_foundations.shadda` — `shadda` — نَقْرَأُ ّ
8. `unit.literacy.orthographic_foundations.hamza` — `hamza` — نَقْرَأُ أ
9. `unit.literacy.orthographic_foundations.taa_maqsura` — `taa-maqsura` — ة وَ ى

---

## 8. Canonical letter ids

| Glyph | Canonical id |
| --- | --- |
| ه | `letter.haa` |
| ذ | `letter.thal` |
| ز | `letter.zay` |
| خ | `letter.kha` |
| ث | `letter.tha` |
| ص | `letter.sad` |
| ض | `letter.dad` |
| غ | `letter.ghain` |
| ط | `letter.tah` |
| ظ | `letter.zah` |

ح remains `letter.ha`. Never `letter.dhal`. Frozen Module 1 aliases were not modified.

---

## 9. Letter teaching order

ه → ذ → ز → خ → ث → ص → ض → غ → ط → ظ

ص is taught before ض. غ is taught after ص/ض. ظ is last.

---

## 10. New-letter mastery standard

Each new consonant requires exactly two evidence points:

1. `letter:{legacyId}.sound`
2. `word:{slug}.decoding`

Forms are presentation-only. No `letter:{id}.form.*` gates. No tracing gates.

---

## 11. Unit 1

ه with forms ه / هـ / ـهـ / ـه. Contrast ح / ه. Scored `sound_to_letter` foil includes ح. Required `letter:haa.sound` + `word:nahr.decoding` (نَهْر). Optional SHOW وَجْه. Function words هُوَ / هِيَ / هُنَا / هَذَا / هَذِهِ are not scored.

---

## 12. Unit 2

ذ then ز. Transfer SHOW د → ذ and ر → ز. Non-connecting behavior is SHOW-only (no mastery key). Required `letter:thal.sound` + `word:ladhidh.decoding`, then `letter:zay.sound` + `word:mawz.decoding`. No demonstratives.

---

## 13. Unit 3

خ then ث. Transfer ح → خ and ت → ث. Required `letter:kha.sound` + `word:khubz.decoding`, then `letter:tha.sound` + `word:thalj.decoding` (ثَلْج). Not ثَلَاثَة.

---

## 14. Unit 4

ص first (`letter:sad.sound` + `word:hisan.decoding` حِصَان), then ض (`letter:dad.sound` + `word:bayd.decoding` بَيْض). صَغِير is not used here.

---

## 15. Unit 5

غ after ع SHOW. Required `letter:ghain.sound` + `word:saghir.decoding` (صَغِير). Not غُرْفَة.

---

## 16. Unit 6

ط first (`letter:tah.sound` + `word:matar.decoding` مَطَر), then ظ (`letter:zah.sound` + `word:zahr.decoding` ظَهْر). Not قِطّ.

---

## 17. Alphabet completion

After Unit 6 all 28 base Arabic letters have been taught. This is derived from unit mastery. No `alphabet.complete` key.

---

## 18. Unit 7 shadda

`skill.shadda.basic` is introduced as teaching content. Child-facing: the mark makes the consonant sound pressed/doubled. SHOW ّ and contrast سِن / سِنّ. Required key is only `word:sinn.decoding`. Optional SHOW قِطّ is not required. No `diacritic:shadda.*` namespace.

---

## 19. Sun SHOW decision

After shadda presentation, SHOW الشَّمْس vs known moon الْوَلَدُ. Recycle only. One whole clip `audio.sentence.orthographic_foundations.alshamsu`. No concatenation. No `article:sun_assimilation.*`. No classification table.

---

## 20. Unit 8 hamza

Scope is initial hamza on alif: أ. Contrast ا vs أ. Required `word:ab.decoding`. Optional SHOW أَسَد. Do not write `letter:alif.sound` as new evidence.

---

## 21. Hamza scope / deferred seats

Deferred: إ، ؤ، ئ، ء، آ, medial hamza, final hamza, هَؤُلَاءِ, مَاء, سَمَاء, يَأْكُلُ.

---

## 22. Unit 9 ة

`skill.taa_marbuta.reading`. ة is a final round form; at pause it is read as an -ah sound. No feminine grammar. Contrast ة / ه / ت. No new letter id. No `letter:ta.form.final` mastery. Required `word:kura.decoding` then `word:madrasa.decoding`.

---

## 23. Unit 9 ى

`skill.alif_maqsura.reading`. ى has no dots and reads as long aa. Contrast ى / ي. Required `word:yara.decoding`.

---

## 24. عَلَى SHOW-only decision

SHOW `word.ala` / عَلَى only. `word:ala.decoding` is not required. Module 3 owns the preposition frame.

---

## 25. New module-local words

| Id | Surface | Audio | Image |
| --- | --- | --- | --- |
| `word.thalj` | ثَلْج | `audio.word.thalj` | `image.word.thalj` |
| `word.zahr` | ظَهْر | `audio.word.zahr` | `image.word.zahr` |

They do not exist in frozen Band A. Band A copies keep Band A identity.

---

## 26. Exact 25 required keys

1. `letter:haa.sound`
2. `letter:thal.sound`
3. `letter:zay.sound`
4. `letter:kha.sound`
5. `letter:tha.sound`
6. `letter:sad.sound`
7. `letter:dad.sound`
8. `letter:ghain.sound`
9. `letter:tah.sound`
10. `letter:zah.sound`
11. `word:nahr.decoding`
12. `word:ladhidh.decoding`
13. `word:mawz.decoding`
14. `word:khubz.decoding`
15. `word:thalj.decoding`
16. `word:hisan.decoding`
17. `word:bayd.decoding`
18. `word:saghir.decoding`
19. `word:matar.decoding`
20. `word:zahr.decoding`
21. `word:sinn.decoding`
22. `word:ab.decoding`
23. `word:kura.decoding`
24. `word:madrasa.decoding`
25. `word:yara.decoding`

Optional/SHOW evidence is not required. No `module2.complete`, `orthography.complete`, `alphabet.complete`, `diacritic:shadda.*`, `article:sun_assimilation.*`, or `hamza:initial.*`.

---

## 27. Historical key isolation

- `letter:ha.sound` ≠ `letter:haa.sound`
- `letter:alif.*` does not satisfy hamza
- `letter:ta.form.*` does not satisfy ة
- `letter:ya.*` / `word:fi.decoding` do not satisfy ى
- `letter:sin.sound` does not satisfy shadda
- Module 1’s eight keys do not auto-master Module 2
- Historical Wave keys do not substitute for any new letter sound key

---

## 28. Exercise engine reuse

Scored engines: `presentation`, `sound_to_letter`, `audio_to_word`. No new engine. No missing_haraka for shadda. No tracing as mastery. No orthography quiz engine.

---

## 29. Audio contract

Existing logical word clips are reused. New required logical ids: `audio.word.thalj`, `audio.word.zahr`. Optional SHOW: `audio.sentence.orthographic_foundations.alshamsu`. Scored items use full word clips. No concatenation. TTS remains the development fallback.

---

## 30. Image contract

New required logical images: `image.word.thalj`, `image.word.zahr`. No physical assets were generated. Images are not required for mastery. No emoji as proof of reading.

---

## 31. Writing boundary

Module 2 is reading-only. No tracing mastery, copying, or dictation. Module 4 remains the main Reading + Writing module.

---

## 32. Sentence / function boundary

No new functional-language sentences. هُوَ / هِيَ / هَذَا / هَذِهِ / عَلَى are not taught as language frames. Only SHOW عَلَى for ى and SHOW الشَّمْس for sun assimilation. Module 3 owns functional expansion.

---

## 33. Tanween boundary

ـٍ and ـً are not taught. Module 1 ـٌ is unchanged. No invented contexts to complete tanween.

---

## 34. Module completion contract

Module 2 completion derives from mastery of `unit.literacy.orthographic_foundations.taa_maqsura`. `/learn` shows **أَتْقَنْتَ** for Module 2 when that final unit is mastered. No `module2.complete`.

---

## 35. Future Module 3 gate

Module 3 is not implemented. The preserved future prerequisite is `unit.literacy.orthographic_foundations.taa_maqsura`.

---

## 36. Validator coverage

`validateOrthographicFoundationsModule.ts` is wired on meta id `hurufi.production.literacy.orthographic_foundations`. It enforces: no Wave 23; Module 1 untouched by this bundle; exact module/path/meta/slug; nine units in order; first prerequisite; unit chain; remaining letters in approved order; `letter.thal` never `letter.dhal`; sound + decode standard; no scored word before its letters; local `word.thalj` / `word.zahr`; no shadda before Unit 7; shadda key `word:sinn.decoding`; no shadda namespace; initial hamza only; no إ / ؤ / ئ / ء / آ; ة and ى only in Unit 9 mastery; عَلَى SHOW-only; no scored function frames; sun SHOW-only; no article assimilation key; no ـٍ / ـً; no writing mastery; exact 25 keys; no historical collisions; no `module2.complete`; no Module 3. Frozen Wave / Module 1 validators stay intact.

---

## 37. Unit-mastery coverage

`scripts/validate-unit-mastery.ts` proves: Module 2 locked before Module 1 final; Unit 1 opens after Module 1 final; Units 2–9 chain; Waves + Module 1 historical keys do not master Module 2; `letter:ha.sound` does not satisfy `letter:haa.sound`; each consonant unit requires its exact sound + word keys; Unit 7 requires `word:sinn.decoding` and old `letter:sin.sound` does not satisfy it; Unit 8 requires `word:ab.decoding` and old alif evidence does not satisfy it; Unit 9 requires كُرَة / مَدْرَسَة / يَرَى and old ta/yaa evidence does not satisfy it; `word:ala.decoding` is not required; final Unit 9 mastery is the Module 2 handoff; no `module2.complete`; no Wave 23; no Module 3 slug/path.

---

## 38. IndexedDB compatibility

Store name remains `hurufi-progress-v1`. Zero migration. After the headed walk the only new **required** curriculum evidence is the 25 keys above. Historical keys including `letter:ha.sound`, Module 1’s eight keys, and `word:yalab.review` remain. Presentation intro keys have `attempts = 0`. No `module2.complete`, Wave 23, Module 3, writing, ـٍ/ـً, or sun-assimilation keys.

---

## 39. /learn behavior

Module 2 appears as a second module block after Module 1, same design. Before Module 1 completion, Module 2 Unit 1 is locked. After Module 1 final, Unit 1 opens. No `/learn` redesign.

---

## 40. Headed Chrome verification

Headed Chromium against the running app (`.tmp-m2-walk/walk.mjs`): **passed**.

| # | Check | Result |
| --- | --- | --- |
| 1 | Waves still 1–22 only | Pass |
| 2 | no Wave 23 | Pass |
| 3 | Module 1 remains functional (`أَتْقَنْتَ` after Module 1 seed) | Pass |
| 4 | Module 2 visible | Pass |
| 5 | Module 2 locked before Module 1 final | Pass |
| 6 | Unit 1 opens after Module 1 final | Pass |
| 7 | ه vs ح | Pass |
| 8 | نَهْر score persists | Pass |
| 9 | ذ / ز sound gates | Pass |
| 10 | لَذِيذ / مَوْز decode | Pass |
| 11 | خ / ث sound gates | Pass |
| 12 | خُبْز / ثَلْج decode | Pass |
| 13 | ص / ض sound gates | Pass |
| 14 | حِصَان / بَيْض decode | Pass |
| 15 | غ sound + صَغِير | Pass |
| 16 | ط / ظ sound gates | Pass |
| 17 | مَطَر / ظَهْر decode | Pass |
| 18 | after Unit 6 no `alphabet.complete` | Pass |
| 19 | shadda presentation | Pass |
| 20 | سِنّ scores correctly | Pass |
| 21 | الشَّمْس is SHOW-only | Pass |
| 22 | no sun-assimilation key | Pass |
| 23 | initial أ presentation | Pass |
| 24 | أَب scores correctly | Pass |
| 25 | no full hamza-seat leakage | Pass |
| 26 | ة contrast | Pass |
| 27 | كُرَة score | Pass |
| 28 | مَدْرَسَة score | Pass |
| 29 | ى vs ي contrast | Pass |
| 30 | يَرَى score | Pass |
| 31 | عَلَى SHOW-only | Pass |
| 32 | no `word:ala.decoding` required | Pass |
| 33 | Unit 9 completion | Pass |
| 34 | Module 2 shows أَتْقَنْتَ | Pass |
| 35 | no Module 3 | Pass |
| 36 | no historical key corruption | Pass |
| 37 | presentations attempts = 0 | Pass |

---

## 41. Roadmap refinement

`docs/master-curriculum-roadmap.md` post-wave Module 2 details now match the approved implementation:

- teach ص then ض, then غ
- first ة word كُرَة then مَدْرَسَة
- ى scores يَرَى; SHOW عَلَى
- ط intro مَطَر not قِطّ
- shadda before قِطّ
- sun assimilation SHOW-only after shadda
- ظ last
- module-local ثَلْج and ظَهْر
- ـٍ / ـً remain deferred

Waves 1–22 and the frozen Module 1 contract were not rewritten.

---

## 42. React → Kotlin portability

Bundle JSON, canonical ids, live keys, and mastery rules stay React-free. Module routing is a thin slug resolver beside waves. `LessonPlayer` was not forked. Progress remains `hurufi-progress-v1` item keys.

---

## 43. npm checks

- `npm run typecheck` — PASS
- `npm run validate:curriculum` — PASS (26 bundles, including orthographic foundations)
- `npm run validate:unit-mastery` — PASS
- `npm run build` — PASS
- `npm run check` — PASS

---

## 44. Remaining non-blocking limitations

- New audio/image ids are logical only; TTS / placeholder visuals remain until production files exist.
- Letter forms are SHOW as one glyph string (`ه  هـ  ـهـ  ـه`) because the existing presentation engine has no four-slot layout.
- ة vs ه vs ت is two pairwise contrast beats, not a three-pane quiz.
- Unit 1 lists foil `word.walad` on `wordIds` so intra-bundle premature-content checks pass; it is not a required live key.
- Headed walk seeded Module 1 as mastered rather than replaying Module 1 end to end.

MODULE 2 IMPLEMENTED — READY FOR MODULE 3 — NO WAVE 23
