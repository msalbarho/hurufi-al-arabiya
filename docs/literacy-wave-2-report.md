# Literacy Wave 2 — implementation report

Second production teaching slice for حُرُوفِي العَرَبِيَّة. Wave 1 remains the frozen SHOW → PRACTICE → TEST reference. Band A v1 is unchanged.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-2.json`  
Meta id: `hurufi.production.literacy.wave2`  
Path: `path.literacy.wave2`  
Route slug: `wave-2`

---

## Identity

Wave 2 is a fatha-only decoding expansion. New letters, in order: **ر ب ف**. After Wave 2 the taught set is:

م ل ق د و ج ي ر ب ف

Four units (not six). No Wave 3. No Unit 7 inside Wave 1.

| # | Unit id | Child title | Teaches | Scored decode |
| --- | --- | --- | --- | --- |
| 1 | `unit.literacy.wave2.ra_qamar` | تَعَلَّمْ حَرْفَ ر | ر, رَ, final ـر | **قَمَر** |
| 2 | `unit.literacy.wave2.ba` | تَعَلَّمْ حَرْفَ ب | ب, بَ, medial ـبـ | none |
| 3 | `unit.literacy.wave2.jabal` | نَقْرَأُ مَعًا | SHOW جَبَل then decode | **جَبَل** |
| 4 | `unit.literacy.wave2.fa_fam` | تَعَلَّمْ حَرْفَ ف | ف, فَ, initial فـ | **فَم** + mixed review |

Prerequisite: Unit 1 `prereqUnitIds` = `unit.literacy.wave1.jim_ya_decode`. Unlock uses the generic resolver (`lookupLearnPrereq`). There is no `wave2Unlocked` flag.

---

## Word contracts

| Portable id | Arabic | Band A? | 720 `legacyId` |
| --- | --- | --- | --- |
| `word.qamar` | قَمَر | yes (copy of Band A) | `sky-2` |
| `word.fam` | فَم | yes (copy of Band A) | `body-7` |
| `word.jabal` | جَبَل | **no** | `nature-11` |

`word.jabal` is a curriculum-local literacy lemma. It is **not** added to frozen Band A v1. It is **not** a second 720-catalog row. The portable id `word.jabal` is the teaching identity; `legacyId: "nature-11"` is the existing 720 bridge, same mechanism as Wave 1 words (`word.qalam` → `school-8`, etc.).

Validator `validateWave2WordsAgainstBandA` requires qamar/fam to match Band A identity and requires `word.jabal` to stay out of Band A.

---

## Recycling Wave 1

Recycled letters and words are copied into the Wave 2 bundle so generic path-closure validation can see them. They keep `wave: 1`. They appear as foils, CV review, and mixed reading — not as five extra quizzes.

Readable print of the Wave 1 bank by the end of Wave 2:

- قَلَم / قَدَم — Unit 1 قَمَر foils; Unit 4 review
- جَمَل — Unit 3 جَبَل foil; Unit 4 review
- يَد — Unit 4 فَم foil
- وَلَد — Unit 4 review target

---

## Routing

`/learn` lists every registered wave (`wave-1`, `wave-2`) from `LEARN_WAVE_SLUGS`. Home **ابدأ التعلّم** uses `resolveContinueLearn`: first unlocked non-mastered unit across waves. Progress stays in `hurufi-progress-v1`. No second “current wave” store.

---

## Unit 2 → Unit 3 word order

Unit 2 teaches and practices **ب / بَ / ـبـ** only. It must not show **جَبَل**.

Unit 3 starts with an unscored `presentation` of **جَبَل** (`exercise.wave2.presentation.jabal`, `success: continue`, no `masteryTargets`), then optional بَ recycle, then scored **جَبَل** vs **جَمَل**. SHOW uses the existing presentation / `markSeen` contract and does not count toward `word:jabal.decoding`.

---

## Prototype limitations (not Wave 2 blockers)

**Optional picture reinforcement.** Activities tagged `reinforcement` (Unit 1 🌙 قَمَر, Unit 3 جَبَل picture, Unit 4 👄 فَم) are not required evidence. In a mastery-first sitting the in-lesson scheduler may celebrate once required skills are met and skip those screens. Children will not necessarily see them. Do not treat a missing picture as a decoding failure.

**Step counter during required looping.** The lesson index can jump backward (for example `6/8` → `3/8`) while the scheduler repeats unfinished required items. Mastery progression is still correct. Treat the counter as later UX polish, not an educational-content bug.
