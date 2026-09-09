# Literacy Wave 6 — implementation report

Sixth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–5 remain frozen SHOW → PRACTICE → TEST references. Band A v1 is unchanged. **Wave 7 is not implemented.**

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-6.json`  
Meta id: `hurufi.production.literacy.wave6`  
Path: `path.literacy.wave6`  
Route slug: `wave-6`

Progression:

ت → تَ → تـ → تَمْر → ـتـ → دَفْتَر

with compact قَمَر review.

---

## Why ت won over س

Wave 5 taught ك and reused Wave 4 sukun inside words. Wave 6 needs **one new consonant** and no new phonics rule.

س looks attractive, but Band A has no clean fatha-only س unlock whose other letters are already taught:

- **سَمَك** is the only high-payoff Band A س word that would become decodable after س alone, and even that path is weaker than ت because Wave 6 already has two strong ت words without a second new letter.
- Other س items need extra letters, kasra/damma, or deferred rules.

ت unlocks two useful Band A words immediately:

- **تَمْر** after isolated ت + fatha + initial تـ
- **دَفْتَر** after medial ـتـ, using already-taught د ف ر plus reused sukun

That is a higher child payoff than opening س and then waiting for a later wave to make a second س word.

---

## Why madd was postponed

مَدّ is a new major phonics rule (letter + length mark / ا). It is not a recycled fatha fact.

Band A words that look nearby all need that new rule, extra letters, or both:

- **بَاب** needs madd + ا
- **لَا** needs madd
- **نَار** needs ن + madd

Wave 6 must not teach ا as a length letter, and must not add `skill.long_vowel.madd`. Madd stays later.

---

## Why تَمْر is the first target

After isolated ت and تَ, **تَمْر** is the first Band A word that becomes decodable with only:

- new letter ت
- already-known fatha
- already-known sukun / CVCC decoding from Wave 4

It is A1, core food vocabulary, letters ت + م + ر, pause/citation form CVCC (`/tamr/`). Child UI never says “CVCC”.

There is **no تَمْر presentation**. LessonPlayer drains presentations first. First evidence is `audio_to_word`.

---

## تَمْر vs قَمَر is a useful contrast, not a strict phonological pair

The first scored decode choices are **تَمْر**, **قَمَر**, and foil **رَمْل**.

This is a useful **visual / decoding contrast**: the child must pick the new printed word, not the already-known moon.

It is **not** a strict phonological pair. The syllable structures differ (تَمْر is pause/citation CVCC; قَمَر is open CVCV). Do not treat the pair as a minimal-pair drill.

---

## Why دَفْتَر is intentionally the first 4-letter decode

**دَفْتَر** is approved and implemented. It is **not** replaced by حَرْف.

This is a controlled increase in **word length only**:

- first 4-letter target in the literacy path
- all phonics are already known (fatha + Wave 4 sukun)
- only new letter in the word is ت
- د ف ر are already taught
- no new sound rule is introduced

The child is stretching working memory across a longer printed word, not learning a new phonics fact.

No runtime or implementation blocker appeared. Fallback to حَرْف was not used.

---

## Why Wave 6 does not add a new phonics rule

Required phonics are only:

- fatha (already taught)
- sukun / already-established CVCC decoding (Wave 4)

Wave 6 does **not** teach kasra, damma, madd, hamza, shadda, tanween, diphthongs, ة, or ى. It does not use بَيْت.

Sukun is reused only inside تَمْر and دَفْتَر. There is no مَ vs مْ lesson, no تَمْ closed-chunk SHOW, and no new `letter:*.closed` or sukun-discrimination live key.

---

## Positional-form requirements

FORM PREP BEFORE DEPENDENT WORD:

- scored **تـ** (`letter:ta.form.initial`) before `word:tamr.decoding`
- scored **ـتـ** (`letter:ta.form.medial`) before `word:daftar.decoding`

Wave 6 does **not** add final ت, an extra isolated-form quiz, or extra د / ف form quizzes.

---

## Sukun recycling

Wave 4 already scored sukun discrimination and the first CVCC words. Wave 6 recycles that rule through word decoding only.

No new sukun-mark activity. No new closed-chunk activity. No `تَمْ` chunk lesson.

---

## Unit flow

| # | Unit id | Child title | Teaches | Required evidence |
| --- | --- | --- | --- | --- |
| 1 | `unit.literacy.wave6.ta` | تَعَلَّمْ حَرْفَ ت | SHOW ت, SHOW تَ, scored ت (foil includes ب), scored تَ | `letter:ta.sound`, `letter:ta.fatha` |
| 2 | `unit.literacy.wave6.tamr` | نَقْرَأُ مَعًا | initial تـ, then تَمْر vs قَمَر | `letter:ta.form.initial`, `word:tamr.decoding` |
| 3 | `unit.literacy.wave6.daftar` | اِقْرَأْ كَلِمَاتِي | medial ـتـ, then دَفْتَر vs قَلَم, compact قَمَر | `letter:ta.form.medial`, `word:daftar.decoding`, `word:qamar.review.wave6` |

Optional tracing ت is in Unit 1 and does **not** gate. Optional date/palm and notebook pictures are reinforcement after decoding.

Prerequisite: Unit 1 `prereqUnitIds` = `unit.literacy.wave5.bahr`. Later units unlock sequentially. No `wave6Unlocked` flag.

---

## Mastery contract

Same engine and thresholds as Waves 4–5 (`minAttempts: 3`, `minAccuracy: 0.7`, `minStreak: 2`, `minSessions: 1`).

| Unit | Required live keys | Must not gate |
| --- | --- | --- |
| 1 | `letter:ta.sound`, `letter:ta.fatha` | presentation, tracing |
| 2 | `letter:ta.form.initial`, `word:tamr.decoding` | picture; old `word:qamar.decoding` |
| 3 | `letter:ta.form.medial`, `word:daftar.decoding`, `word:qamar.review.wave6` | picture; `word:qamar.decoding` and Wave 2 `word:qamar.review` must not substitute |

Kasra/damma/madd/hamza/sukun-discrimination/closed-chunk skills are not required. Presentations stay attempts 0.

The Wave 6 compact review is tagged `review-wave6` so it writes `word:qamar.review.wave6`. Wave 2 keeps `word:qamar.review`.

---

## Canonical word mappings

Copied from Band A v1. Band A itself is not mutated.

| Word | Canonical | Legacy | Band | Letters |
| --- | --- | --- | --- | --- |
| تَمْر | `word.tamr` | `food-54` | A1 | ت م ر |
| دَفْتَر | `word.daftar` | `school-7` | A3 | د ف ت ر |

---

## No new engine capability

Content-only plus normal wave registration:

- `wave6Bundle.ts`
- `validateLiteracyWave6.ts`
- slug `wave-6` on `LEARN_WAVE_SLUGS`
- prototype emoji overrides (🌴 / 📓)

No new exercise type. No LessonPlayer change. No mastery/store change. No missing_haraka or closed-chunk change.

---

## Routing

`/learn` lists `wave-1` → `wave-2` → `wave-3` → `wave-4` → `wave-5` → `wave-6`. Finish still returns to `/learn`. **No Wave 7 CTA and no `/learn/wave-7/...` route.**

---

## Known prototype limitations

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`🌴` for تَمْر, `📓` for دَفْتَر).
- Tracing uses the existing isolated canvas; stroke order is later.
- Child UI does not expose CVCC terminology.
- Optional pictures/tracing may be skipped after required mastery (accepted reinforcement-skip).

---

## Wave 7

**Wave 7 is not implemented.** This slice stops after Wave 6 Unit 3.
