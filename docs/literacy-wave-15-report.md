# Literacy Wave 15 — implementation report

Fifteenth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–14 remain frozen educational v1. Band A v1 is unchanged. **Wave 16 is not implemented.**

This is **CONTENT + EXISTING KASRA + SUKUN + WORD ENGINES**. Wave 15 does **not** introduce a new phonics rule. It transfers already-taught **kasra**, **sukun**, and **CVC blending** into the first **kasra-onset closed chunk** **جِسْ**, then decodes **جِسْم**.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-15.json`  
Meta id: `hurufi.production.literacy.wave15`  
Path: `path.literacy.wave15`  
Route slug: `wave-15`

Progression (live, existing unseen-presentation scheduler):

جَ → ج + ِ → جِ → SHOW جِ + سْ → جِسْ → scored جِ → scored جِسْ → جِسْ + م → جِسْم → audio decode جِسْم

Exactly **two** units. No new consonant. No new short-vowel or sukun rule. No damma, madd-yaa / madd-waw, hamza, shadda, tanween, ة, ى, diphthong, sentence, or ال.

---

## Why this is kasra+sukun transfer, not new phonics

Wave 13 taught kasra productively on **كِ**. Wave 14 transferred it onto **عِ**. Wave 4 taught the sukun **mark** and fatha-onset closed blending **رَمْ**. Later waves reused fatha-closed structure inside words without a new `.closed` key.

Wave 15 reuses `skill.short_vowel.kasra`, `skill.sukun.basic`, and `skill.syllable_blending.cvc`. The child is not retaught ْ as a mark class.

---

## Why جِسْم wins

Canonical: `word.jism`  
Legacy: `body-40`  
Band: A / A3  
teachingForm: **جِسْم**  
Letters: ج س م (all already taught)  
Phonics: **kasra + sukun only**  
Prototype: 🧍

It is the smallest honest Band A word that needs **kasra-onset closed blending** without a new consonant, madd-yaa, shadda, or hamza. **بِنْت** is a stronger picture but equal phonics cost and likely extra final-ت form work. **فِيل / حَلِيب** need madd-yaa. **سِنّ** needs shadda.

---

## Why جِ is a new kasra carrier

Historical `letter:kaf.kasra` and `letter:ain.kasra` must not substitute. Historical `letter:jim.fatha` and `letter:jim.madd_alif` must not substitute. The new live key is **`letter:jim.kasra`**. An unscored reminder of familiar **جَ** is first so جِ / جَ is an honest contrast.

---

## Why جِسْ needs its own scored closed chunk

Historical **`letter:ram.closed`** is a **fatha-onset** chunk (رَ + مْ → رَمْ). The child knows the mark ْ and fatha-closed blending, but has never scored **kasra + coda sukun**.

Pedagogy:

1. جِ + سْ → جِسْ (non-lexical CVC)  
2. جِسْ + م → جِسْم (word)

Pause/citation **جِسْم** is CVCC `/jism/`. Child UI never says “CVCC”.

Exact engine key, from the existing generic helper (no special-case):

`getClosedChunkLiveKey({ syllableId: "syllable.jis.closed" })` → **`letter:jis.closed`**

Do not use `syllable.jim.closed` / `letter:jim.closed`. CV **جِ** and CVC **جِسْ** stay distinct.

---

## Why historical `letter:ram.closed` cannot substitute

Closed evidence is **syllable-id specific**, not “any CVC.” `syllable.ram.closed` writes `letter:ram.closed`. `syllable.jis.closed` writes `letter:jis.closed`. They do not share a key.

---

## Why the sukun mark is NOT retaught

`diacritic:mim.sukun.discrimination` remains historical. There is no `missing_haraka` and no isolated ْ lesson. The closed SHOW is **جِ + سْ → جِسْ**, a blend, not a mark-class drill. `skill.sukun.basic` may appear on unit `skillIds` so the Band A word validates; it is **not** in `requiredSkillIds`.

---

## Why no mark-only kasra gate

Same as Waves 13–14. Direct syllable evidence **جِ vs جَ** (with historical **عِ** as foil) writes `letter:jim.kasra`. Do not require `diacritic:jim.kasra.discrimination`.

---

## Joining of جِسْم

Connection determines shape:

- ج dual-joining → **initial جـ** (historical Wave 11; not re-gated)
- س inbound from ج, outbound to م → **medial ـسـ** (historical Wave 9; not re-gated)
- م inbound from س, nothing after → **final ـم** (no dedicated live key; decoded historically in قَلَم / قَدَم / فَم)

Wave 15 annotates those forms on the word/unit for `PREMATURE_WORD`. It does **not** quiz them. Compose operand **م** may look isolated; the **result** `جِسْم` shapes final ـم through normal joining.

---

## Why no new form quiz

FORM PREP scores a positional form only when it is a genuine first. جـ and ـسـ already have dedicated keys. Final م has historical decoded evidence. Inventing `letter:mim.form.final` would over-gate.

---

## Why two units are sufficient

1. **جِ + جِسْ** — transfer kasra onto ج, and score the new kasra-onset closed chunk  
2. **جِسْم** — compose then decode the word  

A third unit would isolate a job that belongs before the word, like Wave 14’s two-firsts unit.

---

## Why picture is reinforcement only

First scored word evidence is `audio_to_word` against already-decoded **جَمَل** and **شَمْس**. 🧍 may follow. Picture does not unlock the unit.

---

## Units

| Unit | ID | Child title | Required live keys |
| --- | --- | --- | --- |
| 1 | `unit.literacy.wave15.jim_kasra_jis_closed` | جِ | `letter:jim.kasra`, `letter:jis.closed` |
| 2 | `unit.literacy.wave15.jism` | جِسْم | `word:jism.decoding` |

Prerequisite: `unit.literacy.wave14.inab`. Sequential unlock. Finish CTA still `/learn`. No `wave15Unlocked` flag.

Must **not** gate: presentations, picture, review, historical kasra/fatha/madd, `letter:ram.closed`, mark-discrimination, form keys.

---

## Generic engine proof

No `if jim` / `if jis` / `if wave15` was added to engine code.

```ts
getSyllableLiveKey({ letterLegacyId: "jim", vowelSkillId: "skill.short_vowel.kasra" })
// → letter:jim.kasra

