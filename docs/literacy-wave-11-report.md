# Literacy Wave 11 — implementation report

Eleventh production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–10 remain frozen educational v1. Band A v1 is unchanged. **Wave 12 is not implemented.**

This is a **madd-alif transfer**, not a new phonics rule. Wave 10 already taught fatḥa + alif = /ā/ on بَا and decoded بَاب. Wave 11 applies the same rule to **جَا**, then decodes **دَجَاج**.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-11.json`  
Meta id: `hurufi.production.literacy.wave11`  
Path: `path.literacy.wave11`  
Route slug: `wave-11`

Progression (live, existing unseen-presentation scheduler):

جَ + ا → جَا → scored initial جـ → distinguish جَا vs جَ / بَا → decode دَجَاج

Exactly **two** units. No new consonant. No new madd engine path.

---

## Why Wave 11 is transfer, not a new madd rule

Wave 10 proved the rule on one carrier:

بَ → بَا → بَاب

The portable engine already maps:

`skill.long_vowel.madd` + `pattern: CVV` + any taught consonant  
→ `letter:{legacyId}.madd_alif`

Wave 11 only supplies new **content**: `syllable.jim.madd_alif` (`جَا`). It does not add a pattern, facet, exercise type, or store key.

Historical `letter:ba.madd_alif` remains Wave 10 evidence. It is not a Wave 11 gate.

---

## Why دَجَاج was selected

Canonical: `word.dajaj`  
Legacy: `food-8`  
Band: A / A2  
teachingForm: **دَجَاج**  
Letters: د + ج + ا + ج  
Phonics: fatha + one madd-alif only

It is a familiar food noun (prototype 🐔). It transfers madd onto a new carrier without kasra, damma, hamza, ة, or a new consonant.

Decomposition: **دَ + جَا + ج**

---

## Why لَا was postponed

`word.laa` / لَا is phonics-clean, but it is an A4 function word. There is still no genuinely readable MSA yes/no or two-word frame from taught material (ال / هذا / verbs / tanween are untaught). Categorical لا + noun would need **بَابَ**, which introduces tanween. Wave 11 does not include `word.laa`.

---

## Why the first ج is initial, not medial

Arabic joining is determined by **connection**, not character index.

د is `nonConnecting`. It does not join to the following letter. After د, a new joining run starts.

Therefore the first ج in دَجَاج is **initial جـ**, connecting **into** ا as **جَا**.

It is **not** medial ـجـ merely because ج occurs in the middle of the spelling. Medial ج was already scored in Wave 3 for حَجَر, where ح *does* connect.

---

## Why the last ج is isolated, not final

ا accepts an inbound join and then **breaks forward** connection.

The last ج starts a new run with nothing after it, so it is **isolated ج**, not final ـج (which would need an inbound connector).

Wave 11 therefore does **not** quiz `letter:jim.form.final`.

---

## Why `letter:jim.form.initial` is required

Scored ج evidence through Wave 10:

- `letter:jim.sound` / recognition (Wave 1)
- `letter:jim.form.medial` (Wave 3)

Initial جـ was seen in decoded جَمَل but never scored as form mastery. `word:jamal.decoding` is not a form key.

FORM PREP BEFORE DEPENDENT WORD: دَجَاج needs initial جـ, so Wave 11 scores `letter:jim.form.initial` before the word.

The generic lesson scheduler always plays unseen presentations first, then continues forward through required indexes (same as Waves 5–10). Unit 1 JSON therefore opens with the جَا transfer demo so the **first scored** beat is initial جـ, then scored جَا. The engine was not special-cased.

Not added: `letter:jim.form.final`, `letter:jim.form.isolated`.

---

## Why `letter:jim.madd_alif` is required

`letter:ba.madd_alif` does not prove the child can apply madd-alif to ج.

دَجَاج would otherwise mix four firsts: new carrier, initial جـ, isolated last ج, four-letter decode.

Smallest defensible transfer: score **جَا** (`syllable_blending`) before the word.

Foils: **جَ** (length) and **بَا** (carrier).

---

## Why historical `letter:ba.madd_alif` does not gate

It is Wave 10 evidence. Wave 11 Unit 1 requires:

- `letter:jim.form.initial`
- `letter:jim.madd_alif`

بَا appears only as a **foil** on the جَا quiz.

---

## Why no new engine work was needed

Existing generic helpers already produce:

```ts
getSyllableLiveKey({ letterLegacyId: "jim", vowelSkillId: "skill.long_vowel.madd" })
// → letter:jim.madd_alif
```

CVV does not enter the CVC closed-chunk branch. `syllableAdapter` uses `syllable.text` for any CVV/madd syllable. `show: "chunk"` reads `left` / `right` / `result` from config.

No `if jim` / `if ba` / `if wave11` was added to engine code.

---

## Units

| # | Unit id | Child title | Teaches | Required evidence |
| --- | --- | --- | --- | --- |
| 1 | `unit.literacy.wave11.jim_madd_alif` | جَا | SHOW جَ + ا → جَا; scored initial جـ; scored جَا vs جَ / بَا | `letter:jim.form.initial`, `letter:jim.madd_alif` |
| 2 | `unit.literacy.wave11.dajaj` | دَجَاج | unscored دَ + جَاج → دَجَاج, then audio/print دَجَاج vs بَاب / جَمَل | `word:dajaj.decoding` |

Child titles avoid **الدَّجَاج** (definite article + sun-letter shadda) and avoid hamza-on-alif.

Prerequisite: `unit.literacy.wave10.bab`. Unit 2 unlocks sequentially. No `wave11Unlocked` flag.

Presentations stay attempts 0. Picture 🐔 is reinforcement after decoding and shares `word:dajaj.decoding`. No review key.

---

## Review

No required review. Historical keys are not reused as gates. Recycled بَاب / جَمَل / جَ / بَا are foils only.

---

## Sentence work

Still none. Two nouns are not a sentence. UI phrases do not count. Sentence work waits.

---

## Routing

`/learn` lists `wave-1` → … → `wave-10` → `wave-11`. Finish still returns to `/learn`. **No Wave 12 CTA and no `/learn/wave-12/...` route.**

---

## No new engine capability

Wave 11 is **CONTENT + EXISTING MADD ENGINE**.

No new exercise type, syllable pattern, madd facet, store structure, persistence key, LessonPlayer behavior, or 3-part presentation UI.

---

## Known prototype limitations

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`🐔` for دَجَاج).
- Optional pictures may be skipped after required mastery (accepted reinforcement-skip).

---

## Headed browser verification

Seeded Waves 1–10, then walked Wave 11 in headed Chrome against the running app.

| Check | Result |
| --- | --- |
| `/learn` shows Wave 11 with exactly 2 units | Pass |
| No Wave 12 | Pass |
| Wave 11 locked before Wave 10 Unit 2 mastery | Pass |
| After Wave 10: Unit 1 unlocked, Unit 2 locked | Pass |
| Unscored جَ + ا → جَا with plain ا | Pass |
| First scored beat is initial جـ, not ـجـ | Pass |
| Known form foils ح / ب | Pass |
| Scored جَا vs جَ / بَا; clicked جَا | Pass |
| Unscored دَ + جَاج → دَجَاج; د separate | Pass |
| First scored word is audio/print دَجَاج vs بَاب / جَمَل; clicked دَجَاج | Pass |
| Picture not first evidence | Pass |
| Optional 🐔 skipped after decoding mastery | Accepted (same as Wave 10) |
| Finish CTA → `/learn`; Unit 2 mastered | Pass |
| Wave 10 still shows بَا / بَاب; no دَجَاج leak | Pass |

IndexedDB after the walk: new `letter:jim.form.initial`, `letter:jim.madd_alif`, `word:dajaj.decoding`. Historical `letter:ba.madd_alif` unchanged. No `word:laa.decoding`. No new `.closed` key. Presentation attempts 0.

---

## Wave 12

**Wave 12 is not implemented.** This slice stops after Wave 11 Unit 2.

After دَجَاج, Band A has no further fatha+madd-alif picture noun on the current 15 consonants. لَا remains blocked without a readable frame. The next *type* of work is later (consonant expansion that unlocks a madd picture word, or a new phonics rule). It is not part of this slice.
