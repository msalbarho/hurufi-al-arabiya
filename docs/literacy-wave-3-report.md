# Literacy Wave 3 — implementation report

Third production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1 and 2 remain frozen SHOW → PRACTICE → TEST references. Band A v1 is unchanged. Sukun is **not** implemented.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-3.json`  
Meta id: `hurufi.production.literacy.wave3`  
Path: `path.literacy.wave3`  
Route slug: `wave-3`

---

## Why ح instead of sukun

The first Wave 3 proposal treated رَمْل and قَلْب as simple closed syllables. In pause/citation they are **CVCC** (`/raml/`, `/qalb/`). The Band A + 720 inventory, using only already-taught letters, has no simpler real first sukun word. Existing renderers also cannot score مَ vs مْ without lying about exercise semantics.

Wave 3 therefore teaches **ح** on the proven fatha-only pattern. Sukun moves to a later wave (not implemented here).

---

## Identity

After Wave 2 the child already knows:

م ل ق د و ج ي ر ب ف

Wave 3 adds **ح** only. It does not teach خ or ن.

| # | Unit id | Child title | Teaches | Scored decode |
| --- | --- | --- | --- | --- |
| 1 | `unit.literacy.wave3.ha` | تَعَلَّمْ حَرْفَ ح | ح, حَ | none |
| 2 | `unit.literacy.wave3.hajar` | نَقْرَأُ مَعًا | initial حـ, medial ـجـ | **حَجَر** |
| 3 | `unit.literacy.wave3.hamal` | اِقْرَأْ كَلِمَاتِي | حَمَل vs جَمَل + compact review | **حَمَل** |

Prerequisite: Unit 1 `prereqUnitIds` = `unit.literacy.wave2.fa_fam` (`WAVE2_FINAL_UNIT_ID`). Unlock uses the generic resolver (`lookupLearnPrereq`). There is no `wave3Unlocked` flag.

---

## Word contracts

| Portable id | Arabic | Band A? | 720 `legacyId` |
| --- | --- | --- | --- |
| `word.hajar` | حَجَر | yes (copy of Band A) | `nature-16` |
| `word.hamal` | حَمَل | **no** | `animals-49` |

`word.hamal` is a curriculum-local literacy lemma, same mechanism as `word.jabal`. It is **not** added to frozen Band A v1. The portable id `word.hamal` is the teaching identity; `legacyId: "animals-49"` is the existing 720 bridge.

Validator `validateWave3WordsAgainstBandA` requires hajar to match Band A identity and requires `word.hamal` to stay out of Band A.

---

## Unit flow

**Unit 1.** Unscored ح, unscored ح + َ → حَ, scored hear/identify ح (foil ج), scored حَ (foil جَ), optional tracing. No word.

**Unit 2.** Scored initial حـ, scored medial ـجـ (جَبَل only proved initial جـ). Final ر is already established in Wave 2, so it is listed on the unit for path-closure without a redundant form quiz. Then scored **حَجَر** vs جَبَل / قَمَر. Picture reinforcement after decoding only.

There is no Unit 2 word presentation. The lesson scheduler drains all unseen presentations first; a حَجَر SHOW in this unit would appear before the form quizzes. Form practice therefore comes first.

**Unit 3.** Unscored SHOW of حَمَل, scored **حَمَل** vs **جَمَل** (and حَجَر), then compact mixed review of قَمَر / جَبَل / قَلَم, then optional picture. No Wave 4 CTA. Finish returns to `/learn`.

---

## Mastery contract

Same engine and thresholds as Wave 2 (`minAttempts: 3`, `minAccuracy: 0.7`, `minStreak: 2`, `minSessions: 1`).

| Unit | Required live keys | Must not gate |
| --- | --- | --- |
| 1 | `letter:ha.sound`, `letter:ha.fatha` | presentations, tracing |
| 2 | `letter:ha.form.initial`, `letter:jim.form.medial`, `word:hajar.decoding` | picture |
| 3 | `word:hamal.decoding`, plus `word:qamar.review`, `word:jabal.review`, `word:qalam.review` | picture, SHOW |

Kasra/damma skills exist in the shared catalog copy but are not required. No sukun skill, activity, or mastery target.

---

## Routing

`/learn` lists registered waves (`wave-1`, `wave-2`, `wave-3`) from `LEARN_WAVE_SLUGS`. Home **ابدأ التعلّم** uses `resolveContinueLearn`. Progress stays in `hurufi-progress-v1`. No Wave 4.

---

## Prototype limitations (not Wave 3 blockers)

**Optional picture reinforcement.** Activities tagged `reinforcement` may be skipped once required skills are met. Prototype emoji: حَجَر 🪨, حَمَل 🐑. No final production audio/images.

**Optional tracing.** Unit 1 tracing does not gate unlock and may be skipped after in-lesson mastery.

**Step counter during required looping.** Same Wave 2 UX polish: the lesson index can jump backward while unfinished required items repeat.

**Wave 4 is not implemented.** Sukun, خ, and ن remain postponed.
