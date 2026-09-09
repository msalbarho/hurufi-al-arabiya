# Literacy Wave 12 — implementation report

Twelfth production teaching slice for حُرُوفِي العَرَبِيَّة. Waves 1–11 remain frozen educational v1. Band A v1 is unchanged. **Wave 13 is not implemented.**

This is **CONTENT + EXISTING LETTER + MADD ENGINES**. Wave 12 introduces exactly one new consonant, **ن**, transfers already-established madd-alif onto **نَا**, then decodes **نَار**.

Source of truth: `src/content/curriculum/data/production/literacy-path.wave-12.json`  
Meta id: `hurufi.production.literacy.wave12`  
Path: `path.literacy.wave12`  
Route slug: `wave-12`

Progression (live, existing unseen-presentation scheduler):

ن → نَ → scored ن sound → scored نَ → scored initial نـ → نَ + ا → نَا → نَا + ر → نَار → scored نَا → decode نَار

Exactly **two** units. No kasra. No damma. No hamza. No نَعَم / لَا / شَاي. No new exercise type or syllable pattern.

---

## Why ن was selected now

After Wave 11, the taught consonants are:

م ل ق د و ج ي ر ب ف ح ك ت س ش ع

plus ا as a madd carrier, not a letter-sound.

Remaining Band A picture nouns on only those letters + fatha + madd-alif are exhausted. **شَاي** is an A4 loanword. **لَا** still has no readable MSA sentence frame. Kasra is engine-ready but its first honest words bundle extra rules.

**ن** is the smallest new consonant that unlocks a strictly decodable Band A picture noun on already-taught fatha + madd-alif: **نَار**.

---

## Why نَار was previously blocked by madd

Canonical: `word.nar`  
Legacy: `nature-32`  
Band: A / A1  
teachingForm: **نَار**  
Letters: ن + ا + ر  
Phonics: fatha + one madd-alif

ر is already taught (Wave 2). The blocker was never ر. The blocker was **ن** plus the long vowel **ا**.

Until madd-alif existed, نَار could not be decoded as نَ + ا + ر. Wave 10 established the rule on بَا. Wave 11 transferred it to جَا. Wave 12 transfers it to **نَا**.

---

## Why نَار is now strictly decodable

Every piece is taught before the word:

- new isolated ن
- fatha CV نَ
- initial form نـ (needed because ن is dual-joining)
- madd-alif transfer نَ + ا → نَا
- historical ر, used as isolated ر after alif breaks forward

No kasra, damma, sukun, hamza, shadda, tanween, ة, ى, ū, ī, or diphthong.

---

## Why ن unlocks useful future vocabulary

ن is high-utility. Later Band A material includes عنب, بنت, نهر, and نعم. Wave 12 does **not** teach those words. It only makes the letter available so a later slice can use it honestly.

---

## Why kasra is postponed to Wave 13

The short-vowel engine already maps `skill.short_vowel.kasra` → `letter:{x}.kasra`. That is not the reason to wait.

The first honest kasra picture words are not a one-beat add:

- **كِتَاب** needs kasra on كِ plus a madd transfer on تَا
- **فِيل** needs madd-yaa /ī/, which is untaught
- **جِسْم** / **عِنَب** add sukun or extra new work

Wave 13 planning can take kasra as its own slice. Wave 12 does not add `skill.short_vowel.kasra` or `letter:nun.kasra`.

---

## Why نَعَم / لَا are postponed

**نَعَم** becomes phonically possible after ن, but there is still no genuine taught MSA yes/no sentence frame. A lone function word is not Wave 12’s job.

**لَا** remains an A4 function word. Categorical لا + noun would need tanween or a sentence pattern that is not taught. Wave 12 does not include `word.laa` or `word.naam`.

**شَاي** is out of band and out of phonics (madd-yaa).

No sentence work. Two nouns plus a new letter are not a sentence.

---

