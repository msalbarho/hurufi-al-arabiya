# Literacy Wave 16 — implementation report

Sixteenth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–15 remain frozen educational v1. Band A v1 is unchanged. **Wave 17 is not implemented.**

This is **CONTENT + EXISTING KASRA + CVC + FORM + WORD ENGINES**. Wave 16 does **not** introduce a new phonics rule. It transfers the already-established **kasra-onset CVC class** onto a new carrier **بِ**, prepares the genuine first **final ـت**, then decodes **بِنْت**.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-16.json`  
Meta id: `hurufi.production.literacy.wave16`  
Path: `path.literacy.wave16`  
Route slug: `wave-16`

Progression (live, existing unseen-presentation scheduler):

بَ → ب + ِ → بِ → SHOW ـت → scored بِ → scored ـت → بِ + نْ → بِنْ → بِنْ + ت → بِنْت → audio decode بِنْت

Exactly **two** units. No new consonant. No new short-vowel or sukun rule. No scored `letter:bin.closed`. No damma, madd-yaa / madd-waw, hamza, shadda, tanween, ة, ى, diphthong, sentence, ال, or grammar/gender teaching.

---

## Why this is kasra-closed CLASS transfer, not a new closed key

Wave 4 scored `letter:ram.closed` and later fatha-onset closed words (كَلْب، بَحْر، تَمْر، شَمْس، قَلْب) reused that **class** without a new `.closed` mastery key for every chunk.

Wave 15 scored `letter:jis.closed` and thereby established the **kasra-onset CVC class**. Wave 16 follows the same policy: **بِ + نْ → بِنْ** is unscored rehearsal only.

The engine *could* emit `letter:bin.closed` if a `syllable.bin.closed` record were authored. That record is not authored. Capability is irrelevant.

---

## Why بِنْت is the target

Canonical: `word.bint`  
**No 720 `legacyId`.** None was invented.  
Band: A / A2  
category: family  
MSA: STANDARD_MSA  
highFrequency / frequencyBand: true / core  
teachingForm: **بِنْت**  
Letters: ب ن ت (all already taught)  
Phonics: **kasra + sukun only**  
Prototype: 👧 (generic family 👨‍👩‍👧 is not used)

It is the smallest honest Band A word that transfers kasra-closed structure onto a new carrier and needs a genuine new positional first (final ـت).

---

## Why بِ needs new carrier evidence

Historical `letter:kaf.kasra`, `letter:ain.kasra`, and `letter:jim.kasra` must not substitute. Historical `letter:ba.fatha` and `letter:ba.madd_alif` must not substitute. The new live key is **`letter:ba.kasra`**. An unscored reminder of familiar **بَ** is first so بِ / بَ is an honest contrast.

---

## Why بِنْ does NOT get `letter:bin.closed`

Wave 15 already proved kasra-onset CV + sukun coda → CVC on **جِسْ**. Wave 16 transfers that class. Authoring `syllable.bin.closed` would create a new required key and over-gate, against the Wave 4 → later fatha-closed policy.

---

## Why final ـت is a genuine first

`letter:ta.form.initial` and `letter:ta.form.medial` exist historically (Wave 6). `letter:ta.form.final` has never been scored. In **بِنْت**, ت is final **ـت**. Medial cannot substitute.

Generic:

`getLetterFormLiveKey({ letterLegacyId: "ta", form: "final" })` → **`letter:ta.form.final`**

The SHOW result and the form-quiz prompt are **ـت**, not تـ / ـتـ. Identity choices may be isolated ت / ب / ن.

---

## Joining of بِنْت

Connection determines shape:

- ب dual-joining → **initial بـ** (historical; not re-gated)
- ن inbound from ب, outbound to ت → **medial ـنـ** (Wave 14; not re-gated)
- ت inbound from ن, nothing after → **final ـت** (new; scored)

Compose operand **ت** may look isolated; the **result** `بِنْت` shapes final ـت through normal joining. Sukun stays visible on ن.

Pause/citation **بِنْت** is CVCC `/bint/`. Child UI never says “CVCC”. Decomposition is:

1. بِ + نْ → بِنْ  
2. بِنْ + ت → بِنْت  

Not بِ + ن + ت.

---

## Why no mark-only kasra / sukun reteach

Direct **بِ vs بَ** (with historical **جِ** as foil) writes `letter:ba.kasra`. Do not require `diacritic:ba.kasra.discrimination`. Historical `diacritic:mim.sukun.discrimination` remains historical. There is no `missing_haraka` and no isolated ْ lesson.

---

## Why picture is reinforcement only

First scored word evidence is `audio_to_word` against already-decoded **جِسْم** and **بَاب**. 👧 may follow. Picture does not unlock the unit.

---

## Why two units are sufficient

1. **بِ + ـت** — transfer kasra onto ب, and score the missing final-ت form  
2. **بِنْت** — rehearse the closed class, compose, then decode  

Three units would isolate firsts that Wave 14/15 already pack into one prep unit.

---

## Units

| Unit | ID | Child title | Required live keys |
| --- | --- | --- | --- |
| 1 | `unit.literacy.wave16.ba_kasra_ta_final` | بِ | `letter:ba.kasra`, `letter:ta.form.final` |
| 2 | `unit.literacy.wave16.bint` | بِنْت | `word:bint.decoding` |

Prerequisite: `unit.literacy.wave15.jism`. Sequential unlock. Finish CTA still `/learn`. No `wave16Unlocked` flag.

Must **not** gate: presentations, picture, review, historical kasra/fatha/madd, `letter:jis.closed`, `letter:ram.closed`, `letter:ta.form.medial`, `letter:bin.closed`, mark-discrimination.

---

## Generic engine proof

No `if ba` / `if bint` / `if wave16` was added to engine code.

```ts
getSyllableLiveKey({ letterLegacyId: "ba", vowelSkillId: "skill.short_vowel.kasra" })
// → letter:ba.kasra

