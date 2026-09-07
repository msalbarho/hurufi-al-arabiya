# Literacy Wave 1 — implementation report

First production teaching slice for حُرُوفِي العَرَبِيَّة. Band A remains vocabulary **scope**. This file is teaching **order**.

Live React routes, progress, audio, the 720-word bank, and `src/content/letters.ts` were not modified.

Source of truth for the path: `src/content/curriculum/data/production/literacy-path.wave-1.json`  
Meta id: `hurufi.production.literacy.wave1`

---

## Selected letters and rationale

Wave 1 uses **7 letters**, not 4–6. Six letters that avoid confusable pairs and sukun/madd/hamza yield only **four** fatha-only Band A words. The task says: if fewer than five useful words are available, adjust the letter wave rather than violate dependencies. The seventh letter (`ي`) is that adjustment: it unlocks high-frequency `يد` so the child finishes by reading five real words.

Teach order (not abjad order):

| Order | Letter | ID | Why it is in Wave 1 |
| --- | --- | --- | --- |
| 1 | م | `letter.mim` | High-frequency, round and visually distinct, starts useful CV syllables (`مَ مِ مُ`) |
| 2 | ل | `letter.lam` | High-frequency, not confusable with م, pairs with م to unlock `قلم` and `جمل` |
| 3 | ق | `letter.qaf` | Unlocks `قلم` (HF spine) then `قدم`. **ف** is postponed (ف / ق spacing) |
| 4 | د | `letter.dal` | Unlocks `قدم`, `ولد`, `يد`. Non-connecting shape contrast. **ذ** is postponed |
| 5 | و | `letter.waw` | Non-connecting, distinct from the connectors already taught; unlocks HF `ولد` |
| 6 | ج | `letter.jim` | Unlocks `جمل`. **ح / خ** are postponed |
| 7 | ي | `letter.ya` | Unlocks HF `يد` (body). Taught last as payoff, not with ى / madd |

Confusable groups **not** co-introduced: ب/ت/ث, ج/ح/خ, د/ذ, ر/ز, س/ش, ص/ض, ط/ظ, ع/غ, ف/ق.

Canonical IDs match existing portable `LetterDefinition` ids. Each record carries `legacyId` (`mim`, `lam`, …) for a later bridge to `letters.ts`. Similar-letter ids that point outside the slice (e.g. ق→ف) are omitted so the bundle does not drag unused letters.

---

## Phonics introduced

Taught:

- Isolated recognition and letter sound for the seven letters (unit 1 does not dump connected forms)
- Medial form matching for ل (`ـلـ`) in unit 3, before decoding قَلَم
- Isolated tracing (م) — references TracingCanvas; canvas itself is unchanged
- **Fatha** first (unit 2), then **kasra** and **damma** as a contrast (unit 5)

Canonical short-vowel skills are global (`skill.short_vowel.fatha` means “can recognize/read fatha”, not “fatha after Wave 1 letters”). Letter and unit dependencies live on units, exercises, and items.

Deferred (not in this skill graph):

- Sukun (so the first words stay CV–CV / CV, not CVC with a silent letter)
- Shadda, tanween, complex hamza, alif maqsura, complex madd, taa marbuta
- Long-vowel madd (`باب` is Band A but **not** in this slice)

`ي` is a consonant here (`يَد`), not a madd letter.

---

## Sequence of units

Hierarchy used: **Path → Unit → Exercise**. Lesson is not instantiated yet; units are the grain. Later a Lesson layer can sit between unit and exercise without renaming these ids.

Path: `path.literacy.wave1`

| # | Unit id | Teaches | Unlocks |
| --- | --- | --- | --- |
| 1 | `unit.literacy.wave1.letters_mim_lam` | م ل — see, hear, trace isolated | — |
| 2 | `unit.literacy.wave1.fatha_cv` | Fatha; CV blend | مَ لَ |
| 3 | `unit.literacy.wave1.qaf_qalam` | ق + قَ | **قَلَم** |
| 4 | `unit.literacy.wave1.dal_qadam` | د + دَ; decode contrast ل/د | **قَدَم** |
| 5 | `unit.literacy.wave1.waw_walad_vowels` | و + وَ; kasra vs damma | **وَلَد**; مِ مُ قِ |
| 6 | `unit.literacy.wave1.jim_ya_decode` | ج ي + جَ يَ; review | **جَمَل** **يَد** |

Prerequisites are linear: 1 ← 2 ← 3 ← 4 ← 5 ← 6.

---

## Selected syllables

Ten **explicit** CV items (not a generated grid):

`مَ مِ مُ` `لَ` `قَ قِ` `دَ` `وَ` `جَ` `يَ`