## Joining behavior in نَار

Arabic joining is determined by **connection**, not string index.

ن is dual-joining. The word therefore begins with **initial نـ**, which joins into alif as **نَا**.

ا accepts an inbound join and then **breaks forward** connection.

ر is `nonConnecting`. With no inbound connector after alif, the last letter is **isolated ر**, not final ـر.

Recorded `requiredLetterForms` for `word.nar`:

- `letter.nun` / `initial`
- `letter.ra` / `isolated`

---

## Why initial نـ is required

The child has never scored a positional form of ن. Isolated ن is not the same evidence as the connecting shape that actually appears in نَار.

Wave 12 therefore scores `letter:nun.form.initial` in Unit 1, before the word.

Not added: `letter:nun.form.medial`, `letter:nun.form.final`. Those shapes are not required by نَار.

---

## Why final ر is isolated

Final ـر would need an inbound join. Alif has already broken the joining run. Historical ra knowledge is reused; there is **no new ra form quiz**.

---

## Why `letter:nun.madd_alif` is required

`letter:ba.madd_alif` and `letter:jim.madd_alif` prove historical transfer on other carriers. They do not prove the child can apply madd-alif to **ن**.

نَار would otherwise mix firsts: new consonant, initial نـ, madd on a new carrier, and the word.

Smallest defensible transfer: score **نَا** (`syllable_blending`) before the word.

Foils: **نَ** (length) and **بَا** (carrier).

---

## Why ba/jim madd cannot substitute

They remain Wave 10 / Wave 11 evidence. Wave 12 Unit 2 requires:

- `letter:nun.madd_alif`
- `word:nar.decoding`

بَا appears only as a **foil** on the نَا quiz. بَاب and دَجَاج appear only as **already-decoded foils** on the نَار quiz.

---

## Why no new engine work was needed

Existing generic helpers already produce:

```ts
getSyllableLiveKey({ letterLegacyId: "nun", vowelSkillId: "skill.short_vowel.fatha" })
// → letter:nun.fatha

getSyllableLiveKey({ letterLegacyId: "nun", vowelSkillId: "skill.long_vowel.madd" })
// → letter:nun.madd_alif
```

CVV does not enter the CVC closed-chunk branch. `syllableAdapter` uses `syllable.text` for any CVV/madd syllable. `show: "chunk"` reads `left` / `right` / `result` from config. Letter presentation, CV presentation, tracing, audio_to_word, and word_to_picture are reused.

No `if nun` / `if wave12` was added to engine code.

The generic lesson scheduler always plays unseen presentations first, then continues forward through required indexes (same as Waves 5–11). Unit 1 JSON therefore opens with isolated ن and نَ demos so the first scored beat is ن sound. Unit 2 JSON opens with both chunk demos so live order is نَ + ا → نَا, then نَا + ر → نَار, then scored نَا, then audio decode. The engine was not special-cased.

---

## Units

| # | Unit id | Child title | Teaches | Required evidence |
| --- | --- | --- | --- | --- |
| 1 | `unit.literacy.wave12.nun` | نَ | SHOW isolated ن; SHOW نَ; scored ن vs م / ت / س; scored نَ vs مَ / تَ; scored initial نـ vs تـ / بـ; optional tracing | `letter:nun.sound`, `letter:nun.fatha`, `letter:nun.form.initial` |
| 2 | `unit.literacy.wave12.nar` | نَار | unscored نَ + ا → نَا; scored نَا vs نَ / بَا; unscored نَا + ر → نَار; audio/print نَار vs بَاب / دَجَاج; optional 🔥 | `letter:nun.madd_alif`, `word:nar.decoding` |

Child titles avoid **النار** (definite article + sun-letter behavior) and avoid hamza-on-alif.

Prerequisite: `unit.literacy.wave11.dajaj`. Unit 2 unlocks sequentially. No `wave12Unlocked` flag.

