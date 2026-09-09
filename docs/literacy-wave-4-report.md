# Literacy Wave 4 — implementation report

Fourth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–3 remain frozen SHOW → PRACTICE → TEST references. Band A v1 is unchanged. **Wave 5 is not implemented.**

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-4.json`  
Meta id: `hurufi.production.literacy.wave4`  
Path: `path.literacy.wave4`  
Route slug: `wave-4`

---

## Why sukun begins now

Waves 1–3 taught letters م ل ق د و ج ي ر ب ف ح and fatha forms only. The child can already decode:

قَلَم، قَدَم، وَلَد، جَمَل، يَد، قَمَر، جَبَل، فَم، حَجَر، حَمَل

The first new phonics rule after that bank is **السكون**. It is taught as three distinct evidence levels:

| Level | What it proves | Live key |
| --- | --- | --- |
| A. Mark | Discriminate مَ vs مْ | `diacritic:mim.sukun.discrimination` |
| B. Closed chunk | Blend non-lexical رَمْ | `letter:ram.closed` |
| C. Real words | Decode رَمْل then قَلْب | `word:raml.decoding`, `word:qalb.decoding` |

Pictures do not gate. Presentations do not gate. Tracing does not gate. Fatha remains the only required short vowel.

---

## Why it was postponed from Wave 3

The first Wave 3 proposal treated رَمْل and قَلْب as simple closed syllables. In pause/citation they are **CVCC** (`/raml/`, `/qalb/`). Existing renderers also could not score مَ vs مْ without lying about exercise semantics.

Wave 3 therefore taught **ح** on the proven fatha-only pattern and deferred sukun. Wave 4 adds the missing generic adapters, then teaches the mark, then a phonics chunk, then the first real words.

---

## Why رَمْ is phonics practice, not vocabulary

رَمْ is a closed chunk used to practice fatha + sukun before a real word. It has no word record and must not be stored as `letter:ra.fatha`, `diacritic:mim.sukun.discrimination`, or `word:raml.decoding`.

The child-facing UI never says “CVC” or “CVCC”.

---

## Why رَمْل / قَلْب are CVCC in pause

Citation forms are `/raml/` and `/qalb/`: two consonants after the first vowel. Only the practice chunk رَمْ is a simple closed syllable. Do not call the words “simple CVC words.”

| Portable id | Arabic | Band A? | 720 `legacyId` |
| --- | --- | --- | --- |
| `word.raml` | رَمْل | yes (copy of Band A) | `nature-15` |
| `word.qalb` | قَلْب | yes (copy of Band A) | `body-29` |

Validator `validateWave4WordsAgainstBandA` requires both identities to match production Band A. No duplicate curriculum lemmas.

---

## missing_haraka extension

No new React exercise type. The existing missing-haraka path now accepts `skill.sukun.basic` as a generic haraka, and the mark map includes U+0652.

Scored sukun uses `getHarakaLiveKey` so the persisted key is `diacritic:{stem}.sukun.discrimination`. It does not fall through to `.vowel.discrimination` and does not write `letter:mim.fatha`. Fatha/kasra/damma behavior is unchanged. The same path can later host لْ or دْ.

Full-syllable choices (مَ / مْ) and a 2-choice activity remain valid. Wave 1/2 still render their existing three short-vowel choices.

---

## Closed-chunk extension

Ordinary CV `syllable_blending` is not honest for رَ + مْ → رَمْ. Wave 4 keeps the same listen-and-choose renderer and adds:

- `pattern: "CVC"` on the syllable record
- `requiredLetterIds` for the participating letters
- `skill.syllable_blending.cvc` (shared catalog + Wave 4 skill copy)
- presentation `show: "chunk"` with explicit `left` / `right` / `result` glyphs

The scored screen does not assemble an answer. The live key is taken from the CVC syllable id (`syllable.ram.closed` → `letter:ram.closed`) before any CV fatha fallback.

---

## Unit flow

| # | Unit id | Child title | Teaches | Required evidence |
| --- | --- | --- | --- | --- |
| 1 | `unit.literacy.wave4.sukun` | تَعَلَّمْ السُّكُون | SHOW ْ on م, scored مَ vs مْ | `diacritic:mim.sukun.discrimination` |
| 2 | `unit.literacy.wave4.raml` | نَقْرَأُ مَعًا | SHOW رَ + مْ → رَمْ, scored رَمْ, then رَمْل | `letter:ram.closed`, `word:raml.decoding` |
| 3 | `unit.literacy.wave4.qalb` | اِقْرَأْ كَلِمَاتِي | final ـب, then قَلْب vs قَلَم | `letter:ba.form.final`, `word:qalb.decoding`, compact `word:hajar.review` |

**Unit 1.** Unscored SHOW of sukun on known م, scored مَ vs مْ. Optional لَ vs لْ transfer is omitted: a path exercise must declare a mastery target, and a `skill.sukun.basic` target would make لْ required. Unit 1 stays on م only. No word, no closed chunk, no tracing.

**Unit 2.** Unscored closed-chunk SHOW, then scored listen-and-choose رَمْ, then first رَمْل as `audio_to_word` (printed foils قَلَم / جَبَل). There is no رَمْل SHOW: LessonPlayer drains unseen presentations first. Optional sand picture after decoding only.

**Unit 3.** Production Wave 2 scored isolated + **medial** ب only. Final ـب is not established, so a scored final-ب beat comes first. There is no قَلْب SHOW in this unit for the same scheduler reason. Then scored قَلْب vs قَلَم (foil رَمْل), one compact حَجَر review, optional heart picture after decoding.

Prerequisite: Unit 1 `prereqUnitIds` = `unit.literacy.wave3.hamal` (`WAVE3_FINAL_UNIT_ID`). Later units unlock from the previous Wave 4 unit. Unlock uses the generic resolver. There is no `wave4Unlocked` flag.

---

## Mastery contract

Same engine and thresholds as Wave 3 (`minAttempts: 3`, `minAccuracy: 0.7`, `minStreak: 2`, `minSessions: 1`).

| Unit | Required live keys | Must not gate |
| --- | --- | --- |
| 1 | `diacritic:mim.sukun.discrimination` | presentation |
| 2 | `letter:ram.closed`, `word:raml.decoding` | picture, chunk SHOW |
| 3 | `letter:ba.form.final`, `word:qalb.decoding`, `word:hajar.review` | picture |

Kasra/damma skills exist in the catalog copy but are not required.

---

## Routing

`/learn` lists registered waves (`wave-1` → `wave-2` → `wave-3` → `wave-4`) from `LEARN_WAVE_SLUGS`. Home **ابدأ التعلّم** uses `resolveContinueLearn`. Progress stays in `hurufi-progress-v1`. Finish still returns to `/learn`. No Wave 5 CTA and no `/learn/wave-5/...` route.

---

## Known prototype limits

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`🏜️` for رَمْل, `❤️` for قَلْب).
- The live word adapter still caps printed choices at three, so Unit 2 uses قَلَم / جَبَل as the scored foils.
- Optional لْ transfer is not in this slice; adding it with `skill.sukun.basic` would make it required evidence.
- Child UI does not expose CVCC terminology.

---

## Wave 5

**Wave 5 is not implemented.** This slice stops after Wave 4 Unit 3.