getLetterFormLiveKey({ letterLegacyId: "ta", form: "final" })
// → letter:ta.form.final

getWordLiveKey({ wordId: "word.bint" })
// → word:bint.decoding
```

---

## Routing

`wave-1` → … → `wave-15` → `wave-16`

Wave 16 locked until Wave 15 Unit 2. After Wave 15: Unit 1 open, Unit 2 locked.

---

## Known prototype limitations

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`👧` for بِنْت).
- Optional pictures may be skipped after required mastery (accepted reinforcement-skip, same as Waves 10–15).
- Unit 1 has two required scored items, so `LessonPlayer` rotates between them. Existing `unit.mastery` treats `minAttempts` as an **aggregate** across required refs, not “repeat each activity three times.” The headed walk therefore wrote `letter:ba.kasra` 2/2 and `letter:ta.form.final` 1/1, then finished Unit 1 once both keys had a correct attempt and the aggregate reached 3. The unit-mastery script still proves that missing either key prevents mastery. Do not change LessonPlayer for this.
- `recordExerciseAttempt` still `markSeen`s the bare letter ids (`letter:ba`, `letter:ta`) when those letters appear on mastery targets. Those seen-only keys are not Wave 16 gates.

---

## Headed browser verification

Seeded Waves 1–15 in `hurufi-progress-v1`, then walked Wave 16 in headed Chrome against the running app at `http://localhost:8080`. Clicked **بِ**, **ت**, and **بِنْت** explicitly.

| # | Check | Result |
| --- | --- | --- |
| 1 | `/learn` shows Wave 16 with exactly 2 units | Pass |
| 2 | No Wave 17 | Pass |
| 3 | Wave 16 locked before Wave 15 final mastery | Pass |
| 4 | After Wave 15: Unit 1 unlocked, Unit 2 locked until Unit 1 | Pass |
| 5 | Unit 1 first SHOW: بَ | Pass |
| 6 | Unit 1 second SHOW: ب + ِ → بِ | Pass |
| 7 | Kasra visibly under ب | Pass |
| 8 | Unit 1 third SHOW: final ـت | Pass |
| 9 | Prompt/result is final ـت | Pass |
| 10 | No بِنْ presentation in Unit 1 | Pass |
| 11 | First scored CV: hear بِ | Pass |
| 12 | Choices بِ / بَ / جِ | Pass |
| 13 | Explicitly clicked بِ | Pass |
| 14 | New live key `letter:ba.kasra` | Pass |
| 15 | Scored form prompt ـت | Pass |
| 16 | Explicitly chose ت | Pass |
| 17 | New live key `letter:ta.form.final` | Pass |
| 18 | Historical `letter:ta.form.medial` unchanged | Pass |
| 19 | No mark-only kasra screen | Pass |
| 20 | No sukun-mark screen | Pass |
| 21 | Unscored بِ + نْ → بِنْ | Pass |
| 22 | Does not write `letter:bin.closed` | Pass |
| 23 | Unscored بِنْ + ت → بِنْت | Pass |
| 24 | Joined result: initial بـ / medial ـنـ / final ـت | Pass |
| 25 | First scored word evidence is `audio_to_word` | Pass |
| 26 | Target بِنْت | Pass |
| 27 | Foils already-decoded جِسْم / بَاب | Pass |
| 28 | Explicitly clicked بِنْت | Pass |
| 29 | New live key `word:bint.decoding` | Pass |
| 30 | Picture not first evidence | Pass |
| 31 | Optional 👧 after decode | Accepted skip after mastery (same as Waves 10–15) |
| 32–37 | No damma, madd-yaa/waw, hamza, shadda/tanween, new closed key, or review gate | Pass |
| 38–40 | Finish → `/learn`; Unit 2 mastered; no Wave 17 | Pass |
| — | Wave 15 spot-check: جِسْم remains; no بِنْت leak into Wave 15 | Pass |

IndexedDB after the walk:

- **New:** `letter:ba.kasra` (2/2), `letter:ta.form.final` (1/1), `word:bint.decoding` (3/3)
- **Presentations attempts 0:** ba fatha SHOW, ba kasra SHOW, ta final SHOW, bin rehearsal SHOW, bint compose SHOW
- **Historical unchanged:** `letter:jim.kasra`, `letter:jis.closed`, `letter:nun.form.medial`, `letter:ba.form.initial`, `letter:ta.form.medial`
- **No** `letter:bin.closed`
- **No** `diacritic:ba.kasra.discrimination`

`npm run check` **PASS** (typecheck, validate:curriculum including Wave 16, validate:unit-mastery, build).

---

## Wave 17

**Wave 17 is not implemented.** This slice stops after Wave 16 Unit 2.

Recommended later: another kasra-closed transfer, a new short vowel (**damma**), or sentence preparation — only when a legal 2-word MSA frame exists from taught phonics and words. Do not force هذا / هذه / ال.
