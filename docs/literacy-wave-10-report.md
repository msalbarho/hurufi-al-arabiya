# Literacy Wave 10 — implementation report

Tenth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–9 remain frozen educational v1. Band A v1 is unchanged. **Wave 11 is not implemented.**

This is the first phonics-rule wave after the consonant-only run. It teaches **madd-alif only**.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-10.json`  
Meta id: `hurufi.production.literacy.wave10`  
Path: `path.literacy.wave10`  
Route slug: `wave-10`

Progression:

بَ → بَ + ا → بَا → distinguish بَ vs بَا → decode بَاب

Exactly **two** units. One new phonics rule. One new word.

---

## Why Wave 10 introduces madd-alif now

Wave 9 ended the planned consonant-only run at ع / عَسَل. Remaining unused consonants do not unlock a clean one-letter fatha word. The next educational jump is a **rule**, not another letter.

fatḥa is already stable. The child can hear and print بَ. Length is the next contrast.

---

## Why only fatḥa + alif is taught

Madd is three later rules (ا / و / ي). Teaching all long vowels at once would collapse the contrast.

Wave 10 teaches only:

**fatḥa + alif = ـَا /ā/**

و / ū and ي / ī stay later.

---

## Why بَ vs بَا is the core contrast

بَ is already known (`letter:ba.fatha`). بَا is the same consonant with audible and visible length. The child sees the carrier ا added, then hears the long syllable.

That is enough to acquire the rule. No second contrast letter is required.

---

## Why بَاب is the only target word

Canonical: `word.bab`  
Legacy: `home-2`  
Band: A / A1  
teachingForm: بَاب  
Letters: ب + َ + ا + ب  
Phonics: fatha + madd-alif only

It is a strong, familiar A1 home word (prototype 🚪). It transfers the new syllable into a real word without a new consonant, sukun, hamza, or extra madd.

There is **no بَاب word presentation** as first evidence. First scored evidence is `audio_to_word`. Choices are already-decoded **قَلَم** and **جَمَل**.

---

## Why لَا is postponed

لَا is phonics-clean, but it is an A4 function word, not a picture word. Its value is sentence / yes-no readiness. Adding it now would pad the first rule wave.

---

## Why دَجَاج is postponed

دَجَاج is a heavier second transfer (four letters, medial madd). Final ج has never been scored. It would weaken the clean بَ → بَا → بَاب introduction.

---

## Why ا is a carrier rather than a consonant sound

Wave 10 never scores `letter:alif.sound`. Isolated ا is not taught like ب or م.

The child meets plain **ا** only as the right-hand piece of:

بَ + ا → بَا

and inside بَاب.

`letter.alif.nonConnecting` is content metadata. Arabic shaping produces the visible break after alif. There is no React/CSS joining hack.

---

## Why hamza is excluded

Hamza-on-alif (أ / إ / آ) is a different rule. Prototype alif still examples **أَرْنَب**; Wave 10 does not use that example, `word.arnab`, or the letter-name أَلِف in child copy.

Child-visible Wave 10 strings are checked for أ / إ / آ.

---

## CVV model

`SyllablePattern` is now `"CV" | "CVC" | "CVV"`.

`syllable.ba.madd_alif`:

- text: بَا
- vowelSkillId: `skill.long_vowel.madd`
- pattern: **CVV**

بَا is not tagged CV (that would hide length) and not tagged CVC (that would hit the closed-chunk path).

بَاب remains a **word**, not a CVVC syllable type.

Madd is not a combining haraka. `syllableAdapter` uses `syllable.text` for CVV and does not put alif in `VOWEL_MARK`.

---

## Dedicated madd_alif facet / live key

`vowelFacetFromSkill("skill.long_vowel.madd")` → `madd_alif`

Live key: **`letter:ba.madd_alif`**

CVV routes through `getSyllableLiveKey`, never `getClosedChunkLiveKey`.

This does not collide with `letter:ba.fatha` or `letter:ba.blend`. The facet keeps later madd-waw / madd-ya distinct.

---

## Why letter:ba.fatha cannot substitute

Wave 2 already mastered short بَ. That evidence is a different facet. Unit 1 required skill is only `skill.long_vowel.madd`. Historical fatha progress cannot pass Wave 10.

---

## Why show:"chunk" is reused

Wave 4 already presents رَ + مْ → رَمْ with `show: "chunk"`.

Wave 10 reuses that portable triple:

- بَ + ا → بَا
- optional بَا + ب → بَاب

No `show: "madd"` type was added. `show: "cv"` would hide the alif operand.

---

## Why no new exercise type was added

Scored length uses existing `syllable_blending` (listen, choose بَا / بَ / مَ).  
Word transfer uses existing `audio_to_word`.  
Picture is existing `word_to_picture` reinforcement.

Same pattern as Wave 4 sukun: extend keys + allowlists, reuse renderers.

---

## Why no new form quiz is needed

ب through Wave 9 already has scored:

- `letter:ba.form.medial`
- `letter:ba.form.final`
- `letter:ba.form.initial`

بَاب uses initial بـ and final ب. Those are reused, not re-quizzed. No `letter:alif.form.*` mastery.

---

## Android portability

Portable source of truth:

- `SyllablePattern.CVV`
- `skill.long_vowel.madd`
- `syllable.ba.madd_alif`
- facet `madd_alif`
- presentation `{ left, right, result }`
- `letter.alif.nonConnecting`
- live keys `letter:ba.madd_alif` and `word:bab.decoding`

No CSS-only madd, no DOM inspection, no “if text contains ا”.

---

## Unit flow

| # | Unit id | Child title | Teaches | Required evidence |
| --- | --- | --- | --- | --- |
| 1 | `unit.literacy.wave10.madd_alif` | تَعَلَّمْ الْمَدّ | SHOW بَ, SHOW بَ + ا → بَا, scored بَا vs بَ / مَ | `letter:ba.madd_alif` |
| 2 | `unit.literacy.wave10.bab` | الْبَاب | unscored بَا + ب → بَاب, then بَاب vs قَلَم / جَمَل | `word:bab.decoding` |

Optional door picture is reinforcement after decoding.

Prerequisite: Unit 1 `prereqUnitIds` = `unit.literacy.wave9.asal`. Unit 2 unlocks sequentially. No `wave10Unlocked` flag.

---

## Mastery contract

| Unit | Required live keys | Must not gate |
| --- | --- | --- |
| 1 | `letter:ba.madd_alif` | presentation; `letter:ba.fatha` |
| 2 | `word:bab.decoding` | compose chunk; picture; forms; review |

Presentations stay attempts 0.

---

## Routing

`/learn` lists `wave-1` → … → `wave-9` → `wave-10`. Finish still returns to `/learn`. **No Wave 11 CTA and no `/learn/wave-11/...` route.**

---

## No new engine capability beyond the approved minimum

- `SyllablePattern` += `CVV`
- syllable `vowelSkillId` may be `skill.long_vowel.madd`
- `unitMastery.ts` madd_alif facet
- `syllableAdapter.ts` uses `text` for CVV

No new exercise type. No LessonPlayer change. No store / `hurufi-progress-v1` change.

---

## Known prototype limitations

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`🚪` for بَاب).
- Optional pictures may be skipped after required mastery (accepted reinforcement-skip).

---

## Wave 11

**Wave 11 is not implemented.** This slice stops after Wave 10 Unit 2.

The next planned direction is madd-alif **transfer** (لَا and/or دَجَاج), not a new consonant and not ū/ī.
