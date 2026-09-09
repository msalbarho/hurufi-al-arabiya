# Literacy Wave 8 — implementation report

Eighth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–7 remain frozen educational v1. Band A v1 is unchanged. **Wave 9 is not implemented.**

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-8.json`  
Meta id: `hurufi.production.literacy.wave8`  
Path: `path.literacy.wave8`  
Route slug: `wave-8`

Progression:

ش → شَ → شـ → ـس → شَمْس

Exactly **two** units. One new letter. One new word.

---

## Why ش was selected

After Wave 7 the child reads س and سَمَك. Band A’s remaining compact one-letter unlocks that stay on known fatha/sukun are now **شَمْس** and **عَسَل**.

ش wins for Wave 8 because it:

- is the visual family partner of just-taught س
- unlocks a strong A1 word immediately (**شَمْس**)
- stays on already-taught phonics (fatha + established sukun)
- stays content-only

ع unlocks عَسَل, but it is a new guttural and a later family. Madd-alif is a new phonics rule, not a compact consonant wave.

---

## Why it immediately follows س

س / ش are a visual family. Teaching ش immediately after س lets the child hear and identify ش while س is still fresh, then decode a real word that uses both letters.

This wave uses that family only as a **foil**, not as a lesson. The child must hear ش, choose ش, connect ش to fatha, prepare شـ, prepare ـس, and decode شَمْس. There is no “count the dots” drill and no `skill.sin_shin.discrimination`.

---

## Why شَمْس is the target

Canonical: `word.shams`  
Legacy: `sky-1`  
Band: A / A1  
teachingForm: شَمْس  
Letters: ش م س  
Phonics: fatha + established sukun

It is familiar sky/nature vocabulary, visually suitable (prototype ☀️), and strictly decodable after ش plus already-taught م, س, fatha, and sukun. It does not need kasra, damma, madd, shadda, tanween, hamza, ة, ى, or a diphthong.

There is **no شَمْس presentation**. LessonPlayer drains presentations first. First evidence is `audio_to_word`. Choices include already-decoded **قَمَر** and **سَمَك**.

---

## Why Wave 8 has only 2 units

There is one new letter and one new word. A third unit would be empty padding.

The approved compact flow is:

1. teach ش and شَ
2. prepare the printed forms used in شَمْس, then decode شَمْس

That is the smallest sensible SHOW → PRACTICE → TEST wave.

---

## Why final س needs explicit form preparation

Wave 7 scored **initial سـ** for سَمَك. Final **ـس** was never scored.

شَمْس prints شـ + ـمـ + ـس. FORM PREP BEFORE DEPENDENT WORD therefore requires:

- `letter:shin.form.initial` for شـ
- `letter:sin.form.final` for ـس

Old sin sound / fatha / initial-form evidence cannot substitute for final-س.

Do not quiz isolated ش, medial ش, final ش, unused س forms, or extra م forms.

---

## Why sukun is reused but not retaught

شَمْس contains sukun on م. Wave 4 already taught sukun. This wave reuses that knowledge **inside the word only**.

There is no sukun-discrimination activity, no new closed chunk, no `شَمْ` mastery, and no new `letter:*.closed` live key. After form preparation the child goes directly to `audio_to_word`.

`skill.sukun.basic` appears on Unit 2 `skillIds` so the word’s Band A metadata stays valid. It is **not** in `requiredSkillIds`.

---

## Why no required review was added

Wave 6 showed that generic review keys can collide with earlier waves. Adding `word:qamar.review.wave8` would also need a store facet change.

Wave 8 does **not** add a compact قَمَر review. قَمَر already participates as a known foil on the شَمْس decode. A separate review gate would be artificial on this compact wave.

Required Unit 2 evidence is exactly:

- `letter:shin.form.initial`
- `letter:sin.form.final`
- `word:shams.decoding`

---

## Why no scored س/ش discrimination skill was added

س may appear as a familiar visual-family foil on the ش sound and شَ choices. That is enough.

A scored family drill would change the lesson into “count the dots,” create a new mastery facet, and steal time from decoding a real word. This wave must not create `skill.sin_shin.discrimination` or any live key solely for dot contrast.

---

## Why ع is postponed to Wave 9

ع is the remaining compact Band A consonant that unlocks **عَسَل**. It is a new guttural, not a س-family continuation.

Wave 8 teaches **only ش**. It does not show ع, score ع, or implement Wave 9.

---

## Why madd-alif is postponed to the first rule wave

مَدّ is a new major phonics rule (بَ vs بَا). The engine does not yet present or score madd. Band A words such as بَاب / لَا / دَجَاج need that rule.

Wave 8 must not teach ا as a length letter and must not add `skill.long_vowel.madd`. Madd stays later, after this compact ش gate.

---

## Unit flow

| # | Unit id | Child title | Teaches | Required evidence |
| --- | --- | --- | --- | --- |
| 1 | `unit.literacy.wave8.shin` | تَعَلَّمْ حَرْفَ ش | SHOW ش, SHOW شَ, scored ش (foils س م ت), scored شَ (foils سَ مَ) | `letter:shin.sound`, `letter:shin.fatha` |
| 2 | `unit.literacy.wave8.shams` | نَقْرَأُ مَعًا | initial شـ, final ـس, then شَمْس vs قَمَر / سَمَك | `letter:shin.form.initial`, `letter:sin.form.final`, `word:shams.decoding` |

Optional tracing ش is in Unit 1 and does **not** gate. Optional sun picture is reinforcement after decoding.

Prerequisite: Unit 1 `prereqUnitIds` = `unit.literacy.wave7.samak`. Unit 2 unlocks sequentially. No `wave8Unlocked` flag.

---

## Mastery contract

Same engine and thresholds as Waves 4–7 (`minAttempts: 3`, `minAccuracy: 0.7`, `minStreak: 2`, `minSessions: 1`).

| Unit | Required live keys | Must not gate |
| --- | --- | --- |
| 1 | `letter:shin.sound`, `letter:shin.fatha` | presentation, tracing |
| 2 | `letter:shin.form.initial`, `letter:sin.form.final`, `word:shams.decoding` | picture; old `letter:sin.form.initial`; any review key |

Kasra/damma/madd/hamza/sukun-discrimination/closed-chunk/س-ش-discrimination skills are not required. Presentations stay attempts 0.

---

## Canonical word mapping

Copied from Band A v1. Band A itself is not mutated.

| Word | Canonical | Legacy | Band | Letters |
| --- | --- | --- | --- | --- |
| شَمْس | `word.shams` | `sky-1` | A1 | ش م س |

---

## No new engine capability

Content-only plus normal wave registration:

- `wave8Bundle.ts`
- `validateLiteracyWave8.ts`
- slug `wave-8` on `LEARN_WAVE_SLUGS`
- prototype emoji override (☀️)

No new exercise type. No LessonPlayer change. No mastery/store change. No `hurufi-progress-v1` change. No sukun/closed-chunk change.

---

## Routing

`/learn` lists `wave-1` → `wave-2` → `wave-3` → `wave-4` → `wave-5` → `wave-6` → `wave-7` → `wave-8`. Finish still returns to `/learn`. **No Wave 9 CTA and no `/learn/wave-9/...` route.**

---

## Sukun

شَمْس contains sukun. Wave 8 reuses Wave 4 knowledge naturally and does not add mark discrimination or a closed chunk.

---

## Known prototype limitations

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`☀️` for شَمْس).
- Tracing uses the existing isolated canvas; stroke order is later.
- Optional pictures/tracing may be skipped after required mastery (accepted reinforcement-skip).

---

## Wave 9

**Wave 9 is not implemented.** This slice stops after Wave 8 Unit 2.