getClosedChunkLiveKey({ syllableId: "syllable.jis.closed" })
// → letter:jis.closed

getWordLiveKey({ wordId: "word.jism" })
// → word:jism.decoding
```

`pattern: "CVC"` still routes through `getClosedChunkLiveKey` before any CV kasra fallback.

---

## Routing

`wave-1` → … → `wave-14` → `wave-15`

Wave 15 locked until Wave 14 Unit 2. After Wave 14: Unit 1 open, Unit 2 locked.

---

## Known prototype limitations

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`🧍` for جِسْم).
- Optional pictures may be skipped after required mastery (accepted reinforcement-skip, same as Waves 10–14).
- Unit 1 has two required scored items, so `LessonPlayer` rotates between them. Existing `unit.mastery` treats `minAttempts` as an **aggregate** across required refs, not “repeat each activity three times.” The headed walk therefore wrote `letter:jim.kasra` 2/2 and `letter:jis.closed` 1/1, then finished Unit 1 once both keys had a correct attempt and the aggregate reached 3. The unit-mastery script still proves that missing either key prevents mastery. Do not change LessonPlayer for this.
- Historical `letter:jim.fatha` is not a required live key in Waves 1–14 (جَ is shown and used as a foil, but Wave 2 scores **بَ**, Wave 11 scores **جَا**). After the walk it stayed **absent**. Wave 15 did not write it.

---

## Headed browser verification

Seeded Waves 1–14 in `hurufi-progress-v1`, then walked Wave 15 in headed Chrome against the running app at `http://localhost:8080`. Clicked **جِ**, **جِسْ**, and **جِسْم** explicitly.

