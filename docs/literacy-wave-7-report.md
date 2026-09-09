# Literacy Wave 7 — implementation report

Seventh production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–6 remain frozen educational v1. Band A v1 is unchanged. **Wave 8 is not implemented.**

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-7.json`  
Meta id: `hurufi.production.literacy.wave7`  
Path: `path.literacy.wave7`  
Route slug: `wave-7`

Progression:

س → سَ → سـ → ـك → سَمَك

Exactly **two** units. One new letter. One new word.

---

## Why س was selected

After Wave 6 the child already reads thirteen letters and sixteen words, including the first 4-letter decode. Band A has only three remaining one-letter fatha/sukun unlocks: **سَمَك**, **وَجْه**, and **مَطَر**.

س wins because it is the only remaining consonant that:

- unlocks a strong A1 word immediately (**سَمَك**)
- gates two later A1 words with one more letter (**عَسَل**, **شَمْس**)
- stays fatha-only
- stays content-only

ع and ش unlock nothing alone. ن / ه / خ stay blocked (madd, hamza, or a second missing letter). Madd-alif is the stronger *next phonics rule*, not the stronger Wave 7.

---

## Why Wave 7 has only 2 units

There is one new letter and one new word. A third unit would be empty padding.

The approved compact flow is:

1. teach س and سَ
2. prepare the printed forms used in سَمَك, then decode سَمَك

That is the smallest sensible SHOW → PRACTICE → TEST wave.

---

## Why one new word is sufficient

Consonant expansion is thinning. Forcing a weak second word would copy Waves 5–6 without educational value.

سَمَك is the entire Wave 7 vocabulary payoff. Visible child progress is: a new letter plus one real readable word. That is enough.

---

## Why سَمَك is the target

Canonical: `word.samak`  
Legacy: `food-9`  
Band: A / A1  
teachingForm: سَمَك  
Letters: س م ك  
Phonics: fatha only

It is familiar food vocabulary, visually suitable (prototype 🐟), and strictly decodable after س plus already-taught م and ك. It does not need sukun, madd, kasra, damma, hamza, ة, or ى.

There is **no سَمَك presentation**. LessonPlayer drains presentations first. First evidence is `audio_to_word`. Choices include already-decoded **كَلْب** and **قَلَم**.

---

## Why final ك needs explicit form preparation

Wave 5 scored **initial كـ** for كَلْب. Final **ـك** was never scored.

سَمَك prints سـ + ـمـ + ـك. FORM PREP BEFORE DEPENDENT WORD therefore requires:

- `letter:sin.form.initial` for سـ
- `letter:kaf.form.final` for ـك

Old kaf sound / fatha / initial-form evidence cannot substitute for final-ك.

Do not quiz isolated س, medial س, final س, or extra م forms.

---

## Why no second target word was forced

No other Band A word becomes strictly decodable from س alone under known fatha/sukun. Downstream words need another untaught letter:

- ع + س → عَسَل
- ش + س → شَمْس

Those belong to later waves.

---

## Why no required review key was added

Wave 6 showed that generic review keys can collide with earlier waves.

Wave 7 does **not** add a compact كَلْب review and does **not** create `word:kalb.review.wave7`. كَلْب already participates as a known foil on the سَمَك decode. A separate review gate would be artificial on this compact wave.

Required Unit 2 evidence is exactly:

- `letter:sin.form.initial`
- `letter:kaf.form.final`
- `word:samak.decoding`

---

## Why madd is postponed

مَدّ is a new major phonics rule (بَ vs بَا). The engine does not yet present or score madd. Band A words such as بَاب / لَا / دَجَاج need that rule.

Wave 7 must not teach ا as a length letter and must not add `skill.long_vowel.madd`. Madd stays later, after the س gate is open.

---

## Why ش / ع remain future candidates

س / ش are a visual family, but ش unlocks nothing until س is taught. Wave 7 teaches **only س**. It does not show ش, score ش, or create س/ش discrimination.

Recommended later content-only sequels (not implemented here):

- Wave 8: ش → شَمْس
- Wave 9: ع → عَسَل, or madd-alif if the phonics engine is ready

---

## Unit flow

| # | Unit id | Child title | Teaches | Required evidence |
| --- | --- | --- | --- | --- |
| 1 | `unit.literacy.wave7.sin` | تَعَلَّمْ حَرْفَ س | SHOW س, SHOW سَ, scored س (foils م ت ك), scored سَ | `letter:sin.sound`, `letter:sin.fatha` |
| 2 | `unit.literacy.wave7.samak` | نَقْرَأُ مَعًا | initial سـ, final ـك, then سَمَك vs كَلْب | `letter:sin.form.initial`, `letter:kaf.form.final`, `word:samak.decoding` |

Optional tracing س is in Unit 1 and does **not** gate. Optional fish picture is reinforcement after decoding.

Prerequisite: Unit 1 `prereqUnitIds` = `unit.literacy.wave6.daftar`. Unit 2 unlocks sequentially. No `wave7Unlocked` flag.

---

## Mastery contract

Same engine and thresholds as Waves 4–6 (`minAttempts: 3`, `minAccuracy: 0.7`, `minStreak: 2`, `minSessions: 1`).

| Unit | Required live keys | Must not gate |
| --- | --- | --- |
| 1 | `letter:sin.sound`, `letter:sin.fatha` | presentation, tracing |
| 2 | `letter:sin.form.initial`, `letter:kaf.form.final`, `word:samak.decoding` | picture; old `letter:kaf.form.initial`; any review key |

Kasra/damma/madd/hamza/sukun-discrimination/closed-chunk/ش skills are not required. Presentations stay attempts 0.

---

## Canonical word mapping

Copied from Band A v1. Band A itself is not mutated.

| Word | Canonical | Legacy | Band | Letters |
| --- | --- | --- | --- | --- |
| سَمَك | `word.samak` | `food-9` | A1 | س م ك |

---

## No new engine capability

Content-only plus normal wave registration:

- `wave7Bundle.ts`
- `validateLiteracyWave7.ts`
- slug `wave-7` on `LEARN_WAVE_SLUGS`
- prototype emoji override (🐟)

No new exercise type. No LessonPlayer change. No mastery/store change. No `hurufi-progress-v1` change. No sukun/closed-chunk change.

---

## Routing

`/learn` lists `wave-1` → `wave-2` → `wave-3` → `wave-4` → `wave-5` → `wave-6` → `wave-7`. Finish still returns to `/learn`. **No Wave 8 CTA and no `/learn/wave-8/...` route.**

---

## Sukun

سَمَك contains no sukun. Wave 7 does not recycle sukun, add mark discrimination, or add a closed chunk.

---

## Known prototype limitations

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`🐟` for سَمَك).
- Tracing uses the existing isolated canvas; stroke order is later.
- Optional pictures/tracing may be skipped after required mastery (accepted reinforcement-skip).

---

## Wave 8

**Wave 8 is not implemented.** This slice stops after Wave 7 Unit 2.