IDs: `syllable.mim.fatha`, `syllable.mim.kasra`, `syllable.mim.damma`, `syllable.lam.fatha`, `syllable.qaf.fatha`, `syllable.qaf.kasra`, `syllable.dal.fatha`, `syllable.waw.fatha`, `syllable.jim.fatha`, `syllable.ya.fatha`.

---

## Selected Band A words

Copied from `band-a.json` with the same canonical ids. No new vocabulary.

| Canonical id | Teaching form | Letters | Phonics | Available in |
| --- | --- | --- | --- | --- |
| `word.qalam` | قَلَم | ق ل م | fatha | Unit 3 |
| `word.qadam` | قَدَم | ق د م | fatha | Unit 4 |
| `word.walad` | وَلَد | و ل د | fatha | Unit 5 |
| `word.jamal` | جَمَل | ج م ل | fatha | Unit 6 |
| `word.yad` | يَد | ي د | fatha | Unit 6 |

`ولد` is Band A **A2** packing, not “later teaching.” It is decodable as soon as و ل د + fatha exist.

### Can the child read something meaningful?

Yes. After Wave 1 the child can decode:

- **قلم** (pencil / pen)
- **قدم** (foot)
- **ولد** (boy)
- **جمل** (camel)
- **يد** (hand)

That is a small but real reading set, not isolated symbols.

---

## Exercise types

Nine reusable `ExerciseDefinition` records. Compact loop, not every catalog type.

| Id | Type | Objective |
| --- | --- | --- |
| `exercise.wave1.sound_to_letter.mim` | `sound_to_letter` | Hear /m/ → choose م |
| `exercise.wave1.letter_forms.lam` | `letter_recognition` | Match medial ـلـ to ل (before قَلَم) |
| `exercise.wave1.tracing.mim` | `tracing` | Trace isolated م |
| `exercise.wave1.syllable_blending.mim_fatha` | `syllable_blending` | Read مَ |
| `exercise.wave1.audio_syllable.qaf_fatha` | `syllable_blending` | Hear قَ → choose print |
| `exercise.wave1.audio_to_word.qalam` | `audio_to_word` | Decode قَلَم vs قَدَم |
| `exercise.wave1.missing_haraka.mim` | `missing_haraka` | Fatha vs kasra vs damma on م |
| `exercise.wave1.picture_to_word.walad` | `picture_to_word` | Image → وَلَد |
| `exercise.wave1.word_to_picture.yad` | `word_to_picture` | يَد → image |

Distractors use only letters/words already available at that unit. Tracing `config.activity` is a portable hint for the existing TracingCanvas; the component was not rewritten.

Not in Wave 1 (on purpose): similar-letter discrimination (no confusable pair in the slice), dictation, sentence/story types.

---

## Mastery rules

Live `src/lib/rules/mastery.ts` and `src/lib/progress/` were **not** rewritten.

Each unit carries portable `mastery`:

| Field | Wave 1 value | Later map to prototype |
| --- | --- | --- |
| `minAttempts` | 3 (4 on the final unit) | `ItemProgress.attempts` |
| `minAccuracy` | 0.7 | `UNLOCK_THRESHOLD` |
| `minStreak` | 2 | `applyAttempt` streak ≥ 2 → mastery 2 |
| `minSessions` | 1 (2 on the final unit) | distinct days; mastery 3 still needs 3 sessions later |
| `requiredSkillIds` | unit skills | skill graph, not stars |
| `reviewAfterDays` | 2 | future scheduler; not implemented |

Stars (`starsFor`) remain a display of mastery 0–3, not the pass rule.

---

## Prerequisites

**Skills (canonical, shared catalog):** `skill.letter_recognition.core` and `skill.letter_sounds.core` have no skill prereqs; positional forms and isolated handwriting depend on recognition; fatha has no skill prereqs; kasra and damma depend on fatha; CV blending depends on fatha; word decoding depends on CV blending. Wave-specific letters are **not** skill prerequisites.

**Units:** linear chain above. A Wave 1 unit that uses fatha still requires earlier letter units as `prereqUnitIds`.

**Words:** never listed on a unit before that unit (plus its ancestors) has taught every required letter, every required **positional form** on `requiredLetterForms`, and every required skill that exists in this bundle. Same-unit form introduction counts.

---

## Validation checks

General (any bundle that includes the new optional arrays):

- Duplicate ids (including unit order, path `unitIds`, and mastery target ids with incompatible payloads)
- Missing letter / skill / word / syllable / unit / exercise / asset / prerequisite refs
- Self-prerequisites and duplicate prerequisites
- Cycles in `prereqUnitIds` (`PREREQUISITE_CYCLE`)
- Word or syllable taught before its letters/skills (`PREMATURE_WORD` / `PREMATURE_CONTENT`)
- Word taught before a required positional form is introduced (`PREMATURE_WORD` on forms)
- Impossible joining forms for non-connecting letters (`INVALID_LETTER_FORM`)
- Exercises listed on a unit missing `masteryTargets` (`MISSING_MASTERY_TARGET`)
- Unresolved mastery-target letter / syllable / word / skill refs
- Shared-skill identity vs `shared-skills.json` (`SKILL_IDENTITY`)
- Units with no path; path units that do not exist