| # | Check | Result |
| --- | --- | --- |
| 1 | `/learn` shows Wave 15 with exactly 2 units | Pass |
| 2 | No Wave 16 | Pass |
| 3 | Wave 15 locked before Wave 14 final mastery | Pass |
| 4 | After Wave 14: Unit 1 unlocked, Unit 2 locked | Pass |
| 5 | Unit 1 first SHOW: جَ | Pass |
| 6 | Unit 1 second SHOW: ج + ِ → جِ | Pass |
| 7 | Kasra visibly under ج; no damma in exercise glyphs | Pass |
| 8 | Unit 1 third SHOW: جِ + سْ → جِسْ | Pass |
| 9 | No separate sukun-mark teaching screen | Pass |
| 10 | First scored CV: hear جِ | Pass |
| 11 | Choices جِ / جَ / عِ | Pass |
| 12 | Explicitly clicked جِ | Pass |
| 13 | New live key `letter:jim.kasra` | Pass |
| 14 | Scored CVC: hear جِسْ | Pass |
| 15 | Choices جِسْ / جِ / رَمْ | Pass |
| 16 | Explicitly clicked جِسْ | Pass |
| 17 | New live key `letter:jis.closed` | Pass |
| 18 | Historical `letter:ram.closed` unchanged (seeded 2026-03-01) | Pass |
| 19 | No `diacritic:jim.kasra.discrimination` | Pass |
| 20 | Unscored compose جِسْ + م → جِسْم | Pass |
| 21 | Joined result جِسْم (initial جـ / medial ـسـ / final ـم) | Pass |
| 22 | No new form quiz | Pass |
| 23 | First scored word evidence is `audio_to_word` | Pass |
| 24 | Target جِسْم | Pass |
| 25 | Foils already-decoded print words جَمَل / شَمْس | Pass |
| 26 | Explicitly clicked جِسْم | Pass |
| 27 | Picture not first evidence | Pass |
| 28 | Optional 🧍 after decode | Accepted skip after mastery (same as Waves 10–14) |
| 29 | No damma | Pass |
| 30 | No madd-yaa / madd-waw | Pass |
| 31 | No hamza | Pass |
| 32 | No shadda / tanween | Pass |
| 33 | No mark-only kasra or sukun lesson | Pass |
| 34 | No review gate | Pass |
| 35 | Finish card | Pass |
| 36 | CTA → `/learn` | Pass |
| 37 | Wave 15 Unit 2 mastered on `/learn` | Pass |
| 38 | No Wave 16 after finish | Pass |
| 39–45 | IndexedDB new keys, presentations attempts 0, historical isolation, no extra `.closed` | Pass |
| — | Wave 14 spot-check: عِ / عِنَب remain; no جِسْم leak | Pass |

IndexedDB after the walk:

- **New:** `letter:jim.kasra` (2/2), `letter:jis.closed` (1/1), `word:jism.decoding` (3/3)
- **Presentations attempts 0:** jim fatha SHOW, jim kasra SHOW, jis closed SHOW, jism compose SHOW
- **Historical unchanged:** `letter:kaf.kasra`, `letter:ain.kasra`, `letter:jim.madd_alif`, `letter:ram.closed`, `letter:jim.form.initial`, `letter:sin.form.medial` (seeded 2026-03-01)
- **`letter:jim.fatha`:** still absent (never a required Waves 1–14 live key)
- **No** `diacritic:jim.kasra.discrimination`
- **No** `letter:mim.form.final`
- Historical `diacritic:mim.sukun.discrimination` remains seeded Wave 4 evidence; Wave 15 did not re-gate it
- `.closed` keys after the walk: `letter:ram.closed` (historical) and **only** new `letter:jis.closed`

`npm run check` **PASS** (typecheck, validate:curriculum including Wave 15, validate:unit-mastery, build).

---

## Wave 16

**Wave 16 is not implemented.** This slice stops after Wave 15 Unit 2.

Recommended later: further kasra-closed transfer with **بِنْت** (new carrier `letter:ba.kasra`, no new `.closed` key), not madd-yaa and not sentences.