Presentations stay attempts 0. Tracing and picture are reinforcement and do not gate. No review key.

---

## Review

No required review. Historical keys are not reused as gates. Recycled م / ت / س / بَا / بَاب / دَجَاج are foils only.

---

## Routing

`/learn` lists `wave-1` → … → `wave-11` → `wave-12`. Finish still returns to `/learn`. **No Wave 13 CTA and no `/learn/wave-13/...` route.**

Wave 12 stays locked until Wave 11 Unit 2 is mastered. After Wave 11: Unit 1 unlocked, Unit 2 locked.

---

## No new engine capability

Wave 12 is **CONTENT + EXISTING LETTER + MADD ENGINES**.

No new exercise type, syllable pattern, madd facet, store structure, persistence key, LessonPlayer behavior, or 3-part presentation UI.

Added content only:

- `syllable.nun.fatha` — CV, نَ, `skill.short_vowel.fatha`
- `syllable.nun.madd_alif` — CVV, نَا, `skill.long_vowel.madd`, required letters nun + alif

---

## Known prototype limitations

- Logical audio/image ids are reserved. There is no final production audio or image set in this slice.
- Picture exercises still use prototype emoji fallbacks (`🔥` for نَار).
- Optional pictures and tracing may be skipped after required mastery (accepted reinforcement-skip, same as Waves 10–11).
- Letter-form *choices* still render isolated identity glyphs; the **prompt** is the positional form نـ. This is existing letter-recognition engine behavior, not a Wave 12 special case.

---

## Headed browser verification

Seeded Waves 1–11, then walked Wave 12 in headed Chrome against the running app.

| Check | Result |
| --- | --- |
| `/learn` shows Wave 12 with exactly 2 units | Pass |
| No Wave 13 | Pass |
| Wave 12 locked before Wave 11 Unit 2 mastery | Pass |
| After Wave 11: Unit 1 unlocked, Unit 2 locked | Pass |
| Unscored isolated ن | Pass |
| Scored ن sound with known foils م / ت / س | Pass |
| Optional tracing does not gate | Pass |
| Unscored نَ presentation | Pass |
| Scored نَ | Pass |
| Scored initial نـ, not medial ـنـ | Pass |
| No word target and no madd quiz in Unit 1 | Pass |
| Unscored نَ + ا → نَا with plain ا | Pass |
| Unscored نَا + ر → نَار; final ر isolated | Pass |
| Scored نَا vs نَ / بَا; clicked نَا | Pass |
| Live key `letter:nun.madd_alif` | Pass |
| Historical `letter:ba.madd_alif` / `letter:jim.madd_alif` unchanged | Pass |
| First scored word is audio/print نَار vs بَاب / دَجَاج; clicked نَار | Pass |
| Picture not first evidence | Pass |
| Optional 🔥 after decode | Accepted skip after mastery (same as Waves 10–11) |
| No kasra, damma, hamza, ū/ī, or review | Pass |
| Finish CTA → `/learn`; Unit 2 mastered | Pass |
| Wave 11 still shows جَا / دَجَاج; no نَار leak | Pass |

IndexedDB after the walk: new `letter:nun.sound`, `letter:nun.fatha`, `letter:nun.form.initial`, `letter:nun.madd_alif`, `word:nar.decoding`. Historical ba/jim madd keys unchanged. No `word:laa.decoding` / `word:naam.decoding`. No new `.closed` key. Presentation attempts 0. The generic player also writes `letter:nun` as a seen (attempts 0) identity row; that is not a closed-chunk key and is not a Wave 12 special case.

---

## Wave 13

**Wave 13 is not implemented.** This slice stops after Wave 12 Unit 2.

Recommended later: kasra as its own phonics slice, with the smallest honest contrast and word (likely كَ/كِ then كِتَاب, with an explicit تَا madd transfer). فِيل waits for madd-yaa. نَعَم and لَا still wait for a genuine taught sentence frame.