Wave 1 integrity (`validateLiteracyWave1.ts`):

- Production meta flags
- Exact 7-letter set with `wave: 1` and `legacyId`
- Exact 5 Band A word ids
- No deferred phonics skills
- No wave-scoped skill ids (`skill.letter_recognition.wave1`, `skill.letter_sounds.wave1`)
- CV-only syllables
- One path `path.literacy.wave1`
- Every exercise has `learningObjectiveAr`

CLI also copies Wave 1 word `lemma` / `teachingForm` / `letterIds` / `requiredSkillIds` against `band-a.json`. Wave 1 may add `requiredLetterForms`; Band A does not yet carry that annotation.

Fixture and Band A omit `syllables` / `units` / `paths`; those arrays are optional so older bundles stay valid.

---

## Deferred concepts

Sukun, CVC closed syllables, madd / `باب`, hamza, ة, ى, tanween, shadda, confusable letter pairs, remaining 21 letters, sentences, stories, a Lesson layer, live UI wiring, real audio files.

---

## Pre-UI Hardening

Architectural pass before any UI integration. Letter set and five unlocked words are unchanged.

### Letter-form audit

Joining analysis of the five teaching forms. Isolated identity is taught for every letter; connected slots are introduced only when a word needs them. Non-connecting **د** and **و** never receive distinct initial/medial joining forms (those slots are invalid).

| Letter | Isolated Needed | Initial Needed | Medial Needed | Final Needed | First Word Requiring Form |
| --- | --- | --- | --- | --- | --- |
| م | Yes (identity; also after non-connecting د) | No | Yes | Yes | Isolated: قَدَم (unit 4). Medial: جَمَل (unit 6). Final: قَلَم (unit 3) |
| ل | Yes (identity / CV لَ only; no Wave 1 word uses isolated ل) | Yes | Yes | Yes | Medial: قَلَم (unit 3). Initial: وَلَد (unit 5). Final: جَمَل (unit 6) |
| ق | Yes (identity / CV قَ) | Yes | No | No | Initial: قَلَم (unit 3) |
| د | Yes (identity / CV دَ). Initial/medial **invalid** | No (invalid as a distinct join) | No (same as final) | Yes | Final: قَدَم (unit 4); also وَلَد, يَد |
| و | Yes (word-initial non-connector). Initial/medial **invalid** | No | No | No | Isolated: وَلَد (unit 5) |
| ج | Yes (identity / CV جَ) | Yes | No | No | Initial: جَمَل (unit 6) |
| ي | Yes (identity / CV يَ) | Yes | No | No | Initial: يَد (unit 6) |

Word form annotations (`requiredLetterForms`):

| Word | Forms |
| --- | --- |
| قَلَم | ق initial, ل medial, م final |
| قَدَم | ق initial, د final, م isolated |
| وَلَد | و isolated, ل initial, د final |
| جَمَل | ج initial, م medial, ل final |
| يَد | ي initial, د final |

Introduction order (same-unit introduction is allowed):

| Unit | Forms introduced |
| --- | --- |
| 1 | م isolated, ل isolated |
| 2 | (re-states isolated م ل for CV) |
| 3 | ق isolated + initial, ل medial, م final — then قَلَم |
| 4 | د isolated + final — then قَدَم |
| 5 | و isolated, ل initial — then وَلَد |
| 6 | ج isolated + initial, ي isolated + initial, م medial, ل final — then جَمَل يَد |

The child is not asked to decode a medial/final form that has never been listed on a unit at or before that point. All four forms are **not** dumped in unit 1.

### Canonical skill semantics

`skill.short_vowel.fatha` means the learner can recognize/read fatha. It does **not** mean “fatha after Wave 1 letters.”

Catalog prereqs:

| Skill | `prereqSkillIds` |
| --- | --- |
| `skill.letter_recognition.core` | (none) |
| `skill.letter_sounds.core` | (none) |
| `skill.letter_forms.positional` | recognition.core |
| `skill.handwriting.isolated` | recognition.core |
| `skill.short_vowel.fatha` | (none) |
| `skill.short_vowel.kasra` | fatha |
| `skill.short_vowel.damma` | fatha |
| `skill.syllable_blending.cv` | fatha |
| `skill.word_decoding.simple` | syllable_blending.cv |

Removed wave-scoped skill ids (`skill.letter_recognition.wave1`, `skill.letter_sounds.wave1`). Did not fork fatha/kasra/damma into wave-specific skill ids.

A Wave 1 unit that uses kasra still requires earlier units (`letter.mim`, `letter.lam`, …) via `prereqUnitIds` / exercise `prereqSkillIds` / item `letterId`s.

### Shared skill source of truth

Canonical copies live in `src/content/curriculum/data/production/shared-skills.json` (`hurufi.production.shared-skills.v1`). This is **not** a curriculum bundle.

Fixture, Band A, and Wave 1 still embed the `SkillDefinition` rows they use (smallest change to the bundle architecture). CLI `validateSkillsAgainstCatalog` compares identity:

Compared: `id`, `domain`, `nameAr`, `nameEn`, `prereqSkillIds` (order-insensitive), `modality` (order-insensitive).

Ignored: `childLabelAr`, `learnerLevelHint`, `masteryHint`, `tags`, `vocabBandHint`.

Skills not in the catalog (e.g. fixture-only `skill.letter_recognition.ba`) are left alone.

### Per-letter mastery strategy

Generic skills stay generic. Item granularity is `ExerciseMasteryTarget`:

- stable `mastery.*` id
- `skillId` (canonical skill)
- optional `letterId` / `letterForm` / `syllableId` / `wordId`

Examples a future learner-state adapter can answer:

- `mastery.letter.mim.sound` — `skill.letter_sounds.core` + `letter.mim`
- `mastery.letter.lam.form.medial` — positional forms + ل + medial
- `mastery.letter.mim.tracing` — isolated handwriting + م
- `mastery.syllable.mim.fatha` / `mastery.syllable.qaf.fatha`
- `mastery.letter.mim.fatha` — fatha contrast on م
- `mastery.word.qalam.decode` / `walad` / `yad`

No 28 copies of each generic skill. Live `src/lib/progress/` and `src/lib/rules/mastery.ts` were not rewritten.

### Exercise targeting strategy

Every Wave 1 exercise listed on a unit has `masteryTargets` (not only `learningObjectiveAr`).

| Exercise | Measures |
| --- | --- |
| `sound_to_letter.mim` | letter sound of م |
| `letter_forms.lam` | medial form of ل |
| `tracing.mim` | isolated tracing of م |
| `syllable_blending.mim_fatha` | CV syllable مَ |
| `audio_syllable.qaf_fatha` | CV syllable قَ |
| `audio_to_word.qalam` | decode قَلَم |
| `missing_haraka.mim` | fatha (vs kasra/damma) on م |
| `picture_to_word.walad` | decode وَلَد |
| `word_to_picture.yad` | decode يَد |

Kasra/damma appear as controlled contrast in unit 5; the five first meaningful words remain fatha-decoding words.

### Earliest valid unit (unchanged)

Form modeling did not force any word later.

| Word | Earliest valid unit |
| --- | --- |
| قَلَم | 3 |
| قَدَم | 4 |
| وَلَد | 5 |
| جَمَل | 6 |
| يَد | 6 |

Unit 3 still introduces قَلَم by blending; the 2-choice audio decode waits until unit 4 so the foil قَدَم is also decodable.

### Model / schema / validation changes

- Types: `LetterFormSlot`, `LetterFormRef`, `ExerciseMasteryTarget`; optional `requiredLetterForms`, syllable `letterForm`, unit `letterForms`, exercise `masteryTargets`; `mastery.*` id namespace.
- Schema: matching `$defs` and optional properties.
- Catalog file + `SKILL_IDENTITY`.
- Validator: form readiness, impossible joins, mastery targets, unresolved target refs, duplicate mastery ids with conflicting payloads.

---

## Unresolved issues

1. **Seven letters vs the 4–6 target.** Pedagogical, documented above. A strict 6-letter cap drops below five meaningful fatha-only Band A words.
2. **Unit 3 introduces `قلم` by blending; the 2-choice decode quiz waits until unit 4** so the foil `قدم` is also decodable. Meaning check for `جمل` is only as a foil / review item, not its own exercise. Not every taught form has its own exercise (e.g. isolated د, initial ي) — form **availability** is on the unit, not a 1:1 drill per slot.
3. **No scheduler.** `reviewAfterDays` is data only.
4. **No audio files.** Logical ids only (`audio.letter.mim.sound`, `audio.syllable.qaf.fatha`, `audio.word.qalam`, …).
5. **Lesson node unused.** Path → Unit → Exercise is enough for this slice.
6. **UI not connected.** Learner-state adapter for `mastery.*` targets is not written. Prototype progress is still `letter:mim`. Next step after review.
7. **Band A words do not yet carry `requiredLetterForms`.** Wave 1 annotates the five teaching forms; identity vs Band A ignores that extra field.
